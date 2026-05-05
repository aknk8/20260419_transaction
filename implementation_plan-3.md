# 取引管理システム 第3期実装計画

策定日: 2026-05-06

入力ドキュメント:
- `implementation_plan-2.md` — 第2期計画（未完了タスクを本ファイルに引き継ぎ）
- `code-review/VA-result.md` — 脆弱性診断結果（VA-01〜VA-09）
- `code-review/test-abnormal-permission-review-2026-05-05.md` — 異常系・権限テスト追加観点レビュー

---

## 1. 第2期完了済みタスク（参考）

| フェーズ | 内容 |
|---------|------|
| P0-01〜14 | フロントエンド修正全件（差戻し→却下統一、見積ステータス、発注残計算、入金差額、ダッシュボード種別表示、承認UI全面実装） |
| P1 | Fastify + PostgreSQL + JWT認証基盤 |
| P2 | マスタデータAPI（customers, suppliers, products, users） |
| P3 | 業務伝票API前半（projects, quotations, orders）+ 承認エンドポイント |
| P4 | 業務伝票API後半（purchaseOrders, invoices, receipts, payments） |
| P6 | 監査ログ実装（全MUTATIONエンドポイントに適用済み） |
| P7（チームB担当）| S-03/S-06/S-09/S-10 フロントAPI統合、S-07 納品・検収独立画面化、S-14 通知ロジック（N-04/05/06） |
| P8（基盤）| @fastify/helmet, cors, rate-limit, dotenv、docker-compose.yml、.env.example |
| チームA巻き取り | approval_routes/approval_history テーブル、approvalRouteRepository、/api/approval-routes CRUD |
| M4-1/M4-2 | 監査ログ全MUTATIONに適用、承認・却下のaudit_logs記録 |

---

## 2. 未完了タスク一覧

### 2.1 implementation_plan-2.md からの引き継ぎ

| ID | タスク | 担当 | 優先度 |
|----|-------|------|--------|
| T-01 | M4-5: E2Eテスト残1件修正（全テストパス達成） | QAエンジニアE | 🔴 最高 |
| T-02 | P5: 承認・通知API（/api/approvals, /api/notifications） | チームA | 🔴 最高 |
| T-03 | P5: N-04 滞留通知バックエンドJob（node-cron） | チームA | 🟠 高 |
| T-04 | Deliveries API（GET/POST/PATCH /api/deliveries） | チームB | 🟠 高 |
| T-05 | P7: S-04（見積）フロントAPI統合 | チームA | 🟠 高 |
| T-06 | P7: S-05（受注）フロントAPI統合 | チームA | 🟠 高 |
| T-07 | P7: S-08（請求）フロントAPI統合 | チームA | 🟠 高 |
| T-08 | P7: S-07 deliveries フロントAPI統合（T-04前提） | チームB | 🟠 高 |
| T-09 | P8: パスワードポリシー（最小長・複雑性） | チームA | 🟠 高 |
| T-10 | P8: アカウントロック機能（連続失敗でロック） | チームA | 🟠 高 |
| T-11 | P8: リフレッシュトークンのローテーション実装 | チームA | 🟡 中 |
| T-12 | M5-2: payments.status='差戻し'→'却下' データマイグレーション | チームB | 🟠 高 |
| T-13 | M5-5: 全E2Eテストパス + 性能要件確認（一覧画面3秒以内） | QA | 🔴 最高 |

### 2.2 脆弱性診断（VA）対応（新規）

| ID | タスク | 担当 | 優先度 |
|----|-------|------|--------|
| P9-A-01 | requirePermission サーバー側認可ミドルウェア実装（VA-01） | チームB | 🔴 最高 |
| P9-A-02 | JWT_SECRET 未設定時の本番起動失敗化（VA-02） | チームB | 🔴 最高 |
| P9-B-01 | 通知既読化の所有者チェック追加（VA-03） | チームB | 🟠 高 |
| P9-B-02 | 入力スキーマ定義とMass Assignment対策（VA-04） | チームB | 🟠 高 |
| P9-B-03 | ログイン専用レートリミットと停止ユーザのログイン拒否（VA-05） | チームB | 🟠 高 |
| P9-C-01 | CSRF対策の明示化（@fastify/csrf-protection）（VA-07） | チームA | 🟡 中 |
| P9-C-02 | JWT失効設計・セッション管理 Phase 1（VA-06） | チームA | 🟡 中 |
| P9-D-01 | /api/auth/me に permissions 追加 + フロント権限移行（VA-08） | チームA/B | 🟡 中 |
| P9-E-01 | escapeHtml 漏れ修正 + CSP設定（VA-09） | チームB | 🟡 中 |

