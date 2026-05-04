# コード静的レビュー結果

対象: `app.js`, `src/customer.js`, `src/product.js`, `src/validation.js`

実施日: 2026-05-03

## 概要

テスト対象の単体ロジックは概ねテスト内容と整合しているが、画面側の状態管理、権限制御、CSV 出力、商品単価の扱いにリスクがある。

特に `app.js` は画面生成、状態管理、イベント処理、権限判定が 1 ファイルに集約されており、UI 表示制御と実際の操作可否が分離していない箇所がある。

## Findings

### Finding 1: [P1] ログアウト後のフォーム状態で権限を迂回できる

場所: `app.js:1205`

編集フォーム表示が `viewState.*Form.mode` だけで決まり、ログインユーザが `master:edit` を持つかを再確認していない。

admin が登録または編集フォームを開いたままログアウトし、そのまま `sales01` などでログインすると、フォーム状態が残って非編集権限ユーザでも登録・更新 submit ハンドラを実行できる。

対応案:

- ログアウト時またはログイン切替時にフォーム状態をリセットする。
- `masterScreenHtml` でフォーム表示前に `master:edit` を確認する。
- 顧客、仕入先、商品の submit ハンドラ側でも `master:edit` を確認し、権限がなければ処理しない。

### Finding 2: [P2] CSV 出力が出力権限なしで使える

場所: `app.js:893`

`dataTableHtml` は常に CSV 出力ボタンを描画しており、`master:view` だけを持つ `sales01` / `finance01` でもマスタデータをエクスポートできる。

要件では作成、更新、出力を操作単位で制御する前提のため、参照権限だけで CSV 出力できるのは権限制御として弱い。

対応案:

- `master:export` のような出力権限を追加する。
- CSV 出力ボタンの表示条件に出力権限を含める。
- `exportCustomerCsv` / `exportSupplierCsv` / `exportProductCsv` の呼び出し前にも権限を確認する。

### Finding 3: [P2] 商品単価に数値バリデーションがない

場所: `app.js:1774`

商品マスタの単価は標準単価として扱う項目だが、現在のルールは `required` と `maxLength` だけである。

そのため、`abc`、`-100`、`1,000円` のような値も登録できる。一覧では数値化できない場合にそのまま表示され、後続の見積・受注・請求などの金額計算に接続したときに不整合の原因になる。

対応案:

- `validation.js` に数値形式チェックを追加する。
- 0 以上、整数、最大桁数など、単価として許容する形式を定義する。
- 商品フォームの `unitPrice` ルールに数値バリデーションを追加する。
- `src/validation.test.js` と `src/product.test.js` に異常系を追加する。

### Finding 4: [P3] 単価ソートが文字列順になる

場所: `app.js:840`

一覧ソートは全列を `String(...).localeCompare(...)` で比較しているため、商品単価のような数値列でも文字列順になる。

例として、`120000` と `50000` を比較すると、金額順ではなく文字列順の結果になる可能性がある。

対応案:

- 列定義に `sortType: "number"` または `comparator` を持たせる。
- `unitPrice` は数値比較でソートする。
- 文字列列は既存の `localeCompare` を維持する。

## 補足

`src/customer.js`、`src/product.js`、`src/validation.js` の単体ロジックは、現在のテストが想定している範囲では大きな不整合は見つからなかった。

ただし `generateCode()` は prefix を正規表現に直接埋め込んでいるため、将来 prefix が固定値以外になる場合は正規表現エスケープが必要になる。

## テスト実行状況

この環境では以下の理由によりテスト実行は完了できなかった。

- `npm test`: esbuild の子プロセス起動で `spawn EPERM`
- `npm run test:e2e`: `test-results/.last-run.json` の更新で `EPERM`

そのため、本レビューは静的レビューとして実施した。
