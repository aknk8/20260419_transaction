# CI 失敗原因調査レポート

**作成日**: 2026-05-29  
**対象ブランチ**: `fix/e2e-test-failures`  
**調査対象**: GitHub Actions E2E テストジョブ（Playwright / Chromium）

---

## 1. 概要

直近の CI（E2E Tests ジョブ）で複数のテストが失敗している。失敗の主な原因は以下の 2 点に集約される。

1. **承認ワークフロー追加後にテストコードをアップデートしていない**（ワークフロー不整合）
2. **シードデータとテストの期待値がずれている**（データ不整合）

各種失敗は連鎖しており、1 つの根本原因が複数テストに影響している。

---

## 2. 根本原因一覧

| # | 根本原因 | 影響スペック | 推定失敗テスト数 |
|---|----------|-------------|----------------|
| RC-1 | 受注承認ワークフローの導入による発注起票・請求対象化ボタン条件変更 | `order.spec.js`, `purchaseOrder.spec.js` | 約 20 件 |
| RC-2 | 請求書承認ワークフローの導入による確定ボタン条件変更 | `invoice.spec.js` | 約 6 件 |
| RC-3 | `resetDb` が `approval_routes` テーブルを再シードしない | 承認フローを踏むテスト全般 | 横断的 |
| RC-4 | `page-size.spec.js` の見積件数期待値が古いまま（7 件 → 11 件） | `page-size.spec.js` | 3 件 |
| RC-5 | `explore-et04-master.spec.js` のページネーション前提誤り | `explore-et04-master.spec.js` | 約 4 件 |
| RC-6 | `invoice-approval.spec.js` のモック API が空オブジェクトを返すため状態バッジが更新されない | `invoice-approval.spec.js` | 約 3 件 |
| RC-7 | `payment.spec.js` で承認後のステータスバッジが更新されない | `payment.spec.js` | 約 16 件 |

---

## 3. 根本原因詳細

### RC-1: 受注承認ワークフロー導入による発注起票・請求対象化ボタン条件変更（最重要）

**発生箇所**

- `app.js` 行 3041–3048

```js
// 現在のコード（承認済みのみボタン表示）
(canEdit && order.status === '承認済み' && !order.billingTarget
  ? '<button ... data-action-billing-target="...">請求対象化</button>'
  : '') +
(canEdit && order.status === '承認済み'
  ? '<button ... data-action-create-purchase-order="...">発注起票</button>'
  : '')
```

**原因**

承認ワークフロー導入コミット（`25b7c54`）で「`受注済み` → 発注起票可」から「`承認済み` → 発注起票可」に変更された。しかし `order.spec.js` のテストは旧ワークフロー（`受注済み` で発注起票可）前提のまま残っている。

**シードデータの状態**

| コード | ステータス |
|--------|----------|
| ORD-00001 | 受注済み |
| ORD-00002 | 受注済み |
| ORD-00003 | 完了 |
| ORD-00004 | 受注済み |
| ORD-00005 | 受注済み |
| ORD-00006 | 承認依頼中 |

**`承認済み` の受注がシードに存在しない**ため、ボタンが一切表示されずタイムアウト（約 31.5 秒）する。

**影響テスト（`order.spec.js` 行 258–288）**

```js
// 失敗例：受注済みでのボタン表示を期待しているが、現在は承認済みのみ表示
test('should show 発注起票 button when order status is 受注済み', ...)
test('should show 請求対象化 button when order status is 受注済み ...', ...)
test('should show 請求対象 badge and hide 請求対象化 button after clicking 請求対象化', ...)
```

**影響テスト（`purchaseOrder.spec.js` 行 50–100）**

`beforeEach` で `[data-action-create-purchase-order="ORD-00001"]` をクリックしようとするが、ボタンが存在しないため全テストが 30 秒タイムアウト。

---

### RC-2: 請求書承認ワークフロー導入による確定ボタン条件変更

**原因**

