# テストケース一覧

本ドキュメントはプロジェクト内の全テストケースを網羅した一覧です。

## 1. ユニットテスト（Vitest）

各テストは Arrange / Act / Assert のAAA構造に従い、1テスト1振る舞いを原則とする。外部APIのみモック可とし、内部モジュールは実コードを使用する。

---

### UNIT-001
**件名**: getPendingApprovals — 見積・発注・支払依頼を横断した承認待ち一覧取得
**テスト意図**: 見積・発注・支払依頼のうちステータスが承認依頼中／承認待ちのものを一つのリストに集約し、各エントリに type・code・amount・submittedAt・submittedBy が正しく設定されることを確認する
**前提条件**: なし（純粋関数、入力データのみで動作）
**テスト内容**:
- 全入力が空配列のとき空配列を返す
- ステータスが承認依頼中の見積のみ返し、下書きは除外する
- 見積エントリの type が '見積'、code・amount・submittedAt・submittedBy が quotation から取得される
- 発注のステータスが承認依頼中のとき返し、下書きは除外する; type は '発注'
- 支払依頼のステータスが承認待ちのとき返し、下書きは除外する; type は '支払依頼'
- 複数エンティティを混在させると承認待ち計3件が返る
- submittedBy がない見積は submittedBy が空文字になる
**ファイル**: `src/approval.test.js`

### UNIT-002
**件名**: getApprovalDetailRoute — 伝票タイプ → 画面名マッピング（基本3種）
**テスト意図**: 承認一覧行の type（見積／発注／支払依頼）から遷移先画面名と code を返すルーティング情報が正しく生成されることを確認する
**前提条件**: なし
**テスト内容**:
- type が '見積' のとき screen は 'quotation'、code が保持される
- type が '発注' のとき screen は 'purchaseOrder'、code が保持される
- type が '支払依頼' のとき screen は 'payment'、code が保持される
- type が未知の値のとき null を返す
**ファイル**: `src/approval.test.js`

### UNIT-003
**件名**: getPendingApprovals with orders — 受注の承認待ち集約
**テスト意図**: 受注（orders）が承認待ちリストに正しく追加されることを確認する
**前提条件**: なし
**テスト内容**:
- 受注のステータスが承認依頼中のとき1件返す; 受注済みは除外する
- type が '受注'、submittedAt が orderDate から取得される
- 見積と受注を混在させると合計2件返す
**ファイル**: `src/approval.test.js`

### UNIT-004
**件名**: getApprovalDetailRoute with 受注 — 受注の画面名マッピング
**テスト意図**: type が '受注' のとき screen が 'order' になり code が保持されることを確認する
**前提条件**: なし
**テスト内容**:
- type が '受注' のとき screen は 'order'
- code が元の値のまま保持される
**ファイル**: `src/approval.test.js`

### UNIT-005
**件名**: getPendingApprovals with invoices — 請求の承認待ち集約
**テスト意図**: 請求（invoices）が承認待ちリストに正しく追加されることを確認する
**前提条件**: なし
**テスト内容**:
- 請求のステータスが承認依頼中のとき1件返す; 下書きは除外する
- type が '請求'、submittedAt が invoiceDate から取得される
- 見積と請求を混在させると合計2件返す
**ファイル**: `src/approval.test.js`

### UNIT-006
**件名**: getApprovalDetailRoute with 請求 — 請求の画面名マッピング
**テスト意図**: type が '請求' のとき screen が 'invoice' になり code が保持されることを確認する
**前提条件**: なし
**テスト内容**:
- type が '請求' のとき screen は 'invoice'
- code が元の値のまま保持される
**ファイル**: `src/approval.test.js`

### UNIT-007
**件名**: buildApprovalHistoryEntry — 承認履歴エントリ生成
**テスト意図**: 承認履歴の1件分（action・operatorName・comment・timestamp）が正しく組み立てられることを確認する
**前提条件**: なし
**テスト内容**:
- action が引数の値になる
- operatorName が引数の値になる
- comment が引数の値になる
- timestamp が引数の値になる
**ファイル**: `src/approval.test.js`

### UNIT-008
**件名**: addApprovalHistoryEntry — 承認履歴への不変追加
**テスト意図**: 元の伝票を変更せずに承認履歴エントリを追加した新しいオブジェクトを返すことを確認する
**前提条件**: なし
**テスト内容**:
- approvalHistory が空の伝票に追加すると length が 1 になる
- 既存エントリがある伝票に追加すると末尾に追加される（length が 2、末尾の action が正しい）
- 元の伝票の approvalHistory は変更されない（不変性）
- approvalHistory フィールドがない伝票でも正常に動作する
**ファイル**: `src/approval.test.js`

---

### UNIT-009
**件名**: validateApprovalConditionSettings — 承認条件設定値のバリデーション
**テスト意図**: 社長決裁条件の設定値（profitRate・amount・staleDays）の入力規則が正しく検証されることを確認する
**前提条件**: なし
**テスト内容**:
- 全値が正常なとき空オブジェクト `{}` を返す
- profitRate が数値でない / 負数 / 100超 のときエラーが返る; 0 および 100 は許容
- profitRate が整数でない（20.5 等）ときエラーが返る
- amount が数値でない / ゼロ / 負数 のときエラーが返る; 正の整数は許容
- staleDays が数値でない / ゼロ / 負数 のときエラーが返る; 1 は許容; 小数はエラー
- 複数フィールドが無効のとき全てのエラーが同時に返る
**ファイル**: `src/approvalCondition.test.js`

### UNIT-010
**件名**: buildApprovalConditionSettings — 承認条件設定オブジェクト生成
**テスト意図**: 3つの閾値パラメータから正しいキー名でオブジェクトが生成されることを確認する
**前提条件**: なし
**テスト内容**:
- presidentApprovalProfitRateThreshold が引数の値になる
- presidentApprovalAmountThreshold が引数の値になる
- approvalStaleDays が引数の値になる
**ファイル**: `src/approvalCondition.test.js`

---

### UNIT-011
**件名**: buildApprovalRoute — 承認ルートエントリ生成
**テスト意図**: documentType・stepNumber・approverUserId の3フィールドを持つルートオブジェクトが正しく生成されることを確認する
**前提条件**: なし
**テスト内容**:
- documentType が引数の値になる
- stepNumber が引数の値になる
- approverUserId が引数の値になる
**ファイル**: `src/approvalRoute.test.js`

### UNIT-012
**件名**: getRoutesByDocumentType — 書類タイプ別ルートフィルタ＋昇順ソート
**テスト意図**: 指定した documentType のルートのみを取得し stepNumber 昇順に返すことを確認する
**前提条件**: なし（pure function）
**テスト内容**:
- 指定 documentType のルートのみが返る
- 返ったルートが stepNumber 昇順に並んでいる
- 一致するルートがないとき空配列を返す
- 元の配列が変更されない（不変性）
**ファイル**: `src/approvalRoute.test.js`

### UNIT-013
**件名**: addRouteStep — 承認ステップの自動採番追加
**テスト意図**: 既存ステップの最大 stepNumber + 1 で新ステップが追加され、他の書類タイプには影響しないことを確認する
**前提条件**: なし
**テスト内容**:
- 既存ステップがないとき stepNumber 1 で追加される
- 既存の最大 stepNumber を超える値でステップが追加される
- 他の documentType のルートには影響しない
- 元の配列が変更されない（不変性）
**ファイル**: `src/approvalRoute.test.js`

