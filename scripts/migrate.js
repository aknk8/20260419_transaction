#!/usr/bin/env node
import 'dotenv/config';
import postgres from 'postgres';
import { runMigrations } from '../server/db/migrate.js';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('ERROR: DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
try {
  await runMigrations(sql);
  console.log('All migrations applied successfully');
} catch (err) {
  console.error(`Migration failed: ${err.message}`);
  process.exit(1);
} finally {
  await sql.end();
}
