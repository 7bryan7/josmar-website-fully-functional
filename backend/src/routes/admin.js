import { Database } from '../db.js';
import { getCorsHeaders } from '../cors.js';

// Strict whitelist of allowed D1 tables for admin operations
const ALLOWED_TABLES = [
  'users',
  'media',
  'homepage_sections',
  'settings',
  'services',
  'projects',
  'project_images',
  'project_documents',
  'global_certifications',
  'other_certificates',
  'gallery_albums',
  'gallery',
  'testimonials',
  'clients',
  'categories',
  'tags',
  'blogs',
  'blog_tags',
  'careers',
  'applications',
  'contact_messages',
  'seo',
  'audit_logs'
];

// Explicit safe column projections for sensitive tables.
// password_hash must NEVER be returned in any API response.
const SAFE_COLUMNS = {
  users: 'id, username, email, role, created_at, updated_at, deleted_at',
};

// Per-table allowlist of columns that may be set by the admin API.
// Column names are interpolated directly into SQL strings (they cannot be
// parameterised), so they MUST never originate from unchecked user input.
// Any key in the request body that is not in this list is silently dropped.
// System-managed columns (id for UPDATE, created_at, updated_at) are intentionally
// excluded; they are either handled explicitly by the code or by DB defaults.
const WRITABLE_COLUMNS = {
  users:                  ['username', 'email', 'role', 'deleted_at'],
  media:                  ['name', 'path', 'size', 'mime_type', 'alt_text', 'caption', 'folder', 'thumbnail_path', 'width', 'height', 'deleted_at'],
  homepage_sections:      ['section_key', 'title', 'subtitle', 'is_enabled', 'display_order', 'background_color', 'background_image_media_id', 'padding_y', 'animation_type', 'settings_json'],
  settings:               ['value', 'description', 'category'],
  categories:             ['name', 'type', 'slug', 'deleted_at'],
  services:               ['title', 'description', 'icon', 'image_media_id', 'brochure_media_id', 'seo_url', 'status', 'display_order', 'deleted_at'],
  projects:               ['name', 'category', 'client', 'location', 'start_date', 'end_date', 'description', 'status', 'featured_project', 'seo_slug', 'display_order', 'deleted_at'],
  project_images:         ['project_id', 'media_id', 'is_primary', 'display_order'],
  project_documents:      ['project_id', 'media_id', 'display_order'],
  global_certifications:  ['title', 'issuing_organization', 'org_logo_media_id', 'certificate_image_media_id', 'certificate_number', 'issue_date', 'expiry_date', 'credential_url', 'description', 'display_order', 'featured_status', 'active_status', 'deleted_at'],
  other_certificates:     ['title', 'certificate_image_media_id', 'description', 'category', 'display_order', 'active_status', 'deleted_at'],
  gallery_albums:         ['name', 'description', 'cover_media_id', 'display_order', 'status', 'deleted_at'],
  gallery:                ['album_id', 'media_id', 'category_id', 'display_order', 'deleted_at'],
  testimonials:           ['client_name', 'client_role', 'company_name', 'testimonial_text', 'rating', 'avatar_media_id', 'display_order', 'status', 'deleted_at'],
  clients:                ['name', 'logo_media_id', 'website_url', 'display_order', 'status', 'deleted_at'],
  tags:                   ['name', 'slug', 'deleted_at'],
  blogs:                  ['title', 'content', 'category_id', 'featured_image_media_id', 'seo_url', 'status', 'publish_date', 'author_id', 'deleted_at'],
  blog_tags:              ['blog_id', 'tag_id'],
  careers:                ['title', 'location', 'experience', 'description', 'status', 'display_order', 'deleted_at'],
  applications:           ['career_id', 'applicant_name', 'applicant_email', 'resume_media_id', 'cover_letter', 'status'],
  contact_messages:       ['name', 'email', 'phone', 'subject', 'message', 'is_read'],
  seo:                    ['entity_type', 'entity_id', 'meta_title', 'meta_description', 'canonical_url', 'og_image_media_id', 'og_title', 'og_description', 'twitter_card', 'schema_json'],
  audit_logs:             ['user_id', 'action', 'entity_type', 'entity_id', 'details'],
};

