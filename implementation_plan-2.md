# 取引管理システム 第2期実装計画

## 1. 現状評価

### 1.1 実装済み機能（フロントエンド）

| 画面 | タグ | 状態 | 主要機能 |
|------|------|------|---------|
| ログイン | S-01 | ✅ 完了 | 認証・セッション管理 |
| ダッシュボード | S-02 | ✅ 完了 | KPI表示・集計 |
| 案件一覧・詳細 | S-03 | ✅ 完了 | CRUD・関連伝票表示 |
| 見積一覧・登録・詳細 | S-04 | ✅ 完了 | 作成・改版・承認依頼・印刷 |
| 受注一覧・詳細 | S-05 | ✅ 完了 | 見積引継ぎ・添付・発注起票 |
| 発注一覧・登録・詳細 | S-06 | ✅ 完了 | 承認・納品・支払連携 |
| 納品・検収登録 | S-07 | ⚠️ 部分 | S-06に内包、独立画面なし |
| 請求一覧・登録・詳細 | S-08 | ✅ 完了 | 確定・送付・印刷 |
| 入金登録 | S-09 | ✅ 完了 | 消込・残高管理 |
| 支払依頼・支払登録 | S-10 | ✅ 完了 | 承認・支払実績 |
| マスタ管理 | S-11 | ✅ 完了 | 顧客・仕入先・商品・ユーザ |
| 承認一覧 | S-12 | ✅ 完了 | 承認・差戻し・却下 |
| レポート | S-13 | ✅ 完了 | 月別・顧客別・案件別集計 |
| 通知一覧 | S-14 | ⚠️ 最小 | 画面のみ、ロジック未実装 |
| システム設定 | S-15 | ⚠️ 部分 | 会社情報・決算月のみ |

### 1.2 技術スタック（現状）

```
フロントエンド: Vanilla JavaScript (ES Modules) + HTML + CSS
データ保存:    app.js 内のインメモリ配列（ページ再読み込みで消滅）
認証:          localStorage セッション + ハードコード済みユーザ3名
バックエンド:  なし
データベース:  なし
監査ログ:      なし
```

### 1.3 現状の根本的な問題

| 問題 | 影響 |
|------|------|
| データが永続化されない | ページ再読み込みで全データが消える |
| ユーザがソースコードに埋め込まれている | ユーザ追加・変更ができない |
| セッションが localStorage | XSS攻撃でセッション奪取可能 |
| パスワードが平文 | セキュリティ上致命的 |
| 操作ログが存在しない | 誰が何をしたか追跡不能 |
| APIなし | 外部システム連携不可 |

---

## 2. 第2期で実装するもの

第2期では、フロントエンドの機能完成度を維持しつつ、**本番運用に耐える基盤**を整備する。

### 2.1 必須実装項目

1. **バックエンドAPI（REST）**
2. **データベース（永続化）**
3. **認証基盤の刷新（JWTによるセキュアなセッション）**
4. **操作ログ・監査証跡**
5. **フロントエンドのAPI統合（インメモリデータ→API呼び出しへ移行）**

### 2.2 フロントエンド未実装項目（追加）

6. S-07 納品・検収の独立画面化
7. S-14 通知ロジックの実装
8. S-15 承認条件設定UIの実装

---

## 3. アーキテクチャ設計

### 3.1 全体構成

```
┌─────────────────────────────────────────────────────────┐
│                     クライアント                         │
│  Vanilla JS SPA (app.js)                                │
│  ・既存の画面ロジックはそのまま維持                       │
│  ・fetch() によるAPI呼び出しに置き換え                   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS / REST API (JSON)
┌────────────────────▼────────────────────────────────────┐
│                  バックエンドAPI                          │
│  Node.js + Hono                                         │
│  ・ルーティング                                          │
│  ・認証ミドルウェア（JWT検証）                           │
│  ・権限チェックミドルウェア                              │
│  ・監査ログミドルウェア                                  │
│  ├── controllers/   （リクエスト・レスポンス処理）        │
│  ├── services/      （src/ の業務ロジック、そのまま再利用）│
│  └── repositories/ （DBアクセス層）                     │
└────────────────────┬────────────────────────────────────┘
                     │ SQL (Drizzle ORM)
┌────────────────────▼────────────────────────────────────┐
│                  データベース                             │
│  PostgreSQL（実装時点のActive LTS / マネージドDB標準版）   │
│  ・業務データ（顧客・案件・伝票 等）                      │
│  ・ユーザ・権限                                          │
│  ・監査ログ（audit_logs テーブル）                        │
└─────────────────────────────────────────────────────────┘
```

### 3.2 設計方針

- **API優先**: フロントエンドはAPIを唯一のデータソースとする。app.js のインメモリ配列を段階的にAPI呼び出しへ置き換える
- **既存ロジックの再利用**: `src/` 以下の純粋関数（バリデーション・計算ロジック）はサービス層でそのまま再利用する
- **TDD継続**: バックエンドもユニットテストファーストで実装する（Vitest）
- **段階的移行**: フロントエンドは画面単位でAPIに切り替え、全体を一括移行しない

---

## 4. 採用技術

### 4.1 バックエンド

| カテゴリ | 採用技術 | 選定理由 |
|---------|---------|---------|
| ランタイム | **Node.js（実装時点のActive LTS）** | チームが既にJS習熟。Vite/Vitestと同一エコシステム。2026-05時点はNode.js 24がActive LTS（Node.js 22はMaintenance LTSに移行済み） |
| Webフレームワーク | **Fastify v5** | 高速・型安全・公式プラグイン完備。詳細は§15参照 |
| ORM | **Drizzle ORM** | 型安全なSQLビルダー。マイグレーション管理が簡潔 |
| バリデーション | **Zod** | スキーマ定義とバリデーションを一元化。フロントとも共有可能 |
| パスワードハッシュ | **bcrypt** | 業界標準のコスト関数 |
| JWT | **@fastify/jwt** | Fastify公式。httpOnlyクッキー連携が組み込み済み |
| ファイルアップロード | **@fastify/multipart** | Fastify公式。受注添付ファイル（契約書・注文書）対応 |
| セキュリティ | **@fastify/helmet / @fastify/rate-limit / @fastify/cors** | 全て公式プラグイン。P8セキュリティ要件を個別設定なしで充足 |
| テスト | **Vitest** | 既存と統一 |
| APIテスト | **supertest** | HTTPテスト |

### 4.2 データベース

| カテゴリ | 採用技術 | 選定理由 |
|---------|---------|---------|
| RDBMS | **PostgreSQL（実装時点のActive LTS / マネージドDB標準版）** | 業務システムの標準。JSONB対応（監査ログのbefore/after保存に活用）。2026-05時点は16系が実績あり・18系も登場済み。実装開始時点の安定最新版を採用する |
| ローカル開発 | **Docker Compose** | 環境再現性の確保 |
| マイグレーション | **Drizzle Kit** | ORM付属。スキーマ変更を安全に管理 |

### 4.3 認証・セキュリティ

| カテゴリ | 採用技術 | 選定理由 |
|---------|---------|---------|
| 認証方式 | **JWT（アクセストークン＋リフレッシュトークン）** | ステートレス。スケール容易 |
| トークン格納 | **httpOnly Cookie** | XSSによるトークン窃取を防止（localStorage廃止） |
| Cookie属性 | **SameSite=Strict; Secure; HttpOnly** | SameSite=StrictによりクロスサイトリクエストでCookieを送信しない。CSRF対策の第1ライン |
| CSRF対策 | **@fastify/csrf-protection**（二重送信Cookieパターン） | httpOnly CookieはブラウザがXSS不可でも自動送信するためCSRF攻撃が成立しうる。状態変更を伴う全エンドポイント（POST/PUT/DELETE）にCSRFトークン検証を追加することで多層防御とする |
| アクセストークン有効期限 | 15分 | 漏洩時の被害を最小化 |
| リフレッシュトークン有効期限 | 7日 | 使いやすさとのバランス |
| CORS | オリジン制限 | 開発: localhost のみ、本番: 自ドメインのみ |

### 4.4 インフラ（参考）

| カテゴリ | 選択肢 | 備考 |
|---------|--------|------|
| ホスティング | Railway / Render / AWS ECS | 小規模ならRailwayが最速 |
| DBホスティング | Railway PostgreSQL / Neon / AWS RDS | Neonはサーバーレスで低コスト |
| ファイルストレージ | Cloudflare R2 / AWS S3 | 添付ファイル用（将来拡張） |

---

## 5. データベーススキーマ

### 5.1 ユーザ・認証

