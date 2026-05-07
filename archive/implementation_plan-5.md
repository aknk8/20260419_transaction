# 取引管理システム 第5期実装計画

策定日: 2026-05-06

入力ドキュメント:
- `implementation_plan-4.md` — 第4期計画（未完了タスクを本ファイルに引き継ぎ）
- 各チームメモリ（teamA_state.md / teamB_state.md / teamC1_state.md / teamC2_state.md / teamD_state.md / teamE_state.md / sreI_state.md / qaH_state.md / qaI_state.md）

---

## 1. 完了済みタスク（第4期実績・参考）

| タスク | 担当 | 根拠 |
|-------|------|------|
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
| INF-09: 番号採番の競合制御 | チームB | sequenceCounterRepository.js + sequenceService.js |
| BL-04: 受注承認依頼バリデーション | チームA | orderService.js submitOrderApproval + 添付チェック |
| BL-02: 複数受注の合算請求・消費税一括計算 | チームA | invoiceService.js orderCodes配列対応 |
| BL-03: 顧客マスタ締日・支払サイト・請求先管理 | チームA + チームD | customerService/route/app.js 全対応 + テスト50件 |
| BL-01: 月次締め処理API | チームA | GET /api/invoices/candidates, GET /api/reports/monthly-summary |
| AT-01: サーバー側認可テスト（429・停止401） | QA-H | auth.test.js 34件通過 |
| RT-01: 完全業務フロー E2E | QA-H | full-flow.spec.js 22件通過 |
| RT-02: 社長決裁ルート E2E | QA-H | president-approval.spec.js 16件通過 |
| P10-RT-03: 複数ステップ承認の途中ステップ却下 E2E | QA-H | approval-multistep.spec.js 8件通過 |
| RT-03: 入金消込異常系 E2E | QA-I | receipt-edge.spec.js 9件通過 |
| RT-04: 受注承認依頼バリデーション E2E | QA-I | order-approval-validation.spec.js 5件通過 |
| RT-06: UI層権限ネガティブテスト | QA-I | permission-negative.spec.js 10件通過 |

---

## 2. 残タスク一覧（2026-05-06 時点）

> 本セクションが第5期の対象範囲。完了次第セクション1へ移動。

### 2.1 インフラ基盤（順次依存・最優先）

| ID | タスク | 担当（第5期） | 優先度 | 状態 |
|----|-------|------------|--------|------|
| INF-10 | DBトランザクション境界の設計と実装 | チームB（主）+ チームC1 + チームA（サポート） | 🔴 最高 | ❌ 未着手 |
| INF-07 | DBインデックス設計・クエリ最適化 | チームB（主）+ SRE-I（EXPLAIN確認） | 🟠 高 | ❌ 未着手（INF-10後） |
| INF-08 | APIサーバー側ページネーション実装（12エンドポイント） | チームB + チームC2 + チームA（3チーム並行） | 🟠 高 | ❌ 未着手（INF-07後） |

### 2.2 QA・E2Eテスト

| ID | タスク | 担当（第5期） | 優先度 | 状態 |
|----|-------|------------|--------|------|
| T-01 | E2Eテスト状況調査・失敗テスト修正 | QA-E | 🔴 最高 | ❓ 解決未確認 |
| P10-RT-01 | 却下→修正→再申請 E2Eシナリオ（全4伝票） | QA-E | 🔴 最高 | ❌ 専用フロー未実装 |
| P10-RT-02 | 各画面バリデーションE2Eの分散追加（8ファイル） | QA-F | 🔴 最高 | ❓ 移植状況未確認 |
| P10-RT-04 | 発注→納品→請求のデータ連鎖整合性 E2E | QA-F + QA-I | 🟠 高 | △ zzz-data-chain.spec.js 追加済み、本格実装未 |
| RT-05 | 伝票状態遷移制御 E2E | QA-E + チームE | 🟠 高 | ❓ 既存specへの追加状況未確認 |
| P10-RT-05 | 大量データ・ページネーション動作確認 | QA-F | 🟡 中 | 🔴 INF-08完了まで着手不可 |
| T-13 | 全E2Eテストパス + 性能要件確認（一覧3秒以内） | QA（E/F/H/I） | 🔴 最高 | ❌ 全開発完了後に着手 |

