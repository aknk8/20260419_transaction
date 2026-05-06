# 取引管理システム 第4期実装計画

策定日: 2026-05-06

入力ドキュメント:
- `implementation_plan-3.md` — 第3期計画（未完了タスクを本ファイルに引き継ぎ）
- `docs/future_implementation_backlog.md` — 将来実装バックログ（★★★優先度の未対応項目）
- 各チームメモリ（teamA_state.md / teamB_state.md / teamD_state.md / project_state.md）

---

## 1. 完了済みタスク（参考）

### 1.1 第3期完了済みタスク

| タスク | 担当 | 状態 |
|-------|------|------|
| T-02: 承認・通知API（/api/approvals, /api/notifications） | チームA | ✅ 完了 |
| T-03: N-04 滞留通知バックエンドJob | チームA | ✅ 完了 |
| T-04: Deliveries API | チームB | ✅ 完了 |
| T-05/T-06: 見積・受注フロントAPI統合 | チームD | ✅ 完了 |
| T-07: 請求フロントAPI統合 | チームD | ✅ 完了 |
| T-08: deliveriesフロントAPI統合 | チームB | ✅ 完了 |
| T-12: payments.status データマイグレーション | チームB | ✅ 完了 |
| P9-A-01: requirePermission 認可ミドルウェア | チームC1 | ✅ 完了 |
| P9-A-02: JWT_SECRET 未設定時の起動失敗化 | チームC1 | ✅ 完了 |
| P9-B-01: 通知既読化の所有者チェック | チームA/B | ✅ 完了 |
| P9-B-02: 入力スキーマ + Mass Assignment対策 | チームB | ✅ 完了 |
| P9-C-01（BE）: CSRF対策（Origin検証） | チームC1 | ✅ 完了 |
| P9-C-02: JWT失効設計・セッション管理 | チームC1 | ✅ 完了 |
| P9-D: /api/auth/me への permissions 追加 | チームA | ✅ 完了 |
| P9-E（FE一部）: sampleUsersHtml escapeHtml 修正 | チームD | ✅ 完了 |

### 1.2 第4期実装済みタスク（2026-05-06 確認）

| タスク | 担当 | 確認根拠 |
|-------|------|---------|
| T-09: パスワードポリシー | チームC2 | passwordPolicy.js + 8テスト |
| T-10: アカウントロック（5回→30分） | チームC2 | 002_account_lock.sql + authService.js |
| T-11: リフレッシュトークンローテーション・盗用検知 | チームC2 | refreshTokenService.js + 10テスト |
| P9-B-03: ログイン専用レートリミット + 停止ユーザ拒否 | チームC2 | auth.js rateLimit設定 + テスト |
| P9-E-BE: CSP設定（@fastify/helmet） | チームC2 | app.js contentSecurityPolicy設定 |
| P9-C-01-FE: CSRF frontend対応 | チームD | vite.config.js + csrf-protection.spec.js |
| UX-01: 全画面フィードバックUI | チームD + チームE | ui-feedback.js + app.js全面適用（46箇所以上） |
| INF-04: Pinoログ設定・スロークエリ検出 | チームC1 | slowQuery.js + server/index.js |
| INF-05: ヘルスチェックエンドポイント | チームC1 | server/routes/health.js |
| INF-06: 環境分離（dev/staging/prod） | SRE-I | .env.development + docker-compose.staging.yml |
| INF-03: HTTPS/TLS・nginxリバースプロキシ | SRE-I | infra/nginx.conf + scripts/init-tls.sh |
| INF-02: DBバックアップ設計 | SRE-I | scripts/backup.sh + docs/restore-procedure.md |
| INF-01 + RT-07: CI/CDパイプライン | SRE-I | .github/workflows/ci.yml（3ジョブ構成） |
| INF-09: 番号採番の競合制御 | チームB | sequenceCounterRepository.js + sequenceService.js + 003_sequence_counters.sql |
| BL-04: 受注承認依頼バリデーション | チームA | orderService.js submitOrderApproval + orderAttachments |
| BL-02: 複数受注の合算請求・消費税一括計算 | チームA | invoiceService.js orderCodes配列対応（BL-02コメント確認） |
| RT-01〜RT-04, RT-06: 新規E2Eスペック作成 | QA-H + QA-I | full-flow / president-approval / receipt-edge / order-approval-validation / permission-negative |

---

## 2. 残タスク一覧（2026-05-06 時点）

> 完了済みタスクはセクション 1.2 に移動済み。本セクションは未完了・未着手・要確認のみ記載。

### 2.1 implementation_plan-3.md からの引き継ぎ（残）