```sql
-- ユーザマスタ
CREATE TABLE users (
  id          VARCHAR(50) PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type   VARCHAR(50) NOT NULL,
  department  VARCHAR(100),
  position    VARCHAR(100),
  status      VARCHAR(20) NOT NULL DEFAULT '有効',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 権限マスタ
CREATE TABLE permissions (
  id   SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL  -- 例: "quotation:edit"
);

-- ユーザ権限（多対多）
CREATE TABLE user_permissions (
  user_id       VARCHAR(50) REFERENCES users(id),
  permission_id INTEGER     REFERENCES permissions(id),
  PRIMARY KEY (user_id, permission_id)
);

-- リフレッシュトークン管理
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    VARCHAR(50) REFERENCES users(id),
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.2 マスタデータ

```sql
-- 顧客マスタ
CREATE TABLE customers (
  code          VARCHAR(20) PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  department    VARCHAR(100),
  contact       VARCHAR(100),
  closing_day   VARCHAR(20),
  payment_site  VARCHAR(50),
  billing_to    VARCHAR(200),
  status        VARCHAR(20) NOT NULL DEFAULT '有効',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 仕入先マスタ
CREATE TABLE suppliers (
  code         VARCHAR(20) PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  contact      VARCHAR(100),
  payment_site VARCHAR(50),
  status       VARCHAR(20) NOT NULL DEFAULT '有効',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 商品マスタ
CREATE TABLE products (
  code        VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  unit        VARCHAR(20),
  unit_price  NUMERIC(15,2),
  tax         NUMERIC(5,4),  -- 0.10, 0.08, 0.00
  status      VARCHAR(20) NOT NULL DEFAULT '有効',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.3 取引伝票

```sql
-- 案件
CREATE TABLE projects (
  code        VARCHAR(20) PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  customer_id VARCHAR(20) REFERENCES customers(code),
  department  VARCHAR(100),
  status      VARCHAR(30) NOT NULL DEFAULT '商談中',
  start_date  DATE,
  due_date    DATE,
  description TEXT,
  created_by  VARCHAR(50) REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 見積ヘッダ
CREATE TABLE quotations (
  code           VARCHAR(20) PRIMARY KEY,
  project_code   VARCHAR(20) REFERENCES projects(code),
  customer_id    VARCHAR(20) REFERENCES customers(code),
  title          VARCHAR(200),
  issue_date     DATE,
  validity_date  DATE,
  version        INTEGER NOT NULL DEFAULT 1,
  status         VARCHAR(30) NOT NULL DEFAULT '下書き',
  subtotal       NUMERIC(15,2),
  tax_amount     NUMERIC(15,2),
  total          NUMERIC(15,2),
  notes          TEXT,
  reject_reason  TEXT,
  created_by     VARCHAR(50) REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 見積明細
CREATE TABLE quotation_details (
  id           SERIAL PRIMARY KEY,
  quotation_code VARCHAR(20) REFERENCES quotations(code),
  line_no      INTEGER NOT NULL,
  product_name VARCHAR(200),
  quantity     NUMERIC(10,3),
  unit         VARCHAR(20),
  unit_price   NUMERIC(15,2),
  discount     NUMERIC(15,2) DEFAULT 0,
  tax_rate     NUMERIC(5,4),
  amount       NUMERIC(15,2)
);

-- 受注（同様のパターンで orders, purchase_orders, invoices, receipts, payments テーブルを定義）
CREATE TABLE orders (
  code             VARCHAR(20) PRIMARY KEY,
  quotation_code   VARCHAR(20) REFERENCES quotations(code),
  project_code     VARCHAR(20) REFERENCES projects(code),
  customer_id      VARCHAR(20) REFERENCES customers(code),
  title            VARCHAR(200),
  order_date       DATE,
  delivery_date    DATE,
  status           VARCHAR(30) NOT NULL DEFAULT '受注確定',
  subtotal         NUMERIC(15,2),
  tax_amount       NUMERIC(15,2),
  total            NUMERIC(15,2),
  billing_target   BOOLEAN NOT NULL DEFAULT false,
  notes            TEXT,
  created_by       VARCHAR(50) REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ※ purchase_orders, invoices, receipts, payments, deliveries は同様のパターンで定義
```

### 5.4 システム設定

```sql
-- システム設定（KVストア方式）
CREATE TABLE system_settings (
  key        VARCHAR(100) PRIMARY KEY,  -- 例: "companyName", "fiscalEndMonth"
  value      TEXT,
  updated_by VARCHAR(50) REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.5 監査ログ（重要）

```sql
-- 操作ログ・監査証跡
CREATE TABLE audit_logs (
  id           BIGSERIAL PRIMARY KEY,
  user_id      VARCHAR(50),               -- 操作者（外部キーなし：削除ユーザのログも保持）
  user_name    VARCHAR(100),              -- 操作時点のユーザ名（変更に影響されない）
  action       VARCHAR(50) NOT NULL,      -- CREATE / UPDATE / DELETE / LOGIN / LOGOUT / PRINT
  entity_type  VARCHAR(50),              -- 例: "quotation", "invoice", "user"
  entity_id    VARCHAR(100),             -- 対象レコードのID
  before_data  JSONB,                    -- 変更前データ（UPDATEとDELETEのみ）
  after_data   JSONB,                    -- 変更後データ（CREATEとUPDATEのみ）
  ip_address   INET,                     -- クライアントIPアドレス
  user_agent   TEXT,                     -- ブラウザ情報
  result       VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS / FAILURE
  error_detail TEXT,                    -- 失敗時のエラー詳細
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 検索用インデックス
CREATE INDEX idx_audit_logs_user_id     ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at  ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action      ON audit_logs(action);
```

---

## 6. API設計

### 6.1 エンドポイント一覧

```
【認証】
POST   /api/auth/login           ログイン
POST   /api/auth/logout          ログアウト
POST   /api/auth/refresh         アクセストークン更新

【マスタ】
GET    /api/customers            顧客一覧
POST   /api/customers            顧客登録
GET    /api/customers/:code      顧客詳細
PUT    /api/customers/:code      顧客更新

GET    /api/suppliers            仕入先一覧
POST   /api/suppliers            仕入先登録
PUT    /api/suppliers/:code      仕入先更新

GET    /api/products             商品一覧
POST   /api/products             商品登録
PUT    /api/products/:code       商品更新

GET    /api/users                ユーザ一覧
POST   /api/users                ユーザ登録
PUT    /api/users/:id            ユーザ更新

【業務伝票】
GET    /api/projects             案件一覧
POST   /api/projects             案件登録
GET    /api/projects/:code       案件詳細
PUT    /api/projects/:code       案件更新

GET    /api/quotations           見積一覧
POST   /api/quotations           見積登録
GET    /api/quotations/:code     見積詳細
PUT    /api/quotations/:code     見積更新
POST   /api/quotations/:code/revise     改版
POST   /api/quotations/:code/approve   承認依頼

GET    /api/orders               受注一覧
POST   /api/orders               受注登録（見積から）
GET    /api/orders/:code         受注詳細
PUT    /api/orders/:code/billing-target 請求対象化

GET    /api/purchase-orders      発注一覧
POST   /api/purchase-orders      発注登録
GET    /api/purchase-orders/:code 発注詳細
POST   /api/purchase-orders/:code/approve  承認依頼

GET    /api/invoices             請求一覧
POST   /api/invoices             請求登録
GET    /api/invoices/:code       請求詳細
POST   /api/invoices/:code/confirm     確定
POST   /api/invoices/:code/send        送付済

GET    /api/receipts             入金一覧
POST   /api/receipts             入金登録

GET    /api/payments             支払一覧
POST   /api/payments             支払依頼登録
POST   /api/payments/:code/approve    支払承認
POST   /api/payments/:code/register   支払実績登録

【承認・通知】
GET    /api/approvals            承認待ち一覧
POST   /api/approvals/:id/approve     承認
POST   /api/approvals/:id/reject      差戻し

GET    /api/notifications        通知一覧
PUT    /api/notifications/:id/read    既読化

【レポート】
GET    /api/reports/sales-summary     売上集計
GET    /api/reports/by-customer       顧客別集計
GET    /api/reports/by-project        案件別集計
GET    /api/reports/uncollected       未収一覧
GET    /api/reports/unpaid            未払一覧

【設定】
GET    /api/settings             設定取得
PUT    /api/settings             設定保存

【監査ログ（管理者のみ）】
GET    /api/audit-logs           監査ログ一覧
```

### 6.2 レスポンス形式（統一）

```json
// 成功時
{
  "data": { ... },
  "meta": { "total": 100, "page": 1, "pageSize": 20 }
}

// エラー時
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "会社名は必須です。",
    "details": { "companyName": "会社名は必須です。" }
  }
}
```

---

## 7. 操作ログ・監査証跡 設計

### 7.1 記録対象操作

| 分類 | 操作 | action値 |
|------|------|---------|
| 認証 | ログイン成功 | `LOGIN` |
| 認証 | ログイン失敗 | `LOGIN_FAILED` |
| 認証 | ログアウト | `LOGOUT` |
| データ | 新規作成 | `CREATE` |
| データ | 更新 | `UPDATE` |
| データ | 削除・無効化 | `DELETE` |
| ワークフロー | 承認依頼 | `SUBMIT_APPROVAL` |
| ワークフロー | 承認 | `APPROVE` |
| ワークフロー | 差戻し | `REJECT` |
| ワークフロー | 却下 | `DECLINE` |
| 出力 | 帳票印刷 | `PRINT` |
| 出力 | CSVエクスポート | `EXPORT` |

### 7.2 実装方式

**Fastify hookによる自動記録**（推奨）

Fastifyの `preHandler` / `onSend` の2段hookで、ルート実装を一切汚さずにbefore/afterを取得できる。

```typescript
// server/plugins/auditLog.ts
import fp from 'fastify-plugin';
import { db } from '../db/client';
import { auditLogs } from '../db/schema';

export const auditLogPlugin = fp(async (fastify) => {

  // ① 変更前データをhandler実行前に取得
  fastify.addHook('preHandler', async (request, _reply) => {
    const method = request.method;
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;

    let beforeData: unknown = null;
    if (['PUT', 'PATCH', 'DELETE'].includes(method)) {
      // routeに設定したfetchEntityFnを呼び出す（各routeがrouteContextにセット）
      const fetchFn = request.routeOptions.config?.fetchEntity;
      if (fetchFn) beforeData = await fetchFn(request);
    }

    request.auditContext = {
      userId:     request.user?.id,
      userName:   request.user?.name,
      action:     methodToAction(method),
      entityType: request.routeOptions.config?.entityType,
      beforeData,
      ipAddress:  request.headers['x-forwarded-for']?.toString() ?? request.ip,
      userAgent:  request.headers['user-agent'],
      startedAt:  Date.now(),
    };
  });

  // ② handler実行後・レスポンス送信直前に変更後データを記録
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (!request.auditContext) return payload;

    const isSuccess = reply.statusCode < 400;
    const afterData  = isSuccess ? JSON.parse(payload as string) : null;

    await db.insert(auditLogs).values({
      ...request.auditContext,
      entityId:    reply.getHeader('x-entity-id')?.toString() ?? null,
      afterData,
      result:      isSuccess ? 'SUCCESS' : 'FAILURE',
      errorDetail: isSuccess ? null : (payload as string),
      createdAt:   new Date(),
    });

    return payload;  // payloadは変更しない
  });
});
```

各routeでは `config` に `entityType` と `fetchEntity` を宣言するだけでよい:

```typescript
// server/routes/quotations.ts（例）
fastify.put('/:code', {
  config: {
    entityType: 'quotation',
    fetchEntity: (req) => quotationRepository.findByCode(req.params.code),
  },
  handler: async (request, reply) => {
    const updated = await quotationService.update(request.params.code, request.body);
    reply.header('x-entity-id', updated.code);
    return updated;
  },
});
```

### 7.3 監査ログ閲覧UI（S-15拡張）

システム設定画面に「監査ログ」タブを追加する。

- 日付範囲・操作者・操作種別・対象エンティティでフィルタ
- 変更前後データをJSON差分表示
- CSV出力
- ログの改ざん不可（DELETE権限なし、RLSで保護）

---

## 8. フェーズ別実装計画

### フェーズ P1：バックエンド基盤

**目標**: API + DB接続 + 認証が動くミニマル構成

```
server/
├── index.ts           # エントリーポイント（Hono app）
├── db/
│   ├── schema.ts      # Drizzle スキーマ定義（全テーブル）
│   ├── client.ts      # DB接続
│   └── migrate.ts     # マイグレーション実行
├── middleware/
│   ├── auth.ts        # JWT検証
│   ├── permission.ts  # 権限チェック
│   └── auditLog.ts    # 監査ログ記録
├── routes/
│   └── auth.ts        # /api/auth/*
└── repositories/
    └── userRepository.ts