### 2.3 回帰テスト強化（P10）

| ID | タスク | 担当 | 優先度 |
|----|-------|------|--------|
| P10-RT-01 | 却下→修正→再申請 E2Eシナリオ（全4伝票） | QA-E/F | 🔴 最高 |
| P10-RT-02 | 各画面バリデーションE2Eの分散追加（8ファイル） | QA-F | 🔴 最高 |
| P10-RT-03 | 複数ステップ承認の途中ステップ却下 E2E | QA-E | 🟠 高 |
| P10-RT-04 | 発注→納品→請求のデータ連鎖整合性 E2E | QA-E/F | 🟠 高 |
| P10-RT-05 | 大量データ・ページネーション動作確認 | QA-F | 🟡 中 |
| P10-RT-06 | 同時操作・競合シナリオ（将来対応） | QA | — |

---

## 3. タスク詳細（引き継ぎ分）

### T-01: E2Eテスト残1件修正（M4-5）

**現状**: 542テスト通過、1テスト失敗（失敗テスト名要確認）

**作業**:
```bash
npx playwright test --reporter=list 2>&1 | findstr /C:"✘" /C:"FAILED"
```
で失敗テストを特定し、app.js または E2E スペックを修正して全テスト通過を達成する。

---

### T-02: 承認・通知API（P5）

#### エンドポイント

```
GET    /api/approvals                  承認待ち一覧（伝票種別フィルタ可）
POST   /api/approvals/:id/approve      承認実行
POST   /api/approvals/:id/reject       却下実行（コメント必須）

GET    /api/notifications              通知一覧
PUT    /api/notifications/:id/read     既読化
POST   /api/notifications/read-all     全件既読化
```

#### DBスキーマ（新規）

```sql
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       VARCHAR(50) REFERENCES users(id),
  type          VARCHAR(50) NOT NULL,  -- N-01〜N-06
  title         VARCHAR(200) NOT NULL,
  body          TEXT,
  document_type VARCHAR(50),
  document_id   VARCHAR(100),
  is_read       BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
```

#### 実装方針

`/api/approvals` は各伝票テーブル（quotations, orders, purchase_orders, invoices, payments）を横断クエリして `status = '承認依頼中'` のレコードを返す。承認・却下は既存の `/approve`・`/reject` エンドポイントに委譲する。

#### TDD進め方

1. `notificationRepository` ユニットテスト → 実装
2. `GET /api/notifications` 統合テスト → 実装
3. `PUT /api/notifications/:id/read` 統合テスト → 実装
4. 各承認イベントで通知レコード自動生成サービス → 実装
5. `GET /api/approvals` 統合テスト → 実装

---

### T-03: N-04 滞留通知バックエンドJob

**仕様**:
- `node-cron` を使い、平日9:00 JSTに `checkOverdueApprovals()` を実行
- 対象: 各伝票テーブルの `status = '承認依頼中'` かつ `updated_at` が `approvalStalenessDays`（初期値: 3）営業日以上前
- 未読の同一伝票通知が既存の場合はスキップ（重複防止）

```typescript
// server/jobs/overdueApprovalJob.ts
import cron from 'node-cron';
cron.schedule('0 9 * * 1-5', async () => {
  await checkAndNotifyOverdueApprovals(db, settings);
}, { timezone: 'Asia/Tokyo' });
```

**前提**: T-02（notifications テーブル）完了後に着手

---

### T-04: Deliveries API

#### エンドポイント

```
GET    /api/deliveries                  納品一覧（purchaseOrderCode フィルタ可）
GET    /api/deliveries/:code            納品詳細
POST   /api/deliveries                  納品登録
PATCH  /api/deliveries/:code            ステータス更新（検収済/検収NG）
```

#### DBスキーマ（新規）

```sql
CREATE TABLE deliveries (
  code                VARCHAR(20) PRIMARY KEY,
  purchase_order_code VARCHAR(20) REFERENCES purchase_orders(code),
  delivery_date       DATE NOT NULL,
  status              VARCHAR(30) NOT NULL DEFAULT '検収待ち',
  notes               TEXT,
  created_by          VARCHAR(50) REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE delivery_details (
  id                 SERIAL PRIMARY KEY,
  delivery_code      VARCHAR(20) REFERENCES deliveries(code),
  line_no            INTEGER NOT NULL,
  delivered_quantity NUMERIC(10,3) NOT NULL DEFAULT 0
);
```

#### TDD進め方

