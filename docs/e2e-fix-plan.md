# E2Eテスト失敗原因分析と修正計画

ブランチ: `fix/e2e-test-failures`  
更新日: 2026-05-24  
対象: GitHub Actions `CI/CD` の `E2E Tests (Playwright)`

---

## 調査サマリ

`main` へのマージ後に実行された最新の失敗 run を確認した。

- GitHub Actions run: `26353432790`
- 実行日時: 2026-05-24 14:56 JST 頃
- トリガー: `push` to `main`
- Unit Tests & Coverage: 成功
- E2E Tests (Playwright): 失敗
- Deploy to Staging: E2E失敗によりスキップ
- E2E結果: `692 tests` 中 `485 failed`, `207 passed`

PR側の run は成功しているが、これはE2EがPRで実行されていないためであり、E2Eが通っていることを意味しない。

---

## 根本原因

### 原因1【CRITICAL】CIのE2E用PostgreSQLにDBマイグレーションが実行されていない

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

### 原因2【CRITICAL】ヘルスチェックがスキーマ未作成を検出できない

CIの起動待機は `/api/health` を確認している。

```yaml
for i in $(seq 1 30); do
  curl -sf http://localhost:3000/api/health && break || sleep 2
done
```

ただし `/api/health` はDB接続に対して `SELECT 1` だけを実行する。DB接続自体は成功するため、テーブル未作成でもヘルスチェックは成功する。

その結果、CIは「バックエンド起動成功」と判断してE2Eを開始し、ログインや監査ログ登録など実テーブルに触れた時点で大量に失敗する。

### 原因3【IMPORTANT】E2EジョブがPull Requestで実行されていない

`.github/workflows/ci.yml` のE2Eジョブ条件は以下になっている。

```yaml
if: github.event_name == 'workflow_dispatch' || github.event_name == 'push'
```

このため、`pull_request` イベントではE2Eがスキップされる。実際に最新履歴でもPR runは約39秒で成功しており、Unit中心のチェックだけでmainに入っている。

壊れたE2Eがmainへのマージ後に初めて検出される構成になっている。

### 原因4【IMPORTANT】`data-route` セレクタが画面内で重複し、Playwright strict mode violation が発生している

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

### `dashboard.spec.js` の期待値修正は「確認後対応」に格下げ

既存計画では `dashboard.spec.js` の期待値とセレクタ不一致をCRITICALとしていたが、最新Actionsログで確認できた直接原因はDBスキーマ未作成と `data-route` 重複だった。

`dashboard.spec.js` の期待値不一致はローカル調査上の可能性として残るが、まずDB初期化とセレクタ衝突を直した後、再実行結果で実際に失敗するかを確認してから修正する。

### Chart.js CDN依存はE2E必須修正から除外

既存計画ではChart.jsのnpm化をIMPORTANTとしていたが、今回のActionsログではChart.js CDN失敗がE2E全体failの直接原因である証拠は確認できなかった。

CDN依存の解消は安定化改善としては有効だが、今回のmainマージ時E2E失敗の主因ではないため、優先度を下げる。

---

## 修正計画

### Step 1: CIでDBマイグレーションを実行する

対象: `.github/workflows/ci.yml`

`バックエンドサーバー起動` の前に以下を追加する。

```yaml
- name: データベースマイグレーション実行
  run: npm run db:migrate
  env:
    DATABASE_URL: postgres://app_user:ci_test_password@localhost:5432/transaction_db_test
```

これにより、E2E開始前に `server/db/migrations/*.sql` が適用される。

### Step 2: E2EジョブをPull Requestでも実行する

対象: `.github/workflows/ci.yml`

```diff
- if: github.event_name == 'workflow_dispatch' || github.event_name == 'push'
+ if: github.event_name == 'workflow_dispatch' || github.event_name == 'push' || github.event_name == 'pull_request'
```

これにより、mainへマージする前にE2E失敗を検出できる。

### Step 3: ナビゲーション用セレクタをスコープする

対象: `e2e/*.spec.js`

グローバルな `data-route` 指定を、サイドバーまたはメニュー内に限定する。

例:

```diff
- await page.locator('[data-route="approval"]').click();
+ await page.locator('.sidebar [data-route="approval"]').click();
```

同様に、`invoice`, `receipt`, `sales-order` などのナビゲーション操作も、画面内ボタンとの衝突がないか確認する。

### Step 4: CIを再実行し、残る失敗を分類する

上記修正後にPRでE2Eを再実行し、残った失敗を以下に分類する。

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
4. 残るE2E失敗をログとartifactで分類する

---

## 優先順位

1. CIに `npm run db:migrate` を追加する
2. E2EをPRでも実行する
3. `data-route` セレクタ重複を解消する
4. 再実行ログを見て、残る個別テスト失敗を修正する
5. Chart.js CDN依存などの安定化改善を別途対応する
