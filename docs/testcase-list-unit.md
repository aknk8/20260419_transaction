# ユニットテスト一覧

フロントエンド（src/）およびバックエンド（server/）のユニットテストケースをまとめた一覧です。フロントエンドテストはビジネスロジックのドメインごとに分類し、バックエンドテストはテスト種別（RT/ST/PT/IT/ReT）ごとに整理しています。

## 1. フロントエンドユニットテスト（src/）

Vitestを使用したフロントエンドの純粋関数・ビジネスロジックのユニットテストです。

### 1.1 承認ワークフロー（UNIT-001〜015）

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

### 1.2 マスタデータ（UNIT-016〜023, 075〜082）

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

### 1.3 ダッシュボード（UNIT-024〜025）

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

### 1.4 伝票ドメイン

#### 1.4.1 見積（UNIT-094〜105）

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

#### 1.4.2 受注（UNIT-053〜066）

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

#### 1.4.3 発注（UNIT-083〜093）

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

#### 1.4.4 請求（UNIT-033〜045）

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

#### 1.4.5 入金（UNIT-106〜111）

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

#### 1.4.6 支払依頼（UNIT-067〜074）

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

#### 1.4.7 納品（UNIT-026〜032）

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

### 1.5 通知（UNIT-046〜052）

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

### 1.6 レポート・集計（UNIT-112〜119）

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

### 1.7 設定・会計年度（UNIT-120〜122）

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

### 1.8 UIユーティリティ（UNIT-123〜125）

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

### 1.9 ユーザー・バリデーション（UNIT-126〜131）

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

## 2. バックエンドユニットテスト（server/）

Vitestを使用したバックエンドのユニットテストです。Fastify `app.inject()` によるHTTPルートテスト、サービス層・リポジトリ層の単体テスト、プラグインおよびインフラコンポーネントのテストを含みます。

### 2.1 ルートテスト（RT）

Fastify `app.inject()` を使用したHTTPエンドポイントのルートレベルテストです。

#### 2.1.1 認証・セッション管理（RT-001〜021）

### RT-001

件名：POST /api/auth/login — 正しい認証情報でログインに成功する

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：有効なユーザー名とパスワードを持つユーザーが認証に成功した際に HTTP 200 が返ることを保証します。ログイン機能の基本的な正常系動作を確認します。

実行するための前提：ユーザーサービスが有効なユーザーオブジェクトを返すようモック設定されており、セッションリポジトリの save メソッドもモック済みです。

テスト内容：POST /api/auth/login に有効な username と password を送信し、レスポンスのステータスコードが 200 であることを確認します。

---

### RT-002

件名：POST /api/auth/login — レスポンスに HttpOnly クッキーが設定される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログイン成功時に JWT トークンが HttpOnly クッキーとして発行されることを確認します。JavaScript からクッキーへの直接アクセスを禁止し、XSS によるトークン窃取を防ぐためのセキュリティ要件です。

実行するための前提：RT-001 と同様のモック設定です。

テスト内容：ログイン成功後の Set-Cookie ヘッダーに HttpOnly 属性が含まれることを検証します。

---

### RT-003

件名：POST /api/auth/login — クッキーに SameSite=Strict が設定される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：発行されるクッキーの SameSite 属性が Strict であることを確認します。クロスサイトリクエストへのクッキー送信を防止し CSRF 攻撃を軽減します。

実行するための前提：RT-001 と同様のモック設定です。

テスト内容：Set-Cookie ヘッダーに SameSite=Strict が含まれることを検証します。

---

### RT-004

件名：POST /api/auth/login — レスポンスにユーザー情報が含まれ passwordHash は含まれない

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログイン成功時のレスポンスボディに id・name・userType が含まれる一方、passwordHash が含まれないことを確認します。機密情報のクライアントへの漏洩を防ぐための検証です。

実行するための前提：RT-001 と同様のモック設定です。

テスト内容：res.json() の内容に id・name・userType が存在し、passwordHash フィールドが存在しないことを検証します。

---

### RT-005

件名：POST /api/auth/login — 誤ったパスワードで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：存在するユーザーに対して誤ったパスワードを送信したとき HTTP 401 が返ることを確認します。基本的な認証失敗の挙動を保証します。

実行するための前提：ユーザーサービスが認証失敗エラーをスローするようモック設定されています。

テスト内容：不正なパスワードで POST し、ステータスコードが 401 であることを検証します。

---

### RT-006

件名：POST /api/auth/login — 存在しないユーザー名で 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：存在しないユーザー名でのログイン試行が 401 で拒否されることを確認します。ユーザーの存在有無を攻撃者に教えないよう、パスワード誤りと同じエラー形式を返すことも確認します。

実行するための前提：ユーザーサービスが not found 相当のエラーをスローするよう設定されています。

テスト内容：存在しない username で POST し、ステータスコードが 401 であることを検証します。

---

### RT-007

件名：POST /api/auth/login — 5 回連続失敗後にアカウントがロックされる

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ブルートフォース攻撃対策として、ログイン失敗が 5 回連続した場合にアカウントロック状態となりアクセスが拒否されることを確認します。

実行するための前提：ユーザーサービスがアカウントロック状態を示すエラーを返すよう設定されています。

テスト内容：5 回の失敗後のリクエストに対してアクセスが拒否（403 または 401）されることを検証します。

---

### RT-008

件名：POST /api/auth/login — 短時間内の連続リクエストでレートリミット 429 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログインエンドポイントへの集中アクセスに対してレートリミットが機能し HTTP 429 を返すことを確認します。DDoS・ブルートフォース攻撃の軽減が目的です。

実行するための前提：fastify-rate-limit プラグインが設定済みです。

テスト内容：許容回数（5 回）を超えたリクエストに対してステータスコード 429 が返ることを検証します。

---

### RT-009

件名：POST /api/auth/login — ログイン成功時にセッションが保存される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログイン成功時にサーバー側でセッション（jti）が永続化され、以降のリクエスト検証に使用できる状態になることを確認します。

実行するための前提：セッションリポジトリのモックが設定済みです。

テスト内容：セッションリポジトリの save メソッドが呼ばれることを検証します。

---

### RT-010

件名：POST /api/auth/logout — 認証済みトークンでログアウトに成功する

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：有効な JWT クッキーを持つリクエストがログアウトに成功し HTTP 200 が返ることを確認します。

実行するための前提：有効な JWT クッキーが設定されたリクエストが用意されています。

テスト内容：POST /api/auth/logout でステータスコード 200 が返ることを検証します。

---

### RT-011

件名：POST /api/auth/logout — ログアウト時にセッション（jti）が失効される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログアウト時にサーバー側でセッション jti がリボークされ、同じトークンでの再アクセスが不可能になることを確認します。ログアウト後のトークン再利用を防止します。

実行するための前提：セッションリポジトリの revoke メソッドがモック済みです。

テスト内容：セッションリポジトリの revoke メソッドが呼ばれることを検証します。

---

### RT-012

件名：POST /api/auth/logout — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：クッキーなしのログアウトリクエストが 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-013

件名：GET /api/auth/me — 認証済みトークンでユーザー情報が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：有効な JWT クッキーを持つリクエストが現在のログインユーザー情報を取得できることを確認します。

実行するための前提：有効なトークンがクッキーに設定されており、セッションが有効な状態です。

テスト内容：ステータスコード 200 と id・name・userType を含むレスポンスを検証します。

---

### RT-014

件名：GET /api/auth/me — セッションが有効なときに 200 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：JWT の有効期限確認に加えて、サーバー側セッション（jti）が失効していないことを確認してから 200 を返す二重チェックを検証します。

実行するための前提：セッションリポジトリがリボーク済みではないセッションを返します。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-015

件名：GET /api/auth/me — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：クッキーなしの /me アクセスが 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-016

件名：GET /api/auth/me — リボーク済みセッションのトークンで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：JWT が有効期限内であってもサーバー側でセッションがリボーク済みの場合に 401 が返ることを確認します。ログアウト後にキャプチャしたトークンの再利用を防止します。

実行するための前提：セッションリポジトリがリボーク済みセッションを返すようモック設定されています。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-017

件名：POST /api/auth/refresh-token — 有効なリフレッシュトークンで新しいアクセストークンが発行される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：有効なリフレッシュトークンを送信したとき新しいアクセストークン（JWT クッキー）が発行されることを確認します。セッション継続の仕組みを検証します。

実行するための前提：リフレッシュトークンサービスが新しいトークンペアを返すようモック設定されています。

テスト内容：ステータスコード 200 と新しいクッキーの設定を検証します。

---

### RT-018

件名：POST /api/auth/refresh-token — リフレッシュトークンがローテーションされる

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：リフレッシュ操作ごとに新しいリフレッシュトークンが発行され古いトークンが無効化されるローテーション動作を確認します。トークンの使い回しを防止します。

実行するための前提：RT-017 と同様のモック設定です。

テスト内容：古いリフレッシュトークンがリボークされ新しいトークンが保存されることを検証します。

---

### RT-019

件名：POST /api/auth/refresh-token — リボーク済みのトークン使用でトークン窃盗を検知し全セッションを失効させる

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：すでにリボーク済みのリフレッシュトークンが再利用された場合（トークン窃盗の検知）、そのユーザーの全セッションを強制リボークしエラーを返すことを確認します。リプレイアタックへの対策です。

実行するための前提：リフレッシュトークンリポジトリがリボーク済みのレコードを返すよう設定されています。

テスト内容：全セッションリボーク処理（revokeAllForUser）の呼び出しとエラーレスポンスを検証します。

---

### RT-020

件名：POST /api/auth/refresh-token — 有効期限切れのトークンで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：期限切れのリフレッシュトークンが 401 で拒否されることを確認します。

実行するための前提：リフレッシュトークンサービスが期限切れエラーをスローするよう設定されています。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-021

件名：POST /api/auth/refresh-token — 存在しないトークンで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：DB に存在しないリフレッシュトークンが 401 で拒否されることを確認します。

実行するための前提：リフレッシュトークンサービスが not found エラーをスローするよう設定されています。

テスト内容：ステータスコード 401 が返ることを検証します。

---

#### 2.1.2 ヘルスチェック（RT-022〜025）

### RT-022

件名：GET /api/health — DB が設定されていない状態で 200 が返る

分類：ルートテスト（server/routes/health.test.js）

テスト意図：DB 接続が未設定の環境（開発初期など）でもヘルスチェックエンドポイントが 200 を返すことを確認します。DB なしでもサーバー起動確認が可能なことを保証します。

実行するための前提：DB 接続が設定されていない状態でアプリが構築されています。

テスト内容：GET /api/health のステータスコードが 200 であることを検証します。

---

### RT-023

件名：GET /api/health — レスポンスのタイムスタンプが ISO 8601 形式である

分類：ルートテスト（server/routes/health.test.js）

テスト意図：ヘルスチェックレスポンスに含まれるタイムスタンプが ISO 8601 形式であることを確認します。監視ツールとの互換性を担保します。

実行するための前提：DB が未設定の状態でアプリが起動しています。

テスト内容：レスポンスの timestamp フィールドが ISO 8601 フォーマットに適合することを検証します。

---

### RT-024

件名：GET /api/health — DB チェック成功時に 200 が返る

分類：ルートテスト（server/routes/health.test.js）

テスト意図：DB 接続が正常な場合にヘルスチェックが 200 を返すことを確認します。DB 込みの正常稼働状態を検証します。

実行するための前提：DB チェック関数が成功を返すようモック設定されています。

テスト内容：GET /api/health のステータスコードが 200 であることを検証します。

---

### RT-025

件名：GET /api/health — DB チェック失敗時に 503 が返る

分類：ルートテスト（server/routes/health.test.js）

テスト意図：DB 接続障害が発生した場合にヘルスチェックが 503 を返すことを確認します。監視システムが障害を検知できることを保証します。

実行するための前提：DB チェック関数が例外をスローするようモック設定されています。

テスト内容：GET /api/health のステータスコードが 503 であることを検証します。

---

#### 2.1.3 ユーザー管理（RT-026〜036）

### RT-026

件名：GET /api/users — 認証済みユーザーにユーザー一覧 200 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：user-permission:edit 権限を持つ認証済みユーザーがユーザー一覧を取得できることを確認します。

実行するための前提：user-permission:edit 権限を含む JWT トークンが設定されており、ユーザーサービスがモックリストを返します。

テスト内容：ステータスコード 200 とユーザーリストを含むレスポンスを検証します。

---

### RT-027

件名：GET /api/users — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：認証なしのユーザー一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-028

件名：GET /api/users — user-permission:edit 権限がない場合に 403 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：認証済みであっても user-permission:edit 権限を持たないユーザーがアクセスした場合に 403 が返ることを確認します。エンドポイントの認可制御を検証します。

実行するための前提：user-permission:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

---

### RT-029

件名：GET /api/users — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/users.test.js）

テスト意図：ユーザー一覧エンドポイントがページネーション対応のレスポンス形式（data 配列と meta オブジェクト）を返すことを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：レスポンスに data 配列と total・page・pageSize・totalPages を含む meta オブジェクトが含まれることを検証します。

---

### RT-030

件名：GET /api/users/:id — ユーザーが存在するとき 200 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：指定した ID のユーザーを正常取得できることを確認します。

実行するための前提：ユーザーサービスが対象ユーザーを返すようモック設定されています。

テスト内容：ステータスコード 200 と対象ユーザーのデータを検証します。

---

### RT-031

件名：GET /api/users/:id — ユーザーが存在しないとき 404 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：存在しない ID 指定時に 404 が返ることを確認します。

実行するための前提：ユーザーサービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-032

件名：POST /api/users — 認証済みかつ権限ありで 201 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：適切な権限を持つユーザーが新規ユーザーを登録でき HTTP 201 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されており、ユーザーサービスの registerUser がモックされています。

テスト内容：ステータスコード 201 と作成されたユーザーデータを検証します。

---

### RT-033

件名：POST /api/users — 必須フィールド欠落で 400 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：name や password などの必須フィールドが欠落したリクエストで 400 が返ることを確認します。入力バリデーションを検証します。