1. `deliveryRepository` ユニットテスト → 実装
2. `POST /api/deliveries` 統合テスト → 実装
3. `PATCH /api/deliveries/:code` 統合テスト → 実装
4. `GET /api/deliveries` 統合テスト → 実装
5. E2Eテスト確認（`e2e/delivery.spec.js`）

---

### T-05〜T-07: フロントAPI統合（見積・受注・請求）

**共通移行パターン**（implementation_plan-2.md §10.1 参照）:

1. `refreshXxx()` が `apiFetch('/api/xxx')` を呼び出していることを確認
2. 登録・更新ハンドラ内の `xxxs.push(...)` / `xxx.status = ...` 等の直接変更を API 呼び出し後の `refreshXxx()` に置き換え
3. E2Eテストがパスすることを確認

**T-05（S-04見積）修正対象ハンドラ**:
- 見積新規登録フォーム送信
- 見積更新フォーム送信
- 改版ボタン押下
- 承認依頼ボタン押下の optimistic update 部分

**T-06（S-05受注）修正対象ハンドラ**:
- 受注承認依頼ボタン
- 発注起票ボタン

**T-07（S-08請求）修正対象ハンドラ**:
- 請求新規登録フォーム送信
- 承認依頼ボタン押下
- 確定・送付済ボタン押下

---

### T-08: S-07 deliveries フロントAPI統合

**前提**: T-04（Deliveries API）完了後に着手

**修正対象**:
- 納品登録フォーム送信: `deliveries.push(...)` → `POST /api/deliveries` + `refreshDeliveries()`
- 検収ボタン押下: `dlv.status = ...` → `PATCH /api/deliveries/:code` + `refreshDeliveries()`
- `refreshDeliveries()` を `GET /api/deliveries` 呼び出しに修正

---

### T-09: パスワードポリシー（P8）

```typescript
// server/services/authService.ts
const passwordSchema = z.string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    'パスワードは大文字・小文字・数字をそれぞれ1文字以上含めてください');
```

**TDD**:
```
it('should return 400 when password is shorter than 8 chars')
it('should return 400 when password lacks uppercase letter')
it('should return 400 when password lacks digit')
it('should succeed with valid complex password')
```

---

### T-10: アカウントロック機能（P8）

**仕様**:
- ログイン失敗5回連続でアカウントを30分間ロック
- `users` テーブルに `failed_login_count` / `locked_until` カラムを追加

```sql
ALTER TABLE users
  ADD COLUMN failed_login_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN locked_until TIMESTAMPTZ;
```

**TDD**:
```
it('should return 401 when account is locked')
it('should reset counter on successful login')
it('should unlock account after 30 minutes')
it('should not reveal lock reason in error message')
```

---

### T-11: リフレッシュトークンのローテーション（P8）

**仕様**: リフレッシュトークン使用時に旧トークンを無効化し新トークンを発行。既に無効化済みトークンの使用を検知した場合は全セッションを無効化（盗用検知）。

`refresh_tokens` テーブルの `revoked` カラムを活用。

---

### T-12: payments.status データマイグレーション（M5-2）

```sql
-- マイグレーションファイルとして追加
UPDATE payments SET status = '却下' WHERE status = '差戻し';
```

**注意**: 本番データの変換前に必ずバックアップを取得すること。

---

### T-13: 最終E2Eテスト + 性能確認（M5-5）

1. 全E2Eテスト（`e2e/` 以下 542+ テスト）がゼロ退行でパスすること
2. 実バックエンドAPI（PostgreSQL接続あり）での E2E テストがパスすること
3. 主要一覧画面の初期表示が3秒以内であること（Chrome DevTools で確認）

---

## 4. タスク詳細（VA対応・P9）

### フェーズ P9-A: 認可ミドルウェア実装 ★緊急

**対応VA:** VA-01、VA-02

#### P9-A-01: requirePermission サーバー側認可ミドルウェア（VA-01）

**背景**: 全APIルートが `fastify.authenticate` のみで保護されており、業務権限（`master:edit`、`approval:act` 等）の確認がサーバー側に存在しない。

**実装内容**:

```javascript
// server/plugins/authorization.js
export function requirePermission(permission) {
  return async function(request, reply) {
    const userPermissions = request.user?.permissions ?? [];
    if (!userPermissions.includes(permission)) {
      reply.code(403).send({ error: { message: '権限がありません' } });
    }
  };
}
```

**各ルートへの権限設定**:

