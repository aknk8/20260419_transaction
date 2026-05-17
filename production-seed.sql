-- 本番初期データ（冪等）
-- 実行: psql $DATABASE_URL -f <(node scripts/seed-production.js)
BEGIN;

INSERT INTO users (
  id, name, password_hash, user_type, department, position,
  status, failed_login_count, locked_until
) VALUES (
  'admin',
  'システム管理者',
  '/wLBNexZ8/PRA1KwNKVExyHk4A6',
  'システム管理者',
  '管理部門',
  '管理者',
  '有効',
  0,
  NULL
) ON CONFLICT (id) DO NOTHING;

COMMIT;
