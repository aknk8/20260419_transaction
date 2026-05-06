-- INF-07: DBインデックス設計・クエリ最適化
-- 一覧表示3秒以内 (M7-4) を達成するための複合インデックスおよびPartialインデックスを追加
-- 冪等実行のため IF NOT EXISTS を使用

BEGIN;

-- 見積: status + 発行日の複合インデックス（承認依頼一覧・日付範囲フィルタ）
CREATE INDEX IF NOT EXISTS idx_quotations_status_date
  ON quotations(status, issue_date);

-- 受注: statusインデックス（承認依頼中・承認済みの絞り込み）
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

-- 発注: statusインデックス（承認依頼中・承認済みの絞り込み）
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
  ON purchase_orders(status);

-- 請求: status + 支払期限の複合インデックス（期限切れ請求一覧・消込状況確認）
CREATE INDEX IF NOT EXISTS idx_invoices_status_due
  ON invoices(status, due_date);

-- 支払依頼: statusインデックス（承認待ち・支払済みの絞り込み）
CREATE INDEX IF NOT EXISTS idx_payments_status
  ON payments(status);

-- 見積: 承認依頼中に限定したPartialインデックス（承認一覧のフルスキャン回避）
CREATE INDEX IF NOT EXISTS idx_quotations_approval_pending
  ON quotations(status) WHERE status = '承認依頼中';

-- 請求: 顧客ID + statusの複合インデックス（締日別請求対象抽出 listInvoiceCandidates）
CREATE INDEX IF NOT EXISTS idx_invoices_customer
  ON invoices(customer_id, status);

-- 支払依頼: 仕入先ID + statusの複合インデックス（仕入先別支払一覧フィルタ）
CREATE INDEX IF NOT EXISTS idx_payments_supplier
  ON payments(supplier_id, status);

COMMIT;
