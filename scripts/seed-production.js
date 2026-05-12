#!/usr/bin/env node
/**
 * 本番初期データ投入スクリプト
 *
 * 使用方法:
 *   ADMIN_PASSWORD_HASH="$(node -e "const b=require('bcryptjs');console.log(b.hashSync(process.env.ADMIN_PASSWORD,10))")" \
 *   node scripts/seed-production.js | psql $DATABASE_URL
 *
 * または: node scripts/seed-production.js > production-seed.sql
 *
 * ADMIN_PASSWORD_HASH 未設定の場合は開発用デフォルトを使用する（必ず本番前に変更すること）。
 */

import { buildProductionSeedSql } from '../server/db/seedProduction.js';

// password: admin123 (本番では必ず変更すること)
const DEFAULT_HASH = '$2b$10$9eiwVSksdG5cwuSmwWBy..v6rGRkHElcS17x8F8jD2461.ND3rYVu';

const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;

if (!process.env.ADMIN_PASSWORD_HASH) {
  process.stderr.write(
    '⚠️  ADMIN_PASSWORD_HASH が設定されていません。デフォルトパスワード (admin123) を使用します。\n' +
    '   本番環境では必ず ADMIN_PASSWORD_HASH を設定し、初回ログイン後にパスワードを変更してください。\n'
  );
}

process.stdout.write(buildProductionSeedSql({ adminPasswordHash }));