実行するための前提：ユーザーサービスがバリデーションエラーをスローするよう設定されています。

テスト内容：必須フィールドなしのリクエストに対してステータスコード 400 が返ることを検証します。

---

### RT-034

件名：POST /api/users — 未定義フィールドの送信で 400 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：スキーマに存在しない余分なフィールドを含むリクエストが 400 で拒否されることを確認します。意図しないデータの書き込みを防ぎます。

実行するための前提：ユーザーサービスが追加フィールドを拒否するよう設定されています。

テスト内容：不正フィールドを含むリクエストに対してステータスコード 400 が返ることを検証します。

---

### RT-035

件名：PATCH /api/users/:id — 認証済みかつ権限ありで更新が成功する

分類：ルートテスト（server/routes/users.test.js）

テスト意図：適切な権限を持つユーザーがユーザー情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と更新後のユーザーデータを検証します。

---

### RT-036

件名：PATCH /api/users/:id — 存在しないユーザー更新で 404 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：存在しないユーザーへの更新リクエストが 404 で拒否されることを確認します。

実行するための前提：ユーザーサービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

#### 2.1.4 商品マスタ（RT-037〜048）

### RT-037

件名：GET /api/products — 認証済みユーザーに商品一覧 200 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：認証済みユーザーが商品一覧を取得できることを確認します。参照系エンドポイントの基本正常系です。

実行するための前提：営業ロールの JWT トークンが設定されており、商品サービスがモックリストを返します。

テスト内容：GET /api/products のステータスコードが 200 であり、res.json().data に商品リストが含まれることを検証します。

---

### RT-038

件名：GET /api/products — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：認証なしの商品一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-039

件名：GET /api/products — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/products.test.js）

テスト意図：商品一覧エンドポイントが data 配列と meta オブジェクト（total・page・pageSize・totalPages）を含むページネーション対応レスポンスを返すことを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

### RT-040

件名：GET /api/products — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/products.test.js）

テスト意図：存在しないページを指定したとき data が空配列になる一方、meta の total は正しい件数を返すことを確認します。ページネーションの境界動作を検証します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?page=2 でリクエストし、body.data が空配列、meta.page=2・meta.total=1 であることを検証します。

---

### RT-041

件名：GET /api/products — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/products.test.js）

テスト意図：limit パラメーターを指定したとき meta.pageSize がその値になり、返却件数が limit 以内に収まることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 配列の長さが 1 であることを検証します。

---

### RT-042

件名：GET /api/products/:code — コードが存在するとき 200 と商品データが返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：指定したコードの商品を正常取得できることを確認します。

実行するための前提：商品サービスが対象商品を返すようモック設定されています。

テスト内容：ステータスコード 200 と res.json().code が 'PRD-001' であることを検証します。

---

### RT-043

件名：GET /api/products/:code — 商品が存在しないとき 404 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：商品サービスが statusCode=404 のエラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-044

件名：POST /api/products — master:edit 権限ありで 201 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：master:edit 権限を持つユーザーが新規商品を登録でき HTTP 201 が返ることを確認します。

実行するための前提：master:edit 権限を含む JWT トークンが設定されており、商品サービスの registerProduct がモックされています。

テスト内容：ステータスコード 201 と res.json().code が 'PRD-001' であることを検証します。

---

### RT-045

件名：POST /api/products — 商品名欠落で 400 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：name フィールドなしの登録リクエストで 400 が返ることを確認します。必須フィールドのバリデーションを検証します。

実行するための前提：商品サービスがバリデーションエラーをスローするよう設定されています。

テスト内容：name なしのリクエストに対してステータスコード 400 が返ることを検証します。

---

### RT-046

件名：POST /api/products — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：認証なしの商品登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-047

件名：PATCH /api/products/:code — master:edit 権限ありで更新が成功する

分類：ルートテスト（server/routes/products.test.js）

テスト意図：適切な権限を持つユーザーが商品情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-048

件名：PATCH /api/products/:code — 存在しない商品更新で 404 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：存在しないコードの商品更新が 404 で拒否されることを確認します。

実行するための前提：商品サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

#### 2.1.5 顧客マスタ（RT-049〜062）

### RT-049

件名：GET /api/customers — 認証済みユーザーに顧客一覧 200 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：認証済みユーザーが顧客一覧を取得できることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、顧客サービスがモックリストを返します。

テスト内容：GET /api/customers のステータスコードが 200 であり、res.json().data に顧客リストが含まれることを検証します。

---

### RT-050

件名：GET /api/customers — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：認証なしの顧客一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-051

件名：GET /api/customers — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：顧客一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

### RT-052

件名：GET /api/customers — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：存在しないページ指定時に data が空配列になることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?page=2 でリクエストし、data が空配列、meta.page=2 であることを検証します。

---

### RT-053

件名：GET /api/customers — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：limit パラメーターが meta.pageSize と返却件数に正しく反映されることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 長さが 1 であることを検証します。

---

### RT-054

件名：GET /api/customers/:code — コードが存在するとき 200 と顧客データが返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：指定したコードの顧客を正常取得できることを確認します。

実行するための前提：顧客サービスが対象顧客を返すようモック設定されています。

テスト内容：ステータスコード 200 と res.json().code が 'CUS-001' であることを検証します。

---

### RT-055

件名：GET /api/customers/:code — 顧客が存在しないとき 404 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：顧客サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-056

件名：POST /api/customers — master:edit 権限ありで 201 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：master:edit 権限を持つユーザーが新規顧客を登録でき HTTP 201 が返ることを確認します。

実行するための前提：master:edit 権限を含む JWT トークンが設定されています。

テスト内容：ステータスコード 201 と res.json().code が 'CUS-001' であることを検証します。

---

### RT-057

件名：POST /api/customers — closingDay・paymentSite・billingTo が registerCustomer に渡される

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：請求サイクル関連フィールド（closingDay・paymentSite・billingTo）がリクエストボディから正しくサービス層に渡されることを確認します。フィールドの取りこぼしを防ぎます。

実行するための前提：master:edit 権限付き JWT トークンが設定されており、mockCustomerService がキャプチャ可能な状態です。

テスト内容：registerCustomer が expect.objectContaining({ closingDay, paymentSite, billingTo }) で呼ばれることを検証します。

---

### RT-058

件名：POST /api/customers — 顧客名欠落で 400 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：name フィールドなしの登録リクエストで 400 が返ることを確認します。

実行するための前提：顧客サービスがバリデーションエラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

### RT-059

件名：POST /api/customers — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：認証なしの顧客登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-060

件名：PATCH /api/customers/:code — master:edit 権限ありで更新が成功する

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：適切な権限を持つユーザーが顧客情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-061

件名：PATCH /api/customers/:code — closingDay・paymentSite・billingTo が updateCustomer に渡される

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：更新時に closingDay・paymentSite・billingTo フィールドがサービス層に正しく渡されることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されており、mockCustomerService がキャプチャ可能な状態です。

テスト内容：updateCustomer が 'CUS-001' と expect.objectContaining({ closingDay, paymentSite, billingTo }) で呼ばれることを検証します。

---

### RT-062

件名：PATCH /api/customers/:code — 存在しない顧客更新で 404 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：存在しないコードの顧客更新が 404 で拒否されることを確認します。

実行するための前提：顧客サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

#### 2.1.6 仕入先マスタ（RT-063〜074）

### RT-063

件名：GET /api/suppliers — 認証済みユーザーに仕入先一覧 200 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：認証済みユーザーが仕入先一覧を取得できることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、仕入先サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に仕入先リストが含まれることを検証します。

---

### RT-064

件名：GET /api/suppliers — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：認証なしの仕入先一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-065

件名：GET /api/suppliers — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：仕入先一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

### RT-066

件名：GET /api/suppliers — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：存在しないページ指定時に data が空配列になることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?page=2 で data が空配列、meta.page=2 であることを検証します。

---

### RT-067

件名：GET /api/suppliers — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：limit パラメーターが pageSize と返却件数に正しく反映されることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 長さが 1 であることを検証します。

---

### RT-068

件名：GET /api/suppliers/:code — コードが存在するとき 200 と仕入先データが返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：指定したコードの仕入先を正常取得できることを確認します。

実行するための前提：仕入先サービスが対象仕入先を返すようモック設定されています。

テスト内容：ステータスコード 200 と res.json().code が 'SUP-001' であることを検証します。

---

### RT-069

件名：GET /api/suppliers/:code — 仕入先が存在しないとき 404 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：仕入先サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-070

件名：POST /api/suppliers — master:edit 権限ありで 201 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：master:edit 権限を持つユーザーが新規仕入先を登録でき HTTP 201 が返ることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 201 と res.json().code が 'SUP-001' であることを検証します。

---

### RT-071

件名：POST /api/suppliers — 仕入先名欠落で 400 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：name フィールドなしの登録リクエストで 400 が返ることを確認します。

実行するための前提：仕入先サービスがバリデーションエラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

### RT-072

件名：POST /api/suppliers — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：認証なしの仕入先登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-073

件名：PATCH /api/suppliers/:code — master:edit 権限ありで更新が成功する

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：適切な権限を持つユーザーが仕入先情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-074

件名：PATCH /api/suppliers/:code — 存在しない仕入先更新で 404 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：存在しないコードの仕入先更新が 404 で拒否されることを確認します。

実行するための前提：仕入先サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

#### 2.1.7 納品（RT-075〜083）

### RT-075

件名：GET /api/deliveries — 認証済みユーザーに納品一覧 200 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証済みユーザーが納品一覧を取得できることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、納品サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に納品リストが含まれることを検証します。

---

### RT-076

件名：GET /api/deliveries — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証なしの納品一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-077

件名：GET /api/deliveries — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：納品一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

### RT-078

件名：GET /api/deliveries — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：存在しないページ指定時に data が空配列になることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?page=2 で data が空配列、meta.page=2 であることを検証します。

---

### RT-079

件名：GET /api/deliveries — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：limit パラメーターが pageSize と返却件数に正しく反映されることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 長さが 1 であることを検証します。

---

### RT-080

件名：POST /api/deliveries — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証済みユーザーが納品を登録でき HTTP 201 が返ることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、納品サービスの registerDelivery がモックされています。

テスト内容：ステータスコード 201 と res.json().code が 'DLV-00001' であることを検証します。

---

### RT-081

件名：POST /api/deliveries — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証なしの納品登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-082

件名：PATCH /api/deliveries/:code — 認証済みユーザーで更新が成功する

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証済みユーザーが納品ステータスを更新でき HTTP 200 が返ることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、納品サービスの updateDelivery がモックされています。

テスト内容：ステータスコード 200 と res.json().status が '検収済' であることを検証します。

---

### RT-083

件名：PATCH /api/deliveries/:code — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証なしの納品更新が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

#### 2.1.8 案件（RT-084〜090）

### RT-084

件名：GET /api/projects — 認証済みユーザーにプロジェクト一覧 200 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：認証済みユーザーがプロジェクト一覧を取得できることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、プロジェクトサービスがモックリストを返します。

テスト内容：ステータスコード 200 と data にプロジェクトリストが含まれることを検証します。

---

### RT-085

件名：GET /api/projects — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：認証なしのプロジェクト一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-086

件名：GET /api/projects/:code — コードが存在するとき 200 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：指定コードのプロジェクトを正常取得できることを確認します。

実行するための前提：プロジェクトサービスが対象プロジェクトを返すようモック設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-087

件名：GET /api/projects/:code — プロジェクトが存在しないとき 404 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：プロジェクトサービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-088

件名：POST /api/projects — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：認証済みユーザーがプロジェクトを登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、プロジェクトサービスの registerProject がモックされています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

### RT-089

件名：POST /api/projects — プロジェクト名欠落で 400 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：name フィールドなしの登録リクエストで 400 が返ることを確認します。

実行するための前提：プロジェクトサービスがバリデーションエラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

### RT-090

件名：PATCH /api/projects/:code — 認証済みユーザーで更新が成功する

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：認証済みユーザーがプロジェクト情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

#### 2.1.9 システム設定（RT-091〜095）

### RT-091

件名：GET /api/settings — 認証済みユーザーにシステム設定 200 が返る

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：認証済みユーザーがシステム設定を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、設定サービスがモックデータを返します。

テスト内容：ステータスコード 200 と設定オブジェクトが返ることを検証します。

---

### RT-092

件名：GET /api/settings — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：認証なしの設定取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-093

件名：PUT /api/settings — 認証済みユーザーで設定更新が成功する

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：認証済みユーザーがシステム設定を更新でき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、設定サービスの updateSettings がモックされています。

テスト内容：ステータスコード 200 と更新後の設定オブジェクトが返ることを検証します。

---

### RT-094

件名：PUT /api/settings — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：認証なしの設定更新が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-095

件名：PUT /api/settings — ルートが設定サービスの updateSettings に委譲する

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：PUT /api/settings ルートがリクエストボディをそのまま設定サービスの updateSettings に渡す委譲動作を確認します。ルートがビジネスロジックを持たず、サービス層への正しい委譲が行われることを検証します。

実行するための前提：JWT トークンと mockSettingsService が設定されています。

テスト内容：mockSettingsService.updateSettings がリクエストボディと同じ引数で呼ばれることを検証します。

---

#### 2.1.10 通知（RT-096〜103）

### RT-096

件名：GET /api/notifications — 認証済みユーザーに通知一覧 200 が返る

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：認証済みユーザーが自分宛の通知一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、通知サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に通知リストが含まれることを検証します。

---

### RT-097

件名：GET /api/notifications — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：認証なしの通知一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-098

件名：GET /api/notifications — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：通知一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

### RT-099

件名：GET /api/notifications — ユーザー ID がサービスに正しく渡される

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：JWT から取得したユーザー ID が通知取得サービスに正しく渡され、自分宛の通知のみ取得できることを確認します。

実行するための前提：JWT トークンに id フィールドが含まれており、mockNotificationService がキャプチャ可能な状態です。

テスト内容：getNotificationsForUser が JWT の id で呼ばれることを検証します。

---