```

**確認ポイント**:
- `POST /api/auth/login` でJWTが発行されるか
- httpOnly Cookie に `SameSite=Strict; Secure; HttpOnly` 属性が正しく付与されるか
- `GET /api/auth/me` で認証済みユーザが返るか
- `POST /api/auth/login` 以外の状態変更エンドポイントでCSRFトークン検証が機能するか

**TDDの進め方**:
1. スキーマ定義とマイグレーション
2. userRepository のユニットテスト
3. auth ルートの統合テスト（supertest）
4. フロントのログイン処理をAPI呼び出しに切り替え

---

### フェーズ P2：マスタデータAPI

**目標**: 顧客・仕入先・商品・ユーザのCRUDをAPIへ移行

- GET/POST/PUT エンドポイント実装
- Zod によるリクエストバリデーション
- 既存の `src/customer.js` 等のロジックをサービス層で再利用
- フロントエンド: インメモリ配列の参照を `fetch('/api/customers')` に切り替え

**確認ポイント**:
- データがDB保存され、ページ再読み込み後も保持されるか
- バリデーションエラーがフロントに正しく表示されるか

---

### フェーズ P3：業務伝票API（案件・見積・受注）

**目標**: 業務中核フロー（見積→受注）のAPI化

- projects, quotations, orders テーブル + API
- 見積明細の追加・削除・更新（トランザクション）
- 改版・ステータス遷移のAPI
- フロントエンドの該当画面をAPI呼び出しに切り替え

---

### フェーズ P4：業務伝票API（発注・請求・支払）

**目標**: バックオフィス業務フローのAPI化

- purchase_orders, invoices, receipts, payments テーブル + API
- 承認ワークフロー連携
- 帳票印刷時の会社情報はAPI経由で取得

---

### フェーズ P5：承認・通知API

**目標**: ワークフロー基盤のAPI化

- approvals, notifications テーブル
- `GET /api/approvals` の実データ連携
- 承認操作時に通知レコードを自動生成
- 通知の既読管理

---

### フェーズ P6：監査ログ実装

**目標**: 全ミューテーション操作の自動記録

- P1〜P5 実装済みのAPIに監査ログミドルウェアを適用
- ログイン成功・失敗も記録
- S-15 にログ閲覧タブを追加
- ログのCSV出力

---

### フェーズ P7：フロントエンド未実装機能の補完

**目標**: 要件定義に記載された未実装機能を完成させる

1. **S-07 独立化**: 納品・検収の一覧画面を独立したナビゲーション項目として追加
2. **S-14 通知ロジック**: 承認依頼・差戻し・期限超過を通知データとして自動生成
3. **S-15 承認条件設定**: 見積・発注の承認条件（金額しきい値、承認者）をUIから設定可能にする

---

### フェーズ P8：セキュリティ強化・本番対応

**目標**: 本番環境へのデプロイに向けた最終整備

- HTTPS強制（本番環境）
- CORSポリシー設定
- CSRF対策確認（Cookie属性 `SameSite=Strict; Secure; HttpOnly` + `@fastify/csrf-protection` によるトークン検証が全POST/PUT/DELETEで機能すること）
- レートリミット（`@fastify/rate-limit`）
- SQLインジェクション対策確認（Drizzle ORMが自動対応）
- セキュリティヘッダ（`@fastify/helmet`）
- パスワードポリシー（最小長・複雑性）
- リフレッシュトークンのローテーション
- 環境変数管理（`.env` + dotenv）

---

## 9. ディレクトリ構成（目標）

```
20260419_transaction/
├── app.js              # フロントエンド（順次API化）
├── index.html
├── styles.css
├── src/                # 業務ロジック純粋関数（サーバ側でも再利用）
│   ├── customer.js
│   ├── quotation.js
│   └── ...
├── server/             # ← 新規作成
│   ├── index.ts        # Hono app エントリーポイント
│   ├── db/
│   │   ├── schema.ts   # Drizzle スキーマ
│   │   ├── client.ts   # DB接続インスタンス
│   │   └── migrations/ # マイグレーションファイル
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── permission.ts
│   │   └── auditLog.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── customers.ts
│   │   ├── quotations.ts
│   │   └── ...
│   ├── repositories/
│   │   ├── userRepository.ts
│   │   ├── customerRepository.ts
│   │   └── ...
│   └── services/       # src/ の関数をラップし副作用を追加
│       ├── quotationService.ts
│       └── ...
├── server.test/        # バックエンドテスト（Vitest + supertest）
│   ├── auth.test.ts
│   ├── customers.test.ts
│   └── ...
├── e2e/                # 既存E2Eテスト（APIバックエンド後も継続）
├── docker-compose.yml  # ← 新規作成（PostgreSQL + Node.js）
├── package.json        # server側依存関係を追加
└── .env.example        # 環境変数テンプレート
```

---

## 10. 移行戦略

### 10.1 フロントエンドのAPI化ガイドライン

現在 app.js のインメモリ配列を直接参照している部分は、以下のパターンで段階的にAPIへ移行する。

**移行前（インメモリ）:**
```javascript
// app.js
const customers = [{ code: "CUS-001", name: "..." }, ...];
```

**移行後（API）:**
```javascript
// app.js
async function fetchCustomers() {
  const res = await fetch('/api/customers', {
    credentials: 'include'  // httpOnlyクッキー送信
  });
  return await res.json();
}
```

### 10.2 段階的切り替えの原則

1. バックエンドAPIを実装する（フロントは既存のまま）
2. バックエンドのテストが通ることを確認する
3. フロントの1つの画面をAPI呼び出しに切り替える
4. E2Eテストが通ることを確認する
5. 次の画面へ進む

---

## 11. 優先度と工数目安

| フェーズ | 内容 | 優先度 | 目安工数 |
|---------|------|--------|---------|
| P1 | バックエンド基盤・認証 | ★★★ 最高 | 3〜4日 |
| P2 | マスタデータAPI | ★★★ 最高 | 3〜4日 |
| P3 | 案件・見積・受注API | ★★★ 最高 | 4〜5日 |
| P4 | 発注・請求・支払API | ★★★ 最高 | 4〜5日 |
| P5 | 承認・通知API | ★★☆ 高 | 3〜4日 |
| P6 | 監査ログ | ★★☆ 高 | 2〜3日 |
| P7 | フロント未実装補完 | ★★☆ 高 | 3〜4日 |
| P8 | セキュリティ・本番対応 | ★★★ 最高 | 2〜3日 |
| **合計** | | | **約24〜32日** |

---

## 12. 次の1ステップ（即実行可能）

第2期の最初の実装対象は **フェーズP1** とし、以下の順序で着手する。

```
1. docker-compose.yml を作成（PostgreSQL起動）
2. package.json に Fastify, Drizzle, Zod, @fastify/jwt, @fastify/csrf-protection, bcrypt を追加（§15.4参照）
3. server/db/schema.ts にユーザ・権限テーブルを定義
4. マイグレーション実行・サンプルデータ投入
5. POST /api/auth/login を TDD で実装
6. フロントのログイン処理をAPI呼び出しに切り替え
7. E2Eテストが通ることを確認
```

---

## 13. 要件変更による追加実装事項

`code-review/discussion-minutes-2026-05-05.md`（2026-05-05 議事録）および `code-review/workflow-requirements-review-2026-05-04.md`（2026-05-04 検証レポート）での決定事項を `requirements_definition.md` に反映済みとして、現行実装との差分を以下に整理する。

---

### 13.1 変更全体サマリー

| 決定番号 | 決定内容 | 現行実装状態 | 影響範囲 | 緊急度 |
|---------|---------|------------|---------|--------|
| TL-01/TL-02 | 承認ルートマスタ方式（approval_routesテーブル） | 未実装 | BE・FE | 🔴 最高 |
| UX-01 | 差戻しと却下を「却下」1つに統一 | 支払依頼のみ「差戻し」が残存 | FE全伝票 | 🔴 最高 |
| BE-02 | 見積ステータスに「却下」を追加（却下→下書き→再申請可） | 却下すると「取消」になり再申請不可 | FE | 🔴 最高 |
| BE-01 | 全伝票のステータス定義確定（受注・発注・請求・入金・支払依頼） | 受注・請求に承認フローなし | FE・BE | 🔴 最高 |
| FE-01/FE-04 | 承認操作を伝票詳細画面で行い、操作後は承認一覧に戻る | S-12に行ドリルダウンなし | FE | 🔴 最高 |
| TL-03 | 受注承認依頼時に添付ファイル必須チェック | 添付は任意のまま（バリデーションなし） | FE | 🟠 高 |
| FE-02 | 各伝票詳細画面に承認ステップ表示＋承認履歴テーブル | 未実装 | FE | 🟠 高 |
| FE-03 | ダッシュボード承認待ち件数を伝票種別ごとに表示 | 合算値1件のみ、S-12遷移なし | FE | 🟠 高 |
| TL-04 | 通知仕様確定（N-01〜N-06、差戻し通知を却下に統一） | 通知生成ロジック未実装（静的データのみ） | FE・BE | 🟠 高 |
| TL-02 | 社長決裁条件を「利益率 OR 見積金額合計」の閾値で判定 | 未実装 | FE | 🟠 高 |
| BE-03 | 承認履歴テーブルのスキーマ確定（却下時コメント必須） | 承認コメントを保存する仕組みなし | BE | 🟠 高 |
| BE-04 | 発注残＝発注数量−検収合格数量（不合格は残計上） | 配送済数量で暗黙計算（不合格を残計上しない） | FE | 🟡 中 |
| BE-05 | 入金消込：手動消込＋「差額あり」ステータス追加 | 手動消込は実装済み、「差額あり」ステータスなし | FE | 🟡 中 |
| TL-05 | 合算請求の消費税は課税合計に対して一括計算 | 合算請求自体未実装 | BE・FE | 🟡 中 |
| TL-05 | 一部受注は行単位のみ（数量単位は対象外） | 現行実装は行単位のみのため影響なし | なし | ✅ 影響なし |

---

### 13.2 差戻しと却下の統一（UX-01）

#### 現行実装の問題

| 伝票種別 | 現行動作 | 要件との差異 |
|---------|---------|------------|
| 見積 | 却下 → status `取消` に変更（再申請不可） | 却下 → `却下` ステータス → 下書きに戻り再申請可 |
| 発注 | 却下ボタンはあるが `rejectPurchaseOrder()` 関数が未実装 | 却下 → `却下` ステータス → 下書きに戻り再申請可 |
| 請求 | 承認フロー自体なし | 承認フロー実装後、却下 → `却下` → 下書き |
| 支払依頼 | `差戻し` ステータスで運用（再申請あり） | 名称を `却下` に変更（動作は同じ） |

#### 修正が必要なファイル

**`src/quotation.js`**
- `rejectQuotation()` の status を `'取消'` → `'却下'` に変更
- 却下後に `'下書き'` へ差し戻す `returnQuotationToDraft()` 関数を追加

**`src/purchaseOrder.js`**
- `rejectPurchaseOrder()` 関数を新規追加（status → `'却下'`）
- 却下後に `'下書き'` へ差し戻す `returnPurchaseOrderToDraft()` 関数を追加

**`src/payment.js`**
- `rejectPayment()` の status を `'差戻し'` → `'却下'` に変更
- 再申請（`'却下'` → `'承認依頼中'`）の遷移を維持

**`app.js`**
- 全伝票の却下後遷移を「下書きに戻る」動作に統一
- 支払依頼フィルタ選択肢から `'差戻し'` を削除し `'却下'` を使用
- S-12の通知フィルタから `'差戻し'` を削除

**`src/notification.js` の通知フィルタ**
- `'差戻し'` フィルタを削除、`'却下'` に統一

---

### 13.3 各伝票ステータスの修正

#### 13.3.1 見積（Quotation）

| 項目 | 現行 | 要件 | 対応 |
|-----|------|------|------|
| ステータス一覧 | 下書き・承認依頼中・承認済み・取消・失注 | 下書き・承認依頼中・承認済み・**却下**・失注・取消 | `却下` ステータス追加 |
| 却下後の遷移 | 取消（終端）| 却下 → 下書きに戻り再申請可 | `rejectQuotation()` 修正 |
| 再申請 | 不可 | 却下 → 下書き → 承認依頼中 | 遷移ロジック追加 |

#### 13.3.2 受注（Order）

| 項目 | 現行 | 要件 | 対応 |
|-----|------|------|------|
| ステータス一覧 | 受注済み・完了・キャンセル | 受注済み・発注済み・請求対象・請求済み・完了・取消 | ステータス拡張 |
| 承認フロー | **なし** | **受注承認依頼 → 営業部長承認** | 承認フロー新規実装 |
| 添付必須チェック | なし | 承認依頼時に1ファイル以上必須 | バリデーション追加 |
| 契約手続き済 | なし | 管理部長が「契約手続き済」に変更 | ステータス・ボタン追加 |
| 請求対象化 | billingTarget フラグ | `請求対象` ステータスに変更 | ステータス管理への移行 |

現行の受注承認フローは完全に欠落しており、`src/order.js` への追加と `app.js` の大幅な修正が必要。

#### 13.3.3 発注（Purchase Order）

| 項目 | 現行 | 要件 | 対応 |
|-----|------|------|------|
| ステータス一覧 | 下書き・承認依頼中・承認済・発注待ち・発注済・一部納品・納品済・取下げ・却下 | 下書き・承認依頼中・承認済み・発注済み・完了・却下・取消 | ステータス名称統一・整理 |
| 却下関数 | `rejectPurchaseOrder()` 未実装 | 却下 → 下書きに戻る | 関数新規追加 |
| 「取下げ」 | あり | 「取消」に統一 | 名称変更 |

#### 13.3.4 請求（Invoice）

| 項目 | 現行 | 要件 | 対応 |
|-----|------|------|------|
| ステータス一覧 | 下書き・確定・送付済・一部入金・入金済・キャンセル | 下書き・承認依頼中・確定・一部入金・消込済み・取消・却下 | ステータス大幅変更 |
| 承認フロー | **なし** | **3段階（営業部長→管理部担当→管理部長）** | 承認フロー新規実装 |
| 「送付済」 | あり | 要件定義に記載なし（別途確認要） | ステータス見直し |
| 「入金済」 | あり | 「消込済み」に名称変更 | 名称変更 |

請求の承認フロー実装は最も影響範囲が広い（3段階承認、`src/invoice.js` 拡張、`app.js` 大幅修正）。

#### 13.3.5 入金（Receipt）

| 項目 | 現行 | 要件 | 対応 |
|-----|------|------|------|
| ステータス | 請求に従属（一部入金/入金済）| 入金レコード自体に未消込・消込済み・差額あり | 入金レコードへのステータス追加 |
| 「差額あり」 | なし | 過入金時に「差額あり」ステータス | 新規追加 |

#### 13.3.6 支払依頼（Payment）

| 項目 | 現行 | 要件 | 対応 |
|-----|------|------|------|
| ステータス一覧 | 下書き・承認待ち・承認済・差戻し・支払済・キャンセル | 下書き・承認依頼中・承認済み・支払済み・却下・取消 | 名称統一・差戻し廃止 |
| 「差戻し」 | あり | 廃止（却下に統一） | ステータス削除・マイグレーション対応 |

---

### 13.4 承認操作UIの修正（FE-01/FE-04）

#### 現行の問題

S-12承認一覧画面は行クリックで伝票詳細に遷移できない（ドリルダウンなし）。承認操作ボタンは一覧画面または伝票詳細のそれぞれに散在している。

#### 必要な修正

**S-12承認一覧（app.js）**
- 行クリックで対象伝票の詳細画面に遷移する実装を追加
- 遷移時に `viewState.fromApproval = true` フラグをセット
- 受注・請求を承認一覧に追加（現行は見積・発注・支払依頼のみ）

**各伝票詳細画面（app.js）**
- `viewState.fromApproval === true` の場合、詳細画面上部に以下を追加:
  - 「承認する」ボタン → コメント任意 → 承認一覧に戻る
  - 「却下」ボタン → コメント入力欄インライン展開（必須） → 承認一覧に戻る
  - 「承認一覧に戻る」リンク

**対象伝票詳細画面**（すべて修正対象）
- S-04 見積詳細: 既存の承認ボタン位置・動作を統一形式に変更
- S-05 受注詳細: 承認ボタン新規追加
- S-06 発注詳細: 既存の却下ボタンに「承認一覧に戻る」追加、コメント必須化
- S-08 請求詳細: 承認ボタン新規追加
- S-10 支払依頼詳細: 差戻し→却下に変更、コメント必須化

---

### 13.5 承認進捗の可視化（FE-02）

各伝票詳細画面（見積・受注・発注・請求・支払依頼）の下部に「承認状況エリア」を追加する。

#### 表示内容

```
承認状況
  現在のステップ: 承認依頼中（ステップ 1/2：営業部長 確認待ち）