---

## 3. タスク詳細

### INF-10: DBトランザクション境界の設計と実装

以下の複数テーブル更新操作を1トランザクションにまとめる:

**対象操作と担当分割**:

| 操作 | 更新テーブル | 担当 |
|------|------------|------|
| 承認操作 | ステータス変更 + 承認履歴INSERT + 通知INSERT | チームB（approvalService.js） |
| 請求確定 | ステータス変更 + 採番 + 監査ログINSERT | チームA（invoiceService.js、BL実装経験あり） |
| 入金消込 | 入金INSERT + 請求ステータス更新 + 未収残高更新 | チームA（receiptService.js） |

**チームC1担当**: `server/db/transaction.js` — 共通トランザクションヘルパー実装

```javascript
// server/db/transaction.js
export async function withTransaction(db, fn) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

**TDD**:
```
// approvalService.test.js
it('should rollback all changes when approval history insert fails')
it('should rollback all changes when notification insert fails')

// invoiceService.test.js
it('should rollback all changes when sequence numbering fails')

// receiptService.test.js
it('should rollback all changes when payment status update fails')
```

---

### INF-07: DBインデックス設計・クエリ最適化

**追加インデックス**（`server/db/migrations/004_indexes.sql`）:
```sql
CREATE INDEX idx_quotations_status_date ON quotations(status, issue_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_invoices_status_due ON invoices(status, due_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_quotations_approval_pending ON quotations(status) WHERE status = '承認依頼中';
CREATE INDEX idx_invoices_customer ON invoices(customer_id, status);
CREATE INDEX idx_payments_supplier ON payments(supplier_id, status);
```

**SRE-I担当**: ステージングデータ（各テーブル1,000件以上投入）で `EXPLAIN ANALYZE` 実行し、一覧表示3秒以内をM7-4として確認・記録。

---

### INF-08: APIサーバー側ページネーション実装（12エンドポイント）

**クエリパラメータ**: `?page=1&limit=20`

**レスポンス形式**:
```json
{
  "data": [...],
  "meta": { "total": 150, "page": 1, "pageSize": 20, "totalPages": 8 }
}
```

**エンドポイント分担**（3チーム並行）:

| チーム | 担当エンドポイント（各4件） |
|-------|----------------------|
| チームB（BE-D） | GET /api/quotations, /api/orders, /api/purchase-orders, /api/payments |
| チームC2（BE-H） | GET /api/users, /api/approvals, /api/notifications, /api/suppliers |
| チームA（BE-C） | GET /api/invoices, /api/customers, /api/deliveries, /api/products |

**共通ヘルパー**（チームBが先行実装、他チームが再利用）:
```javascript
// server/db/paginate.js
export function buildPaginatedQuery(baseQuery, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  return { dataQuery: `${baseQuery} LIMIT $1 OFFSET $2`, countQuery: `SELECT COUNT(*) FROM (${baseQuery}) t`, params: [limit, offset] };
}
```

**TDD（各エンドポイント共通）**:
```
it('should return data and meta when page=1&limit=20')
it('should return empty data array when page exceeds total pages')
it('should default to page=1 and limit=20 when params omitted')
```

---

### T-01: E2Eテスト状況調査・修正

**作業手順**:
1. フロントサーバー（`npm run dev`）とバックエンドサーバー（`node server/index.js`）を同時起動
2. `npx playwright test --reporter=list 2>&1` で失敗テストを特定
3. フロント側 mock ルートの不整合または app.js のバグを修正
4. 全テスト合格確認

---

### P10-RT-01: 却下→修正→再申請 E2Eシナリオ（全4伝票）

**対象ファイル**: `e2e/quotation.spec.js`（見積）, `e2e/order.spec.js`（受注）, `e2e/purchase-order.spec.js`（発注）, `e2e/invoice.spec.js`（請求）

**シナリオ（各伝票で実施）**:
1. 担当者が申請 → 承認者が却下（却下理由コメントあり）
2. 担当者がコメント確認 → 内容修正 → 再申請
3. 承認者が承認 → 承認済み確認

---

### P10-RT-02: 各画面バリデーションE2Eの分散追加（8ファイル）

**対象**: `e2e/quotation.spec.js`, `e2e/order.spec.js`, `e2e/purchase-order.spec.js`, `e2e/invoice.spec.js`, `e2e/payment.spec.js`, `e2e/delivery.spec.js`, `e2e/customer.spec.js`, `e2e/supplier.spec.js`

**作業手順**:
1. 各 spec の現行内容を確認し、バリデーション E2E が存在するか棚卸し
2. 未移植のバリデーションテスト（必須項目空欄・不正形式・上限超過など）を各 spec に追加
3. 全 spec を実行して全通過を確認

---

### P10-RT-04: 発注→納品→請求のデータ連鎖整合性 E2E

**ファイル**: `e2e/zzz-data-chain.spec.js`

**シナリオ**:
1. 受注作成 → 発注起票（受注コード紐付け）→ 納品登録（発注コード紐付け）
2. 請求起票（受注コード紐付け）→ 金額整合性確認（受注合計 = 請求合計）
3. 入金登録 → 消込完了確認
4. 各ステップでコード・ステータス・金額の整合性を assert

---

### RT-05: 伝票状態遷移制御 E2E

**シナリオ**（既存 spec への追加）:
- 確定済み請求を直接編集しようとしたときに変更がブロックされること
- 取消済み見積から受注作成しようとしたときにブロックされること

---

### P10-RT-05: 大量データ・ページネーション動作確認

**前提**: INF-08 完了後に着手

**シナリオ**:
1. 各一覧画面（見積・受注・請求など）で 100件以上のデータを登録
2. ページネーション UI が正常に動作すること（2ページ目遷移・totalPages表示）
3. 一覧表示が3秒以内であること

---

### T-13: 全E2Eテストパス + 性能要件確認

**前提**: INF-10/07/08, P10-RT-01/02/04, RT-05 すべて完了後

**作業手順**:
1. `npx playwright test` を全 spec 対象で実行
2. 全テスト 0件失敗を確認
3. 主要一覧画面（見積・受注・請求）の初期表示 3秒以内を手動確認
4. M5-Final チェックリスト（F-1〜F-6）を全項目確認・記録

---

## 4. チーム構成（第5期）

### 4.1 継続タスクあり

| チーム | メンバー | 担当スコープ | 優先度 |
|-------|---------|------------|-------|
| チームB | BE-D | INF-10 → INF-07 → INF-08（主担当、全3タスク連続） | 🔴 最高 |
| QA-E | QA-E | T-01確認 → P10-RT-01 → RT-05 → T-13支援 | 🔴 最高 |
| QA-F | QA-F | P10-RT-02確認/補完 → P10-RT-04充実 → P10-RT-05（INF-08後） | 🔴 最高 |

### 4.2 旧タスク完了・第5期再配置

| チーム | 元完了タスク | 第5期再配置先 | 新担当スコープ |
|-------|------------|------------|------------|
| **チームC1（BE-G）** | INF-04/INF-05 ✅ | チームB合流（INF-10サポート） | `server/db/transaction.js` 共通ヘルパー実装、承認/請求/入金トランザクション適用レビュー → 完了後離脱 |
| **チームA（BE-C）** | BL-01〜BL-04 ✅ | チームB合流（INF-10/08サポート） | INF-10: invoiceService + receiptService のトランザクション適用 → INF-08: invoices/customers/deliveries/products ページネーション実装 |
| **SRE-I** | INF-01〜INF-06 ✅ | チームB合流（INF-07サポート） | INF-07: ステージングデータ投入 → EXPLAIN ANALYZE 実行・性能評価 → M7-4確認記録 → 完了後離脱 |
| **チームC2（BE-H）** | T-09〜P9-E-BE ✅ | チームB合流（INF-08サポート） | INF-08: users/approvals/notifications/suppliers ページネーション実装 → 完了後離脱 |
| **チームE（FE-K）** | UX-01 ✅ | QAサポート継続 | RT-05フロント状態遷移バグ修正対応、T-13で発生するフロントバグ修正 |
| **QA-H** | AT-01/RT-01/02/P10-RT-03 ✅ | T-13最終確認 | 完了済みspec（full-flow, president-approval, approval-multistep）の回帰確認、T-13全スイート実行支援 |
| **QA-I** | RT-03/04/06 ✅ | P10-RT-04サポート → T-13 | zzz-data-chain.spec.js の充実化サポート、T-13全スイート実行・結果集計 |

### 4.3 離脱チーム

| チーム | 理由 |
|-------|------|
| チームD（FE-A+FE-B） | 全タスク完了（P9-C-01-FE + UX-01前半 + BL-03フロント）。第5期対応タスクなし |

---

## 5. マイルストーン（第5期）

### M7: バックエンド基盤完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M7-1 | INF-08 全一覧APIにページネーション実装済み | チームB + チームC2 + チームA | ❌ 未着手 |
| M7-2 | INF-09 採番競合制御が機能する | チームB | ✅ 達成済み |
| M7-3 | INF-10 複数テーブル更新が1トランザクションで実行される | チームB + チームC1 + チームA | ❌ 未着手 |
| M7-4 | INF-07 インデックス適用後の一覧表示3秒以内をEXPLAIN確認 | チームB + SRE-I | ❌ 未着手 |
| M7-5 | INF-04/05 Pinoログ出力・ヘルスチェック動作確認 | チームC1 | ✅ 達成済み |

### M6: 残E2E（引き継ぎ）完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M6-6 | P10-RT-01 却下→再申請E2Eが4伝票でパス | QA-E | ❌ 未完 |
| M6-7 | P10-RT-02 バリデーションE2Eが各画面specに追加・パス | QA-F | ❓ 移植状況未確認 |
| M6-8 | P10-RT-03/04 追加E2Eがパス | QA-H / QA-F + QA-I | P10-RT-03: ✅ / P10-RT-04: △ 未充実 |

### M10: UX・テスト強化完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M10-1 | UX-01 全画面でローディング・トースト・エラーが表示される | チームD + チームE | ✅ 達成済み |
| M10-2 | RT-01〜RT-06 全新規E2Eがパス | QA-H + QA-I | RT-01/02/03/04/06 ✅ / RT-05 ❓ 未確認 |
| M10-3 | AT-01 ログイン429・停止401のAPIテストがパス | QA-H | ✅ 達成済み |

### M5-Final: 本番リリース準備完了

| # | 確認項目 | 状態 |
|---|---------|------|
| F-1 | M6〜M10 の全確認項目が満たされている | ❌ M7/M6/M10未完 |
| F-2 | T-13: 全E2Eテストがゼロ退行でパスする | ❌ 未実施 |
| F-3 | 主要一覧画面の初期表示が3秒以内 | ❌ INF-08待ち |
| F-4 | HTTPS通信・CSPヘッダー・レートリミット・認可が全て機能する | ✅ 達成済み |
| F-5 | CI/CD パイプラインがmainブランチで自動実行されている | ✅ 達成済み |
| F-6 | バックアップスクリプトが本番環境で設定済み | ✅ 達成済み |

---

## 6. 依存関係と並行実行マップ

```
2026-05-06 第5期起点
│
├─[チームD]   ✅ 離脱
│
├─[QA-H]      ✅ 全タスク完了 → T-13最終確認サポートへ再配置
├─[QA-I]      ✅ RT-03/04/06完了 → P10-RT-04サポート → T-13へ再配置
│
├─[チームB] ── INF-10（+C1+A）──→ INF-07（+SRE-I）──→ INF-08（+C2+A、3チーム並行）──→ M7-1/3/4
│               ↑チームC1: transaction.js ヘルパー     ↑SRE-I: EXPLAIN ANALYZE
│               ↑チームA: invoiceService/receiptService  ↑チームC2: users/approvals/notifications/suppliers
│                                                        ↑チームA: invoices/customers/deliveries/products
│
├─[QA-E] ──── T-01確認 ──→ P10-RT-01（4伝票）──→ RT-05 ──→ T-13支援
│             │0.5日        │2日                  │1日        └──────────────→ M6-6, M10-2
│
├─[QA-F] ──── P10-RT-02確認/補完 ──→ P10-RT-04充実 ──→ P10-RT-05（INF-08完了後）──→ T-13
│             │2日                   │1日               │                           ✅M6-7, M6-8
│
├─[チームE] ── RT-05フロントバグ修正（QA-Eと連携）──→ T-13フロントバグ修正（随時）
│
└─[T-13] ← 全開発完了後（INF-10/07/08 + P10-RT-01/02/04 + RT-05 完了）──→ M5-Final ✅

直列依存ゲート:
  INF-10完了  → INF-07着手可（チームB + SRE-I）、チームC1離脱
  INF-07完了  → INF-08着手可（チームB + チームC2 + チームA、並行実装）、SRE-I離脱
  INF-08完了  → P10-RT-05実施可（QA-F）、チームC2/チームA離脱
  全開発完了  → T-13（最終E2E + 性能確認）→ M5-Final
```

---

## 7. スケジュール（第5期・再編後）

```
（凡例: ❌=未着手  △=部分着手  ✅=完了）

        N日    N+1    N+2    N+3    N+4    N+5    N+6    N+7
チームB ├─INF-10(B+C1+A)──┤INF-07(B+SRE)──┤─────INF-08(B+C2+A並行)─────┤
        │2日               │2日             │3日                  ✅M7-1/3/4

QA-E    ├─T-01確認─┤P10-RT-01（4伝票）────────────┤RT-05──┤T-13支援──────┤
        │0.5日     │2日                             │1日    │1日 ✅M6-6

QA-F    ├─P10-RT-02確認/補完────┤P10-RT-04充実──┤         P10-RT-05──────┤
        │2日                    │1日             ↑INF-08完了後 ✅M6-7/8

チームE ├─RT-05フロントバグ修正対応（随時・QA-Eと連携）──→ T-13フロントバグ修正─┤

QA-H    ├─T-13最終確認支援（全specパス確認・結果集計）────────────────────────┤

QA-I    ├─P10-RT-04充実サポート────────────→ T-13最終確認──────────────────┤

【T-13】 ← INF-10/07/08 + P10-RT-01/02/04/05 + RT-05 全完了後着手 ──→ M5-Final ✅
```

---

## 8. 即着手リスト（第5期 Day 1）

### チームB（BE-D）— INF-10 着手（最優先）
- [ ] `server/services/approvalService.js`: 承認操作（ステータス変更 + 承認履歴INSERT + 通知INSERT）を1トランザクションに
- [ ] チームC1が実装する `server/db/transaction.js` の `withTransaction` ヘルパーを利用
- [ ] TDD: `approvalService.test.js` にロールバックテスト追加
- [ ] `server/services/invoiceService.js`（INF-10 請求確定、チームAと分担）
- [ ] `server/services/receiptService.js`（INF-10 入金消込、チームAと分担）

### チームC1（BE-G）— INF-10 トランザクションヘルパー（チームBへ合流）
- [ ] `server/db/transaction.js` 作成（`withTransaction(db, fn)` ヘルパー）
- [ ] テスト: `server/db/transaction.test.js`（コミット・ロールバック・ネストテスト）
- [ ] チームBの approvalService / invoiceService のトランザクション適用をレビュー

### チームA（BE-C）— INF-10 サポート（invoice/receipt）
- [ ] `server/services/invoiceService.js`: 請求確定（ステータス + 採番 + 監査ログ）を1トランザクションに（BL-01実装の知見を活用）
- [ ] `server/services/receiptService.js`: 入金消込（入金INSERT + 請求ステータス更新）を1トランザクションに
- [ ] TDD: 各 service.test.js にロールバックテスト追加

### QA-E — T-01 E2E調査
- [ ] フロントサーバー（`npm run dev`）+ バックエンドサーバー（`node server/index.js`）同時起動
- [ ] `npx playwright test --reporter=list` で失敗テストを特定・記録
- [ ] 失敗原因を分析し修正方針をチームEと協議

### QA-F — P10-RT-02 棚卸し
- [ ] `e2e/quotation.spec.js` 〜 `e2e/supplier.spec.js` の各 spec でバリデーション E2E の有無を確認
- [ ] 未移植箇所を列挙し、追加実装に着手

### SRE-I — INF-07 着手準備（INF-10完了待ち）
- [ ] ステージングデータ投入スクリプト準備（各テーブル1,000件以上）
- [ ] INF-07実装完了後即時 EXPLAIN ANALYZE 実行できる環境を整備

### QA-H — T-13 最終確認準備
- [ ] 完了済みspec（full-flow.spec.js / president-approval.spec.js / approval-multistep.spec.js）の実行コマンドと結果確認手順を整理
- [ ] T-13実行時の全spec実行順序・所要時間を試算

### QA-I — P10-RT-04 サポート
- [ ] `e2e/zzz-data-chain.spec.js` の現行内容を確認
- [ ] QA-Fと協力して発注→納品→請求のデータ連鎖テストシナリオを充実化

---

## 9. 優先対応順（第5期）

```
【即着手（並行）】
  チームB + チームC1 + チームA: INF-10 DBトランザクション境界（最優先・ブロッカー）
  QA-E:                        T-01 E2E失敗調査（サーバー同時起動→失敗特定）
  QA-F:                        P10-RT-02 棚卸し（8ファイル確認・未移植分追加）

【INF-10完了後】
  → チームB + SRE-I:  INF-07 DBインデックス実装 → EXPLAIN ANALYZE（性能確認）
  → チームC1 離脱（全タスク完了）
  → QA-E: P10-RT-01 spec完成着手（4伝票）

【INF-07完了後】
  → チームB + チームC2 + チームA: INF-08 ページネーション実装（12エンドポイント・3チーム並行）
  → SRE-I 離脱（M7-4チェック実施・確認記録）
  → QA-F: P10-RT-04充実化

【INF-08完了後】
  → M7-1/3/4 達成
  → QA-F: P10-RT-05 ページネーション E2E 実行
  → チームC2 離脱
  → チームA 離脱

【P10-RT-01/02/04/05 + RT-05 完了後】
  → M6-6/7/8 達成
  → M10-2 達成（RT-05確認後）

【全開発・QAタスク完了後】
  → T-13: 全E2Eテストパス（QA-E/F/H/I） + 性能要件（一覧3秒以内）確認
  → M5-Final: 本番リリース準備完了 ✅
```

---

## 10. 工数見積もり（第5期）

| タスク | チームB | チームC1 | チームA | チームC2 | SRE-I | チームE | QA-E | QA-F | QA-H | QA-I |
|-------|--------|---------|--------|---------|-------|--------|------|------|------|------|
| INF-10 | 1.5日 | 1日 | 1日 | — | — | — | — | — | — | — |
| INF-07 | 1.5日 | — | — | — | 1日 | — | — | — | — | — |
| INF-08 | 1日 | — | 1日 | 1日 | — | — | — | — | — | — |
| T-01 | — | — | — | — | — | 随時 | 0.5日 | — | — | — |
| P10-RT-01 | — | — | — | — | — | — | 2日 | — | — | — |
| P10-RT-02 | — | — | — | — | — | — | — | 2日 | — | — |
| P10-RT-04 | — | — | — | — | — | — | — | 1日 | — | 0.5日 |
| RT-05 | — | — | — | — | — | 随時 | 1日 | — | — | — |
| P10-RT-05 | — | — | — | — | — | — | — | 1日 | — | — |
| T-13 | — | — | — | — | — | 随時 | 1日 | 1日 | 1日 | 1日 |
| **合計** | **4日** | **1日** | **2日** | **1日** | **1日** | **随時** | **4.5日** | **5日** | **1日** | **1.5日** |

**カレンダー日数目標: 約7〜8日（最終的なM5-Final達成まで）**