| ID | タスク | 担当 | 優先度 | 状態 |
|----|-------|------|--------|------|
| T-01 | E2Eテスト状況調査・失敗テスト修正 | QA-E | 🔴 最高 | ❓ 解決未確認。T-13前提 |
| P10-RT-01 | 却下→修正→再申請 E2Eシナリオ（全4伝票） | QA-E | 🔴 最高 | ❌ 専用フロー未確認 |
| P10-RT-02 | 各画面バリデーションE2Eの分散追加（8ファイル） | QA-F | 🔴 最高 | ❓ 移植状況未確認 |
| P10-RT-03 | 複数ステップ承認の途中ステップ却下 E2E | QA-H | 🟠 高 | △ approval-multistep.spec.js 存在、内容確認要 |
| P10-RT-04 | 発注→納品→請求のデータ連鎖整合性 E2E | QA-E/F | 🟠 高 | △ zzz-data-chain.spec.js 追加済み、本格実装未 |
| P10-RT-05 | 大量データ・ページネーション動作確認 | QA-F | 🟡 中 | 🔴 INF-08未完でブロック中 |
| AT-01 | サーバー側認可テスト（ログイン429・停止401） | QA-H | 🟠 高 | ❓ spec追加状況未確認 |
| T-13 | 全E2Eテストパス + 性能要件確認（一覧3秒以内） | QA（E/F/H） | 🔴 最高 | ❌ 全開発完了待ち |

### 2.2 新規タスク（残）

#### 業務ロジック

| ID | タスク | 担当（再編後） | 優先度 | 状態 |
|----|-------|------------|--------|------|
| BL-03 | 顧客マスタへの締日・支払サイト・請求先管理（API統合） | チームA（BE-C）+ **チームD（FE、再配置）** | 🔴 最高 | △ スキーマ追加済み。customers route/service 未統合 |
| BL-01 | 月次締め処理（締日基準請求抽出・月次集計） | チームA（BE-C） | 🟠 高 | ❌ 未着手（BL-03完了後着手） |

#### インフラ・基盤

| ID | タスク | 担当（再編後） | 優先度 | 状態 |
|----|-------|------------|--------|------|
| INF-10 | DBトランザクション境界の設計と実装 | チームB（BE-D）+ **チームC1（BE-G、再配置）** | 🔴 最高 | ❌ 未着手。承認/請求確定/入金消込の3操作が対象 |
| INF-07 | DBインデックス設計・クエリ最適化 | チームB（BE-D）+ **SRE-I（EXPLAIN確認、再配置）** | 🟠 高 | ❌ 未着手（INF-10後着手） |
| INF-08 | APIサーバー側ページネーション実装（12エンドポイント） | チームB（BE-D）+ **チームC2（BE-H、再配置）** | 🟠 高 | ❌ 未着手（INF-07後着手） |

#### テスト強化（spec作成済み・実行確認待ち）

| ID | タスク | 担当 | 優先度 | 状態 |
|----|-------|------|--------|------|
| RT-01 | 完全業務フロー E2E | QA-H | 🟠 高 | △ full-flow.spec.js 作成済み。実行・全通過確認要 |
| RT-02 | 社長決裁ルートE2E | QA-H | 🟠 高 | △ president-approval.spec.js 作成済み。実行確認要 |
| RT-03 | 入金消込異常系 E2E | QA-I | 🟠 高 | △ receipt-edge.spec.js 作成済み。実行確認要 |
| RT-04 | 受注承認バリデーション E2E | QA-I | 🟠 高 | △ order-approval-validation.spec.js 作成済み。実行確認要 |
| RT-05 | 伝票状態遷移制御 E2E | QA-E | 🟠 高 | ❓ 既存specへの追加状況未確認 |
| RT-06 | UI層権限ネガティブテスト | QA-I | 🟠 高 | △ permission-negative.spec.js 作成済み。実行確認要 |

---

## 3. タスク詳細（引き継ぎ分）

### T-01: E2Eテスト状況調査・修正

**現状**: `e2e-report/results.json` に 18件合格 / 436件失敗 を記録。フロントサーバー未起動でのテスト実行が原因の可能性が高い。

**作業手順**:
1. フロントサーバー（`npm run dev`）とバックエンドサーバー（`node server/index.js`）を同時起動
2. `npx playwright test --reporter=list 2>&1 | grep -E "✘|FAILED"` で失敗テストを特定
3. フロント側 mock ルートの不整合または app.js のバグが原因のテストを修正
4. 全テスト合格確認

---

### T-09: パスワードポリシー

```javascript
// server/services/authService.js
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

### T-10: アカウントロック機能

```sql
ALTER TABLE users
  ADD COLUMN failed_login_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN locked_until TIMESTAMPTZ;