承認履歴
  ┌──────────┬──────────┬──────────┬────────────────────┐
  │ 操作日時   │ 操作者    │ 操作種別  │ コメント            │
  ├──────────┼──────────┼──────────┼────────────────────┤
  │ 2026-05-01│ 田中部長  │ 承認      │ （任意）            │
  │ 2026-04-30│ 鈴木担当  │ 承認依頼  │ ご確認をお願いします │
  └──────────┴──────────┴──────────┴────────────────────┘
```

#### 実装方針

- 承認ルートマスタ（`approval_routes`）から現在ステップを算出して表示
- 承認履歴は `approval_history` テーブルから取得（バックエンド実装後）
- フロントエンドのみの段階では `viewState.approvalHistory[docCode]` 配列で仮管理

---

### 13.6 ダッシュボード承認待ち件数修正（FE-03）

#### 現行の問題

```javascript
// src/dashboard.js - 現行（合算値1件）
pendingApprovalCount: quotations + purchaseOrders + payments
```

#### 必要な修正

```javascript
// 必要な形式（伝票種別ごと）
pendingApprovals: {
  quotation: quotationCount,      // 見積
  order: orderCount,              // 受注
  purchaseOrder: purchaseOrderCount, // 発注
  invoice: invoiceCount,          // 請求
  payment: paymentCount           // 支払依頼
}
```

**表示仕様**
- 件数ゼロの種別はグレーアウト
- 各行クリックで S-12 承認一覧に対象種別フィルター済みで遷移（URL: `#approval?type=quotation` 等）