### RT-100

件名：PUT /api/notifications/:id/read — 自分の通知を既読にできる

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：通知の所有者が自分宛の通知を既読状態に更新できることを確認します。

実行するための前提：JWT トークンが設定されており、通知サービスの markAsRead がモックされています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-101

件名：PUT /api/notifications/:id/read — 他人の通知を既読にしようとすると 404 が返る

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：通知の所有者以外が既読操作を行った場合に 404 が返ることを確認します。通知の所有権チェックを検証します。

実行するための前提：通知サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-102

件名：POST /api/notifications/read-all — 認証済みユーザーの全通知を既読にできる

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：認証済みユーザーが自分宛の全通知を一括既読にできることを確認します。

実行するための前提：JWT トークンが設定されており、通知サービスの markAllAsRead がモックされています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-103

件名：POST /api/notifications/read-all — ユーザー ID がサービスに正しく渡される

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：一括既読操作が JWT の userId を使って正しいユーザーの通知のみを既読にすることを確認します。

実行するための前提：JWT トークンに id フィールドが含まれています。

テスト内容：markAllAsRead が JWT の id で呼ばれることを検証します。

---

#### 2.1.11 見積（RT-104〜117）

### RT-104

件名：GET /api/quotations — 認証済みユーザーに見積一覧 200 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：認証済みユーザーが見積一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、見積サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に見積リストが含まれることを検証します。

---

### RT-105

件名：GET /api/quotations — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：認証なしの見積一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-106

件名：GET /api/quotations — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：見積一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

### RT-107

件名：GET /api/quotations/:code — コードが存在するとき 200 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：指定コードの見積を正常取得できることを確認します。

実行するための前提：見積サービスが対象見積を返すようモック設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-108

件名：GET /api/quotations/:code — 見積が存在しないとき 404 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：見積サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-109

件名：POST /api/quotations — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：認証済みユーザーが見積を登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、見積サービスの registerQuotation がモックされています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

### RT-110

件名：PATCH /api/quotations/:code — 認証済みユーザーで更新が成功する

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：認証済みユーザーが見積情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-111

件名：POST /api/quotations/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：approval:apply 権限を持つユーザーが見積の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されており、見積サービスの submitQuotationApproval がモックされています。

テスト内容：ステータスコード 200 と res.json().status が '承認依頼中' であることを検証します。

---

### RT-112

件名：POST /api/quotations/:code/submit-approval — 不正なステータス遷移で 400 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：承認申請が下書き状態以外から行われた場合に 400 が返ることを確認します。不正なステータス遷移を防止します。

実行するための前提：見積サービスがステータス遷移エラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

### RT-113

件名：POST /api/quotations/:code/approve — approval:act 権限ありで承認済みになる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：approval:act 権限を持つユーザーが見積を承認でき、ステータスが「承認済み」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認済み' であることを検証します。

---

### RT-114

件名：POST /api/quotations/:code/reject — approval:act 権限ありで却下になる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：approval:act 権限を持つユーザーが見積を却下でき、ステータスが「却下」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '却下' であることを検証します。

---

### RT-115

件名：POST /api/quotations/:code/submit-approval — N-01 通知：承認者 ID リストで notifyApprovalRequest が呼ばれる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：承認申請送信後に承認経路リポジトリから承認者を取得し、通知サービスの notifyApprovalRequest が正しい引数で呼ばれることを確認します。承認依頼通知（N-01）のトリガーを検証します。

実行するための前提：approvalRouteRepository がモック承認者リストを返す設定であり、通知サービスがモック済みです。

テスト内容：notifyApprovalRequest が ('quotation', code, ['approver01'], userObj) で呼ばれることを検証します。

---

### RT-116

件名：POST /api/quotations/:code/approve — N-02 通知：申請者 ID で notifyApprovalComplete が呼ばれる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：承認操作後に承認完了通知（N-02）がオリジナルの申請者 ID に送付されることを確認します。

実行するための前提：見積サービスが submittedBy フィールドを含む見積を返し、通知サービスがモック済みです。

テスト内容：notifyApprovalComplete が ('quotation', code, submittedBy, userObj) で呼ばれることを検証します。

---

### RT-117

件名：POST /api/quotations/:code/reject — N-03 通知：申請者 ID と却下理由で notifyRejection が呼ばれる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：却下操作後に却下通知（N-03）が申請者に送付され、理由が含まれることを確認します。

実行するための前提：見積サービスが submittedBy を含む見積を返し、通知サービスがモック済みです。

テスト内容：notifyRejection が ('quotation', code, submittedBy, reason, userObj) で呼ばれることを検証します。

---

#### 2.1.12 受注（RT-118〜122）

### RT-118

件名：GET /api/orders — 認証済みユーザーに受注一覧 200 が返る

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：認証済みユーザーが受注一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、受注サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に受注リストが含まれることを検証します。

---

### RT-119

件名：GET /api/orders — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：受注一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

### RT-120

件名：POST /api/orders/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：approval:apply 権限を持つユーザーが受注の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認依頼中' であることを検証します。

---

### RT-121

件名：POST /api/orders/:code/approve — N-02 通知：承認完了通知が申請者に送付される

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：受注の承認操作後に承認完了通知が申請者に送付されることを確認します。

実行するための前提：受注サービスが submittedBy を含む受注を返し、通知サービスがモック済みです。

テスト内容：notifyApprovalComplete が正しい引数で呼ばれることを検証します。

---

### RT-122

件名：POST /api/orders/:code/reject — N-03 通知：却下通知が申請者に送付される

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：受注の却下操作後に却下通知が申請者に送付されることを確認します。

実行するための前提：受注サービスが submittedBy を含む受注を返し、通知サービスがモック済みです。

テスト内容：notifyRejection が正しい引数で呼ばれることを検証します。

---

#### 2.1.13 発注（RT-123〜127）

### RT-123

件名：GET /api/purchase-orders — 認証済みユーザーに発注一覧 200 が返る

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：認証済みユーザーが発注一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、発注サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に発注リストが含まれることを検証します。

---

### RT-124

件名：GET /api/purchase-orders — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：発注一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

### RT-125

件名：POST /api/purchase-orders/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：approval:apply 権限を持つユーザーが発注の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認依頼中' であることを検証します。

---

### RT-126

件名：POST /api/purchase-orders/:code/approve — N-02 通知：承認完了通知が申請者に送付される

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：発注の承認操作後に承認完了通知が申請者に送付されることを確認します。

実行するための前提：発注サービスが submittedBy を含む発注を返し、通知サービスがモック済みです。

テスト内容：notifyApprovalComplete が正しい引数で呼ばれることを検証します。

---

### RT-127

件名：POST /api/purchase-orders/:code/reject — N-03 通知：却下通知が申請者に送付される

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：発注の却下操作後に却下通知が申請者に送付されることを確認します。

実行するための前提：発注サービスが submittedBy を含む発注を返し、通知サービスがモック済みです。

テスト内容：notifyRejection が正しい引数で呼ばれることを検証します。

---

#### 2.1.14 請求（RT-128〜150, RT-183〜186）

### RT-128

件名：GET /api/invoices — 認証済みユーザーに請求一覧 200 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証済みユーザーが請求一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、請求サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に請求リストが含まれることを検証します。

---

### RT-129

件名：GET /api/invoices — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証なしの請求一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-130

件名：GET /api/invoices — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

### RT-131

件名：GET /api/invoices — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：存在しないページ指定時に data が空配列になることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?page=2 で data が空配列、meta.page=2 であることを検証します。

---

### RT-132

件名：GET /api/invoices — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：limit パラメーターが pageSize と返却件数に正しく反映されることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 長さが 1 であることを検証します。

---

### RT-133

件名：GET /api/invoices/:code — コードが存在するとき 200 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：指定コードの請求を正常取得できることを確認します。

実行するための前提：請求サービスが対象請求を返すようモック設定されています。

テスト内容：ステータスコード 200 と res.json().code が 'INV-00001' であることを検証します。

---

### RT-134

件名：GET /api/invoices/:code — 請求が存在しないとき 404 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：請求サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-135

件名：POST /api/invoices — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証済みユーザーが請求を登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、請求サービスの registerInvoice がモックされています。

テスト内容：ステータスコード 201 と res.json().code が 'INV-00001' であることを検証します。

---

### RT-136

件名：POST /api/invoices — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証なしの請求登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-137

件名：PATCH /api/invoices/:code — 認証済みユーザーで更新が成功する

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証済みユーザーが請求情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-138

件名：POST /api/invoices/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：approval:apply 権限を持つユーザーが請求の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と res.json().status が '承認依頼中' であることを検証します。

---

### RT-139

件名：POST /api/invoices/:code/submit-approval — 不正なステータス遷移で 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：承認申請が下書き状態以外から行われた場合に 400 が返ることを確認します。

実行するための前提：請求サービスがステータス遷移エラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

### RT-140

件名：POST /api/invoices/:code/approve — approval:act 権限ありで確定になる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：approval:act 権限を持つユーザーが請求を承認でき、ステータスが「確定」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '確定' であることを検証します。

---

### RT-141

件名：POST /api/invoices/:code/reject — approval:act 権限ありで却下になる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：approval:act 権限を持つユーザーが請求を却下でき、ステータスが「却下」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '却下' であることを検証します。

---

### RT-142

件名：POST /api/invoices/:code/submit-approval — N-01 通知：承認者 ID リストで notifyApprovalRequest が呼ばれる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求承認申請送信後に承認者リストに対して notifyApprovalRequest が呼ばれることを確認します。

実行するための前提：approvalRouteRepository がモック承認者を返す設定で、通知サービスがモック済みです。

テスト内容：notifyApprovalRequest が ('invoice', code, ['approver01'], userObj) で呼ばれることを検証します。

---

### RT-143

件名：POST /api/invoices/:code/approve — N-02 通知：承認完了通知が申請者に送付される

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求承認操作後に承認完了通知が申請者に送付されることを確認します。

実行するための前提：請求サービスが submittedBy を含む請求を返し、通知サービスがモック済みです。

テスト内容：notifyApprovalComplete が ('invoice', code, submittedBy, userObj) で呼ばれることを検証します。

---

### RT-144

件名：POST /api/invoices/:code/reject — N-03 通知：却下通知が申請者に送付される

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求却下操作後に却下通知が申請者に理由とともに送付されることを確認します。

実行するための前提：請求サービスが submittedBy を含む請求を返し、通知サービスがモック済みです。

テスト内容：notifyRejection が ('invoice', code, submittedBy, reason, userObj) で呼ばれることを検証します。

---

### RT-145

件名：GET /api/invoices/candidates — 認証済みユーザーに請求候補一覧 200 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求書作成の候補となる受注一覧が year と month パラメーターを指定して取得できることを確認します。

実行するための前提：JWT トークンが設定されており、請求サービスの listInvoiceCandidates がモックデータを返します。

テスト内容：?year=2026&month=5 でリクエストし、ステータス 200 と配列レスポンスを検証します。

---

### RT-146

件名：GET /api/invoices/candidates — month が欠落した場合に 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：必須クエリパラメーター month が欠落した場合に 400 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?year=2026 のみでリクエストし、ステータスコード 400 が返ることを検証します。

---

### RT-147

件名：GET /api/invoices/candidates — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証なしの請求候補一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-148

件名：GET /api/reports/monthly-summary — 認証済みユーザーに月次サマリー 200 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証済みユーザーが指定年月のプロジェクト別月次サマリー（売上・原価・利益）を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、請求サービスの getMonthlySummary がモックデータを返します。

テスト内容：?year=2026&month=5 でリクエストし、ステータス 200 と projectCode・sales・cost・profit を含む配列を検証します。

---

### RT-149

件名：GET /api/reports/monthly-summary — year が欠落した場合に 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：必須クエリパラメーター year が欠落した場合に 400 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?month=5 のみでリクエストし、ステータスコード 400 が返ることを検証します。

---

### RT-150

件名：GET /api/reports/monthly-summary — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証なしの月次サマリー取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-183

件名：GET /api/invoices/candidates — month=0（下限未満）の場合に 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：CLAUDE.md 境界値「月パラメータ: 1〜12」に基づき、month=0 は無効値として 400 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?year=2026&month=0 でリクエストし、ステータスコード 400 が返ることを検証します。

パス・ファイル名：server/routes/invoices.test.js

---

### RT-184

件名：GET /api/invoices/candidates — month=13（上限超過）の場合に 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：CLAUDE.md 境界値「月パラメータ: 1〜12」に基づき、month=13 は無効値として 400 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?year=2026&month=13 でリクエストし、ステータスコード 400 が返ることを検証します。

パス・ファイル名：server/routes/invoices.test.js

---

### RT-185

件名：GET /api/reports/monthly-summary — month=0（下限未満）の場合に 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：CLAUDE.md 境界値「月パラメータ: 1〜12」に基づき、月次サマリーでも month=0 が 400 で拒否されることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?year=2026&month=0 でリクエストし、ステータスコード 400 が返ることを検証します。

パス・ファイル名：server/routes/invoices.test.js

---

### RT-186

件名：GET /api/reports/monthly-summary — month=13（上限超過）の場合に 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：CLAUDE.md 境界値「月パラメータ: 1〜12」に基づき、月次サマリーでも month=13 が 400 で拒否されることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?year=2026&month=13 でリクエストし、ステータスコード 400 が返ることを検証します。

パス・ファイル名：server/routes/invoices.test.js

---

#### 2.1.15 支払（RT-151〜159）

### RT-151

件名：GET /api/payments — 認証済みユーザーに支払一覧 200 が返る

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：認証済みユーザーが支払一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、支払サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に支払リストが含まれることを検証します。

---

### RT-152

件名：GET /api/payments — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：支払一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

### RT-153

件名：POST /api/payments — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：認証済みユーザーが支払を登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、支払サービスの registerPayment がモックされています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

### RT-154

件名：POST /api/payments/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：approval:apply 権限を持つユーザーが支払の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認依頼中' であることを検証します。

---

### RT-155