```

**仕様**: ログイン失敗5回連続でアカウントを30分間ロック。成功時はカウントリセット。

**TDD**:
```
it('should return 401 when account is locked')
it('should increment failed_login_count on each failure')
it('should reset counter on successful login')
it('should unlock account after 30 minutes')
it('should not reveal lock reason in error message')
```

---

### T-11: リフレッシュトークンのローテーション

**現状確認**: `server/services/refreshTokenService.js` および `refreshTokenRepository.js` が追加済み。ローテーション（旧トークン失効 + 新トークン発行）と盗用検知（失効済みトークン再利用→全セッション無効化）の実装状況を確認し、未実装部分を TDD で追加する。

**実装内容**:
- `/api/auth/refresh` 呼び出し時に旧リフレッシュトークンを `revoke`
- 新しいアクセストークン + 新しいリフレッシュトークンを発行
- 既に `revoked` のリフレッシュトークンが提示された場合 → 同一 `family` の全トークンを無効化（盗用検知）

---

### P9-B-03: ログイン専用レートリミット + 停止ユーザ拒否

```javascript
// /api/auth/login に専用 rate limit（既存グローバルとは別に設定）
onRequest: [fastify.rateLimit({ max: 5, timeWindow: '1 minute' })]

// authService.js（ログイン処理内）
if (user.status !== '有効') throw new AuthError('アカウントが無効です', 401);
```

**TDD**:
```
it('should return 429 after 5 failed login attempts within 1 minute')
it('should return 401 when user status is not 有効')
```

---

### P9-C-01-FE: CSRF frontend対応

**背景**: `server/plugins/csrf.js`（Origin ヘッダー検証）は完了済み。フロントエンドの `apiFetch` 関数が正しい `Origin` ヘッダーを付与しているか確認し、必要に応じて調整する。

**作業**:
1. `apiFetch` の全リクエストで `Origin: http://localhost:3000` が送信されていることを確認
2. 本番環境のオリジンを `.env` で設定できるよう `ALLOWED_ORIGINS` を整備
3. E2E テストで CSRF チェックが機能することを確認

---

### P9-E-BE: CSP設定

```javascript
// server/app.js または server/plugins/security.js
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  },
});
```

**確認**: `@fastify/helmet` は既に登録済みのため、`contentSecurityPolicy` オプションを追加するだけ。

---

## 4. タスク詳細（新規タスク）

### BL-04: 受注承認依頼のサーバー側業務バリデーション（8-04）

**エンドポイント**: `POST /api/orders/:code/submit-approval`

**追加チェック**:
- 見積紐付け必須チェック（`quotationCode` が存在すること）
- 受注合計金額と紐付き見積合計金額の一致チェック（不一致なら 400）
- 添付ファイル 1 件以上の存在チェック（下書き保存時は不要）

**TDD**:
```
it('should return 400 when quotationCode is missing')
it('should return 400 when order total differs from quotation total')
it('should return 400 when no attachment exists')
it('should succeed with valid order meeting all conditions')
```

---

### BL-03: 顧客マスタへの締日・支払サイト管理（8-03）

**DBスキーマ変更**:
```sql
ALTER TABLE customers
  ADD COLUMN closing_day   INTEGER,         -- 締日 (15, 31 等)
  ADD COLUMN payment_terms VARCHAR(50),     -- 支払サイト ('翌月末', '翌々月末' 等)
  ADD COLUMN billing_to    VARCHAR(100);    -- 請求先（本社・別法人等）
```

**API**: `GET/POST/PATCH /api/customers` に新フィールドを追加

**フロント**: 顧客マスタ詳細/編集画面に各フィールドの入力 UI を追加

---

### BL-02: 複数受注の合算請求と消費税一括計算（8-02）

**仕様**:
- `POST /api/invoices` に `orderCodes[]` 配列を受け付け、複数受注を1枚の請求に合算
- 消費税 = 「課税合計金額（税抜）× 税率」で一括計算（明細ごとの積み上げ方式ではない）
- 分割請求（1 受注を複数回に分けて請求）サポート

**TDD**:
```
it('should create invoice merging multiple orders')
it('should calculate tax on total subtotal not per-line sum')
it('should allow partial invoice for a single order')
```

---

### BL-01: 月次締め処理（4-03）

**前提**: BL-03（締日フィールド）完了後に着手

**仕様**:
- `GET /api/invoices/candidates?year=YYYY&month=MM` — 締日設定に基づく請求対象受注の抽出
- `GET /api/reports/monthly-summary?year=YYYY&month=MM` — 月次売上・原価・粗利の案件別集計

**TDD**:
```
it('should return orders within billing period based on customer closing_day')
it('should aggregate sales/cost/profit by project for the month')
```

---

### INF-08: APIサーバー側ページネーション（9-08）

全一覧エンドポイント（`GET /api/quotations`, `GET /api/orders` 等）に統一ページネーションを追加。

```javascript
// クエリパラメータ
?page=1&limit=20

// レスポンス形式（1-01-f の仕様を実装）
{
  "data": [...],
  "meta": { "total": 150, "page": 1, "pageSize": 20, "totalPages": 8 }
}
```

**対象エンドポイント**: quotations / orders / purchaseOrders / invoices / payments / customers / suppliers / products / users / deliveries / approvals / notifications（12エンドポイント）

---

### INF-09: 番号採番の競合制御（9-09）

**現状**: 各 `generate*Code` 関数がインメモリで採番。DB永続化後は同時リクエストで重複が発生しうる。

