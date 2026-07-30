import { authMiddleware } from './auth.js';
import { handleAuthRoutes } from './routes/auth.js';
import { handlePublicRoutes } from './routes/public.js';
import { handleAdminRoutes } from './routes/admin.js';
import { handleMediaRoutes } from './routes/media.js';

import { getServices } from './services/index.js';

export default {
  async fetch(request, env, ctx) {
    const services = getServices(env);
    request.services = services;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    };

    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Serve media files directly from storage proxy
    if (method === 'GET' && path.startsWith('/media/')) {
      try {
        const key = decodeURIComponent(path.substring(7));
        let mediaItem = null;
        
        try {
          mediaItem = await services.storage.download(key);
        } catch (storageErr) {
          // If not found by key directly, resolve using database ID mapping
          try {
            const { Database } = await import('./db.js');
            const db = new Database(services.db);
            const dbMedia = await db.get('SELECT path FROM media WHERE id = ?', [key]);
            if (dbMedia && dbMedia.path) {
              mediaItem = await services.storage.download(dbMedia.path);
            }
          } catch (dbErr) {
            console.error('Failed to resolve media ID in database', dbErr);
          }
        }

        if (!mediaItem) {
          return new Response('File Not Found', { status: 404 });
        }

        const headers = new Headers();
        headers.set('Content-Type', mediaItem.contentType);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000');
        
        return new Response(mediaItem.body, { headers });
      } catch (e) {
        return new Response('Error retrieving file: ' + e.message, { status: 500 });
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
