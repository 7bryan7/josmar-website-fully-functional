import { authMiddleware } from './auth.js';
import { handleAuthRoutes } from './routes/auth.js';
import { handlePublicRoutes } from './routes/public.js';
import { handleAdminRoutes } from './routes/admin.js';
import { handleMediaRoutes } from './routes/media.js';
import { INLINE_MIME_TYPES } from './validation.js';
import { getCorsHeaders } from './cors.js';

import { getServices } from './services/index.js';

export default {
  async fetch(request, env, ctx) {
    const services = getServices(env);
    request.services = services;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS — origin-aware, no wildcard
    const corsHeaders = getCorsHeaders(request, env);

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // ── Media file proxy ───────────────────────────────────────────────────
    // Serves files from R2 / Supabase Storage.
    // Private storage path prefixes require a valid admin JWT.
    if (method === 'GET' && path.startsWith('/media/')) {
      try {
        const rawKey = decodeURIComponent(path.substring(7));

        // Reject path-traversal attempts (e.g. ../../etc/passwd)
        if (rawKey.includes('..') || rawKey.startsWith('/')) {
          return new Response('Bad Request', { status: 400 });
        }

        // Paths under these prefixes are private; require admin authentication.
        const PRIVATE_PREFIXES = ['resumes/'];
        const isPrivate = PRIVATE_PREFIXES.some(p => rawKey.startsWith(p));
        if (isPrivate) {
          const authError = await authMiddleware(request, env);
          if (authError) return authError; // returns 401 JSON response
        }

        let mediaItem = null;
        try {
          mediaItem = await services.storage.download(rawKey);
        } catch (_storageErr) {
          // Key not found directly — attempt DB id → path resolution
          try {
            const { Database } = await import('./db.js');
            const db = new Database(services.db);
            const dbMedia = await db.get('SELECT path FROM media WHERE id = ?', [rawKey]);
            if (dbMedia?.path) {
              // Repeat the private-prefix check for the resolved path
              const resolvedIsPrivate = PRIVATE_PREFIXES.some(p => dbMedia.path.startsWith(p));
              if (resolvedIsPrivate && !request.user) {
                // authMiddleware already ran above for private requests;
                // if request.user is still unset the original key was public
                // but the resolved path is private — deny.
                return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
              }
              mediaItem = await services.storage.download(dbMedia.path);
            }
          } catch (dbErr) {
            console.error('[media proxy] DB resolution error:', dbErr);
          }
        }

        if (!mediaItem) {
          return new Response('File Not Found', { status: 404 });
        }

        const servedType = mediaItem.contentType || 'application/octet-stream';
        const headers = new Headers();
        headers.set('Content-Type', servedType);
        headers.set('X-Content-Type-Options', 'nosniff'); // prevent MIME sniffing
        headers.set('Access-Control-Allow-Origin', '*');

        if (isPrivate) {
          // Private files must not be cached by CDNs or shared caches.
          headers.set('Cache-Control', 'private, no-store');
        } else {
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        }

        // Force download for non-image types (prevents inline XSS for PDFs, etc.)
        if (!INLINE_MIME_TYPES.has(servedType)) {
          headers.set('Content-Disposition', 'attachment');
        }

        return new Response(mediaItem.body, { headers });
      } catch (e) {
        console.error('[media proxy] Error:', e);
        return new Response('Error retrieving file', { status: 500 });
      }
    }

    // Dispatcher API routes
    try {
      // 1. Auth routes (login, me, setup)
      if (path.startsWith('/api/auth')) {
        // me route requires authMiddleware first
        if (path === '/api/auth/me') {
          const authError = await authMiddleware(request, env);
          if (authError) return authError;
        }
        return await handleAuthRoutes(request, env, url);
      }

      // 2. Public routes
      if (path.startsWith('/api/public')) {
        // We imported handlePublicRoutes as handlePublicRoutes
        // Let's import it from ./routes/public.js in the imports!
        // We'll write the imports correctly.
        return await handlePublicRoutes(request, env, url);
      }

      // 3. Admin routes (Requires JWT authentication)
      if (path.startsWith('/api/admin')) {
        const authError = await authMiddleware(request, env);
        if (authError) return authError;

        if (path.startsWith('/api/admin/media')) {
          return await handleMediaRoutes(request, env, url);
        }

        return await handleAdminRoutes(request, env, url);
      }

      // Catch-all API routes
      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