```sql
-- 採番テーブル方式
CREATE TABLE sequence_counters (
  entity_type VARCHAR(50) PRIMARY KEY,
  current_val INTEGER NOT NULL DEFAULT 0
);

-- 採番時（排他制御）
UPDATE sequence_counters SET current_val = current_val + 1
WHERE entity_type = $1
RETURNING current_val;
```

---

### INF-10: DBトランザクション境界の設計（9-10）

以下の複数テーブル更新操作を 1 トランザクションにまとめる:
- 承認操作（ステータス変更 + 承認履歴INSERT + 通知INSERT）
- 請求確定（ステータス変更 + 採番 + 監査ログINSERT）
- 入金消込（入金INSERT + 請求ステータス更新 + 未収残高更新）

---

### INF-07: DBインデックス設計（9-07）

**追加インデックス**:
```sql
-- 一覧検索（ステータス・日付範囲）
CREATE INDEX idx_quotations_status_date ON quotations(status, issue_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_invoices_status_due ON invoices(status, due_date);
CREATE INDEX idx_payments_status ON payments(status);

-- 承認待ち集計
CREATE INDEX idx_quotations_approval_pending ON quotations(status) WHERE status = '承認依頼中';

-- 未収未払集計
CREATE INDEX idx_invoices_customer ON invoices(customer_id, status);
CREATE INDEX idx_payments_supplier ON payments(supplier_id, status);
```

**EXPLAIN ANALYZEによる実測**: ステージングデータ（各テーブル1,000件以上）で確認

---

### INF-04: アプリケーションログ収集（9-03）

```javascript
// server/index.js
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
  },
});
```

- エラーログ（`fastify.log.error`）、アクセスログ（自動）、スロークエリログ（>500ms）
- ログローテーション（本番: 7日保持）

---

### INF-05: ヘルスチェック・死活監視（9-04）

```javascript
// GET /api/health
fastify.get('/api/health', async (request, reply) => {
  await db.query('SELECT 1'); // DB接続確認
  return { status: 'ok', timestamp: new Date().toISOString() };
});
```

- 外形監視（UptimeRobot 等）で `/api/health` を 1 分間隔で監視
- エラーレート 5% 超でアラート通知（Slack webhook 等）

---

### INF-06: 環境分離（9-06）

- `.env.development` / `.env.staging` / `.env.production` の分離
- `docker-compose.staging.yml` の追加
- 環境ごとの PostgreSQL 接続先・JWT_SECRET の分離方針を `docs/infra-envs.md` に記載

---

### INF-02: DBバックアップ設計（9-01）

- `pg_dump` による日次フルバックアップのスクリプト作成（`scripts/backup.sh`）
- バックアップ先: S3 互換ストレージまたはローカルボリューム
- リストア手順書: `docs/restore-procedure.md`
- RTO 4時間 / RPO 1時間 を目標値として設定

---

### INF-03: HTTPS/TLS設定（9-02）

- nginx リバースプロキシ設定（`infra/nginx.conf`）
- Let's Encrypt による証明書自動取得（`certbot`）
- HTTP → HTTPS リダイレクト強制
- `.env.example` に `DOMAIN`、`TLS_EMAIL` を追記

---

### INF-01: CI/CDパイプライン構築（9-05 + 11-07）

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  unit-test:
    steps:
      - run: npm ci
      - run: npx vitest run --coverage
      - name: カバレッジ閾値チェック（80%未満でFAIL）
  e2e-test:
    steps:
      - run: npm ci && npx playwright install
      - run: npm run dev &
      - run: npx playwright test
  deploy-staging:
    if: github.ref == 'refs/heads/main'
    steps:
      - run: ./scripts/deploy-staging.sh
