/**
 * backend/src/cors.js
 *
 * Centralised CORS header factory.
 *
 * Configuration
 * ─────────────
 * Set  ALLOWED_ORIGINS  in your environment to a comma-separated list of
 * permitted request origins.  Examples:
 *
 *   Cloudflare Workers (local dev):
 *     .dev.vars → ALLOWED_ORIGINS=http://localhost:5173
 *
 *   Cloudflare Workers (production):
 *     wrangler secret put ALLOWED_ORIGINS
 *     → https://josmar.com
 *
 *   Vercel:
 *     Dashboard → Settings → Environment Variables
 *     ALLOWED_ORIGINS=https://josmar.com
 *
 * If ALLOWED_ORIGINS is not set, CORS is restricted to 'null' (which the
 * browser treats as a cross-origin rejection) — safe default for production.
 *
 * How it works
 * ────────────
 * The request's Origin header is compared against the allowlist.  If it
 * matches, that exact origin is echoed back (required for credentialed
 * requests, which cannot use a wildcard).  If it does not match, the first
 * configured origin is returned, which the browser will reject for any
 * cross-origin request — keeping same-origin calls working without leaking
 * access to unknown origins.
 */

/**
 * Resolve the effective  Access-Control-Allow-Origin  value for the request.
 *
 * @param {Request} request
 * @param {Object}  env     Cloudflare env / Vercel process.env equivalent
 * @returns {string}
 */
function resolveOrigin(request, env) {
  const raw = (env?.ALLOWED_ORIGINS ?? '').trim();

  // Parse and sanitise the configured origin list
  const allowedOrigins = raw
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    // No origins configured → restrict completely (safe production default)
    return 'null';
  }

  const requestOrigin = (request?.headers?.get('Origin') ?? '').trim();

  // Echo the request origin only when it is explicitly allow-listed
  return allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0]; // Browser will reject unrecognised origins
}

/**
 * Return CORS + Content-Type headers suitable for JSON API responses.
 * Also used as the preflight (OPTIONS) response headers.
 *
 * @param {Request} request
 * @param {Object}  env
 * @returns {Object}
 */
export function getCorsHeaders(request, env) {
  return {
    'Access-Control-Allow-Origin':      resolveOrigin(request, env),
    'Access-Control-Allow-Methods':     'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age':           '86400',
    'Vary':                             'Origin',
    'Content-Type':                     'application/json',
  };
}
