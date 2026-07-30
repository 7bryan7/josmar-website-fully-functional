/**
 * Helper to convert SQLite/D1 "?" placeholders to PostgreSQL "$1, $2" placeholders.
 * Also maps case-insensitive LIKE queries to PostgreSQL ILIKE queries.
 */
export function convertPlaceholders(sql, params = []) {
  if (!sql) return { pgSql: sql, pgParams: params };

  let index = 1;
  // Replace ? with $1, $2, etc.
  let pgSql = sql.replace(/\?/g, () => `$${index++}`);

  // SQLite LIKE is case-insensitive by default. PostgreSQL LIKE is case-sensitive, so we map to ILIKE.
  pgSql = pgSql.replace(/\bLIKE\b/gi, 'ILIKE');

  return { pgSql, pgParams: params };
}