| ルート | 追加権限 |
|-------|---------|
| `POST/PATCH /api/customers` | `master:edit` |
| `POST/PATCH /api/suppliers` | `master:edit` |
| `POST/PATCH /api/products` | `master:edit` |
| `GET/POST/PATCH /api/users` | `user-permission:edit` |
| `POST/PATCH/DELETE /api/approval-routes` | `user-permission:edit` |
| `POST /api/*/submit-approval` | `approval:apply` |
| `POST /api/*/approve` | `approval:act` |
| `POST /api/*/reject` | `approval:act` |
| `POST /api/payments/:code/register` | `payment:edit` |

**TDD**: 権限なしユーザで各APIが403を返すこと（`server/routes/*.test.js` に追加）

#### P9-A-02: JWT_SECRET 未設定時の本番起動失敗化（VA-02）

```javascript
// server/index.js
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production');
  process.exit(1);
}
```

---

### フェーズ P9-B: セキュリティ補強 ★重要

**対応VA:** VA-03、VA-04、VA-05

#### P9-B-01: 通知既読化の所有者チェック（VA-03）

`PUT /api/notifications/:id/read` に `recipientId === req.user.id` の確認を追加。他ユーザの通知IDへは 404 を返す。

#### P9-B-02: 入力スキーマとMass Assignment対策（VA-04）

Fastify JSON Schema で許可フィールドのみ受け付ける（`additionalProperties: false`）。ユーザ管理APIを最優先で対応。

#### P9-B-03: ログイン専用レートリミットと停止ユーザ拒否（VA-05）

```javascript
// /api/auth/login に専用 rate limit
onRequest: [fastify.rateLimit({ max: 5, timeWindow: '1 minute' })]

// authService.js
if (user.status !== '有効') throw new AuthError('アカウントが無効です', 401);
```

---

### フェーズ P9-C: CSRF・セッション強化 ★中優先

**対応VA:** VA-06、VA-07

#### P9-C-01: CSRF対策の明示化（VA-07）

`@fastify/csrf-protection` を導入し、全状態変更API（POST/PATCH/DELETE）にCSRFトークン検証を追加。フロントの `apiFetch` にトークン付加ロジックを組み込む。

#### P9-C-02: JWT失効設計 Phase 1（VA-06）

- JWTに `jti`（UUID）を追加
- ログイン時にセッション登録、ログアウト時にセッション削除
- JWT検証時にセッション有効性を確認

---

### フェーズ P9-D: フロント権限のサーバー移行 ★中優先

**対応VA:** VA-08

`GET /api/auth/me` のレスポンスに `permissions` を追加し、フロントがAPIレスポンスの権限情報を参照するよう移行する。

---

### フェーズ P9-E: XSS・DOM改善 ★低-中優先

**対応VA:** VA-09

- `app.js` の `innerHTML` テンプレートで `escapeHtml` 漏れ箇所を修正
- `@fastify/helmet` にCSPを明示設定（`script-src 'self'`）

---

## 5. タスク詳細（P10 回帰テスト強化）

### P10-RT-01: 却下→修正→再申請 E2Eシナリオ（★★★）

各伝票（見積・発注・請求・支払依頼）について、却下後に申請者が修正して再申請し、最終承認済みになるまでのフローを E2E テストとして追加する。

**追加対象ファイル**: `e2e/quotation.spec.js`, `e2e/purchaseOrder.spec.js`, `e2e/invoice-approval.spec.js`, `e2e/payment.spec.js`

### P10-RT-02: 各画面バリデーションE2Eの分散（★★★）

`explore-et07-validation.spec.js` の内容を各業務画面 spec.js に重複追加する。`explore-et07` は削除しない。

**追加対象ファイル**: quotation, order, purchaseOrder, invoice, payment, receipt, customer-master, user-master の各 spec.js

### P10-RT-03: 複数ステップ承認の途中ステップ却下（★★）

第1ステップ承認後に第2ステップで却下した場合のステータス・通知・再申請可否を確認する E2E テストを追加する。

### P10-RT-04: 発注→納品→請求のデータ連鎖整合性（★★）

一部納品後の発注残数量変化、全納品後の受注ステータス変化、請求金額整合を一気通貫で確認する E2E テストを追加する。

### P10-RT-05: 大量データ・ページネーション（★）

21件以上データが存在する場合の複数ページ遷移・件数表示を確認する。

---

## 6. マイルストーン

### M4（更新）: E2E全パス + P5完了