件名：POST /api/payments/:code/approve — approval:act 権限ありで承認済みになる

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：approval:act 権限を持つユーザーが支払を承認でき、ステータスが「承認済み」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認済み' であることを検証します。

---

### RT-156

件名：POST /api/payments/:code/reject — 不正なステータス遷移で 400 が返る

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：却下操作が承認依頼中以外の状態から行われた場合に 400 が返ることを確認します。

実行するための前提：支払サービスがステータス遷移エラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

### RT-157

件名：POST /api/payments/:code/cancel — 認証済みユーザーでキャンセルが成功する

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：認証済みユーザーが支払をキャンセルでき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が 'キャンセル' であることを検証します。

---

### RT-158

件名：POST /api/payments/:code/register-result — payment:edit 権限ありで支払済みになる

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：payment:edit 権限を持つユーザーが支払実績を登録でき、ステータスが「支払済み」になることを確認します。

実行するための前提：payment:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '支払済み' であることを検証します。

---

### RT-159

件名：POST /api/payments/:code/register-result — payment:edit 権限がない場合に 403 が返る

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：payment:edit 権限を持たないユーザーによる支払実績登録が 403 で拒否されることを確認します。

実行するための前提：payment:edit 権限のない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

---

#### 2.1.16 入金（RT-160〜163）

### RT-160

件名：GET /api/receipts — 認証済みユーザーに入金一覧 200 が返る

分類：ルートテスト（server/routes/receipts.test.js）

テスト意図：認証済みユーザーが入金一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、入金サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に入金リストが含まれることを検証します。

---

### RT-161

件名：GET /api/receipts — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/receipts.test.js）

テスト意図：認証なしの入金一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

### RT-162

件名：POST /api/receipts — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/receipts.test.js）

テスト意図：認証済みユーザーが入金を登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、入金サービスの registerReceipt がモックされています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

### RT-163

件名：POST /api/receipts — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/receipts.test.js）

テスト意図：認証なしの入金登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

#### 2.1.17 承認一覧（RT-164〜174）

### RT-164

件名：GET /api/approvals — 認証済みユーザーに承認待ち一覧 200 が返る

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：認証済みユーザーがすべての承認待ちドキュメント一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、承認サービスがモック一覧を返します。

テスト内容：ステータスコード 200 と data に承認待ち一覧が含まれることを検証します。

---

### RT-165

件名：GET /api/approvals — pending-only フィルターが機能する

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：?pending=true クエリパラメーターを指定したとき承認待ち（承認依頼中）のドキュメントのみが返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：返却されるドキュメントがすべて承認依頼中ステータスであることを検証します。

---

### RT-166

件名：GET /api/approvals — docType フィルターが機能する

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：?docType=quotation などのフィルターを指定したとき対象種別のドキュメントのみが返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：指定した docType のドキュメントのみ含まれることを検証します。

---

### RT-167

件名：GET /api/approvals — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：承認一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

### RT-168

件名：POST /api/approvals/:code/approve — QUO- プレフィックスで見積承認ルートに正しく委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：汎用承認エンドポイントがコードのプレフィックス（QUO-）から対象サービスを判定し、見積の承認処理に正しく委譲することを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認済み' であることを検証します。

---

### RT-169

件名：POST /api/approvals/:code/approve — ORD- プレフィックスで受注承認ルートに委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：ORD- プレフィックスのコードで受注の承認処理に正しく委譲されることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-170

件名：POST /api/approvals/:code/approve — POD- プレフィックスで発注承認ルートに委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：POD- プレフィックスのコードで発注の承認処理に正しく委譲されることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-171

件名：POST /api/approvals/:code/approve — INV- プレフィックスで請求承認ルートに委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：INV- プレフィックスのコードで請求の承認処理に正しく委譲されることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-172

件名：POST /api/approvals/:code/approve — PAY- プレフィックスで支払承認ルートに委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：PAY- プレフィックスのコードで支払の承認処理に正しく委譲されることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-173

件名：POST /api/approvals/:code/approve — 未知のプレフィックスで 400 が返る

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：認識できないプレフィックスのコードが指定された場合に 400 が返ることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：認識できないプレフィックスのコードで POST し、ステータスコード 400 が返ることを検証します。

---

### RT-174

件名：POST /api/approvals/:code/reject — reason が欠落した場合に 400 が返る

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：却下操作において理由（reason）が欠落した場合に 400 が返ることを確認します。却下理由の記録を必須とするビジネスルールを検証します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：reason なしで却下リクエストを送信し、ステータスコード 400 が返ることを検証します。

---

#### 2.1.18 承認経路管理（RT-175〜182）

### RT-175

件名：GET /api/approval-routes — 認証済みかつ権限ありに承認経路一覧 200 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：user-permission:edit 権限を持つ認証済みユーザーが承認経路一覧を取得できることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と承認経路リストが返ることを検証します。

---

### RT-176

件名：GET /api/approval-routes — user-permission:edit 権限がない場合に 403 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：承認経路の参照が user-permission:edit 権限を必要とすることを確認します。

実行するための前提：user-permission:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

---

### RT-177

件名：GET /api/approval-routes/:id — ID が存在するとき 200 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：指定 ID の承認経路を正常取得できることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されており、承認経路リポジトリが対象を返します。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-178

件名：GET /api/approval-routes/:id — 承認経路が存在しないとき 404 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：存在しない ID 指定時に 404 が返ることを確認します。

実行するための前提：承認経路リポジトリが null を返します。

テスト内容：ステータスコード 404 が返ることを検証します。

---

### RT-179

件名：POST /api/approval-routes — user-permission:edit 権限ありで 201 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：user-permission:edit 権限を持つユーザーが承認経路を作成でき HTTP 201 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

### RT-180

件名：PATCH /api/approval-routes/:id — user-permission:edit 権限ありで更新が成功する

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：user-permission:edit 権限を持つユーザーが承認経路を更新でき HTTP 200 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-181

件名：DELETE /api/approval-routes/:id — user-permission:edit 権限ありで削除が成功する

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：user-permission:edit 権限を持つユーザーが承認経路を削除でき HTTP 200 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

### RT-182

件名：DELETE /api/approval-routes/:id — user-permission:edit 権限がない場合に 403 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：承認経路の削除が user-permission:edit 権限を必要とすることを確認します。

実行するための前提：user-permission:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

---



---

### 2.2 サービステスト（ST）

サービス層のビジネスロジックをDIパターンでモックを注入してテストします。

#### 2.2.1 認証サービス（ST-001〜009）

### ST-001

件名：getPermissionsForUserType — システム管理者は全権限を持つ

分類：サービステスト（server/services/authService.test.js）

テスト意図：システム管理者ロールに master:edit・user-permission:edit・approval:apply・approval:act・payment:edit の 5 権限すべてが付与されることを確認します。

実行するための前提：authService を直接インポートします。

テスト内容：'システム管理者' を引数に getPermissionsForUserType を呼び出し、5 権限がすべて含まれることを検証します。

パス・ファイル名：server/services/authService.test.js

---

### ST-002

件名：getPermissionsForUserType — 一般ユーザーは approval:apply のみ持つ

分類：サービステスト（server/services/authService.test.js）

テスト意図：一般ユーザーロールには approval:apply のみが付与されることを確認します。最小権限の原則に基づく権限割り当てを検証します。

実行するための前提：authService を直接インポートします。

テスト内容：'一般ユーザ' を引数に getPermissionsForUserType を呼び出し、approval:apply のみを含むことを検証します。

パス・ファイル名：server/services/authService.test.js

---

### ST-003

件名：authenticate — 有効な認証情報で認証が成功する

分類：サービステスト（server/services/authService.test.js）

テスト意図：正しいユーザー名とパスワードで authenticate を呼び出したとき認証が成功してユーザーオブジェクトが返ることを確認します。

実行するための前提：ユーザーリポジトリがモックユーザーを返し、bcrypt がパスワード比較を成功させます。

テスト内容：認証成功で id・name・userType を含むユーザーオブジェクトが返ることを検証します。

パス・ファイル名：server/services/authService.test.js

---

### ST-004

件名：authenticate — 認証結果に passwordHash が含まれない

分類：サービステスト（server/services/authService.test.js）

テスト意図：authenticate の返却値に passwordHash が含まれないことを確認します。機密情報の流出を防ぎます。

実行するための前提：ST-003 と同様のモック設定です。

テスト内容：返却オブジェクトに passwordHash プロパティが存在しないことを検証します。

パス・ファイル名：server/services/authService.test.js

---

### ST-005

件名：authenticate — 無効なパスワードで認証が失敗する

分類：サービステスト（server/services/authService.test.js）

テスト意図：誤ったパスワードで authenticate を呼び出したとき認証エラーが発生することを確認します。

実行するための前提：bcrypt がパスワード比較を失敗させます。

テスト内容：authenticate が認証失敗エラーをスローすることを検証します。

パス・ファイル名：server/services/authService.test.js

---

### ST-006

件名：authenticate — 5 回失敗後にアカウントがロックされる

分類：サービステスト（server/services/authService.test.js）

テスト意図：ログイン失敗が 5 回に達したときアカウントロック状態になることを確認します。ブルートフォース攻撃対策の実装を検証します。

実行するための前提：ユーザーリポジトリが failedLoginCount=5 のユーザーを返します。

テスト内容：認証試行が失敗しアカウントロックエラーが返ることを検証します。

パス・ファイル名：server/services/authService.test.js

---

### ST-007

件名：authenticate — ロック有効期限切れのユーザーは自動アンロックされる

分類：サービステスト（server/services/authService.test.js）

テスト意図：アカウントロックの有効期限（30 分）を過ぎた場合に自動でアンロックされ正しいパスワードで認証できることを確認します。

実行するための前提：ユーザーリポジトリが lockUntil が過去の値を持つユーザーを返します。

テスト内容：アンロック後に認証が成功することを検証します。

パス・ファイル名：server/services/authService.test.js

---

### ST-008

件名：authenticate — 認証成功時に failedLoginCount がリセットされる

分類：サービステスト（server/services/authService.test.js）

テスト意図：認証成功後にユーザーの failedLoginCount がリセット（0）されることを確認します。一時的な失敗カウントが次回認証に影響しないことを保証します。

実行するための前提：ユーザーリポジトリのモックが update メソッドを持ちます。

テスト内容：userRepository.update が failedLoginCount=0 で呼ばれることを検証します。

パス・ファイル名：server/services/authService.test.js

---

### ST-009

件名：authenticate — 無効化ユーザーは汎用エラーメッセージで拒否される

分類：サービステスト（server/services/authService.test.js）

テスト意図：無効化されたユーザーが認証を試みた場合、アカウント無効化の詳細を明かさない汎用エラーメッセージが返ることを確認します。

実行するための前提：ユーザーリポジトリが status='無効' のユーザーを返します。

テスト内容：汎用的なエラーメッセージで認証が失敗することを検証します。

パス・ファイル名：server/services/authService.test.js

---

#### 2.2.2 ユーザーサービス・パスワードポリシー（ST-010〜021）

### ST-010

件名：listUsers — パスワードハッシュを含まないユーザー一覧が返る

分類：サービステスト（server/services/userService.test.js）

テスト意図：ユーザー一覧取得時にすべてのユーザーから passwordHash が除かれていることを確認します。

実行するための前提：ユーザーリポジトリが passwordHash を含むユーザーリストを返します。

テスト内容：返却リストの各ユーザーに passwordHash が含まれないことを検証します。

パス・ファイル名：server/services/userService.test.js

---

### ST-011

件名：getUserById — 存在しない ID で 404 エラーが発生する

分類：サービステスト（server/services/userService.test.js）

テスト意図：存在しない ID でユーザー取得を試みた場合、statusCode=404 のエラーが発生することを確認します。

実行するための前提：ユーザーリポジトリが null を返します。

テスト内容：statusCode=404 のエラーがスローされることを検証します。

パス・ファイル名：server/services/userService.test.js

---

### ST-012

件名：registerUser — パスワードがハッシュ化されて保存される

分類：サービステスト（server/services/userService.test.js）

テスト意図：ユーザー登録時にパスワードが bcrypt ハッシュとして保存されることを確認します。

実行するための前提：ユーザーリポジトリのモックと bcrypt が設定されています。

テスト内容：リポジトリ save に渡される passwordHash が平文パスワードと異なることを検証します。

パス・ファイル名：server/services/userService.test.js

---

### ST-013

件名：registerUser — 登録結果に passwordHash が含まれない

分類：サービステスト（server/services/userService.test.js）

テスト意図：ユーザー登録の返却値に passwordHash が含まれないことを確認します。

実行するための前提：ユーザーリポジトリの save がモック済みです。

テスト内容：返却オブジェクトに passwordHash が存在しないことを検証します。

パス・ファイル名：server/services/userService.test.js

---

### ST-014

件名：registerUser — 必須フィールド欠落で 400 エラーが発生する

分類：サービステスト（server/services/userService.test.js）

テスト意図：id・name・password などの必須フィールドが欠落した場合に statusCode=400 のエラーが発生することを確認します。

実行するための前提：必須フィールドを省いた入力を用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/userService.test.js

---

### ST-015

件名：registerUser — パスワード複雑性要件を満たさない場合に 400 エラーが発生する

分類：サービステスト（server/services/userService.test.js）

テスト意図：パスワードポリシー（8 文字以上・大文字・小文字・数字を含む）を満たさないパスワードで 400 エラーが発生することを確認します。

実行するための前提：ポリシー違反のパスワードを含む入力を用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/userService.test.js

---

### ST-016

件名：updateUser — パスワード変更時に新しいパスワードが再ハッシュされる

分類：サービステスト（server/services/userService.test.js）

テスト意図：ユーザー更新時にパスワードが変更された場合、新しいパスワードが再ハッシュされて保存されることを確認します。

実行するための前提：更新前のユーザーリポジトリとモック bcrypt が設定されています。

テスト内容：リポジトリ update に渡される passwordHash が新パスワードのハッシュであることを検証します。

パス・ファイル名：server/services/userService.test.js

---

### ST-017

