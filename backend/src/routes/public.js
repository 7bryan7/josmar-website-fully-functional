import { Database } from '../db.js';
import {
  validateFile,
  validateTextFields,
  ALLOWED_RESUME_TYPES,
  MAX_RESUME_FILE_SIZE,
  CONTACT_SCHEMA,
  APPLICATION_TEXT_SCHEMA,
} from '../validation.js';
import { getCorsHeaders } from '../cors.js';

export async function handlePublicRoutes(request, env, url) {
  const db = new Database(request.services.db);
  const path = url.pathname;
  const method = request.method;

  // Origin-aware CORS headers — no wildcard
  const corsHeaders = getCorsHeaders(request, env);

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 1. Settings Endpoint
  if (method === 'GET' && path === '/api/public/settings') {
    try {
      const rows = await db.query('SELECT key, value, category FROM settings');
      const settings = {};
      rows.results.forEach(row => {
        if (!settings[row.category]) {
          settings[row.category] = {};
        }
        // Try parsing JSON if value looks like JSON, otherwise keep raw
        let val = row.value;
        if (val && typeof val === 'string' && ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']')))) {
          try {
            val = JSON.parse(val);
          } catch(e) {}
        }
        settings[row.category][row.key] = val;
      });
      return new Response(JSON.stringify(settings), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 2. Homepage Endpoint (aggregated data)
  if (method === 'GET' && path === '/api/public/homepage') {
    try {
      const sections = await db.query('SELECT * FROM homepage_sections WHERE is_enabled = 1 ORDER BY display_order ASC');
      
      const payload = {
        sections: sections.results.map(s => {
          try {
            s.settings_json = JSON.parse(s.settings_json || '{}');
          } catch(e) { s.settings_json = {}; }
          return s;
        }),
        services: [],
        projects: [],
        testimonials: [],
        clients: [],
        news: []
      };

      // Check which sections are active and fetch their data
      const activeKeys = sections.results.map(s => s.section_key);

      if (activeKeys.includes('services')) {
        const res = await db.query(
          `SELECT s.*, m.path as image_path FROM services s 
           LEFT JOIN media m ON s.image_media_id = m.id 
           WHERE s.status = 'published' AND s.deleted_at IS NULL 
           ORDER BY s.display_order ASC LIMIT 3`
        );
        payload.services = res.results;
      }

      if (activeKeys.includes('projects')) {
        const res = await db.query(
          `SELECT p.*, m.path as primary_image_path FROM projects p 
           LEFT JOIN project_images pi ON pi.project_id = p.id AND pi.is_primary = 1 
           LEFT JOIN media m ON pi.media_id = m.id 
           WHERE p.status = 'published' AND p.deleted_at IS NULL 
           ORDER BY p.display_order ASC LIMIT 3`
        );
        payload.projects = res.results;
      }

      if (activeKeys.includes('testimonials')) {
        const res = await db.query(
          `SELECT t.*, m.path as avatar_path FROM testimonials t 
           LEFT JOIN media m ON t.avatar_media_id = m.id 
           WHERE t.status = 'published' AND t.deleted_at IS NULL 
           ORDER BY t.display_order ASC LIMIT 5`
        );
        payload.testimonials = res.results;
      }

      if (activeKeys.includes('logos')) {
        const res = await db.query(
          `SELECT c.*, m.path as logo_path FROM clients c 
           LEFT JOIN media m ON c.logo_media_id = m.id 
           WHERE c.status = 'published' AND c.deleted_at IS NULL 
           ORDER BY c.display_order ASC`
        );
        payload.clients = res.results;
      }

      if (activeKeys.includes('news')) {
        const res = await db.query(
          `SELECT b.id, b.title, b.content, b.seo_url, b.created_at, m.path as featured_image_path, cat.name as category_name 
           FROM blogs b 
           LEFT JOIN media m ON b.featured_image_media_id = m.id 
           LEFT JOIN categories cat ON b.category_id = cat.id 
           WHERE b.status = 'published' AND b.deleted_at IS NULL 
           ORDER BY b.created_at DESC LIMIT 3`
        );
        payload.news = res.results.map(item => {
          // Truncate content for preview
          let text = item.content.replace(/<[^>]*>/g, '');
          if (text.length > 150) text = text.substring(0, 150) + '...';
          item.excerpt = text;
          delete item.content;
          return item;
        });
      }

      return new Response(JSON.stringify(payload), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 3. Services Endpoint
  if (method === 'GET' && path === '/api/public/services') {
    try {
      const res = await db.query(
        `SELECT s.*, m.path as image_path, m2.path as brochure_path FROM services s 
         LEFT JOIN media m ON s.image_media_id = m.id 
         LEFT JOIN media m2 ON s.brochure_media_id = m2.id 
         WHERE s.status = 'published' AND s.deleted_at IS NULL 
         ORDER BY s.display_order ASC`
      );
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 4. Projects Endpoint (List and filter)
  if (method === 'GET' && path === '/api/public/projects') {
    try {
      const category = url.searchParams.get('category');
      const search = url.searchParams.get('search');
      
      let queryStr = `
        SELECT p.*, m.path as primary_image_path FROM projects p 
        LEFT JOIN project_images pi ON pi.project_id = p.id AND pi.is_primary = 1 
        LEFT JOIN media m ON pi.media_id = m.id 
        WHERE p.status = 'published' AND p.deleted_at IS NULL
      `;
      const params = [];

      if (category) {
        queryStr += ` AND p.category = ?`;
        params.push(category);
      }

      if (search) {
        queryStr += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.client LIKE ?)`;
        const wild = `%${search}%`;
        params.push(wild, wild, wild);
      }

      queryStr += ` ORDER BY p.display_order ASC`;

      const res = await db.query(queryStr, params);
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 5. Project Details Endpoint
  if (method === 'GET' && path.startsWith('/api/public/projects/')) {
    try {
      const slug = path.substring('/api/public/projects/'.length);
      const project = await db.get("SELECT * FROM projects WHERE seo_slug = ? AND status = 'published' AND deleted_at IS NULL", [slug]);
      
      if (!project) {
        return new Response(JSON.stringify({ error: 'Project not found' }), { status: 404, headers: corsHeaders });
      }

      // Fetch images
      const images = await db.query(
        `SELECT pi.*, m.path, m.alt_text, m.caption FROM project_images pi 
         JOIN media m ON pi.media_id = m.id 
         WHERE pi.project_id = ? 
         ORDER BY pi.display_order ASC`,
        [project.id]
      );

      // Fetch documents
      const docs = await db.query(
        `SELECT pd.*, m.name, m.path, m.size FROM project_documents pd 
         JOIN media m ON pd.media_id = m.id 
         WHERE pd.project_id = ? 
         ORDER BY pd.display_order ASC`,
        [project.id]
      );

      project.images = images.results;
      project.documents = docs.results;

      return new Response(JSON.stringify(project), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 6. Credentials Endpoint
  if (method === 'GET' && path === '/api/public/credentials') {
    try {
      const globalCerts = await db.query(
        `SELECT gc.*, m1.path as org_logo_path, m2.path as certificate_image_path 
         FROM global_certifications gc 
         LEFT JOIN media m1 ON gc.org_logo_media_id = m1.id 
         JOIN media m2 ON gc.certificate_image_media_id = m2.id 
         WHERE gc.active_status = 1 AND gc.deleted_at IS NULL 
         ORDER BY gc.display_order ASC`
      );

      const otherCerts = await db.query(
        `SELECT oc.*, m.path as certificate_image_path 
         FROM other_certificates oc 
         JOIN media m ON oc.certificate_image_media_id = m.id 
         WHERE oc.active_status = 1 AND oc.deleted_at IS NULL 
         ORDER BY oc.display_order ASC`
      );

      return new Response(JSON.stringify({
        global_certifications: globalCerts.results,
        other_certificates: otherCerts.results
      }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 7. Gallery Endpoint
  if (method === 'GET' && path === '/api/public/gallery') {
    try {
      const category = url.searchParams.get('category_id');
      const search = url.searchParams.get('search');

      const albums = await db.query("SELECT a.*, m.path as cover_path FROM gallery_albums a LEFT JOIN media m ON a.cover_media_id = m.id WHERE a.status = 'published' AND a.deleted_at IS NULL ORDER BY a.display_order ASC");
      
      let queryStr = `
        SELECT g.*, m.path, m.name, m.alt_text, m.caption, m.size, c.name as category_name 
        FROM gallery g 
        JOIN media m ON g.media_id = m.id 
        LEFT JOIN categories c ON g.category_id = c.id 
        WHERE g.deleted_at IS NULL
      `;
      const params = [];

      if (category) {
        queryStr += ` AND g.category_id = ?`;
        params.push(category);
      }

      if (search) {
        queryStr += ` AND (m.name LIKE ? OR m.alt_text LIKE ? OR m.caption LIKE ?)`;
        const wild = `%${search}%`;
        params.push(wild, wild, wild);
      }

      queryStr += ` ORDER BY g.display_order ASC`;

      const images = await db.query(queryStr, params);

      return new Response(JSON.stringify({
        albums: albums.results,
        images: images.results
      }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 8. Careers (Job Openings)
  if (method === 'GET' && path === '/api/public/careers') {
    try {
      const res = await db.query("SELECT * FROM careers WHERE status = 'published' AND deleted_at IS NULL ORDER BY display_order ASC");
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 9. Careers - Apply (Job Application Submission - Multipart Form)
  if (method === 'POST' && path === '/api/public/careers/apply') {
    try {
      const formData = await request.formData();
      const career_id       = formData.get('career_id')        || '';
      const applicant_name  = formData.get('applicant_name')   || '';
      const applicant_email = formData.get('applicant_email')  || '';
      const cover_letter    = formData.get('cover_letter')     || '';
      const resumeFile      = formData.get('resume');

      // ── 1. Validate text fields first (length limits + email format) ───────
      const textCheck = validateTextFields(
        { career_id, applicant_name, applicant_email, cover_letter },
        APPLICATION_TEXT_SCHEMA
      );
      if (!textCheck.valid) {
        return new Response(JSON.stringify({ error: textCheck.error }), { status: 400, headers: corsHeaders });
      }

      if (!resumeFile) {
        return new Response(JSON.stringify({ error: '"resume" file is required.' }), { status: 400, headers: corsHeaders });
      }

      if (!request.services.storage) {
        return new Response(JSON.stringify({ error: 'Storage service not available.' }), { status: 500, headers: corsHeaders });
      }

      // ── 2. Read file buffer (streams can only be consumed once) ───────────
      const fileBuffer = await resumeFile.arrayBuffer();

      // ── 3. Validate resume file (magic bytes + extension + size) ──────────
      const fileCheck = validateFile(
        { name: resumeFile.name, type: resumeFile.type, size: resumeFile.size },
        fileBuffer,
        ALLOWED_RESUME_TYPES,
        MAX_RESUME_FILE_SIZE
      );
      if (!fileCheck.valid) {
        return new Response(JSON.stringify({ error: fileCheck.error }), { status: 400, headers: corsHeaders });
      }
      // Use the magic-byte-detected MIME type for storage and the media record.
      const detectedMime = fileCheck.mimeType;

      // ── 4. Upload resume to private storage path ──────────────────────────
      const mediaId = db.generateUUID();
      const cleanFileName = `${mediaId}-${resumeFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const r2Path = `resumes/${cleanFileName}`;

      await request.services.storage.upload(r2Path, fileBuffer, detectedMime);

      // ── 5. Insert media metadata (uses detected MIME, not client-claimed) ─
      await db.run(
        `INSERT INTO media (id, name, path, size, mime_type, folder)
         VALUES (?, ?, ?, ?, ?, '/resumes')`,
        [mediaId, resumeFile.name, r2Path, resumeFile.size, detectedMime]
      );

      // ── 6. Insert application record ──────────────────────────────────────
      const id = db.generateUUID();
      await db.run(
        `INSERT INTO applications (id, career_id, applicant_name, applicant_email, resume_media_id, cover_letter, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, career_id, applicant_name, applicant_email, mediaId, cover_letter, 'pending']
      );

      return new Response(
        JSON.stringify({ success: true, message: 'Application submitted successfully' }),
        { status: 201, headers: corsHeaders }
      );
    } catch (e) {
      console.error('[career apply] Error:', e);
      return new Response(JSON.stringify({ error: 'Submission failed. Please try again.' }), { status: 500, headers: corsHeaders });
    }
  }

  // 10. Contact Submission
  if (method === 'POST' && path === '/api/public/contact') {
    try {
      const body = await request.json();

      // ── Validate all text fields: length limits + email format ─────────────
      // Prevents storage DoS (oversized payloads) and stored XSS via the admin
      // panel if it ever renders contact messages without escaping.
      const check = validateTextFields(body, CONTACT_SCHEMA);
      if (!check.valid) {
        return new Response(JSON.stringify({ error: check.error }), { status: 400, headers: corsHeaders });
      }

      const { name, email, phone, subject, message } = body;

      const id = db.generateUUID();
      await db.run(
        `INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [id, name.trim(), email.trim(), (phone || '').trim(), subject.trim(), message.trim()]
      );

      return new Response(
        JSON.stringify({ success: true, message: 'Message sent successfully' }),
        { status: 201, headers: corsHeaders }
      );
    } catch (e) {
      console.error('[contact] Error:', e);
      return new Response(JSON.stringify({ error: 'Submission failed. Please try again.' }), { status: 500, headers: corsHeaders });
    }
  }

  // 11. Blogs (News list)
  if (method === 'GET' && path === '/api/public/news') {
    try {
      const category = url.searchParams.get('category');
      const tag = url.searchParams.get('tag');
      const search = url.searchParams.get('search');

      let queryStr = `
        SELECT b.*, m.path as featured_image_path, c.name as category_name, u.username as author_name 
        FROM blogs b 
        LEFT JOIN media m ON b.featured_image_media_id = m.id 
        LEFT JOIN categories c ON b.category_id = c.id 
        LEFT JOIN users u ON b.author_id = u.id 
        WHERE b.status = 'published' AND b.deleted_at IS NULL
      `;
      const params = [];

      if (category) {
        queryStr += ` AND c.slug = ?`;
        params.push(category);
      }

      if (tag) {
        queryStr += ` AND b.id IN (SELECT blog_id FROM blog_tags bt JOIN tags t ON bt.tag_id = t.id WHERE t.slug = ?)`;
        params.push(tag);
      }

      if (search) {
        queryStr += ` AND (b.title LIKE ? OR b.content LIKE ?)`;
        const wild = `%${search}%`;
        params.push(wild, wild);
      }

      queryStr += ` ORDER BY b.created_at DESC`;

      const res = await db.query(queryStr, params);
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 12. Blog Details
  if (method === 'GET' && path.startsWith('/api/public/news/')) {
    try {
      const slug = path.substring('/api/public/news/'.length);
      const blog = await db.get(
        `SELECT b.*, m.path as featured_image_path, c.name as category_name, u.username as author_name 
         FROM blogs b 
         LEFT JOIN media m ON b.featured_image_media_id = m.id 
         LEFT JOIN categories c ON b.category_id = c.id 
         LEFT JOIN users u ON b.author_id = u.id 
         WHERE b.seo_url = ? AND b.status = 'published' AND b.deleted_at IS NULL`,
        [slug]
      );

      if (!blog) {
        return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers: corsHeaders });
      }

      // Fetch tags
      const tags = await db.query(
        `SELECT t.* FROM tags t 
         JOIN blog_tags bt ON bt.tag_id = t.id 
         WHERE bt.blog_id = ?`,
        [blog.id]
      );
      blog.tags = tags.results;

      return new Response(JSON.stringify(blog), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 13. SEO data
  if (method === 'GET' && path === '/api/public/seo') {
    try {
      const type = url.searchParams.get('type');
      const id = url.searchParams.get('id');

      let seo = null;
      if (id) {
        seo = await db.get('SELECT * FROM seo WHERE entity_type = ? AND entity_id = ?', [type, id]);
      } else {
        seo = await db.get('SELECT * FROM seo WHERE entity_type = ? AND entity_id IS NULL', [type]);
      }

      if (!seo) {
        // Fallback to default seo settings
        const defTitle = await db.get('SELECT value FROM settings WHERE key = "seo_default_title"');
        const defDesc = await db.get('SELECT value FROM settings WHERE key = "seo_default_description"');
        return new Response(JSON.stringify({
          meta_title: defTitle?.value || 'Josmar Consulting Engineers',
          meta_description: defDesc?.value || 'Professional engineering consulting services.'
        }), { status: 200, headers: corsHeaders });
      }

      return new Response(JSON.stringify(seo), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });
}