```

---

### UX-01: 全画面フィードバックUI（10-01）

全 `apiFetch` 呼び出し箇所に統一パターンを適用:

```javascript
// apiFetch ラッパー（app.js に共通実装）
async function apiFetchWithFeedback(url, options, { button, successMsg }) {
  button?.setAttribute('disabled', 'true');
  showSpinner();
  try {
    const result = await apiFetch(url, options);
    showToast(successMsg, 'success');
    return result;
  } catch (err) {
    showToast(err.message || 'エラーが発生しました', 'error');
    throw err;
  } finally {
    button?.removeAttribute('disabled');
    hideSpinner();
  }
}
```

**実装内容**:
- グローバルスピナー（`<div id="loading-overlay">`）
- トースト通知（3秒自動消去、`success` / `error` / `info` スタイル）
- フォームサブミットボタンの `disabled` 制御（二重送信防止）
- ネットワークエラー時のリトライ誘導メッセージ

---

### RT-01: 完全業務フロー E2E（11-01）

**シナリオ**（`e2e/full-flow.spec.js`）:
1. 見積作成 → 承認依頼 → 承認
2. 受注作成（見積紐付け・添付） → 承認
3. 発注起票 → 承認
4. 納品登録 → 検収済
5. 請求起票 → 承認 → 送付済
6. 入金登録 → 消込完了
7. 各ステップで伝票コード・ステータス・金額の整合性を確認

---

### RT-02: 社長決裁ルートE2E（11-02）

**シナリオ**（`e2e/president-approval.spec.js`）:
- 社長決裁条件を満たす見積（高額）→ 営業部長承認 → 社長承認 → 承認済み確認
- 閾値境界値（ちょうど・1円超・1円未満）でのルート分岐確認

---

### RT-03: 入金消込異常系 E2E（11-03）

**シナリオ**（`e2e/receipt-edge.spec.js`）:
- 一部入金（60万/100万）→ 未収残高40万確認
- 過入金（101万/100万）→ 差額1万「差額あり」記録確認
- 複数回部分消込の累積残高確認
- 振込手数料差引消込確認

---

### RT-04: 受注承認依頼バリデーションE2E（11-04）

**前提**: BL-04 完了後

**シナリオ**（`e2e/order-approval-validation.spec.js`）:
- 見積未紐付けで承認依頼 → エラーブロック確認
- 金額不一致で承認依頼 → エラーブロック確認
- 添付なしで承認依頼 → エラーブロック確認
- 下書き保存は添付なしでも成功すること

---

### RT-05: 伝票状態遷移制御E2E（11-05）

**シナリオ**（各業務 spec.js に追加）:
- 確定済み請求を直接編集しようとしたときにブロックされること
- 取消済み見積から受注作成しようとしたときにブロックされること

---

### RT-06: UI層権限ネガティブテスト（11-06）

**シナリオ**（`e2e/permission-negative.spec.js`）:
- 承認権限なしユーザ → 承認ボタン非表示
- 作成権限なしユーザ → 新規作成ボタン非表示
- マスタ管理権限なしユーザ → S-11アクセス不可

---

## 5. マイルストーン

### M6: 第3期引き継ぎ完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M6-1 | T-09/T-10 パスワードポリシー・ロックが機能する | チームC2 | ✅ 達成 |
| M6-2 | T-11 リフレッシュトークンローテーションが機能する | チームC2 | ✅ 達成 |
| M6-3 | P9-B-03 ログイン429・停止401が返る | チームC2 | ✅ 達成 |
| M6-4 | P9-E-BE CSPヘッダーが全レスポンスに含まれる | チームC2 | ✅ 達成 |
| M6-5 | P9-C-01-FE CSRF対応が全状態変更APIで機能する | チームD | ✅ 達成 |
| M6-6 | P10-RT-01 却下→再申請E2Eが4伝票でパス | QA-E | ❌ 専用フロー未確認 |
| M6-7 | P10-RT-02 バリデーションE2Eが各画面specに追加・パス | QA-F | ❓ 移植状況未確認 |
| M6-8 | P10-RT-03/04 追加E2Eがパス | QA-H | △ spec作成済み、実行確認要 |

### M7: バックエンド基盤完了

| # | 確認項目 | 担当（再編後） | 進捗 |
|---|---------|------------|------|
| M7-1 | INF-08 全一覧APIにページネーション実装済み | チームB + チームC2 | ❌ 未着手 |
| M7-2 | INF-09 採番競合制御が機能する | チームB | ✅ 達成 |
| M7-3 | INF-10 複数テーブル更新が1トランザクションで実行される | チームB + チームC1 | ❌ 未着手 |
| M7-4 | INF-07 インデックス適用後の一覧表示3秒以内をEXPLAIN確認 | チームB + SRE-I | ❌ 未着手 |
| M7-5 | INF-04/05 Pinoログ出力・ヘルスチェック動作確認 | チームC1 | ✅ 達成 |

### M8: 業務ロジック完了

| # | 確認項目 | 担当（再編後） | 進捗 |
|---|---------|------------|------|
| M8-1 | BL-04 受注承認依頼バリデーションが機能する | チームA | ✅ 達成 |
| M8-2 | BL-03 顧客マスタ締日・支払サイトが登録・参照できる | チームA + チームD | ✅ 達成（API統合・FE統合完了） |
| M8-3 | BL-02 合算請求と消費税一括計算が機能する | チームA | ✅ 達成（invoiceService確認済み） |
| M8-4 | BL-01 月次締め処理APIが機能する | チームA | ✅ 達成（GET /api/invoices/candidates, GET /api/reports/monthly-summary 実装完了） |

### M9: インフラ基盤完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M9-1 | INF-06 ステージング環境が定義・構築済み | SRE-I | ✅ 達成 |
| M9-2 | INF-03 本番環境でHTTPS通信が確立している | SRE-I | ✅ 達成 |
| M9-3 | INF-02 日次バックアップスクリプトが動作確認済み | SRE-I | ✅ 達成 |
| M9-4 | INF-01/RT-07 CI/CDでユニット・E2E自動実行、カバレッジ80%チェックが機能 | SRE-I | ✅ 達成 |

### M10: UX・テスト強化完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M10-1 | UX-01 全画面でローディング・トースト・エラーが表示される | チームD + チームE | ✅ 達成 |
| M10-2 | RT-01〜RT-06 全新規E2Eがパス | QA-H + QA-I | △ spec作成済み、全通過確認要 |
| M10-3 | AT-01 ログイン429・停止401のAPIテストがパス | QA-H | ❓ spec追加状況未確認 |

### **M5-Final: 本番リリース準備完了（Day 14）**

| # | 確認項目 |
|---|---------|
| F-1 | M6〜M10 の全確認項目が満たされている |
| F-2 | T-13: 全E2Eテストがゼロ退行でパスする |
| F-3 | 主要一覧画面の初期表示が3秒以内 |
| F-4 | HTTPS通信・CSPヘッダー・レートリミット・認可が全て機能する |
| F-5 | CI/CD パイプラインがmainブランチで自動実行されている |
| F-6 | バックアップスクリプトが本番環境で設定済み |

---

## 6. チーム構成（第4期・再編後）

> **再編理由**: チームB（BE-D）が INF-10/INF-07/INF-08 の3タスク全て未着手で遅延。完了した各チームの余剰リソースをボトルネックへ投入する。

### 6.1 継続タスクあり（作業中）

| チーム | メンバー | 担当スコープ（残） | 優先度 |
|-------|---------|----------------|-------|
| チームA | BE-C | BL-03 API統合 → BL-01 月次締め | 🔴 最高 |
| チームB | BE-D | INF-10 → INF-07 → INF-08 | 🔴 最高 |
| QA | QA-E + QA-F + QA-H | T-01確認, P10-RT-01/02, AT-01, RT-05, T-13 | 🔴 最高 |
| QA追加 | QA-I | RT-01〜RT-06 実行・全通過確認 | 🟠 高 |

### 6.2 自タスク完了・他チームへ再配置

| チーム | 元担当（完了） | 再配置先 | 新担当スコープ |
|-------|------------|---------|-------------|
| **チームC1** | INF-04/INF-05 ✅ | → チームB合流 | INF-10 トランザクション実装サポート（承認・入金消込） |
| **チームC2** | T-09〜P9-E-BE ✅ | → チームB合流 | INF-08 ページネーション実装サポート（12エンドポイント分割担当） |
| **チームD** | P9-C-01-FE + UX-01前半 ✅ | → チームA合流 | BL-03 フロントエンド統合（顧客マスタ画面の締日・支払サイト入力UI） |
| **チームE** | UX-01後半 ✅ | → QAサポート | RT-01〜RT-06 spec実行支援・フロントバグ修正対応 |
| **SRE-I** | INF-01〜INF-06 ✅ | → チームB合流 | INF-07 DBインデックス EXPLAIN ANALYZE 確認・性能評価 |

### 6.3 完了後の優先着手順

```
チームB（主）+ チームC1（サポート）: INF-10 → 完了後チームC1離脱
チームB（主）+ SRE-I（サポート）:   INF-07 → 完了後SRE-I離脱
チームB（主）+ チームC2（サポート）: INF-08 → M7-1/3/4 達成
チームA（主）+ チームD（サポート）:  BL-03 API統合（同日並行） → 完了後チームDは離脱
チームA:                           BL-01 月次締め → M8-2/4 達成
```

---

## 7. 残タスク向けスケジュール（再編後）

> 当初14日ガントは計画時点のもの。2026-05-06時点の進捗を反映した残タスク向けスケジュールに更新。
> ✅済み チームは新担当へ再配置済み（セクション6.2参照）。

```
（凡例: ✅=完了済み  ❌=遅延・未着手  →=新担当）