件名：validatePassword — 8 文字未満で「8 文字以上」エラーが発生する

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：パスワードが最小文字数（8 文字）を下回った場合に適切なエラーメッセージが返ることを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：7 文字以下のパスワードで「8 文字以上」のメッセージを含むエラーがスローされることを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

### ST-018

件名：validatePassword — 大文字がない場合にエラーが発生する

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：大文字を含まないパスワードで「大文字」を要求するエラーが返ることを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：大文字のないパスワードでエラーがスローされることを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

### ST-019

件名：validatePassword — 小文字がない場合にエラーが発生する

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：小文字を含まないパスワードでエラーが返ることを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：小文字のないパスワードでエラーがスローされることを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

### ST-020

件名：validatePassword — 数字がない場合に「数字」エラーが発生する

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：数字を含まないパスワードで「数字」を要求するエラーが返ることを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：数字のないパスワードでエラーがスローされることを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

### ST-021

件名：validatePassword — 有効なパスワードでエラーが発生しない

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：すべての要件を満たすパスワードでエラーが発生しないことを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：有効なパスワードで関数が例外をスローしないことを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

#### 2.2.3 リフレッシュトークンサービス（ST-022〜025）

### ST-022

件名：createRefreshToken — 文字列トークンが返り、リポジトリに保存され、ハッシュ化される

分類：サービステスト（server/services/refreshTokenService.test.js）

テスト意図：createRefreshToken が文字列トークンを返し、リポジトリに保存する際にハッシュ化されることを確認します。DB 漏洩時のトークン窃取を防ぎます。

実行するための前提：リフレッシュトークンリポジトリのモックが設定されています。

テスト内容：返却値が文字列型であること・リポジトリ save が呼ばれること・保存される tokenHash が返却トークンと異なることを検証します。

パス・ファイル名：server/services/refreshTokenService.test.js

---

### ST-023

件名：createRefreshToken — expiresAt が未来の日時で保存される

分類：サービステスト（server/services/refreshTokenService.test.js）

テスト意図：生成されたリフレッシュトークンの有効期限が現在より未来であることを確認します。

実行するための前提：リフレッシュトークンリポジトリのモックが設定されています。

テスト内容：save に渡される expiresAt が現在時刻より未来であることを検証します。

パス・ファイル名：server/services/refreshTokenService.test.js

---

### ST-024

件名：verifyAndRotate — リボーク済みトークンで全セッションをリボークしてエラーをスローする

分類：サービステスト（server/services/refreshTokenService.test.js）

テスト意図：すでにリボークされたリフレッシュトークンが使用された場合（窃盗検知）、全セッションをリボークしエラーをスローすることを確認します。

実行するための前提：リポジトリがリボーク済みのトークンレコードを返します。

テスト内容：revokeAllForUser が呼ばれ、エラーがスローされることを検証します。

パス・ファイル名：server/services/refreshTokenService.test.js

---

### ST-025

件名：verifyAndRotate — 成功時に古いトークンがリボークされ新しい tokenId と userId が返る

分類：サービステスト（server/services/refreshTokenService.test.js）

テスト意図：正常なリフレッシュ操作で古いトークンが失効し新しいトークンが発行されることを確認します。

実行するための前提：リポジトリが有効なトークンレコードを返します。

テスト内容：古いトークンのリボークと新しい tokenId・userId の返却を検証します。

パス・ファイル名：server/services/refreshTokenService.test.js

---

#### 2.2.4 通知サービス（ST-026〜032, ST-081〜082）

### ST-026

件名：notifyApprovalRequest — 承認者ごとに N-01 通知が保存される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：承認依頼通知（N-01）が承認者リスト全員に対して個別に作成されることを確認します。承認者が複数いる場合に全員に通知されることを保証します。

実行するための前提：通知リポジトリのモックが設定されています。

テスト内容：notificationRepository.save が承認者数分呼ばれ type='N-01'・recipientId・docCode が含まれることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

### ST-027

件名：notifyApprovalRequest — 承認者リストが空の場合に通知が作成されない

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：承認者が設定されていない場合（空のリスト）に通知が作成されないことを確認します。

実行するための前提：承認者リストとして空配列を渡します。

テスト内容：notificationRepository.save が呼ばれないことを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

### ST-028

件名：notifyApprovalComplete — 申請者に N-02 通知が保存される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：承認完了通知（N-02）がオリジナルの申請者 ID 宛に作成されることを確認します。

実行するための前提：通知リポジトリのモックが設定されています。

テスト内容：notificationRepository.save が type='N-02'・recipientId=申請者 ID で呼ばれることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

### ST-029

件名：notifyRejection — 理由を含む N-03 通知が申請者に保存される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：却下通知（N-03）が申請者 ID 宛に作成され、メッセージに却下理由が含まれることを確認します。

実行するための前提：通知リポジトリのモックが設定されています。

テスト内容：notificationRepository.save の呼び出しで type='N-03'・message に reason が含まれることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

### ST-030

件名：markAsRead — 通知の所有者でない場合に 404 エラーが発生する

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：自分以外の通知を既読にしようとした場合に 404 エラーが発生することを確認します。通知の所有権チェックを検証します。

実行するための前提：通知リポジトリが異なる recipientId を持つ通知を返します。

テスト内容：statusCode=404 のエラーがスローされることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

### ST-031

件名：notifyStaleApprovals — 未処理の期限切れ承認に N-04 通知が送付される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：staleDays を超えて承認依頼中のままのドキュメントがある場合に N-04（督促通知）が生成されることを確認します。

実行するための前提：staleDays=3 として submittedAt が閾値を過ぎたドキュメントをモックします。

テスト内容：N-04 通知が作成されることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

### ST-032

件名：notifyStaleApprovals — submittedAt が null のドキュメントはスキップされる

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：submittedAt が設定されていないドキュメントは期限切れ判定から除外されることを確認します。

実行するための前提：submittedAt=null のドキュメントをモックします。

テスト内容：当該ドキュメントに対して N-04 通知が作成されないことを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

### ST-081

件名：notifyApprovalRequest — Promise.all で一部 save が失敗した場合に全体が reject される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：複数の承認者へ通知を並列保存中に 1 件でも失敗した場合、Promise.all が全体をリジェクトすることを確認します。DB障害による通知欠落リスクを文書化します。

実行するための前提：repo.save が 1 件目は成功・2 件目で reject するよう設定されています。

テスト内容：notifyApprovalRequest が reject し Error('DB write failed') が伝播することを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

### ST-082

件名：notifyStaleApprovals — Promise.all で一部 save が失敗した場合に全体が reject される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：複数の期限切れ通知の並列保存中に 1 件でも失敗した場合、Promise.all が全体をリジェクトすることを確認します。

実行するための前提：repo.save が 1 件目は成功・2 件目で reject するよう設定されています。

テスト内容：notifyStaleApprovals が reject し Error('DB write failed') が伝播することを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

#### 2.2.5 設定・連番サービス（ST-033〜037）

### ST-033

件名：getSettings — settingsRepository.findOne に委譲して設定を返す

分類：サービステスト（server/services/settingsService.test.js）

テスト意図：getSettings が settingsRepository.findOne に正しく委譲し設定オブジェクトを返すことを確認します。

実行するための前提：設定リポジトリのモックが設定されています。

テスト内容：settingsRepository.findOne が呼ばれ設定オブジェクトが返ることを検証します。

パス・ファイル名：server/services/settingsService.test.js

---

### ST-034

件名：updateSettings — 全フィールドが settingsRepository.update に委譲される

分類：サービステスト（server/services/settingsService.test.js）

テスト意図：updateSettings が入力フィールドをすべて settingsRepository.update に渡すことを確認します。フィールドの取りこぼしを防ぎます。

実行するための前提：設定リポジトリのモックが設定されています。

テスト内容：settingsRepository.update が入力と同じフィールドで呼ばれることを検証します。

パス・ファイル名：server/services/settingsService.test.js

---

### ST-035

件名：generateCode — QUO エンティティタイプで QUO-XXXXX 形式のコードが生成される

分類：サービステスト（server/services/sequenceService.test.js）

テスト意図：見積コードが QUO- プレフィックスと 5 桁ゼロパディングで生成されることを確認します。

実行するための前提：シーケンスカウンターリポジトリのモックが設定されています。

テスト内容：'quotation' タイプで nextVal=1 の場合に 'QUO-00001' が返ることを検証します。

パス・ファイル名：server/services/sequenceService.test.js

---

### ST-036

件名：generateCode — 各エンティティタイプで正しいプレフィックスのコードが生成される

分類：サービステスト（server/services/sequenceService.test.js）

テスト意図：ORD・POD・INV・RCP・PMT・DLV 各エンティティタイプに対して正しいプレフィックスのコードが生成されることを確認します。

実行するための前提：シーケンスカウンターリポジトリのモックが設定されています。

テスト内容：各タイプに対応するプレフィックス（ORD-/POD-/INV-/RCP-/PMT-/DLV-）が付いたコードが返ることを検証します。

パス・ファイル名：server/services/sequenceService.test.js

---

### ST-037

件名：generateCode — 未知のエンティティタイプでエラーがスローされる

分類：サービステスト（server/services/sequenceService.test.js）

テスト意図：登録されていないエンティティタイプを指定した場合にエラーがスローされることを確認します。

実行するための前提：存在しないエンティティタイプ文字列を用意します。

テスト内容：エラーがスローされることを検証します。

パス・ファイル名：server/services/sequenceService.test.js

---

#### 2.2.6 承認サービス（ST-038〜042）

### ST-038

件名：listPendingApprovals — 5 種のドキュメントタイプを含む承認待ち一覧が返る

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：見積・受注・発注・請求・支払の 5 種すべての承認依頼中ドキュメントが一覧に含まれることを確認します。

実行するための前提：各ドキュメントタイプのリポジトリが承認依頼中のドキュメントを返します。

テスト内容：返却リストに 5 種すべてのドキュメントタイプが含まれることを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

### ST-039

件名：listPendingApprovals — 承認依頼中でないドキュメントは除外される

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：承認依頼中以外のドキュメントが一覧から除外されることを確認します。

実行するための前提：混在したステータスのドキュメントをリポジトリがモックします。

テスト内容：返却リストに承認依頼中以外のドキュメントが含まれないことを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

### ST-040

件名：approveDocument — QUO- プレフィックスで見積承認サービスに委譲される

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：approveDocument が QUO- プレフィックスから対象サービスを判定し見積承認処理に正しく委譲することを確認します。

実行するための前提：見積サービスの approveQuotation がモックされています。

テスト内容：approveQuotation が正しい引数で呼ばれることを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

### ST-041

件名：approveDocument — 承認後に承認履歴が保存される

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：承認操作後に承認履歴（approvalHistoryRepository.save）が記録されることを確認します。承認の証跡管理を検証します。

実行するための前提：承認履歴リポジトリのモックが設定されています。

テスト内容：approvalHistoryRepository.save が承認情報で呼ばれることを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

### ST-042

件名：rejectDocument — reason が欠落した場合に 400 エラーがスローされる

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：却下操作に理由（reason）が必須であることを確認します。理由なしの却下を防ぎます。

実行するための前提：reason を省いた引数を用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

#### 2.2.7 見積サービス（ST-043〜048）

### ST-043

件名：registerQuotation — QUO-XXXXX コードが自動生成される

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：見積登録時にシーケンスサービスから QUO-XXXXX コードが自動生成されることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却見積のコードが 'QUO-' で始まることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

### ST-044

件名：registerQuotation — タイトル欠落で 400 エラーが発生する

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：title フィールドが欠落した場合に statusCode=400 のエラーが発生することを確認します。

実行するための前提：title を省いた見積データを用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

### ST-045

件名：submitQuotationApproval — 下書き状態から承認依頼中への遷移が成功し submittedBy が保存される

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：下書き状態の見積が承認申請により「承認依頼中」に遷移し submittedBy が保存されることを確認します。

実行するための前提：リポジトリが下書き状態の見積を返します。

テスト内容：status='承認依頼中' と submittedBy がリポジトリに保存されることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

### ST-046

件名：submitQuotationApproval — 下書き以外の状態から承認申請すると 400 エラーが発生する

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：下書き以外の状態からの承認申請が 400 エラーで拒否されることを確認します。不正なステータス遷移を防ぎます。

実行するための前提：リポジトリが非下書きステータスの見積を返します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

### ST-047

件名：approveQuotation — 承認依頼中から承認済みへの遷移が成功する

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：承認依頼中の見積が承認操作により「承認済み」に遷移することを確認します。

実行するための前提：リポジトリが承認依頼中の見積を返します。

テスト内容：status='承認済み' が保存されることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

### ST-048

件名：rejectQuotation — 承認依頼中から却下への遷移が成功し理由が保存される

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：承認依頼中の見積が却下操作により「却下」に遷移し理由が保存されることを確認します。

実行するための前提：リポジトリが承認依頼中の見積を返します。

テスト内容：status='却下' と reason が保存されることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

#### 2.2.8 請求サービス（ST-049〜055）

### ST-049

件名：registerInvoice — BL-02: 税額は各明細ではなく小計合計に対して計算される

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：請求書の税額計算がビジネスルール BL-02 に従い、小計合計に対して計算されることを確認します。各明細に個別計算した場合と比べた丸め誤差の防止が目的です。

実行するための前提：単価 315 円の明細を含む請求データを用意します。

テスト内容：taxAmount が subtotal × 税率で計算されていることを検証します（315 × 0.1 → 31）。

パス・ファイル名：server/services/invoiceService.test.js

---

### ST-050

件名：registerInvoice — 複数受注の請求書で明細がマージされる

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：複数の受注から請求書を作成した場合に各受注の明細が統合されることを確認します。

実行するための前提：複数の受注データをモックします。

テスト内容：請求書の details に全受注の明細が含まれることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

### ST-051

件名：registerInvoice — トランザクション失敗時にロールバックされる

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：請求書登録処理の途中でエラーが発生した場合、トランザクションがロールバックされることを確認します。

実行するための前提：リポジトリの一部でエラーをスローするモックを設定します。

テスト内容：トランザクションロールバックが実行されることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

### ST-052

