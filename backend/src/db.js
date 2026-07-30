/**
 * Database utility helpers for Cloudflare D1
 */

export class Database {
  constructor(dbServiceOrD1) {
    if (!dbServiceOrD1) {
      throw new Error('Database service or D1 binding is required.');
    }
    this.db = dbServiceOrD1;
  }

  async query(sql, params = []) {
    if (typeof this.db.query === 'function' && typeof this.db.prepare !== 'function') {
      // It is the DatabaseService interface
      return this.db.query(sql, params);
    }
    // Fallback to D1 raw bindings API
    const dbTarget = typeof this.db.query === 'function' ? this.db.d1 : this.db;
    return dbTarget.prepare(sql).bind(...params).all();
  }

  async get(sql, params = []) {
    if (typeof this.db.get === 'function' && typeof this.db.prepare !== 'function') {
      return this.db.get(sql, params);
    }
    const dbTarget = typeof this.db.get === 'function' ? this.db.d1 : this.db;
    return dbTarget.prepare(sql).bind(...params).first();
  }

  async run(sql, params = []) {
    if (typeof this.db.run === 'function' && typeof this.db.prepare !== 'function') {
      return this.db.run(sql, params);
    }
    const dbTarget = typeof this.db.run === 'function' ? this.db.d1 : this.db;
    return dbTarget.prepare(sql).bind(...params).run();
  }

  async batch(statements) {
    return this.db.batch(statements);
  }

  generateUUID() {
    if (typeof this.db.generateUUID === 'function') {
      return this.db.generateUUID();
    }
    return crypto.randomUUID();
  }

  prepare(sql) {
    return this.db.prepare(sql);
  }
}
