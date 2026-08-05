import { Database } from '../db.js';
import {
  validateFile,
  ALLOWED_MEDIA_TYPES,
  MAX_MEDIA_FILE_SIZE,
} from '../validation.js';
import { getCorsHeaders } from '../cors.js';

export async function handleMediaRoutes(request, env, url) {
  const db = new Database(request.services.db);
  const path = url.pathname;
  const method = request.method;

  // Origin-aware CORS headers — no wildcard
  const corsHeaders = getCorsHeaders(request, env);

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Auth guard
  if (!request.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  // 1. GET ALL MEDIA
  if (method === 'GET' && path === '/api/admin/media') {
    try {
      const folder = url.searchParams.get('folder') || '/';
      const search = url.searchParams.get('search');
      
      let queryStr = 'SELECT * FROM media WHERE deleted_at IS NULL';
      const params = [];

      if (folder) {
        queryStr += ' AND folder = ?';
        params.push(folder);
      }

      if (search) {
        queryStr += ' AND (name LIKE ? OR alt_text LIKE ? OR caption LIKE ?)';
        const wild = `%${search}%`;
        params.push(wild, wild, wild);
      }

      queryStr += ' ORDER BY created_at DESC';

      const res = await db.query(queryStr, params);
      return new Response(JSON.stringify(res.results), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 2. GET FOLDERS LIST
  if (method === 'GET' && path === '/api/admin/media/folders') {
    try {
      const res = await db.query('SELECT DISTINCT folder FROM media WHERE deleted_at IS NULL');
      const folders = res.results.map(r => r.folder);
      if (!folders.includes('/')) {
        folders.unshift('/');
      }
      return new Response(JSON.stringify(folders), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 3. UPLOAD MEDIA TO R2 & D1
  if (method === 'POST' && path === '/api/admin/media/upload') {
    try {
      if (!request.services.storage) {
        return new Response(JSON.stringify({ error: 'Storage service not bound' }), { status: 500, headers: corsHeaders });
      }

      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400, headers: corsHeaders });
      }

      // ── Read the buffer first so we can inspect magic bytes ───────────────
      // Size is checked inside validateFile(); reading here avoids a second
      // arrayBuffer() call (streams can only be consumed once).
      const fileBuffer = await file.arrayBuffer();

      // ── File validation (magic bytes + extension + size) ──────────────────
      // We pass fileMeta separately because file.arrayBuffer() was already
      // consumed above and file.size reflects the declared size from headers.
      const fileValidation = validateFile(
        { name: file.name, type: file.type, size: file.size },
        fileBuffer,
        ALLOWED_MEDIA_TYPES,
        MAX_MEDIA_FILE_SIZE
      );
      if (!fileValidation.valid) {
        return new Response(
          JSON.stringify({ error: fileValidation.error }),
          { status: 400, headers: corsHeaders }
        );
      }
      // Use the magic-byte-detected type, NOT the client-supplied Content-Type.
      const detectedMime = fileValidation.mimeType;

      const name = formData.get('name') || file.name;
      const folder = formData.get('folder') || '/';
      const altText = formData.get('alt_text') || '';
      const caption = formData.get('caption') || '';
      const width = formData.get('width') ? parseInt(formData.get('width'), 10) : null;
      const height = formData.get('height') ? parseInt(formData.get('height'), 10) : null;

      const mediaId = db.generateUUID();

      // Clean path name for R2/Storage key
      const cleanFolderName = folder === '/' ? '' : folder.replace(/^\/+|\/+$/g, '') + '/';
      const cleanFileName = `${mediaId}-${name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const r2Path = `${cleanFolderName}${cleanFileName}`;

      // Upload main file using the validated (detected) MIME type
      await request.services.storage.upload(r2Path, fileBuffer, detectedMime);

      // ── Optional thumbnail ────────────────────────────────────────────────
      const thumbnailFile = formData.get('thumbnail');
      let thumbnailPath = null;
      if (thumbnailFile) {
        const thumbBuffer = await thumbnailFile.arrayBuffer();
        const thumbValidation = validateFile(
          { name: thumbnailFile.name, type: thumbnailFile.type, size: thumbnailFile.size },
          thumbBuffer,
          ALLOWED_MEDIA_TYPES,
          MAX_MEDIA_FILE_SIZE
        );
        if (!thumbValidation.valid) {
          return new Response(
            JSON.stringify({ error: `Thumbnail: ${thumbValidation.error}` }),
            { status: 400, headers: corsHeaders }
          );
        }
        thumbnailPath = `thumbnails/${mediaId}-thumb-${name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
        await request.services.storage.upload(thumbnailPath, thumbBuffer, thumbValidation.mimeType);
      }

      // Save metadata — use the detected MIME type, not the claimed one
      await db.run(
        `INSERT INTO media (id, name, path, size, mime_type, alt_text, caption, folder, thumbnail_path, width, height)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [mediaId, name, r2Path, file.size, detectedMime, altText, caption, folder, thumbnailPath, width, height]
      );

      // Audit log
      await db.run(
        'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [db.generateUUID(), request.user.id, 'UPLOAD_MEDIA', 'media', mediaId, `Uploaded media: ${name} to ${folder}`]
      );

      return new Response(JSON.stringify({
        success: true,
        media: {
          id: mediaId,
          name,
          path: r2Path,
          size: file.size,
          mime_type: detectedMime,
          alt_text: altText,
          caption,
          folder,
          thumbnail_path: thumbnailPath
        }
      }), { status: 201, headers: corsHeaders });
    } catch (e) {
      console.error('[media upload] Error:', e);
      return new Response(JSON.stringify({ error: 'Upload failed.' }), { status: 500, headers: corsHeaders });
    }
  }

  // 4. RENAME MEDIA (METADATA UPDATE)
  if (method === 'PUT' && path.startsWith('/api/admin/media/rename/')) {
    try {
      const mediaId = path.substring('/api/admin/media/rename/'.length);
      const body = await request.json();
      const { name, alt_text, caption, folder } = body;

      if (!name) {
        return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400, headers: corsHeaders });
      }

      const media = await db.get('SELECT * FROM media WHERE id = ? AND deleted_at IS NULL', [mediaId]);
      if (!media) {
        return new Response(JSON.stringify({ error: 'Media not found' }), { status: 404, headers: corsHeaders });
      }

      await db.run(
        `UPDATE media SET name = ?, alt_text = ?, caption = ?, folder = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, alt_text || '', caption || '', folder || '/', mediaId]
      );

      // Audit Log
      await db.run(
        'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [db.generateUUID(), request.user.id, 'RENAME_MEDIA', 'media', mediaId, `Renamed media id ${mediaId} to ${name}`]
      );

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  // 5. DELETE MEDIA (FROM R2 & D1)
  if (method === 'DELETE' && path.startsWith('/api/admin/media/delete/')) {
    try {
      const mediaId = path.substring('/api/admin/media/delete/'.length);

      const media = await db.get('SELECT * FROM media WHERE id = ? AND deleted_at IS NULL', [mediaId]);
      if (!media) {
        return new Response(JSON.stringify({ error: 'Media not found' }), { status: 404, headers: corsHeaders });
      }

      // Check if image is used in any table before deletion (referential integrity check)
      // Check project primary image
      const isUsedProject = await db.get('SELECT id FROM project_images WHERE media_id = ? LIMIT 1', [mediaId]);
      // Check service image
      const isUsedService = await db.get('SELECT id FROM services WHERE image_media_id = ? OR brochure_media_id = ? LIMIT 1', [mediaId, mediaId]);
      // Check certifications
      const isUsedCert = await db.get('SELECT id FROM global_certifications WHERE org_logo_media_id = ? OR certificate_image_media_id = ? LIMIT 1', [mediaId, mediaId]);
      const isUsedOtherCert = await db.get('SELECT id FROM other_certificates WHERE certificate_image_media_id = ? LIMIT 1', [mediaId]);
      // Check blogs
      const isUsedBlog = await db.get('SELECT id FROM blogs WHERE featured_image_media_id = ? LIMIT 1', [mediaId]);

      if (isUsedProject || isUsedService || isUsedCert || isUsedOtherCert || isUsedBlog) {
        return new Response(
          JSON.stringify({
            error: 'Cannot delete media: File is currently in use in projects, services, certifications, or blog posts.'
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Delete from storage
      if (request.services.storage) {
        try {
          await request.services.storage.delete(media.path);
          if (media.thumbnail_path) {
            await request.services.storage.delete(media.thumbnail_path);
          }
        } catch (storageErr) {
          // Log delete failure but proceed to database cleanup
          console.error('Storage delete failed', storageErr);
        }
      }

      // Hard delete from database
      await db.run('DELETE FROM media WHERE id = ?', [mediaId]);

      // Audit Log
      await db.run(
        'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
        [db.generateUUID(), request.user.id, 'DELETE_MEDIA', 'media', mediaId, `Deleted media: ${media.name}`]
      );

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: "An internal server error occurred." }), { status: 500, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });
}
