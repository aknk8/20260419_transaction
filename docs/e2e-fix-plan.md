# E2Eテスト失敗原因分析と修正計画

ブランチ: `fix/e2e-test-failures`  
更新日: 2026-05-25  
対象: GitHub Actions `CI/CD` の `E2E Tests (Playwright)`

---

## 調査サマリ

`main` へのマージ後に実行された失敗 run と、修正ブランチ `fix/e2e-test-failures` の直近PR runを確認した。

- GitHub Actions run: `26353432790`
- 実行日時: 2026-05-24 14:56 JST 頃
- トリガー: `push` to `main`
- Unit Tests & Coverage: 成功
- E2E Tests (Playwright): 失敗
- Deploy to Staging: E2E失敗によりスキップ
- E2E結果: `692 tests` 中 `485 failed`, `207 passed`

上記の時点ではPR側の run は成功していたが、これはE2EがPRで実行されていないためであり、E2Eが通っていることを意味しない。

修正ブランチの直近PR runではE2E job自体はPRで実行されるようになったが、DBスキーマ確認stepで失敗している。

- GitHub Actions run: `26383519697`
- 実行日時: 2026-05-25 13:39 JST 頃
- トリガー: `pull_request`
- ブランチ: `fix/e2e-test-failures`
- Unit Tests & Coverage: 成功
- E2E Tests (Playwright): 失敗
- 失敗step: `DBスキーマ確認`
- 直接エラー: `Error: Cannot find module 'pg'`

このrunでは `npm run db:migrate` は成功している。E2E本体は `DBスキーマ確認` の失敗により未実行。

---

## 根本原因

### 原因1【CRITICAL】DBスキーマ確認stepが未導入の `pg` パッケージを参照している

修正ブランチの直近PR run `26383519697` で以下のエラーを確認した。

```text
Error: Cannot find module 'pg'
Require stack:
- /home/runner/work/20260419_transaction/20260419_transaction/[eval]
```

対象は `.github/workflows/ci.yml` の `DBスキーマ確認` step。

```yaml
- name: DBスキーマ確認
  run: |
    node -e "
      const { Client } = require('pg');
      const c = new Client(process.env.DATABASE_URL);
      c.connect()
        .then(() => c.query('SELECT 1 FROM users LIMIT 1'))
        .then(() => { console.log('schema OK'); c.end(); })
        .catch(e => { console.error(e.message); process.exit(1); });
    "
```

しかし `package.json` の依存関係には `pg` が存在せず、DBアクセスには `postgres` パッケージを使用している。

```json
"postgres": "^3.4.9"
```

`scripts/migrate.js` も `postgres` を使っているため、CIのスキーマ確認も `postgres` に合わせる必要がある。`pg` を追加するより、既存のDBドライバに揃える方が変更範囲が小さい。

### 原因2【RESOLVED IN BRANCH】CIのE2E用PostgreSQLにDBマイグレーションが実行されていなかった

Actionsログで以下のDBエラーを確認した。

```text
ERROR: relation "users" does not exist
STATEMENT: select ... from "users" ...

ERROR: relation "audit_logs" does not exist
STATEMENT: insert into "audit_logs" ...
```

`.github/workflows/ci.yml` ではPostgreSQLサービスを起動し、`DATABASE_URL` を設定してバックエンドを起動している。

```yaml
- name: バックエンドサーバー起動
  run: node server/index.js &
  env:
    DATABASE_URL: postgres://app_user:ci_test_password@localhost:5432/transaction_db_test
```

しかし、バックエンド起動前に `npm run db:migrate` が実行されていない。PostgreSQLサービスコンテナは空のDBで起動するため、`users` や `audit_logs` などのテーブルが存在しない。

`server/index.js` は `DATABASE_URL` があるとPostgreSQLモードで起動するが、マイグレーションは自動実行しない。マイグレーション用のスクリプトは `scripts/migrate.js` として存在しているため、CIで明示実行する必要がある。

修正ブランチのrun `26383519697` では `データベースマイグレーション実行` step が追加され、`All migrations applied successfully` まで到達している。この原因は修正済みと判断する。ただし、直後の `DBスキーマ確認` stepが `pg` 不足で失敗しているため、E2E本体の結果はまだ確認できていない。