export async function handleAdminRoutes(request, env, url) {
  const db = new Database(request.services.db);
  const path = url.pathname;
  const method = request.method;

  // Origin-aware CORS headers — no wildcard
  const corsHeaders = getCorsHeaders(request, env);

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Double check admin auth (already ran in index.js, but let's be double safe)
  if (!request.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  // 1. Dashboard Overview Endpoint
  if (method === 'GET' && path === '/api/admin/overview') {
    try {
      const projectsCount = await db.get('SELECT COUNT(*) as count FROM projects WHERE deleted_at IS NULL');
      const servicesCount = await db.get('SELECT COUNT(*) as count FROM services WHERE deleted_at IS NULL');
      const messagesCount = await db.get('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0');
      const applicationsCount = await db.get("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'");
      const mediaCount = await db.get('SELECT COUNT(*) as count FROM media WHERE deleted_at IS NULL');

      const recentMessages = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5');
      const recentLogs = await db.query(
        `SELECT a.*, u.username FROM audit_logs a 
         LEFT JOIN users u ON a.user_id = u.id 
         ORDER BY a.created_at DESC LIMIT 5`
      );

      return new Response(JSON.stringify({
        counts: {
          projects: projectsCount.count,
          services: servicesCount.count,
          unread_messages: messagesCount.count,
          pending_applications: applicationsCount.count,
          media_files: mediaCount.count
        },
        recent_messages: recentMessages.results,
        recent_logs: recentLogs.results
      }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 2. Settings Bulk Update
  if (method === 'PUT' && path === '/api/admin/settings') {
    try {
      const body = await request.json(); // Array of { key, value }
      const statements = [];
      
      for (const item of body) {
        let val = item.value;
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
        statements.push(
          db.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?')
            .bind(val === null || val === undefined ? '' : String(val), item.key)
        );
      }

      await db.batch(statements);

      // Audit Log
      await db.run(
        'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [db.generateUUID(), request.user.id, 'BULK_UPDATE', 'settings', 'bulk', `Updated ${body.length} settings`]
      );

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 3. Dynamic CRUD Router
  // Match: /api/admin/:table or /api/admin/:table/:id
  const parts = path.split('/').filter(Boolean);
  // parts = ['api', 'admin', 'tableName', 'id']
  const tableName = parts[2];
  const recordId = parts[3];

  if (!tableName || !ALLOWED_TABLES.includes(tableName)) {
    return new Response(JSON.stringify({ error: 'Invalid or restricted table name' }), { status: 400, headers: corsHeaders });
  }

  // --- GET ALL ---
  if (method === 'GET' && !recordId) {
    try {
      // Use a safe column projection for sensitive tables (e.g. never return password_hash)
      const columns = SAFE_COLUMNS[tableName] || '*';
      let queryStr = `SELECT ${columns} FROM ${tableName}`;
      const params = [];
      
      // Support soft delete filtering where applicable
      if (tableName !== 'settings' && tableName !== 'homepage_sections' && tableName !== 'contact_messages' && tableName !== 'applications' && tableName !== 'seo' && tableName !== 'audit_logs' && tableName !== 'project_images' && tableName !== 'project_documents' && tableName !== 'blog_tags') {
        queryStr += ` WHERE deleted_at IS NULL`;
      } else {
        queryStr += ` WHERE 1=1`;
      }

      // Add filter/search/sorting if specified
      const search = url.searchParams.get('search');
      if (search) {
        if (tableName === 'projects') {
          queryStr += ` AND (name LIKE ? OR client LIKE ?)`;
          params.push(`%${search}%`, `%${search}%`);
        } else if (tableName === 'services') {
          queryStr += ` AND title LIKE ?`;
          params.push(`%${search}%`);
        } else if (tableName === 'blogs') {
          queryStr += ` AND title LIKE ?`;
          params.push(`%${search}%`);
        }
      }

      const category = url.searchParams.get('category');
      if (category && tableName === 'projects') {
        queryStr += ` AND category = ?`;
        params.push(category);
      }

      const displayOrder = url.searchParams.get('sort_order');
      if (displayOrder && (tableName === 'projects' || tableName === 'services' || tableName === 'global_certifications' || tableName === 'other_certificates' || tableName === 'homepage_sections')) {
        queryStr += ` ORDER BY display_order ASC`;
      } else if (tableName === 'contact_messages' || tableName === 'applications' || tableName === 'audit_logs') {
        queryStr += ` ORDER BY created_at DESC`;
      }

      const rows = await db.query(queryStr, params);
      return new Response(JSON.stringify(rows.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // --- GET ONE ---
  if (method === 'GET' && recordId) {
    try {
      // Use a safe column projection for sensitive tables (e.g. never return password_hash)
      const columns = SAFE_COLUMNS[tableName] || '*';
      const row = await db.get(`SELECT ${columns} FROM ${tableName} WHERE id = ?`, [recordId]);
      if (!row) {
        return new Response(JSON.stringify({ error: 'Record not found' }), { status: 404, headers: corsHeaders });
      }

      // If project, fetch sub tables
      if (tableName === 'projects') {
        const images = await db.query('SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC', [recordId]);
        const documents = await db.query('SELECT * FROM project_documents WHERE project_id = ? ORDER BY display_order ASC', [recordId]);
        row.images = images.results;
        row.documents = documents.results;
      }

      // If blog, fetch tags
      if (tableName === 'blogs') {
        const tags = await db.query(
          `SELECT t.* FROM tags t 
           JOIN blog_tags bt ON bt.tag_id = t.id 
           WHERE bt.blog_id = ?`,
          [recordId]
        );
        row.tags = tags.results;
      }

      return new Response(JSON.stringify(row), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // --- POST (CREATE) ---
  if (method === 'POST') {
    try {
      const body = await request.json();
      const id = body.id || db.generateUUID();
      body.id = id;

      // Extract sub-relations for projects and blogs before DB insert
      const projectImages = body.images;
      const projectDocs = body.documents;
      const blogTags = body.tags;
      delete body.images;
      delete body.documents;
      delete body.tags;

      // ── SECURITY: column-name allowlist ─────────────────────────────────────
      // Column names are embedded verbatim into SQL; they CANNOT be parameterised.
      // Filter the request body keys against the per-table allowlist so that only
      // schema-known, writable columns are ever included in the query string.
      // 'id' is always allowed for INSERT (the value was just generated above).
      const allowedForInsert = new Set(['id', ...(WRITABLE_COLUMNS[tableName] || [])]);
      const keys = Object.keys(body).filter(k => allowedForInsert.has(k));

      if (keys.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid fields provided for insert' }),
          { status: 400, headers: corsHeaders }
        );
      }
      // ────────────────────────────────────────────────────────────────────────

      const placeholders = keys.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
      const params = keys.map(k => {
        let val = body[k];
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        if (k.endsWith('_id') || k.endsWith('_media_id')) {
          if (val === '' || val === 'null' || val === 'undefined' || val === null || val === undefined) {
            val = null;
          }
        }
        return val;
      });

      await db.run(sql, params);

      // Handle Project Images / Documents sub tables if present
      if (tableName === 'projects' && (projectImages || projectDocs)) {
        if (projectImages && Array.isArray(projectImages)) {
          for (const img of projectImages) {
            await db.run(
              'INSERT INTO project_images (id, project_id, media_id, is_primary, display_order) VALUES (?, ?, ?, ?, ?)',
              [db.generateUUID(), id, img.media_id, img.is_primary ? 1 : 0, img.display_order || 0]
            );
          }
        }
        if (projectDocs && Array.isArray(projectDocs)) {
          for (const doc of projectDocs) {
            await db.run(
              'INSERT INTO project_documents (id, project_id, media_id, display_order) VALUES (?, ?, ?, ?)',
              [db.generateUUID(), id, doc.media_id, doc.display_order || 0]
            );
          }
        }
      }

      // Handle Blog Tags if present
      if (tableName === 'blogs' && blogTags && Array.isArray(blogTags)) {
        for (const tagId of blogTags) {
          await db.run('INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)', [id, tagId]);
        }
      }

      // Audit Log
      await db.run(
        'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [db.generateUUID(), request.user.id, 'CREATE', tableName, id, `Created record in ${tableName}`]
      );

      return new Response(JSON.stringify({ success: true, id }), { status: 201, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // --- PUT (UPDATE) ---
  if (method === 'PUT' && recordId) {
    try {
      const body = await request.json();
      delete body.id; // Cannot change ID
      delete body.created_at; // Preserve original creation timestamp

      // Extract sub-relations
      const projectImages = body.images;
      const projectDocs = body.documents;
      const blogTags = body.tags;
      delete body.images;
      delete body.documents;
      delete body.tags;

      // ── SECURITY: column-name allowlist ─────────────────────────────────────
      // Same rationale as the INSERT path: column names go into the SQL string
      // verbatim, so they must be validated before use.
      // 'id' and 'created_at' are already removed from body above.
      const allowedForUpdate = new Set(WRITABLE_COLUMNS[tableName] || []);
      const keys = Object.keys(body).filter(k => allowedForUpdate.has(k));

      if (keys.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid fields provided for update' }),
          { status: 400, headers: corsHeaders }
        );
      }
      // ────────────────────────────────────────────────────────────────────────

      const assignments = keys.map(k => `${k} = ?`).join(', ');
      const sql = `UPDATE ${tableName} SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      const params = keys.map(k => {
        let val = body[k];
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        if (k.endsWith('_id') || k.endsWith('_media_id')) {
          if (val === '' || val === 'null' || val === 'undefined' || val === null || val === undefined) {
            val = null;
          }
        }
        return val;
      });
      params.push(recordId);

      await db.run(sql, params);

      // Handle Project relations (wipe and rebuild)
      if (tableName === 'projects') {
        if (projectImages && Array.isArray(projectImages)) {
          await db.run('DELETE FROM project_images WHERE project_id = ?', [recordId]);
          for (const img of projectImages) {
            await db.run(
              'INSERT INTO project_images (id, project_id, media_id, is_primary, display_order) VALUES (?, ?, ?, ?, ?)',
              [db.generateUUID(), recordId, img.media_id, img.is_primary ? 1 : 0, img.display_order || 0]
            );
          }
        }
        if (projectDocs && Array.isArray(projectDocs)) {
          await db.run('DELETE FROM project_documents WHERE project_id = ?', [recordId]);
          for (const doc of projectDocs) {
            await db.run(
              'INSERT INTO project_documents (id, project_id, media_id, display_order) VALUES (?, ?, ?, ?)',
              [db.generateUUID(), recordId, doc.media_id, doc.display_order || 0]
            );
          }
        }
      }

      // Handle Blog relation (wipe and rebuild)
      if (tableName === 'blogs' && blogTags && Array.isArray(blogTags)) {
        await db.run('DELETE FROM blog_tags WHERE blog_id = ?', [recordId]);
        for (const tagId of blogTags) {
          await db.run('INSERT INTO blog_tags (blog_id, tag_id) VALUES (?, ?)', [recordId, tagId]);
        }
      }

      // Audit Log
      await db.run(
        'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [db.generateUUID(), request.user.id, 'UPDATE', tableName, recordId, `Updated record in ${tableName}`]
      );

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // --- DELETE ---
  if (method === 'DELETE' && recordId) {
    try {
      // Soft delete where applicable, otherwise hard delete
      const softDeleteTables = ['services', 'projects', 'global_certifications', 'other_certificates', 'gallery_albums', 'gallery', 'testimonials', 'clients', 'categories', 'tags', 'blogs', 'careers', 'media', 'users'];
      
      if (softDeleteTables.includes(tableName)) {
        await db.run(`UPDATE ${tableName} SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, [recordId]);
      } else {
        await db.run(`DELETE FROM ${tableName} WHERE id = ?`, [recordId]);
      }

      // Audit Log
      await db.run(
        'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [db.generateUUID(), request.user.id, 'DELETE', tableName, recordId, `Deleted record in ${tableName}`]
      );

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // --- BULK OPERATIONS ---
  if (method === 'POST' && path === '/api/admin/bulk-operation') {
    try {
      const body = await request.json(); // { action: 'delete'|'publish'|'draft', table: '...', ids: [...] }
      const { action, table, ids } = body;

      if (!table || !ALLOWED_TABLES.includes(table) || !ids || !Array.isArray(ids) || ids.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400, headers: corsHeaders });
      }

      const statements = [];
      const softDeleteTables = ['services', 'projects', 'global_certifications', 'other_certificates', 'gallery_albums', 'gallery', 'testimonials', 'clients', 'categories', 'tags', 'blogs', 'careers', 'media', 'users'];

      for (const id of ids) {
        if (action === 'delete') {
          if (softDeleteTables.includes(table)) {
            statements.push(env.DB.prepare(`UPDATE ${table} SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id));
          } else {
            statements.push(env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id));
          }
        } else if (action === 'publish') {
          statements.push(env.DB.prepare(`UPDATE ${table} SET status = 'published' WHERE id = ?`).bind(id));
        } else if (action === 'draft') {
          statements.push(env.DB.prepare(`UPDATE ${table} SET status = 'draft' WHERE id = ?`).bind(id));
        }
      }

      await db.batch(statements);

      // Audit Log
      await db.run(
        'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [db.generateUUID(), request.user.id, `BULK_${action.toUpperCase()}`, table, 'bulk', `Bulk action on ${ids.length} records in ${table}`]
      );

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });
}