【完了チームの現況】
チームC2  ✅ T-09〜P9-E-BE 全完了  → INF-08サポートへ再配置
チームC1  ✅ INF-04/INF-05 完了     → INF-10サポートへ再配置
チームD   ✅ P9-C-01-FE + UX-01前半 → BL-03フロントサポートへ再配置
チームE   ✅ UX-01後半完了           → QAサポートへ再配置
SRE-I    ✅ INF-01〜INF-06 全完了    → INF-07 EXPLAIN確認サポートへ再配置

【残タスク・再編後スケジュール（N日=再編起点）】

        N日   N+1   N+2   N+3   N+4   N+5   N+6   N+7
チームB ├─INF-10(B+C1)──┤INF-07(B+SRE)──┤INF-08(B+C2)───────────────────┤
        │2日            │2日            │3日          ✅M7-1/3/4

チームA ├─BL-03 API統合(A+D)─┤BL-01────────────────────────────────────┤
        │1日                  │4日         ✅M8-2/4

QA-E    ├─T-01確認──┤P10-RT-01 spec完成──────────┤RT-05────┤T-13──────────┤
        │0.5日      │2日                          │1日      │1日 ✅Day+6

QA-F    ├─P10-RT-02確認/補完────────┤P10-RT-04確認──┤P10-RT-05(INF-08待ち)─┤
        │2日                        │1日            │INF-08完了後実施

