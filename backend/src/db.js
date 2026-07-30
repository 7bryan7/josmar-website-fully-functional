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
    if (typeof this.db.query === 'function') {
      return this.db.query(sql, params);
    }
    return this.db.prepare(sql).bind(...params).all();
  }

  async get(sql, params = []) {
    if (typeof this.db.get === 'function') {
      return this.db.get(sql, params);
    }
    return this.db.prepare(sql).bind(...params).first();
  }

  async run(sql, params = []) {
    if (typeof this.db.run === 'function') {
      return this.db.run(sql, params);
    }
    return this.db.prepare(sql).bind(...params).run();
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
