# 取引管理システム 第4期実装計画

策定日: 2026-05-06

入力ドキュメント:
- `implementation_plan-3.md` — 第3期計画（未完了タスクを本ファイルに引き継ぎ）
- `docs/future_implementation_backlog.md` — 将来実装バックログ（★★★優先度の未対応項目）
- 各チームメモリ（teamA_state.md / teamB_state.md / teamD_state.md / project_state.md）

---

## 1. 第3期完了済みタスク（参考）

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

---

## 2. 未完了タスク一覧

### 2.1 implementation_plan-3.md からの引き継ぎ

| ID | タスク | 担当 | 優先度 | 備考 |
|----|-------|------|--------|------|
| T-01 | E2Eテスト状況調査・失敗テスト修正 | QA-E | 🔴 最高 | E2E results.json で 436件失敗を確認。T-13前提 |
| T-09 | パスワードポリシー実装（最小長8・大文字・数字） | チームC2（BE-H） | 🔴 最高 | 未着手 |
| T-10 | アカウントロック機能（5回失敗→30分ロック） | チームC2（BE-H） | 🔴 最高 | 未着手。T-09前提 |
| T-11 | リフレッシュトークンのローテーション・盗用検知 | チームC2（BE-H） | 🟠 高 | refreshTokenService.jsは追加済みだがローテーション未実装 |
| P9-B-03 | ログイン専用レートリミット（5回/分）+ 停止ユーザ拒否 | チームC2（BE-H） | 🟠 高 | 未着手 |
| P9-C-01-FE | CSRF frontend対応（apiFetchへのトークン付加） | チームD（FE-A+B） | 🟡 中 | BE完了済み。FE側のみ残 |
| P9-E-BE | CSP設定（@fastify/helmetに明示設定） | チームC2（BE-H） | 🟡 中 | 未着手 |
| P10-RT-01 | 却下→修正→再申請 E2Eシナリオ（全4伝票） | QA-E | 🔴 最高 | 未着手 |
| P10-RT-02 | 各画面バリデーションE2Eの分散追加（8ファイル） | QA-F | 🔴 最高 | 未着手 |
| P10-RT-03 | 複数ステップ承認の途中ステップ却下 E2E | QA-H | 🟠 高 | 未着手 |
| P10-RT-04 | 発注→納品→請求のデータ連鎖整合性 E2E | QA-E/F | 🟠 高 | zzz-data-chain.spec.jsが一部追加済み。本格実装は未 |
| P10-RT-05 | 大量データ・ページネーション動作確認 | QA-F | 🟡 中 | zzz-pagination.spec.jsが追加済み。サーバー側ページネーション(INF-08)前提 |
| T-13 | 全E2Eテストパス + 性能要件確認（一覧3秒以内） | QA（E/F/H） | 🔴 最高 | 全開発タスク完了後 |

### 2.2 future_implementation_backlog.md ★★★ 未対応項目（新規）

#### 業務ロジック

| ID | 引用 | タスク | 担当 | 優先度 |
|----|------|-------|------|--------|
| BL-01 | 4-03 | 月次締め処理（締日基準請求抽出・月次集計） | チームA（BE-C） | 🟠 高 |
| BL-02 | 8-02 | 複数受注の合算請求と消費税一括計算 | チームA（BE-C） | 🟠 高 |
| BL-03 | 8-03 | 顧客マスタへの締日・支払サイト・請求先管理 | チームA（BE-C）+ チームD（FE） | 🟠 高 |
| BL-04 | 8-04 | 受注承認依頼のサーバー側業務バリデーション | チームB（BE-D） | 🟠 高 |

#### インフラ・基盤

