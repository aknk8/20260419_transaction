#!/usr/bin/env node
// E2Eテスト用DB初期化スクリプト（TRUNCATE + seed再投入）
import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../server/db/schema.js';
import { resetDb } from '../server/db/resetDb.js';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const db = drizzle(sql, { schema });
try {
  await resetDb(db);
  console.log('E2E seed: DB reset and seed completed');
} catch (err) {
  console.error(`E2E seed failed: ${err.message}`);
  process.exit(1);
} finally {
  await sql.end();
}