### 原因3【IMPORTANT】ヘルスチェックがスキーマ未作成を検出できない

CIの起動待機は `/api/health` を確認している。

```yaml
for i in $(seq 1 30); do
  curl -sf http://localhost:3000/api/health && break || sleep 2
done
```

ただし `/api/health` はDB接続に対して `SELECT 1` だけを実行する。DB接続自体は成功するため、テーブル未作成でもヘルスチェックは成功する。

その結果、CIは「バックエンド起動成功」と判断してE2Eを開始し、ログインや監査ログ登録など実テーブルに触れた時点で大量に失敗する。

修正ブランチでは短期対策として `DBスキーマ確認` step が追加されたため、この問題は緩和されている。ただし、その確認stepは現在 `pg` 参照で失敗している。

### 原因4【RESOLVED IN BRANCH】E2EジョブがPull Requestで実行されていなかった

`.github/workflows/ci.yml` のE2Eジョブ条件は以下になっている。

```yaml
if: github.event_name == 'workflow_dispatch' || github.event_name == 'push'
```

このため、`pull_request` イベントではE2Eがスキップされる。実際に最新履歴でもPR runは約39秒で成功しており、Unit中心のチェックだけでmainに入っている。

壊れたE2Eがmainへのマージ後に初めて検出される構成になっている。

修正ブランチのrun `26383519697` は `pull_request` トリガーでE2E jobが実行されているため、この原因は修正済みと判断する。

### 原因5【IMPORTANT】`data-route` セレクタが画面内で重複し、Playwright strict mode violation が発生している

Actionsログで以下の失敗を確認した。

```text
locator('[data-route="approval"]') resolved to 2 elements:
1) <div class="menu-item" data-route="approval">...
2) <button type="button" data-route="approval" ...>すべて表示</button>
```

E2Eの複数テストが `page.locator('[data-route="approval"]').click()` のようにグローバルな `data-route` セレクタを使っている。一方、画面側にも同じ `data-route` を持つボタンが追加されているため、Playwrightのstrict modeで失敗している。

DBマイグレーション未実行が最大の原因だが、DB修正後もこのセレクタ衝突は残る可能性が高い。

---

## 既存計画からの更新点

### 2026-05-25更新: 最優先は `DBスキーマ確認` の `pg` 参照修正

`npm run db:migrate` の追加とPRでのE2E実行は直近PR runで反映済み。現在のブロッカーは、追加された `DBスキーマ確認` stepが未導入の `pg` を使っていること。

次の修正では `.github/workflows/ci.yml` の確認スクリプトを `postgres` パッケージに変更し、`SELECT 1 FROM users LIMIT 1` を実行できるようにする。

### `dashboard.spec.js` の期待値修正は「確認後対応」に格下げ

既存計画では `dashboard.spec.js` の期待値とセレクタ不一致をCRITICALとしていたが、最新Actionsログで確認できた直接原因はDBスキーマ未作成と `data-route` 重複だった。

`dashboard.spec.js` の期待値不一致はローカル調査上の可能性として残るが、まずDB初期化とセレクタ衝突を直した後、再実行結果で実際に失敗するかを確認してから修正する。

### Chart.js CDN依存はE2E必須修正から除外

既存計画ではChart.jsのnpm化をIMPORTANTとしていたが、今回のActionsログではChart.js CDN失敗がE2E全体failの直接原因である証拠は確認できなかった。

CDN依存の解消は安定化改善としては有効だが、今回のmainマージ時E2E失敗の主因ではないため、優先度を下げる。

---

## 修正計画

### Step 1: `DBスキーマ確認` stepを `postgres` パッケージに変更する

対象: `.github/workflows/ci.yml`

現在の `require('pg')` は依存関係に存在しないため失敗する。既存の `scripts/migrate.js` と同じ `postgres` パッケージを使う。

例:

```yaml
- name: DBスキーマ確認
  run: |
    node --input-type=module -e "
      import postgres from 'postgres';
      const sql = postgres(process.env.DATABASE_URL, { max: 1 });
      try {
        await sql\`SELECT 1 FROM users LIMIT 1\`;
        console.log('schema OK');
      } catch (e) {
        console.error(e.message);
        process.exitCode = 1;
      } finally {
        await sql.end();
      }
    "
  env:
    DATABASE_URL: postgres://app_user:ci_test_password@localhost:5432/transaction_db_test
```