件名：approveInvoice — 承認時に監査ログ INVOICE_APPROVE が記録される

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：請求書の承認操作に対して INVOICE_APPROVE アクションの監査ログが記録されることを確認します。コンプライアンス要件のトレーサビリティを検証します。

実行するための前提：監査ログリポジトリのモックが設定されています。

テスト内容：auditLogRepository.save が action='INVOICE_APPROVE' で呼ばれることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

### ST-053

件名：listInvoiceCandidates — 締め日「末日」の場合に月末までの受注が対象になる

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：closingDay が「末日」の顧客の場合、その月の月末までに承認済みになった受注が請求候補として返ることを確認します。

実行するための前提：受注リポジトリが承認済み受注をモックします。

テスト内容：月末の期間内の承認済み受注が返ることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

### ST-054

件名：listInvoiceCandidates — 締め日「15 日」の場合に翌月 15 日までの受注が対象になる

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：closingDay が「15 日」の顧客の場合、翌月 15 日を含む期間の受注が候補として返ることを確認します。

実行するための前提：受注リポジトリが承認済み受注をモックします。

テスト内容：翌月 15 日を含む期間の承認済み受注が返ることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

### ST-055

件名：getMonthlySummary — プロジェクト別の売上・原価・利益が集計される

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：月次サマリーがプロジェクト別に売上・原価・利益を正しく集計して返すことを確認します。

実行するための前提：複数の請求データをモックします。

テスト内容：各プロジェクトの sales・cost・profit が正しい値であることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

#### 2.2.9 支払サービス（ST-056〜060）

### ST-056

件名：registerPayment — PMT-XXXXX コードが自動生成される

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：支払登録時に PMT-XXXXX 形式のコードが自動生成されることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却支払オブジェクトのコードが 'PMT-' で始まることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

### ST-057

件名：approvePayment — 承認依頼中から承認済みへの遷移が成功する

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：承認依頼中の支払が承認操作により「承認済み」に遷移することを確認します。

実行するための前提：リポジトリが承認依頼中の支払を返します。

テスト内容：status='承認済み' が保存されることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

### ST-058

件名：approvePayment — 承認依頼中以外のステータスで 400 エラーが発生する

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：承認依頼中以外の支払を承認しようとした場合に 400 エラーが発生することを確認します。

実行するための前提：リポジトリが承認依頼中以外のステータスの支払を返します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

### ST-059

件名：cancelPayment — 承認済みの支払はキャンセルできない（400 エラー）

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：承認済みの支払をキャンセルしようとした場合に 400 エラーが発生することを確認します。承認後のキャンセル禁止ルールを検証します。

実行するための前提：リポジトリが承認済みステータスの支払を返します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

### ST-060

件名：registerPaymentResult — 承認済みから支払済みへの遷移が成功する

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：承認済みの支払に実績を登録することでステータスが「支払済み」に遷移することを確認します。

実行するための前提：リポジトリが承認済みの支払を返します。

テスト内容：status='支払済み' が保存されることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

#### 2.2.10 入金サービス（ST-061〜065）

### ST-061

件名：registerReceipt — RCP-XXXXX コードが生成され初期ステータスが「未消込」になる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：入金登録時に RCP-XXXXX コードが自動生成され初期ステータスが「未消込」になることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却入金のコードが 'RCP-' で始まり status='未消込' であることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

### ST-062

件名：registerReceipt — 入金額が請求合計と一致する場合に請求が消込済みになる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：入金額が請求合計と完全一致する場合、請求書が「消込済み」に更新されることを確認します。

実行するための前提：請求リポジトリが total=5500 の請求を返し入金額も 5500 で設定します。

テスト内容：invoiceRepository.update が status='消込済み' で呼ばれることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

### ST-063

件名：registerReceipt — 入金額が請求合計より少ない場合に一部消込になる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：入金額が請求合計に満たない場合、請求書が「一部消込」に更新されることを確認します。

実行するための前提：請求合計より少ない入金額を設定します。

テスト内容：invoiceRepository.update が status='一部消込' で呼ばれることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

### ST-064

件名：registerReceipt — 手数料が入金純額から差し引かれる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：振込手数料（fee）が差し引かれた純額で消込が行われることを確認します。

実行するための前提：fee を含む入金データを用意します。

テスト内容：純額（amount - fee）が消込に使用されることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

### ST-065

件名：registerReceipt — トランザクション失敗時にロールバックされる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：入金登録後の請求書更新でエラーが発生した場合、トランザクションがロールバックされることを確認します。

実行するための前提：invoiceRepository.update でエラーをスローするモックを設定します。

テスト内容：トランザクションロールバックが実行されることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

#### 2.2.11 受注サービス（ST-066〜070）

### ST-066

件名：registerOrder — 承認済み見積からのみ受注登録できる

分類：サービステスト（server/services/orderService.test.js）

テスト意図：承認済み以外の見積から受注を作成しようとした場合に 400 エラーが発生することを確認します。承認フローが完了した見積のみが受注化できることを保証します。

実行するための前提：非承認済みの見積をリポジトリがモックします。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

### ST-067

件名：registerOrder — 見積のフィールドが受注にコピーされ ORD-XXXXX コードが生成される

分類：サービステスト（server/services/orderService.test.js）

テスト意図：受注登録時に見積の明細・金額が受注にコピーされ ORD-XXXXX コードが生成されることを確認します。

実行するための前提：承認済み見積のモックデータとシーケンスサービスが設定されています。

テスト内容：受注オブジェクトに見積の項目がコピーされ コードが 'ORD-' で始まることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

### ST-068

件名：submitOrderApproval — BL-04: 添付ファイルがない場合に 400 エラーが発生する

分類：サービステスト（server/services/orderService.test.js）

テスト意図：受注の承認申請においてビジネスルール BL-04 に従い、添付ファイルが存在しない場合に 400 エラーが発生することを確認します。受注承認には契約書類の添付が必須です。

実行するための前提：attachments が空配列の受注をリポジトリがモックします。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

### ST-069

件名：submitOrderApproval — BL-04: 受注金額が見積合計と不一致の場合に 400 エラーが発生する

分類：サービステスト（server/services/orderService.test.js）

テスト意図：受注の承認申請においてビジネスルール BL-04 に従い、受注金額が元の見積合計と不一致の場合に 400 エラーが発生することを確認します。

実行するための前提：受注 total と見積 total が異なる値のモックを設定します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

### ST-070

件名：approveOrder — 承認依頼中から承認済みへの遷移が成功する

分類：サービステスト（server/services/orderService.test.js）

テスト意図：承認依頼中の受注が承認操作により「承認済み」に遷移することを確認します。

実行するための前提：リポジトリが承認依頼中の受注を返します。

テスト内容：status='承認済み' が保存されることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

#### 2.2.12 その他サービス（ST-071〜080）

### ST-071

件名：submitPurchaseOrderApproval — 下書きから承認依頼中への遷移が成功する

分類：サービステスト（server/services/purchaseOrderService.test.js）

テスト意図：下書き状態の発注が承認申請により「承認依頼中」に遷移することを確認します。

実行するための前提：リポジトリが下書き状態の発注を返します。

テスト内容：status='承認依頼中' が保存されることを検証します。

パス・ファイル名：server/services/purchaseOrderService.test.js

---

### ST-072

件名：approvePurchaseOrder — 承認依頼中から承認済みへの遷移が成功する

分類：サービステスト（server/services/purchaseOrderService.test.js）

テスト意図：承認依頼中の発注が承認操作により「承認済み」に遷移することを確認します。

実行するための前提：リポジトリが承認依頼中の発注を返します。

テスト内容：status='承認済み' が保存されることを検証します。

パス・ファイル名：server/services/purchaseOrderService.test.js

---

### ST-073

件名：registerCustomer — CUS-NNN コードが既存コードから採番され closingDay 等が保存される

分類：サービステスト（server/services/customerService.test.js）

テスト意図：顧客コードが既存最大値から採番され、closingDay・paymentSite・billingTo が欠落せずに保存されることを確認します。

実行するための前提：顧客リポジトリが既存コードリストを返すようモックします。

テスト内容：返却顧客のコードが正しい採番値であり save に closingDay 等が渡されることを検証します。

パス・ファイル名：server/services/customerService.test.js

---

### ST-074

件名：registerCustomer — 顧客名欠落で 400 エラーが発生する

分類：サービステスト（server/services/customerService.test.js）

テスト意図：name フィールドが欠落した場合に statusCode=400 のエラーが発生することを確認します。

実行するための前提：name を省いた顧客データを用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/customerService.test.js

---

### ST-075

件名：registerProduct — PRD-NNN コードが既存コードから採番される

分類：サービステスト（server/services/productService.test.js）

テスト意図：商品コードが既存コード最大値から採番されることを確認します。

実行するための前提：商品リポジトリが既存コードリストを返すようモックします。

テスト内容：返却商品のコードが 'PRD-' で始まる正しい採番値であることを検証します。

パス・ファイル名：server/services/productService.test.js

---

### ST-076

件名：registerSupplier — SUP-NNN コードが既存コードから採番される

分類：サービステスト（server/services/supplierService.test.js）

テスト意図：仕入先コードが既存コード最大値から採番されることを確認します。

実行するための前提：仕入先リポジトリが既存コードリストを返すようモックします。

テスト内容：返却仕入先のコードが 'SUP-' で始まる正しい採番値であることを検証します。

パス・ファイル名：server/services/supplierService.test.js

---

### ST-077

件名：registerDelivery — DLV-XXXXX コードが生成され初期ステータスが「検収待ち」になる

分類：サービステスト（server/services/deliveryService.test.js）

テスト意図：納品登録時に DLV-XXXXX コードが自動生成され初期ステータスが「検収待ち」になることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却納品のコードが 'DLV-' で始まり status='検収待ち' であることを検証します。

パス・ファイル名：server/services/deliveryService.test.js

---

### ST-078

件名：registerProject — PJ-NNNNN コードが自動生成される

分類：サービステスト（server/services/projectService.test.js）

テスト意図：プロジェクト登録時に PJ-NNNNN コードが自動生成されることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却プロジェクトのコードが 'PJ-' で始まることを検証します。

パス・ファイル名：server/services/projectService.test.js

---

### ST-079

件名：registerProject — プロジェクト名欠落で 400 エラーが発生する

分類：サービステスト（server/services/projectService.test.js）

テスト意図：name フィールドが欠落した場合に statusCode=400 のエラーが発生することを確認します。

実行するための前提：name を省いたプロジェクトデータを用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/projectService.test.js

---

### ST-080

件名：getPermissionsForUserType — undefined の userType で空配列が返る

分類：サービステスト（server/services/permissionService.test.js）

テスト意図：userType が未設定の場合に空の権限配列が返ることを確認します。未知のロールに権限を付与しないことを保証します。

実行するための前提：permissionService を直接インポートします。

テスト内容：undefined を引数として空配列が返ることを検証します。

パス・ファイル名：server/services/permissionService.test.js

---


---

### 2.3 プラグインテスト（PT）

Fastifyプラグインの動作をユニットテストします。

#### 2.3.1 認可プラグイン（PT-001〜006）

### PT-001

件名：requirePermission — master:edit 権限がない場合に 403 が返る（顧客登録）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：POST /api/customers に master:edit 権限なしでアクセスした場合に 403 が返ることを確認します。マスタ登録の認可制御を検証します。

実行するための前提：master:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

### PT-002

件名：requirePermission — master:edit 権限ありの場合は通過する

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：master:edit 権限を持つユーザーがマスタ登録エンドポイントにアクセスできることを確認します。

実行するための前提：master:edit を含む JWT トークンが設定されています。

テスト内容：ステータスコードが 403 以外であることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

### PT-003

件名：requirePermission — user-permission:edit 権限がない場合に 403 が返る（ユーザー管理）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：/api/users に user-permission:edit 権限なしでアクセスした場合に 403 が返ることを確認します。

実行するための前提：user-permission:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

### PT-004

件名：requirePermission — approval:apply 権限がない場合に 403 が返る（承認申請）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：submit-approval エンドポイントに approval:apply 権限なしでアクセスした場合に 403 が返ることを確認します。

実行するための前提：approval:apply を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

### PT-005

件名：requirePermission — approval:act 権限がない場合に 403 が返る（承認・却下操作）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：approve/reject エンドポイントに approval:act 権限なしでアクセスした場合に 403 が返ることを確認します。

実行するための前提：approval:act を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

### PT-006

件名：requirePermission — payment:edit 権限がない場合に 403 が返る（支払実績登録）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：支払実績登録エンドポイントに payment:edit 権限なしでアクセスした場合に 403 が返ることを確認します。

実行するための前提：payment:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

#### 2.3.2 監査ログプラグイン（PT-007〜012, PT-027〜029）

### PT-007

件名：auditLog — POST 成功時に CREATE アクションが記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：POST リクエストが成功した場合に CREATE アクションの監査ログが記録されることを確認します。データ作成操作の証跡を担保します。

実行するための前提：監査ログリポジトリのモックが設定されています。

テスト内容：auditLogRepository.save が action='CREATE' で呼ばれることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

### PT-008

件名：auditLog — x-entity-id ヘッダーからエンティティ ID が記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：監査ログに x-entity-id ヘッダーの値が entityId として記録されることを確認します。どのレコードへの操作かを特定できることを保証します。

実行するための前提：x-entity-id ヘッダーを含むリクエストを設定します。

テスト内容：auditLogRepository.save の entityId がヘッダー値と一致することを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

### PT-009

件名：auditLog — 4xx エラー時に FAILURE 結果が記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：リクエストが 4xx エラーで失敗した場合に FAILURE 結果の監査ログが記録されることを確認します。

実行するための前提：4xx レスポンスを返すルートハンドラーがモックされています。

テスト内容：監査ログの result が 'FAILURE' であることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

### PT-010

件名：auditLog — GET リクエストには監査ログが記録されない

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：参照系の GET リクエストに対して監査ログが記録されないことを確認します。参照操作を監査対象から除外します。

実行するための前提：監査ログリポジトリのモックが設定されています。

