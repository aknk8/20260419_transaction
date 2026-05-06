-- M5-2: payments.status='差戻し' → '却下' データマイグレーション
-- 本番実行前に必ずバックアップを取得すること
UPDATE payments SET status = '却下' WHERE status = '差戻し';
