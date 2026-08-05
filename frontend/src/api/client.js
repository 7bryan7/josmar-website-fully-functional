// API Client for Josmar Website & CMS
// Auth relies exclusively on the HttpOnly cookie set by the backend on login.
// The JWT is never stored in localStorage (XSS risk) — the browser manages the
// cookie automatically and forwards it on every same-origin / credentialed request.

const getHeaders = () => ({
  'Content-Type': 'application/json',
});

const handleResponse = async (res) => {
  if (!res.ok) {
    if (res.status === 401) {
      // Cookie is expired/invalid — clear the display-only user object and signal the app
      localStorage.removeItem('admin_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

export const api = {
  // GET helper
  async get(endpoint) {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include', // forward the HttpOnly session cookie
    });
    return handleResponse(res);
  },

  // POST helper
  async post(endpoint, data) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // PUT helper
  async put(endpoint, data) {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // DELETE helper
  async delete(endpoint) {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // Upload Media (multipart form data)
  // Note: Do NOT set Content-Type here — the browser sets it with the correct boundary.
  async uploadMedia(formData) {
    const res = await fetch('/api/admin/media/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    return handleResponse(res);
  },

  // Auth Operations
  auth: {
    async checkSetup() {
      // Check if setup is needed by probing /api/auth/me
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        return res.status === 401;
      } catch (e) {
        return false;
      }
    },
    async setup(username, email, password) {
      return api.post('/api/auth/setup', { username, email, password });
    },
    async login(username, password) {
      const res = await api.post('/api/auth/login', { username, password });
      // The backend sets an HttpOnly cookie — we only store the non-sensitive
      // user object in localStorage for display purposes (username, role, etc.).
      localStorage.setItem('admin_user', JSON.stringify(res.user));
      return res.user;
    },
    logout() {
      // Clear display-only user data; the HttpOnly cookie will expire or be
      // cleared server-side (add a POST /api/auth/logout endpoint to clear it actively).
      localStorage.removeItem('admin_user');
    },
    getUser() {
      const user = localStorage.getItem('admin_user');
      if (!user) return null;
      try {
        return JSON.parse(user);
      } catch (e) {
        localStorage.removeItem('admin_user');
        return null;
      }
    },
    // Deprecated: the JWT is no longer stored client-side.
    // Kept as a no-op stub to avoid breaking any callers during migration.
    getToken() {
      return null;
    }
  }
};