QA-H    ├─AT-01確認─┤RT-01/02実行確認──────────────────────────────────────┤
        │0.5日      │2日          ✅M10-3, RT-01/02

QA-I    ├─RT-03/04/06 実行確認──────────────────────────────────────────────┤
        │2日    ✅M10-2

チームE ├─RT-01〜06 フロントバグ修正対応（QAサポート）──────────────────────┤
        │随時

【ゲート条件】
  INF-10完了  → INF-07着手可（チームB + SRE-I）
  INF-07完了  → INF-08着手可（チームB + チームC2）、M7-4チェック実施
  INF-08完了  → P10-RT-05実施可
  BL-03完了   → BL-01着手可（チームD離脱）
  全開発完了  → T-13（最終E2E + 性能確認）
```

---

## 8. 依存関係と並行実行マップ（再編後）

```
2026-05-06 再編起点
│
├─[チームC2] ✅完了 → INF-08サポートへ再配置
│
├─[チームD]  ✅完了 → BL-03フロントサポートへ再配置
│
├─[チームE]  ✅完了 → QAサポートへ再配置
│
├─[チームC1] ✅完了 → INF-10サポートへ再配置
│
├─[SRE-I]   ✅完了 → INF-07 EXPLAINサポートへ再配置
│
├─[チームA]── BL-03 API統合（+チームD合流）─────→ BL-01 ─────────────→ M8-2/4
│             ↑チームD（FE）並行: customers画面UI修正
│
├─[チームB]── INF-10（+チームC1合流）──→ INF-07（+SRE-I合流）──→ INF-08（+チームC2合流）→ M7-1/3/4
│
├─[QA-E]──── T-01確認 → P10-RT-01 spec完成 → RT-05 → T-13
│
├─[QA-F]──── P10-RT-02確認/補完 → P10-RT-04確認 → P10-RT-05（INF-08完了後）
│
├─[QA-H]──── AT-01確認 → RT-01/02 実行確認 ─────────────────────────→ M10-3
│
└─[QA-I]──── RT-03/04/06 実行確認 ──────────────────────────────────→ M10-2

残タスクの直列依存:
  BL-03 API統合完了     → BL-01着手可、チームD離脱
  INF-10完了            → INF-07着手可、チームC1離脱
  INF-07完了            → INF-08着手可、SRE-I離脱（M7-4チェック実施）
  INF-08完了            → P10-RT-05実施可、チームC2離脱
  全開発完了            → T-13（最終E2E + 性能確認）→ M5-Final