`app.js` 行 3864–3880 で、`確定する` ボタンは `invoice.status === '承認済み'` の場合のみ表示される。しかし `invoice.spec.js`（行 165–196）のテストは `下書き` 状態で `確定する` ボタンが表示される旧ワークフローを想定している。

**シードデータの状態**

| コード | ステータス |
|--------|----------|
| INV-00003 | 下書き |
| INV-00005 | 承認依頼中 |
| INV-00006 | 確定 |

**`承認済み` の請求書がシードに存在しない**ため、`確定する` ボタンが表示されずタイムアウト。

**影響テスト（`invoice.spec.js` 行 165–196 付近）**

```js
// 失敗例：下書き状態での確定ボタン表示を期待
test('should show 確定する button for 承認済み invoice', ...)
```

---

### RC-3: `resetDb` が `approval_routes` テーブルを再シードしない

**発生箇所**

- `server/db/resetDb.js` 行 29–36

```js
await db.execute(sql`
  TRUNCATE TABLE
    audit_logs, approval_history, notifications,
    ..., approval_routes, ...   -- TRUNCATEしている
    RESTART IDENTITY CASCADE
`);
// approval_routes への INSERT が存在しない！
```

**原因**

`resetDb` は `approval_routes` テーブルをクリアするが、その後に再投入しない。したがって各テスト実行後（フィクスチャの自動リセット後）、承認ルートが空の状態になる。

承認申請 → 承認処理のフローを通すテストは、承認ルートが存在しない状態で実行されるため失敗する可能性がある。

---

### RC-4: `page-size.spec.js` の見積件数期待値が古いまま

**発生箇所**

- `e2e/page-size.spec.js` 行 21, 31, 37

```js
// 失敗：シードには11件の見積があるのに7件を期待
await expect(...).toContainText('全 7 件中 1 - 5 件を表示')
```

**原因**

シードデータの見積（QUO-00001 〜 QUO-00011）は **11 件** だが、テストは旧シードの **7 件** を想定している。スプリント後半で見積シードが増えたが、`page-size.spec.js` が更新されなかった。

---

### RC-5: `explore-et04-master.spec.js` のページネーション前提誤り

**発生箇所**

- `e2e/explore-et04-master.spec.js` 行 48

```js
// 失敗：顧客が9件でページサイズ20のため「次へ」ボタンは無効（disabled）
await page.locator('[data-pagination-next]').click();
```

**原因**

シードの顧客数は **9 件**、デフォルトのページサイズは **20 件** のため、一覧は 1 ページで収まる。`次へ` ボタンは disabled 状態のため、クリックが反応せず 30 秒タイムアウト。

---

### RC-6: `invoice-approval.spec.js` のモック API が空オブジェクトを返す

**発生箇所**

- `e2e/invoice-approval.spec.js` の `setupPage()` ヘルパー

```js
// 全 GET をabort、非GETは {} を返すモック
await page.route('/api/**', async (route) => {
  if (route.request().method() === 'GET') {
    await route.abort();
  } else {
    await route.fulfill({ json: {} });
  }
});
```

**原因**

承認申請・承認操作などの PATCH/POST リクエストに対して `{}` を返すため、フロントエンドがレスポンスのステータスフィールドを読み取れない。ステータスバッジが更新されず、後続のアサーションが失敗する。

**影響テスト例**

```js
// 失敗：ステータスが「下書き」のまま更新されない
test('status should change to 承認待ち after 承認依頼 click', ...)
// 失敗：確定するボタンが表示されない（承認済みにならないため）
test('should show 確定する button after approval', ...)
```

---

### RC-7: `payment.spec.js` で承認後のステータスバッジが更新されない

**発生箇所**

- `e2e/payment.spec.js` 行 181–

**原因**

支払詳細画面で `[data-action-payment-status="承認待ち"]` ボタンをクリックした後、`.status-badge` が `承認待ち` に更新されることを期待するが、更新が反映されない（約 2.3 秒で失敗）。

考えられる原因：
1. PATCH レスポンスのフロントエンド反映処理に問題がある
2. RC-3 と同様に `approval_routes` が空のため承認申請 API がエラーを返している

