# GitHub Actions 失敗調査メモ（2026-05-27 JST）

## 対象

- Workflow: `CI/CD`
- Run: https://github.com/aknk8/20260419_transaction/actions/runs/26481122615
- 実行日時: 2026-05-27 08:29 JST 開始、2026-05-27 09:21 JST 終了
- Event: `pull_request`
- Branch: `fix/e2e-test-failures`
- Head SHA: `2665fec36b0690e8fbb2649997b38e6a7949db48`
- Commit: `fix(e2e): CIのDBマイグレーション未実行・セレクタ重複によるE2E全体失敗を修正`

## 結論

失敗したのは `E2E Tests (Playwright)` の `Run E2E tests` ステップのみ。
`Unit Tests & Coverage` は成功している。

E2E の結果は以下。

```text
Running 692 tests using 1 worker
95 failed
597 passed (50.8m)
```

主因は CI の Playwright E2E が同じ DB 状態を共有したまま直列実行され、各テストが固定 seed データを変更して後続テストの前提を壊していること。
加えて、一部テストには現行実装と期待値の不一致が残っている。

## 根拠

### 1. CI ジョブ結果

`gh run view 26481122615 --json ...` の結果:

- `Unit Tests & Coverage`: success
- `E2E Tests (Playwright)`: failure
- `Deploy to Staging`: skipped

`E2E Tests (Playwright)` の失敗ステップ:

- `Run E2E tests`
- 実行時間: 2026-05-27 08:30 JST から 2026-05-27 09:21 JST

### 2. CI は DB を 1 回だけ初期化して全 E2E を通し実行している

`.github/workflows/ci.yml` では PostgreSQL service を起動し、E2E 前に migration を 1 回だけ実行している。

```yaml
run: npm run db:migrate
run: npx playwright test
```

`playwright.config.js` では CI 時 `workers=1` だが、これは直列化だけであり、テストごとの DB reset ではない。

```js
workers: process.env.CI ? 1 : 4,
```

そのため、前段テストが作成・更新したデータは後段テストに持ち越される。

### 3. 固定 seed データの状態変更が後続テストを壊している

失敗は請求、支払、発注、受注、マスタ、設定画面に集中している。
代表的な固定データ依存は以下。

#### 発注系

`e2e/purchaseOrder.spec.js` は `POD-00001`、`POD-00002`、`POD-00006` を複数テストで状態変更している。

例:

- `POD-00001` を `承認依頼中`、`却下` へ変更する
- `POD-00002` を `発注済`、`納品済` へ変更する
- `POD-00006` を `却下`、`下書き`、`承認依頼中`、`承認済・発注待ち` へ変更する

後続テストは同じコードの初期状態を期待しているため、ボタンが見つからない、詳細画面へ遷移できない、ステータスが一致しないといった失敗に連鎖している。

#### 支払系

`e2e/payment.spec.js` は `POD-00005` から作成される支払依頼を毎回 `PMT-00003` として扱っている。

```js
await page.click('[data-action-create-payment="POD-00005"]');
await page.click('[data-action-detail-payment="PMT-00003"]');
```

通し実行では前段テストで既に `PMT-00003` が作成済み、または `POD-00005` が支払対象から消えるため、クリック対象が存在しなくなる。

#### 請求系

`e2e/invoice.spec.js` は `INV-00003` が常に `下書き` である前提を持っている。

```js
await page.click('[data-action-detail-invoice="INV-00003"]');
await expect(page.locator('[data-action-invoice-status="確定"]')).toBeVisible();
```

前段テストで `INV-00003` が `確定` や `送付済` へ変更されると、期待しているボタンが表示されない。

#### 受注系

`e2e/order.spec.js` では `ORD-00001` や `ORD-00006` の状態・請求対象フラグ・承認状態を固定前提にしている。
通し実行では前段テストによる発注起票、請求対象化、却下・再申請フローの影響を受ける。

### 4. 件数固定の期待値が共有状態と相性が悪い

以下のような件数固定の検証が複数ある。

```js
await expect(page.locator('.data-table-body-row')).toHaveCount(5);
await expect(page.locator('.data-table-body-row')).toHaveCount(7);
```

