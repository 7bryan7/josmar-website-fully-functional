// API Client for Josmar Website & CMS

const getHeaders = () => {
  const token = localStorage.getItem('admin_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
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
    });
    return handleResponse(res);
  },

  // POST helper
  async post(endpoint, data) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // PUT helper
  async put(endpoint, data) {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // DELETE helper
  async delete(endpoint) {
    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Upload Media (multipart form data)
  async uploadMedia(formData) {
    const token = localStorage.getItem('admin_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch('/api/admin/media/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  // Auth Operations
  auth: {
    async checkSetup() {
      // Check if setup is needed
      try {
        const res = await fetch('/api/auth/me');
        return res.status === 401; // Setup is not user-auth, it's checked by setup
      } catch (e) {
        return false;
      }
    },
    async setup(username, email, password) {
      return api.post('/api/auth/setup', { username, email, password });
    },
    async login(username, password) {
      const res = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_user', JSON.stringify(res.user));
      return res.user;
    },
    logout() {
      localStorage.removeItem('admin_token');
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
    getToken() {
      return localStorage.getItem('admin_token');
    }
  }
};
