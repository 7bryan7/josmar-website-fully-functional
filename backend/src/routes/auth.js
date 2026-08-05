import { getCorsHeaders } from '../cors.js';
import {
  checkLoginRateLimit,
  recordLoginFailure,
  clearLoginAttempts,
} from '../ratelimit.js';

export async function handleAuthRoutes(request, env, url) {
  const authService = request.services.auth;
  const path = url.pathname;
  const corsHeaders = getCorsHeaders(request, env);

  if (path === '/api/auth/setup') {
    if (request.method === 'GET') {
      try {
        const needsSetup = await authService.checkSetup();
        return new Response(JSON.stringify({ needsSetup }), {
          status: 200,
          headers: corsHeaders,
        });
      } catch (e) {
        console.error('[auth/setup GET]', e);
        return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    if (request.method === 'POST') {
      try {
        const needsSetup = await authService.checkSetup();
        if (!needsSetup) {
          return new Response(JSON.stringify({ error: 'Setup already completed' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        let body = {};
        try { body = await request.json(); } catch (_) { body = {}; }

        const { username, password, email } = body;

        if (!username || !password || !email) {
          return new Response(JSON.stringify({ error: 'Username, password, and email are required' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        const setupRes = await authService.setup(username, email, password);

        return new Response(JSON.stringify({ success: true, message: 'Admin user created successfully', user: setupRes.user }), {
          status: 201,
          headers: corsHeaders,
        });
      } catch (e) {
        console.error('[auth/setup POST]', e);
        return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }
  }

  if (request.method === 'POST' && path === '/api/auth/login') {
    // ── Rate limit check ──────────────────────────────────────────────────────
    // Reject requests that have exceeded the failed-attempt threshold.
    const rateCheck = checkLoginRateLimit(request);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: `Too many failed login attempts. Please try again in ${Math.ceil(rateCheck.retryAfterSec / 60)} minute(s).`,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': String(rateCheck.retryAfterSec),
          },
        }
      );
    }

    try {
      const body = await request.json().catch(() => ({}));
      const { username, password } = body;

      if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Username and password are required' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const loginRes = await authService.login(username, password);

      // Successful login — clear any accumulated failure counter for this IP
      clearLoginAttempts(request);

      return new Response(JSON.stringify({ user: loginRes.user }), {
        status: 200,
        headers: {
          ...corsHeaders,
          // HttpOnly cookie — the JWT is no longer returned in the response body
          'Set-Cookie': `token=${loginRes.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
        },
      });
    } catch (e) {
      // Record failure so the rate limiter can track it
      recordLoginFailure(request);
      console.error('[auth/login]', e);
      // Return a deliberately vague message so usernames cannot be enumerated
      return new Response(JSON.stringify({ error: 'Invalid credentials.' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
  }

  if (request.method === 'GET' && path === '/api/auth/me') {
    if (!request.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    return new Response(JSON.stringify({ user: request.user }), {
      status: 200,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: corsHeaders,
  });
}