| # | 確認項目 | 担当 | 状態 |
|---|---------|------|------|
| M4-1 | 監査ログが全MUTATIONに適用済み | チームB | ✅ 完了 |
| M4-2 | 承認・却下操作が audit_logs に記録される | チームB | ✅ 完了 |
| M4-3 | N-04 滞留通知バックエンドJob が動作する | チームA | ⏳ T-03 |
| M4-4 | S-07・S-14・S-15承認条件UIが完成している | 両チーム | ✅ 完了 |
| M4-5 | 全E2Eテストがパスし、退行がないこと | QA | ⏳ T-01 |

### M5（更新）: 本番リリース準備完了

| # | 確認項目 | 担当 | 状態 |
|---|---------|------|------|
| M5-1 | セキュリティヘッダ・レートリミット・CORSが設定済み | 両チーム | ✅ 完了 |
| M5-2 | payments.status='差戻し'→'却下' マイグレーション完了 | チームB | ⏳ T-12 |
| M5-3 | パスワードポリシー・アカウントロックが実装済み | チームA | ⏳ T-09/10 |
| M5-4 | docker-compose.yml / .env.example が整備済み | チームB | ✅ 完了 |
| M5-5 | 全E2Eテストパス + 性能要件（一覧3秒以内）を満たす | QA | ⏳ T-13 |

### M-VA1: 認可強化完了（P9-A完了）

| # | 確認項目 | 担当 |
|---|---------|------|
| M-VA1-1 | requirePermission が全対象ルートに適用済み | チームB |
| M-VA1-2 | JWT_SECRET未設定のproduction起動が失敗する | チームB |
| M-VA1-3 | master:edit なしで403になるAPIテストがパス | QA/チームB |
| M-VA1-4 | approval:act なしで403になるAPIテストがパス | QA/チームB |
| M-VA1-5 | user-permission:edit なしで403になるAPIテストがパス | QA/チームB |

### M-VA2: セキュリティ補強完了（P9-B完了）

| # | 確認項目 | 担当 |
|---|---------|------|
| M-VA2-1 | 他ユーザ通知の既読化が 404/403 になることをAPIテストで確認済み | チームB |
| M-VA2-2 | 余剰フィールド送信が 400 になることをAPIテストで確認済み | チームB |
| M-VA2-3 | 停止ユーザでログインできないことをAPIテストで確認済み | チームB |
| M-VA2-4 | ログイン連続失敗で 429 が返ることをAPIテストで確認済み | チームB |

### M-VA3: P9全フェーズ完了

| # | 確認項目 | 担当 |
|---|---------|------|
| M-VA3-1 | M-VA1、M-VA2の全条件を満たす | 両チーム |
| M-VA3-2 | CSRFトークンなしの状態変更APIが403になるAPIテストがパス | チームA |
| M-VA3-3 | ログアウト後の旧JWTが拒否されることをAPIテストで確認済み | チームA |
| M-VA3-4 | /api/auth/me に permissions が含まれる | 両チーム |
| M-VA3-5 | CSPヘッダーが全レスポンスに含まれることをAPIテストで確認済み | チームB |
| M-VA3-6 | 全E2Eテストが退行なしでパス | QA-E/F |

### M-RT1: 回帰テスト強化完了

| # | 確認項目 | 担当 |
|---|---------|------|
| M-RT1-1 | 却下→修正→再申請E2Eが全4伝票でパス | QA-E/F |
| M-RT1-2 | 各業務画面spec.jsにバリデーションdescribeが追加されパス | QA-F |
| M-RT1-3 | 複数ステップ承認途中却下E2Eがパス | QA-E |
| M-RT1-4 | 発注→納品→請求データ連鎖整合性E2Eがパス | QA-E/F |
| M-RT1-5 | 全既存E2Eテストが退行なしでパス | QA-E/F |

---

## 7. チーム再編成と並行作業計画【改訂版】

### 7.1 改訂の方針

**現行計画の問題点:**

1. チームAが T-02→T-03→T-05〜07→T-09〜11→P9-C/D と直列14日分を1チームで担っており、スプリント3本にわたる
2. フロントエンジニア(FE-A/B)がバックエンド完了待ちでアイドルになる期間が長い
3. Deliveries実装(T-04)とセキュリティ(P9-A)が同一チームBに集中し、両方が遅延リスクを抱える
4. QA 2名でP10回帰テスト(8日工数)を担うため、並列化できず4日以上かかる

**改訂方針:**

- 機能別専任チームへ再編し、全チームDay 1から同時スタート
- BE-G・BE-H（バックエンド、セキュリティ専任）、QA-H（回帰テスト分担）の3名を増員
- 依存関係のないタスクはすべて並行実行
- 目標完了: **約10日**（改訂前: 約3〜4週間）

---

### 7.2 チーム構成（改訂後）