### UNIT-014
**件名**: removeRouteStep — 指定ステップの削除
**テスト意図**: 指定した documentType と stepNumber のステップのみが削除され、他のステップには影響しないことを確認する
**前提条件**: なし
**テスト内容**:
- 指定ステップが結果に含まれない
- 同一 documentType の他ステップは残る
- 他の documentType のルートには影響しない
- 元の配列が変更されない（不変性）
**ファイル**: `src/approvalRoute.test.js`

### UNIT-015
**件名**: updateRouteStep — 指定ステップの承認者更新
**テスト意図**: 指定した documentType と stepNumber の approverUserId だけが更新され、他のステップは変更されないことを確認する
**前提条件**: なし
**テスト内容**:
- 指定ステップの approverUserId が更新される
- 他のステップの approverUserId は変更されない
- 元の配列が変更されない（不変性）
- 返り値の配列長が変わらない
**ファイル**: `src/approvalRoute.test.js`

---

### UNIT-016
**件名**: generateCustomerCode — 顧客コード自動採番
**テスト意図**: 既存コードの最大値 + 1 を CUS-xxx 形式で生成し、欠番や不正形式コードを無視することを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき CUS-001 を返す
- 連続する既存コードの次（CUS-004 等）を返す
- ギャップがあるとき最大値の次を返す
- 3桁ゼロパディングが行われる
- 形式が一致しないコードは無視される
**ファイル**: `src/customer.test.js`

### UNIT-017
**件名**: createCustomer — 顧客オブジェクト生成
**テスト意図**: フォームデータの全フィールドがそのまま顧客オブジェクトにコピーされることを確認する
**前提条件**: なし
**テスト内容**:
- 全フィールドが正しく設定される
- オプションフィールド（contact・billingTo）が空文字でも許容される
**ファイル**: `src/customer.test.js`

### UNIT-018
**件名**: findCustomerByCode — コードによる顧客検索
**テスト意図**: 指定コードと一致する顧客を返し、見つからない場合は null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 存在するコードで顧客オブジェクトが返る
- 存在しないコードで null が返る
- 空配列で null が返る
**ファイル**: `src/customer.test.js`

### UNIT-019
**件名**: generateCode — プレフィックス指定の汎用コード採番
**テスト意図**: 任意プレフィックス（SUP, CUS 等）に対して最大値 + 1 を 3桁ゼロパディングで生成し、別プレフィックスのコードを無視することを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき PREFIX-001 を返す
- 連続する既存コードの次を返す
- ギャップがあるとき最大値の次を返す
- CUS プレフィックスでも正常動作する
- 別プレフィックスのコードは無視される
**ファイル**: `src/customer.test.js`

### UNIT-020
**件名**: generateSupplierCode — 仕入先コード自動採番
**テスト意図**: SUP-xxx 形式で最大値 + 1 のコードを返すことを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき SUP-001 を返す
- 連続する既存コードの次を返す
**ファイル**: `src/customer.test.js`

### UNIT-021
**件名**: createSupplier — 仕入先オブジェクト生成
**テスト意図**: フォームデータから仕入先オブジェクトが正しく生成されることを確認する
**前提条件**: なし
**テスト内容**:
- 全フィールドが正しく設定される
- オプションフィールド（contact）が空文字でも許容される
**ファイル**: `src/customer.test.js`

### UNIT-022
**件名**: findSupplierByCode — コードによる仕入先検索
**テスト意図**: 指定コードと一致する仕入先を返し、見つからない場合は null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 存在するコードで仕入先オブジェクトが返る
- 存在しないコードで null が返る
- 空配列で null が返る
**ファイル**: `src/customer.test.js`

### UNIT-023
**件名**: filterCustomersByName — 顧客名・コードによるキーワード絞り込み
**テスト意図**: キーワードが名前またはコードに部分一致（大文字小文字無視）する顧客を返し、空・null・空白のとき全件返すことを確認する
**前提条件**: なし
**テスト内容**:
- キーワードが空文字のとき全件返す
- キーワードが空白のみのとき全件返す
- キーワードが null のとき全件返す
- 部分一致する顧客名をフィルタする
- 複数の顧客名に一致するキーワードで複数件返す
- 顧客コードでも一致する
- 一致しないキーワードで空配列を返す
**ファイル**: `src/customer.test.js`

---

### UNIT-024
**件名**: getDashboardMetrics — ダッシュボード集計指標
**テスト意図**: 見積・発注・支払依頼・受注・請求の5種のデータから pendingApprovals（承認待ち合計）・unbilled（請求未発行）・uncollected（未入金）・unpaid（支払未済）の各カウントが正しく算出されることを確認する
**前提条件**: なし
**テスト内容**:
- 全入力が空のとき全カウントが 0
- 見積・発注・支払依頼それぞれの承認依頼中/承認待ちが pendingApprovals に加算される
- billingTarget=true かつ確定済み請求書がない受注を unbilled としてカウントする（billingTarget=false は除外、確定/送付済み請求書があれば除外、下書き請求書は除外しない）
- ステータスが送付済または一部入金の請求書を uncollected としてカウントする（入金済は除外）
- ステータスが承認済の支払依頼を unpaid としてカウントする（支払済は除外）
**ファイル**: `src/dashboard.test.js`

### UNIT-025
**件名**: getDashboardMetrics pendingApprovalsByType — 書類タイプ別承認待ち内訳
**テスト意図**: pendingApprovalsByType フィールドが 5種類（quotations・purchaseOrders・payments・orders・invoices）ごとに正しくカウントされ、合計が pendingApprovals と一致することを確認する
**前提条件**: なし
**テスト内容**:
- 全入力が空のとき全タイプが 0
- 見積の承認依頼中のみが pendingApprovalsByType.quotations に加算される
- 発注の承認依頼中のみが pendingApprovalsByType.purchaseOrders に加算される
- 支払依頼の承認待ちのみが pendingApprovalsByType.payments に加算される
- 受注の承認依頼中が pendingApprovalsByType.orders に加算される
- 請求の承認依頼中が pendingApprovalsByType.invoices に加算される
- 5タイプ合計が pendingApprovals 総数と一致する
**ファイル**: `src/dashboard.test.js`

---

### UNIT-026
**件名**: generateDeliveryCode — 納品コード自動採番
**テスト意図**: DLV-00001 形式で最大コード + 1 を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき DLV-00001 を返す
- 既存コードの最大値の次を返す（5桁ゼロパディング）
**ファイル**: `src/delivery.test.js`

### UNIT-027
**件名**: createDelivery — 納品レコード生成
**テスト意図**: 引数から全フィールドを正しく設定し、status=検収待ち・details=[] で初期化された納品オブジェクトが生成されることを確認する
**前提条件**: なし
**テスト内容**:
- code・purchaseOrderCode・deliveryDate・notes が引数の値になる
- status が '検収待ち' で初期化される
- details が空配列で初期化される
**ファイル**: `src/delivery.test.js`

### UNIT-028
**件名**: acceptDelivery — 納品検収（合格）
**テスト意図**: 不変操作で status を '検収済' に変更し、元の納品オブジェクトを変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '検収済' になる
- 元の納品オブジェクトの status が変わらない（不変性）
- 他のフィールドが保持される
**ファイル**: `src/delivery.test.js`

### UNIT-029
**件名**: rejectDelivery — 納品検収（不合格）
**テスト意図**: 不変操作で status を '検収NG' に変更し、元の納品オブジェクトを変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '検収NG' になる
- 元の納品オブジェクトの status が変わらない（不変性）
- 他のフィールドが保持される
**ファイル**: `src/delivery.test.js`

