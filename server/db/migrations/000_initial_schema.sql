-- PG-02: PostgreSQL ベースラインスキーマ
-- 空の DB から全テーブルを再現するためのベースライン migration
-- 冪等実行のため全テーブルを IF NOT EXISTS で作成

BEGIN;

-- ─────────────────────────────────────────────
-- 独立テーブル（外部キー参照なし）
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id                 VARCHAR(50)              PRIMARY KEY,
  name               VARCHAR(100)             NOT NULL,
  password_hash      VARCHAR(255)             NOT NULL,
  user_type          VARCHAR(50)              NOT NULL,
  department         VARCHAR(100),
  position           VARCHAR(100),
  status             VARCHAR(20)              NOT NULL DEFAULT '有効',
  failed_login_count INTEGER                  NOT NULL DEFAULT 0,
  locked_until       TIMESTAMP WITH TIME ZONE,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  code         VARCHAR(20)              PRIMARY KEY,
  name         VARCHAR(100)             NOT NULL,
  department   VARCHAR(100),
  contact      VARCHAR(100),
  closing_day  VARCHAR(10),
  payment_site VARCHAR(20),
  billing_to   VARCHAR(100),
  status       VARCHAR(20)              NOT NULL DEFAULT '有効',
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  code         VARCHAR(20)              PRIMARY KEY,
  name         VARCHAR(100)             NOT NULL,
  contact      VARCHAR(100),
  payment_site VARCHAR(20),
  status       VARCHAR(20)              NOT NULL DEFAULT '有効',
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  code       VARCHAR(20)              PRIMARY KEY,
  name       VARCHAR(100)             NOT NULL,
  unit       VARCHAR(20),
  unit_price NUMERIC(12, 2),
  tax        NUMERIC(5, 2),
  status     VARCHAR(20)              NOT NULL DEFAULT '有効',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- users に依存するテーブル
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         TEXT                     PRIMARY KEY,
  user_id    VARCHAR(50)              NOT NULL REFERENCES users(id),
  token_hash VARCHAR(255)             NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked    BOOLEAN                  NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_routes (
  id               SERIAL                   PRIMARY KEY,
  document_type    VARCHAR(50)              NOT NULL,
  step_number      INTEGER                  NOT NULL,
  approver_user_id VARCHAR(50)              REFERENCES users(id),
  is_active        BOOLEAN                  NOT NULL DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ドキュメント系テーブル（独立 or customers/suppliers に依存）
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  code        VARCHAR(20)              PRIMARY KEY,
  name        VARCHAR(200)             NOT NULL,
  customer_id VARCHAR(20),
  department  VARCHAR(100),
  status      VARCHAR(20)              NOT NULL DEFAULT '進行中',
  start_date  VARCHAR(10),
  due_date    VARCHAR(10),
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotations (
  code             VARCHAR(20)              PRIMARY KEY,
  project_code     VARCHAR(20),
  customer_id      VARCHAR(20),
  title            VARCHAR(200)             NOT NULL,
  issue_date       VARCHAR(10),
  validity_date    VARCHAR(10),
  version          INTEGER                  NOT NULL DEFAULT 1,
  status           VARCHAR(20)              NOT NULL DEFAULT '下書き',
  notes            TEXT,
  subtotal         NUMERIC(14, 2)           DEFAULT '0',
  tax_amount       NUMERIC(14, 2)           DEFAULT '0',
  total            NUMERIC(14, 2)           DEFAULT '0',
  approval_comment TEXT,
  reject_reason    TEXT,
  submitted_by     VARCHAR(50),
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  code             VARCHAR(20)              PRIMARY KEY,
  quotation_code   VARCHAR(20),
  project_code     VARCHAR(20),
  customer_id      VARCHAR(20),
  title            VARCHAR(200)             NOT NULL,
  order_date       VARCHAR(10),
  delivery_date    VARCHAR(10),
  status           VARCHAR(20)              NOT NULL DEFAULT '受注済み',
  subtotal         NUMERIC(14, 2)           DEFAULT '0',
  tax_amount       NUMERIC(14, 2)           DEFAULT '0',
  total            NUMERIC(14, 2)           DEFAULT '0',
  notes            TEXT,
  billing_target   BOOLEAN                  NOT NULL DEFAULT false,
  paid_amount      NUMERIC(14, 2)           DEFAULT '0',
  approval_comment TEXT,
  reject_reason    TEXT,
  submitted_by     VARCHAR(50),
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  code             VARCHAR(20)              PRIMARY KEY,
  order_code       VARCHAR(20),
  supplier_id      VARCHAR(20),
  title            VARCHAR(200)             NOT NULL,
  order_date       VARCHAR(10),
  delivery_date    VARCHAR(10),
  status           VARCHAR(20)              NOT NULL DEFAULT '下書き',
  subtotal         NUMERIC(14, 2)           DEFAULT '0',
  tax_amount       NUMERIC(14, 2)           DEFAULT '0',
  total            NUMERIC(14, 2)           DEFAULT '0',
  notes            TEXT,
  approval_comment TEXT,
  reject_reason    TEXT,
  submitted_by     VARCHAR(50),
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  code             VARCHAR(20)              PRIMARY KEY,
  order_code       VARCHAR(20),
  customer_id      VARCHAR(20),
  title            VARCHAR(200)             NOT NULL,
  invoice_date     VARCHAR(10),
  due_date         VARCHAR(10),
  status           VARCHAR(20)              NOT NULL DEFAULT '下書き',
  subtotal         NUMERIC(14, 2)           DEFAULT '0',
  tax_amount       NUMERIC(14, 2)           DEFAULT '0',
  total            NUMERIC(14, 2)           DEFAULT '0',
  notes            TEXT,
  approval_comment TEXT,
  reject_reason    TEXT,
  submitted_by     VARCHAR(50),
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipts (
  code         VARCHAR(20)              PRIMARY KEY,
  invoice_code VARCHAR(20),
  receipt_date VARCHAR(10),
  amount       NUMERIC(14, 2)           DEFAULT '0',
  fee          NUMERIC(14, 2)           DEFAULT '0',
  status       VARCHAR(20)              NOT NULL DEFAULT '未消込',
  notes        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  code               VARCHAR(20)              PRIMARY KEY,
  purchase_order_code VARCHAR(20),
  supplier_id        VARCHAR(20),
  title              VARCHAR(200)             NOT NULL,
  payment_date       VARCHAR(10),
  amount             NUMERIC(14, 2)           DEFAULT '0',
  status             VARCHAR(20)              NOT NULL DEFAULT '下書き',
  notes              TEXT,
  approval_comment   TEXT,
  reject_reason      TEXT,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 詳細テーブル（親ドキュメントに依存）
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quotation_details (
  id             SERIAL         PRIMARY KEY,
  quotation_code VARCHAR(20)    NOT NULL REFERENCES quotations(code),
  line_no        INTEGER        NOT NULL,
  product_code   VARCHAR(20),
  product_name   VARCHAR(200),
  quantity       NUMERIC(10, 2) DEFAULT '0',
  unit           VARCHAR(20),
  unit_price     NUMERIC(12, 2) DEFAULT '0',
  discount       NUMERIC(12, 2) DEFAULT '0',
  tax_rate       NUMERIC(5, 4)  DEFAULT '0.1000',
  amount         NUMERIC(14, 2) DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS order_details (
  id           SERIAL         PRIMARY KEY,
  order_code   VARCHAR(20)    NOT NULL REFERENCES orders(code),
  line_no      INTEGER        NOT NULL,
  product_code VARCHAR(20),
  product_name VARCHAR(200),
  quantity     NUMERIC(10, 2) DEFAULT '0',
  unit         VARCHAR(20),
  unit_price   NUMERIC(12, 2) DEFAULT '0',
  discount     NUMERIC(12, 2) DEFAULT '0',
  tax_rate     NUMERIC(5, 4)  DEFAULT '0.1000',
  amount       NUMERIC(14, 2) DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS order_attachments (
  id          SERIAL                   PRIMARY KEY,
  order_code  VARCHAR(20)              NOT NULL REFERENCES orders(code),
  file_name   VARCHAR(255)             NOT NULL,
  file_size   INTEGER,
  file_type   VARCHAR(100),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_details (
  id                  SERIAL         PRIMARY KEY,
  purchase_order_code VARCHAR(20)    NOT NULL REFERENCES purchase_orders(code),
  line_no             INTEGER        NOT NULL,
  product_code        VARCHAR(20),
  product_name        VARCHAR(200),
  quantity            NUMERIC(10, 2) DEFAULT '0',
  unit                VARCHAR(20),
  unit_price          NUMERIC(12, 2) DEFAULT '0',
  discount            NUMERIC(12, 2) DEFAULT '0',
  tax_rate            NUMERIC(5, 4)  DEFAULT '0.1000',
  amount              NUMERIC(14, 2) DEFAULT '0'
);

CREATE TABLE IF NOT EXISTS invoice_details (
  id           SERIAL         PRIMARY KEY,
  invoice_code VARCHAR(20)    NOT NULL REFERENCES invoices(code),
  line_no      INTEGER        NOT NULL,
  product_code VARCHAR(20),
  product_name VARCHAR(200),
  quantity     NUMERIC(10, 2) DEFAULT '0',
  unit         VARCHAR(20),
  unit_price   NUMERIC(12, 2) DEFAULT '0',
  discount     NUMERIC(12, 2) DEFAULT '0',
  tax_rate     NUMERIC(5, 4)  DEFAULT '0.1000',
  amount       NUMERIC(14, 2) DEFAULT '0'
);

-- ─────────────────────────────────────────────
-- 監査・通知・配送・採番テーブル
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS approval_history (
  id            UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type VARCHAR(50)              NOT NULL,
  document_id   VARCHAR(100)             NOT NULL,
  step_number   INTEGER                  NOT NULL,
  actor_user_id VARCHAR(50),
  actor_name    VARCHAR(100),
  action        VARCHAR(20)              NOT NULL,
  comment       TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id           UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  type         VARCHAR(10)              NOT NULL,
  recipient_id VARCHAR(50)              NOT NULL,
  doc_type     VARCHAR(50),
  doc_code     VARCHAR(50),
  message      TEXT                     NOT NULL,
  is_read      BOOLEAN                  NOT NULL DEFAULT false,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          SERIAL                   PRIMARY KEY,
  user_id     VARCHAR(50),
  user_name   VARCHAR(100),
  action      VARCHAR(50)              NOT NULL,
  entity_type VARCHAR(50),
  entity_id   VARCHAR(100),
  before_data TEXT,
  after_data  TEXT,
  ip_address  VARCHAR(64),
  user_agent  TEXT,
  result      VARCHAR(20)              NOT NULL DEFAULT 'SUCCESS',
  error_detail TEXT,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
  code                VARCHAR(20)              PRIMARY KEY,
  purchase_order_code VARCHAR(20),
  delivery_date       VARCHAR(10),
  notes               TEXT,
  status              VARCHAR(20)              NOT NULL DEFAULT '検収待ち',
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sequence_counters (
  entity_type VARCHAR(50) PRIMARY KEY,
  current_val INTEGER     NOT NULL DEFAULT 0
);

COMMIT;