```

---

## 9. 工数見積もり（第4期）

| タスク | チームA | チームB | チームC1 | チームC2 | チームD | FE-K | SRE-I | QA-E | QA-F | QA-H | QA-I |
|-------|--------|--------|---------|---------|--------|------|-------|------|------|------|------|
| T-01 | — | — | — | — | — | — | — | 0.5 | — | — | — |
| T-09〜T-11 | — | — | — | 3日 | — | — | — | — | — | — | — |
| P9-B-03, P9-E | — | — | — | 1.5日 | — | — | — | — | — | — | — |
| P9-C-01 FE | — | — | — | — | 1日 | — | — | — | — | — | — |
| P10-RT-01〜05 | — | — | — | — | — | — | — | 4.5日 | 6日 | 2.5日 | — |
| AT-01 | — | — | — | — | — | — | — | — | — | 0.5日 | — |
| T-13 | — | — | — | — | — | — | — | 1日 | — | — | — |
| BL-01〜04 | 8.5日 | 1.5日 | — | — | — | — | — | — | — | — | — |
| INF-07〜10 | — | 9日 | — | — | — | — | — | — | — | — | — |
| INF-04〜05 | — | — | 3.5日 | — | — | — | — | — | — | — | — |
| INF-01〜06 | — | — | — | — | — | — | 8日 | — | — | — | — |
| UX-01 | — | — | — | — | 3日 | 7日 | — | — | — | — | — |
| RT-01〜02, RT-05 | — | — | — | — | — | — | — | 2日 | — | 5日 | — |
| RT-03/04/06 | — | — | — | — | — | — | — | — | — | — | 8日 |
| RT-07 | — | — | — | — | — | — | 2日 | — | — | — | 0.5日 |
| **工数合計** | **8.5日** | **10.5日** | **3.5日** | **4.5日** | **4日** | **7日** | **10日** | **8日** | **6日** | **8日** | **8.5日** |

**カレンダー日数: 約 14 日**

---

## 10. 現在の着手確認リスト（2026-05-06 再編後）

> Day 1着手リストは完了。以下は再編後の各チーム即着手事項。

### チームA（BE-C）— BL-03 API統合
- [ ] `server/routes/customers.js`: GET/POST/PATCH に `closingDay` / `paymentSite` / `billingTo` フィールドを追加（スキーマ定義は完了済み）
- [ ] `server/services/customerService.js`: 同フィールドの保存・返却ロジック追加
- [ ] `server/repositories/customerRepository.js`: `findAll` / `findByCode` / `save` / `update` でフィールドマッピング確認
- [ ] 対応ユニットテスト追加（TDD: service → repository → route の順）
- [ ] チームDと連携: フロントエンド側の顧客マスタ画面 UI を並行実装

### チームB（BE-D）— INF-10 着手（最優先）
- [ ] `server/services/approvalService.js`: 承認操作（ステータス変更 + 承認履歴INSERT + 通知INSERT）を1トランザクションに
- [ ] `server/services/invoiceService.js`: 請求確定（ステータス + 採番 + 監査ログ）を1トランザクションに
- [ ] `server/services/receiptService.js`: 入金消込（入金INSERT + 請求ステータス更新）を1トランザクションに
- [ ] チームC1と共同: Dependency Injection で `db` クライアントを注入しトランザクション境界を統一

### チームC1（BE-G）— チームBへ合流（INF-10サポート）
- [ ] INF-10のトランザクションヘルパー実装（`server/db/transaction.js` など共通ラッパー）
- [ ] チームBの approvalService / invoiceService のトランザクション適用レビュー・テスト

### チームC2（BE-H）— INF-08着手準備（INF-10完了後）
- [ ] INF-08設計: 12エンドポイント（quotations / orders / purchaseOrders / invoices / payments / customers / suppliers / products / users / deliveries / approvals / notifications）への統一ページネーション方針を確認
- [ ] INF-10完了後に `GET /api/quotations` から順次実装着手

### チームD（FE-A+B）— チームAへ合流（BL-03フロント）
- [ ] 顧客マスタ詳細・編集画面（`app.js`）に `closingDay` / `paymentSite` / `billingTo` の入力フォーム追加
- [ ] チームAの API 実装完了後、フロント統合テスト

### チームE（FE-K）— QAサポート
- [ ] RT-01〜RT-06 の spec実行（`npx playwright test e2e/full-flow.spec.js` 等）でフロント起因のエラーを確認
- [ ] 発見した UI バグを即修正・再実行

### SRE-I — チームBへ合流（INF-07サポート）
- [ ] INF-07実装後: ステージングデータ（各テーブル1000件以上）投入 → EXPLAIN ANALYZE 実行
- [ ] 一覧表示3秒以内の達成をM7-4チェックとして確認・記録

### QA-E
- [ ] T-01: `npx playwright test --reporter=list` で失敗テスト特定（フロント+バックサーバー同時起動必須）
- [ ] P10-RT-01: `e2e/quotation.spec.js` に却下→修正→再申請フローのテストシナリオ追加（4伝票分）

### QA-F
- [ ] P10-RT-02: 各画面 spec への バリデーション E2E 移植状況を棚卸し → 未移植箇所を完成
- [ ] P10-RT-04: `zzz-data-chain.spec.js` の内容を確認・充実化

### QA-H
- [ ] AT-01: auth.test.js で 429 / 停止401 テストの存在確認 → 未追加なら追加
- [ ] RT-01/RT-02: `full-flow.spec.js` / `president-approval.spec.js` を実行し全通過確認

### QA-I
- [ ] RT-03/RT-04/RT-06 各 spec を実行し全通過確認（`receipt-edge` / `order-approval-validation` / `permission-negative`）
- [ ] 失敗した場合は実装側（チームA/B）と協議して修正

---

## 11. 優先対応順（再編後）

```
【即着手（並行）】
  チームB + チームC1:  INF-10 DBトランザクション境界（最優先・ブロッカー）
  チームA + チームD:   BL-03 customers API + フロント統合（並行）
  QA-E:               T-01 E2E失敗調査（`npx playwright test --reporter=list`）
  QA-H:               AT-01 auth.test.js 429/停止401 spec確認
  QA-I:               RT-03/04/06 spec実行・全通過確認

【INF-10完了後】
  → チームB + SRE-I:  INF-07 DBインデックス実装 → EXPLAIN ANALYZE（性能確認）
  → チームC1 離脱（全タスク完了）

【INF-07完了後、BL-03完了後（並行）】
  → チームB + チームC2: INF-08 ページネーション実装（12エンドポイント）
  → チームA:            BL-01 月次締め処理API（BL-03完了が前提）
  → チームD 離脱（全タスク完了）
  → M7-4チェック実施（EXPLAIN ANALYZE確認済み）

【INF-08完了後】
  → M7-1 達成
  → QA-F:  P10-RT-05 ページネーション E2E 実行
  → SRE-I 離脱（全タスク完了）
  → チームC2 離脱（全タスク完了）

【BL-01完了後】
  → M8-4 達成

【P10-RT-01/02/03/04確認完了後】
  → M6-6〜8 達成

【全新規E2E通過後】
  → M10-2 達成

【全開発タスク完了後】
  → T-13: 全E2Eテストパス + 性能要件（一覧3秒以内）確認
  → M5-Final: 本番リリース準備完了 ✅
```