**修正ファイル**
- `src/dashboard.js`: `getDashboardMetrics()` の戻り値を種別ごとに分解
- `app.js`: ダッシュボードの承認待ちウィジェット HTML を種別ごとのリスト形式に変更

---

### 13.7 受注承認フローの新規実装

現行では受注に承認フローが存在しない。以下を新規実装する。

#### 必要な機能

1. **受注一覧・詳細画面（S-05）**
   - 「承認依頼」ボタン追加（下書き状態のみ）
   - 承認依頼ボタン押下時: 添付ファイル1件以上の必須バリデーション
   - 状態: `受注済み` → `承認依頼中` → `承認済み` / `却下`

2. **`src/order.js` 修正**
   - `createOrderFromQuotation()` の初期 status を `'下書き'` に変更（現在は `'受注済み'`）
   - `submitOrderApproval()` 関数追加（下書き → 承認依頼中）
   - `approveOrder()` 関数追加（承認依頼中 → 受注済み）
   - `rejectOrder()` 関数追加（承認依頼中 → 却下）
   - `returnOrderToDraft()` 関数追加（却下 → 下書き）
   - `completeContractProcedure()` 関数追加（承認済み → 契約手続き済、管理部長のみ）

3. **S-12承認一覧への受注追加**
   - `src/approval.js`: `getPendingApprovals()` に受注（status `'承認依頼中'`）を追加

4. **添付ファイルバリデーション**
   - 承認依頼ボタンのイベントハンドラで `order.attachments.length === 0` チェック追加

---

### 13.8 請求承認フローの新規実装

現行では請求に承認フローが存在しない。3段階承認（営業部長→管理部担当→管理部長）を新規実装する。

#### 必要な機能

1. **請求一覧・詳細画面（S-08）**
   - 「承認依頼」ボタン追加（下書き状態のみ）
   - ステータス: `下書き` → `承認依頼中` → `確定`（全承認後）/ `却下`

2. **`src/invoice.js` 修正**
   - `submitInvoiceApproval()` 関数追加
   - `approveInvoice()` 関数追加（多段承認ステップ管理）
   - `rejectInvoice()` 関数追加
   - `returnInvoiceToDraft()` 関数追加

3. **S-12承認一覧への請求追加**
   - `src/approval.js`: `getPendingApprovals()` に請求（status `'承認依頼中'`）を追加

4. **既存の「確定」ボタン動作変更**
   - 現行: 下書き → 確定（直接）
   - 変更後: 下書き → 承認依頼中 → 確定（承認完了後に自動遷移）

---

### 13.9 承認ルートマスタとS-15設定画面の拡張

#### 新規テーブル設計

```sql
-- 承認ルートマスタ
CREATE TABLE approval_routes (
  id           SERIAL PRIMARY KEY,
  document_type VARCHAR(50) NOT NULL,  -- quotation / order / purchase_order / invoice / payment_request
  step_number  INTEGER NOT NULL,       -- 1始まり
  approver_user_id VARCHAR(50) REFERENCES users(id),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_type, step_number, approver_user_id)
);

-- 承認履歴
CREATE TABLE approval_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type VARCHAR(50) NOT NULL,
  document_id   VARCHAR(100) NOT NULL,
  step_number   INTEGER NOT NULL,
  actor_user_id VARCHAR(50),
  actor_name    VARCHAR(100),          -- 操作時点の名称を保持
  action        VARCHAR(20) NOT NULL,  -- approve / reject
  comment       TEXT,                 -- 却下時は必須
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_approval_history_doc ON approval_history(document_type, document_id);
```

#### S-15 設定画面への追加タブ

現行の2タブ（会社情報・年度設定）に以下を追加:

**タブ3: 承認ルート設定**
- 伝票種別選択（見積・受注・発注・請求・支払依頼）
- 承認ステップごとの承認者ユーザID設定
- AND条件の説明文表示（「同一ステップに複数登録した場合、全員の承認が必要です」）

**タブ4: 承認条件設定**
- 社長決裁発動条件の閾値設定:
  - 利益率閾値（%）: 数値入力
  - 見積金額合計閾値（円）: 数値入力
  - 条件: OR（どちらか一方が超過で発動）
- 承認滞留判定日数（N-04通知トリガー）: 数値入力（初期値: 3）

#### フロントエンド（インメモリ）での仮実装

バックエンド実装前の段階では、`viewState.approvalRoutes` および `viewState.approvalHistory` として配列で管理する。

```javascript
viewState.approvalRoutes = [
  { documentType: 'quotation', stepNumber: 1, approverUserId: 'user-002' },  // 営業部長
  { documentType: 'quotation', stepNumber: 2, approverUserId: 'user-003' },  // 社長（条件付き）
  ...
]
viewState.approvalHistory = {}  // { 'QUO-001': [{ stepNumber, action, comment, ... }] }
```

---

### 13.10 通知ロジックの実装

現行の通知は静的データのみで、承認イベント発生時の通知生成ロジックが存在しない。

#### 通知生成が必要なポイント（`app.js` イベントハンドラへの追加）

| 通知 | トリガーとなるユーザ操作 | 追加先 |
|-----|---------------------|-------|
| N-01 | 承認依頼ボタン押下 | 各伝票の承認依頼ハンドラ |
| N-02 | 承認ボタン押下 | 各伝票の承認ハンドラ |
| N-03 | 却下ボタン押下 | 各伝票の却下ハンドラ（コメントを通知本文に含める） |
| N-04 | 定期チェック（3営業日経過） | `setInterval` またはバックエンドJobで実装 |
| N-05 | 画面描画時チェック（請求支払期日） | レポート/ダッシュボード描画時 |
| N-06 | 画面描画時チェック（発注納品予定日） | レポート/ダッシュボード描画時 |

#### `src/notification.js` の拡張