| ID | 引用 | タスク | 担当 | 優先度 |
|----|------|-------|------|--------|
| INF-01 | 9-05 | CI/CDパイプライン構築（GitHub Actions） | SRE-I（新規） | 🟠 高 |
| INF-02 | 9-01 | DBバックアップ・障害復旧設計 | SRE-I（新規） | 🟠 高 |
| INF-03 | 9-02 | HTTPS/TLS設定（証明書・nginxリバースプロキシ） | SRE-I（新規） | 🟠 高 |
| INF-04 | 9-03 | アプリケーションログ収集（Pino structured logging） | チームC1（BE-G） | 🟠 高 |
| INF-05 | 9-04 | ヘルスチェック・死活監視・アラート | チームC1（BE-G） | 🟠 高 |
| INF-06 | 9-06 | 環境分離（開発・ステージング・本番）定義 | SRE-I（新規） | 🟠 高 |
| INF-07 | 9-07 | DBインデックス設計・クエリ最適化 | チームB（BE-D） | 🟠 高 |
| INF-08 | 9-08 | APIサーバー側ページネーション実装 | チームB（BE-D） | 🟠 高 |
| INF-09 | 9-09 | 番号自動採番の競合制御（SEQUENCE + 排他制御） | チームB（BE-D） | 🟠 高 |
| INF-10 | 9-10 | DBトランザクション境界の設計と実装 | チームB（BE-D） | 🟠 高 |

#### UX

| ID | 引用 | タスク | 担当 | 優先度 |
|----|------|-------|------|--------|
| UX-01 | 10-01 | 全画面フィードバックUI（ローディング・トースト・エラー） | チームD（FE-A+B）+ FE-K（新規） | 🟠 高 |

#### テスト強化

| ID | 引用 | タスク | 担当 | 優先度 |
|----|------|-------|------|--------|
| RT-01 | 11-01 | 完全業務フロー E2E（見積→受注→発注→納品→請求→入金→支払） | QA-H | 🟠 高 |
| RT-02 | 11-02 | 社長決裁ルートを含む完全承認フロー E2E | QA-H | 🟠 高 |
| RT-03 | 11-03 | 入金消込の異常系 E2E | QA-I（新規） | 🟠 高 |
| RT-04 | 11-04 | 受注承認依頼のバリデーション E2E（BL-04前提） | QA-I（新規） | 🟠 高 |
| RT-05 | 11-05 | 伝票状態遷移の制御 E2E（不正遷移ブロック確認） | QA-E | 🟠 高 |
| RT-06 | 11-06 | UI層の権限ネガティブテスト | QA-I（新規） | 🟠 高 |
| RT-07 | 11-07 | CI/CDパイプラインへの自動テスト組み込み（INF-01前提） | SRE-I + QA | 🟠 高 |
| AT-01 | 5-05 e/f | サーバー側認可テスト残（ログイン429・停止401） | QA-H | 🟠 高 |

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

| # | 確認項目 | 担当 | 期日目標 |
|---|---------|------|---------|
| M6-1 | T-09/T-10 パスワードポリシー・ロックが機能する | チームC2 | Day 3 |
| M6-2 | T-11 リフレッシュトークンローテーションが機能する | チームC2 | Day 4 |
| M6-3 | P9-B-03 ログイン429・停止401が返る | チームC2 | Day 4 |
| M6-4 | P9-E-BE CSPヘッダーが全レスポンスに含まれる | チームC2 | Day 5 |
| M6-5 | P9-C-01-FE CSRF対応が全状態変更APIで機能する | チームD | Day 3 |
| M6-6 | P10-RT-01 却下→再申請E2Eが4伝票でパス | QA-E | Day 7 |
| M6-7 | P10-RT-02 バリデーションE2Eが各画面specに追加・パス | QA-F | Day 5 |
| M6-8 | P10-RT-03/04 追加E2Eがパス | QA-H | Day 8 |

### M7: バックエンド基盤完了

| # | 確認項目 | 担当 | 期日目標 |
|---|---------|------|---------|
| M7-1 | INF-08 全一覧APIにページネーション実装済み | チームB | Day 6 |
| M7-2 | INF-09 採番競合制御が機能する | チームB | Day 5 |
| M7-3 | INF-10 複数テーブル更新が1トランザクションで実行される | チームB | Day 8 |
| M7-4 | INF-07 インデックス適用後の一覧表示3秒以内をEXPLAIN確認 | チームB | Day 9 |
| M7-5 | INF-04/05 Pinoログ出力・ヘルスチェック動作確認 | チームC1 | Day 5 |

