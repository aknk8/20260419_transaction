-- M5-2: 支払依頼ステータスの '差戻し' → '却下' マイグレーション
-- M5-2: 請求ステータスの '入金済' → '消込済み' マイグレーション
-- 実行前に必ずバックアップを取ること

BEGIN;

-- 支払依頼: '差戻し' → '却下'
UPDATE payments
SET status = '却下'
WHERE status = '差戻し';

-- 請求: '入金済' → '消込済み'
UPDATE invoices
SET status = '消込済み'
WHERE status = '入金済';

COMMIT;