または、スクリプトを別ファイル化してCI YAML内のインラインNodeコードを減らす。

### Step 2: CIでDBマイグレーションを実行する

対象: `.github/workflows/ci.yml`

`バックエンドサーバー起動` の前に以下を追加する。

```yaml
- name: データベースマイグレーション実行
  run: npm run db:migrate
  env:
    DATABASE_URL: postgres://app_user:ci_test_password@localhost:5432/transaction_db_test
```

これにより、E2E開始前に `server/db/migrations/*.sql` が適用される。

修正ブランチでは対応済み。直近runで `データベースマイグレーション実行` が成功していることを確認済み。

### Step 3: E2EジョブをPull Requestでも実行する

対象: `.github/workflows/ci.yml`

```diff
- if: github.event_name == 'workflow_dispatch' || github.event_name == 'push'
+ if: github.event_name == 'workflow_dispatch' || github.event_name == 'push' || github.event_name == 'pull_request'
```

これにより、mainへマージする前にE2E失敗を検出できる。

修正ブランチでは対応済み。直近runで `pull_request` トリガーのE2E jobが実行されていることを確認済み。

### Step 4: ナビゲーション用セレクタをスコープする

対象: `e2e/*.spec.js`

グローバルな `data-route` 指定を、サイドバーまたはメニュー内に限定する。

例:

```diff
- await page.locator('[data-route="approval"]').click();
+ await page.locator('.sidebar [data-route="approval"]').click();
```

同様に、`invoice`, `receipt`, `sales-order` などのナビゲーション操作も、画面内ボタンとの衝突がないか確認する。

### Step 5: CIを再実行し、残る失敗を分類する

`DBスキーマ確認` の `postgres` 化後にPRでE2Eを再実行し、残った失敗を以下に分類する。

- テスト期待値と実装の不一致
- UI変更に伴うセレクタ不一致
- テスト間のデータ汚染
- 実装バグ
- CI環境依存

`dashboard.spec.js` の期待値修正や `.dash-approval-table` へのセレクタ変更は、この段階でログ上の失敗として確認できた場合に対応する。

---

## 推奨改善

### ヘルスチェックまたはCI事前確認を強化する

`/api/health` は接続確認としては有効だが、E2E前提のスキーマ存在確認には不足している。

短期的には、CIでマイグレーション実行後に主要テーブルの存在を確認するステップを入れる。

例:

```bash
psql "$DATABASE_URL" -c 'select 1 from users limit 1'
```

中長期的には、アプリのヘルスチェックを `readiness` と `liveness` に分け、E2Eではreadinessを確認する。

### Chart.js CDN依存は別タスクで解消する

`index.html` でChart.jsをCDNから読み込んでいる場合、CIや本番環境で外部通信に依存する。今回の主因ではないが、安定性の観点ではnpm依存に寄せる価値がある。

ただし、E2E全体failの初期対応には含めない。

---

## 検証手順

### ローカル

DBを使ってE2Eを検証する場合:

```bash
npm ci
DATABASE_URL=postgres://app_user:ci_test_password@localhost:5432/transaction_db_test npm run db:migrate
DATABASE_URL=postgres://app_user:ci_test_password@localhost:5432/transaction_db_test npm run server
npm run dev
npx playwright test
```

DBを使わずインメモリでUIテストだけ確認する場合は、`DATABASE_URL` を設定せずにサーバーを起動する。

### CI

1. PRを作成する
2. `E2E Tests (Playwright)` がPR上で実行されることを確認する
3. `npm run db:migrate` がバックエンド起動前に成功することを確認する
4. `DBスキーマ確認` が `schema OK` で成功することを確認する
5. 残るE2E失敗をログとartifactで分類する

---

## 優先順位

1. `DBスキーマ確認` の `require('pg')` を `postgres` ベースに修正する
2. CIを再実行し、E2E本体が開始されることを確認する
3. `data-route` セレクタ重複を解消する
4. 再実行ログを見て、残る個別テスト失敗を修正する
5. Chart.js CDN依存などの安定化改善を別途対応する