| チーム | メンバー | 担当スコープ | 工数合計 | 完了目安 |
|-------|---------|------------|---------|---------|
| チームA | BE-C | T-02（承認・通知API）, T-03（N-04 Job）, P9-D backend | 5.5日 | Day 6 |
| チームB | BE-D | T-12（DBマイグ）, T-04（Deliveries API）, T-08（deliveries統合）, P9-B-01/02 | 7日 | Day 7 |
| チームC1 | BE-G（**新規**） | P9-A-01/02（認可ミドルウェア）, P9-C-01 backend（CSRF）, P9-C-02（JWT失効） | 5.5日 | Day 6 |
| チームC2 | BE-H（**新規**） | T-09（PWポリシー）, T-10（アカウントロック）, T-11（トークンローテーション）, P9-B-03（rate limit）, P9-E backend（CSP） | 4.5日 | Day 5 |
| チームD | FE-A + FE-B | T-05/06/07（フロント統合）, P9-C-01 frontend（CSRF）, P9-D frontend（権限移行）, P9-E frontend（escapeHtml） | 各4日 | Day 5 |
| QA | QA-E + QA-F + QA-H（**新規**） | T-01, P10-RT-01〜05, T-13 | 9.5日÷3名 | Day 10 |

> **増員理由**
> - BE-G: P9-A（認可ミドルウェア）はリスク最大の脆弱性対応であり、既存タスクと並行させるため専任が必要
> - BE-H: 認証セキュリティ(T-09〜11)はP9-Aと独立しており、即日着手可能。専任で Day 5 に完了できる
> - QA-H: P10回帰テスト(8日工数)を3名並列で3日に圧縮。T-13の着手を早める

---

### 7.3 並行実行スケジュール（10日ガントチャート）

```
        Day1        Day2        Day3        Day4        Day5        Day6        Day7        Day8        Day9        Day10
チームA ├─T-02──────────────────────────┤T-03├──┤P9-D BE├──────────────────────────────────────────────────────────────┤
BE-C    │承認・通知API(4日)            │1日 │0.5│                                                                      │
        │                              │    │  ✅M4-3                                                                  │

チームB ├T-12┤T-04─────────────────┤T-08────┤P9-B-01┤P9-B-02──────────────────────────────────────────────────────────┤
BE-D    │0.5│Deliveries API(3日)  │1日     │0.5日  │1.5日                                                            │

チームC1├─P9-A-01+02────────────┤P9-C-01BE┤P9-C-02──────────────────────────────────────────────────────────────────┤
BE-G    │認可ミドルウェア(3日)  │0.5日    │JWT失効設計(2日)                                                         │
        │         ✅M-VA1       │         │                                                                          │

チームC2├─T-09──┤T-10──┤T-11──┤P9-B-03┤P9-E BE──────────────────────────────────────────────────────────────────────┤
BE-H    │PW(1日)│ロック│ローテ│0.5日  │CSP(0.5日)                                                                   │
        │       │(1日) │(1日) │       │                                                                              │

チームD ├T-05┤T-06┤T-07────┤P9-C-01 FE──────┤P9-D FE──┤P9-E FE──────────────────────────────────────────────────────┤
FE-A    │見積│受注│請求    │CSRF frontend   │権限移行 │escapeHtml                                                    │
FE-B    │1日 │0.5 │1日     │(各1日)         │(各0.5日)│(各0.5日)                                                    │

QA-E    ├T-01┤RT-01 spec着手─────────────────┤RT-01実行──────────┤RT-03実行──────────┤T-13──────────────────────────┤
        │0.5 │(4伝票spec, days 1-3)           │(2日, T-02完了後)  │(2日)              │最終E2E+性能(1日)             │

QA-F    ├─RT-02─────────────┤RT-04──────────┤RT-05──┤──────────────────────────────────────────────────────────────────┤
        │バリデーションE2E(3日)│データ連鎖(2日) │ページ │                                                              │
        │(Day 1から即着手)    │               │(1日)  │                                                              │

QA-H    ├─VA test spec──────────────┤M-VA1確認──┤M-VA2確認──┤M-VA3全確認────────────────────────────────────────────┤
        │セキュリティテスト仕様策定  │P9-A完了確認│P9-B完了確認│全P9フェーズ確認                                     │
```

---

### 7.4 マイルストーン達成タイミング（改訂後）

