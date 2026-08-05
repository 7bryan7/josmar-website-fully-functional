/**
 * backend/src/ratelimit.js
 *
 * In-memory sliding-window rate limiter for the login endpoint.
 *
 * Architecture notes
 * ──────────────────
 * This implementation uses a module-level Map.  On Cloudflare Workers each
 * isolate is long-lived within a datacenter, so the store persists across
 * requests on the same isolate — providing meaningful protection in practice.
 *
 * For a fully distributed deployment (multiple Worker instances / Vercel
 * serverless cold-starts) upgrade to a Cloudflare KV or Durable Object
 * backend.  The interface (checkLoginRateLimit / recordLoginFailure /
 * clearLoginAttempts) is stable — swap the backing store without touching
 * the auth route.
 *
 * Parameters
 * ──────────
 * MAX_ATTEMPTS  – Number of failed logins before lockout  (default: 5)
 * WINDOW_MS     – Lock-out window in milliseconds          (default: 15 min)
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS    = 15 * 60 * 1000; // 15 minutes

/** @type {Map<string, { count: number, resetAt: number }>} */
const store = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract the real client IP from either Cloudflare Workers or Node/Vercel
 * request headers.
 *
 * @param {Request} request
 * @returns {string}
 */
function getClientIp(request) {
  // CF-Connecting-IP is set by Cloudflare on every request to a Worker.
  return (
    request.headers.get('CF-Connecting-IP') ||
    // x-forwarded-for may be a comma-separated chain (first entry = real client)
    (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown'
  );
}

/** Prune expired entries to prevent unbounded memory growth. */
function evictExpired() {
  const now = Date.now();
  for (const [ip, entry] of store) {
    if (entry.resetAt <= now) store.delete(ip);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Check whether the request is within the rate limit.
 * Call this BEFORE processing the login credentials.
 *
 * @param {Request} request
 * @returns {{ allowed: true } | { allowed: false, retryAfterSec: number }}
 */
export function checkLoginRateLimit(request) {
  evictExpired();
  const ip  = getClientIp(request);
  const now = Date.now();
  const entry = store.get(ip);

  // No entry or window expired → fresh slate
  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 0, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  return { allowed: true };
}

/**
 * Record a failed login attempt for the requesting IP.
 * Call this after a login attempt fails.
 *
 * @param {Request} request
 */
export function recordLoginFailure(request) {
  const ip  = getClientIp(request);
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count++;
  }
}

/**
 * Clear the failed-attempt counter for the requesting IP.
 * Call this after a successful login so a legitimately locked-out user
 * does not stay blocked after they recover their correct credentials.
 *
 * @param {Request} request
 */
export function clearLoginAttempts(request) {
  store.delete(getClientIp(request));
}