```javascript
export function createApprovalRequestNotification(documentType, documentCode, approverUserId) { ... }
export function createApprovalResultNotification(documentType, documentCode, applicantUserId, action, comment) { ... }
export function checkOverdueApprovals(pendingApprovals, stalenessDays) { ... }  // N-04
export function checkPaymentDueDates(invoices, userId) { ... }  // N-05
export function checkDeliveryDueDates(purchaseOrders, userId) { ... }  // N-06
```

#### メール送信（N-01〜N-03）

初期リリースのフロントエンド段階では画面内通知（`viewState.notifications` に追加）のみ実装し、バックエンド実装後にメール送信APIを呼び出す形式に拡張する。

---

### 13.11 社長決裁条件の判定ロジック実装

見積承認依頼時に社長決裁が必要かどうかを判定するロジックを `src/quotation.js` に追加する。

```javascript
// src/quotation.js への追加
export function requiresPresidentApproval(quotation, settings) {
  const { presidentApprovalProfitRateThreshold, presidentApprovalAmountThreshold } = settings;
  const profitRate = quotation.grossProfit / quotation.total;
  return profitRate < presidentApprovalProfitRateThreshold
    || quotation.total > presidentApprovalAmountThreshold;
}
```

承認ルートマスタと組み合わせ、`requiresPresidentApproval() === true` の場合のみ社長ステップを承認ルートに動的に挿入する。

---

### 13.12 発注残計算の修正（BE-04）

#### 現行の問題

現行は `deliveredQuantity`（納品済数量）で発注残を暗黙的に計算しており、検収NGの数量も残から差し引かれてしまう。

#### 修正内容

**`src/delivery.js`**

```javascript
// 変更前（暗黙計算）
export function isFullyDelivered(details, deliveries) {
  return details.every(d => {
    const delivered = deliveries.filter(dl => dl.lineNo === d.lineNo)
      .reduce((sum, dl) => sum + dl.deliveredQuantity, 0);
    return delivered >= d.quantity;
  });
}

// 変更後（検収合格数量のみ使用）
export function getAcceptedQuantity(lineNo, deliveries) {
  return deliveries
    .filter(dl => dl.lineNo === lineNo && dl.inspectionResult === '検収済')
    .reduce((sum, dl) => sum + dl.deliveredQuantity, 0);
}

export function getRemainingQuantity(lineNo, orderedQuantity, deliveries) {
  return orderedQuantity - getAcceptedQuantity(lineNo, deliveries);
}
```

---

### 13.13 バックエンドDB設計への追加影響

第2期（P1〜P8）のバックエンド実装において、上記要件変更を反映したDB設計変更点を以下に示す。

#### 13.13.1 追加テーブル

| テーブル | 目的 | フェーズ |
|---------|------|---------|
| `approval_routes` | 承認ルートマスタ | P1 |
| `approval_history` | 承認履歴（コメント含む） | P1 |

#### 13.13.2 既存テーブルへの変更

| テーブル | 変更内容 |
|---------|---------|
| `quotations` | status に `'却下'` を追加。`reject_reason` カラムを `comment` に改名 |
| `orders` | status 拡張（受注済み・発注済み・請求対象・請求済み・完了・取消）。承認フロー列追加（current_step_number, submitted_by） |
| `purchase_orders` | status 名称統一（承認済み・発注済み・完了・却下・取消）。`rejection_reason` カラム追加 |
| `invoices` | status に `'承認依頼中'` `'却下'` `'消込済み'` を追加。`'入金済'` → `'消込済み'` に移行 |
| `payments` | status を `'差戻し'` から `'却下'` に変更。既存データのマイグレーション必要 |
| `receipts` | 自体のステータス（未消込・消込済み・差額あり）カラム追加 |
| `system_settings` | `presidentApprovalProfitRateThreshold`・`presidentApprovalAmountThreshold`・`approvalStalenessDays` キーを追加 |

#### 13.13.3 マイグレーション注意点

- `payments.status = '差戻し'` → `'却下'` への既存データ変換が必要
- `invoices.status = '入金済'` → `'消込済み'` への既存データ変換が必要
- `quotations` で却下済みだが `'取消'` になっているレコードは業務確認後に移行

---

### 13.14 フェーズへの割り当て

上記追加実装を既存フェーズ（P1〜P8）に割り当てる。

#### 優先実装（フロントエンドのみ段階でも対応すべき修正）

バックエンド実装前に現行のフロントエンド実装を要件定義と整合させるための修正。これらは **フェーズP0（前処理）** として実施する。

| # | 内容 | 修正ファイル | 工数目安 |
|---|------|------------|---------|
| P0-01 | 差戻しと却下の統一（見積・発注・支払依頼） | src/quotation.js, src/purchaseOrder.js, src/payment.js, app.js | 1日 |
| P0-02 | 見積ステータスに「却下」追加（却下→下書き→再申請） | src/quotation.js, app.js | 0.5日 |
| P0-03 | 発注残計算を検収合格数量ベースに修正 | src/delivery.js, app.js | 0.5日 |
| P0-04 | 入金「差額あり」ステータス追加 | src/receipt.js, app.js | 0.5日 |
| P0-05 | ダッシュボード承認待ち件数を伝票種別ごとに表示 | src/dashboard.js, app.js | 0.5日 |
| P0-06 | S-12承認一覧に行ドリルダウン（伝票詳細遷移）追加 | app.js | 1日 |
| P0-07 | 各伝票詳細に承認操作ボタン（承認/却下+コメント）を統一形式で追加 | app.js | 2日 |
| P0-08 | 受注に承認フロー新規実装（承認依頼・添付必須チェック・承認/却下） | src/order.js, app.js | 1.5日 |
| P0-09 | 請求に承認フロー新規実装（3段階） | src/invoice.js, app.js | 2日 |
| P0-10 | 各伝票詳細に承認ステップ表示＋承認履歴テーブル追加 | app.js | 1日 |
| P0-11 | S-15に承認ルート設定タブ追加 | app.js | 1日 |
| P0-12 | S-15に承認条件設定タブ追加（社長決裁閾値・滞留日数） | app.js | 0.5日 |
| P0-13 | 社長決裁条件判定ロジック実装 | src/quotation.js, app.js | 0.5日 |
| P0-14 | 通知生成ロジック実装（N-01〜N-03）+ N-05・N-06の画面チェック | src/notification.js, app.js | 1日 |
| **合計** | | | **約14日** |

#### P1〜P8への追加事項

| フェーズ | 追加内容 |
|---------|---------|
| P1 | `approval_routes`・`approval_history` テーブル追加。DB設計に13.13を反映 |
| P2 | マスタAPIに承認ルート設定のCRUDを追加（`GET/POST/PUT /api/approval-routes`） |
| P3〜P4 | 各伝票APIに承認フロー（承認依頼・承認・却下）のエンドポイントを追加 |
| P5 | N-04（滞留通知）をバックエンドJob（`node-cron` 等）で実装。N-01〜N-03はAPI呼び出し時にDBへ自動記録 |
| P6 | 承認操作（approve/reject）を監査ログに記録（action = `APPROVE` / `REJECT`） |
| P8 | `payments.status` の既存データマイグレーション（差戻し → 却下） |

---

## 15. Webフレームワーク選定根拠（Hono / Fastify / NestJS 比較）

§4.1でFastify v5を採用した根拠を記録する。

### 15.1 比較対象と評価軸

| 評価軸 | Hono | **Fastify v5** | NestJS |
|-------|------|--------------|--------|
| パフォーマンス | ◎ 最速（100k+ req/s） | ◎ 同等（70〜80k req/s） | ○ やや劣る（Express比+30%程度） |
| 監査ログmiddleware | △ onionモデルで手動実装 | ◎ `preHandler`/`onSend` hookが直接対応 | ○ Interceptorで実装可（decorator必須） |
| ファイルアップロード | △ サードパーティのみ | ◎ `@fastify/multipart`（公式） | ○ `@nestjs/platform-multer`（公式） |
| JWT / CORS / rate-limit | △ コミュニティ製 | ◎ 全て公式プラグイン | ◎ 全て公式パッケージ |
| Drizzle ORM統合 | ○ 問題なし | ◎ プラグイン方式で整理しやすい | ○ 問題なし（TypeORMの方が例多い） |
| Zod統合 | ◎ ネイティブ | ○ `fastify-type-provider-zod` 経由 | ○ class-validator が主流（Zodは追加設定） |
| TypeScript | ◎ | ◎ スキーマ駆動型推論 | ◎ decoratorベース |
| 学習コスト | ○ 低（シンプル） | ○ 中（hookを覚えれば直感的） | △ 高（DI/decorator/module必須） |
| エコシステム成熟度 | △ 3年・成長中 | ◎ 7年・本番実績多数 | ◎ 8年・エンタープライズ実績 |
| チーム規模適合 | 小〜中規模 | 中〜大規模 | 大〜エンタープライズ |

### 15.2 各フレームワークの採用を見送った理由

#### Hono を見送った理由