テスト内容：GET リクエスト後に auditLogRepository.save が呼ばれないことを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

### PT-011

件名：auditLog — ログインアクションが LOGIN として記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：ログインエンドポイントの監査ログが action='LOGIN' で記録されることを確認します。

実行するための前提：config.action='LOGIN' で監査ログプラグインが設定されています。

テスト内容：監査ログの action が 'LOGIN' であることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

### PT-012

件名：auditLog — JWT からユーザー ID とユーザー名が記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：監査ログに JWT から取得したユーザー ID とユーザー名が記録されることを確認します。誰が操作したかのトレーサビリティを保証します。

実行するための前提：有効な JWT トークンが設定されています。

テスト内容：監査ログの userId と userName が JWT の値と一致することを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

### PT-027

件名：auditLog — PATCH リクエスト成功時に UPDATE アクションが記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：methodToAction が PATCH → UPDATE を返し、監査ログに UPDATE アクションが記録されることを確認します。

実行するための前提：認証済みユーザーで PATCH /api/test-entity/:id にリクエストします。

テスト内容：監査ログの action が 'UPDATE'、result が 'SUCCESS' であることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

### PT-028

件名：auditLog — DELETE リクエスト成功時に DELETE アクションが記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：methodToAction が DELETE → DELETE を返し、監査ログに DELETE アクションが記録されることを確認します。

実行するための前提：認証済みユーザーで DELETE /api/test-entity/:id にリクエストします。

テスト内容：監査ログの action が 'DELETE' であることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

### PT-029

件名：auditLog — auditLogRepository.save が失敗した場合に HTTP 500 が返る（整合性確認）

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：onSend フックで await している save が reject した場合、Fastify がエラーハンドリングに移り 500 を返すことを確認します。業務処理は実行済みだが HTTP レスポンスが変わる「整合性崩壊リスク」を文書化します。

実行するための前提：auditLogRepository.save が常に reject するモックを設定します。

テスト内容：POST /api/test-entity のレスポンスが 500 になることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

#### 2.3.3 セキュリティプラグイン（PT-013〜017）

### PT-013

件名：security — X-Content-Type-Options: nosniff ヘッダーが設定される

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：X-Content-Type-Options: nosniff が設定されることを確認します。MIME スニッフィング攻撃を防ぎます。

実行するための前提：セキュリティプラグイン（fastify/helmet）が設定済みです。

テスト内容：レスポンスに X-Content-Type-Options: nosniff ヘッダーが含まれることを検証します。

パス・ファイル名：server/plugins/security.test.js

---

### PT-014

件名：security — X-Frame-Options ヘッダーが設定される

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：クリックジャッキング対策として X-Frame-Options ヘッダーが設定されることを確認します。

実行するための前提：セキュリティプラグインが設定済みです。

テスト内容：レスポンスに X-Frame-Options ヘッダーが含まれることを検証します。

パス・ファイル名：server/plugins/security.test.js

---

### PT-015

件名：security — CSP ヘッダーが設定され default-src が 'self' である

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：CSP ヘッダーが設定され default-src が 'self' に設定されることを確認します。XSS などのコンテンツインジェクション攻撃を緩和します。

実行するための前提：セキュリティプラグインが設定済みです。

テスト内容：Content-Security-Policy ヘッダーに default-src 'self' が含まれることを検証します。

パス・ファイル名：server/plugins/security.test.js

---

### PT-016

件名：security — CORS: 許可オリジンからのリクエストが通過し、未許可オリジンが拒否される

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：CORS 設定で許可されたオリジンのリクエストが通過し、未許可オリジンのリクエストが拒否されることを確認します。

実行するための前提：許可オリジンが設定済みです。

テスト内容：許可オリジンへの Access-Control-Allow-Origin 設定と未許可オリジンの拒否を検証します。

パス・ファイル名：server/plugins/security.test.js

---

### PT-017

件名：security — レートリミット: 閾値以内は通過し、超過で 429 が返る

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：レートリミットの許容範囲内のリクエストが正常に処理され、超過したリクエストに 429 が返ることを確認します。

実行するための前提：レートリミットプラグインが設定済みです。

テスト内容：許容回数以内は 200、超過時に 429 が返ることを検証します。

パス・ファイル名：server/plugins/security.test.js

---

#### 2.3.4 CSRFプラグイン（PT-018〜023）

### PT-018

件名：csrf — 未許可オリジンからの POST で 403 とエラーメッセージが返る

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：未許可オリジンからの POST が 403 で拒否され「CSRF: リクエスト元が許可されていません」メッセージが返ることを確認します。

実行するための前提：CSRF 保護プラグインと許可オリジンが設定済みです。

テスト内容：未許可オリジンからの POST でステータス 403 と期待メッセージが返ることを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

### PT-019

件名：csrf — 許可オリジンからの POST は通過する

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：許可されたオリジンからの POST が CSRF チェックを通過することを確認します。

実行するための前提：許可オリジンを含む Origin ヘッダーが設定されています。

テスト内容：許可オリジンからの POST が 403 以外で返ることを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

### PT-020

件名：csrf — Origin ヘッダーなしのリクエストは CSRF チェックをスキップする

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：Origin ヘッダーがないリクエスト（サーバー間通信など）が CSRF でブロックされないことを確認します。

実行するための前提：Origin ヘッダーを含まないリクエストを用意します。

テスト内容：Origin なしの POST が 403 で返らないことを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

### PT-021

件名：csrf — GET リクエストは CSRF チェックされない

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：GET リクエストは CSRF 保護の対象外であることを確認します。

実行するための前提：未許可オリジンからの GET リクエストを用意します。

テスト内容：GET リクエストが 403 で返らないことを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

### PT-022

件名：csrf — PUT/PATCH/DELETE も未許可オリジンで 403 が返る

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：CSRF 保護が PUT・PATCH・DELETE にも適用されることを確認します。

実行するための前提：未許可オリジンからの各メソッドリクエストを用意します。

テスト内容：これらのメソッドで 403 が返ることを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

### PT-023

件名：csrf — allowedOrigins が未設定の場合は CSRF チェックが無効になる

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：allowedOrigins が未設定（開発環境など）の場合は CSRF チェックが動作しないことを確認します。

実行するための前提：allowedOrigins なしで CSRF プラグインを設定します。

テスト内容：未許可オリジンからの POST が 403 で返らないことを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

#### 2.3.5 スロークエリプラグイン（PT-024〜026）

### PT-024

件名：slowQuery — 閾値を超えたレスポンス時間で log.warn が発生する

分類：プラグインテスト（server/plugins/slowQuery.test.js）

テスト意図：レスポンス時間が設定閾値を超えた場合に log.warn が記録されることを確認します。パフォーマンス劣化の早期検知を担保します。

実行するための前提：threshold=0 に設定しすべてのリクエストがスロークエリ判定されるようにします。

テスト内容：log.warn が呼ばれることを検証します。

パス・ファイル名：server/plugins/slowQuery.test.js

---

### PT-025

件名：slowQuery — 閾値未満のレスポンス時間では log.warn が発生しない

分類：プラグインテスト（server/plugins/slowQuery.test.js）

テスト意図：レスポンス時間が閾値未満の場合に不要な警告ログが出ないことを確認します。

実行するための前提：threshold=Infinity に設定します。

テスト内容：log.warn が呼ばれないことを検証します。

パス・ファイル名：server/plugins/slowQuery.test.js

---

### PT-026

件名：slowQuery — 警告ログにメソッド・URL・レスポンス時間が含まれる

分類：プラグインテスト（server/plugins/slowQuery.test.js）

テスト意図：スロークエリ警告ログに method・url・responseTime が含まれ問題特定に十分な情報が提供されることを確認します。

実行するための前提：threshold=0 に設定します。

テスト内容：log.warn の引数に method・url・responseTime が含まれることを検証します。

パス・ファイル名：server/plugins/slowQuery.test.js

---


---

### 2.4 インフラテスト（IT）

インフラストラクチャコンポーネント（起動ガード・DBトランザクション・ページネーション・インデックス・バッチジョブ）のテストです。

#### 2.4.1 起動ガード（IT-001〜004）

### IT-001

件名：assertProductionSecrets — production 環境で JWT_SECRET 未設定の場合に process.exit(1) が呼ばれる

分類：インフラテスト（server/startupGuards.test.js）

テスト意図：本番環境で JWT_SECRET が未設定の場合にアプリの起動を中止することを確認します。デフォルト秘密鍵による脆弱性を防ぎます。

実行するための前提：NODE_ENV='production' かつ JWT_SECRET が未設定です。

テスト内容：process.exit(1) が呼ばれることを検証します。

パス・ファイル名：server/startupGuards.test.js

---

### IT-002

件名：assertProductionSecrets — FATAL ログに JWT_SECRET が含まれる

分類：インフラテスト（server/startupGuards.test.js）

テスト意図：起動失敗時のログメッセージに JWT_SECRET が不足していることが示されることを確認します。オペレーターが原因を素早く特定できることを保証します。

実行するための前提：NODE_ENV='production' かつ JWT_SECRET が未設定です。

テスト内容：log.fatal が 'JWT_SECRET' を含むメッセージで呼ばれることを検証します。

パス・ファイル名：server/startupGuards.test.js

---

### IT-003

件名：assertProductionSecrets — development/test 環境では process.exit が呼ばれない

分類：インフラテスト（server/startupGuards.test.js）

テスト意図：開発・テスト環境では JWT_SECRET 未設定でもアプリが起動できることを確認します。

実行するための前提：NODE_ENV='development' または 'test' に設定します。

テスト内容：process.exit が呼ばれないことを検証します。

パス・ファイル名：server/startupGuards.test.js

---

### IT-004

件名：assertProductionSecrets — production 環境で JWT_SECRET が設定済みの場合は process.exit が呼ばれない

分類：インフラテスト（server/startupGuards.test.js）

テスト意図：本番環境で JWT_SECRET が正しく設定されている場合はアプリが正常起動することを確認します。

実行するための前提：NODE_ENV='production' かつ JWT_SECRET が設定済みです。

テスト内容：process.exit が呼ばれないことを検証します。

パス・ファイル名：server/startupGuards.test.js

---

#### 2.4.2 DBトランザクション（IT-005〜008）

### IT-005

件名：withTransaction — db.transaction がある場合にトランザクション内でコールバックが実行される

分類：インフラテスト（server/db/transaction.test.js）

テスト意図：db.transaction メソッドが存在する場合、コールバックがトランザクションコンテキスト内で実行されることを確認します。

実行するための前提：db.transaction をモックします。

テスト内容：コールバックがトランザクションオブジェクト (tx) を受け取り実行されることを検証します。

パス・ファイル名：server/db/transaction.test.js

---

### IT-006

件名：withTransaction — db.transaction がない場合に db 自体がコールバックに渡される

分類：インフラテスト（server/db/transaction.test.js）

テスト意図：トランザクション未対応の DB では db 自体がコールバックに渡されることを確認します。

実行するための前提：transaction メソッドを持たない db オブジェクトを設定します。

テスト内容：コールバックが db を受け取り実行されることを検証します。

パス・ファイル名：server/db/transaction.test.js

---

### IT-007

件名：withTransaction — db が null の場合に null がコールバックに渡される

分類：インフラテスト（server/db/transaction.test.js）

テスト意図：DB が未接続（null）の場合でもコールバックが null を受け取り実行されることを確認します。

実行するための前提：db=null として設定します。

テスト内容：コールバックが null を受け取り実行されることを検証します。

パス・ファイル名：server/db/transaction.test.js

---

### IT-008

件名：withTransaction — コールバックおよびロールバックのエラーが伝播する

分類：インフラテスト（server/db/transaction.test.js）

テスト意図：コールバック内またはロールバック処理でエラーが発生した場合に withTransaction がそのエラーを伝播させることを確認します。エラーが握りつぶされないことを保証します。

実行するための前提：エラーをスローするコールバック・ロールバック関数を用意します。

テスト内容：withTransaction が同じエラーをスローすることを検証します。

パス・ファイル名：server/db/transaction.test.js

---

#### 2.4.3 ページネーション（IT-009〜011）

### IT-009

件名：buildPaginatedQuery — LIMIT/OFFSET が正しく生成され、デフォルトで page=1 limit=20 が適用される

分類：インフラテスト（server/db/paginate.test.js）

テスト意図：buildPaginatedQuery が page・limit から正しい LIMIT と OFFSET を生成し、省略時はデフォルト値（page=1, limit=20）が適用されることを確認します。

実行するための前提：page と limit のパラメーターを設定（または省略）します。

テスト内容：生成された LIMIT・OFFSET が期待値と一致することを検証します。

パス・ファイル名：server/db/paginate.test.js

---

### IT-010

件名：paginateArray — data と meta が正しい形で返り、ページ超過時に data が空になる

分類：インフラテスト（server/db/paginate.test.js）

テスト意図：paginateArray が data と total・page・pageSize・totalPages を含む meta を返し、ページ超過時は data が空配列になることを確認します。

実行するための前提：配列データと page・pageSize パラメーターを用意します。

テスト内容：返却オブジェクトの data と meta の各フィールドを検証します。

パス・ファイル名：server/db/paginate.test.js

---

### IT-011

件名：paginateArray — 空配列の場合に totalPages が 0 になる

分類：インフラテスト（server/db/paginate.test.js）

テスト意図：データが存在しない場合に totalPages=0 が返ることを確認します。ゼロ除算バグを防ぎます。

実行するための前提：空配列を入力します。

テスト内容：meta.totalPages が 0 であることを検証します。

パス・ファイル名：server/db/paginate.test.js

---

#### 2.4.4 DBインデックス（IT-012〜014）

### IT-012

件名：004_indexes.sql — BEGIN/COMMIT トランザクションと 8 つ以上のインデックスが含まれる

分類：インフラテスト（server/db/migrations/004_indexes.test.js）

テスト意図：インデックス作成マイグレーションがトランザクション内で実行され、必要な数のインデックスが定義されていることを確認します。

実行するための前提：004_indexes.sql ファイルを読み込みます。

