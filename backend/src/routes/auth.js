export async function handleAuthRoutes(request, env, url) {
  const authService = request.services.auth;
  const path = url.pathname;

  if (path === '/api/auth/setup') {
    if (request.method === 'GET') {
      try {
        const needsSetup = await authService.checkSetup();
        return new Response(JSON.stringify({ needsSetup }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (request.method === 'POST') {
      try {
        const needsSetup = await authService.checkSetup();
        if (!needsSetup) {
          return new Response(JSON.stringify({ error: 'Setup already completed' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        let body = {};
        try {
          body = await request.json();
        } catch (e) {
          body = {};
        }

        const { username, password, email } = body;
        
        if (!username || !password || !email) {
          return new Response(JSON.stringify({ error: 'Username, password, and email are required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const setupRes = await authService.setup(username, email, password);

        return new Response(JSON.stringify({ success: true, message: 'Admin user created successfully', user: setupRes.user }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }

  if (request.method === 'POST' && path === '/api/auth/login') {
    try {
      const body = await request.json();
      const { username, password } = body;

      if (!username || !password) {
        return new Response(JSON.stringify({ error: 'Username and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const loginRes = await authService.login(username, password);
      
      return new Response(JSON.stringify({
        token: loginRes.token,
        user: loginRes.user
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${loginRes.token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  if (request.method === 'GET' && path === '/api/auth/me') {
    if (!request.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ user: request.user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