### UNIT-030
**件名**: isFullyDelivered — 発注の完納判定
**テスト意図**: 発注明細の全行について検収済納品の合計数量が発注数量以上になったとき true を返し、検収NG は加算対象外とすることを確認する
**前提条件**: なし
**テスト内容**:
- 1件の検収済納品で全行を満たすとき true
- 一部のみ納品済みのとき false
- 納品なしのとき false
- 複数の検収済納品の合計で全行をカバーするとき true
- 明細行なしの発注は true（空集合は完納扱い）
- 他の発注コードの納品は無視される
- 検収NG の数量は加算されないため false
- 検収NG と検収済が混在し、検収済のみで全量をカバーするとき true
**ファイル**: `src/delivery.test.js`

### UNIT-031
**件名**: getAcceptedQuantity — 行番号別の検収済数量合計
**テスト意図**: 指定行番号（lineNo）の検収済（status='検収済'）納品のみを集計し、検収NG・検収待ちは除外されることを確認する
**前提条件**: なし
**テスト内容**:
- 検収済納品のみの数量を返す
- 検収NG は加算されない
- 検収待ちは加算されない
- 該当する lineNo がない場合は 0
- 複数の検収済納品の数量が合計される
**ファイル**: `src/delivery.test.js`

### UNIT-032
**件名**: getRemainingQuantity — 行番号別の発注残数量
**テスト意図**: 発注数量から検収済数量を差し引いた残数量を返し、検収NG の数量は残数扱いとすることを確認する
**前提条件**: なし
**テスト内容**:
- 納品なしのとき発注数量そのものを返す
- 検収済分を差し引いた残数を返す
- 検収NG は残数扱いとなり差し引かれない
- 全量が検収済のとき 0 を返す
**ファイル**: `src/delivery.test.js`

---

### UNIT-033
**件名**: generateInvoiceCode — 請求コード自動採番
**テスト意図**: INV-00001 形式で最大コード + 1 を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき INV-00001 を返す
- 既存コードの最大値の次を返す（5桁ゼロパディング）
**ファイル**: `src/invoice.test.js`

### UNIT-034
**件名**: createInvoice — 請求書の新規生成
**テスト意図**: 引数から全フィールドを正しく設定し、status=下書き・subtotal/taxAmount/total=0・details=[] で初期化された請求書オブジェクトが生成されることを確認する
**前提条件**: なし
**テスト内容**:
- code・orderCode・customerId・title・invoiceDate・dueDate が引数の値になる
- status が '下書き' で初期化される
- subtotal・taxAmount・total がそれぞれ 0 で初期化される
- details が空配列で初期化される
**ファイル**: `src/invoice.test.js`

### UNIT-035
**件名**: findBillableOrders — 請求対象受注の抽出
**テスト意図**: billingTarget=true の受注のうち既に請求書が存在しないものだけを返すことを確認する
**前提条件**: なし
**テスト内容**:
- billingTarget=true の受注を返す（false は除外）
- 既に請求書が存在する受注は除外される
- 請求対象なしのとき空配列を返す
- 全件に請求書がある場合も空配列を返す
**ファイル**: `src/invoice.test.js`

### UNIT-036
**件名**: createInvoiceFromOrder — 受注から請求書を生成
**テスト意図**: 受注の情報を引き継いで請求書が生成され、元の受注を変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- code は引数から、orderCode・customerId・title は受注から取得される
- invoiceDate・dueDate は引数の値になる
- subtotal・taxAmount・total が受注からコピーされる
- 明細行が受注からコピーされる
- status が '下書き' になる
- 元の受注が変更されない（不変性）
**ファイル**: `src/invoice.test.js`

### UNIT-037
**件名**: getDefaultDueDate — 月末日を支払期限として算出
**テスト意図**: 指定日付の月の最終日を返し、うるう年・12月・月末日当日も正しく処理されることを確認する
**前提条件**: なし
**テスト内容**:
- 2026-05-04 → 2026-05-31
- 2026-02-10（非うるう年）→ 2026-02-28
- 2024-02-01（うるう年）→ 2024-02-29
- 2026-12-15 → 2026-12-31
- 2026-04-30（月末当日）→ 2026-04-30
**ファイル**: `src/invoice.test.js`

### UNIT-038
**件名**: confirmInvoice — 請求書確定
**テスト意図**: 不変操作で status を '確定' に変更し、元の請求書を変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '確定' になる
- 他のフィールドが保持される
- 元の請求書が変更されない（不変性）
**ファイル**: `src/invoice.test.js`

### UNIT-039
**件名**: markInvoiceAsSent — 請求書送付済マーク
**テスト意図**: 不変操作で status を '送付済' に変更し、元の請求書を変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '送付済' になる
- 元の請求書が変更されない（不変性）
**ファイル**: `src/invoice.test.js`

### UNIT-040
**件名**: cancelInvoice — 請求書キャンセル
**テスト意図**: 不変操作で status を 'キャンセル' に変更し、元の請求書を変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が 'キャンセル' になる
- 元の請求書が変更されない（不変性）
**ファイル**: `src/invoice.test.js`

### UNIT-041
**件名**: buildInvoicePrintHtml — 請求書印刷 HTML 生成
**テスト意図**: 請求書データから印刷用 HTML 文字列が正しく生成され、会社情報（省略可）も反映されることを確認する
**前提条件**: なし
**テスト内容**:
- 文字列型の HTML が返る
- '請 求 書' タイトル・INV コード・顧客名・請求日・支払期日・合計金額（カンマ区切り）・明細の商品名・備考が含まれる
- 会社情報（company）を渡すと会社名・住所が含まれる
- company が null のとき会社名が含まれない
**ファイル**: `src/invoice.test.js`

### UNIT-042
**件名**: submitInvoiceApproval — 請求書承認申請
**テスト意図**: 不変操作で status を '承認依頼中' に変更することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認依頼中' になる
- 元の請求書が変更されない（不変性）
**ファイル**: `src/invoice.test.js`

### UNIT-043
**件名**: approveInvoice — 請求書承認
**テスト意図**: 不変操作で status を '承認済み' にし、コメントを保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認済み' になる
- approvalComment がコメント引数の値になる
- 元の請求書が変更されない（不変性）
**ファイル**: `src/invoice.test.js`

### UNIT-044
**件名**: rejectInvoice — 請求書却下
**テスト意図**: 不変操作で status を '却下' にし、rejectReason を保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '却下' になる
- rejectReason が引数の値になる
- 元の請求書が変更されない（不変性）
**ファイル**: `src/invoice.test.js`

### UNIT-045
**件名**: returnInvoiceToDraft — 請求書を下書きに戻す
**テスト意図**: 不変操作で却下状態の請求書の status を '下書き' に戻すことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '下書き' になる
- 元の請求書が変更されない（不変性）
**ファイル**: `src/invoice.test.js`

---

### UNIT-046
**件名**: getNotificationsForUser — ユーザー別通知フィルタ
**テスト意図**: 指定ユーザーへの通知のみを返し、他のユーザーへの通知は除外されることを確認する
**前提条件**: なし
**テスト内容**:
- 通知なしのとき空配列を返す
- 指定ユーザーの通知のみ返す
- 他ユーザーの通知は除外される
- 混在する場合は指定ユーザーの通知のみ返る
- 返るエントリに id・type・message・isRead フィールドが含まれる
- 既読・未読が混在しても両方返す
**ファイル**: `src/notification.test.js`

