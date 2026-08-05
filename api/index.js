import handler from '../backend/src/index.js';

/**
 * Vercel Serverless Function bridge.
 * Translates Node.js req/res to Web standard Request/Response.
 */
export default async function (req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const fullUrl = `${protocol}://${host}${req.url}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const options = {
      method: req.method,
      headers,
    };

    // Buffer the request body for non-GET methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // Read raw multi-part body stream
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        options.body = Buffer.concat(chunks);
      } else if (req.body !== undefined) {
        if (typeof req.body === 'string') {
          options.body = req.body;
        } else if (Buffer.isBuffer(req.body)) {
          options.body = req.body;
        } else {
          options.body = JSON.stringify(req.body);
        }
      } else {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        if (chunks.length > 0) {
          options.body = Buffer.concat(chunks);
        }
      }
    }

    // Build standard Web Request
    const webRequest = new Request(fullUrl, options);

    // Mock Cloudflare Worker env context.
    // Only pass the specific env vars the handler needs — never spread all of
    // process.env, which would leak Vercel-internal platform secrets.
    const env = {
      DATABASE_URL:            process.env.DATABASE_URL,
      SUPABASE_URL:            process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY:       process.env.SUPABASE_ANON_KEY,
      SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
      PROVIDER:                process.env.PROVIDER || 'supabase',
      JWT_SECRET:              process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET,
      // ALLOWED_ORIGINS: comma-separated list of permitted request origins.
      // Set this in the Vercel dashboard (Settings → Environment Variables).
      // Example: https://josmar.com
      ALLOWED_ORIGINS:         process.env.ALLOWED_ORIGINS || '',
    };

    // Run the main router fetch handler
    const webResponse = await handler.fetch(webRequest, env, {});

    // Write back status and headers
    res.statusCode = webResponse.status;
    webResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        const cookies = webResponse.headers.getSetCookie 
          ? webResponse.headers.getSetCookie() 
          : [value];
        res.setHeader('Set-Cookie', cookies);
      } else {
        res.setHeader(key, value);
      }
    });

    // Write back response body
    const body = webResponse.body;
    if (body) {
      const reader = body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
  } catch (err) {
    console.error('[vercel bridge] Unhandled error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}