- **添付ファイルアップロード**: 受注承認依頼時の契約書添付（§6.1 ステップ4.3）に必要な multipart 処理の公式サポートがない。busboy等を直接扱う必要があり、実装工数が増える
- **エコシステム成熟度**: Fastifyに比べて3年新しく、本番業務システムでの事例が少ない。7年・エンタープライズ実績のFastifyのほうがトラブル時の情報量が多い
- **監査ログhook**: onionモデルのmiddlewareはシンプルだが、ルート実装側への依存（`c.set('createdOrUpdatedEntity', ...)` のようなconvention）が必要。Fastifyの `onSend` hookは送信直前に自動でpayloadを取得できる点で優れている

#### NestJS を見送った理由

- **学習コスト**: decorator（`@Controller`、`@Injectable`、`@UseGuards`等）とDIコンテナの習得が必要。バニラJSベースの現チームには8週間のタイムラインで過大なリスク
- **boilerplate**: リソースごとにmodule/controller/service/DTOの4ファイルが必要。15リソースで約60ファイルを生成するオーバーヘッドが発生する
- **過剰設計**: NestJSの強みは50名以上の大規模チームでの規律確保。2名のバックエンドチームには制約過多になる

### 15.3 Fastifyを採用した理由（まとめ）

1. **監査ログの実装品質**: `preHandler` で変更前データ取得、`onSend` でレスポンス確定後に記録、という2段hookがaudit_logsのbefore/after要件に完全合致する（§7.2参照）
2. **公式プラグインが要件を全て充足**: JWT・CORS・rate-limit・helmet・multipartが公式提供であり、P8のセキュリティ要件を追加ライブラリ選定なしで実装できる
3. **受注添付ファイル**: `@fastify/multipart` が契約書・注文書のアップロードに対応（TL-03決定事項の実装に直結）
4. **パフォーマンス**: Honoとほぼ同等（差は5〜10%程度）で、業務システムの実用域では差が生じない
5. **Drizzleとの親和性**: Fastifyのプラグイン方式でDBインスタンスをfastify.dbとして全routeに注入でき、repositoryパターンとの統合がクリーン

### 15.4 インストールコマンド（参考）

```bash
npm install fastify @fastify/jwt @fastify/cors @fastify/rate-limit \
            @fastify/helmet @fastify/multipart fastify-plugin \
            drizzle-orm pg drizzle-zod zod bcrypt dotenv
npm install -D typescript tsx vitest @types/node drizzle-kit
```

---

## 14. 2チーム並行開発計画

### 14.1 チーム編成

| チーム | 担当メンバー | 担当領域の軸 |
|-------|-----------|------------|
| **チームA** | フロントエンドエンジニアA + バックエンドエンジニアC | 承認・ワークフロー全般 |
| **チームB** | フロントエンドエンジニアB + バックエンドエンジニアD | データ基盤・業務伝票 |
| **横断** | テックリード | 設計レビュー・合流調整・ブランチ管理 |
| **横断** | QAエンジニアE / F | 各合流点でのE2Eテスト実施 |
| **横断** | UXデザイナー | 承認UI仕様の最終確認（合流点M1・M3） |

---

### 14.2 担当領域の定義

#### チームA：承認・ワークフロー担当

| レイヤー | 担当範囲 |
|---------|---------|
| フロント（P0） | S-12行ドリルダウン、各伝票詳細の承認操作ボタン、受注・請求の承認フロー新規実装、承認ステップ表示・履歴テーブル、S-15承認ルート/条件設定タブ（P0-06〜P0-13） |
| フロント（P0B連携後）| 承認フロー画面のAPI統合（P3・P5完了後） |
| バックエンド | P1（認証基盤・approval_routes/approval_historyテーブル）、P5（承認・通知API）|
| src/ 所有ファイル | `src/quotation.js`（承認関連関数）、`src/order.js`（承認関連）、`src/invoice.js`（承認関連）、`src/notification.js` |
| app.js 所有領域 | `approvalListScreenHtml()`、各伝票詳細の「承認状況エリア」、承認操作イベントハンドラ、`settingsScreenHtml()`の承認ルート/条件タブ |

#### チームB：データ基盤・業務伝票担当

| レイヤー | 担当範囲 |
|---------|---------|
| フロント（P0） | 差戻し/却下統一、見積ステータス修正、発注残計算修正、入金差額ステータス、ダッシュボード承認待ち種別表示、通知生成ロジック（P0-01〜P0-05、P0-14） |
| フロント（API統合）| マスタ・業務伝票画面のAPI統合（P2・P3・P4完了後） |
| バックエンド | P2（マスタデータAPI）、P3（案件・見積・受注API）、P4（発注・請求・支払API）、P6（監査ログ）、P8（本番対応） |
| src/ 所有ファイル | `src/delivery.js`、`src/receipt.js`、`src/payment.js`（差戻し修正）、`src/dashboard.js`、`src/purchaseOrder.js`（却下関数追加） |
| app.js 所有領域 | `dashboardScreenHtml()`、各伝票一覧・詳細のステータス関連ロジック、入金・支払画面、発注残表示 |

---

### 14.3 ブランチ戦略

```
main
 └── develop          ← 統合ブランチ（合流点でのみマージ）
      ├── feature/A-approval-workflow   ← チームA作業ブランチ
      └── feature/B-status-and-data    ← チームB作業ブランチ
```

- **app.js のコンフリクト回避**: チームAとBは `app.js` を並行して編集するため、テックリードが週1回の頻度で各ブランチの差分を確認し、競合箇所を早期に検出する。コンフリクトリスクが高い画面関数は担当を§14.2の「app.js所有領域」で明確に割り当てる。
- 合流点（M1〜M5）でのみ `develop` にマージし、マージ作業はテックリードが担当する。

---

### 14.4 スプリント別タイムライン

スプリントは1週間単位（5営業日）。全体を7スプリント（約7週）で計画する。

```
         Week 1       Week 2       Week 3       Week 4       Week 5       Week 6       Week 7
         S1           S2           S3           S4           S5           S6           S7
         
チームA  [── P0-A ──────────────][── P1統合テスト ────][── P5 ──────────────────][P7/P8]
         P0-06〜13(9.5日)          P1統合テスト(A側)    承認・通知API             

チームB  [P0-B(4日)][── P1-BE(B) ──────────][P2+M2-4(5日)][──── P3+P4 ──────────][P6][P7/P8]
         P0-01〜05,14 Hono+DB+auth+JWT        マスタAPI        業務伝票API           監査ログ
                                              +approval-routes

QA       ────────────────────[E2E-M1]─────────[E2E-M2]──────────[E2E-M3]────[E2E-M4][E2E-M5]

         ◀──────────────────────▶◀──────────▶◀──────────────────▶◀─────────▶◀────────▶
                  P0フェーズ         合流M1      P2〜P3前半           合流M3     P6〜P8
```

#### スプリント別詳細

| S | 週 | チームA | チームB | 成果物 |
|---|---|--------|--------|--------|
| S1 | 1 | P0-06（S-12ドリルダウン）、P0-07（承認ボタン統一）着手 | P0-01/02（差戻し→却下、見積ステータス）、P0-03/04（発注残・入金）完了 | チームB: P0-B完了 |
| S2 | 2 | P0-08（受注承認）、P0-09（請求承認）着手 | P1開始（docker-compose, スキーマ, auth routes）、P0-05/14完了 | チームB: P0-B+P1着手 |
| S3 | 3 | P0-10/11/12/13完了 | P1完了（JWT発行、`/api/auth/login`通過）、approval_routes/historyテーブル追加（**チームA作業巻き取り**）、P2着手 | **→ M1 合流（S3末）** |
| S4 | 4 | P3の承認エンドポイント設計・実装（`/api/quotations/:code/approve`等） | P2完了、P3着手（案件・見積CRUD） | チームA+B: P1フロント統合（ログイン→API化） |
| S5 | 5 | P5着手（通知DB、N-01〜N-03 API） | P3完了（受注まで）、M2-4（`/api/approval-routes` CRUD、**チームA作業巻き取り**）完了、P4着手（発注） | **→ M2 合流（S5中）** |
| S6 | 6 | P5完了（N-04 Job、メール送信基盤） | P4完了（請求・支払）、P6着手（監査ログ） | **→ M3 合流（S6末）** |
| S7 | 7 | P7（通知ロジック最終・S-07独立化）、P8参加 | P6完了、P7参加、P8（セキュリティ強化） | **→ M4 合流（S7中）→ M5（S7末）** |

---

### 14.5 合流ポイント定義

合流ポイント（Milestone）は5つ設ける。各合流点では **テックリード + QAエンジニア** が完了確認を行い、通過後に次フェーズへ進む。

---

#### M1：P0統合 + P1バックエンド基盤（スプリント3末）

**条件（以下をすべて満たすこと）**

| # | 確認項目 | 担当 |
|---|---------|------|
| M1-1 | `feature/A-approval-workflow` と `feature/B-status-and-data` を `develop` へマージ完了 | テックリード |
| M1-2 | 全E2Eテスト（`e2e/` 以下）がパス。既存テストの退行がないこと | QA-E |
| M1-3 | フロントのログイン処理が `POST /api/auth/login` 経由で動作すること | チームB |
| M1-4 | JWTがhttpOnlyクッキーに正しく発行され、`GET /api/auth/me` で認証ユーザが返ること | チームB |
| M1-5 | `approval_routes` / `approval_history` テーブルがマイグレーション済みであること | チームB（チームA作業巻き取り） |
| M1-6 | 見積の「却下→下書き→再申請」フローがフロントで動作すること | チームA |
| M1-7 | 支払依頼の「差戻し」が「却下」に統一されており、再申請できること | チームB |