通し実行で前段テストが顧客、見積、発注、支払などを追加すると、固定件数は簡単に崩れる。
CI ログでも以下のような不一致が確認できる。

```text
Expected: 5
Received: 9

Expected: 7
Received: 11
```

### 5. 設定画面は現行実装とテスト期待値がずれている

`e2e/settings.spec.js` は以下を期待している。

```js
await expect(page.locator('#s-company-name')).toHaveValue('株式会社サンプル商事');
await expect(page.locator('#s-fiscal-end-month')).toHaveValue('12');
```

しかしサーバー側の `server/repositories/settingsRepository.js` のデフォルトは以下。

```js
const DEFAULTS = {
  name: '',
  address: '',
  phone: '',
  fiscalEndMonth: 3,
  ...
};
```

CI ログでも以下の不一致が出ている。

```text
Expected: "株式会社サンプル商事"
Received: ""

Expected: "12"
Received: "3"
```

これは DB 共有とは別に、テスト期待値または実装デフォルトのどちらかを仕様に合わせて修正する必要がある。

### 6. ログイン rate limit は今回の主因ではない

前回の調査で問題だった `/api/auth/login` の route 固有 rate limit は、現在の `server/routes/auth.js` では production 限定に戻っている。

```js
...(process.env.NODE_ENV === 'production' && { rateLimit: { max: 5, timeWindow: '1 minute' } })
```

今回の失敗ログには `401 Unauthorized` のブラウザログも一部あるが、E2E 全体の 95 件失敗の主因は固定データ共有と期待値ズレと判断する。

## 修正計画

### 優先度 1: E2E DB reset を導入する

各 test または各 spec の前に DB を seed 初期状態へ戻す仕組みを入れる。

候補:

- E2E 専用 reset endpoint を `NODE_ENV=test` のみ有効化し、`test.beforeEach` から呼ぶ
- Playwright fixture でテスト前 reset を共通化する
- DB truncate + seed script を用意し、spec 単位で実行する

推奨は Playwright fixture + test-only reset endpoint。
理由は、既存 E2E の修正量を抑えつつ、CI とローカルで同じ初期化手順を使えるため。

### 優先度 2: 状態変更系テストを固定 seed 依存から切り離す

`POD-00001`、`POD-00002`、`POD-00005`、`INV-00003`、`ORD-00006` などを複数テストで使い回さない。

方針:

- 各テスト内で必要なデータを作成する
- 作成結果の code を画面または API レスポンスから取得して検証に使う
- 既存 seed は読み取り専用の確認に限定する

### 優先度 3: 採番の固定期待を動的化する

以下のような固定採番期待を減らす。

- `POD-00007`
- `PMT-00003`
- `INV-00007`

代替:

- 登録後の一覧に入力した一意なタイトルが表示されることを検証する
- 詳細ボタンの `data-*` から実際の code を取得する
- API レスポンスを使える箇所では作成結果の code を保持する

### 優先度 4: 設定画面の仕様を揃える

`settings.spec.js` と `settingsRepository` のどちらを正とするか決める。

選択肢:

- サーバーのデフォルトを `株式会社サンプル商事` / `12` に合わせる
- テスト期待値を現行実装の `''` / `3` に合わせる

画面初期値としてサンプル会社情報を表示したいなら、実装側のデフォルトを直す。
本番運用で空値を許容する設計なら、テストを直す。

### 優先度 5: 件数固定テストを見直す

共有状態の影響を受ける `toHaveCount()` は、以下のどちらかに寄せる。

- DB reset 後の seed 件数として本当に固定すべきものだけ残す
- それ以外は `toBeGreaterThanOrEqual()`、特定行の存在確認、検索後の一意行確認に変更する

### 優先度 6: 段階的に再実行する

修正後の確認順序:

1. `e2e/settings.spec.js`
2. `e2e/invoice.spec.js`
3. `e2e/payment.spec.js`
4. `e2e/purchaseOrder.spec.js`
5. ローカル E2E 通し
6. GitHub Actions 再実行

## 補足

CI 最後に Node.js 20 actions deprecation warning も出ているが、今回の失敗原因ではない。

```text
Node.js 20 actions are deprecated.
```