### M8: 業務ロジック完了

| # | 確認項目 | 担当 | 期日目標 |
|---|---------|------|---------|
| M8-1 | BL-04 受注承認依頼バリデーションが機能する | チームB | Day 4 |
| M8-2 | BL-03 顧客マスタ締日・支払サイトが登録・参照できる | チームA | Day 6 |
| M8-3 | BL-02 合算請求と消費税一括計算が機能する | チームA | Day 9 |
| M8-4 | BL-01 月次締め処理APIが機能する | チームA | Day 12 |

### M9: インフラ基盤完了

| # | 確認項目 | 担当 | 期日目標 |
|---|---------|------|---------|
| M9-1 | INF-06 ステージング環境が定義・構築済み | SRE-I | Day 5 |
| M9-2 | INF-03 本番環境でHTTPS通信が確立している | SRE-I | Day 7 |
| M9-3 | INF-02 日次バックアップスクリプトが動作確認済み | SRE-I | Day 8 |
| M9-4 | INF-01/RT-07 CI/CDでユニット・E2E自動実行、カバレッジ80%チェックが機能 | SRE-I + QA | Day 10 |

### M10: UX・テスト強化完了

| # | 確認項目 | 担当 | 期日目標 |
|---|---------|------|---------|
| M10-1 | UX-01 全画面でローディング・トースト・エラーが表示される | チームD + FE-K | Day 10 |
| M10-2 | RT-01〜RT-06 全新規E2Eがパス | QA-H + QA-I | Day 13 |
| M10-3 | AT-01 ログイン429・停止401のAPIテストがパス | QA-H | Day 5 |

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

## 6. チーム構成（第4期）

| チーム | メンバー | 担当スコープ | 完了目安 |
|-------|---------|------------|---------|
| チームA | BE-C | BL-04→BL-03→BL-02→BL-01（業務ロジック） | Day 12 |
| チームB | BE-D | INF-09→INF-10→INF-07→INF-08（BE基盤） | Day 9 |
| チームC1 | BE-G | INF-04（Pinoログ）→INF-05（ヘルスチェック） | Day 5 |
| チームC2 | BE-H | T-09→T-10→T-11→P9-B-03→P9-E-BE（引き継ぎ） | Day 5 |
| チームD | FE-A + FE-B | P9-C-01-FE（引き継ぎ）+ UX-01（前半） | Day 8 |
| チームE | FE-K（**新規**） | UX-01（後半、全画面適用・テスト） | Day 10 |
| SRE | SRE-I（**新規**） | INF-06→INF-03→INF-02→INF-01/RT-07 | Day 10 |
| QA | QA-E + QA-F + QA-H | T-01, P10-RT-01〜05, T-13, RT-01/02/05/AT-01 | Day 14 |
| QA追加 | QA-I（**新規**） | RT-03/RT-04/RT-06 | Day 13 |

> **増員理由**
> - **FE-K**: UX-01（全画面フィードバックUI）は全 apiFetch 呼び出し箇所（推定50箇所以上）への適用が必要。チームDだけでは 5 日以上かかるため専任追加
> - **SRE-I**: CI/CD・インフラ（INF-01〜06）は開発エンジニアのスコープ外かつ本番リリースの前提条件。専任が必要
> - **QA-I**: テスト強化タスク（RT-03/04/06）はQA-E/F/Hが引き継ぎタスクで稼働中のため、新規追加でDay 1から並行着手

---

## 7. 並行実行スケジュール（14日ガントチャート）