**合流後の作業**
- 両チームが `develop` を pull し、フロントのログイン処理を全員がAPI版で開発継続
- チームA: P3の承認エンドポイント設計をテックリードとレビュー
- チームB: P2 マスタデータAPI実装を継続

---

#### M2：マスタデータAPI完了 + フロントマスタ画面統合（スプリント5中）

**条件**

| # | 確認項目 | 担当 |
|---|---------|------|
| M2-1 | 顧客・仕入先・商品・ユーザの GET/POST/PUT APIが全てパスすること（supertest） | チームB |
| M2-2 | フロントのマスタ管理画面（S-11）がAPIからデータを取得して表示・保存できること | チームB |
| M2-3 | マスタデータがページ再読み込み後も保持されること（DB永続化確認） | チームB |
| M2-4 | 承認ルートCRUD API（`/api/approval-routes`）が実装済みであること | チームB（チームA作業巻き取り） |

**合流後の作業**
- マスタ画面のE2Eテストをインメモリ→API版に切り替え（QA-F担当）
- チームAとBの進捗確認会議（テックリード主催）で後続フェーズの依存関係を調整

---

#### M3：業務伝票API完了 + フロント業務画面統合スプリント（スプリント6末）

最大の合流ポイント。P3（案件・見積・受注）+ P4（発注・請求・支払）+ P5（承認・通知）が完了し、フロントの全業務画面をAPIに切り替える。

**条件**

| # | 確認項目 | 担当 |
|---|---------|------|
| M3-1 | P3 全APIがsuperstestでパスすること（承認エンドポイント含む） | チームA |
| M3-2 | P4 全APIがsuperstestでパスすること | チームB |
| M3-3 | P5 N-01〜N-03 通知APIが動作すること（承認依頼→通知レコード生成） | チームA |
| M3-4 | 見積・受注・発注・請求・支払依頼の各画面がAPIからデータ取得・保存できること | 両チーム |
| M3-5 | 承認フロー（承認依頼→承認→通知）がE2Eで一気通貫で動作すること | QA-E + QA-F |
| M3-6 | インメモリ配列への直接参照が全業務画面から除去されていること | テックリード確認 |

**合流スプリント作業分担**（M3到達前の1週間を統合スプリントとして確保）

| 作業 | 担当 |
|-----|------|
| S-04（見積）フロントAPI統合 | チームA |
| S-05（受注）フロントAPI統合 | チームA |
| S-03（案件）フロントAPI統合 | チームB |
| S-06（発注）フロントAPI統合 | チームB |
| S-08（請求）フロントAPI統合 | チームA |
| S-09/S-10（入金・支払）フロントAPI統合 | チームB |
| E2E全スイート実行・修正 | QA-E + QA-F |

---

#### M4：監査ログ + 残フロント機能完了（スプリント7中）

**条件**

| # | 確認項目 | 担当 |
|---|---------|------|
| M4-1 | P6 監査ログミドルウェアが全MUTATIONエンドポイントに適用済みであること | チームB |
| M4-2 | ログイン・承認・却下操作がaudit_logsに記録されること | チームB |
| M4-3 | N-04（滞留通知）のバックエンドJobが動作すること | チームA |
| M4-4 | P7のS-07独立画面化・S-14通知ロジック・S-15承認条件UIが完成していること | 両チーム |
| M4-5 | 全E2Eテストがパスし、退行がないこと | QA-E + QA-F |

---

#### M5：本番リリース準備完了（スプリント7末）

**条件**

| # | 確認項目 | 担当 |
|---|---------|------|
| M5-1 | P8 セキュリティヘッダ・レートリミット・CORSポリシーが設定済みであること | 両チーム |
| M5-2 | `payments.status = '差戻し'` → `'却下'` のデータマイグレーションが完了していること | チームB |
| M5-3 | パスワードポリシー・アカウントロック機能が実装済みであること | チームA |
| M5-4 | 本番環境用 `.env` / Docker設定が整備されていること | チームB |
| M5-5 | 全E2Eテストがパスし、性能要件（一覧画面3秒以内）を満たすこと | QA-E + QA-F |

---

### 14.6 依存関係マップ

```
チームA作業                        チームB作業
───────────────────────────────    ───────────────────────────────
P0-06〜13（承認UI新規実装）        P0-01〜05, P0-14（既存実装修正）
    │                                   │
    │                               P1 BE（Hono + DB + JWT）
    │                                   │
    └───────────────┬───────────────────┘
                    │ ← M1（P0統合 + P1完了）
                    │
    P3 承認エンドポイント          P2（マスタAPI）
                                   ＋approval tables（巻き取り）
                                   ＋M2-4 approval-routes CRUD（巻き取り）
                    │ ← M2（マスタAPI完了）
                    │
    P5（承認・通知API）            P3（案件・見積・受注CRUD）
         │                         P4（発注・請求・支払API）
         │                              │
         └──────────────┬───────────────┘
                         │ ← M3（業務伝票API全完了）
                         │ ← フロント全業務画面統合スプリント
                         │
    P7（通知ロジック・S-07）       P6（監査ログ）
                         │
                    ← M4（監査ログ + P7完了）
                         │
              P8（セキュリティ・本番対応）両チーム
                         │
                    ← M5（リリース準備完了）
```

---

### 14.7 P0フェーズのコンフリクト回避方針

P0フェーズはチームAとBが `app.js` を同時に編集するため、以下のルールで衝突を防ぐ。

| ルール | 内容 |
|-------|------|
| 関数単位の所有権 | §14.2のapp.js所有領域の定義を遵守する。他チームの関数を直接編集しない |
| 日次マージ | 各チームはブランチを毎日 `develop` にpushし、テックリードが差分を確認する |
| 新規関数は末尾追加 | 新規追加の関数・HTMLブロックはファイル末尾または明示したセクション末尾に追加し、既存コードへの挿入は避ける |
| S-12・S-15は排他 | S-12（承認一覧）とS-15（設定画面）はチームAが単独所有。チームBはこれらの関数を編集しない |
| 共有ロジックはsrc/に | 両チームが使うロジックは `app.js` ではなく `src/` のモジュールに実装し、importして利用する |
| PRレビュー必須 | P0完了後のdevelop mergeは必ずテックリードがPRレビューを行ってからマージする |

---

### 14.8 工数見積もり（2チーム体制）

| フェーズ | 内容 | チームA | チームB | 暦日（並行） |
|---------|------|--------|--------|------------|
| P0 | フロントエンド修正 | 9.5日（A担当分） | 4日（B担当分）→P1先行 | **10日** |
| P1 | バックエンド基盤 | — | Hono+DB+auth（3-4日）＋approval tables追加（巻き取り・1日） | **4日** |
| P2 | マスタAPI | — | 3-4日 | **3日** |
| P3 | 業務伝票API前半 | 承認EP（3日） | CRUD（4-5日） | **5日** |
| P4 | 業務伝票API後半 | — | 4-5日 | **4日** |
| P5 | 承認・通知API | 3-4日 | — | **3日** |
| 統合SP | フロント全画面API化 | 3日 | 3日 | **3日** |
| P6 | 監査ログ | — | 2-3日 | **2日** |
| P7 | フロント未実装補完 | 2日 | 2日 | **2日** |
| P8 | セキュリティ・本番対応 | 1-2日 | 1-2日 | **2日** |
| **合計** | | | | **約38日 → 8週間** |

1チーム逐次実装（§11の24〜32日＋P0の14日＝38〜46日）と比較して、**2チーム体制で約30〜35%の期間短縮**が見込める。

---

### 14.9 チームA作業巻き取り記録（2026-05-05決定）

#### 背景

スプリント5時点でチームAの進捗が未確認のまま、M2合流条件のM2-4（承認ルートCRUD API）が未実装であることが判明した。チームBはP1〜P3を完了しており、M2-4はP4着手前の前提条件に当たるため、チームBがM2-4を巻き取りM2合流後にP4へ進む方針に変更する。

#### 巻き取り項目

| 項目 | 元担当 | 巻き取り後担当 | 対応マイルストーン |
|-----|-------|-------------|----------------|
| `approval_routes` / `approval_history` テーブル定義（schema.js追加） | チームA | チームB | M1-5 |
| `approvalRouteRepository` + `/api/approval-routes` CRUD（TDD） | チームA | チームB | M2-4 |

#### 巻き取り対象外（チームAが引き続き担当）

- P5：承認・通知API（`/api/approvals`, `/api/notifications`、N-01〜N-04）
- P7：通知ロジック最終実装・S-07独立画面化
- P8：パスワードポリシー・アカウントロック

#### チームBの作業順序（本決定以降）

1. approval_routes / approval_history テーブルをschema.jsに追加（M1-5）
2. `approvalRouteRepository` 作成（TDD）
3. `/api/approval-routes` CRUD ルート作成（TDD）→ M2-4完了
4. M2合流確認
5. P4（発注・請求・支払API）着手
