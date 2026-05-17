#!/usr/bin/env node
// テスト用 PostgreSQL データベースを作成する
// Usage: node scripts/create-test-db.js
// 事前に DATABASE_URL または .env を設定しておくこと

import 'dotenv/config';
import postgres from 'postgres';

const devUrl = process.env.DATABASE_URL;
if (!devUrl) {
  console.error('ERROR: DATABASE_URL が設定されていません');
  process.exit(1);
}

const TEST_DB_NAME = 'transaction_db_test';
// 既存の接続先をベースに postgres 管理 DB に接続してテスト DB を作成する
const adminUrl = devUrl.replace(/\/[^/?]+(\?.*)?$/, '/postgres');
const sql = postgres(adminUrl, { max: 1 });

try {
  const existing = await sql`SELECT datname FROM pg_database WHERE datname = ${TEST_DB_NAME}`;
  if (existing.length > 0) {
    console.log(`Already exists: ${TEST_DB_NAME}`);
  } else {
    await sql.unsafe(`CREATE DATABASE ${TEST_DB_NAME}`);
    console.log(`Created: ${TEST_DB_NAME}`);
  }
} catch (err) {
  console.error('ERROR:', err.message);
  process.exit(1);
} finally {
  await sql.end();
}
