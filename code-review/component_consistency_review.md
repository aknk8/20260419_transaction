# 部品間整合性 静的レビュー結果

対象: `app.js`, `src/*.js`, `src/*.test.js`, `e2e/*.spec.js`

実施日: 2026-05-04

## 概要

画面側の `app.js` とドメイン部品 `src/*.js` の間で、金額計算、ステータス遷移、画面導線の整合性を中心に静的レビューした。

主なリスクは、見積・受注・発注間で明細の `discount` と `taxRate` の意味が揃っていない点、納品登録と検収ステータスの扱いがずれている点、請求部品が画面に接続されていない点である。

## Findings

### Finding 1: [P1] 見積・受注から発注へ渡した明細の値引計算が破綻する

場所:

- `src/purchaseOrder.js:33`
- `app.js:2309`
- `app.js:2522`

見積側の金額計算は `unitPrice * quantity - discount` で、`discount` を金額として扱っている。一方、発注側の `calcTotalsFromDetails()` と発注画面の明細表示は `(1 - discount)` を掛けており、`discount` を割合として扱っている。

`app.js` の初期見積データには `discount: 10000` の明細があり、見積から受注、受注から発注へ明細をコピーする設計になっている。この明細を発注に含めると、発注側では `1 - 10000` を掛けるため、小計と税額が大きな負数になる。

これは `quotation.js`、`order.js`、`purchaseOrder.js` の明細スキーマが同じに見えるにもかかわらず、部品ごとに意味が違っていることが原因である。

対応案:

- `discount` は金額値引に統一し、発注側も `unitPrice * quantity - discount` で計算する。
- 割合値引が必要なら `discountAmount` と `discountRate` を別フィールドに分ける。
- `calcTotalsFromDetails()` と `purchaseOrderDetailHtml()` の明細計算を同じ共通関数に寄せる。
- 見積明細を発注にコピーしたケースで `discount: 10000` を含む単体テストを追加する。

### Finding 2: [P1] 検収前または検収NGの納品が発注の納品完了判定に含まれる

場所:

- `src/delivery.js:33`
- `app.js:4426`
- `app.js:4430`
- `app.js:4457`
- `app.js:4468`

納品登録時、`createDelivery()` はステータス `検収待ち` の納品を作る。その直後に `isFullyDelivered()` が全納品を数量集計し、発注ステータスを `納品済` または `一部納品` に更新している。

しかし `isFullyDelivered()` は納品ステータスを見ていないため、`検収待ち` の時点で発注が `納品済` になり得る。さらに、後から納品を `検収NG` にしても発注側のステータスは再計算されない。

納品登録、検収、発注ステータス更新の責務が分離されているように見えるが、実際には登録時点の数量だけで発注完了扱いになっており、検収結果と整合していない。

対応案:

- `isFullyDelivered()` は `検収済` の納品だけを集計する。
- `acceptDelivery()` / `rejectDelivery()` 後に対象発注のステータスを再計算する。
- `検収待ち` の数量を発注ステータスに反映する場合は、`納品登録済` と `検収済` を別ステータスとして扱う。
- 検収NG後に発注が `発注済` または `一部納品` に戻るケースを E2E / 単体テストに追加する。

### Finding 3: [P2] 発注初期データの明細表示と発注書出力で金額が一致しない

場所:

- `app.js:598`
- `app.js:2309`
- `src/purchaseOrder.js:71`

初期データの `purchaseOrders` には、明細に `amount` は入っているが `taxRate` が入っていない。発注詳細画面では `taxRate || 0` で明細金額を再計算するため、税抜金額が表示される。一方、発注書出力 `buildPurchaseOrderPrintHtml()` は `d.amount` をそのまま表示する。

そのため、同じ発注明細でも画面詳細では税抜、印刷では税込のように見える。発注合計は税込合計になっているため、詳細画面の明細合計とヘッダ合計も一致しない。

対応案:

- 発注明細の標準スキーマに `taxRate`, `discount`, `amount` の意味を明記し、初期データにも必ず入れる。
- 詳細画面と帳票出力で同じ金額算出関数を使う。
- `amount` を税込行合計として保持するなら、画面側も `amount` を表示する。

### Finding 4: [P2] 請求ドメイン部品が画面・業務フローに接続されていない

場所:

- `src/invoice.js:1`
- `src/invoice.js:11`
- `app.js:131`

`src/invoice.js` と `src/invoice.test.js` は存在するが、`app.js` では `generateInvoiceCode` / `createInvoice` が import されておらず、請求画面は `screens` 上のプレースホルダに留まっている。

一方、受注側には `markAsBillingTarget()` があり、受注を請求対象にする操作はできる。この操作から請求データを作成する部品に接続されていないため、受注から請求への業務フローが途中で切れている。

対応案:

- `invoice` 配列、請求一覧、請求登録または請求作成処理を `app.js` に接続する。
- `markAsBillingTarget()` の結果から `createInvoice()` を呼ぶ導線を設計する。
- 請求対象化済み受注が請求作成候補に出ること、請求作成後に二重作成されないことをテストする。

### Finding 5: [P3] `find*ByCode` 系の戻り値が部品ごとに揃っていない

場所:

- `src/customer.js:19`
- `src/project.js:14`
- `src/quotation.js:35`
- `src/order.js:38`
- `src/purchaseOrder.js:40`

`findCustomerByCode()`、`findProjectByCode()`、`findQuotationByCode()` は見つからない場合に `null` を返す。一方、`findOrderByCode()` と `findPurchaseOrderByCode()` は `undefined` を返す。

現在の `app.js` では `if (!order)` のように truthy 判定しているため大きな実害は出にくいが、テストや将来の呼び出し側では戻り値の扱いが揃っていないと分岐漏れの原因になる。

対応案:

- `find*ByCode()` は見つからない場合 `null` に統一する。
- 既存テストの `toBeUndefined()` を `toBeNull()` に更新する。
- 型や JSDoc を導入する場合は、戻り値の nullability を明示する。

## テストカバレッジ上のギャップ

現行テストは各部品単体の正常系をよく確認しているが、部品間でデータを渡した時の整合性が薄い。

追加したいテスト:

- 見積明細 `discount: 10000` を受注、発注へ渡した時に金額が正しく維持されること。
- 発注明細の `amount`, `taxRate`, `discount` が詳細画面と帳票出力で同じ金額になること。
- `検収待ち` / `検収NG` の納品が発注の `納品済` 判定に含まれないこと。
- 受注の請求対象化から請求作成までの導線が存在すること。

## 実行状況

今回は依頼内容に合わせて静的レビューとして実施した。テストコマンドは実行していない。