### UNIT-047
**件名**: createApprovalRequestNotifications (N-01) — 承認依頼通知生成
**テスト意図**: 承認者ごとに1件の通知が生成され、type=N-01、isRead=false、メッセージに docType と docCode が含まれることを確認する
**前提条件**: なし
**テスト内容**:
- 承認者なしのとき空配列を返す
- 承認者ごとに1件の通知を生成する
- recipientId が各承認者のユーザー ID になる
- type が 'N-01' になる
- isRead が false になる
- メッセージに docCode と docType が含まれる
**ファイル**: `src/notification.test.js`

### UNIT-048
**件名**: createApprovalCompleteNotification (N-02) — 承認完了通知生成
**テスト意図**: 申請者に対して1件の承認完了通知が生成され、type=N-02、isRead=false、メッセージに docType と docCode が含まれることを確認する
**前提条件**: なし
**テスト内容**:
- recipientId が申請者の userId になる
- type が 'N-02' になる
- isRead が false になる
- メッセージに docCode と docType が含まれる
**ファイル**: `src/notification.test.js`

### UNIT-049
**件名**: createRejectionNotification (N-03) — 却下通知生成
**テスト意図**: 申請者に対して却下通知が生成され、type=N-03、メッセージに却下コメントが含まれることを確認する
**前提条件**: なし
**テスト内容**:
- recipientId が申請者の userId になる
- type が 'N-03' になる
- isRead が false になる
- メッセージに rejectComment が含まれる
- メッセージに docCode と docType が含まれる
**ファイル**: `src/notification.test.js`

### UNIT-050
**件名**: checkOverdueApprovals (N-04) — 承認期限超過通知生成
**テスト意図**: 承認待ちのまま staleDays 以上経過した申請に対して申請者への超過通知が生成されることを確認する
**前提条件**: なし
**テスト内容**:
- 承認待ちなしのとき空配列を返す
- staleDays 以上経過した申請に通知を生成する
- staleDays 未満の申請は通知されない
- type が 'N-04'、recipientId が submittedBy になる
- メッセージに docCode が含まれ、isRead が false になる
- submittedAt がない申請はスキップされる
- 超過・非超過が混在するとき超過のみ通知される
**ファイル**: `src/notification.test.js`

### UNIT-051
**件名**: createInvoiceDueNotifications (N-05) — 請求支払期日当日通知生成
**テスト意図**: dueDate が今日と一致する請求書について作成者への通知が生成されることを確認する
**前提条件**: なし
**テスト内容**:
- 期日が今日でない請求書は通知されない
- 期日が今日の請求書に通知を生成する
- recipientId が invoice.createdBy になる
- type が 'N-05'、isRead が false
- メッセージに invoice.code が含まれる
- 期日が今日の複数請求書に複数通知が生成される
**ファイル**: `src/notification.test.js`

### UNIT-052
**件名**: createDeliveryDueNotifications (N-06) — 発注納期当日通知生成
**テスト意図**: deliveryDate が今日と一致する発注について作成者への通知が生成されることを確認する
**前提条件**: なし
**テスト内容**:
- 納期が今日でない発注は通知されない
- 納期が今日の発注に通知を生成する
- recipientId が purchaseOrder.createdBy になる
- type が 'N-06'、isRead が false
- メッセージに purchaseOrder.code が含まれる
- 納期が今日の複数発注に複数通知が生成される
**ファイル**: `src/notification.test.js`

---

### UNIT-053
**件名**: generateOrderCode — 受注コード自動採番
**テスト意図**: ORD-00001 形式で最大コード + 1 を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき ORD-00001 を返す
- 既存コードの最大値の次を返す（5桁ゼロパディング）
**ファイル**: `src/order.test.js`

### UNIT-054
**件名**: createOrderFromQuotation — 見積から受注を生成
**テスト意図**: 見積の情報を引き継いで受注が生成され、status=受注済み・元の見積を変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- code・quotationCode が正しく設定される
- projectCode・customerId・title が見積からコピーされる
- orderDate が引数の値になる
- subtotal・taxAmount・total が見積からコピーされる
- status が '受注済み' になる
- 明細行が見積からコピーされる
- 元の見積が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-055
**件名**: addAttachment — 受注への添付ファイル追加
**テスト意図**: 不変操作で受注に添付ファイルを追加できることを確認する
**前提条件**: なし
**テスト内容**:
- 空の attachments に追加すると length が 1 になる
- 既存の attachments に追加すると末尾に追加される
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-056
**件名**: removeAttachment — 受注からの添付ファイル削除
**テスト意図**: 不変操作で指定インデックスの添付ファイルを削除できることを確認する
**前提条件**: なし
**テスト内容**:
- 指定インデックスのファイルが削除される
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-057
**件名**: findOrderByCode — コードによる受注検索
**テスト意図**: 指定コードの受注を返し、見つからない場合は undefined を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 存在するコードで受注オブジェクトが返る
- 存在しないコードで undefined が返る
**ファイル**: `src/order.test.js`

### UNIT-058
**件名**: updateOrderStatus — 受注ステータス更新
**テスト意図**: 不変操作で受注ステータスを任意の値に更新できることを確認する
**前提条件**: なし
**テスト内容**:
- ステータスが '完了' に更新される
- ステータスが 'キャンセル' に更新される
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-059
**件名**: markAsBillingTarget — 受注を請求対象としてマーク
**テスト意図**: 不変操作で billingTarget を true にし、status を変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- billingTarget が true になる
- status が変わらない
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-060
**件名**: applyPayment — 受注への入金適用
**テスト意図**: paidAmount を累積加算し、total 以上になったとき status を '完了' に自動遷移させることを確認する
**前提条件**: なし
**テスト内容**:
- paidAmount に入金額が加算される
- paidAmount が total 未満のとき status は変わらない
- paidAmount が total に達したとき status が '完了' になる
- paidAmount が total を超えたときも status が '完了' になる
- 既存の paidAmount に加算される（累積）
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-061
**件名**: validateOrderApprovalSubmit — 受注承認申請の事前バリデーション
**テスト意図**: 添付ファイルありかつ見積合計と受注合計が一致するとき null、そうでないときエラーリストを返すことを確認する
**前提条件**: なし
**テスト内容**:
- 添付ありかつ合計一致のとき null を返す
- 添付が空のときエラーを返す
- 添付が null のときエラーを返す
- リンクされた見積が null のときエラーを返す
- 見積合計と受注合計が異なるときエラーを返す
**ファイル**: `src/order.test.js`

### UNIT-062
**件名**: submitOrderApproval — 受注承認申請
**テスト意図**: 不変操作で status を '承認依頼中' に変更することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認依頼中' になる
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-063
**件名**: approveOrder — 受注承認
**テスト意図**: 不変操作で status を '承認済み' にし、approvalComment を保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認済み' になる
- approvalComment がコメント引数の値になる
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-064
**件名**: rejectOrder — 受注却下
**テスト意図**: 不変操作で status を '却下' にし、rejectReason を保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '却下' になる
- rejectReason が引数の値になる
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-065
**件名**: returnOrderToDraft — 受注を下書きに戻す
**テスト意図**: 不変操作で却下状態の受注の status を '下書き' に戻すことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '下書き' になる
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

### UNIT-066
**件名**: completeContractProcedure — 契約手続き完了
**テスト意図**: 不変操作で status を '契約手続き済' に変更することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '契約手続き済' になる
- 元の受注が変更されない（不変性）
**ファイル**: `src/order.test.js`

---

### UNIT-067
**件名**: generatePaymentCode — 支払依頼コード自動採番
**テスト意図**: PMT-00001 形式で最大コード + 1 を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき PMT-00001 を返す
- 既存コードの最大値の次を返す（5桁ゼロパディング）
**ファイル**: `src/payment.test.js`