```
        Day1  Day2  Day3  Day4  Day5  Day6  Day7  Day8  Day9  Day10 Day11 Day12 Day13 Day14
チームC2├─T-09─┤T-10──┤T-11──┤P9B03─┤P9E-BE──────────────────────────────────────────────┤
BE-H    │1日   │1日   │1日   │1日   │0.5日  ✅M6-1〜4

チームD ├─P9C-01FE───┤UX-01前半──────────────────────────────────────────────────────────┤
FE-A+B  │1日         │3日        ✅M6-5

チームE ├─────────────────────UX-01後半（全画面適用）──────────────────────────────────────┤
FE-K    │Day3から参画              ✅M10-1 Day10

チームA ├─BL-04────┤BL-03────────┤BL-02──────────┤BL-01────────────────────────────────┤
BE-C    │1.5日     │2日          │3日            │4日            ✅M8-1〜4 Day12

チームB ├─INF-09─┤INF-10────────┤INF-07─────────┤INF-08──────────────────────────────────┤
BE-D    │1日     │2日           │3日            │3日            ✅M7-1〜4 Day9

チームC1├─INF-04────────┤INF-05──────────────────────────────────────────────────────────┤
BE-G    │2日            │1.5日    ✅M7-5 Day5

SRE-I   ├─INF-06────┤INF-03─────┤INF-02─────────┤INF-01+RT-07────────────────────────────┤
        │1.5日      │1日        │2日            │3日            ✅M9-1〜4 Day10

QA-E    ├T01┤P10RT-01 spec─────────┤RT-01実行───────────┤RT-05──────┤T-13────────────────┤
        │.5 │(4伝票spec, Day1-3)    │(2日, Day4-5)       │(2日)      │最終(1日) Day14

QA-F    ├─P10-RT-02(バリデーション)────┤P10-RT-04──────────┤P10-RT-05──┤──────────────────┤
        │3日                         │2日                │1日        │      ✅Day9

QA-H    ├─P10-RT-03──────────┤AT-01─┤RT-01─────────────────┤RT-02────────────────────────┤
        │2日                  │0.5日 │3日                   │2日        ✅Day12

QA-I    ├─────────────────────────RT-03──────────┤RT-04──────────────┤RT-06───────────────┤
        │Day1から着手                3日           │3日                │2日    ✅Day13
```

---

## 8. 依存関係と並行実行マップ