この失敗が以降の 15+ テストに連鎖する（`PMT-00003` が `承認待ち` に遷移しないため、承認ボタンのテストが全滅）。

---

## 4. 失敗テストファイル別サマリ

| ファイル | 主な根本原因 | 推定失敗件数 |
|---------|------------|------------|
| `order.spec.js` | RC-1 | 約 5 件 |
| `purchaseOrder.spec.js` | RC-1 | 約 10 件 |
| `invoice.spec.js` | RC-2 | 約 6 件 |
| `invoice-approval.spec.js` | RC-6 | 約 3 件 |
| `payment.spec.js` | RC-7 | 約 16 件 |
| `page-size.spec.js` | RC-4 | 3 件 |
| `explore-et04-master.spec.js` | RC-5 | 約 4 件 |

---

## 5. 修正方針

### 優先度 HIGH（テスト多数かつ確実に失敗）

**A. シードデータへの `承認済み` 受注・請求書を追加（RC-1, RC-2 解消）**

`server/db/seedData.js` に `承認済み` ステータスの受注・請求書を追加し、テストが正しい状態を前提にできるようにする。または、テストが各自で承認フローを踏んで状態を作るよう書き直す。

**B. `resetDb` に `approval_routes` の再シードを追加（RC-3 解消）**

```js
// server/db/resetDb.js に追加
await db.insert(approvalRoutes).values(/* 標準承認ルートデータ */);
```

### 優先度 MEDIUM（テスト期待値の修正）

**C. `page-size.spec.js` の件数期待値を 11 件に修正（RC-4 解消）**

```js
// 修正前
await expect(...).toContainText('全 7 件中 1 - 5 件を表示')
// 修正後
await expect(...).toContainText('全 11 件中 1 - 5 件を表示')
```

**D. `explore-et04-master.spec.js` のページネーションテスト修正（RC-5 解消）**

顧客数（9 件）に合わせてシードを増やすか、ページサイズを変更してから `次へ` をクリックするようにテストを修正する。

### 優先度 MEDIUM（モック設計の修正）

**E. `invoice-approval.spec.js` のモックを適切な状態遷移レスポンスに変更（RC-6 解消）**

非 GET リクエストへのモックレスポンスに `status` フィールドを含め、フロントエンドのステータスバッジ更新を可能にする。

### 優先度 MEDIUM（支払承認フローの調査）

**F. `payment.spec.js` 承認ステータス更新の根本調査（RC-7 解消）**

`[data-action-payment-status="承認待ち"]` クリック後の PATCH レスポンスとフロントエンドの状態更新コードを確認し、RC-3（承認ルート未設定）の解消で解決するかを確認する。

---

## 6. 調査ファイル一覧

| ファイル | 調査内容 |
|---------|---------|
| `.github/workflows/ci.yml` | CI ジョブ構成・PostgreSQL サービス設定 |
| `e2e/fixtures.js` | 自動 DB リセットフィクスチャ |
| `server/db/resetDb.js` | TRUNCATE + 再シードロジック |
| `server/db/seedData.js` | シードデータ（受注・請求書・支払ステータス確認） |
| `scripts/seed-e2e.js` | CI 向け初期シードスクリプト |
| `app.js` 行 3041–3052 | 受注詳細の発注起票・請求対象化ボタン条件 |
| `app.js` 行 3864–3880 | 請求書詳細の確定ボタン条件 |
| `e2e/order.spec.js` | 発注起票・請求対象化テスト（RC-1 影響） |
| `e2e/purchaseOrder.spec.js` | 発注テスト beforeEach（RC-1 影響） |
| `e2e/invoice.spec.js` | 請求確定テスト（RC-2 影響） |
| `e2e/invoice-approval.spec.js` | 請求承認モックテスト（RC-6 影響） |
| `e2e/payment.spec.js` | 支払承認フローテスト（RC-7 影響） |
| `e2e/page-size.spec.js` | ページサイズテスト（RC-4 影響） |
| `e2e/explore-et04-master.spec.js` | マスタページネーションテスト（RC-5 影響） |