### UNIT-068
**件名**: createPaymentRequest — 支払依頼の新規生成
**テスト意図**: 引数から全フィールドを正しく設定し、status=下書き で初期化された支払依頼オブジェクトが生成されることを確認する
**前提条件**: なし
**テスト内容**:
- code・purchaseOrderCode・supplierId・title・paymentDate・amount・notes が引数の値になる
- status が '下書き' になる
**ファイル**: `src/payment.test.js`

### UNIT-069
**件名**: findPayablePurchaseOrders — 支払可能な発注の抽出
**テスト意図**: status=納品済 の発注のうちアクティブな支払依頼が存在しないものを返し、キャンセル済み支払依頼は除外対象としないことを確認する
**前提条件**: なし
**テスト内容**:
- status=納品済で支払依頼なしの発注を返す
- status=下書きの発注は返さない
- 既にアクティブな支払依頼がある発注は返さない
- キャンセル済みの支払依頼がある発注は返す（再申請可）
- 混在するリストから支払可能な発注のみ返す
**ファイル**: `src/payment.test.js`

### UNIT-070
**件名**: submitPaymentApproval — 支払依頼の承認申請
**テスト意図**: 不変操作で status を '承認待ち' に変更することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認待ち' になる
- 元の支払依頼が変更されない（不変性）
**ファイル**: `src/payment.test.js`

### UNIT-071
**件名**: approvePayment — 支払依頼の承認
**テスト意図**: 不変操作で status を '承認済' に変更することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認済' になる
- 元の支払依頼が変更されない（不変性）
**ファイル**: `src/payment.test.js`

### UNIT-072
**件名**: rejectPayment — 支払依頼の却下
**テスト意図**: 不変操作で status を '却下' にし、rejectReason を保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '却下' になる
- rejectReason が引数の値になる
- 元の支払依頼が変更されない（不変性）
**ファイル**: `src/payment.test.js`

### UNIT-073
**件名**: cancelPayment — 支払依頼のキャンセル
**テスト意図**: 不変操作で status を 'キャンセル' に変更することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が 'キャンセル' になる
- 元の支払依頼が変更されない（不変性）
**ファイル**: `src/payment.test.js`

### UNIT-074
**件名**: registerPayment — 支払実施の登録
**テスト意図**: 不変操作で status を '支払済' に変更することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '支払済' になる
- 元の支払依頼が変更されない（不変性）
**ファイル**: `src/payment.test.js`

---

### UNIT-075
**件名**: generateProductCode — 商品コード自動採番
**テスト意図**: PRD-001 形式で最大コード + 1 を返し、不正形式コードを無視することを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき PRD-001 を返す
- 連続する既存コードの次を返す
- ギャップがあるとき最大値の次を返す
- 形式が一致しないコードは無視される
**ファイル**: `src/product.test.js`

### UNIT-076
**件名**: createProduct — 商品オブジェクト生成
**テスト意図**: フォームデータの全フィールドがそのまま商品オブジェクトにコピーされ、unitPrice が文字列で保持されることを確認する
**前提条件**: なし
**テスト内容**:
- 全フィールドが正しく設定される
- unitPrice が文字列型のまま保持される
**ファイル**: `src/product.test.js`

### UNIT-077
**件名**: findProductByCode — コードによる商品検索
**テスト意図**: 指定コードと一致する商品を返し、見つからない場合は null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 存在するコードで商品オブジェクトが返る
- 存在しないコードで null が返る
- 空配列で null が返る
**ファイル**: `src/product.test.js`

---

### UNIT-078
**件名**: generateProjectCode — 案件コード自動採番
**テスト意図**: PJ-00001 形式で最大コード + 1 を返し、5桁ゼロパディングと不正形式の無視を確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき PJ-00001 を返す
- 連続する既存コードの次を返す
- ギャップがあるとき最大値の次を返す
- 5桁ゼロパディングが行われる
- 形式が一致しないコードは無視される
**ファイル**: `src/project.test.js`

### UNIT-079
**件名**: createProject — 案件オブジェクト生成
**テスト意図**: フォームデータから案件オブジェクトが正しく生成され、オプションフィールドが空文字でも許容されることを確認する
**前提条件**: なし
**テスト内容**:
- 全フィールドが正しく設定される
- startDate・dueDate・description が空文字でも許容される
**ファイル**: `src/project.test.js`

### UNIT-080
**件名**: findProjectByCode — コードによる案件検索
**テスト意図**: 指定コードと一致する案件を返し、見つからない場合は null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 存在するコードで案件オブジェクトが返る
- 存在しないコードで null が返る
- 空配列で null が返る
**ファイル**: `src/project.test.js`

### UNIT-081
**件名**: filterProjectsByName — 案件名・コードによるキーワード絞り込み
**テスト意図**: キーワードが名前またはコードに部分一致（大文字小文字無視）する案件を返し、空・null・空白のとき全件返すことを確認する
**前提条件**: なし
**テスト内容**:
- キーワードが空文字・空白・null のとき全件返す
- 名前に一致する案件を返す
- コードに一致する案件を返す
- 複数一致するとき複数件返す
- 一致しないとき空配列を返す
- 大文字小文字を区別しない（pj-00001 等）
**ファイル**: `src/project.test.js`

### UNIT-082
**件名**: filterProjectsByStatus — ステータスによる案件絞り込み
**テスト意図**: 指定ステータスのいずれかに一致する案件を返し、空・null のとき全件返すことを確認する
**前提条件**: なし
**テスト内容**:
- 1件のステータスで一致する案件のみ返す
- 複数のステータスで OR 条件として機能する
- 空配列のとき全件返す
- null のとき全件返す
- 一致しないステータスで空配列を返す
**ファイル**: `src/project.test.js`

---

### UNIT-083
**件名**: generatePurchaseOrderCode — 発注コード自動採番
**テスト意図**: POD-00001 形式で最大コード + 1 を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき POD-00001 を返す
- 既存コードの最大値の次を返す（5桁ゼロパディング）
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-084
**件名**: createPurchaseOrderFromOrder — 受注から発注を生成
**テスト意図**: 受注の情報を引き継いで発注が生成され、status=下書き・attachments=[]・元の受注を変更しないことを確認する
**前提条件**: なし
**テスト内容**:
- code・orderCode・supplierId・title・orderDate が正しく設定される
- status が '下書き' になる
- 明細行が受注からコピーされる
- attachments が空配列で初期化される
- 元の受注が変更されない（不変性）
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-085
**件名**: createPurchaseOrder — 単体発注の新規生成
**テスト意図**: 受注なしのスタンドアロン発注として、orderCode=空文字・status=下書き・attachments=[] で生成されることを確認する
**前提条件**: なし
**テスト内容**:
- code・supplierId・title・orderDate が引数の値になる
- orderCode が空文字になる
- status が '下書き' になる
- attachments が空配列で初期化される
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-086
**件名**: findPurchaseOrderByCode — コードによる発注検索
**テスト意図**: 指定コードの発注を返し、見つからない場合は undefined を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 存在するコードで発注オブジェクトが返る
- 存在しないコードで undefined が返る
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-087
**件名**: updatePurchaseOrderStatus — 発注ステータス更新
**テスト意図**: 不変操作で発注ステータスを任意の値に更新できることを確認する
**前提条件**: なし
**テスト内容**:
- ステータスが新しい値に更新される
- 他のフィールドが保持される
- 元の発注が変更されない（不変性）
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-088
**件名**: calcTotalsFromDetails — 発注明細からの合計算出
**テスト意図**: 数量 × 単価 × (1 - 割引率) の小計・消費税・合計を正しく算出し、空明細は 0 を返すことを確認する
**前提条件**: なし
**テスト内容**:
- subtotal が数量 × 単価の合計になる
- taxAmount が各行の小計 × 税率の合計になる
- total が subtotal + taxAmount になる
- 空明細のとき全て 0 を返す
- 割引率（discount）を考慮して小計を計算する
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-089
**件名**: buildPurchaseOrderPrintHtml — 発注書印刷 HTML 生成と XSS 対策
**テスト意図**: 発注書データから印刷用 HTML が正しく生成され、仕入先名の HTML 特殊文字がエスケープされることを確認する
**前提条件**: なし
**テスト内容**:
- 発注コード・仕入先名・タイトル・発注日・合計金額・明細商品名・備考が含まれる
- 仕入先名に HTML 特殊文字（`<script>` 等）が含まれるとき HTML エスケープされる（`&lt;script&gt;`）
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-090
**件名**: submitPurchaseOrderApproval — 発注書承認申請
**テスト意図**: 不変操作で status を '承認依頼中' に変更することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認依頼中' になる
- 他のフィールドが保持される
- 元の発注が変更されない（不変性）
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-091
**件名**: rejectPurchaseOrder — 発注書却下
**テスト意図**: 不変操作で status を '却下' にし、rejectReason を保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '却下' になる
- rejectReason が引数の値になる
- 元の発注が変更されない（不変性）
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-092
**件名**: returnPurchaseOrderToDraft — 発注書を下書きに戻す
**テスト意図**: 不変操作で却下状態の発注の status を '下書き' に戻すことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '下書き' になる
- 元の発注が変更されない（不変性）
**ファイル**: `src/purchaseOrder.test.js`

