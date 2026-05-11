import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

/**
 * PostgreSQL接続クライアントを生成する。
 * URLが空/null/undefinedの場合はnullを返す（接続不要な環境への対応）。
 *
 * @param {string | null | undefined} url - PostgreSQL接続URL
 * @returns {{ db: import('drizzle-orm').DrizzleD1Database, health: { query: (q: string) => Promise<unknown> } } | null}
 */
export function createDbClient(url) {
  if (!url) return null;
  const sql = postgres(url, { max: 10 });
  const db = drizzle(sql, { schema });
  const health = { query: (q) => sql.unsafe(q) };
  return { db, health };
}
