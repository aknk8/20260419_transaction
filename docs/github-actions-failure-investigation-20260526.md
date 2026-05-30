# GitHub Actions 失敗調査メモ（2026-05-26 JST）

## 対象

- Workflow: `CI/CD`
- Run: https://github.com/aknk8/20260419_transaction/actions/runs/26424420277
- 実行日時: 2026-05-26 08:49:03 JST 開始、2026-05-26 10:24:44 JST 終了
- Event: `pull_request`
- Branch: `fix/e2e-test-failures`
- Head SHA: `308602de92ee4bd3e1dac1a82a2fdbfd79b95a35`
- Commit: `fix(e2e): customer-master楽観更新とCI workers=1対応`

## 結論

失敗したのは `E2E Tests (Playwright)` の `Run E2E tests` ステップのみ。`Unit Tests & Coverage` は成功している。

直接の失敗結果は Playwright の E2E で `692 tests` 中 `185 failed / 507 passed`。失敗の主因は以下の二つ。

1. `/api/auth/login` に route 固有の rate limit `5 requests / 1 minute` が常時設定されており、CI 側で設定した `RATE_LIMIT_MAX=1000` がログイン API には効いていない。
2. CI では Playwright が `workers=1` で直列実行されるが、全 E2E が同じ PostgreSQL DB を共有し、テストが作成・更新したデータを次のテストへ持ち越す。そのため、固定件数や固定採番を期待するテストが後続で破綻している。

## 根拠

### 1. 失敗ジョブ

`gh run view 26424420277 --json ...` の結果:

- `Unit Tests & Coverage`: success
- `E2E Tests (Playwright)`: failure
- `Deploy to Staging`: skipped

`E2E Tests (Playwright)` の失敗ステップ:

- `Run E2E tests`
- 実行時間: 2026-05-26 08:50:47 JST から 2026-05-26 10:24:09 JST

### 2. Playwright の失敗概要

ログ抜粋:

```text
Running 692 tests using 1 worker
185 failed
507 passed (1.6h)
```

代表的な失敗:

```text
BROWSER ERRORS AFTER LOGIN: ["Failed to load resource: the server responded with a status of 401 (Unauthorized)"]
BROWSER ERRORS AFTER APPROVAL CLICK: ["Failed to load resource: the server responded with a status of 401 (Unauthorized)"]
```

多くの後続失敗は以下のように、ログイン後のアプリ画面が期待通り表示されず、サイドバーやボタンを待ってタイムアウトしている。

```text
Error: locator.click: Test timeout of 30000ms exceeded.
waiting for locator('.sidebar [data-route="invoice"]')
waiting for locator('.sidebar [data-route="master"]')
```

### 3. ログイン rate limit の不整合

CI workflow はバックエンド起動時に `RATE_LIMIT_MAX=1000` を渡している。

- `.github/workflows/ci.yml`

```yaml
RATE_LIMIT_MAX: 1000
```

サーバー側の global rate limit はこの値を使う。

- `server/index.js`

```js
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10);
rateLimit: { max: RATE_LIMIT_MAX, timeWindow: '1 minute' },
```

しかし `/api/auth/login` は route 固有の rate limit を常時 `5/min` に固定している。

- `server/routes/auth.js`

```js
rateLimit: { max: 5, timeWindow: '1 minute' }
```

コメント上は production のみに限定する意図が残っているが、実装では test/CI でも有効になっている。

```js
// Strict login rate limit only in production; dev/test relies on the global limit
//...(process.env.NODE_ENV === 'production' && { rateLimit: { max: 5, timeWindow: '1 minute' } })
rateLimit: { max: 5, timeWindow: '1 minute' }
```

CI の E2E は `workers=1` で 692 件を直列実行している。各テストが実ログインする構成のため、平均でも `692 / 96分 = 約7.2回/分` となり、`5/min` を超える時間帯が発生しうる。これによりログイン API が 401 または rate limit 由来の失敗を返し、後続の画面要素待ちタイムアウトが連鎖していると見られる。

### 4. DB 状態共有による固定期待値の破綻

CI workflow は PostgreSQL を 1 つ起動し、E2E 前に migration だけ実行している。E2E テストごとの DB 初期化はない。

- `.github/workflows/ci.yml`

```yaml
DATABASE_URL: postgres://app_user:ci_test_password@localhost:5432/transaction_db_test
run: npm run db:migrate
run: npx playwright test
```

一方、E2E には初期 seed や「先に 3 件作成済み」など、実行順や共有状態に依存した期待値がある。

例:

- `e2e/quotation.spec.js`

```js
// 既存11件 + 3件作成後の次は QUO-00015
await expect(page.locator('#f-quo-code')).toHaveValue('QUO-00015');
```

実際のログでは、期待 `QUO-00015` に対して実値は `QUO-00014`。

```text
Expected: "QUO-00015"
Received: "QUO-00014"
```

また、顧客マスタのページサイズ期待も実データと合っていない。

- `server/db/seedData.js`: `seedCustomers` は 9 件
- `app.js`: `PAGE_SIZE = 5`
- `e2e/explore-et02-04-07.spec.js`

```js
expect(rows).toBeLessThanOrEqual(5);
```

実際のログ:

```text
Expected: <= 5
Received: 9
```

この系列は、アプリ側のページング適用漏れ、またはテスト側が現在の UI/API 仕様より古い前提を持っている可能性がある。

### 5. テストコード自体の null 安全性不足

`e2e/explore-et02-04-07.spec.js` では、`getAttribute()` が `null` を返す可能性を考慮せず `includes()` を呼んでいる。

```js
const nm = await inp.getAttribute('name').catch(() => '');
const ph = await inp.getAttribute('placeholder').catch(() => '');
if (nm.includes('name') || ph.includes('名')) {
```

ログでは以下の TypeError が発生している。

```text
TypeError: Cannot read properties of null (reading 'includes')
```

これは CI 環境固有ではなく、テストコードの堅牢性不足。

## 推奨対応

優先度順:

1. `server/routes/auth.js` の login rate limit をコメント通り production 限定に戻す、または `NODE_ENV=test` では route 固有 rate limit を外す。
2. E2E の DB をテスト単位または spec 単位で初期化する。少なくとも状態を変更するテスト群は isolated DB / transaction rollback / reset endpoint のいずれかに寄せる。
3. 固定採番期待値（例: `QUO-00015`）を、現在の最大番号から次番号を計算する形に変えるか、テストごとに seed を固定する。
4. 件数期待値を仕様に合わせて修正する。ページングが仕様ならアプリ側の一覧表示を修正し、全件表示が仕様なら E2E の `<= 5` 期待を修正する。
5. `getAttribute()` の戻り値を `?? ''` で正規化し、テストコード由来の TypeError を潰す。

## 補足

GitHub Actions の最後に Node.js 20 actions deprecation warning も出ているが、今回の失敗原因ではない。

```text
Node.js 20 actions are deprecated.
```

