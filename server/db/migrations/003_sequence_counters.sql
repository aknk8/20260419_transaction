-- INF-09: 採番競合制御 - sequence_counters テーブル作成
-- 同時リクエスト時の採番重複を防ぐため、DB側で排他的にインクリメントする

BEGIN;

CREATE TABLE IF NOT EXISTS sequence_counters (
  entity_type VARCHAR(50) PRIMARY KEY,
  current_val INTEGER NOT NULL DEFAULT 0
);

-- 伝票種別の初期レコードを挿入（既存データがある場合はスキップ）
INSERT INTO sequence_counters (entity_type, current_val) VALUES
  ('quotation',     0),
  ('order',         0),
  ('purchaseOrder', 0),
  ('invoice',       0),
  ('receipt',       0),
  ('payment',       0),
  ('delivery',      0)
ON CONFLICT (entity_type) DO NOTHING;

COMMIT;