### UNIT-093
**件名**: approvePurchaseOrder — 発注書承認
**テスト意図**: 不変操作で status を '承認済・発注待ち' にし、approvalComment を保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認済・発注待ち' になる
- approvalComment がコメント引数の値になる
- 元の発注が変更されない（不変性）
**ファイル**: `src/purchaseOrder.test.js`

---

### UNIT-094
**件名**: generateQuotationCode — 見積コード自動採番
**テスト意図**: QUO-00001 形式で最大コード + 1 を返し、5桁ゼロパディングを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき QUO-00001 を返す
- 既存コードの最大値の次を返す（5桁ゼロパディング）
- 100以上も正しくパディングされる（QUO-00100 等）
**ファイル**: `src/quotation.test.js`

### UNIT-095
**件名**: createQuotation — 見積書の新規生成（合計自動算出）
**テスト意図**: 見積書オブジェクトが正しいフィールドで生成され、明細行から subtotal・taxAmount・total が自動算出され、割引も反映されることを確認する
**前提条件**: なし
**テスト内容**:
- 全ヘッダフィールドが正しく設定される
- status が '下書き' になる（省略時）; 明示した status が使われる
- notes が空文字で初期化される（省略時）
- 明細行から subtotal・taxAmount・total が計算される
- 割引（discount）が考慮されて金額が算出される
**ファイル**: `src/quotation.test.js`

### UNIT-096
**件名**: findQuotationByCode — コードによる見積検索
**テスト意図**: 指定コードの見積を返し、見つからない場合は null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 存在するコードで見積オブジェクトが返る
- 存在しないコードで null が返る
**ファイル**: `src/quotation.test.js`

### UNIT-097
**件名**: addDetailLine — 見積明細行の追加
**テスト意図**: 最大 lineNo + 1 の空白行が不変操作で追加されることを確認する
**前提条件**: なし
**テスト内容**:
- 空の明細に lineNo=1 の空白行が追加される（productCode=''・quantity=1・discount=0）
- 既存の最大 lineNo + 1 の行が追加される
- 元の明細配列が変更されない（不変性）
**ファイル**: `src/quotation.test.js`

### UNIT-098
**件名**: removeDetailLine — 見積明細行の削除
**テスト意図**: 指定 lineNo の行が不変操作で削除され、他の行には影響しないことを確認する
**前提条件**: なし
**テスト内容**:
- 指定 lineNo の行が削除される
- 存在しない lineNo を指定すると配列が変わらない
- 元の明細配列が変更されない（不変性）
**ファイル**: `src/quotation.test.js`

### UNIT-099
**件名**: updateDetailLine — 見積明細行のフィールド更新
**テスト意図**: 指定 lineNo の行の指定フィールドだけが不変操作で更新されることを確認する
**前提条件**: なし
**テスト内容**:
- 指定フィールドが更新される
- 他の行には影響しない
- 元の明細配列が変更されない（不変性）
**ファイル**: `src/quotation.test.js`

### UNIT-100
**件名**: createRevision — 見積の改訂版生成
**テスト意図**: 元の見積から全フィールドをコピーし、version + 1・status='下書き'・新コードの改訂版が不変操作で生成されることを確認する
**前提条件**: なし
**テスト内容**:
- 新コードと version + 1 が設定され、status が '下書き' になる
- ヘッダフィールドが元の見積からコピーされる
- 明細行が元の見積からコピーされる
- 元の見積が変更されない（不変性）
**ファイル**: `src/quotation.test.js`

### UNIT-101
**件名**: rejectQuotation — 見積却下
**テスト意図**: 不変操作で status を '却下' にし、rejectReason を保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '却下' になる
- rejectReason が引数の値になる
- 元の見積が変更されない（不変性）
**ファイル**: `src/quotation.test.js`

### UNIT-102
**件名**: returnQuotationToDraft — 見積を下書きに戻す
**テスト意図**: 不変操作で却下状態の見積の status を '下書き' に戻すことを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '下書き' になる
- 元の見積が変更されない（不変性）
**ファイル**: `src/quotation.test.js`

### UNIT-103
**件名**: buildQuotationPrintHtml — 見積書印刷 HTML 生成
**テスト意図**: 見積書データから印刷用 HTML 文字列が正しく生成されることを確認する
**前提条件**: なし
**テスト内容**:
- タイトル・コード・合計金額（カンマ区切り）・明細商品名・発行日・備考が含まれる
- 顧客情報（customer）を渡すと顧客名が含まれる
**ファイル**: `src/quotation.test.js`

### UNIT-104
**件名**: requiresPresidentApproval — 社長決裁要否判定
**テスト意図**: 利益率が閾値未満または見積金額が閾値超のとき true を返し、合計ゼロ・閾値未設定・閾値ちょうどのエッジケースを正しく処理することを確認する
**前提条件**: なし
**テスト内容**:
- 利益率が閾値未満のとき true（例: 20% < 25%閾値）
- 利益率が閾値ちょうどのとき false（「未満」判定）
- 両条件とも閾値以内のとき false
- 合計金額が閾値超のとき true（例: 2億 > 1億閾値）
- 合計金額が閾値ちょうどのとき false（「超」判定）
- 両条件が発動するとき true
- 粗利がマイナス（赤字）のとき true
- 合計が 0 のとき false（計算不能）
- 閾値が未設定のとき false（安全側）
- 金額閾値のみ設定されているとき金額条件で判定される
- 利益率閾値のみ設定されているとき利益率条件で判定される
**ファイル**: `src/quotation.test.js`

### UNIT-105
**件名**: approveQuotation — 見積承認
**テスト意図**: 不変操作で status を '承認済み' にし、approvalComment を保持することを確認する
**前提条件**: なし
**テスト内容**:
- 返り値の status が '承認済み' になる
- approvalComment がコメント引数の値になる
- 元の見積が変更されない（不変性）
**ファイル**: `src/quotation.test.js`