```
Day 1 全チーム同時スタート
│
├─[チームC2]── T-09 → T-10 → T-11 → P9-B-03 → P9-E-BE ─────────────────────→ ✅Day5
│
├─[チームD]─── P9-C-01-FE → UX-01（前半）───────────────────────────────────→ ✅Day8
│
├─[チームE]─── UX-01（後半・全画面）─────────────────────────────────────────→ ✅Day10
│
├─[チームA]─── BL-04 → BL-03 → BL-02 → BL-01 ─────────────────────────────→ ✅Day12
│                               ↑BL-01はBL-03前提
│
├─[チームB]─── INF-09 → INF-10 → INF-07 → INF-08 ─────────────────────────→ ✅Day9
│
├─[チームC1]── INF-04 → INF-05 ─────────────────────────────────────────────→ ✅Day5
│
├─[SRE-I]───── INF-06 → INF-03 → INF-02 → INF-01 + RT-07 ─────────────────→ ✅Day10
│
├─[QA-E]─────  T-01(.5日) → P10-RT-01 spec(3日) → RT-01実行(2日) → RT-05 → T-13 ✅Day14
│
├─[QA-F]─────  P10-RT-02(3日) → P10-RT-04(2日) → P10-RT-05(1日) ───────────→ ✅Day9
│
├─[QA-H]─────  P10-RT-03(2日) → AT-01(0.5日) → RT-01(3日) → RT-02(2日) ───→ ✅Day12
│
└─[QA-I]─────  RT-03(3日) → RT-04(3日) → RT-06(2日) ───────────────────────→ ✅Day13

真の直列依存:
  BL-03完了 → BL-01着手可
  BL-04完了 → RT-04着手可（BL-04実装のE2E）
  INF-01完了 → RT-07完成（CI/CDへの組み込み）
  T-02完了（第3期）→ P10-RT-01実行可（承認フロー動作が前提）
  全開発完了 → T-13（最終E2E + 性能確認）
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

## 10. 各チームのDay 1着手確認リスト

### チームA（BE-C）
- [ ] BL-04: `POST /api/orders/:code/submit-approval` に見積紐付け・金額一致・添付チェックを TDD 追加

### チームB（BE-D）
- [ ] INF-09: `sequence_counters` テーブル作成 → 採番ロジック TDD 開始

### チームC1（BE-G）
- [ ] INF-04: `server/index.js` に Pino logger 設定追加（AM）
- [ ] INF-04: スロークエリフック実装（PM）

### チームC2（BE-H）
- [ ] T-09: `authService.js` にパスワードバリデーション TDD 追加（AM）
- [ ] T-10: `ALTER TABLE users` → アカウントロック TDD（PM）

### チームD（FE-A・FE-B）
- [ ] P9-C-01-FE: `apiFetch` の Origin ヘッダー送信確認・E2E テスト実行

### チームE（FE-K、新規）
- [ ] Day 1: UX-01 設計（apiFetch ラッパー関数・スピナー・トーストコンポーネントの仕様確定）
- [ ] Day 3: チームDの UX-01 前半（共通コンポーネント）を受け取り、全画面への適用開始

### SRE-I（新規）
- [ ] INF-06: 環境別 `.env` ファイル構成の設計・`docker-compose.staging.yml` 作成
- [ ] INF-06: ステージング環境の構築スクリプト作成

### QA-E
- [ ] T-01: フロント + バックサーバーを同時起動し `npx playwright test --reporter=list` で失敗テストを特定
- [ ] P10-RT-01: 却下→修正→再申請 E2E spec の設計・`e2e/quotation.spec.js` への追加着手

### QA-F
- [ ] P10-RT-02: `e2e/explore-et07-validation.spec.js` の内容を各画面 spec に移植開始（Day 1 即着手可）

### QA-H
- [ ] P10-RT-03: 複数ステップ承認途中却下 E2E spec 設計着手

### QA-I（新規）
- [ ] RT-03: 入金消込異常系 E2E spec の設計・`e2e/receipt-edge.spec.js` 作成着手

---

## 11. 優先対応順（チーム別）

```
【Day 1: 全チーム同時スタート】
  チームC2:  T-09 パスワードポリシー
  チームD:   P9-C-01-FE CSRF確認
  チームE:   UX-01 コンポーネント設計
  チームA:   BL-04 受注バリデーション
  チームB:   INF-09 採番競合制御
  チームC1:  INF-04 Pinoログ設定
  SRE-I:    INF-06 環境分離定義
  QA-E:     T-01 E2E状況調査
  QA-F:     P10-RT-02 バリデーションE2E移植（依存なし即着手）
  QA-H:     P10-RT-03 複数ステップ却下E2E
  QA-I:     RT-03 入金消込異常系E2E

【Day 3: P9-C-01-FE 完了後】
  → チームD: UX-01 実装本格着手

【Day 4-5: BL-04/BL-03/INF-09/INF-10 完了後】
  → チームA: BL-02 着手
  → チームB: INF-07 着手
  → QA-I: RT-04 受注バリデーションE2E 着手（BL-04前提）

【Day 5: チームC2 / チームC1 完了】
  → M6-1〜4, M7-5 達成
  → QA-H: AT-01 ログイン認可テスト実行

【Day 7-8: P10-RT-01〜04 完了後】
  → M6-6〜8 達成

【Day 9-10: INF-08 / SRE-I タスク完了】
  → M7-1〜4, M9-1〜4 達成
  → QA: P10-RT-05 大量データ・ページネーション E2E 実行（INF-08前提）

【Day 12: BL-01 / QA-H 完了】
  → M8-1〜4, RT-01/02 達成

【Day 13: QA-I 完了】
  → M10-2 達成

【Day 14: リリース判定】
  → T-13: 全E2Eテストパス + 性能要件（一覧3秒以内）確認
  → M5-Final = リリース準備完了 ✅
```
