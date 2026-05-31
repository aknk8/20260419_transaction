# CI失敗調査メモ 2026-05-30

## 対象

- Workflow: `CI/CD`
- Run ID: `26670923878`
- URL: https://github.com/aknk8/20260419_transaction/actions/runs/26670923878
- Event: `pull_request`
- Branch: `fix/e2e-test-failures`
- Commit: `e9c22be93d08013c6b53acaa7b1dd0d1bdfdec0a`
- 実行開始: 2026-05-30 10:38:56 JST

## 結論

CI失敗の直接原因は、E2Eテスト前のDBシード投入で `products.tax` に文字列 `課税` を投入していることです。

DBスキーマ上の `products.tax` は `NUMERIC(5, 2)` ですが、E2E seedデータでは `tax: '課税'` になっています。そのため、PostgreSQLへの `products` insert時に数値カラムへ非数値文字列が渡され、`DBシードデータ投入` ステップで失敗しています。

今回の失敗はPlaywrightのE2Eテスト本体ではなく、E2E実行前のDB初期化段階で止まっています。

## 失敗箇所

`E2E Tests (Playwright)` ジョブの以下ステップで失敗しています。

```text
DBシードデータ投入
run: node scripts/seed-e2e.js
```

GitHub Actionsログの該当部分:

```text
E2E seed failed: Failed query: insert into "products"
("code", "name", "unit", "unit_price", "tax", "status", "created_at", "updated_at")
values ...
params: PRD-001,サーバー保守サービス,月,50000,課税,有効,...
Process completed with exit code 1.
```

## 関連ファイル

- `.github/workflows/ci.yml`
  - `npm run db:migrate`
  - `node scripts/seed-e2e.js`
  - `npx playwright test`
- `scripts/seed-e2e.js`
  - `resetDb(db)` を呼び出してE2E用データを再投入
- `server/db/resetDb.js`
  - `seedProducts` を `products` テーブルへinsert
- `server/db/seedData.js`
  - `seedProducts` の `tax` が `課税`
- `server/db/schema.js`
  - `products.tax` が `numeric('tax', { precision: 5, scale: 2 })`
- `server/db/migrations/000_initial_schema.sql`
  - `products.tax` が `NUMERIC(5, 2)`

## 原因の詳細

DB定義:

```js
tax: numeric('tax', { precision: 5, scale: 2 }),
```

初期スキーマ:

```sql
tax NUMERIC(5, 2),
```

E2E seed:

```js
{ code: 'PRD-001', name: 'サーバー保守サービス', unit: '月', unitPrice: '50000', tax: '課税', status: '有効' }
```

`products.tax` の意味が、コード内で「税率の数値」と「課税/非課税の表示ラベル」の間で揺れています。サーバー側のテストでは `tax: 10` を使う箇所があり、フロント側の一部テストでは `tax: '課税'` を使っています。

## 影響範囲

- `unit-test` ジョブは成功しています。
- `E2E Tests (Playwright)` はDB seedで失敗しています。
- `Run E2E tests` ステップはスキップされており、現時点のCIログからはPlaywrightテスト自体の成否は判断できません。
- PR向けrunのため、`Deploy to Staging` はスキップされています。

## 修正方針

短期対応としては、DBスキーマに合わせて `server/db/seedData.js` の `seedProducts[].tax` を数値に変更するのが最小です。

例:

```js
tax: '10.00'
```

または:

```js
tax: 10
```

ただし、根本対応としては `products.tax` の意味を以下のどちらかに統一する必要があります。

1. 税率として扱う場合
   - DB: `NUMERIC`
   - seed/API/test: `10` や `10.00`
   - UI表示時に `課税` へ変換する

2. 課税区分として扱う場合
   - DB: `VARCHAR`
   - seed/API/test: `課税`, `非課税` など
   - 税率計算には別カラムまたは別ロジックを使う

現状のDBスキーマとサーバー側テストに合わせるなら、`products.tax` は税率数値として統一するのが自然です。

## 再発防止

- `scripts/seed-e2e.js` のcatchで `err.cause` やPostgreSQLの詳細エラーを出すと、次回以降のCIログで原因を特定しやすくなります。
- seedデータの型検証を追加し、DB投入前に `products.tax` が数値であることをチェックすると、DBエラーより前に分かりやすく失敗できます。
- `seedData.js` に対して、スキーマ期待型と一致するかを確認する軽量テストを追加すると、E2E前処理の破損をunit-testジョブで検出できます。
