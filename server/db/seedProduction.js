/**
 * 本番初期データ用の SQL を生成する。
 * 冪等実行のため INSERT ... ON CONFLICT DO NOTHING を使用する。
 *
 * @param {{ adminPasswordHash: string }} options
 * @returns {string} psql に渡す SQL 文字列
 */
export function buildProductionSeedSql({ adminPasswordHash } = {}) {
  if (!adminPasswordHash) {
    throw new Error('adminPasswordHash is required');
  }

  const escaped = adminPasswordHash.replace(/'/g, "''");

  return `-- 本番初期データ（冪等）
-- 実行: psql $DATABASE_URL -f <(node scripts/seed-production.js)
BEGIN;

INSERT INTO users (
  id, name, password_hash, user_type, department, position,
  status, failed_login_count, locked_until
) VALUES (
  'admin',
  'システム管理者',
  '${escaped}',
  'システム管理者',
  '管理部門',
  '管理者',
  '有効',
  0,
  NULL
) ON CONFLICT (id) DO NOTHING;

COMMIT;
`;
}