---

### UNIT-106
**件名**: generateReceiptCode — 入金コード自動採番
**テスト意図**: RCP-00001 形式で最大コード + 1 を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 既存コードなしのとき RCP-00001 を返す
- 既存コードの最大値の次を返す（5桁ゼロパディング）
**ファイル**: `src/receipt.test.js`

### UNIT-107
**件名**: createReceipt — 入金レコード生成
**テスト意図**: 引数から全フィールドを正しく設定した入金オブジェクトが生成されることを確認する
**前提条件**: なし
**テスト内容**:
- code・invoiceCode・receiptDate・amount・fee・notes が引数の値になる
**ファイル**: `src/receipt.test.js`

### UNIT-108
**件名**: calcRemainingBalance — 請求残高の算出
**テスト意図**: 請求金額から対応する入金の合計を差し引いた残高を返し、他の請求書の入金は無視することを確認する
**前提条件**: なし
**テスト内容**:
- 入金なしのとき請求金額をそのまま返す
- 一部入金後の残高を返す
- 全額入金のとき 0 を返す
- 他の請求書の入金は無視される
- 複数入金の合計が差し引かれる
**ファイル**: `src/receipt.test.js`

### UNIT-109
**件名**: isFullyPaid — 完済判定
**テスト意図**: 残高が 0 以下のとき true を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 入金なしのとき false
- 一部入金のとき false
- 全額入金のとき true
- 過払いのとき true
**ファイル**: `src/receipt.test.js`

### UNIT-110
**件名**: calcExcessAmount — 過払い金額の算出
**テスト意図**: 入金合計が請求金額を超過した場合の超過額を返し、不足・ちょうどは 0 を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 入金なしのとき 0
- 一部入金のとき 0
- ちょうど全額入金のとき 0
- 過払いのとき超過額を返す
- 他の請求書の入金は無視される
**ファイル**: `src/receipt.test.js`

### UNIT-111
**件名**: getMatchingStatus — 入金消込ステータスの判定
**テスト意図**: 残高に応じて「未消込」「消込済み」「差額あり」の3種のステータスを返すことを確認する
**前提条件**: なし
**テスト内容**:
- 入金なしのとき '未消込'
- 一部入金のとき '未消込'
- ちょうど全額入金のとき '消込済み'
- 過払いのとき '差額あり'
- 複数入金の合計がちょうど全額のとき '消込済み'
- 複数入金の合計が全額超のとき '差額あり'
**ファイル**: `src/receipt.test.js`

---

### UNIT-112
**件名**: getSalesSummary — 月次売上サマリの集計
**テスト意図**: 確定済み請求書（確定・送付済・入金済・一部入金）を月（YYYY-MM）でグループ化して売上合計を算出し、昇順ソートで返すことを確認する
**前提条件**: なし
**テスト内容**:
- 入力が空のとき空配列を返す
- 確定済み1件の yearMonth と sales が正しい
- 下書き・キャンセルは除外される
- 送付済・入金済・一部入金・確定のいずれも含まれる
- 同月の複数請求書の売上が合算される
- 別々の月は別行になる
- 結果が yearMonth の昇順で返る
**ファイル**: `src/report.test.js`

### UNIT-113
**件名**: getSalesCostReport — 月次売上・コスト・粗利レポートの集計
**テスト意図**: 確定済み請求書（売上）と支払済み支払依頼（コスト）を月ごとに集計し、粗利（売上 - コスト）を算出して昇順ソートで返すことを確認する
**前提条件**: なし
**テスト内容**:
- 入力が両方空のとき空配列を返す
- 確定済み請求書の売上が返る
- 支払済みの支払依頼のコストが返る
- 承認済み支払依頼はコストに含まれない
- 下書き請求書は売上に含まれない
- grossProfit が sales - cost になる
- 同月に該当コストがない場合 cost が 0 になる
- 同月に該当売上がない場合 sales が 0 になる
- 同月の売上とコストがまとめて集計される
- 結果が yearMonth の昇順で返る
**ファイル**: `src/report.test.js`

### UNIT-114
**件名**: getUncollectedInvoices — 未回収請求書の抽出
**テスト意図**: ステータスが「送付済」または「一部入金」の請求書のみを返すことを確認する
**前提条件**: なし
**テスト内容**:
- 入力が空のとき空配列を返す
- 送付済の請求書を返す
- 一部入金の請求書を返す
- 入金済は除外される
- 下書きは除外される
- 元の請求書オブジェクト参照がそのまま返る
**ファイル**: `src/report.test.js`

### UNIT-115
**件名**: getUnpaidPayments — 未払い支払依頼の抽出
**テスト意図**: ステータスが「承認済」の支払依頼のみを返すことを確認する
**前提条件**: なし
**テスト内容**:
- 入力が空のとき空配列を返す
- 承認済の支払依頼を返す
- 支払済は除外される
- 承認待ちは除外される
- 元の支払依頼オブジェクト参照がそのまま返る
**ファイル**: `src/report.test.js`

### UNIT-116
**件名**: filterReportByYear — 年度フィルタ
**テスト意図**: 指定年に一致する yearMonth の行のみを返し、'all' または空文字のとき全行を返すことを確認する
**前提条件**: なし
**テスト内容**:
- year が 'all' のとき全行を返す
- year が空文字のとき全行を返す
- 指定年に一致する行のみ返す
- 一致なしのとき空配列を返す
- 入力が空のとき空配列を返す
**ファイル**: `src/report.test.js`

### UNIT-117
**件名**: getReportTotals — レポート集計合計の算出
**テスト意図**: 複数行の sales・cost・grossProfit を合算し、負の値も正しく加算されることを確認する
**前提条件**: なし
**テスト内容**:
- 入力が空のとき全て 0
- 1行からの sales・cost・grossProfit がそのまま返る
- 複数行の sales が合算される
- 複数行の cost が合算される
- 負の grossProfit を含む合計が正しく計算される
**ファイル**: `src/report.test.js`

### UNIT-118
**件名**: getSalesCostByCustomer — 顧客別売上・コスト・粗利の集計
**テスト意図**: 顧客 ID ごとに確定済み請求書の売上と支払済み支払依頼のコストを集計し、粗利を算出して sales 降順で返すことを確認する
**前提条件**: なし
**テスト内容**:
- 確定済み請求書なしのとき空配列を返す
- 確定済み請求書を customerId でグループ化する
- 同一顧客の売上が合算される（下書き除外）
- 発注→受注→顧客のリレーションを辿りコストを集計する（支払済みのみ）
- 承認済み支払依頼はコストに含まれない
- grossProfit が sales - cost になる
- 結果が sales 降順で返る
**ファイル**: `src/report.test.js`

### UNIT-119
**件名**: getSalesCostByProject — 顧客内プロジェクト別売上・コスト・粗利の集計
**テスト意図**: 指定顧客 ID の確定済み請求書をプロジェクトコードでグループ化し、売上・コスト・粗利を算出して sales 降順で返すことを確認する
**前提条件**: なし
**テスト内容**:
- 指定顧客に確定済み請求書がないとき空配列を返す
- 指定顧客の確定済み請求書を projectCode でグループ化する
- 指定プロジェクトの売上が合算される
- 他顧客の請求書は除外される
- 発注→受注→プロジェクトのリレーションを辿りコストを集計する（支払済みのみ）
- 他顧客のコストは含まれない
- grossProfit が sales - cost になる
- 結果が sales 降順で返る
**ファイル**: `src/report.test.js`