テスト内容：BEGIN/COMMIT の存在と CREATE INDEX IF NOT EXISTS の件数が 8 以上であることを検証します。

パス・ファイル名：server/db/migrations/004_indexes.test.js

---

### IT-013

件名：004_indexes.sql — 承認依頼中の見積に部分インデックスが定義されている

分類：インフラテスト（server/db/migrations/004_indexes.test.js）

テスト意図：承認依頼中の見積のみを対象とした部分インデックス（WHERE status='承認依頼中'）が定義されていることを確認します。承認ダッシュボードの性能を担保します。

実行するための前提：004_indexes.sql ファイルを読み込みます。

テスト内容：idx_quotations_approval_pending の定義と WHERE 句が含まれることを検証します。

パス・ファイル名：server/db/migrations/004_indexes.test.js

---

### IT-014

件名：004_indexes.sql — 主要クエリパターンに対応した全インデックスが定義されている

分類：インフラテスト（server/db/migrations/004_indexes.test.js）

テスト意図：idx_quotations_status_date・idx_orders_status・idx_purchase_orders_status・idx_invoices_status_due・idx_payments_status・idx_invoices_customer・idx_payments_supplier の各インデックスが定義されていることを確認します。

実行するための前提：004_indexes.sql ファイルを読み込みます。

テスト内容：各インデックス名が SQL テキストに含まれることを検証します。

パス・ファイル名：server/db/migrations/004_indexes.test.js

---

#### 2.4.5 バッチジョブ（IT-015〜022）

### IT-015

件名：staleApprovalJob — 期限切れの見積・受注・発注・請求に N-04 通知が生成される

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：staleDays（例：3 日）を超えて承認依頼中の 4 種ドキュメント（見積・受注・発注・請求）に対して N-04（承認督促）通知が生成されることを確認します。承認の放置を防ぐビジネスルールを検証します。

実行するための前提：staleDays=3・TODAY=2026-05-05 として、submittedAt=2026-04-01 の各ドキュメントをモックします。

テスト内容：各ドキュメントタイプに対して notifyStaleApprovals が呼ばれることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

### IT-016

件名：staleApprovalJob — 承認依頼中でないドキュメントには通知が生成されない

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：承認依頼中以外のステータスのドキュメントには N-04 通知が生成されないことを確認します。

実行するための前提：承認依頼中以外のステータスのドキュメントをモックします。

テスト内容：notifyStaleApprovals が呼ばれないことを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

### IT-017

件名：staleApprovalJob — まだ期限切れでないドキュメントには通知が生成されない

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：staleDays を超えていないドキュメントには N-04 通知が生成されないことを確認します。

実行するための前提：submittedAt が staleDays 以内のドキュメントをモックします。

テスト内容：notifyStaleApprovals が呼ばれないことを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

### IT-018

件名：staleApprovalJob — 4 ドキュメントタイプ全体の件数が集計される

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：ジョブ実行結果として 4 種類全体の N-04 通知件数が集計されることを確認します。

実行するための前提：各タイプで期限切れドキュメントをモックします。

テスト内容：返却件数が 4 種の合計であることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

### IT-019

件名：staleApprovalJob — staleDays=7 設定が尊重される

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：staleDays=7 の場合に 7 日を超えたドキュメントのみが通知対象になることを確認します。設定値の変更が正しく反映されることを保証します。

実行するための前提：staleDays=7 として 6 日経過と 8 日経過のドキュメントをモックします。

テスト内容：8 日経過のドキュメントのみ通知対象になることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

### IT-020

件名：staleApprovalJob — staleDays 境界値当日（diffDays=staleDays）で通知される

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：checkOverdueApprovals は diffDays >= staleDays で判定するため、ちょうど staleDays 日目のドキュメントも通知対象になることを確認します（境界値テスト）。

実行するための前提：staleDays=3、TODAY='2026-05-05'、submittedAt='2026-05-02'（diff=3 日）のドキュメントをモックします。

テスト内容：通知件数が 1 であることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

### IT-021

件名：staleApprovalJob — staleDays 境界値-1日（diffDays=staleDays-1）で通知されない

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：diffDays が staleDays を 1 下回る場合（境界値-1）は通知対象外になることを確認します。

実行するための前提：staleDays=3、TODAY='2026-05-05'、submittedAt='2026-05-03'（diff=2 日）のドキュメントをモックします。

テスト内容：通知件数が 0 であることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

### IT-022

件名：staleApprovalJob — リポジトリ findAll が DB 接続断でエラーを throw した場合に reject される

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：Promise.all 内の findAll が reject した場合にジョブ全体がエラーを伝播することを確認します。CLAUDE.md 必須観点「DB 接続断・サーバ再起動によるジョブスキップ」に対応します。

実行するための前提：quotationRepository.findAll が Error('DB connection refused') を reject するよう設定されています。

テスト内容：job.run() が Error('DB connection refused') で reject されることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---


---

### 2.5 リポジトリテスト（ReT）

リポジトリ層のデータアクセスロジックをテストします。

#### 2.5.1 見積リポジトリ（ReT-001〜007）

### ReT-001: quotationRepository — 全見積ヘッダーの一覧取得

- **分類**: リポジトリテスト
- **テスト意図**: findAll が quotations テーブルから全ヘッダー行を返すことを確認する。
- **実行するための前提**: makeMockDb により `db.query.quotations.findMany` が `[headerRow]` を返すよう設定済み。createQuotationRepository(db) でリポジトリ生成。
- **テスト内容**: `repo.findAll()` を呼び出し、戻り値が `[headerRow]` であること、および `findMany` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/quotationRepository.test.js`

---

### ReT-002: quotationRepository — コード一致時にヘッダーと明細を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が指定コードの見積ヘッダーと明細配列を結合して返すことを確認する。
- **実行するための前提**: `db.query.quotations.findFirst` が headerRow を返し、`db.query.quotationDetails.findMany` が `[detailRow]` を返すよう設定。
- **テスト内容**: `repo.findByCode('QUO-00001')` の戻り値の `code` が `'QUO-00001'` であり、`details` が `[detailRow]` であることを検証する。
- **パス・ファイル名**: `server/repositories/quotationRepository.test.js`

---

### ReT-003: quotationRepository — コード不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在しないコードに対して null を返すことを確認する。
- **実行するための前提**: `db.query.quotations.findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: `repo.findByCode('QUO-99999')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/quotationRepository.test.js`

---

### ReT-004: quotationRepository — 全コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコード文字列のみの配列を返すことを確認する。
- **実行するための前提**: makeMockDb のデフォルト設定（findMany が `[headerRow]` を返す）。
- **テスト内容**: `repo.findAllCodes()` の戻り値に `'QUO-00001'` が含まれることを検証する。
- **パス・ファイル名**: `server/repositories/quotationRepository.test.js`

---

### ReT-005: quotationRepository — ヘッダーと明細を 2 回 insert して保存する

- **分類**: リポジトリテスト
- **テスト意図**: save がヘッダーと明細を別々に insert し（2 回呼び出し）、結合済みレコードを返すことを確認する。
- **実行するための前提**: `db.insert` を 2 回異なる戻り値で返す mock（mockReturnValueOnce）で設定。
- **テスト内容**: `repo.save({ ...headerRow, details: [{ lineNo: 1, productName: '商品A' }] })` の戻り値の `code` が `'QUO-00001'` であり、`db.insert` が 2 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/quotationRepository.test.js`

---

### ReT-006: quotationRepository — 明細が空のとき insert を 1 回だけ実行する

- **分類**: リポジトリテスト
- **テスト意図**: save に details が空配列で渡された場合、ヘッダーのみ insert し明細 insert を省略することを確認する。
- **実行するための前提**: `db.insert` は単一 mock。details を `[]` に設定した quotation を渡す。
- **テスト内容**: `repo.save({ ...headerRow, details: [] })` の戻り値の `code` が `'QUO-00001'` であり、`db.insert` が 1 回だけ呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/quotationRepository.test.js`

---

### ReT-007: quotationRepository — ヘッダーを更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が指定フィールドを set し、更新後のヘッダーを返すことを確認する。
- **実行するための前提**: `db.update` が set/where/returning のチェーンを返す mock。
- **テスト内容**: `repo.update('QUO-00001', { status: '承認依頼中' })` の戻り値の `code` が `'QUO-00001'` であり、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/quotationRepository.test.js`

---

#### 2.5.2 ユーザーリポジトリ（ReT-008〜018）

### ReT-008: userRepository.findByUsername — ユーザーが存在するとき該当ユーザーを返す

- **分類**: リポジトリテスト
- **テスト意図**: findByUsername がユーザー名に一致するユーザーオブジェクトを返すことを確認する。
- **実行するための前提**: `mockDb.query.users.findFirst` が makeUser() の値を返すよう設定。createUserRepository(mockDb) でリポジトリ生成。
- **テスト内容**: `repo.findByUsername('user01')` の戻り値が makeUser() と等しいことを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-009: userRepository.findByUsername — ユーザーが存在しないとき null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByUsername が存在しないユーザー名に対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すよう設定。
- **テスト内容**: `repo.findByUsername('unknown')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-010: userRepository.findByUsername — findFirst を 1 回だけ呼ぶ

- **分類**: リポジトリテスト
- **テスト意図**: findByUsername が DB クエリを 1 回だけ発行することを確認する（余分なクエリが発生しないこと）。
- **実行するための前提**: `findFirst` は makeUser() を返す mock。
- **テスト内容**: `repo.findByUsername('user01')` 呼び出し後、`mockDb.query.users.findFirst` が 1 回だけ呼ばれていることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-011: userRepository.findByUsername — 戻り値に id フィールドが含まれる

- **分類**: リポジトリテスト
- **テスト意図**: 認証フローで userId が利用できるよう、戻り値オブジェクトに id が含まれることを確認する。
- **実行するための前提**: `findFirst` が `{ id: 'user01', ... }` を返す mock。
- **テスト内容**: 戻り値の `id` が `'user01'` であることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-012: userRepository.findByUsername — 戻り値に passwordHash フィールドが含まれる

- **分類**: リポジトリテスト
- **テスト意図**: bcrypt 検証のために passwordHash が取得できることを確認する。
- **実行するための前提**: `findFirst` が `{ passwordHash: '$2b$10$hash', ... }` を返す mock。
- **テスト内容**: 戻り値の `passwordHash` が `'$2b$10$hash'` であることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-013: userRepository.findByUsername — 戻り値に userType フィールドが含まれる

- **分類**: リポジトリテスト
- **テスト意図**: 権限チェックで userType が参照できるよう、戻り値に userType が含まれることを確認する。
- **実行するための前提**: `findFirst` が `{ userType: '管理者', ... }` を返す mock。
- **テスト内容**: 戻り値の `userType` が `'管理者'` であることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-014: userRepository.findById — id 一致時に該当ユーザーを返す

- **分類**: リポジトリテスト
- **テスト意図**: findById が指定 id のユーザーオブジェクトを返すことを確認する。
- **実行するための前提**: `findFirst` が makeUser() を返す mock。
- **テスト内容**: `repo.findById('user01')` の戻り値が makeUser() と等しいことを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-015: userRepository.findById — id 不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findById が存在しない id に対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返す mock。
- **テスト内容**: `repo.findById('nonexistent')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-016: userRepository.findAll — 全ユーザー一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が users テーブルの全レコードを返すことを確認する。
- **実行するための前提**: `db.query.users.findMany` が `[makeUser()]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[makeUser()]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-017: userRepository.save — ユーザーを insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたレコードを返すことを確認する。
- **実行するための前提**: `db.insert` の values/returning チェーンが `[makeUser()]` を返す mock。
- **テスト内容**: `repo.save(user)` の戻り値が `makeUser()` と等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

### ReT-018: userRepository.update — ユーザーを更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を実行し、更新後のユーザーレコードを返すことを確認する。
- **実行するための前提**: `db.update` の set/where/returning チェーンが `[makeUser()]` を返す mock。
- **テスト内容**: `repo.update('user01', { name: '変更後' })` の戻り値が `makeUser()` と等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/userRepository.test.js`

---

#### 2.5.3 セッションリポジトリ（ReT-019〜022）

### ReT-019: sessionRepository — save したセッションを jti で取得できる

- **分類**: リポジトリテスト
- **テスト意図**: インメモリセッションストアへの保存と jti による検索が正しく機能することを確認する。
- **実行するための前提**: createSessionRepository() でリポジトリ生成。セッションオブジェクト `{ jti: 'abc-123', userId: 'u01', ... }` を用意。
- **テスト内容**: `repo.save(session)` 後に `repo.findByJti('abc-123')` を呼び、結果が null でなく `userId` が `'u01'` であることを検証する。
- **パス・ファイル名**: `server/repositories/sessionRepository.test.js`

---

### ReT-020: sessionRepository — 存在しない jti に対して null を返す

- **分類**: リポジトリテスト
- **テスト意図**: 未登録の jti を検索したとき null を返すことを確認する（無効なセッション検出）。
- **実行するための前提**: 空のリポジトリを用意。
- **テスト内容**: `repo.findByJti('nonexistent')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/sessionRepository.test.js`

---

### ReT-021: sessionRepository — revoke() でセッションを失効させる

- **分類**: リポジトリテスト
- **テスト意図**: revoke が対象セッションの revoked フラグを true に変更することを確認する。
- **実行するための前提**: `{ jti: 'abc-123', revoked: false }` を save した状態。
- **テスト内容**: `repo.revoke('abc-123')` 後に `findByJti` した結果の `revoked` が `true` であることを検証する。
- **パス・ファイル名**: `server/repositories/sessionRepository.test.js`

---

### ReT-022: sessionRepository — 存在しない jti を revoke してもエラーにならない

- **分類**: リポジトリテスト
- **テスト意図**: revoke が未登録の jti を渡されても例外をスローしないことを確認する（冪等性）。
- **実行するための前提**: 空のリポジトリ。
- **テスト内容**: `() => repo.revoke('nonexistent')` がスローしないことを `expect(...).not.toThrow()` で検証する。
- **パス・ファイル名**: `server/repositories/sessionRepository.test.js`

---

