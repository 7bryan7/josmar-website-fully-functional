import { SignJWT, jwtVerify } from 'jose';

const alg = 'HS256';

export async function createJWT(payload, secret) {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('24h') // 24-hour expiration for admin comfort
    .sign(secretKey);
}

export async function verifyJWT(token, secret) {
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    256 // 32 bytes
  );
  
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2_sha256$100000$${saltHex}$${hashHex}`;
}

export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
    return false;
  }
  
  const iterations = parseInt(parts[1], 10);
  const saltHex = parts[2];
  const originalHashHex = parts[3];
  
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256"
    },
    baseKey,
    256
  );
  
  const verifyHashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return verifyHashHex === originalHashHex;
}

export async function authMiddleware(request, env) {
  const authHeader = request.headers.get('Authorization');
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie check
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      const tokenCookie = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
      if (tokenCookie) {
        // Use substring() instead of split('=')[1] — JWT values may contain '=' padding
        // characters and split would silently truncate the token, causing verify failures.
        token = tokenCookie.trim().substring('token='.length);
      }
    }
  }

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized: No token provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const user = await request.services.auth.verifyToken(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    request.user = user;
    return null; // Proceed
  } catch (e) {
    console.error('[authMiddleware] Token verification error:', e);
    return new Response(JSON.stringify({ error: 'Unauthorized: Session verification failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