| マイルストーン | 達成日 | 前提タスク |
|-------------|-------|-----------|
| M4-3: N-04 滞留通知Job動作 | Day 5 | T-03完了 |
| M4-5: 全E2Eテストパス | Day 4 | T-01完了 + 既存テスト回帰なし |
| M-VA1: 認可強化完了 | Day 3 | P9-A-01/02完了（チームC1） |
| M5-3: PW/ロック実装済み | Day 4 | T-09/10完了（チームC2） |
| M-VA2: セキュリティ補強完了 | Day 5 | P9-B-01/02/03完了 |
| M5-2: DBマイグレーション完了 | Day 1 | T-12完了（チームB、Day 1 AM） |
| M-VA3: P9全フェーズ完了 | Day 7 | P9-C/D/E全完了（チームB最終タスク） |
| M-RT1: 回帰テスト強化完了 | Day 9 | P10-RT-01〜05全完了 |
| **M5: 本番リリース準備完了** | **Day 10** | **T-13完了** |

---

### 7.5 依存関係と並行実行マップ（改訂）

```
Day 1 全チーム同時スタート
│
├─[チームA]─ T-02(4日) ──────────────── T-03(1日) ── P9-D backend ──┐
│                                                                      │
├─[チームB]─ T-12(0.5日) ─ T-04(3日) ─ T-08(1日) ─ P9-B-01/02 ─────┤
│                                                                      │
├─[チームC1]─ P9-A-01/02(3日) ─ P9-C-01 BE(0.5日) ─ P9-C-02(2日) ──┤
│                                                                      │
├─[チームC2]─ T-09(1日) ─ T-10(1日) ─ T-11(1日) ─ P9-B-03 ─ P9-E BE┤
│                                                                      │
├─[チームD]── T-05/06/07(2.5日) ─ P9-C-01 FE ─ P9-D FE ─ P9-E FE ──┤
│                                                                      │
└─[QA-F]──── P10-RT-02(3日) ─ RT-04(2日) ─ RT-05(1日) ─────────────┤
                                                                       │
             [QA-E]─ T-01(0.5日) ─ RT-01 spec(3日) ─ RT-01実行(2日) ─ RT-03(2日) ─ T-13(1日) ─┐
             [QA-H]─ VA spec ─ M-VA1確認 ─ M-VA2確認 ─ M-VA3確認 ────────────────────────────────┤
                                                                                                    │
                                                              M5 + M-VA3 + M-RT1 = リリース準備完了 ✅
```

**完了を必要とする本当の直列依存関係:**
- T-02 → T-03（notificationsテーブルが前提）
- T-04 → T-08（Deliveries APIが前提）
- T-02完了後 → P10-RT-01実行可（承認フロー動作が前提）
- 全開発完了後 → T-13（全E2Eテストが対象）

**独立して即日着手できるタスク（Day 1同時スタート）:**
T-01 / T-02 / T-04 / T-05 / T-06 / T-07 / T-09 / T-10 / T-11 / T-12 / P9-A-01/02 / P9-B-03 / P10-RT-02

---

## 8. 工数見積もり（改訂版）

| タスク | チームA | チームB | チームC1 | チームC2 | チームD | QA | 暦日（並列後） |
|-------|--------|--------|---------|---------|--------|-----|--------------|
| T-01 E2E残1件 | — | — | — | — | — | 0.5日 | 0.5日 |
| T-02/03 P5承認・通知API | 5日 | — | — | — | — | — | 5日 |
| P9-D backend | 0.5日 | — | — | — | — | — | （T-03完了後 Day 6） |
| T-04/08 Deliveries | — | 4日 | — | — | — | — | 4日 |
| T-12 DBマイグ | — | 0.5日 | — | — | — | — | Day 1 AM |
| P9-B-01/02 セキュリティ補強① | — | 2日 | — | — | — | — | （T-08完了後） |
| P9-A-01/02 認可ミドルウェア | — | — | 3日 | — | — | — | 3日 |
| P9-C-01 BE + P9-C-02 | — | — | 2.5日 | — | — | — | （P9-A完了後） |
| T-09/10/11 P8セキュリティ | — | — | — | 3日 | — | — | 3日 |
| P9-B-03 + P9-E backend | — | — | — | 1日 | — | — | （T-11完了後） |
| T-05/06/07 フロント統合 | — | — | — | — | 2.5日 | — | 2.5日 |
| P9-C-01 FE + P9-D FE + P9-E FE | — | — | — | — | 3日 | — | （T-07完了後） |
| P10-RT-01 spec+実行 | — | — | — | — | — | 4.5日(E) | Day 1〜9 |
| P10-RT-02 バリデーション | — | — | — | — | — | 3日(F) | Day 1〜3 |
| P10-RT-03/04/05 | — | — | — | — | — | 5日(F+H) | Day 4〜9 |
| T-13 最終E2E+性能 | — | — | — | — | — | 1日(E) | Day 10 |
| **工数合計（人日）** | **5.5日** | **6.5日** | **5.5日** | **4.5日** | **各4日** | **9.5日** | — |
| **カレンダー日数** | — | — | — | — | — | — | **約10日** |

