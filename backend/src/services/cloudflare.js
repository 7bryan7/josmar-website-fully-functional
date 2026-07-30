import { hashPassword, verifyPassword, createJWT, verifyJWT } from '../auth.js';

export class CloudflareProvider {
  constructor(env) {
    const d1 = env.DB;
    const bucket = env.MEDIA_BUCKET;
    const jwtSecret = env.JWT_SECRET;

    this.db = {
      prepare: (sql) => d1.prepare(sql),
      query: async (sql, params = []) => d1.prepare(sql).bind(...params).all(),
      get: async (sql, params = []) => d1.prepare(sql).bind(...params).first(),
      run: async (sql, params = []) => d1.prepare(sql).bind(...params).run(),
      batch: async (statements) => d1.batch(statements),
      generateUUID: () => crypto.randomUUID()
    };

    this.storage = {
      upload: async (path, fileBody, mimeType) => {
        await bucket.put(path, fileBody, {
          httpMetadata: { contentType: mimeType }
        });
        return { success: true, path };
      },

      download: async (path) => {
        const file = await bucket.get(path);
        if (!file) throw new Error('File not found');
        return {
          body: file.body,
          contentType: file.httpMetadata?.contentType || 'application/octet-stream'
        };
      },

      delete: async (path) => {
        await bucket.delete(path);
        return { success: true };
      }
    };

    this.auth = {
      checkSetup: async () => {
        const existingUser = await this.db.get('SELECT id FROM users LIMIT 1');
        return !existingUser;
      },

      setup: async (username, email, password) => {
        const passHash = await hashPassword(password);
        const id = this.db.generateUUID();
        await this.db.run(
          'INSERT INTO users (id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)',
          [id, username, passHash, email, 'admin']
        );
        return { success: true, user: { id, username, email, role: 'admin' } };
      },

      login: async (username, password) => {
        const user = await this.db.get('SELECT * FROM users WHERE username = ? AND deleted_at IS NULL', [username]);
        if (!user) throw new Error('Invalid username or password');

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) throw new Error('Invalid username or password');

        const token = await createJWT({ id: user.id, username: user.username, role: user.role }, jwtSecret);
        return {
          token,
          user: { id: user.id, username: user.username, email: user.email, role: user.role }
        };
      },

      verifyToken: async (token) => {
        const payload = await verifyJWT(token, jwtSecret);
        if (!payload) return null;

        const dbUser = await this.db.get('SELECT id, username, role, email FROM users WHERE id = ? AND deleted_at IS NULL', [payload.id]);
        return dbUser;
      }
    };
  }
}
