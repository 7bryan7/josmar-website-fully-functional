import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { convertPlaceholders } from './utils.js';

// Setup INT8 type parser to parse BigInt counts to numbers
pg.types.setTypeParser(pg.types.builtins.INT8, (val) => parseInt(val, 10));

export class SupabaseProvider {
  constructor(env) {
    const connectionString = env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('Supabase DATABASE_URL (connection string) is required.');
    }
    
    this.pool = new pg.Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseAnonKey = env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required.');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.bucketName = env.SUPABASE_STORAGE_BUCKET || 'josmar-media';

    this.db = {
      query: async (sql, params = []) => {
        const { pgSql, pgParams } = convertPlaceholders(sql, params);
        const res = await this.pool.query(pgSql, pgParams);
        return { results: res.rows };
      },

      get: async (sql, params = []) => {
        const { pgSql, pgParams } = convertPlaceholders(sql, params);
        const res = await this.pool.query(pgSql, pgParams);
        return res.rows[0] || null;
      },

      run: async (sql, params = []) => {
        const { pgSql, pgParams } = convertPlaceholders(sql, params);
        const res = await this.pool.query(pgSql, pgParams);
        return { success: true, changes: res.rowCount };
      },

      batch: async (statements) => {
        const client = await this.pool.connect();
        try {
          await client.query('BEGIN');
          const results = [];
          for (const stmt of statements) {
            let sqlText = stmt.sql || stmt.statement;
            let sqlParams = stmt.params || stmt.binding || [];
            const { pgSql, pgParams } = convertPlaceholders(sqlText, sqlParams);
            const res = await client.query(pgSql, pgParams);
            results.push({ results: res.rows });
          }
          await client.query('COMMIT');
          return results;
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      },

      prepare: (sql) => {
        return {
          sql,
          params: [],
          bind(...args) {
            this.params = args;
            return this;
          }
        };
      },

      generateUUID: () => {
        return crypto.randomUUID();
      }
    };

    this.storage = {
      upload: async (path, fileBody, mimeType) => {
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .upload(path, fileBody, {
            contentType: mimeType,
            upsert: true
          });
        if (error) throw error;
        return { success: true, path };
      },

      download: async (path) => {
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .download(path);
        if (error) throw error;
        return {
          body: await data.arrayBuffer(),
          contentType: data.type || 'application/octet-stream'
        };
      },

      delete: async (path) => {
        const { data, error } = await this.supabase.storage
          .from(this.bucketName)
          .remove([path]);
        if (error) throw error;
        return { success: true };
      }
    };

    this.auth = {
      checkSetup: async () => {
        const existingUser = await this.db.get('SELECT id FROM users LIMIT 1');
        return !existingUser;
      },

      setup: async (username, email, password) => {
        let signUpData = null;
        let signUpError = null;

        try {
          // Attempt to use admin API to create and auto-confirm the user (requires service role key)
          if (this.supabase.auth.admin) {
            const { data, error } = await this.supabase.auth.admin.createUser({
              email,
              password,
              email_confirm: true,
              user_metadata: { username }
            });
            signUpData = data;
            signUpError = error;
          }
        } catch (adminErr) {
          console.warn('[Supabase Auth] admin.createUser failed, falling back to signUp:', adminErr);
        }

        // Fall back to standard signUp if admin API is unavailable or returns an error
        if (signUpError || !signUpData || !signUpData.user) {
          const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
              data: { username }
            }
          });
          signUpData = data;
          signUpError = error;
          if (signUpError) throw signUpError;
        }

        if (!signUpData.user) throw new Error('User creation failed in Supabase');

        const id = signUpData.user.id;
        await this.db.run(
          'INSERT INTO users (id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)',
          [id, username, 'SUPABASE_AUTH', email, 'admin']
        );
        return { success: true, user: { id, username, email, role: 'admin' } };
      },

      login: async (username, password) => {
        const user = await this.db.get('SELECT id, email, role FROM users WHERE username = ? AND deleted_at IS NULL', [username]);
        if (!user) throw new Error('Invalid username or password');

        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: user.email,
          password
        });
        if (error) throw error;
        if (!data.session) throw new Error('Session creation failed');

        return {
          token: data.session.access_token,
          user: { id: user.id, username, email: user.email, role: user.role }
        };
      },

      verifyToken: async (token) => {
        const { data: { user }, error } = await this.supabase.auth.getUser(token);
        if (error || !user) return null;

        const dbUser = await this.db.get('SELECT id, username, role, email FROM users WHERE id = ? AND deleted_at IS NULL', [user.id]);
        return dbUser;
      }
    };
  }
}