**改訂前後の比較:**

| 指標 | 改訂前 | 改訂後 | 短縮効果 |
|-----|-------|-------|---------|
| チーム数 | 2チーム + QA | 5チーム + QA | +3チーム |
| 開発メンバー数 | 4名 | 7名（+3名） | +75% |
| QA人数 | 2名 | 3名（+1名） | +50% |
| スプリント数 | 3（S8〜S10） | 1（全チーム同時） | -2スプリント |
| 目標完了日数 | 約3〜4週間（15〜21日） | **約10日** | **約60%短縮** |

---

## 9. 各チームのDay 1着手確認リスト

改訂後の計画では全チームがDay 1から即時着手する。以下は各チームの初日開始タスクを確認するためのチェックリスト。

### チームA（BE-C）
- [ ] T-02: notificationsテーブルDDL確認 → Fastifyルート実装開始

### チームB（BE-D）
- [ ] T-12: `UPDATE payments SET status = '却下' WHERE status = '差戻し'` 実施（AM）
- [ ] T-04: deliveriesテーブルDDL作成 → deliveryRepositoryユニットテスト → 実装開始（PM）

### チームC1（BE-G、新規）
- [ ] P9-A-02: `server/index.js` へJWT_SECRET本番起動チェック追加（AM、0.5日）
- [ ] P9-A-01: `server/plugins/authorization.js` requirePermission実装開始（PM〜）

### チームC2（BE-H、新規）
- [ ] T-09: `server/services/authService.ts` パスワードポリシーTDD開始（AM）
- [ ] T-10: usersテーブルALTER TABLE → アカウントロックTDD（PM）

### チームD（FE-A・FE-B）
- [ ] FE-A: T-05 見積フロントAPI統合（`refreshQuotations` → `apiFetch`）
- [ ] FE-B: T-06 受注フロントAPI統合（0.5日）→ T-07 請求フロントAPI統合

### QA-E
- [ ] T-01: `npx playwright test --reporter=list` で失敗テスト特定・修正（AM、0.5日）
- [ ] P10-RT-01: 却下→修正→再申請E2Eテストspec着手（見積spec、PM〜）

### QA-F
- [ ] P10-RT-02: 各業務画面バリデーションE2Eテストspec+実装開始（Day 1から即着手可）

### QA-H（新規）
- [ ] M-VA1テスト仕様策定（P9-A-01完了時にテスト実行できるよう準備）

---

## 10. 優先対応順（改訂後：チーム別Day 1同時スタート）

```
【Day 1: 全チーム同時スタート】
  チームA:  T-02（承認・通知API）
  チームB:  T-12（DBマイグ AM）→ T-04（Deliveries API）
  チームC1: P9-A-02（AM）→ P9-A-01（最大リスクの認可不備対応）
  チームC2: T-09 → T-10（認証セキュリティ）
  チームD:  T-05/06/07（フロントAPI統合）
  QA-E:    T-01（E2E残1件修正）→ RT-01 spec着手
  QA-F:    P10-RT-02（バリデーションE2E、依存なし即着手）
  QA-H:    M-VA1テスト仕様策定

【Day 3: P9-A-01完了後（チームC1）】
  → P9-C-01 backend（CSRF Fastifyプラグイン）着手
  → QA-H: M-VA1テスト実行

【Day 3-4: T-04完了後（チームB）】
  → T-08（deliveriesフロントAPI統合）着手
  → QA-F: P10-RT-04（発注→納品→請求データ連鎖E2E）実行可

【Day 4-5: T-02完了後（チームA）】
  → T-03（N-04滞留通知Job）着手
  → QA-E: P10-RT-01実行フェーズ開始（承認フロー動作確認）

【Day 5: チームC2・チームD完了】
  → QA-H: M-VA2テスト実行
  → QA集中: P10-RT-01/03/04/05 並列実行

【Day 7: 全開発タスク完了（チームB P9-B-02完了）】
  → M-VA3確認（P9全フェーズ + 全E2E退行なし）

【Day 10: リリース判定】
  → T-13: 全E2Eテストパス + 性能要件（一覧3秒以内）確認
  → M5 + M-VA3 + M-RT1 = リリース準備完了 ✅
```