---

### UNIT-120
**件名**: getFiscalYear — 月から会計年度への変換
**テスト意図**: fiscalEndMonth（決算月）を基に yearMonth（YYYY-MM）がどの会計年度に属するかを正しく判定することを確認する
**前提条件**: なし
**テスト内容**:
- 12月決算（暦年）のとき yearMonth の年をそのまま返す
- 8月決算のとき fiscalEndMonth 以内の月は同年度（例: 2026-03 → 2026）
- 8月決算のとき fiscalEndMonth と等しい月は同年度（2026-08 → 2026）
- 8月決算のとき fiscalEndMonth を超えた月は翌年度（2026-09 → 2027）
- 3月決算のとき fiscalEndMonth を超えた月は翌年度（2026-04 → 2027）
**ファイル**: `src/settings.test.js`

### UNIT-121
**件名**: filterReportByFiscalYear — 会計年度フィルタ
**テスト意図**: 指定会計年度に属する yearMonth 行のみを返し、'all' または空文字のとき全行を返すことを確認する
**前提条件**: なし
**テスト内容**:
- fiscalYear が 'all' のとき全行を返す
- fiscalYear が空文字のとき全行を返す
- 8月決算で FY2026（2025-09〜2026-08）に属する行を返す
- 一致なしのとき空配列を返す
- 12月決算（暦年）でも正しく動作する
**ファイル**: `src/settings.test.js`

### UNIT-122
**件名**: getAvailableFiscalYears — 利用可能な会計年度一覧の取得
**テスト意図**: データ内の yearMonth から会計年度を計算し、重複を除いた昇順リストを返すことを確認する
**前提条件**: なし
**テスト内容**:
- 入力が空のとき空配列を返す
- 重複を除いた会計年度が昇順で返る（例: 2026・2027）
- 同一会計年度の複数行は1エントリになる
**ファイル**: `src/settings.test.js`

---

### UNIT-123
**件名**: showSpinner / hideSpinner — スピナー参照カウント制御
**テスト意図**: showSpinner・hideSpinner が参照カウント方式で動作し、呼び出し回数が一致するまでオーバーレイが表示され続けることを確認する
**前提条件**: happy-dom 環境; `initFeedbackUI()` で DOM を初期化済み
**テスト内容**:
- showSpinner 呼び出し後、loading-overlay の hidden 属性がなくなる
- showSpinner を2回呼び後 hideSpinner を1回呼んでも引き続き表示される
- showSpinner 2回・hideSpinner 2回で hidden になる
- hideSpinner をカウント 0 以下で呼んでもエラーにならない（hidden のまま）
**ファイル**: `src/ui-feedback.test.js`

### UNIT-124
**件名**: showToast — トースト通知の表示・スタック・自動削除
**テスト意図**: トースト通知がコンテナに追加され、タイプに応じた CSS クラスが付与され、指定時間後に自動削除されることを確認する
**前提条件**: happy-dom 環境; `initFeedbackUI()` で DOM を初期化済み
**テスト内容**:
- 呼び出し後、toast-container に1件の子要素が追加される
- 子要素のテキストが渡したメッセージになる
- type='success' のとき toast--success クラスが付く
- type='error' のとき toast--error クラスが付く
- type 省略のとき toast--info クラスが付く
- 指定 duration 経過後にコンテナから削除される（vi.useFakeTimers）
- 複数回呼び出すとスタックされる（children.length = 2 等）
**ファイル**: `src/ui-feedback.test.js`

### UNIT-125
**件名**: apiFetchWithFeedback — API 呼び出し中のスピナー・ボタン制御・トースト表示
**テスト意図**: apiFetch 実行中にスピナー表示・ボタン無効化が行われ、成功・失敗それぞれで適切なトーストが表示され、失敗時はエラーが再スローされることを確認する
**前提条件**: happy-dom 環境; `initFeedbackUI()` で DOM を初期化済み; apiFetch はモック関数
**テスト内容**:
- 成功時に解決値をそのまま返す
- apiFetch 実行中にスピナーが表示される
- apiFetch 解決後にスピナーが非表示になる
- apiFetch 失敗後にスピナーが非表示になる
- successMsg 指定時に成功トーストが表示される; 省略時は表示されない
- 失敗時にエラーメッセージのトーストが表示される; エラーメッセージが空のときフォールバックメッセージ
- 失敗時にエラーが再スローされる
- button オプション指定時、実行中はボタンが disabled になる; 成功後・失敗後は有効に戻る
- button オプションなしでも正常動作する
**ファイル**: `src/ui-feedback.test.js`

---

### UNIT-126
**件名**: createUser — ユーザーオブジェクト生成とロール別権限設定
**テスト意図**: フォームデータからユーザーが生成され、ユーザータイプに応じた権限セットが付与されることを確認する
**前提条件**: なし
**テスト内容**:
- 全フィールドが正しく設定される（id・password・name・userType・department・position・status）
- status が省略されたとき '有効' をデフォルト値とする
- userType が 'システム管理者' のとき permissions に 'master:edit' と 'user-permission:edit' が含まれる
- userType が '一般ユーザ' のとき permissions に 'dashboard:view'・'master:view' が含まれ、'user-permission:edit'・'master:edit' は含まれない
- permissions が配列であり1件以上の要素を持つ
**ファイル**: `src/user.test.js`

### UNIT-127
**件名**: findUserById — ID によるユーザー検索
**テスト意図**: 指定 ID のユーザーを返し、見つからない場合は null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 存在する ID でユーザーオブジェクトが返る
- 存在しない ID で null が返る
- 空配列で null が返る
**ファイル**: `src/user.test.js`

---

### UNIT-128
**件名**: validateRequired — 必須バリデーション
**テスト意図**: 空文字・空白・null のときフィールド名を含むエラーメッセージを返し、有効な文字列のとき null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 空文字のとき 'フィールド名は必須です。' を返す
- 空白のみのとき同エラーを返す
- null のとき同エラーを返す
- 非空文字のとき null を返す
- 非空白文字だけを含む値のとき null を返す
**ファイル**: `src/validation.test.js`

### UNIT-129
**件名**: validateMaxLength — 最大文字数バリデーション
**テスト意図**: 値の文字数が max を超えたときフィールド名と max を含むエラーメッセージを返し、max 以下のとき null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- max+1 文字のとき 'フィールド名はmax文字以内で入力してください。' を返す
- max 文字のとき null を返す
- max より短い文字のとき null を返す
- 空文字のとき null を返す
**ファイル**: `src/validation.test.js`

### UNIT-130
**件名**: validateUnique — 一意性バリデーション
**テスト意図**: 値が既存値リストに存在するときエラーメッセージを返し、存在しないとき null を返すことを確認する
**前提条件**: なし
**テスト内容**:
- 既存値リストに含まれるときエラーを返す
- 含まれないとき null を返す
- 既存値リストが空のとき null を返す
**ファイル**: `src/validation.test.js`

### UNIT-131
**件名**: validateForm — フォーム全体のバリデーション実行
**テスト意図**: 各フィールドに対してルールを適用し、フィールドごとに最初のエラーのみを返し、全フィールドを同時に検証することを確認する
**前提条件**: なし
**テスト内容**:
- 必須エラーのあるフィールドにエラーメッセージが返る
- 有効なフィールドに null が返る
- 複数ルールがあるとき最初のエラーで停止する（以降のルールは評価しない）
- 複数フィールドのエラーが同時に返る
- unique ルールも正しく動作する
- 全フィールドが有効のとき全て null が返る
**ファイル**: `src/validation.test.js`

