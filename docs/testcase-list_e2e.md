# E2Eテストケース一覧

本ドキュメントはプロジェクト内のE2Eテストのケースを解説した一覧です。

---

## S-01 ログイン

### E2E-001
**件名**: S-01 ログイン - should navigate to dashboard when valid admin credentials are submitted
**テスト意図**: 有効な管理者資格情報でログインすると、ダッシュボードに遷移し、ユーザ名が表示されることを確認する
**前提条件**: /api/auth/me が 401、/api/auth/login が adminUser を返すようモック済み
**テスト内容**: ユーザID「admin」、パスワード「admin123」を入力してログインボタンをクリックし、.workspace と .identity-name（「中村 管理者」）と .page-title（「ダッシュボード」）が表示されることを確認する
**ファイル**: `e2e/login.spec.js`

### E2E-002
**件名**: S-01 ログイン - should display all permitted menu items for admin user after login
**テスト意図**: 管理者ユーザでログイン後、許可されたメニュー項目がすべて表示されることを確認する
**前提条件**: /api/auth/login が adminUser を返すようモック済み
**テスト内容**: ログイン後、dashboard・master・approval・report の各ナビゲーション項目が表示されていることを確認する
**ファイル**: `e2e/login.spec.js`

### E2E-003
**件名**: S-01 ログイン - should return to login screen when logout button is clicked
**テスト意図**: ログアウトボタンをクリックするとログイン画面に戻り、成功メッセージが表示されることを確認する
**前提条件**: ログイン済み状態
**テスト内容**: ログアウトボタンをクリックし、#login-form が表示され、.feedback-success に「ログアウトしました」が表示されることを確認する
**ファイル**: `e2e/login.spec.js`

### E2E-004
**件名**: S-01 ログイン - should show error message when credentials are invalid
**テスト意図**: 無効な資格情報でログインするとエラーメッセージが表示されることを確認する
**前提条件**: /api/auth/login が 401 を返すようモック済み
**テスト内容**: 誤ったパスワードでログインし、「ユーザ ID またはパスワードが正しくありません」エラーが表示されることを確認する
**ファイル**: `e2e/login.spec.js`

### E2E-005
**件名**: S-01 ログイン - should show login form on initial load before authentication
**テスト意図**: 初回ロード時（未認証）にログインフォームが表示され、ワークスペースが非表示であることを確認する
**前提条件**: /api/auth/me が 401 を返すようモック済み
**テスト内容**: ページロード後、#login-form が表示され .workspace が非表示であることを確認する
**ファイル**: `e2e/login.spec.js`


---

## S-02 ダッシュボード

### E2E-006
**件名**: S-02 ダッシュボード - should show dashboard on login
**テスト意図**: ログイン後にダッシュボードグリッドが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .dashboard-grid が表示されていることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-007
**件名**: S-02 ダッシュボード - should show 承認待ち metric card
**テスト意図**: ダッシュボードに「承認待ち」メトリクスカードが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .metrics-row に「承認待ち」が含まれることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-008
**件名**: S-02 ダッシュボード - should show 未請求 metric card
**テスト意図**: ダッシュボードに「未請求」メトリクスカードが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .metrics-row に「未請求」が含まれることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-009
**件名**: S-02 ダッシュボード - should show 未収 metric card
**テスト意図**: ダッシュボードに「未収」メトリクスカードが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .metrics-row に「未収」が含まれることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-010
**件名**: S-02 ダッシュボード - should show 未払 metric card
**テスト意図**: ダッシュボードに「未払」メトリクスカードが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .metrics-row に「未払」が含まれることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-011
**件名**: S-02 ダッシュボード - should show 承認待ち count as 02
**テスト意図**: 承認待ちカードに件数「02」が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「承認待ち」メトリクスカードの .metric-value が「02」であることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-012
**件名**: S-02 ダッシュボード - should show 未請求 count as 01
**テスト意図**: 未請求カードに件数「01」が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「未請求」メトリクスカードの .metric-value が「01」であることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-013
**件名**: S-02 ダッシュボード - should show 未収 count as 01
**テスト意図**: 未収カードに件数「01」が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「未収」メトリクスカードの .metric-value が「01」であることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-014
**件名**: S-02 ダッシュボード - should show 未払 count as 01
**テスト意図**: 未払カードに件数「01」が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「未払」メトリクスカードの .metric-value が「01」であることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-015
**件名**: S-02 ダッシュボード - should show QUO-00003 in pending approvals panel
**テスト意図**: 承認待ちパネルにシード見積「QUO-00003」が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .narrow-panel に「QUO-00003」が含まれることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-016
**件名**: S-02 ダッシュボード - should show POD-00006 in pending approvals panel
**テスト意図**: 承認待ちパネルにシード発注「POD-00006」が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .narrow-panel に「POD-00006」が含まれることを確認する
**ファイル**: `e2e/dashboard.spec.js`

### E2E-017
**件名**: S-02 ダッシュボード - should show dashboard nav item for finance01
**テスト意図**: finance01 ユーザでもダッシュボードナビゲーションが表示されることを確認する
**前提条件**: finance01 ユーザでログイン済み
**テスト内容**: finance01 でログイン後、[data-route="dashboard"] が表示されることを確認する
**ファイル**: `e2e/dashboard.spec.js`


---

## S-03 案件一覧・詳細

### E2E-018
**件名**: S-03 案件一覧・詳細 - should display project list with 5 rows
**テスト意図**: 案件一覧に5件のシードデータが表示されることを確認する
**前提条件**: 管理者ユーザでログイン、案件画面に遷移済み
**テスト内容**: .data-table-body-row が5件、.table-summary に「全 5 件中」が表示されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-019
**件名**: S-03 案件一覧・詳細 - should show customer name (not code) in project list
**テスト意図**: 案件一覧に顧客コードでなく顧客名が表示されることを確認する
**前提条件**: 管理者ユーザでログイン、案件画面に遷移済み
**テスト内容**: テーブルに「株式会社青葉システム」が含まれ、「CUS-001」が含まれないことを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-020
**件名**: S-03 案件一覧・詳細 - should filter project list when keyword is entered in search box
**テスト意図**: キーワード検索で案件一覧がフィルタリングされることを確認する
**前提条件**: 管理者ユーザでログイン、案件画面に遷移済み
**テスト内容**: 「保守」で検索すると1件のみ表示され「新規保守案件」が含まれることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-021
**件名**: S-03 案件一覧・詳細 - should filter project list by status
**テスト意図**: ステータスフィルタで案件一覧がフィルタリングされることを確認する
**前提条件**: 管理者ユーザでログイン、案件画面に遷移済み
**テスト内容**: 「進行中」を選択すると1件のみ表示されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-022
**件名**: S-03 案件一覧・詳細 - should show project detail when detail button is clicked
**テスト意図**: 詳細ボタンをクリックすると案件詳細が表示されることを確認する
**前提条件**: 管理者ユーザでログイン、案件画面に遷移済み
**テスト内容**: PJ-00001 の詳細ボタンをクリックし、タイトル「新規保守案件」と顧客名が表示されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-023
**件名**: S-03 案件一覧・詳細 - should return to list when back button is clicked on detail screen
**テスト意図**: 詳細画面の戻るボタンで一覧に戻ることを確認する
**前提条件**: PJ-00001 の詳細画面が表示されている
**テスト内容**: #project-detail-back をクリックし、.data-table が表示され .detail-grid が非表示になることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-024
**件名**: S-03 案件登録・編集 - should show new registration form when new project button is clicked
**テスト意図**: 新規案件ボタンをクリックすると登録フォームが表示されることを確認する
**前提条件**: 管理者ユーザでログイン、案件画面に遷移済み
**テスト内容**: #new-project-btn をクリックし、#project-register-form と「案件登録」タイトルが表示されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-025
**件名**: S-03 案件登録・編集 - should auto-fill project code with next sequential value when form opens
**テスト意図**: 案件登録フォームを開くと次の連番コードが自動入力されることを確認する
**前提条件**: 既存案件5件（PJ-00001〜PJ-00005）が存在
**テスト内容**: 新規ボタン押下後、#f-code に「PJ-00006」が設定されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-026
**件名**: S-03 案件登録・編集 - should show customer dropdown when typing in customer search field
**テスト意図**: 顧客検索フィールドに入力するとドロップダウンが表示されることを確認する
**前提条件**: 案件登録フォームが表示されている
**テスト内容**: 「青葉」と入力し、.customer-search-dropdown.is-open と「株式会社青葉システム」が表示されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-027
**件名**: S-03 案件登録・編集 - should select customer from dropdown and close it
**テスト意図**: ドロップダウンから顧客を選択すると入力フィールドに設定され、ドロップダウンが閉じることを確認する
**前提条件**: 案件登録フォームの顧客検索ドロップダウンが表示されている
**テスト内容**: 顧客アイテムをクリックし、入力値に「株式会社青葉システム」が設定され、ドロップダウンに is-open クラスがないことを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-028
**件名**: S-03 案件登録・編集 - should register new project and show it in list when valid form is submitted
**テスト意図**: 有効な入力で案件を登録すると一覧に追加されることを確認する
**前提条件**: 案件登録フォームが表示されている
**テスト内容**: 案件名・顧客・部門を入力して登録し、一覧に「テスト新規案件」が表示されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-029
**件名**: S-03 案件登録・編集 - should pre-fill form with existing project data when edit button is clicked
**テスト意図**: 編集ボタンをクリックすると既存データがフォームに入力されることを確認する
**前提条件**: PJ-00001 が存在する
**テスト内容**: 編集ボタン押下後、#f-code が readonly で #f-name に「新規保守案件」が設定されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-030
**件名**: S-03 案件登録・編集 - should update project and show changes in list when edit form is saved
**テスト意図**: 案件を編集して保存すると一覧に変更が反映されることを確認する
**前提条件**: PJ-00001 の編集フォームが表示されている
**テスト内容**: 案件名を「新規保守案件（改）」に変更して更新し、一覧に反映されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-031
**件名**: S-03 案件登録・編集 - should return to list when cancel button is clicked on registration form
**テスト意図**: 登録フォームでキャンセルすると一覧に戻ることを確認する
**前提条件**: 案件登録フォームが表示されている
**テスト内容**: #project-form-cancel をクリックし、.data-table が表示され #project-register-form が非表示になることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-032
**件名**: S-03 案件 権限制御 - should show project list and new-project button for sales01
**テスト意図**: sales01 ユーザに案件一覧と新規登録ボタンが表示されることを確認する
**前提条件**: sales01 でログイン
**テスト内容**: 案件一覧が表示され #new-project-btn が表示されることを確認する
**ファイル**: `e2e/project.spec.js`

### E2E-033
**件名**: S-03 案件 権限制御 - should not show project nav item for finance01 who lacks project:view
**テスト意図**: project:view 権限を持たない finance01 に案件ナビゲーションが表示されないことを確認する
**前提条件**: finance01 でログイン
**テスト内容**: [data-route="project"] が表示されないことを確認する
**ファイル**: `e2e/project.spec.js`


---

## S-09 入金登録

### 入金登録

### E2E-034
**件名**: S-09 入金登録 - should show 入金登録 button for 送付済 invoice
**テスト意図**: 送付済み請求書に入金登録ボタンが表示されることを確認する
**前提条件**: 管理者でログイン、請求一覧を表示済み
**テスト内容**: INV-00001（送付済）の詳細を開き [data-action-register-receipt="INV-00001"] が表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-035
**件名**: S-09 入金登録 - should not show 入金登録 button for 下書き invoice
**テスト意図**: 下書き請求書には入金登録ボタンが表示されないことを確認する
**前提条件**: 管理者でログイン、請求一覧を表示済み
**テスト内容**: INV-00003（下書き）の詳細を開き [data-action-register-receipt] が表示されないことを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-036
**件名**: S-09 入金登録 - should not show 入金登録 button for 入金済 invoice
**テスト意図**: 入金済み請求書には入金登録ボタンが表示されないことを確認する
**前提条件**: 管理者でログイン、請求一覧を表示済み
**テスト内容**: INV-00002（入金済）の詳細を開き [data-action-register-receipt] が表示されないことを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-037
**件名**: S-09 入金登録 - should show receipt form when 入金登録 is clicked
**テスト意図**: 入金登録ボタンをクリックすると入金登録フォームが表示されることを確認する
**前提条件**: INV-00001 詳細画面が表示されている
**テスト内容**: 入金登録ボタンをクリックし、「S-09 入金登録」パネルが表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-038
**件名**: S-09 入金登録 - should show invoice code in receipt form
**テスト意図**: 入金登録フォームに請求書コードが表示されることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: #f-rcp-invoice-code に「INV-00001」が含まれることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-039
**件名**: S-09 入金登録 - should show remaining balance in receipt form
**テスト意図**: 入金登録フォームに残高が表示されることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: #f-rcp-remaining が表示されていることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-040
**件名**: S-09 入金登録 - should show validation error when receiptDate is empty
**テスト意図**: 入金日が未入力で登録するとバリデーションエラーが表示されることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: 金額のみ入力してサブミットし、「入金日は必須です」エラーが表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-041
**件名**: S-09 入金登録 - should show validation error when amount is empty
**テスト意図**: 入金額が未入力で登録するとバリデーションエラーが表示されることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: 入金日のみ入力してサブミットし、「入金額は必須です」エラーが表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-042
**件名**: S-09 入金登録 - should register receipt and return to invoice detail
**テスト意図**: 入金を登録すると請求詳細画面に戻ることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: 入金日と金額（528000）を入力して登録し、「S-08 請求詳細」パネルが表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-043
**件名**: S-09 入金登録 - should update invoice status to 入金済 when fully paid
**テスト意図**: 全額入金すると請求書ステータスが「入金済」になることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: 528000円で入金登録し、.status-badge が「入金済」になることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-044
**件名**: S-09 入金登録 - should update invoice status to 一部入金 when partially paid
**テスト意図**: 一部入金すると請求書ステータスが「一部入金」になることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: 100000円で入金登録し、.status-badge が「一部入金」になることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-045
**件名**: S-09 入金登録 - should show receipt in 入金履歴 after registration
**テスト意図**: 入金登録後に入金履歴セクションが表示されることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: 入金登録後、「入金履歴」セクションと [data-receipt-code] が表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-046
**件名**: S-09 入金登録 - should return to invoice detail when cancel is clicked
**テスト意図**: 入金登録フォームでキャンセルすると請求詳細に戻ることを確認する
**前提条件**: INV-00001 の入金登録フォームが表示されている
**テスト内容**: #receipt-form-cancel をクリックし、「S-08 請求詳細」パネルが表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`


### 入金一覧

### E2E-047
**件名**: S-09 入金一覧 - should show receipt list from navigation
**テスト意図**: ナビゲーションから入金一覧画面に遷移できることを確認する
**前提条件**: 管理者でログイン
**テスト内容**: [data-route="receipt"] をクリックし .data-table が表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-048
**件名**: S-09 入金一覧 - should show receipt code in list
**テスト意図**: 入金一覧に入金コードが表示されることを確認する
**前提条件**: 入金一覧を表示済み
**テスト内容**: テーブルに「RCP-00001」が含まれることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-049
**件名**: S-09 入金一覧 - should show invoice code in list
**テスト意図**: 入金一覧に請求コードが表示されることを確認する
**前提条件**: 入金一覧を表示済み
**テスト内容**: テーブルに「INV-00002」が含まれることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-050
**件名**: S-09 入金一覧 - should show customer code in list
**テスト意図**: 入金一覧に顧客コードが表示されることを確認する
**前提条件**: 入金一覧を表示済み
**テスト内容**: テーブルに「CUS-002」が含まれることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-051
**件名**: S-09 入金一覧 - should show customer name in list
**テスト意図**: 入金一覧に顧客名が表示されることを確認する
**前提条件**: 入金一覧を表示済み
**テスト内容**: テーブルに「東都ネットワーク株式会社」が含まれることを確認する
**ファイル**: `e2e/receipt.spec.js`

### E2E-052
**件名**: S-09 入金一覧 - should show receipt for finance01 who has receipt:view
**テスト意図**: receipt:view 権限を持つ finance01 に入金ナビゲーションが表示されることを確認する
**前提条件**: finance01 でログイン
**テスト内容**: [data-route="receipt"] が表示されることを確認する
**ファイル**: `e2e/receipt.spec.js`


---

## S-10 支払依頼

### 支払依頼作成

### E2E-053
**件名**: S-10 支払依頼作成 - should show 支払依頼作成 button for user with payment:edit
**テスト意図**: payment:edit 権限を持つユーザに「支払依頼作成」ボタンが表示されることを確認する
**前提条件**: finance01 でログイン、支払画面に遷移済み
**テスト内容**: #payment-create-btn が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-054
**件名**: S-10 支払依頼作成 - should show payable purchase orders when 支払依頼作成 is clicked
**テスト意図**: 支払依頼作成ボタンをクリックすると支払対象抽出画面が表示されることを確認する
**前提条件**: finance01 でログイン、支払画面に遷移済み
**テスト内容**: #payment-create-btn をクリックし、「S-10 支払対象」パネルが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-055
**件名**: S-10 支払依頼作成 - should show payable PO in extraction list
**テスト意図**: 支払対象一覧に支払可能な発注書（POD-00005）が表示されることを確認する
**前提条件**: 支払対象抽出画面が表示されている
**テスト内容**: .detail-table に「POD-00005」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-056
**件名**: S-10 支払依頼作成 - should show payment form when 依頼作成 is clicked
**テスト意図**: 依頼作成ボタンをクリックすると支払依頼登録フォームが表示されることを確認する
**前提条件**: 支払対象抽出画面が表示されている
**テスト内容**: POD-00005 の依頼作成ボタンをクリックし、「S-10 支払依頼登録」パネルが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-057
**件名**: S-10 支払依頼作成 - should show purchase order code in payment form
**テスト意図**: 支払依頼登録フォームに発注コードが表示されることを確認する
**前提条件**: 支払依頼登録フォームが表示されている
**テスト内容**: #f-pmt-po-code に「POD-00005」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-058
**件名**: S-10 支払依頼作成 - should show default amount from purchase order in form
**テスト意図**: 支払依頼フォームに発注書からの金額（1100000）が自動入力されることを確認する
**前提条件**: 支払依頼登録フォームが表示されている
**テスト内容**: #f-pmt-amount の値が「1100000」であることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-059
**件名**: S-10 支払依頼作成 - should show validation error when paymentDate is empty
**テスト意図**: 支払予定日が未入力でサブミットするとバリデーションエラーが表示されることを確認する
**前提条件**: 支払依頼登録フォームが表示されている
**テスト内容**: 日付未入力でサブミットし、「支払予定日は必須です」エラーが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-060
**件名**: S-10 支払依頼作成 - should show validation error when amount is empty
**テスト意図**: 支払金額が空でサブミットするとバリデーションエラーが表示されることを確認する
**前提条件**: 支払依頼登録フォームが表示されている
**テスト内容**: 金額をクリアしてサブミットし、「支払金額は必須です」エラーが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-061
**件名**: S-10 支払依頼作成 - should create payment and return to list
**テスト意図**: 有効な入力で支払依頼を作成すると一覧に戻ることを確認する
**前提条件**: 支払依頼登録フォームが表示されている
**テスト内容**: 支払予定日を入力して登録し、.data-table が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-062
**件名**: S-10 支払依頼作成 - should show new payment code in list after creation
**テスト意図**: 支払依頼作成後、新しい支払コード（PMT-00003）が一覧に表示されることを確認する
**前提条件**: 支払依頼登録フォームが表示されている
**テスト内容**: 登録後、テーブルに「PMT-00003」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-063
**件名**: S-10 支払依頼作成 - should not show paid PO in payable list
**テスト意図**: 支払済み発注書が支払対象一覧に表示されないことを確認する
**前提条件**: 支払対象抽出画面が表示されている
**テスト内容**: .detail-table に「POD-00003」が含まれないことを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-064
**件名**: S-10 支払依頼作成 - should return to payable list when cancel is clicked
**テスト意図**: 支払依頼登録フォームでキャンセルすると支払対象一覧に戻ることを確認する
**前提条件**: 支払依頼登録フォームが表示されている
**テスト内容**: #payment-form-cancel をクリックし、「S-10 支払対象」パネルが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-065
**件名**: S-10 支払依頼作成 - should return to payment list when 一覧に戻る is clicked
**テスト意図**: 支払対象画面で「一覧に戻る」をクリックすると支払一覧に戻ることを確認する
**前提条件**: 支払対象抽出画面が表示されている
**テスト内容**: #payment-back-to-list をクリックし、.data-table が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`


### 支払依頼一覧

### E2E-066
**件名**: S-10 支払依頼一覧 - should show payment list from navigation
**テスト意図**: ナビゲーションから支払一覧が表示されることを確認する
**前提条件**: 管理者でログイン
**テスト内容**: .data-table が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-067
**件名**: S-10 支払依頼一覧 - should show payment code in list
**テスト意図**: 支払一覧に支払コードが表示されることを確認する
**前提条件**: 支払一覧を表示済み
**テスト内容**: テーブルに「PMT-00001」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-068
**件名**: S-10 支払依頼一覧 - should show purchase order code in list
**テスト意図**: 支払一覧に発注コードが表示されることを確認する
**前提条件**: 支払一覧を表示済み
**テスト内容**: テーブルに「POD-00003」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-069
**件名**: S-10 支払依頼一覧 - should show supplier name in list
**テスト意図**: 支払一覧に仕入先名が表示されることを確認する
**前提条件**: 支払一覧を表示済み
**テスト内容**: テーブルに「アジア部品サプライ株式会社」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-070
**件名**: S-10 支払依頼一覧 - should show payment status badge in list
**テスト意図**: 支払一覧にステータスバッジが表示されることを確認する
**前提条件**: 支払一覧を表示済み
**テスト内容**: 「支払済」ステータスバッジが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-071
**件名**: S-10 支払依頼一覧 - should filter by status
**テスト意図**: ステータスフィルタで支払一覧がフィルタリングされることを確認する
**前提条件**: 支払一覧を表示済み
**テスト内容**: 「下書き」でフィルタし、「支払依頼データがありません」が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-072
**件名**: S-10 支払依頼一覧 - should show payment list for finance01 who has payment:view
**テスト意図**: payment:view 権限を持つ finance01 に支払ナビゲーションが表示されることを確認する
**前提条件**: finance01 でログイン
**テスト内容**: [data-route="payment"] が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`


### 支払承認

### E2E-073
**件名**: S-10 支払承認 - should show 詳細 button in payment list
**テスト意図**: 支払一覧に詳細ボタンが表示されることを確認する
**前提条件**: 管理者でログイン、支払一覧を表示済み
**テスト内容**: [data-action-detail-payment="PMT-00001"] が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-074
**件名**: S-10 支払承認 - should show payment detail when 詳細 is clicked
**テスト意図**: 詳細ボタンをクリックすると支払詳細画面が表示されることを確認する
**前提条件**: 支払一覧を表示済み
**テスト内容**: PMT-00001 の詳細をクリックし、「S-10 支払依頼詳細」パネルが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-075
**件名**: S-10 支払承認 - should show payment code in detail
**テスト意図**: 支払詳細に支払コードが表示されることを確認する
**前提条件**: PMT-00001 詳細画面を表示済み
**テスト内容**: .detail-grid に「PMT-00001」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-076
**件名**: S-10 支払承認 - should show status badge in detail
**テスト意図**: 支払詳細にステータスバッジが表示されることを確認する
**前提条件**: PMT-00001 詳細画面を表示済み
**テスト内容**: .status-badge が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-077
**件名**: S-10 支払承認 - should show 承認依頼 button for 下書き payment with payment:edit
**テスト意図**: 下書き支払依頼に承認依頼ボタンが表示されることを確認する
**前提条件**: PMT-00003（下書き）の詳細画面が表示されている
**テスト内容**: [data-action-payment-status="承認待ち"] が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-078
**件名**: S-10 支払承認 - should update status to 承認待ち when 承認依頼 is clicked
**テスト意図**: 承認依頼ボタンをクリックするとステータスが「承認待ち」になることを確認する
**前提条件**: PMT-00003（下書き）の詳細画面が表示されている
**テスト内容**: 承認依頼ボタンをクリックし、.status-badge が「承認待ち」になることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-079
**件名**: S-10 支払承認 - should show 承認 button for 承認待ち payment with approval:act
**テスト意図**: 承認待ち支払依頼に承認ボタンが表示されることを確認する
**前提条件**: PMT-00003 が承認待ちになっている
**テスト内容**: #payment-approve-btn が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-080
**件名**: S-10 支払承認 - should update status to 承認済 when 承認 is clicked
**テスト意図**: 承認ボタンをクリックして確認するとステータスが「承認済」になることを確認する
**前提条件**: PMT-00003 が承認待ち状態
**テスト内容**: 承認ボタンをクリックして確認し、詳細を再度開いてステータスが「承認済」であることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-081
**件名**: S-10 支払承認 - should update status to 却下 when 却下 is clicked
**テスト意図**: 却下ボタンをクリックしてコメント入力後に確認するとステータスが「却下」になることを確認する
**前提条件**: PMT-00003 が承認待ち状態
**テスト内容**: 却下ボタンをクリックしてコメントを入力し確認後、詳細を再度開いてステータスが「却下」であることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-082
**件名**: S-10 支払承認 - should return to payment list when 一覧に戻る is clicked from detail
**テスト意図**: 詳細画面で「一覧に戻る」をクリックすると支払一覧に戻ることを確認する
**前提条件**: PMT-00001 詳細画面が表示されている
**テスト内容**: #payment-detail-back をクリックし、.data-table が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`


### 支払登録

### E2E-083
**件名**: S-10 支払登録 - should show 支払登録 button for 承認済 payment
**テスト意図**: 承認済み支払依頼に支払登録ボタンが表示されることを確認する
**前提条件**: PMT-00003 が承認済み状態
**テスト内容**: #payment-register-btn が表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-084
**件名**: S-10 支払登録 - should show payment registration form when 支払登録 is clicked
**テスト意図**: 支払登録ボタンをクリックすると支払登録フォームが表示されることを確認する
**前提条件**: PMT-00003 が承認済み状態
**テスト内容**: #payment-register-btn をクリックし、「S-10 支払登録」パネルが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-085
**件名**: S-10 支払登録 - should show payment code in registration form
**テスト意図**: 支払登録フォームに支払コードが表示されることを確認する
**前提条件**: 支払登録フォームが表示されている
**テスト内容**: #f-pmte-code に「PMT-00003」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-086
**件名**: S-10 支払登録 - should prefill amount from payment request
**テスト意図**: 支払登録フォームに支払依頼からの金額が自動入力されることを確認する
**前提条件**: 支払登録フォームが表示されている
**テスト内容**: #f-pmte-amount の値が「1100000」であることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-087
**件名**: S-10 支払登録 - should show validation error when paidDate is empty
**テスト意図**: 支払日が未入力でサブミットするとバリデーションエラーが表示されることを確認する
**前提条件**: 支払登録フォームが表示されている
**テスト内容**: 日付未入力でサブミットし、「支払日は必須です」エラーが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-088
**件名**: S-10 支払登録 - should update status to 支払済 after registration
**テスト意図**: 支払登録後にステータスが「支払済」になることを確認する
**前提条件**: 支払登録フォームが表示されている
**テスト内容**: 支払日を入力して登録し、.status-badge が「支払済」になることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-089
**件名**: S-10 支払登録 - should return to detail after registration
**テスト意図**: 支払登録後に支払詳細画面に戻ることを確認する
**前提条件**: 支払登録フォームが表示されている
**テスト内容**: 支払日を入力して登録し、「S-10 支払依頼詳細」パネルが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-090
**件名**: S-10 支払登録 - should not show 支払登録 button after payment is registered
**テスト意図**: 支払登録後に支払登録ボタンが消えることを確認する
**前提条件**: 支払登録フォームが表示されている
**テスト内容**: 支払日を入力して登録後、#payment-register-btn が表示されないことを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-091
**件名**: S-10 支払登録 - should return to detail when cancel is clicked
**テスト意図**: 支払登録フォームでキャンセルすると支払詳細に戻ることを確認する
**前提条件**: 支払登録フォームが表示されている
**テスト内容**: #payment-exec-cancel をクリックし、「S-10 支払依頼詳細」パネルが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`


### P10-RT-01 支払却下フロー

### E2E-092
**件名**: P10-RT-01 支払却下フロー - should show 却下 status in payment detail after rejection
**テスト意図**: 支払依頼を却下するとステータスが「却下」になることを確認する
**前提条件**: PMT-00003 が承認待ち状態
**テスト内容**: 却下ボタンでコメントを入力して確認し、詳細画面で「却下」ステータスが表示されることを確認する
**ファイル**: `e2e/payment.spec.js`

### E2E-093
**件名**: P10-RT-01 支払却下フロー - should show 却下 status in payment list after rejection
**テスト意図**: 支払依頼を却下すると一覧にも「却下」ステータスが表示されることを確認する
**前提条件**: PMT-00003 が承認待ち状態
**テスト内容**: 却下後、一覧で PMT-00003 の行に「却下」が含まれることを確認する
**ファイル**: `e2e/payment.spec.js`


---

## S-11 顧客マスタ

### E2E-094
**件名**: S-11 顧客マスタ - should display all 9 customers when default page size is 20
**テスト意図**: デフォルトページサイズ20件設定で9件の顧客が全件表示されることを確認する
**前提条件**: 管理者でログイン、マスタ管理画面に遷移済み
**テスト内容**: .data-table-body-row が9件、.table-summary に「全 9 件中」が含まれることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-095
**件名**: S-11 顧客マスタ - should filter customer list when keyword is entered in search box
**テスト意図**: キーワード検索で顧客一覧がフィルタリングされることを確認する
**前提条件**: 顧客マスタ一覧を表示済み
**テスト内容**: 「青葉」で検索すると1件のみ表示され「株式会社青葉システム」が含まれることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-096
**件名**: S-11 顧客マスタ - should show new registration form when new customer button is clicked
**テスト意図**: 顧客登録ボタンをクリックすると登録フォームが表示されることを確認する
**前提条件**: 顧客マスタ一覧を表示済み
**テスト内容**: #new-customer-btn をクリックし #customer-register-form と「顧客マスタ登録」タイトルが表示されることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-097
**件名**: S-11 顧客マスタ - should auto-fill customer code with next sequential value when form opens
**テスト意図**: 顧客登録フォームを開くと次の連番コード（CUS-010）が自動入力されることを確認する
**前提条件**: CUS-001〜CUS-009 が存在
**テスト内容**: 登録フォームを開き #f-code に「CUS-010」が設定されることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-098
**件名**: S-11 顧客マスタ - should register new customer and show it in list when valid form is submitted
**テスト意図**: 有効な入力で顧客を登録すると一覧に表示されることを確認する
**前提条件**: 顧客登録フォームが表示されている
**テスト内容**: 必須フィールドをすべて入力して登録し、一覧に「テスト株式会社」が表示されることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-099
**件名**: S-11 顧客マスタ - should show edit button per row for admin user
**テスト意図**: 管理者ユーザには各行に編集ボタンが表示されることを確認する
**前提条件**: 顧客マスタ一覧を表示済み
**テスト内容**: [data-action-edit] の最初の要素が表示されることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-100
**件名**: S-11 顧客マスタ - should pre-fill form with existing customer data when edit button is clicked
**テスト意図**: 編集ボタンをクリックすると既存データがフォームに入力されることを確認する
**前提条件**: 顧客マスタ一覧を表示済み
**テスト内容**: 1行目の編集ボタン押下後、#f-code が readonly で #f-name が空でないことを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-101
**件名**: S-11 顧客マスタ - should update customer and show changes in list when edit form is saved
**テスト意図**: 顧客を編集して保存すると一覧に変更が反映されることを確認する
**前提条件**: CUS-001 の編集フォームが表示されている
**テスト内容**: 顧客名を変更して更新し、一覧に「株式会社青葉システム（改）」が表示されることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-102
**件名**: S-11 顧客マスタ - should return to list when cancel button is clicked on registration form
**テスト意図**: 登録フォームでキャンセルすると一覧に戻ることを確認する
**前提条件**: 顧客登録フォームが表示されている
**テスト内容**: #customer-form-cancel をクリックし、.data-table が表示され登録フォームが非表示になることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-103
**件名**: P10-RT-02 顧客マスタ バリデーション - should show 顧客名は必須です error when name is empty on submit
**テスト意図**: 顧客名が未入力で登録するとバリデーションエラーが表示されることを確認する
**前提条件**: 顧客登録フォームが表示されている
**テスト内容**: 顧客名以外の必須項目を入力してサブミットし、「顧客名は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-104
**件名**: P10-RT-02 顧客マスタ バリデーション - should show multiple field errors when all required fields are empty on submit
**テスト意図**: すべての必須フィールドが未入力でサブミットすると複数のエラーが表示されることを確認する
**前提条件**: 顧客登録フォームが表示されている（全フィールドデフォルト）
**テスト内容**: 何も入力せずサブミットし、「顧客名は必須です。」と「主管部門は必須です。」の両エラーが表示されることを確認する
**ファイル**: `e2e/customer-master.spec.js`

### E2E-105
**件名**: P10-RT-02 顧客マスタ バリデーション - should show 顧客コードはすでに使用されています error when duplicate code is entered
**テスト意図**: 既存コード（CUS-001）を入力して登録するとコード重複エラーが表示されることを確認する
**前提条件**: 顧客登録フォームが表示されている
**テスト内容**: コードを「CUS-001」に変更して登録し、「顧客コードはすでに使用されています。」エラーが表示されることを確認する
**ファイル**: `e2e/customer-master.spec.js`


---

## S-11 仕入先マスタ

### E2E-106
**件名**: S-11 仕入先マスタ - should display supplier list with 5 rows on supplier tab
**テスト意図**: 仕入先タブに5件のシードデータが表示されることを確認する
**前提条件**: 管理者でログイン、マスタ管理→仕入先タブに遷移済み
**テスト内容**: .data-table-body-row が5件、.table-summary に「全 5 件中」が含まれることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-107
**件名**: S-11 仕入先マスタ - should filter supplier list when keyword is entered in search box
**テスト意図**: キーワード検索で仕入先一覧がフィルタリングされることを確認する
**前提条件**: 仕入先マスタ一覧を表示済み
**テスト内容**: 「日本テクノロジー」で検索すると1件のみ表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-108
**件名**: S-11 仕入先マスタ - should switch between customer and supplier tabs
**テスト意図**: 顧客タブと仕入先タブを切り替えられることを確認する
**前提条件**: 仕入先タブがアクティブ
**テスト内容**: 顧客タブをクリックし顧客一覧が表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-109
**件名**: S-11 仕入先マスタ - should show new registration form when new supplier button is clicked
**テスト意図**: 仕入先登録ボタンをクリックすると登録フォームが表示されることを確認する
**前提条件**: 仕入先マスタ一覧を表示済み
**テスト内容**: #new-supplier-btn をクリックし、#supplier-register-form と「仕入先マスタ登録」タイトルが表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-110
**件名**: S-11 仕入先マスタ - should auto-fill supplier code with next sequential value when form opens
**テスト意図**: 仕入先登録フォームを開くと次の連番コード（SUP-006）が自動入力されることを確認する
**前提条件**: SUP-001〜SUP-005 が存在
**テスト内容**: 登録フォームを開き #f-code に「SUP-006」が設定されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-111
**件名**: S-11 仕入先マスタ - should register new supplier and show it in list when valid form is submitted
**テスト意図**: 有効な入力で仕入先を登録すると一覧に表示されることを確認する
**前提条件**: 仕入先登録フォームが表示されている
**テスト内容**: 必須フィールドをすべて入力して登録し、一覧に「テスト仕入先株式会社」が表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-112
**件名**: S-11 仕入先マスタ - should show edit button per row for admin user
**テスト意図**: 管理者ユーザには各行に編集ボタンが表示されることを確認する
**前提条件**: 仕入先マスタ一覧を表示済み
**テスト内容**: [data-action-edit-supplier] の最初の要素が表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-113
**件名**: S-11 仕入先マスタ - should pre-fill form with existing supplier data when edit button is clicked
**テスト意図**: 編集ボタンをクリックすると既存データがフォームに入力されることを確認する
**前提条件**: 仕入先マスタ一覧を表示済み
**テスト内容**: 1行目の編集ボタン押下後、#f-code が readonly で #f-name が空でないことを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-114
**件名**: S-11 仕入先マスタ - should update supplier and show changes in list when edit form is saved
**テスト意図**: 仕入先を編集して保存すると一覧に変更が反映されることを確認する
**前提条件**: SUP-001 の編集フォームが表示されている
**テスト内容**: 仕入先名を変更して更新し、一覧に「株式会社日本テクノロジー（改）」が表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-115
**件名**: S-11 仕入先マスタ - should return to list when cancel button is clicked on registration form
**テスト意図**: 登録フォームでキャンセルすると一覧に戻ることを確認する
**前提条件**: 仕入先登録フォームが表示されている
**テスト内容**: #supplier-form-cancel をクリックし、.data-table が表示され登録フォームが非表示になることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-116
**件名**: P10-RT-02 仕入先マスタ バリデーション - should show 仕入先名は必須です error when name is empty on submit
**テスト意図**: 仕入先名が未入力で登録するとバリデーションエラーが表示されることを確認する
**前提条件**: 仕入先登録フォームが表示されている
**テスト内容**: 支払サイトのみ入力してサブミットし、「仕入先名は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-117
**件名**: P10-RT-02 仕入先マスタ バリデーション - should show multiple field errors simultaneously when all required fields are empty on submit
**テスト意図**: すべての必須フィールドが未入力でサブミットすると複数のエラーが同時に表示されることを確認する
**前提条件**: 仕入先登録フォームが表示されている（全フィールドデフォルト）
**テスト内容**: 何も入力せずサブミットし、「仕入先名は必須です。」と「支払サイトは必須です。」の両エラーが表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-118
**件名**: P10-RT-02 仕入先マスタ バリデーション - should show 仕入先コードはすでに使用されています error when duplicate code is entered
**テスト意図**: 既存コード（SUP-001）を入力して登録するとコード重複エラーが表示されることを確認する
**前提条件**: 仕入先登録フォームが表示されている
**テスト内容**: コードを「SUP-001」に変更して登録し、「仕入先コードはすでに使用されています。」エラーが表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-119
**件名**: S-11 仕入先マスタ 権限制御 - should show supplier list for sales01 user on supplier tab
**テスト意図**: sales01 ユーザが仕入先タブで一覧を参照できることを確認する
**前提条件**: sales01 でログイン
**テスト内容**: 仕入先タブをクリックし .data-table が表示されることを確認する
**ファイル**: `e2e/supplier-master.spec.js`

### E2E-120
**件名**: S-11 仕入先マスタ 権限制御 - should not show edit button or new registration button for sales01 user on supplier tab
**テスト意図**: master:edit 権限がない sales01 には新規登録・編集ボタンが表示されないことを確認する
**前提条件**: sales01 でログイン、仕入先タブを表示済み
**テスト内容**: #new-supplier-btn が非表示で [data-action-edit-supplier] が0件であることを確認する
**ファイル**: `e2e/supplier-master.spec.js`


---

## S-11 商品マスタ

### E2E-121
**件名**: S-11 商品マスタ - should display product list with 5 rows on product tab
**テスト意図**: 商品タブに5件のシードデータが表示されることを確認する
**前提条件**: 管理者でログイン、マスタ管理→商品タブに遷移済み
**テスト内容**: .data-table-body-row が5件、.table-summary に「全 5 件中」が含まれることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-122
**件名**: S-11 商品マスタ - should filter product list when keyword is entered in search box
**テスト意図**: キーワード検索で商品一覧がフィルタリングされることを確認する
**前提条件**: 商品マスタ一覧を表示済み
**テスト内容**: 「サーバー」で検索すると1件のみ表示されることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-123
**件名**: S-11 商品マスタ - should show new registration form when new product button is clicked
**テスト意図**: 商品登録ボタンをクリックすると登録フォームが表示されることを確認する
**前提条件**: 商品マスタ一覧を表示済み
**テスト内容**: #new-product-btn をクリックし #product-register-form と「商品マスタ登録」タイトルが表示されることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-124
**件名**: S-11 商品マスタ - should auto-fill product code with next sequential value when form opens
**テスト意図**: 商品登録フォームを開くと次の連番コード（PRD-006）が自動入力されることを確認する
**前提条件**: PRD-001〜PRD-005 が存在
**テスト内容**: 登録フォームを開き #f-code に「PRD-006」が設定されることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-125
**件名**: S-11 商品マスタ - should register new product and show it in list when valid form is submitted
**テスト意図**: 有効な入力で商品を登録すると一覧に表示されることを確認する
**前提条件**: 商品登録フォームが表示されている
**テスト内容**: 必須フィールドをすべて入力して登録し、一覧に「テスト商品サービス」が表示されることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-126
**件名**: S-11 商品マスタ - should show edit button per row for admin user
**テスト意図**: 管理者ユーザには各行に編集ボタンが表示されることを確認する
**前提条件**: 商品マスタ一覧を表示済み
**テスト内容**: [data-action-edit-product] の最初の要素が表示されることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-127
**件名**: S-11 商品マスタ - should pre-fill form with existing product data when edit button is clicked
**テスト意図**: 編集ボタンをクリックすると既存データがフォームに入力されることを確認する
**前提条件**: 商品マスタ一覧を表示済み
**テスト内容**: 1行目の編集ボタン押下後、#f-code が readonly で #f-name が空でないことを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-128
**件名**: S-11 商品マスタ - should update product and show changes in list when edit form is saved
**テスト意図**: 商品を編集して保存すると一覧に変更が反映されることを確認する
**前提条件**: PRD-001 の編集フォームが表示されている
**テスト内容**: 商品名を変更して更新し、一覧に「サーバー保守サービス（改）」が表示されることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-129
**件名**: S-11 商品マスタ - should return to list when cancel button is clicked on registration form
**テスト意図**: 登録フォームでキャンセルすると一覧に戻ることを確認する
**前提条件**: 商品登録フォームが表示されている
**テスト内容**: #product-form-cancel をクリックし、.data-table が表示され登録フォームが非表示になることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-130
**件名**: S-11 商品マスタ - should show all three tabs on master screen
**テスト意図**: マスタ管理画面に3つのタブが表示されることを確認する
**前提条件**: 商品タブを表示済み
**テスト内容**: customer・supplier・product の各タブが表示されることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-131
**件名**: S-11 商品マスタ 権限制御 - should show product list for sales01 user on product tab
**テスト意図**: sales01 ユーザが商品タブで一覧を参照できることを確認する
**前提条件**: sales01 でログイン
**テスト内容**: 商品タブをクリックし .data-table が表示されることを確認する
**ファイル**: `e2e/product-master.spec.js`

### E2E-132
**件名**: S-11 商品マスタ 権限制御 - should not show edit button or new registration button for sales01 user on product tab
**テスト意図**: master:edit 権限がない sales01 には新規登録・編集ボタンが表示されないことを確認する
**前提条件**: sales01 でログイン、商品タブを表示済み
**テスト内容**: #new-product-btn が非表示で [data-action-edit-product] が0件であることを確認する
**ファイル**: `e2e/product-master.spec.js`


---

## S-11 ユーザ管理

### E2E-133
**件名**: S-11 ユーザ管理 - should display user list with 3 rows on user tab
**テスト意図**: ユーザタブに3件のシードデータが表示されることを確認する
**前提条件**: 管理者でログイン、マスタ管理→ユーザタブに遷移済み
**テスト内容**: .data-table-body-row が3件、.table-summary に「全 3 件中」が含まれることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-134
**件名**: S-11 ユーザ管理 - should filter user list when keyword is entered in search box
**テスト意図**: キーワード検索でユーザ一覧がフィルタリングされることを確認する
**前提条件**: ユーザ管理一覧を表示済み
**テスト内容**: 「佐藤」で検索すると1件のみ表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-135
**件名**: S-11 ユーザ管理 - should show new registration form when new user button is clicked
**テスト意図**: ユーザ登録ボタンをクリックすると登録フォームが表示されることを確認する
**前提条件**: ユーザ管理一覧を表示済み
**テスト内容**: #new-user-btn をクリックし #user-register-form と「ユーザ登録」タイトルが表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-136
**件名**: S-11 ユーザ管理 - should register new user and show it in list when valid form is submitted
**テスト意図**: 有効な入力でユーザを登録すると一覧に表示されることを確認する
**前提条件**: ユーザ登録フォームが表示されている
**テスト内容**: 必須フィールドをすべて入力して登録し、一覧に「山田 新規」が表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-137
**件名**: S-11 ユーザ管理 - should show edit button per row for admin user
**テスト意図**: 管理者ユーザには各行に編集ボタンが表示されることを確認する
**前提条件**: ユーザ管理一覧を表示済み
**テスト内容**: [data-action-edit-user] の最初の要素が表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-138
**件名**: S-11 ユーザ管理 - should pre-fill form with existing user data when edit button is clicked
**テスト意図**: 編集ボタンをクリックすると既存データがフォームに入力されることを確認する
**前提条件**: ユーザ管理一覧を表示済み
**テスト内容**: sales01 の編集ボタン押下後、#f-user-id が readonly で #f-user-name に「佐藤 営業」が設定されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-139
**件名**: S-11 ユーザ管理 - should update user and show changes in list when edit form is saved
**テスト意図**: ユーザを編集して保存すると一覧に変更が反映されることを確認する
**前提条件**: sales01 の編集フォームが表示されている
**テスト内容**: 氏名を変更して更新し、一覧に「佐藤 営業（改）」が表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-140
**件名**: S-11 ユーザ管理 - should return to list when cancel button is clicked
**テスト意図**: 登録フォームでキャンセルすると一覧に戻ることを確認する
**前提条件**: ユーザ登録フォームが表示されている
**テスト内容**: #user-form-cancel をクリックし、.data-table が表示され登録フォームが非表示になることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-141
**件名**: S-11 支払条件・税率マスタ - should display payment term list on payment-term tab
**テスト意図**: 支払条件タブに4件のシードデータが表示されることを確認する
**前提条件**: 管理者でログイン、マスタ管理画面に遷移済み
**テスト内容**: payment-term タブをクリックし .data-table-body-row が4件で「翌月末払い」が含まれることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-142
**件名**: S-11 支払条件・税率マスタ - should display tax rate list on tax-rate tab
**テスト意図**: 税率タブに3件のシードデータが表示されることを確認する
**前提条件**: 管理者でログイン、マスタ管理画面に遷移済み
**テスト内容**: tax-rate タブをクリックし .data-table-body-row が3件で「標準税率」が含まれることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-143
**件名**: S-11 ユーザ管理 権限制御 - should not show user tab for sales01 user
**テスト意図**: user-permission:edit 権限がない sales01 にはユーザ管理タブが表示されないことを確認する
**前提条件**: sales01 でログイン
**テスト内容**: [data-master-tab="user"] が表示されないことを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-144
**件名**: S-11 ユーザ管理 権限制御 - should prevent login for stopped user
**テスト意図**: 停止ステータスに変更したユーザはログインできないことを確認する
**前提条件**: 管理者でログイン
**テスト内容**: sales01 を停止状態に更新後、sales01 でログイン試行すると「停止」を含むフィードバックが表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-145
**件名**: P10-RT-02 ユーザ管理 バリデーション - should show ユーザIDは必須です error when user ID is empty on submit
**テスト意図**: ユーザIDが未入力で登録するとバリデーションエラーが表示されることを確認する
**前提条件**: ユーザ登録フォームが表示されている
**テスト内容**: ユーザID以外の必須フィールドを入力してサブミットし、「ユーザIDは必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-146
**件名**: P10-RT-02 ユーザ管理 バリデーション - should show ユーザIDはすでに使用されています error when duplicate user ID is entered
**テスト意図**: 既存のユーザID（admin）を入力して登録するとID重複エラーが表示されることを確認する
**前提条件**: ユーザ登録フォームが表示されている
**テスト内容**: ユーザIDに「admin」を入力してサブミットし、「ユーザIDはすでに使用されています。」エラーが表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`

### E2E-147
**件名**: P10-RT-02 ユーザ管理 バリデーション - should show 氏名は必須です error when name is empty on submit
**テスト意図**: 氏名が未入力で登録するとバリデーションエラーが表示されることを確認する
**前提条件**: ユーザ登録フォームが表示されている
**テスト内容**: 氏名以外の必須フィールドを入力してサブミットし、「氏名は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/user-master.spec.js`


---

## S-11 マスタ管理 権限制御

### E2E-148
**件名**: S-11 マスタ管理 権限制御 - should show master menu and customer list for sales01 user
**テスト意図**: sales01 ユーザがマスタ管理で顧客一覧を参照できることを確認する
**前提条件**: sales01 でログイン
**テスト内容**: マスタ管理に遷移し .data-table が表示され .data-table-body-row が5件であることを確認する
**ファイル**: `e2e/master-permission.spec.js`

### E2E-149
**件名**: S-11 マスタ管理 権限制御 - should not show edit button or new registration button for sales01 user
**テスト意図**: master:edit 権限がない sales01 には新規登録・編集ボタンが表示されないことを確認する
**前提条件**: sales01 でマスタ管理を表示済み
**テスト内容**: #new-customer-btn が非表示で [data-action-edit] が0件であることを確認する
**ファイル**: `e2e/master-permission.spec.js`

### E2E-150
**件名**: S-11 マスタ管理 権限制御 - should show master menu and customer list for finance01 user
**テスト意図**: finance01 ユーザがマスタ管理で顧客一覧を参照できることを確認する
**前提条件**: finance01 でログイン
**テスト内容**: マスタ管理に遷移し .data-table が表示され .data-table-body-row が5件であることを確認する
**ファイル**: `e2e/master-permission.spec.js`


---

## S-12 承認一覧

### E2E-151
**件名**: S-12 承認一覧 - should show approval list from navigation
**テスト意図**: ナビゲーションから承認一覧が表示されることを確認する
**前提条件**: 管理者でログイン
**テスト内容**: .data-table が表示されることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-152
**件名**: S-12 承認一覧 - should show pending quotation in list
**テスト意図**: 承認一覧に承認待ち見積（QUO-00003）が表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: テーブルに「QUO-00003」が含まれることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-153
**件名**: S-12 承認一覧 - should show type 見積 in approval list
**テスト意図**: 承認一覧に「見積」タイプが表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: テーブルに「見積」が含まれることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-154
**件名**: S-12 承認一覧 - should show pending purchase order in list
**テスト意図**: 承認一覧に承認待ち発注（POD-00006）が表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: テーブルに「POD-00006」が含まれることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-155
**件名**: S-12 承認一覧 - should show type 発注 in approval list
**テスト意図**: 承認一覧に「発注」タイプが表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: テーブルに「発注」が含まれることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-156
**件名**: S-12 承認一覧 - should show amount in approval list
**テスト意図**: 承認一覧に金額（726,000）が表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: テーブルに「726,000」が含まれることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-157
**件名**: S-12 承認一覧 - should show customer name for quotation in list
**テスト意図**: 承認一覧の見積行に顧客名が表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: テーブルに「みなと物流サービス株式会社」が含まれることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-158
**件名**: S-12 承認一覧 - should show supplier name for purchase order in list
**テスト意図**: 承認一覧の発注行に仕入先名が表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: テーブルに「東洋精密機器株式会社」が含まれることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-159
**件名**: S-12 承認一覧 - should show submitter name in list
**テスト意図**: 承認一覧に申請者名が表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: テーブルに「佐藤 営業」が含まれることを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-160
**件名**: S-12 承認一覧 - should filter by type 見積
**テスト意図**: 「見積」でフィルタすると見積のみが表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: 「見積」でフィルタし QUO-00003 が含まれ POD-00006 が含まれないことを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-161
**件名**: S-12 承認一覧 - should filter by type 発注
**テスト意図**: 「発注」でフィルタすると発注のみが表示されることを確認する
**前提条件**: 承認一覧を表示済み
**テスト内容**: 「発注」でフィルタし POD-00006 が含まれ QUO-00003 が含まれないことを確認する
**ファイル**: `e2e/approval.spec.js`

### E2E-162
**件名**: S-12 承認一覧 - should show approval list for finance01 who has approval:view
**テスト意図**: approval:view 権限を持つ finance01 に承認ナビゲーションが表示されることを確認する
**前提条件**: finance01 でログイン
**テスト内容**: [data-route="approval"] が表示されることを確認する
**ファイル**: `e2e/approval.spec.js`


---

## S-14 通知一覧

### E2E-163
**件名**: S-14 通知一覧 - should show notification list from navigation
**テスト意図**: ナビゲーションから通知一覧が表示されることを確認する
**前提条件**: 管理者でログイン
**テスト内容**: .data-table が表示されることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-164
**件名**: S-14 通知一覧 - should show approval request notification in list
**テスト意図**: 通知一覧に承認依頼通知（QUO-00003）が表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: テーブルに「QUO-00003」が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-165
**件名**: S-14 通知一覧 - should show 承認依頼 type badge in notification list
**テスト意図**: 通知一覧に「承認依頼」タイプバッジが表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: テーブルに「承認依頼」が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-166
**件名**: S-14 通知一覧 - should show notification message in list
**テスト意図**: 通知一覧に通知メッセージが表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: テーブルに「見積 QUO-00003 の承認依頼が届いています」が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-167
**件名**: S-14 通知一覧 - should show purchase order notification in list
**テスト意図**: 通知一覧に発注承認依頼通知（POD-00006）が表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: テーブルに「POD-00006」が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-168
**件名**: S-14 通知一覧 - should show payment notification in list
**テスト意図**: 通知一覧に支払通知（PMT-00002）が表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: テーブルに「PMT-00002」が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-169
**件名**: S-14 通知一覧 - should show 未読 badge for unread notifications
**テスト意図**: 未読通知に「未読」バッジが表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: テーブルに「未読」が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-170
**件名**: S-14 通知一覧 - should show 既読 badge for read notifications
**テスト意図**: 既読通知に「既読」バッジが表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: テーブルに「既読」が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-171
**件名**: S-14 通知一覧 - should show notification date in list
**テスト意図**: 通知一覧に通知日が表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: テーブルに「2026-04-20」が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-172
**件名**: S-14 通知一覧 - should filter by type 承認依頼
**テスト意図**: 「承認依頼」でフィルタすると承認依頼通知のみが表示されることを確認する
**前提条件**: 通知一覧を表示済み
**テスト内容**: 「承認依頼」でフィルタし QUO-00003 が含まれることを確認する
**ファイル**: `e2e/notification.spec.js`

### E2E-173
**件名**: S-14 通知一覧 - should show notification list for finance01 who has notification:view
**テスト意図**: notification:view 権限を持つ finance01 に通知ナビゲーションが表示されることを確認する
**前提条件**: finance01 でログイン
**テスト内容**: [data-route="notification"] が表示されることを確認する
**ファイル**: `e2e/notification.spec.js`


---

## システム設定

### E2E-174
**件名**: システム設定 - should show settings screen with two tabs
**テスト意図**: システム設定画面に会社情報タブと会計年度タブの2つが表示されることを確認する
**前提条件**: 管理者でログイン、システム設定に遷移済み
**テスト内容**: [data-settings-tab="company"] と [data-settings-tab="fiscal"] が表示されることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-175
**件名**: システム設定 - should show company info tab as default
**テスト意図**: システム設定でデフォルトで会社情報タブがアクティブになることを確認する
**前提条件**: システム設定画面を表示済み
**テスト内容**: company タブが is-active クラスを持ち #s-company-name が表示されることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-176
**件名**: システム設定 - should show company name input with default value
**テスト意図**: 会社名入力フィールドにデフォルト値「株式会社サンプル商事」が設定されることを確認する
**前提条件**: システム設定の会社情報タブを表示済み
**テスト内容**: #s-company-name の値が「株式会社サンプル商事」であることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-177
**件名**: システム設定 - should show company address input
**テスト意図**: 会社住所入力フィールドが表示されることを確認する
**前提条件**: システム設定の会社情報タブを表示済み
**テスト内容**: #s-company-address が表示されることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-178
**件名**: システム設定 - should show company phone input
**テスト意図**: 会社電話番号入力フィールドが表示されることを確認する
**前提条件**: システム設定の会社情報タブを表示済み
**テスト内容**: #s-company-phone が表示されることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-179
**件名**: システム設定 - should save company info when form is submitted
**テスト意図**: 会社情報を変更して保存すると更新が反映されることを確認する
**前提条件**: システム設定の会社情報タブを表示済み
**テスト内容**: 会社名を変更して保存後、入力値が「新株式会社テスト」に変わることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-180
**件名**: システム設定 - should show error when company name is empty
**テスト意図**: 会社名を空にして保存するとバリデーションエラーが表示されることを確認する
**前提条件**: システム設定の会社情報タブを表示済み
**テスト内容**: 会社名を空にして保存し、「会社名は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-181
**件名**: システム設定 - should switch to fiscal year tab when clicked
**テスト意図**: 会計年度タブをクリックすると切り替わることを確認する
**前提条件**: システム設定画面を表示済み
**テスト内容**: fiscal タブをクリックし is-active クラスを持ち #s-fiscal-end-month が表示されることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-182
**件名**: システム設定 - should show December as default fiscal end month
**テスト意図**: 会計年度終了月のデフォルトが12月であることを確認する
**前提条件**: 会計年度タブを表示済み
**テスト内容**: #s-fiscal-end-month の値が「12」であることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-183
**件名**: システム設定 - should save fiscal end month when form is submitted
**テスト意図**: 会計年度終了月を変更して保存すると更新が反映されることを確認する
**前提条件**: 会計年度タブを表示済み
**テスト内容**: 「3」を選択して保存後、#s-fiscal-end-month の値が「3」であることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-184
**件名**: システム設定 - should show all 12 month options in fiscal end month selector
**テスト意図**: 会計年度終了月セレクタに12ヶ月分のオプションが存在することを確認する
**前提条件**: 会計年度タブを表示済み
**テスト内容**: 1月〜12月のすべてのオプションが存在することを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-185
**件名**: システム設定 - should show 8月 as selectable option
**テスト意図**: 会計年度終了月に8月が選択できることを確認する
**前提条件**: 会計年度タブを表示済み
**テスト内容**: 「8」を選択し値が「8」であることを確認する
**ファイル**: `e2e/settings.spec.js`

### E2E-186
**件名**: システム設定 - should switch back to company tab when clicked
**テスト意図**: 会計年度タブから会社情報タブに戻れることを確認する
**前提条件**: 会計年度タブを表示済み
**テスト内容**: company タブをクリックし is-active クラスを持ち #s-company-name が表示されることを確認する
**ファイル**: `e2e/settings.spec.js`


---

## 表示件数選択

### E2E-187
**件名**: 表示件数選択 - should show page size selector in list screen
**テスト意図**: 一覧画面にページサイズセレクタが表示されることを確認する
**前提条件**: 管理者でログイン、見積一覧を表示済み
**テスト内容**: [data-table-pagesize] が表示されることを確認する
**ファイル**: `e2e/page-size.spec.js`

### E2E-188
**件名**: 表示件数選択 - should show 20件 as default page size
**テスト意図**: デフォルトのページサイズが20件であることを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: [data-table-pagesize] の値が「20」であることを確認する
**ファイル**: `e2e/page-size.spec.js`

### E2E-189
**件名**: 表示件数選択 - should show all 7 quotations by default with page size 20
**テスト意図**: ページサイズ20件でシードデータ7件が全件表示されることを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: .data-table-body-row が7件であることを確認する
**ファイル**: `e2e/page-size.spec.js`

### E2E-190
**件名**: 表示件数選択 - should show 5 rows when page size 5 is selected
**テスト意図**: ページサイズを5件に変更すると表示行数が5件になることを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: ページサイズを「5」に変更し .data-table-body-row が5件であることを確認する
**ファイル**: `e2e/page-size.spec.js`

### E2E-191
**件名**: 表示件数選択 - should update summary text when page size is changed to 5
**テスト意図**: ページサイズを5件に変更するとサマリーテキストが更新されることを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: ページサイズを「5」に変更し「全 7 件中 1 - 5 件を表示」が表示されることを確認する
**ファイル**: `e2e/page-size.spec.js`

### E2E-192
**件名**: 表示件数選択 - should reset to page 1 when page size is changed
**テスト意図**: ページサイズを変更するとページ1にリセットされることを確認する
**前提条件**: ページサイズ5でページ2を表示中
**テスト内容**: ページサイズを20に変更し「1 / 1 ページ」が表示されることを確認する
**ファイル**: `e2e/page-size.spec.js`

### E2E-193
**件名**: 表示件数選択 - should show 5件 as option in page size selector
**テスト意図**: ページサイズセレクタに「5件」オプションが存在することを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: option[value="5"] が存在することを確認する
**ファイル**: `e2e/page-size.spec.js`

### E2E-194
**件名**: 表示件数選択 - should show 20件 as option in page size selector
**テスト意図**: ページサイズセレクタに「20件」オプションが存在することを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: option[value="20"] が存在することを確認する
**ファイル**: `e2e/page-size.spec.js`

### E2E-195
**件名**: 表示件数選択 - should show 50件 as option in page size selector
**テスト意図**: ページサイズセレクタに「50件」オプションが存在することを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: option[value="50"] が存在することを確認する
**ファイル**: `e2e/page-size.spec.js`


---

## サイドバー折りたたみ

### E2E-196
**件名**: サイドバー折りたたみ - should show sidebar toggle button
**テスト意図**: サイドバーのトグルボタンが表示されることを確認する
**前提条件**: 管理者でログイン済み
**テスト内容**: #sidebar-toggle が表示されることを確認する
**ファイル**: `e2e/sidebar-collapse.spec.js`

### E2E-197
**件名**: サイドバー折りたたみ - should collapse sidebar when toggle is clicked
**テスト意図**: トグルボタンをクリックするとサイドバーが折りたたまれることを確認する
**前提条件**: 管理者でログイン済み
**テスト内容**: トグルボタンをクリックし .sidebar が is-collapsed クラスを持つことを確認する
**ファイル**: `e2e/sidebar-collapse.spec.js`

### E2E-198
**件名**: サイドバー折りたたみ - should hide sidebar header text when collapsed
**テスト意図**: 折りたたみ時にサイドバーヘッダーテキストが非表示になることを確認する
**前提条件**: サイドバーが折りたたまれている
**テスト内容**: .sidebar-header が表示されないことを確認する
**ファイル**: `e2e/sidebar-collapse.spec.js`

### E2E-199
**件名**: サイドバー折りたたみ - should hide user identity info when collapsed
**テスト意図**: 折りたたみ時にユーザ識別情報が非表示になることを確認する
**前提条件**: サイドバーが折りたたまれている
**テスト内容**: .identity が表示されないことを確認する
**ファイル**: `e2e/sidebar-collapse.spec.js`

### E2E-200
**件名**: サイドバー折りたたみ - should still show nav tags when collapsed
**テスト意図**: 折りたたみ時もナビゲーションタグが表示されることを確認する
**前提条件**: サイドバーが折りたたまれている
**テスト内容**: .menu-tag の最初の要素が表示されることを確認する
**ファイル**: `e2e/sidebar-collapse.spec.js`

### E2E-201
**件名**: サイドバー折りたたみ - should expand sidebar when toggle is clicked again
**テスト意図**: 折りたたみ後にトグルをクリックするとサイドバーが展開されることを確認する
**前提条件**: サイドバーが折りたたまれている
**テスト内容**: 再度トグルをクリックし is-collapsed クラスが消え .sidebar-header が表示されることを確認する
**ファイル**: `e2e/sidebar-collapse.spec.js`

### E2E-202
**件名**: サイドバー折りたたみ - should navigate to screen when collapsed menu item is clicked
**テスト意図**: 折りたたみ状態でメニュー項目をクリックすると画面遷移できることを確認する
**前提条件**: サイドバーが折りたたまれている
**テスト内容**: 案件ナビをクリックし .data-table が表示されることを確認する
**ファイル**: `e2e/sidebar-collapse.spec.js`

### E2E-203
**件名**: サイドバー折りたたみ - should preserve collapsed state after navigation
**テスト意図**: 画面遷移後もサイドバーの折りたたみ状態が維持されることを確認する
**前提条件**: サイドバーが折りたたまれている
**テスト内容**: 案件ナビをクリックした後も .sidebar が is-collapsed クラスを持つことを確認する
**ファイル**: `e2e/sidebar-collapse.spec.js`


---

## CSRF保護

### E2E-204
**件名**: csrfPlugin (E2E) - should return 403 when POST request has disallowed origin
**テスト意図**: 許可されていないオリジンからのPOSTリクエストが403で拒否されることを確認する
**前提条件**: バックエンドサーバーが起動している
**テスト内容**: evil.example.com オリジンで POST /api/auth/logout を実行し 403 と CSRF エラーメッセージが返されることを確認する
**ファイル**: `e2e/csrf-protection.spec.js`

### E2E-205
**件名**: csrfPlugin (E2E) - should allow POST request when origin matches CORS_ORIGIN
**テスト意図**: 許可されたオリジン（localhost:5173）からのPOSTリクエストが通過することを確認する
**前提条件**: バックエンドサーバーが起動している
**テスト内容**: localhost:5173 オリジンで POST を実行し 403 以外が返されることを確認する
**ファイル**: `e2e/csrf-protection.spec.js`

### E2E-206
**件名**: csrfPlugin (E2E) - should allow POST request without origin header (same-origin flow)
**テスト意図**: Origin ヘッダーなしのPOSTリクエスト（同一オリジン）が通過することを確認する
**前提条件**: バックエンドサーバーが起動している
**テスト内容**: Origin ヘッダーなしで POST を実行し 403 以外が返されることを確認する
**ファイル**: `e2e/csrf-protection.spec.js`

### E2E-207
**件名**: csrfPlugin (E2E) - should not block GET request even with disallowed origin
**テスト意図**: 許可されていないオリジンからのGETリクエストはCSRFチェックを受けないことを確認する
**前提条件**: バックエンドサーバーが起動している
**テスト内容**: evil.example.com オリジンで GET /api/auth/me を実行し 403 以外が返されることを確認する
**ファイル**: `e2e/csrf-protection.spec.js`


---

## コンソールエラー確認

### E2E-208
**件名**: check console errors after login - ログイン後のコンソールエラー確認
**テスト意図**: ログイン後および承認画面に遷移した際にブラウザコンソールにエラーが出ないことを確認する
**前提条件**: APIをモック済み
**テスト内容**: ログイン後3秒待機し、承認ナビをクリックして2秒待機し、コンソールエラーをログ出力する
**ファイル**: `e2e/check_errors.spec.js`


---

## P10-RT-05 複数ページ遷移

### E2E-209
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should show page 1 of 2 when page size 5 is selected with 7 items
**テスト意図**: 7件データでページサイズ5選択時に「1 / 2 ページ」と表示されることを確認する
**前提条件**: 見積一覧でページサイズ5を選択済み
**テスト内容**: .pagination-text に「1 / 2 ページ」が含まれることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-210
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should show 5 rows on page 1 when page size is 5
**テスト意図**: ページサイズ5でページ1に5行が表示されることを確認する
**前提条件**: 見積一覧でページサイズ5を選択済み
**テスト内容**: .data-table-body-row が5件であることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-211
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should show correct summary text on page 1
**テスト意図**: ページ1のサマリーテキストが正しいことを確認する
**前提条件**: 見積一覧でページサイズ5を選択済み
**テスト内容**: .table-summary に「全 7 件中 1 - 5 件を表示」が含まれることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-212
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should navigate to page 2 when next button is clicked
**テスト意図**: 次ページボタンをクリックするとページ2に移動することを確認する
**前提条件**: 見積一覧でページサイズ5、ページ1を表示済み
**テスト内容**: 次ページボタンをクリックし「2 / 2 ページ」が表示されることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-213
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should show 2 rows on page 2 when page size is 5
**テスト意図**: ページ2に残りの2行が表示されることを確認する
**前提条件**: ページ2に移動済み
**テスト内容**: .data-table-body-row が2件であることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-214
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should show correct summary text on page 2
**テスト意図**: ページ2のサマリーテキストが正しいことを確認する
**前提条件**: ページ2に移動済み
**テスト内容**: .table-summary に「全 7 件中 6 - 7 件を表示」が含まれることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-215
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should navigate back to page 1 when prev button is clicked on page 2
**テスト意図**: ページ2から前ページボタンでページ1に戻れることを確認する
**前提条件**: ページ2を表示済み
**テスト内容**: 前ページボタンをクリックし「1 / 2 ページ」が表示されることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-216
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should show 5 rows again after returning to page 1
**テスト意図**: ページ1に戻ると5行が表示されることを確認する
**前提条件**: ページ2に移動してからページ1に戻ってきた状態
**テスト内容**: .data-table-body-row が5件であることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-217
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should disable prev button on page 1
**テスト意図**: ページ1では前ページボタンが無効になることを確認する
**前提条件**: ページ1を表示済み
**テスト内容**: [data-table-action="prev"] が disabled であることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-218
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should disable next button on last page
**テスト意図**: 最終ページでは次ページボタンが無効になることを確認する
**前提条件**: ページ2（最終ページ）を表示済み
**テスト内容**: [data-table-action="next"] が disabled であることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`

### E2E-219
**件名**: P10-RT-05 複数ページ遷移・件数表示確認 - should keep total item count consistent across page transitions
**テスト意図**: ページ遷移してもトータル件数が7件で変わらないことを確認する
**前提条件**: ページ1を表示済み
**テスト内容**: ページ1とページ2の両方で「全 7 件」がサマリーに含まれることを確認する
**ファイル**: `e2e/zzz-pagination.spec.js`


---

## S-12 承認一覧 行ドリルダウン

### E2E-220
**件名**: S-12 承認一覧 行ドリルダウン - should show 詳細 button in each approval row
**テスト意図**: 承認一覧の各行に詳細ボタンが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み、承認一覧画面を表示済み
**テスト内容**: [data-action-detail-approval] の最初の要素が表示されていることを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`

### E2E-221
**件名**: S-12 承認一覧 行ドリルダウン - should navigate to quotation detail when 詳細 button is clicked for 見積
**テスト意図**: 見積の詳細ボタンをクリックすると見積詳細画面に遷移することを確認する
**前提条件**: 承認一覧に見積タイプの承認依頼が存在する
**テスト内容**: 見積の詳細ボタンをクリックし、#quotation-detail-back が表示されることを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`

### E2E-222
**件名**: S-12 承認一覧 行ドリルダウン - should show 承認一覧に戻る button on quotation detail when navigated from approval list
**テスト意図**: 承認一覧から見積詳細に遷移した場合、戻るボタンに「承認一覧に戻る」テキストが表示されることを確認する
**前提条件**: 承認一覧から見積詳細画面に遷移済み
**テスト内容**: #quotation-detail-back のテキストが「承認一覧に戻る」であることを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`

### E2E-223
**件名**: S-12 承認一覧 行ドリルダウン - should return to approval list when 承認一覧に戻る is clicked from quotation detail
**テスト意図**: 見積詳細から「承認一覧に戻る」をクリックすると承認一覧に戻ることを確認する
**前提条件**: 承認一覧から見積詳細画面に遷移済み
**テスト内容**: 「承認一覧に戻る」ボタンをクリックし、データテーブルが表示され「S-04 見積詳細」が消えることを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`

### E2E-224
**件名**: S-12 承認一覧 行ドリルダウン - should navigate to purchase order detail when 詳細 button is clicked for 発注
**テスト意図**: 発注の詳細ボタンをクリックすると発注詳細画面に遷移することを確認する
**前提条件**: 承認一覧に発注タイプの承認依頼が存在する
**テスト内容**: 発注の詳細ボタンをクリックし、#pod-detail-back が表示されることを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`

### E2E-225
**件名**: S-12 承認一覧 行ドリルダウン - should show 承認一覧に戻る button on purchase order detail when navigated from approval list
**テスト意図**: 承認一覧から発注詳細に遷移した場合、戻るボタンに「承認一覧に戻る」が表示されることを確認する
**前提条件**: 承認一覧から発注詳細画面に遷移済み
**テスト内容**: #pod-detail-back のテキストが「承認一覧に戻る」であることを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`

### E2E-226
**件名**: S-12 承認一覧 行ドリルダウン - should return to approval list when 承認一覧に戻る is clicked from purchase order detail
**テスト意図**: 発注詳細から「承認一覧に戻る」をクリックすると承認一覧に戻ることを確認する
**前提条件**: 承認一覧から発注詳細画面に遷移済み
**テスト内容**: 「承認一覧に戻る」ボタンをクリックし、データテーブルが表示され「S-06 発注詳細」が消えることを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`

### E2E-227
**件名**: S-12 承認一覧 行ドリルダウン - should show quotation code in detail after drilldown
**テスト意図**: ドリルダウン後の見積詳細画面に見積コードが表示されることを確認する
**前提条件**: 承認一覧から見積詳細に遷移済み
**テスト内容**: .detail-grid に「QUO-」が含まれることを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`

### E2E-228
**件名**: S-12 承認一覧 行ドリルダウン - should not show 承認一覧に戻る when navigating to quotation detail directly
**テスト意図**: 見積一覧から直接見積詳細に遷移した場合は「一覧へ戻る」が表示され「承認一覧に戻る」は表示されないことを確認する
**前提条件**: 見積一覧から見積詳細画面に直接遷移済み
**テスト内容**: #quotation-detail-back のテキストが「一覧へ戻る」で「承認一覧に戻る」ではないことを確認する
**ファイル**: `e2e/approval-drilldown.spec.js`


---

## P0-10 承認ステップ表示・承認履歴

### E2E-229
**件名**: P0-10 承認ステップ表示＋承認履歴テーブル - should show approval history section on order detail with 承認依頼中 status
**テスト意図**: 承認依頼中ステータスの受注詳細画面で承認履歴セクションが表示されることを確認する
**前提条件**: 承認一覧に受注タイプの承認依頼が存在する
**テスト内容**: 承認一覧から受注詳細に遷移し、#approval-history-section が表示されることを確認する
**ファイル**: `e2e/approval-history.spec.js`

### E2E-230
**件名**: P0-10 承認ステップ表示＋承認履歴テーブル - should show 承認依頼中 status badge in approval history section
**テスト意図**: 承認履歴セクションに「承認依頼中」ステータスバッジが表示されることを確認する
**前提条件**: 承認依頼中の受注詳細を表示済み
**テスト内容**: #approval-history-section .status-badge が表示され「承認依頼中」テキストを含むことを確認する
**ファイル**: `e2e/approval-history.spec.js`

### E2E-231
**件名**: P0-10 承認ステップ表示＋承認履歴テーブル - should record history entry when order approval is submitted
**テスト意図**: 受注の承認依頼を送信すると承認履歴セクションが非表示になることを確認する
**前提条件**: 受注詳細画面を表示済み
**テスト内容**: ORD-00001の詳細を開いて承認依頼ボタンをクリックし（ダイアログはキャンセル）、#approval-history-section が非表示になることを確認する
**ファイル**: `e2e/approval-history.spec.js`

### E2E-232
**件名**: P0-10 承認ステップ表示＋承認履歴テーブル - should record 承認 history entry after approving from approval list
**テスト意図**: 承認一覧から承認操作後に受注詳細の承認履歴に「承認」エントリが記録されることを確認する
**前提条件**: 承認一覧に受注の承認依頼が存在する
**テスト内容**: 承認操作後に ORD-00006 の詳細を開き、承認履歴テーブルに「承認」テキストが含まれることを確認する
**ファイル**: `e2e/approval-history.spec.js`

### E2E-233
**件名**: P0-10 承認ステップ表示＋承認履歴テーブル - should record 却下 history entry with reason after rejecting
**テスト意図**: 却下操作後に承認履歴に「却下」エントリと却下理由が記録されることを確認する
**前提条件**: 承認一覧に受注の承認依頼が存在する
**テスト内容**: 却下理由「添付書類不備のため却下します」で却下操作後、ORD-00006の詳細で「却下」と理由テキストが履歴に含まれることを確認する
**ファイル**: `e2e/approval-history.spec.js`

### E2E-234
**件名**: P0-10 承認ステップ表示＋承認履歴テーブル - should show approval history section on invoice detail with 承認依頼中 status
**テスト意図**: 承認依頼中ステータスの請求詳細画面で承認履歴セクションが表示されることを確認する
**前提条件**: 承認一覧に請求タイプの承認依頼が存在する
**テスト内容**: 承認一覧から請求詳細に遷移し、#approval-history-section が表示されることを確認する
**ファイル**: `e2e/approval-history.spec.js`

### E2E-235
**件名**: P0-10 承認ステップ表示＋承認履歴テーブル - should show approval history section on purchase order detail with 承認依頼中 status
**テスト意図**: 承認依頼中ステータスの発注詳細画面で承認履歴セクションが表示されることを確認する
**前提条件**: 承認一覧に発注タイプの承認依頼が存在する
**テスト内容**: 承認一覧から発注詳細に遷移し、#approval-history-section が表示されることを確認する
**ファイル**: `e2e/approval-history.spec.js`


---

## P10-RT-03 複数ステップ承認

### 複数ステップ承認ルート設定確認（UI）

### E2E-236
**件名**: P10-RT-03 複数ステップ承認ルート設定確認（UI） - should show 2 steps configured for quotation approval route
**テスト意図**: 見積承認ルートに2ステップが設定されていることを確認する
**前提条件**: 設定画面の承認ルート設定タブを表示済み
**テスト内容**: .data-table-body-row が2件で「第 1 ステップ」「第 2 ステップ」が表示されることを確認する
**ファイル**: `e2e/approval-multistep.spec.js`

### E2E-237
**件名**: P10-RT-03 複数ステップ承認ルート設定確認（UI） - should show approve and reject buttons for 承認依頼中 quotation when 2-step route is configured
**テスト意図**: 2ステップルート設定時に承認依頼中の見積に承認・却下ボタンが表示されることを確認する
**前提条件**: 2ステップルートが設定済み、承認一覧に QUO-00003（承認依頼中）が存在する
**テスト内容**: QUO-00003の詳細を開き、#quotation-approve-btn と #quotation-reject-btn が表示されることを確認する
**ファイル**: `e2e/approval-multistep.spec.js`

### E2E-238
**件名**: P10-RT-03 複数ステップ承認ルート設定確認（UI） - should show comment panel when reject is clicked on 2-step pending quotation
**テスト意図**: 2ステップ承認依頼中の見積で却下をクリックするとコメントパネルが表示されることを確認する
**前提条件**: QUO-00003の詳細を表示済み
**テスト内容**: 却下ボタンをクリックし、#approval-comment-input と #approval-confirm-reject が表示されることを確認する
**ファイル**: `e2e/approval-multistep.spec.js`

### E2E-239
**件名**: P10-RT-03 複数ステップ承認ルート設定確認（UI） - should return to approval list after approving quotation in 2-step route
**テスト意図**: 2ステップルートのステップ1で承認後、承認一覧に戻ることを確認する
**前提条件**: QUO-00003の詳細を表示済み
**テスト内容**: 承認ボタンをクリックして確定し、データテーブルが表示され URL が #approval となることを確認する
**ファイル**: `e2e/approval-multistep.spec.js`


### 複数ステップ承認 途中却下フロー

### E2E-240
**件名**: P10-RT-03 複数ステップ承認 途中却下フロー - should update quotation to 却下 when rejected at intermediate step
**テスト意図**: 中間ステップで却下すると見積のステータスが「却下」になることを確認する
**前提条件**: ステートフルモック設定済み、QUO-00003 が承認依頼中
**テスト内容**: ステップ1で却下後、見積一覧から QUO-00003 の詳細を開き .status-badge が「却下」であることを確認する
**ファイル**: `e2e/approval-multistep.spec.js`

### E2E-241
**件名**: P10-RT-03 複数ステップ承認 途中却下フロー - should show 下書きに戻す button after intermediate step rejection
**テスト意図**: 中間ステップで却下後、見積詳細に「下書きに戻す」ボタンが表示されることを確認する
**前提条件**: QUO-00003 がステップ1で却下済み
**テスト内容**: 見積詳細の #quotation-return-draft-btn が表示されることを確認する
**ファイル**: `e2e/approval-multistep.spec.js`

### E2E-242
**件名**: P10-RT-03 複数ステップ承認 途中却下フロー - should allow re-submission after intermediate step rejection
**テスト意図**: 途中却下→下書き戻し→再承認依頼の完全フローが動作することを確認する
**前提条件**: QUO-00003 がステートフルモックで管理されている
**テスト内容**: 却下→下書きに戻す→再承認依頼の3ステップを実行し、最終的にステータスが「承認依頼中」になることを確認する
**ファイル**: `e2e/approval-multistep.spec.js`

### E2E-243
**件名**: P10-RT-03 複数ステップ承認 途中却下フロー - should not show reject button for 承認済み quotation after final approval
**テスト意図**: 最終承認後の承認済み見積には却下ボタンが表示されないことを確認する
**前提条件**: QUO-00003 が承認済みに遷移済み
**テスト内容**: 承認操作後に見積詳細を開き、ステータスが「承認済み」で #quotation-reject-btn が非表示であることを確認する
**ファイル**: `e2e/approval-multistep.spec.js`


---

## S-12 承認操作（承認/却下+コメント）

### E2E-244
**件名**: S-12 承認操作（承認/却下+コメント） - should show 承認する button on quotation detail when status is 承認依頼中
**テスト意図**: 承認依頼中の見積詳細に「承認する」ボタンが表示されることを確認する
**前提条件**: 承認一覧に見積タイプの承認依頼が存在する
**テスト内容**: 見積の詳細を開き、#quotation-approve-btn が表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-245
**件名**: S-12 承認操作（承認/却下+コメント） - should show 却下 button on quotation detail when status is 承認依頼中
**テスト意図**: 承認依頼中の見積詳細に「却下」ボタンが表示されることを確認する
**前提条件**: 承認一覧に見積タイプの承認依頼が存在する
**テスト内容**: 見積の詳細を開き、#quotation-reject-btn が表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-246
**件名**: S-12 承認操作（承認/却下+コメント） - should expand comment panel when 承認する is clicked
**テスト意図**: 「承認する」ボタンをクリックするとコメント入力パネルが展開されることを確認する
**前提条件**: 承認依頼中の見積詳細を表示済み
**テスト内容**: 承認ボタンをクリックし、#approval-comment-input と #approval-confirm-approve が表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-247
**件名**: S-12 承認操作（承認/却下+コメント） - should expand comment panel when 却下 is clicked
**テスト意図**: 「却下」ボタンをクリックするとコメント入力パネルが展開されることを確認する
**前提条件**: 承認依頼中の見積詳細を表示済み
**テスト内容**: 却下ボタンをクリックし、#approval-comment-input と #approval-confirm-reject が表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-248
**件名**: S-12 承認操作（承認/却下+コメント） - should show error when 却下を確定 is clicked without comment
**テスト意図**: コメントなしで却下を確定しようとするとエラーメッセージが表示されることを確認する
**前提条件**: 却下パネルが展開済み
**テスト内容**: コメント未入力で #approval-confirm-reject をクリックし、.error-message に「却下理由は必須です」が表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-249
**件名**: S-12 承認操作（承認/却下+コメント） - should return to approval list after approving quotation
**テスト意図**: 見積承認後に承認一覧に戻ることを確認する
**前提条件**: 承認依頼中の見積詳細を表示済み
**テスト内容**: 承認ボタンをクリックして確定し、データテーブルが表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-250
**件名**: S-12 承認操作（承認/却下+コメント） - should return to approval list after rejecting quotation with reason
**テスト意図**: 理由付きで見積却下後に承認一覧に戻ることを確認する
**前提条件**: 承認依頼中の見積詳細を表示済み
**テスト内容**: 理由「金額が予算を超過しています」を入力して却下確定し、データテーブルが表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-251
**件名**: S-12 承認操作（承認/却下+コメント） - should hide action panel when キャンセル is clicked
**テスト意図**: 却下パネルでキャンセルをクリックするとパネルが非表示になることを確認する
**前提条件**: 却下パネルが展開済み
**テスト内容**: #approval-action-cancel をクリックし、#approval-comment-input が非表示になることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-252
**件名**: S-12 承認操作（承認/却下+コメント） - should show 承認する button on purchase order detail when status is 承認依頼中
**テスト意図**: 承認依頼中の発注詳細に「承認する」ボタンが表示されることを確認する
**前提条件**: 承認一覧に発注タイプの承認依頼が存在する
**テスト内容**: 発注の詳細を開き、#pod-approve-btn が表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-253
**件名**: S-12 承認操作（承認/却下+コメント） - should show 却下 button on purchase order detail when status is 承認依頼中
**テスト意図**: 承認依頼中の発注詳細に「却下」ボタンが表示されることを確認する
**前提条件**: 承認一覧に発注タイプの承認依頼が存在する
**テスト内容**: 発注の詳細を開き、#pod-reject-btn が表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`

### E2E-254
**件名**: S-12 承認操作（承認/却下+コメント） - should return to approval list after approving purchase order
**テスト意図**: 発注承認後に承認一覧に戻ることを確認する
**前提条件**: 承認依頼中の発注詳細を表示済み
**テスト内容**: 承認ボタンをクリックして確定し、データテーブルが表示されることを確認する
**ファイル**: `e2e/approval-operations.spec.js`


---

## P0-11 S-15 承認ルート設定

### E2E-255
**件名**: P0-11 S-15 承認ルート設定タブ - should show 承認ルート設定 tab in settings screen
**テスト意図**: システム設定画面に「承認ルート設定」タブが表示されることを確認する
**前提条件**: 設定画面を表示済み
**テスト内容**: [data-settings-tab="approval-route"] が表示され「承認ルート設定」テキストを含むことを確認する
**ファイル**: `e2e/approval-route-settings.spec.js`

### E2E-256
**件名**: P0-11 S-15 承認ルート設定タブ - should show approval route settings panel when tab is clicked
**テスト意図**: 承認ルート設定タブをクリックするとパネルが表示されることを確認する
**前提条件**: 設定画面を表示済み
**テスト内容**: タブをクリックし、.panel が表示され .panel-title-text に「承認ルート設定」が含まれることを確認する
**ファイル**: `e2e/approval-route-settings.spec.js`

### E2E-257
**件名**: P0-11 S-15 承認ルート設定タブ - should show document type selector in approval route tab
**テスト意図**: 承認ルート設定タブに伝票種別セレクタが表示されることを確認する
**前提条件**: 承認ルート設定タブを表示済み
**テスト内容**: [data-action-route-doctype] が表示されることを確認する
**ファイル**: `e2e/approval-route-settings.spec.js`

### E2E-258
**件名**: P0-11 S-15 承認ルート設定タブ - should show default quotation routes when tab is first opened
**テスト意図**: 承認ルート設定タブを開くとデフォルトで見積の承認ルートが表示されることを確認する
**前提条件**: 承認ルート設定タブを表示済み
**テスト内容**: .data-table に「第 1 ステップ」が含まれることを確認する
**ファイル**: `e2e/approval-route-settings.spec.js`

### E2E-259
**件名**: P0-11 S-15 承認ルート設定タブ - should show AND condition hint text
**テスト意図**: 承認ルート設定タブにAND条件のヒントテキストが表示されることを確認する
**前提条件**: 承認ルート設定タブを表示済み
**テスト内容**: .field-hint に「AND条件」が含まれることを確認する
**ファイル**: `e2e/approval-route-settings.spec.js`

### E2E-260
**件名**: P0-11 S-15 承認ルート設定タブ - should switch routes when document type is changed
**テスト意図**: 伝票種別を変更すると対応するルートが表示されることを確認する
**前提条件**: 承認ルート設定タブを表示済み
**テスト内容**: [data-action-route-doctype] で「order」を選択し、.data-table に「第 1 ステップ」が含まれることを確認する
**ファイル**: `e2e/approval-route-settings.spec.js`

### E2E-261
**件名**: P0-11 S-15 承認ルート設定タブ - should add a new step when approver is selected and button clicked
**テスト意図**: 承認者を選択して追加ボタンをクリックするとステップが追加されることを確認する
**前提条件**: 承認ルート設定タブを表示済み、既存ステップが2件
**テスト内容**: 承認者を選択して #s-route-add-step をクリックし、.data-table-body-row が3件になることを確認する
**ファイル**: `e2e/approval-route-settings.spec.js`

### E2E-262
**件名**: P0-11 S-15 承認ルート設定タブ - should remove a step when 削除 button is clicked
**テスト意図**: 削除ボタンをクリックするとステップが1件減ることを確認する
**前提条件**: 承認ルート設定タブに既存ステップが2件存在する
**テスト内容**: [data-action-remove-route] の最初をクリックし、行数が1減ることを確認する
**ファイル**: `e2e/approval-route-settings.spec.js`


---

## RT-06 権限ネガティブテスト

### 承認権限（approval:act）なし

### E2E-263
**件名**: RT-06 UI層権限ネガティブテスト 承認権限（approval:act）なし - should hide approve button when user lacks approval:act permission
**テスト意図**: approval:act権限を持たないユーザには承認ボタンが非表示になることを確認する
**前提条件**: approval:view のみ持つ sales01 ユーザでログイン済み
**テスト内容**: 承認一覧から受注詳細を開き、#order-approve-btn が非表示であることを確認する
**ファイル**: `e2e/permission-negative.spec.js`

### E2E-264
**件名**: RT-06 UI層権限ネガティブテスト 承認権限（approval:act）なし - should hide reject button when user lacks approval:act permission
**テスト意図**: approval:act権限を持たないユーザには却下ボタンが非表示になることを確認する
**前提条件**: approval:view のみ持つ sales01 ユーザでログイン済み
**テスト内容**: 承認一覧から受注詳細を開き、#order-reject-btn が非表示であることを確認する
**ファイル**: `e2e/permission-negative.spec.js`

### E2E-265
**件名**: RT-06 UI層権限ネガティブテスト 承認権限（approval:act）なし - should show approval list but hide action buttons for view-only user
**テスト意図**: 閲覧専用ユーザは承認一覧を見られるが操作ボタンは非表示であることを確認する
**前提条件**: approval:view のみ持つ sales01 ユーザでログイン済み
**テスト内容**: 承認一覧に遷移し、データテーブルと承認メニューが表示されることを確認する
**ファイル**: `e2e/permission-negative.spec.js`


### 作成・編集権限なし

### E2E-266
**件名**: RT-06 UI層権限ネガティブテスト 作成・編集権限なし - should hide 請求対象抽出 button when user lacks invoice:edit permission
**テスト意図**: invoice:edit権限のないユーザには請求対象抽出ボタンが非表示になることを確認する
**前提条件**: invoice:view のみ持つユーザでログイン済み
**テスト内容**: 請求一覧に遷移し、#invoice-extract-btn が非表示であることを確認する
**ファイル**: `e2e/permission-negative.spec.js`

### E2E-267
**件名**: RT-06 UI層権限ネガティブテスト 作成・編集権限なし - should hide 新規登録 button in master when user lacks master:edit permission
**テスト意図**: master:edit権限のないユーザにはマスタの新規登録ボタンが非表示になることを確認する
**前提条件**: master:view のみ持つユーザでログイン済み
**テスト内容**: マスタ管理に遷移し、#new-customer-btn が非表示であることを確認する
**ファイル**: `e2e/permission-negative.spec.js`

### E2E-268
**件名**: RT-06 UI層権限ネガティブテスト 作成・編集権限なし - should hide edit buttons in master list when user lacks master:edit permission
**テスト意図**: master:edit権限のないユーザにはマスタ一覧の編集ボタンが表示されないことを確認する
**前提条件**: master:view のみ持つユーザでログイン済み
**テスト内容**: マスタ管理（顧客一覧）に遷移し、[data-action-edit] が0件であることを確認する
**ファイル**: `e2e/permission-negative.spec.js`


### マスタ管理権限（master:view）なし

### E2E-269
**件名**: RT-06 UI層権限ネガティブテスト マスタ管理権限（master:view）なし - should hide master management menu item when user lacks master:view permission
**テスト意図**: master:view権限のないユーザにはマスタ管理メニューが非表示になることを確認する
**前提条件**: master:view を持たない閲覧ユーザでログイン済み
**テスト内容**: [data-route="master"] が非表示であることを確認する
**ファイル**: `e2e/permission-negative.spec.js`

### E2E-270
**件名**: RT-06 UI層権限ネガティブテスト マスタ管理権限（master:view）なし - should not expose master route when user lacks master:view permission
**テスト意図**: master:view権限なしではマスタ管理ルートにアクセスできないことを確認する
**前提条件**: master:view を持たない閲覧ユーザでログイン済み
**テスト内容**: [data-route="master"] の件数が0であることを確認する
**ファイル**: `e2e/permission-negative.spec.js`


### 閲覧専用権限の境界確認

### E2E-271
**件名**: RT-06 UI層権限ネガティブテスト 閲覧専用権限の境界確認 - should show approval menu for user with approval:view but hide action buttons
**テスト意図**: approval:view のみのユーザは承認メニューは表示されることを確認する
**前提条件**: approval:view のみ持つ承認閲覧者でログイン済み
**テスト内容**: [data-route="approval"] が表示されることを確認する
**ファイル**: `e2e/permission-negative.spec.js`

### E2E-272
**件名**: RT-06 UI層権限ネガティブテスト 閲覧専用権限の境界確認 - should not show quotation menu when user lacks quotation:view permission
**テスト意図**: quotation:view権限のない経理ユーザには見積メニューが非表示になることを確認する
**前提条件**: invoice:view・receipt:view・payment:view 等を持つが quotation:view を持たないユーザでログイン済み
**テスト内容**: [data-route="quotation"] が非表示であることを確認する
**ファイル**: `e2e/permission-negative.spec.js`


---

## S-08 請求一覧

### 請求一覧

### E2E-273
**件名**: S-08 請求一覧 - should display invoice list with 6 rows
**テスト意図**: 請求一覧に6件以上の行が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み、請求一覧画面を表示済み
**テスト内容**: .data-table-body-row が6件以上で .table-summary に「全 」が含まれることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-274
**件名**: S-08 請求一覧 - should show invoice code in list
**テスト意図**: 請求一覧に請求コードが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .data-table に「INV-00001」が含まれることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-275
**件名**: S-08 請求一覧 - should show customer name (not code) in list
**テスト意図**: 請求一覧に顧客コードでなく顧客名が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 最初の行に「CUS-001」が含まれず「株式会社」が含まれることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-276
**件名**: S-08 請求一覧 - should show total amount formatted with yen in list
**テスト意図**: 請求一覧に金額が円表示でフォーマットされることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .data-table に「528」が含まれることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-277
**件名**: S-08 請求一覧 - should show status badge in list
**テスト意図**: 請求一覧にステータスバッジが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .status-badge の最初の要素が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-278
**件名**: S-08 請求一覧 - should filter invoice list by status
**テスト意図**: ステータスで請求一覧をフィルタリングできることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: ステータス「入金済」を選択し、1件に絞られ「INV-00002」が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-279
**件名**: S-08 請求一覧 - should filter invoice list when keyword is entered in search box
**テスト意図**: キーワード検索で請求一覧をフィルタリングできることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「追加作業」を入力し1件に絞られ「INV-00003」が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-280
**件名**: S-08 請求一覧 - should show invoice nav item for finance01 who has invoice:view
**テスト意図**: invoice:view権限を持つ finance01 ユーザには請求メニューが表示されることを確認する
**前提条件**: finance01 ユーザでログイン済み
**テスト内容**: [data-route="invoice"] が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`


### 請求対象抽出

### E2E-281
**件名**: S-08 請求対象抽出 - should show 請求対象抽出 button on invoice list
**テスト意図**: 請求一覧に「請求対象抽出」ボタンが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: #invoice-extract-btn が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-282
**件名**: S-08 請求対象抽出 - should show billable orders screen when 請求対象抽出 is clicked
**テスト意図**: 請求対象抽出ボタンをクリックすると請求対象画面が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 抽出ボタンをクリックし、.panel-label に「S-08 請求対象」が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-283
**件名**: S-08 請求対象抽出 - should show billable order in extraction list
**テスト意図**: 請求対象抽出画面に請求対象受注が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: [data-billable-order] が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-284
**件名**: S-08 請求対象抽出 - should show 請求起票 button for each billable order
**テスト意図**: 請求対象一覧の各行に「請求起票」ボタンが表示されることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: [data-action-create-invoice] が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-285
**件名**: S-08 請求対象抽出 - should pre-fill invoiceDate with today in billable list
**テスト意図**: 請求対象抽出画面の請求日に本日日付がデフォルト設定されることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: [data-inv-date-for] の最初の入力が空でないことを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-286
**件名**: S-08 請求対象抽出 - should pre-fill dueDate with end of current month in billable list
**テスト意図**: 請求対象抽出画面の支払期日に当月末日がデフォルト設定されることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: [data-inv-due-date-for] の最初の入力が空でないことを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-287
**件名**: S-08 請求対象抽出 - should create invoice from billable list and remain on billable screen
**テスト意図**: 請求起票ボタンをクリックしても請求対象画面に留まることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: 請求起票後も .panel-label に「S-08 請求対象」が表示されていることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-288
**件名**: S-08 請求対象抽出 - should show new invoice in list after creation
**テスト意図**: 請求起票後に一覧に戻ると新しい請求が7件目に表示されることを確認する
**前提条件**: 請求起票済み
**テスト内容**: 一覧に戻り .data-table-body-row が7件であることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-289
**件名**: S-08 請求対象抽出 - should not show invoiced order in billable list after invoice creation
**テスト意図**: 請求起票後に対象受注が請求対象一覧から除外されることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: 起票前後で [data-billable-order] の件数が1件減ることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-290
**件名**: S-08 請求対象抽出 - should allow editing invoiceDate before creating invoice
**テスト意図**: 請求起票前に請求日を変更できることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: 請求日を「2026-06-01」に変更して起票し、一覧に「2026-06-01」が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-291
**件名**: S-08 請求対象抽出 - should return to invoice list when 一覧に戻る is clicked
**テスト意図**: 「一覧に戻る」ボタンをクリックすると請求一覧に戻ることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: #invoice-back-to-list をクリックし、.data-table が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`


### 請求詳細

### E2E-292
**件名**: S-08 請求詳細 - should show invoice detail when detail button is clicked
**テスト意図**: 詳細ボタンをクリックすると請求詳細画面が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: INV-00001の詳細ボタンをクリックし、.panel-label に「S-08 請求詳細」が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-293
**件名**: S-08 請求詳細 - should show invoice code in detail
**テスト意図**: 請求詳細に請求コードが表示されることを確認する
**前提条件**: INV-00001の詳細画面を表示済み
**テスト内容**: .panel-content に「INV-00001」が含まれることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-294
**件名**: S-08 請求詳細 - should show customer name in detail
**テスト意図**: 請求詳細に顧客名が表示されることを確認する
**前提条件**: INV-00001の詳細画面を表示済み
**テスト内容**: .panel-content に「株式会社」が含まれることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-295
**件名**: S-08 請求詳細 - should show line items in detail
**テスト意図**: 請求詳細に請求明細セクションが表示されることを確認する
**前提条件**: INV-00001の詳細画面を表示済み
**テスト内容**: .detail-section-label に「請求明細」が含まれる要素が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-296
**件名**: S-08 請求詳細 - should show 確定する button for 下書き invoice
**テスト意図**: 下書きステータスの請求詳細に「確定する」ボタンが表示されることを確認する
**前提条件**: INV-00003（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-invoice-status="確定"] が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-297
**件名**: S-08 請求詳細 - should update status to 確定 when 確定する is clicked
**テスト意図**: 「確定する」ボタンをクリックするとステータスが「確定」に更新されることを確認する
**前提条件**: INV-00003（下書き）の詳細画面を表示済み
**テスト内容**: 確定ボタンをクリックし .status-badge が「確定」になることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-298
**件名**: S-08 請求詳細 - should show 送付済にする button when status is 確定
**テスト意図**: 確定ステータスになると「送付済にする」ボタンが表示されることを確認する
**前提条件**: INV-00003を確定済みに変更済み
**テスト内容**: [data-action-invoice-status="送付済"] が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-299
**件名**: S-08 請求詳細 - should update status to 送付済 when 送付済にする is clicked
**テスト意図**: 「送付済にする」ボタンをクリックするとステータスが「送付済」に更新されることを確認する
**前提条件**: INV-00003が確定済みの状態
**テスト内容**: 送付済ボタンをクリックし .status-badge が「送付済」になることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-300
**件名**: S-08 請求詳細 - should not show 確定する button when status is 送付済
**テスト意図**: 送付済ステータスの請求詳細には「確定する」ボタンが表示されないことを確認する
**前提条件**: INV-00001（送付済）の詳細画面を表示済み
**テスト内容**: [data-action-invoice-status="確定"] が非表示であることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-301
**件名**: S-08 請求詳細 - should show キャンセル button for 下書き invoice
**テスト意図**: 下書きステータスの請求詳細に「キャンセル」ボタンが表示されることを確認する
**前提条件**: INV-00003（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-invoice-status="キャンセル"] が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-302
**件名**: S-08 請求詳細 - should return to invoice list when 一覧に戻る is clicked
**テスト意図**: 詳細画面から「一覧に戻る」をクリックすると請求一覧に戻ることを確認する
**前提条件**: INV-00001の詳細画面を表示済み
**テスト内容**: #invoice-detail-back をクリックし .data-table が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-303
**件名**: S-08 請求詳細 - should show 印刷 button in invoice detail
**テスト意図**: 請求詳細に印刷ボタンが表示されることを確認する
**前提条件**: INV-00001の詳細画面を表示済み
**テスト内容**: [data-action-print-invoice="INV-00001"] が表示されることを確認する
**ファイル**: `e2e/invoice.spec.js`


### P10-RT-02 請求起票バリデーション

### E2E-304
**件名**: P10-RT-02 請求起票 バリデーション - should not create invoice when invoiceDate is cleared before clicking 請求起票
**テスト意図**: 請求日を空にすると請求起票が阻止されることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: 請求日を空にして請求起票ボタンをクリックし、[data-billable-order] の件数が変わらないことを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-305
**件名**: P10-RT-02 請求起票 バリデーション - should not create invoice when dueDate is cleared before clicking 請求起票
**テスト意図**: 支払期日を空にすると請求起票が阻止されることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: 支払期日を空にして請求起票ボタンをクリックし、[data-billable-order] の件数が変わらないことを確認する
**ファイル**: `e2e/invoice.spec.js`


### RT-05 伝票状態遷移制御

### E2E-306
**件名**: RT-05 伝票状態遷移制御 - 確定済み請求 - should show 確定 status badge on INV-00006
**テスト意図**: 確定ステータスでシードされた INV-00006 の詳細に「確定」バッジが表示されることを確認する
**前提条件**: INV-00006（確定）の詳細画面を表示済み
**テスト内容**: .status-badge の最初の要素が「確定」を含むことを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-307
**件名**: RT-05 伝票状態遷移制御 - 確定済み請求 - should not show 承認依頼 button on 確定 invoice INV-00006
**テスト意図**: 確定ステータスの請求詳細には「承認依頼」ボタンが表示されないことを確認する
**前提条件**: INV-00006（確定）の詳細画面を表示済み
**テスト内容**: #invoice-submit-approval-btn が非表示であることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-308
**件名**: RT-05 伝票状態遷移制御 - 確定済み請求 - should not show 下書きに戻す button on 確定 invoice INV-00006
**テスト意図**: 確定ステータスの請求詳細には「下書きに戻す」ボタンが表示されないことを確認する
**前提条件**: INV-00006（確定）の詳細画面を表示済み
**テスト内容**: #invoice-return-draft-btn が非表示であることを確認する
**ファイル**: `e2e/invoice.spec.js`

### E2E-309
**件名**: RT-05 伝票状態遷移制御 - 確定済み請求 - should only show 送付済にする and キャンセル buttons on 確定 invoice INV-00006
**テスト意図**: 確定ステータスの請求詳細には「送付済にする」と「キャンセル」のみが表示されることを確認する
**前提条件**: INV-00006（確定）の詳細画面を表示済み
**テスト内容**: 送付済とキャンセルボタンが表示され、「承認済み」ボタンは非表示であることを確認する
**ファイル**: `e2e/invoice.spec.js`


---

## P10-RT-04 データ連鎖整合性

### 発注→納品→請求 データ連鎖整合性

### E2E-310
**件名**: P10-RT-04 発注→納品→請求のデータ連鎖整合性 - should set purchase order status to 一部納品 after partial delivery
**テスト意図**: 部分納品後に発注ステータスが「一部納品」に更新されることを確認する
**前提条件**: ステートフルモック設定済み、POD-00002 が承認済み・発注待ち
**テスト内容**: POD-00002を発注済みに変更後、数量0で納品登録し .status-badge が「一部納品」になることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`

### E2E-311
**件名**: P10-RT-04 発注→納品→請求のデータ連鎖整合性 - should show 納品登録 button on 一部納品 purchase order for further delivery
**テスト意図**: 一部納品状態の発注にも納品登録ボタンが引き続き表示されることを確認する
**前提条件**: POD-00002が一部納品状態
**テスト内容**: [data-action-delivery-register="POD-00002"] が表示されることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`

### E2E-312
**件名**: P10-RT-04 発注→納品→請求のデータ連鎖整合性 - should show 納品実績 section in purchase order detail after delivery registration
**テスト意図**: 納品登録後に発注詳細に納品実績セクションが表示されることを確認する
**前提条件**: POD-00002に納品が登録済み
**テスト内容**: .detail-section-label に「納品実績」が含まれる要素が表示されることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`

### E2E-313
**件名**: P10-RT-04 発注→納品→請求のデータ連鎖整合性 - should show 納品済 status for fully delivered purchase order
**テスト意図**: 完全納品済みの発注に「納品済」ステータスが表示されることを確認する
**前提条件**: POD-00003 が DLV-00001 で完全納品済み
**テスト内容**: POD-00003の詳細を開き .status-badge.first() が「納品済」であることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`

### E2E-314
**件名**: P10-RT-04 発注→納品→請求のデータ連鎖整合性 - should show delivery history for 納品済 purchase order
**テスト意図**: 納品済み発注の詳細に納品実績と DLV-00001 レコードが表示されることを確認する
**前提条件**: POD-00003 が完全納品済み
**テスト内容**: 「納品実績」セクションと [data-delivery-code="DLV-00001"] が表示されることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`

### E2E-315
**件名**: P10-RT-04 発注→納品→請求のデータ連鎖整合性 - should not show delivery register button for 納品済 purchase order
**テスト意図**: 納品済み発注には納品登録ボタンが表示されないことを確認する
**前提条件**: POD-00003 が完全納品済み
**テスト内容**: [data-action-delivery-register="POD-00003"] が非表示であることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`

### E2E-316
**件名**: P10-RT-04 発注→納品→請求のデータ連鎖整合性 - should show consistent invoice total in linked invoice after purchase order delivery
**テスト意図**: 発注納品後にリンクされた請求の合計金額が変わらないことを確認する
**前提条件**: POD-00002（ORD-00002連携）に納品登録済み
**テスト内容**: INV-00003（ORD-00002連携）の詳細を開き .detail-grid に「385,000」が含まれることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`


### 入金登録→消込

### E2E-317
**件名**: P10-RT-04 入金登録→消込のデータ連鎖整合性 - should mark invoice as 消込済み after full payment receipt
**テスト意図**: 全額入金登録後に請求ステータスが「消込済み」に更新されることを確認する
**前提条件**: ステートフルモック設定済み、INV-00001（528,000円、送付済）
**テスト内容**: 528,000円の入金を登録し .status-badge が「消込済み」になることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`

### E2E-318
**件名**: P10-RT-04 入金登録→消込のデータ連鎖整合性 - should show remaining balance after partial payment
**テスト意図**: 部分入金後に残高が正しく表示されることを確認する
**前提条件**: ステートフルモック設定済み、INV-00001（528,000円）
**テスト内容**: 300,000円の部分入金を登録し #f-rcp-remaining に「228,000」が含まれることを確認する
**ファイル**: `e2e/zzz-data-chain.spec.js`


---

## S-04 見積一覧

### 見積一覧

### E2E-319
**件名**: S-04 見積一覧 - should display all 8 quotations when default page size is 20
**テスト意図**: デフォルトのページサイズ20で全8件の見積が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み、見積一覧画面を表示済み
**テスト内容**: .data-table-body-row が8件で .table-summary に「全 8 件中」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-320
**件名**: S-04 見積一覧 - should show project name (not code) in quotation list
**テスト意図**: 見積一覧にプロジェクトコードでなくプロジェクト名が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「新規保守案件」が表示され「PJ-00001」が含まれないことを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-321
**件名**: S-04 見積一覧 - should show customer name (not code) in quotation list
**テスト意図**: 見積一覧に顧客コードでなく顧客名が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「株式会社青葉システム」が表示され「CUS-001」が含まれないことを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-322
**件名**: S-04 見積一覧 - should show total amount formatted with yen in quotation list
**テスト意図**: 見積一覧に金額が円表示でフォーマットされることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .data-table に「660,000 円」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-323
**件名**: S-04 見積一覧 - should filter quotation list when keyword is entered in search box
**テスト意図**: キーワード検索で見積一覧をフィルタリングできることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「初回」を入力し2件に絞られることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-324
**件名**: S-04 見積一覧 - should filter quotation list by status
**テスト意図**: ステータスで見積一覧をフィルタリングできることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「下書き」を選択し2件に絞られることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-325
**件名**: S-04 見積一覧 - should show new-quotation button for admin
**テスト意図**: 管理者ユーザには新規見積ボタンが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: #new-quotation-btn が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`


### 見積ヘッダ登録

### E2E-326
**件名**: S-04 見積ヘッダ登録 - should auto-fill quotation code with next sequential value when form opens
**テスト意図**: 見積フォームを開くと次の連番コードが自動入力されることを確認する
**前提条件**: 新規見積フォームを開いた状態
**テスト内容**: #f-quo-code の値が「QUO-00009」であることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-327
**件名**: S-04 見積ヘッダ登録 - should show only 商談中 projects in project search dropdown
**テスト意図**: 案件検索ドロップダウンには「商談中」の案件のみが表示されることを確認する
**前提条件**: 新規見積フォームを開いた状態
**テスト内容**: 「システム」で検索し D社システム導入（商談中）が表示され新規保守案件は含まれないことを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-328
**件名**: S-04 見積ヘッダ登録 - should show customer name when project is selected from dropdown
**テスト意図**: ドロップダウンで案件を選択すると顧客名が自動表示されることを確認する
**前提条件**: 新規見積フォームを開いた状態
**テスト内容**: D社案件を選択し #quotation-customer-display に「新都建設エンジニアリング株式会社」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-329
**件名**: S-04 見積ヘッダ登録 - should show 下書き保存 and 承認依頼 buttons on new registration form
**テスト意図**: 新規登録フォームに「下書き保存」「承認依頼」「キャンセル」ボタンが表示されることを確認する
**前提条件**: 新規見積フォームを開いた状態
**テスト内容**: 各ボタンが表示されていることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-330
**件名**: S-04 見積ヘッダ登録 - should save as 下書き and return to list when 下書き保存 is clicked
**テスト意図**: 「下書き保存」をクリックすると下書きで保存され一覧に戻ることを確認する
**前提条件**: 必須項目（タイトル・案件・発行日）を入力済み
**テスト内容**: 下書き保存後、一覧に戻り「テスト見積（下書き）」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-331
**件名**: S-04 見積ヘッダ登録 - should save as 承認依頼中 and return to list when 承認依頼 is clicked
**テスト意図**: 「承認依頼」をクリックすると承認依頼中ステータスで保存されることを確認する
**前提条件**: 必須項目を入力済み
**テスト内容**: 承認依頼後、一覧に「承認依頼中」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-332
**件名**: S-04 見積ヘッダ登録 - should return to list when cancel button is clicked
**テスト意図**: キャンセルボタンをクリックすると一覧に戻ることを確認する
**前提条件**: 新規見積フォームを開いた状態
**テスト内容**: キャンセル後、データテーブルが表示され登録フォームが非表示になることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-333
**件名**: S-04 見積ヘッダ登録 - should show validation error when required fields are empty
**テスト意図**: 必須項目が空のままで下書き保存するとバリデーションエラーが表示されることを確認する
**前提条件**: 新規見積フォームを開いた状態
**テスト内容**: 下書き保存をクリックし「見積件名は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`


### 見積明細登録

### E2E-334
**件名**: S-04 見積明細登録 - should show detail section with add-line button on registration form
**テスト意図**: 見積フォームに明細セクションと行追加ボタンが表示されることを確認する
**前提条件**: 新規見積フォームを開いた状態
**テスト内容**: .detail-section と #add-detail-line が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-335
**件名**: S-04 見積明細登録 - should add a new detail line when add-line button is clicked
**テスト意図**: 行追加ボタンをクリックすると明細行が1件追加されることを確認する
**前提条件**: 新規見積フォームを開いた状態
**テスト内容**: #add-detail-line をクリックし .detail-line が1件になることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-336
**件名**: S-04 見積明細登録 - should auto-fill product name and unit price when product is selected
**テスト意図**: 商品を選択すると商品名と単価が自動入力されることを確認する
**前提条件**: 明細行が1件追加済み
**テスト内容**: PRD-001を選択し商品名が「サーバー保守サービス」、単価が「50000」になることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-337
**件名**: S-04 見積明細登録 - should remove detail line when delete button is clicked
**テスト意図**: 削除ボタンをクリックすると明細行が削除されることを確認する
**前提条件**: 明細行が2件追加済み
**テスト内容**: 1行目の削除ボタンをクリックし .detail-line が1件になることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-338
**件名**: S-04 見積明細登録 - should show subtotal and total in detail totals section
**テスト意図**: 明細を入力すると合計セクションに金額が表示されることを確認する
**前提条件**: 明細に商品を選択済み
**テスト内容**: .detail-totals に「円」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-339
**件名**: S-04 見積明細登録 - should save quotation with detail lines when 下書き保存 is clicked
**テスト意図**: 明細付きで下書き保存すると一覧に反映されることを確認する
**前提条件**: ヘッダと明細を入力済み
**テスト内容**: 下書き保存後、一覧に「明細テスト見積」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-340
**件名**: S-04 見積明細登録 - should show existing detail lines when editing a quotation
**テスト意図**: 見積編集時に既存の明細行が表示されることを確認する
**前提条件**: QUO-00001（明細1行あり）を編集モードで開いた状態
**テスト内容**: .detail-line が1件で商品名が「サーバー保守サービス」であることを確認する
**ファイル**: `e2e/quotation.spec.js`


### 見積詳細表示

### E2E-341
**件名**: S-04 見積詳細表示 - should show quotation detail when detail button is clicked
**テスト意図**: 詳細ボタンをクリックすると見積詳細が表示されることを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: QUO-00001の詳細を開き「新規保守案件 初回見積」と .detail-grid が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-342
**件名**: S-04 見積詳細表示 - should show project name and customer name in detail view
**テスト意図**: 見積詳細にプロジェクト名と顧客名が表示されることを確認する
**前提条件**: QUO-00001の詳細画面を表示済み
**テスト内容**: .detail-grid に「新規保守案件」と「株式会社青葉システム」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-343
**件名**: S-04 見積詳細表示 - should show detail lines in detail view
**テスト意図**: 見積詳細に明細行が表示されることを確認する
**前提条件**: QUO-00001の詳細画面を表示済み
**テスト内容**: .detail-line が1件で「サーバー保守サービス」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-344
**件名**: S-04 見積詳細表示 - should show totals in detail view
**テスト意図**: 見積詳細に合計金額が表示されることを確認する
**前提条件**: QUO-00001の詳細画面を表示済み
**テスト内容**: .detail-totals に「660,000 円」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-345
**件名**: S-04 見積詳細表示 - should return to list when back button is clicked on detail screen
**テスト意図**: 詳細画面の戻るボタンで一覧に戻ることを確認する
**前提条件**: QUO-00001の詳細画面を表示済み
**テスト内容**: 戻るボタンをクリックし .data-table が表示され .detail-grid が非表示になることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-346
**件名**: S-04 見積詳細表示 - should show edit button on detail screen for 下書き quotation
**テスト意図**: 下書きステータスの見積詳細に編集ボタンが表示されることを確認する
**前提条件**: QUO-00002（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-edit-quotation="QUO-00002"] が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-347
**件名**: S-04 見積詳細表示 - should not show edit button on detail screen for 承認依頼中 quotation
**テスト意図**: 承認依頼中ステータスの見積詳細には編集ボタンが表示されないことを確認する
**前提条件**: QUO-00003（承認依頼中）の詳細画面を表示済み
**テスト内容**: [data-action-edit-quotation="QUO-00003"] が非表示であることを確認する
**ファイル**: `e2e/quotation.spec.js`


### 見積ワークフロー

### E2E-348
**件名**: S-04 見積ワークフロー - should show 承認する and 却下する buttons when opening 承認依頼中 quotation
**テスト意図**: 承認依頼中の見積編集画面に「承認する」「却下する」ボタンが表示されることを確認する
**前提条件**: QUO-00003（承認依頼中）の編集画面を開いた状態
**テスト内容**: 「承認する」「却下する」ボタンが表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-349
**件名**: S-04 見積ワークフロー - should update status to 承認済み when 承認する is clicked
**テスト意図**: 「承認する」をクリックすると見積ステータスが「承認済み」に更新されることを確認する
**前提条件**: QUO-00003が承認依頼中
**テスト内容**: 承認後、一覧の QUO-00003 行に「承認済み」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-350
**件名**: S-04 見積ワークフロー - should show 失注に変更 button when opening 承認済み quotation
**テスト意図**: 承認済みの見積編集画面に「失注に変更」ボタンが表示されることを確認する
**前提条件**: QUO-00001（承認済み）の編集画面を開いた状態
**テスト内容**: 「失注に変更」ボタンが表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-351
**件名**: S-04 見積ワークフロー - should update status to 失注 when 失注に変更 is clicked
**テスト意図**: 「失注に変更」をクリックすると見積ステータスが「失注」に更新されることを確認する
**前提条件**: QUO-00001が承認済み
**テスト内容**: 失注変更後、一覧の QUO-00001 行に「失注」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-352
**件名**: S-04 見積ワークフロー - should show reject reason textarea when 承認依頼中 quotation is opened
**テスト意図**: 承認依頼中の見積編集画面に却下理由入力フィールドが表示されることを確認する
**前提条件**: QUO-00003（承認依頼中）の編集画面を開いた状態
**テスト内容**: #f-quo-reject-reason が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-353
**件名**: S-04 見積ワークフロー - should show validation error when 却下する is clicked without reject reason
**テスト意図**: 却下理由なしで「却下する」をクリックするとバリデーションエラーが表示されることを確認する
**前提条件**: QUO-00003の却下ボタンをクリックした状態
**テスト内容**: 「却下理由は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-354
**件名**: S-04 見積ワークフロー - should update status to 取消 when reject reason is entered and 却下する is clicked
**テスト意図**: 却下理由を入力して「却下する」をクリックするとステータスが「取消」に更新されることを確認する
**前提条件**: QUO-00003が承認依頼中
**テスト内容**: 却下理由入力後に却下し、一覧の QUO-00003 行に「取消」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-355
**件名**: S-04 見積ワークフロー - should show reject reason on detail view after rejection
**テスト意図**: 却下後に見積詳細で却下理由が表示されることを確認する
**前提条件**: QUO-00003が却下済み
**テスト内容**: QUO-00003の詳細を開き .detail-grid に却下理由テキストが表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`


### 見積改版

### E2E-356
**件名**: S-04 見積改版 - should show 改版 button on detail screen for 承認済み quotation
**テスト意図**: 承認済みの見積詳細に「改版」ボタンが表示されることを確認する
**前提条件**: QUO-00001（承認済み）の詳細画面を表示済み
**テスト内容**: [data-action-revise-quotation="QUO-00001"] が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-357
**件名**: S-04 見積改版 - should not show 改版 button on detail screen for 下書き quotation
**テスト意図**: 下書きの見積詳細には「改版」ボタンが表示されないことを確認する
**前提条件**: QUO-00002（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-revise-quotation="QUO-00002"] が非表示であることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-358
**件名**: S-04 見積改版 - should open edit form with incremented version when 改版 is clicked
**テスト意図**: 「改版」をクリックすると版数がインクリメントされた編集フォームが開くことを確認する
**前提条件**: QUO-00001（承認済み）の詳細画面を表示済み
**テスト内容**: 改版ボタンをクリックし #f-quo-version の値が「2」であることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-359
**件名**: S-04 見積改版 - should assign new quotation code to revised quotation
**テスト意図**: 改版した見積には新しい連番コードが付与されることを確認する
**前提条件**: QUO-00001（承認済み）の詳細画面を表示済み
**テスト内容**: 改版フォームの #f-quo-code が「QUO-00009」であることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-360
**件名**: S-04 見積改版 - should save revised quotation and show it in list
**テスト意図**: 改版した見積を保存すると一覧に表示されることを確認する
**前提条件**: 改版フォームを開いた状態
**テスト内容**: 下書き保存後、一覧に「QUO-00009」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`


### 見積PDF出力

### E2E-361
**件名**: S-04 見積PDF出力 - should show PDF出力 button on quotation detail screen
**テスト意図**: 見積詳細画面にPDF出力ボタンが表示されることを確認する
**前提条件**: QUO-00001の詳細画面を表示済み
**テスト内容**: [data-action-print-quotation="QUO-00001"] が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-362
**件名**: S-04 見積PDF出力 - should open print window containing quotation title when PDF出力 is clicked
**テスト意図**: PDF出力ボタンをクリックすると見積タイトルを含む印刷ウィンドウが開くことを確認する
**前提条件**: QUO-00001の詳細画面を表示済み
**テスト内容**: ポップアップが開き body に「新規保守案件 初回見積」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-363
**件名**: S-04 見積PDF出力 - should include customer name in print window
**テスト意図**: 印刷ウィンドウに顧客名が含まれることを確認する
**前提条件**: QUO-00001の詳細画面を表示済み
**テスト内容**: ポップアップの body に「株式会社青葉システム」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-364
**件名**: S-04 見積PDF出力 - should include total amount in print window
**テスト意図**: 印刷ウィンドウに合計金額が含まれることを確認する
**前提条件**: QUO-00001の詳細画面を表示済み
**テスト内容**: ポップアップの body に「660,000」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`


### 見積 権限制御

### E2E-365
**件名**: S-04 見積 権限制御 - should show quotation list and new-quotation button for sales01
**テスト意図**: sales01 ユーザには見積一覧と新規見積ボタンが表示されることを確認する
**前提条件**: sales01 ユーザでログイン済み
**テスト内容**: データテーブルと #new-quotation-btn が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-366
**件名**: S-04 見積 権限制御 - should not show quotation nav item for finance01 who lacks quotation:view
**テスト意図**: quotation:view権限を持たない finance01 ユーザには見積メニューが非表示になることを確認する
**前提条件**: finance01 ユーザでログイン済み
**テスト内容**: [data-route="quotation"] が非表示であることを確認する
**ファイル**: `e2e/quotation.spec.js`


### P10-RT-01 見積却下→修正→再申請

### E2E-367
**件名**: P10-RT-01 見積却下→修正→再申請 - should show 下書きに戻す button on quotation detail after rejection
**テスト意図**: 却下後の見積詳細に「下書きに戻す」ボタンが表示されることを確認する
**前提条件**: 承認一覧から QUO-00003 を却下済み
**テスト内容**: QUO-00003の詳細を開き #quotation-return-draft-btn が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-368
**件名**: P10-RT-01 見積却下→修正→再申請 - should complete full reject→return-to-draft→resubmit→approve flow
**テスト意図**: 却下→下書き戻し→再承認依頼→承認の完全フローが動作することを確認する
**前提条件**: QUO-00003が承認依頼中
**テスト内容**: 却下→下書き戻し→再承認依頼→承認の6ステップを実行し最終的に「承認済み」になることを確認する
**ファイル**: `e2e/quotation.spec.js`


### P10-RT-05 大量データ・ページネーション

### E2E-369
**件名**: P10-RT-05 大量データ・ページネーション動作確認 - should show all 8 quotations on page 1 when page size is 20
**テスト意図**: ページサイズ20のとき全8件が1ページに表示されることを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: 8件が表示され「全 8 件中 8 件を表示」と「1 / 1 ページ」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-370
**件名**: P10-RT-05 大量データ・ページネーション動作確認 - should show 5 rows and page 1 of 2 when page size is changed to 5
**テスト意図**: ページサイズを5に変更すると5件表示でページ1/2になることを確認する
**前提条件**: 見積一覧を表示済み
**テスト内容**: ページサイズ5を選択し5件表示・「1 / 2 ページ」が確認される
**ファイル**: `e2e/quotation.spec.js`

### E2E-371
**件名**: P10-RT-05 大量データ・ページネーション動作確認 - should show remaining 3 rows on page 2 when next is clicked with page size 5
**テスト意図**: ページサイズ5でページ2に移動すると残り3件が表示されることを確認する
**前提条件**: ページサイズ5でページ1を表示済み
**テスト内容**: 次ページボタンをクリックし3件・「2 / 2 ページ」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-372
**件名**: P10-RT-05 大量データ・ページネーション動作確認 - should return to page 1 with 5 rows when prev is clicked from page 2
**テスト意図**: ページ2から前ページボタンでページ1に戻れることを確認する
**前提条件**: ページサイズ5でページ2を表示済み
**テスト内容**: 前ページボタンをクリックし5件・「1 / 2 ページ」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-373
**件名**: P10-RT-05 大量データ・ページネーション動作確認 - should disable prev button on page 1 and next button on last page
**テスト意図**: ページ1では前ページボタンが無効で最終ページでは次ページボタンが無効になることを確認する
**前提条件**: ページサイズ5で見積一覧を表示済み
**テスト内容**: ページ1で prevが無効、ページ2で nextが無効であることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-374
**件名**: P10-RT-05 大量データ・ページネーション動作確認 - should show all rows on single page when page size is increased back to 20
**テスト意図**: ページサイズを20に戻すと全8件が1ページに表示されることを確認する
**前提条件**: ページサイズ5でページ1を表示済み
**テスト内容**: ページサイズ20に変更し8件・「1 / 1 ページ」が表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`


### P10-RT-02 見積バリデーション

### E2E-375
**件名**: P10-RT-02 見積バリデーション - should show 案件は必須です error when project is not selected on submit
**テスト意図**: 案件未選択で下書き保存するとバリデーションエラーが表示されることを確認する
**前提条件**: 新規見積フォームでタイトルと日付のみ入力済み
**テスト内容**: 下書き保存をクリックし「案件は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-376
**件名**: P10-RT-02 見積バリデーション - should show 発行日は必須です error when issue date is empty on submit
**テスト意図**: 発行日が空のまま下書き保存するとバリデーションエラーが表示されることを確認する
**前提条件**: 新規見積フォームでタイトルと案件のみ入力済み
**テスト内容**: 下書き保存をクリックし「発行日は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-377
**件名**: P10-RT-02 見積バリデーション - should show all required field errors simultaneously when form is submitted completely empty
**テスト意図**: 全必須項目が空のまま下書き保存するとすべてのバリデーションエラーが同時に表示されることを確認する
**前提条件**: 新規見積フォームを開いた状態（未入力）
**テスト内容**: 下書き保存をクリックし3つのバリデーションエラーが同時に表示されることを確認する
**ファイル**: `e2e/quotation.spec.js`


### RT-05 伝票状態遷移制御

### E2E-378
**件名**: RT-05 伝票状態遷移制御 - 取消済み見積 - should not show 受注作成 button on 取消 quotation QUO-00008
**テスト意図**: 取消ステータスの見積詳細には「受注作成」ボタンが表示されないことを確認する
**前提条件**: QUO-00008（取消）の詳細画面を表示済み
**テスト内容**: [data-action-create-order="QUO-00008"] が非表示であることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-379
**件名**: RT-05 伝票状態遷移制御 - 取消済み見積 - should show 取消 status badge on QUO-00008 detail
**テスト意図**: 取消ステータスの見積詳細に「取消」バッジが表示されることを確認する
**前提条件**: QUO-00008（取消）の詳細画面を表示済み
**テスト内容**: .status.first() に「取消」が含まれることを確認する
**ファイル**: `e2e/quotation.spec.js`

### E2E-380
**件名**: RT-05 伝票状態遷移制御 - 取消済み見積 - should not show 編集 button on 取消 quotation
**テスト意図**: 取消ステータスの見積詳細には編集ボタンが表示されないことを確認する
**前提条件**: QUO-00008（取消）の詳細画面を表示済み
**テスト内容**: [data-action-edit-quotation="QUO-00008"] が非表示であることを確認する
**ファイル**: `e2e/quotation.spec.js`


---

## S-05 受注一覧

### 受注一覧

### E2E-381
**件名**: S-05 受注一覧 - should display order list with 6 rows
**テスト意図**: 受注一覧に6件以上の受注が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み、受注一覧画面を表示済み
**テスト内容**: .data-table-body-row が6件以上で .table-summary に「全 」が含まれることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-382
**件名**: S-05 受注一覧 - should show project name (not code) in order list
**テスト意図**: 受注一覧にプロジェクトコードでなくプロジェクト名が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「新規保守案件」が表示され「PJ-00001」が含まれないことを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-383
**件名**: S-05 受注一覧 - should show customer name (not code) in order list
**テスト意図**: 受注一覧に顧客コードでなく顧客名が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「株式会社青葉システム」が表示され「CUS-001」が含まれないことを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-384
**件名**: S-05 受注一覧 - should show total amount formatted with yen in order list
**テスト意図**: 受注一覧に金額が円表示でフォーマットされることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .data-table に「660,000 円」が含まれることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-385
**件名**: S-05 受注一覧 - should filter order list when keyword is entered in search box
**テスト意図**: キーワード検索で受注一覧をフィルタリングできることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「保守」を入力し3件に絞られることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-386
**件名**: S-05 受注一覧 - should filter order list by status
**テスト意図**: ステータスで受注一覧をフィルタリングできることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「完了」を選択し1件に絞られることを確認する
**ファイル**: `e2e/order.spec.js`


### 受注作成

### E2E-387
**件名**: S-05 受注作成 - should show 受注作成 button on detail screen for 承認済み quotation
**テスト意図**: 承認済みの見積詳細に「受注作成」ボタンが表示されることを確認する
**前提条件**: QUO-00001（承認済み）の詳細画面を表示済み
**テスト内容**: [data-action-create-order="QUO-00001"] が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-388
**件名**: S-05 受注作成 - should not show 受注作成 button for 下書き quotation
**テスト意図**: 下書きの見積詳細には「受注作成」ボタンが表示されないことを確認する
**前提条件**: QUO-00002（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-create-order="QUO-00002"] が非表示であることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-389
**件名**: S-05 受注作成 - should open order form pre-filled with quotation data when 受注作成 is clicked
**テスト意図**: 「受注作成」をクリックすると見積データが事前入力された受注フォームが開くことを確認する
**前提条件**: QUO-00001（承認済み）の詳細画面を表示済み
**テスト内容**: 受注フォームが開き #f-order-quotation-code が「QUO-00001」、#f-order-title が「新規保守案件 初回見積」であることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-390
**件名**: S-05 受注作成 - should auto-fill order code with next sequential value when form opens
**テスト意図**: 受注フォームを開くと次の連番コードが自動入力されることを確認する
**前提条件**: QUO-00001から受注フォームを開いた状態
**テスト内容**: #f-order-code の値が「ORD-00007」であることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-391
**件名**: S-05 受注作成 - should show validation error when order date is empty
**テスト意図**: 受注日が空のまま受注登録するとバリデーションエラーが表示されることを確認する
**前提条件**: 受注フォームを開いた状態
**テスト内容**: 受注登録をクリックし「受注日は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-392
**件名**: S-05 受注作成 - should show validation error when order title is cleared on submit
**テスト意図**: タイトルを空にして受注登録するとバリデーションエラーが表示されることを確認する
**前提条件**: 受注フォームでタイトルを空欄にした状態
**テスト内容**: 受注登録をクリックし「受注件名は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-393
**件名**: S-05 受注作成 - should save order and show it in order list when 受注登録 is clicked
**テスト意図**: 受注登録が成功すると受注一覧に表示されることを確認する
**前提条件**: 受注日を入力済み
**テスト内容**: 受注登録後、一覧に「ORD-00007」が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-394
**件名**: S-05 受注作成 - should return to quotation detail when キャンセル is clicked
**テスト意図**: キャンセルをクリックすると見積詳細に戻ることを確認する
**前提条件**: 受注フォームを開いた状態
**テスト内容**: キャンセル後、.detail-grid が表示され受注フォームが非表示になることを確認する
**ファイル**: `e2e/order.spec.js`


### 受注添付

### E2E-395
**件名**: S-05 受注添付 - should show file input on order form
**テスト意図**: 受注フォームにファイル入力フィールドが表示されることを確認する
**前提条件**: 受注フォームを開いた状態
**テスト内容**: #f-order-attachment が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-396
**件名**: S-05 受注添付 - should show uploaded file name in attachment list after file is selected
**テスト意図**: ファイルを選択すると添付リストにファイル名が表示されることを確認する
**前提条件**: 受注フォームを開いた状態
**テスト内容**: 「契約書.pdf」をアップロードし .attachment-list と .attachment-name に「契約書.pdf」が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-397
**件名**: S-05 受注添付 - should remove attachment when 削除 is clicked
**テスト意図**: 削除ボタンをクリックすると添付ファイルが削除されることを確認する
**前提条件**: 添付ファイルが1件登録済み
**テスト内容**: 削除ボタンをクリックし .attachment-item が0件になることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-398
**件名**: S-05 受注添付 - should save order with attachments after registration
**テスト意図**: 添付ファイル付きで受注登録できることを確認する
**前提条件**: 「注文書.pdf」添付済み、受注日入力済み
**テスト内容**: 受注登録後、一覧に「ORD-00007」が表示されることを確認する
**ファイル**: `e2e/order.spec.js`


### 受注詳細

### E2E-399
**件名**: S-05 受注詳細 - should show order code in detail view
**テスト意図**: 受注詳細に受注コードが表示されることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: .detail-grid に「ORD-00001」が含まれることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-400
**件名**: S-05 受注詳細 - should show project name (not code) in detail view
**テスト意図**: 受注詳細にプロジェクトコードでなくプロジェクト名が表示されることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: 「新規保守案件」が表示され「PJ-00001」が含まれないことを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-401
**件名**: S-05 受注詳細 - should show customer name (not code) in detail view
**テスト意図**: 受注詳細に顧客コードでなく顧客名が表示されることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: 「株式会社青葉システム」が表示され「CUS-001」が含まれないことを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-402
**件名**: S-05 受注詳細 - should show status badge in detail view
**テスト意図**: 受注詳細にステータスバッジが表示されることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: .status-badge が表示され「受注済み」が含まれることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-403
**件名**: S-05 受注詳細 - should return to order list when 一覧に戻る is clicked
**テスト意図**: 「一覧に戻る」をクリックすると受注一覧に戻ることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: #order-detail-back をクリックし .data-table が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-404
**件名**: S-05 受注詳細 - should show 完了 status badge for order completed by full payment
**テスト意図**: 入金完了の受注詳細に「完了」ステータスバッジが表示されることを確認する
**前提条件**: ORD-00003（完了）の詳細画面を表示済み
**テスト内容**: .status-badge.first() が「完了」を含むことを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-405
**件名**: S-05 受注詳細 - should update status to キャンセル when キャンセル button is clicked
**テスト意図**: キャンセルボタンをクリックするとステータスが「キャンセル」に更新されることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: キャンセルボタンをクリックし .status-badge.first() が「キャンセル」になることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-406
**件名**: S-05 受注詳細 - should not show 完了にする button
**テスト意図**: 受注詳細に「完了にする」ボタンが表示されないことを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: [data-action-order-status="完了"] が非表示であることを確認する
**ファイル**: `e2e/order.spec.js`


### 発注起票・請求対象化

### E2E-407
**件名**: S-05 発注起票・請求対象化 - should show 発注起票 button when order status is 受注済み
**テスト意図**: 受注済みステータスの受注詳細に「発注起票」ボタンが表示されることを確認する
**前提条件**: ORD-00001（受注済み）の詳細画面を表示済み
**テスト内容**: [data-action-create-purchase-order="ORD-00001"] が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-408
**件名**: S-05 発注起票・請求対象化 - should not show 発注起票 button when order status is 完了
**テスト意図**: 完了ステータスの受注詳細には「発注起票」ボタンが表示されないことを確認する
**前提条件**: ORD-00003（完了）の詳細画面を表示済み
**テスト内容**: [data-action-create-purchase-order] が非表示であることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-409
**件名**: S-05 発注起票・請求対象化 - should show 請求対象化 button when order status is 受注済み and not yet billing target
**テスト意図**: 未請求対象の受注済み受注詳細に「請求対象化」ボタンが表示されることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: [data-action-billing-target="ORD-00001"] が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-410
**件名**: S-05 発注起票・請求対象化 - should show 請求対象 badge and hide 請求対象化 button after clicking 請求対象化
**テスト意図**: 「請求対象化」ボタンをクリックすると請求対象バッジが表示されボタンが非表示になることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: 請求対象化後、ボタンが非表示になり「請求対象」テキストが表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-411
**件名**: S-05 発注起票・請求対象化 - should not show 請求対象化 button when order is already billing target
**テスト意図**: 既に請求対象となっている受注詳細には「請求対象化」ボタンが表示されないことを確認する
**前提条件**: ORD-00003（完了・請求対象済み）の詳細画面を表示済み
**テスト内容**: [data-action-billing-target] が非表示であることを確認する
**ファイル**: `e2e/order.spec.js`


### 受注 権限制御

### E2E-412
**件名**: S-05 受注 権限制御 - should show 受注一覧 nav item for sales01
**テスト意図**: sales01 ユーザには受注一覧メニューが表示されることを確認する
**前提条件**: sales01 ユーザでログイン済み
**テスト内容**: [data-route="sales-order"] が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-413
**件名**: S-05 受注 権限制御 - should not show 受注 nav item for finance01 who lacks sales-order:view
**テスト意図**: sales-order:view権限を持たない finance01 には受注メニューが非表示になることを確認する
**前提条件**: finance01 ユーザでログイン済み
**テスト内容**: [data-route="sales-order"] が非表示であることを確認する
**ファイル**: `e2e/order.spec.js`


### P10-RT-02 受注承認依頼バリデーション

### E2E-414
**件名**: P10-RT-02 受注承認依頼バリデーション - should show alert with attachment required message when submitting approval without attachment
**テスト意図**: 添付ファイルなしで承認依頼すると必要メッセージのアラートが表示されることを確認する
**前提条件**: ORD-00001（受注済み・添付なし）の詳細画面を表示済み
**テスト内容**: 承認依頼ボタンをクリックしてアラートに「契約書または注文書のいずれか1ファイル以上の添付が必要です。」が含まれることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-415
**件名**: P10-RT-02 受注承認依頼バリデーション - should keep 受注済み status when approval is blocked by missing attachment
**テスト意図**: 添付ファイル不足で承認がブロックされた場合にステータスが「受注済み」のまま維持されることを確認する
**前提条件**: ORD-00001（受注済み・添付なし）の詳細画面を表示済み
**テスト内容**: アラートを却下後もステータスが「受注済み」のままであることを確認する
**ファイル**: `e2e/order.spec.js`


### P10-RT-01 受注却下→修正→再申請フロー

### E2E-416
**件名**: P10-RT-01 受注却下→修正→再申請フロー - should show 却下 status after rejecting ORD-00006 from approval list
**テスト意図**: 承認一覧から却下操作後に受注ステータスが「却下」になることを確認する
**前提条件**: ORD-00006 が承認依頼中でシード済み
**テスト内容**: 却下後、ORD-00006の詳細で .status-badge.first() が「却下」になることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-417
**件名**: P10-RT-01 受注却下→修正→再申請フロー - should show 下書きに戻す button on rejected ORD-00006
**テスト意図**: 却下された受注詳細に「下書きに戻す」ボタンが表示されることを確認する
**前提条件**: ORD-00006 が却下済み
**テスト内容**: #order-return-draft-btn が表示されることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-418
**件名**: P10-RT-01 受注却下→修正→再申請フロー - should return ORD-00006 to 受注済み when 下書きに戻す is clicked
**テスト意図**: 「下書きに戻す」をクリックするとステータスが「受注済み」に戻ることを確認する
**前提条件**: ORD-00006 が却下済み
**テスト内容**: #order-return-draft-btn をクリックし .status-badge.first() が「受注済み」になることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-419
**件名**: P10-RT-01 受注却下→修正→再申請フロー - should allow resubmitting ORD-00006 for approval after returning to 受注済み
**テスト意図**: 受注済みに戻した後に再度承認依頼できることを確認する
**前提条件**: ORD-00006 が受注済みに戻った状態（シードデータの添付ファイルあり）
**テスト内容**: 承認依頼ボタンをクリックし「承認依頼中」になることを確認する
**ファイル**: `e2e/order.spec.js`

### E2E-420
**件名**: P10-RT-01 受注却下→修正→再申請フロー - should reach 承認済み status after full reject→return→resubmit→approve cycle
**テスト意図**: 却下→下書き戻し→再申請→承認の完全サイクルが動作することを確認する
**前提条件**: ORD-00006 が承認依頼中
**テスト内容**: 4ステップの完全サイクルを実行し最終的に「承認済み」になることを確認する
**ファイル**: `e2e/order.spec.js`


---

## S-06 発注一覧

### 発注一覧

### E2E-421
**件名**: S-06 発注一覧 - should display purchase order list with correct row count
**テスト意図**: 発注一覧に6件以上の発注が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み、発注一覧画面を表示済み
**テスト内容**: .data-table-body-row が6件以上で .table-summary に「全 」が含まれることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-422
**件名**: S-06 発注一覧 - should show supplier name (not code) in purchase order list
**テスト意図**: 発注一覧に仕入先コードでなく仕入先名が表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「株式会社日本テクノロジー」が表示され「SUP-001」が含まれないことを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-423
**件名**: S-06 発注一覧 - should show order code in purchase order list
**テスト意図**: 発注一覧に受注コードが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .data-table に「ORD-00001」が含まれることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-424
**件名**: S-06 発注一覧 - should show total amount formatted with yen in purchase order list
**テスト意図**: 発注一覧に金額が円表示でフォーマットされることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: .data-table に「528,000 円」が含まれることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-425
**件名**: S-06 発注一覧 - should filter purchase order list when keyword is entered in search box
**テスト意図**: キーワード検索で発注一覧をフィルタリングできることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「セキュリティ」を入力し1件に絞られることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-426
**件名**: S-06 発注一覧 - should filter purchase order list by status
**テスト意図**: ステータスで発注一覧をフィルタリングできることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: 「納品済」を選択し3件に絞られることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 発注起票

### E2E-427
**件名**: S-06 発注起票 - should open purchase order form pre-filled with order data
**テスト意図**: 発注起票フォームが受注データで事前入力された状態で開くことを確認する
**前提条件**: ORD-00001の詳細から発注起票フォームを開いた状態
**テスト内容**: #f-pod-order-code が「ORD-00001」、#f-pod-title が「新規保守案件 初回見積」であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-428
**件名**: S-06 発注起票 - should auto-fill purchase order code with next sequential value
**テスト意図**: 発注フォームを開くと次の連番コードが自動入力されることを確認する
**前提条件**: 発注起票フォームを開いた状態
**テスト内容**: #f-pod-code の値が「POD-00007」であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-429
**件名**: S-06 発注起票 - should show validation error when supplier is not selected
**テスト意図**: 仕入先未選択で発注登録するとバリデーションエラーが表示されることを確認する
**前提条件**: 発注起票フォームで日付のみ入力済み
**テスト内容**: 発注登録をクリックし「仕入先は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-430
**件名**: S-06 発注起票 - should show validation error when order date is empty
**テスト意図**: 発注日が空のまま発注登録するとバリデーションエラーが表示されることを確認する
**前提条件**: 発注起票フォームで仕入先のみ選択済み
**テスト内容**: 発注登録をクリックし「発注日は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-431
**件名**: S-06 発注起票 - should save purchase order and show it in purchase order list
**テスト意図**: 発注登録が成功すると発注一覧に表示されることを確認する
**前提条件**: 仕入先と発注日を入力済み
**テスト内容**: 発注登録後、一覧に「POD-00007」が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-432
**件名**: S-06 発注起票 - should return to order detail when キャンセル is clicked
**テスト意図**: キャンセルをクリックすると受注詳細に戻ることを確認する
**前提条件**: 発注起票フォームを開いた状態
**テスト内容**: キャンセル後、.detail-grid が表示され発注フォームが非表示になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 発注新規作成

### E2E-433
**件名**: S-06 発注新規作成 - should show 新規発注 button on purchase order list
**テスト意図**: 発注一覧に「新規発注」ボタンが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: #new-purchase-order-btn が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-434
**件名**: S-06 発注新規作成 - should open empty purchase order form when 新規発注 is clicked
**テスト意図**: 「新規発注」をクリックすると空のフォームが開くことを確認する
**前提条件**: 発注一覧を表示済み
**テスト内容**: フォームが開き #f-pod-title が空で #f-pod-order-code-input が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-435
**件名**: S-06 発注新規作成 - should save standalone purchase order and show it in list
**テスト意図**: スタンドアロン発注が登録され一覧に表示されることを確認する
**前提条件**: 発注フォームに必須項目を入力済み
**テスト内容**: 発注登録後、一覧に「スタンドアロン発注テスト」が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 発注添付

### E2E-436
**件名**: S-06 発注添付 - should show file input on purchase order form
**テスト意図**: 発注フォームにファイル入力フィールドが表示されることを確認する
**前提条件**: 新規発注フォームを開いた状態
**テスト内容**: #f-pod-attachment が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-437
**件名**: S-06 発注添付 - should show uploaded file name in attachment list after file is selected
**テスト意図**: ファイルを選択すると添付リストにファイル名が表示されることを確認する
**前提条件**: 新規発注フォームを開いた状態
**テスト内容**: 「発注書.pdf」をアップロードし .attachment-list と .attachment-name が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-438
**件名**: S-06 発注添付 - should remove attachment when 削除 is clicked
**テスト意図**: 削除ボタンをクリックすると添付ファイルが削除されることを確認する
**前提条件**: 「発注書.pdf」添付済み
**テスト内容**: 削除ボタンをクリックし .attachment-item が0件になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 仕入先別分割

### E2E-439
**件名**: S-06 仕入先別分割 - should show order detail lines with checkboxes in purchase order form
**テスト意図**: 発注フォームに受注明細チェックボックスが表示されることを確認する
**前提条件**: ORD-00001から発注起票フォームを開いた状態
**テスト内容**: .pod-line-check が2件で「サーバー保守サービス」「ネットワーク機器保守」が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-440
**件名**: S-06 仕入先別分割 - should have all lines checked by default
**テスト意図**: 発注フォームを開いた時すべての明細行がチェック済みであることを確認する
**前提条件**: 発注起票フォームを開いた状態
**テスト内容**: チェックボックス0番目と1番目が両方チェック済みであることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-441
**件名**: S-06 仕入先別分割 - should update total when a line is unchecked
**テスト意図**: 明細行のチェックを外すと合計金額が更新されることを確認する
**前提条件**: 発注起票フォームを開いた状態
**テスト内容**: 明細行2のチェックを外し、合計が「528,000 円」に更新されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-442
**件名**: S-06 仕入先別分割 - should save purchase order with only selected lines
**テスト意図**: 選択した明細のみで発注が保存されることを確認する
**前提条件**: 明細行2のチェックを外した状態
**テスト内容**: 発注登録後、一覧に「POD-00007」と「528,000 円」が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 発注詳細

### E2E-443
**件名**: S-06 発注詳細 - should show purchase order code in detail view
**テスト意図**: 発注詳細に発注コードが表示されることを確認する
**前提条件**: POD-00001の詳細画面を表示済み
**テスト内容**: .detail-grid に「POD-00001」が含まれることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-444
**件名**: S-06 発注詳細 - should show supplier name (not code) in detail view
**テスト意図**: 発注詳細に仕入先コードでなく仕入先名が表示されることを確認する
**前提条件**: POD-00001の詳細画面を表示済み
**テスト内容**: 「株式会社日本テクノロジー」が表示され「SUP-001」が含まれないことを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-445
**件名**: S-06 発注詳細 - should show status badge 下書き in detail view
**テスト意図**: 発注詳細にステータスバッジ「下書き」が表示されることを確認する
**前提条件**: POD-00001（下書き）の詳細画面を表示済み
**テスト内容**: .status-badge が表示され「下書き」が含まれることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-446
**件名**: S-06 発注詳細 - should return to purchase order list when 一覧に戻る is clicked
**テスト意図**: 「一覧に戻る」をクリックすると発注一覧に戻ることを確認する
**前提条件**: POD-00001の詳細画面を表示済み
**テスト内容**: #pod-detail-back をクリックし .data-table が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-447
**件名**: S-06 発注詳細 - should update status to 取下げ when 取下げ is clicked
**テスト意図**: 「取下げ」をクリックするとステータスが「取下げ」に更新されることを確認する
**前提条件**: POD-00001（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-pod-status="取下げ"] をクリックし .status-badge.first() が「取下げ」になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-448
**件名**: S-06 発注詳細 - should show 納品済 status for already delivered order
**テスト意図**: 納品済みの発注詳細に「納品済」ステータスが表示されることを確認する
**前提条件**: POD-00003（納品済）の詳細画面を表示済み
**テスト内容**: .status-badge.first() が「納品済」を含むことを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-449
**件名**: S-06 発注詳細 - should not show 発注確定 button when status is 下書き
**テスト意図**: 下書きステータスの発注詳細には「発注確定」ボタンが表示されないことを確認する
**前提条件**: POD-00001（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-pod-status="発注済"] が非表示であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-450
**件名**: S-06 発注詳細 - should not show 取下げ button when status is 承認依頼中
**テスト意図**: 承認依頼中ステータスでは「取下げ」ボタンが非表示になることを確認する
**前提条件**: POD-00001で承認依頼ボタンをクリックした後
**テスト内容**: [data-action-pod-status="取下げ"] が非表示であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-451
**件名**: S-06 発注詳細 - should show 発注書出力 button in purchase order detail
**テスト意図**: 発注詳細に「発注書出力」ボタンが表示されることを確認する
**前提条件**: POD-00001の詳細画面を表示済み
**テスト内容**: [data-action-print-pod="POD-00001"] が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-452
**件名**: S-06 発注詳細 - should show 発注書出力 button regardless of status
**テスト意図**: 発注書出力ボタンはステータスに関わらず表示されることを確認する
**前提条件**: POD-00003（納品済）の詳細画面を表示済み
**テスト内容**: [data-action-print-pod="POD-00003"] が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 発注承認依頼

### E2E-453
**件名**: S-06 発注承認依頼 - should show 下書き as initial status when purchase order is created
**テスト意図**: 新規作成した発注の初期ステータスが「下書き」であることを確認する
**前提条件**: 新規発注を登録済み
**テスト内容**: POD-00007の詳細を開き .status-badge.first() が「下書き」であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-454
**件名**: S-06 発注承認依頼 - should update status to 承認依頼中 when 承認依頼 button is clicked
**テスト意図**: 承認依頼ボタンをクリックするとステータスが「承認依頼中」に更新されることを確認する
**前提条件**: POD-00001（下書き）の詳細画面を表示済み
**テスト内容**: #pod-submit-approval-btn をクリックし .status-badge.first() が「承認依頼中」になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-455
**件名**: S-06 発注承認依頼 - should show 却下 button when status is 承認依頼中
**テスト意図**: 承認依頼中ステータスの発注詳細に「却下」ボタンが表示されることを確認する
**前提条件**: POD-00001が承認依頼中
**テスト内容**: #pod-reject-btn が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-456
**件名**: S-06 発注承認依頼 - should update status to 却下 when 却下 is clicked
**テスト意図**: 却下ボタンをクリックするとステータスが「却下」に更新されることを確認する
**前提条件**: POD-00001が承認依頼中
**テスト内容**: 却下理由を入力して確定し、発注一覧に戻って詳細を確認すると「却下」になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-457
**件名**: S-06 発注承認依頼 - should show 発注確定 button when status is 承認済・発注待ち
**テスト意図**: 承認済・発注待ちステータスの発注詳細に「発注確定」ボタンが表示されることを確認する
**前提条件**: POD-00002（承認済・発注待ち）の詳細画面を表示済み
**テスト内容**: [data-action-pod-status="発注済"] が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-458
**件名**: S-06 発注承認依頼 - should update status to 発注済 when 発注確定 is clicked
**テスト意図**: 「発注確定」をクリックするとステータスが「発注済」に更新されることを確認する
**前提条件**: POD-00002（承認済・発注待ち）の詳細画面を表示済み
**テスト内容**: 発注確定をクリックし .status-badge.first() が「発注済」になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-459
**件名**: S-06 発注承認依頼 - should show 納品登録 button when status is 発注済
**テスト意図**: 発注済みステータスの発注詳細に「納品登録」ボタンが表示されることを確認する
**前提条件**: POD-00002を発注済みに変更済み
**テスト内容**: [data-action-delivery-register="POD-00002"] が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-460
**件名**: S-06 発注承認依頼 - should update status to 納品済 after 発注確定 and 納品登録
**テスト意図**: 発注確定後に納品登録するとステータスが「納品済」に更新されることを確認する
**前提条件**: POD-00002が発注済み
**テスト内容**: 納品日を入力して登録し .status-badge.first() が「納品済」になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 契約書類出力

### E2E-461
**件名**: S-06 契約書類出力 - should show 契約書類出力 button when status is 承認済・発注待ち
**テスト意図**: 承認済・発注待ちステータスの発注詳細に「契約書類出力」ボタンが表示されることを確認する
**前提条件**: POD-00002（承認済・発注待ち）の詳細画面を表示済み
**テスト内容**: [data-action-contract-process="POD-00002"] が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-462
**件名**: S-06 契約書類出力 - should not show 契約書類出力 button when status is 下書き
**テスト意図**: 下書きステータスの発注詳細には「契約書類出力」ボタンが表示されないことを確認する
**前提条件**: POD-00001（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-contract-process="POD-00001"] が非表示であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-463
**件名**: S-06 契約書類出力 - should not show 契約書類出力 button when status is 納品済
**テスト意図**: 納品済みステータスの発注詳細には「契約書類出力」ボタンが表示されないことを確認する
**前提条件**: POD-00003（納品済）の詳細画面を表示済み
**テスト内容**: [data-action-contract-process="POD-00003"] が非表示であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-464
**件名**: S-06 契約書類出力 - should open print window with purchase order content when 契約書類出力 is clicked
**テスト意図**: 「契約書類出力」をクリックすると発注書内容を含む印刷ウィンドウが開くことを確認する
**前提条件**: POD-00002（承認済・発注待ち）の詳細画面を表示済み
**テスト内容**: ポップアップが開き h1 に「発 注 書」、body に「POD-00002」が含まれることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 契約処理方法

### E2E-465
**件名**: S-06 契約処理方法 - should show contract method select on purchase order form
**テスト意図**: 発注フォームに契約処理方法セレクトが表示されることを確認する
**前提条件**: 新規発注フォームを開いた状態
**テスト内容**: #f-pod-contract-method が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-466
**件名**: S-06 契約処理方法 - should have 注文請書 as selectable option
**テスト意図**: 「注文請書」が選択可能なオプションとして存在することを確認する
**前提条件**: 新規発注フォームを開いた状態
**テスト内容**: 「注文請書」を選択し #f-pod-contract-method の値が「注文請書」であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-467
**件名**: S-06 契約処理方法 - should save contract method and show in detail view
**テスト意図**: 契約処理方法を選択して保存すると詳細画面に表示されることを確認する
**前提条件**: 発注フォームで契約処理方法「発注書」を選択済み
**テスト内容**: 発注登録後、POD-00007の詳細で「発注書」が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### P10-RT-02 発注バリデーション

### E2E-468
**件名**: P10-RT-02 発注バリデーション - should show 発注件名は必須です error when title is empty for standalone purchase order
**テスト意図**: スタンドアロン発注でタイトルが空のまま登録するとバリデーションエラーが表示されることを確認する
**前提条件**: 新規発注フォームで仕入先と日付のみ入力済み
**テスト内容**: 発注登録をクリックし「発注件名は必須です。」エラーが表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-469
**件名**: P10-RT-02 発注バリデーション - should show all required field errors simultaneously when standalone purchase order form is submitted empty
**テスト意図**: スタンドアロン発注フォームを空のまま送信すると全必須項目エラーが同時表示されることを確認する
**前提条件**: 新規発注フォームを開いた状態（未入力）
**テスト内容**: 発注登録をクリックし3つのエラーが同時に表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-470
**件名**: P10-RT-02 発注バリデーション - should clear field errors and succeed after correcting all required fields
**テスト意図**: バリデーションエラー後に全項目を入力すると登録が成功することを確認する
**前提条件**: バリデーションエラーが発生した状態
**テスト内容**: 全必須項目を入力して発注登録し、一覧に戻り登録データが表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### 発注 権限制御

### E2E-471
**件名**: S-06 発注 権限制御 - should show 発注一覧 nav item for sales01
**テスト意図**: sales01 ユーザには発注一覧メニューが表示されることを確認する
**前提条件**: sales01 ユーザでログイン済み
**テスト内容**: [data-route="purchase-order"] が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-472
**件名**: S-06 発注 権限制御 - should not show 発注 nav item for finance01 who lacks purchase-order:view
**テスト意図**: purchase-order:view権限を持たない finance01 には発注メニューが非表示になることを確認する
**前提条件**: finance01 ユーザでログイン済み
**テスト内容**: [data-route="purchase-order"] が非表示であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### P10-RT-01 発注却下フロー

### E2E-473
**件名**: P10-RT-01 発注却下フロー - should show 却下 status in purchase order list after rejection
**テスト意図**: 却下操作後に発注一覧で「却下」ステータスが表示されることを確認する
**前提条件**: POD-00001が承認依頼中に遷移済み
**テスト内容**: 却下後に発注一覧で POD-00001 の行が「却下」を含むことを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-474
**件名**: P10-RT-01 発注却下フロー - should show 却下 status badge in purchase order detail after rejection
**テスト意図**: 却下後の発注詳細に「却下」ステータスバッジが表示されることを確認する
**前提条件**: POD-00001が却下済み
**テスト内容**: POD-00001の詳細を開き .status-badge.first() が「却下」であることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


### P10-RT-01 発注却下→修正→再申請フロー（完全フロー）

### E2E-475
**件名**: P10-RT-01 発注却下→修正→再申請フロー（完全フロー） - should show 却下 status on POD-00006 after rejection from approval list
**テスト意図**: 承認依頼中の POD-00006 を却下すると詳細で「却下」ステータスが表示されることを確認する
**前提条件**: POD-00006 が承認依頼中でシード済み
**テスト内容**: 却下後 POD-00006の詳細で「却下」が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-476
**件名**: P10-RT-01 発注却下→修正→再申請フロー（完全フロー） - should show 下書きに戻す button on rejected POD-00006
**テスト意図**: 却下後の POD-00006 詳細に「下書きに戻す」ボタンが表示されることを確認する
**前提条件**: POD-00006 が却下済み
**テスト内容**: #pod-return-draft-btn が表示されることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-477
**件名**: P10-RT-01 発注却下→修正→再申請フロー（完全フロー） - should return POD-00006 to 下書き when 下書きに戻す is clicked
**テスト意図**: 「下書きに戻す」をクリックするとステータスが「下書き」に戻ることを確認する
**前提条件**: POD-00006 が却下済み
**テスト内容**: #pod-return-draft-btn をクリックし .status-badge.first() が「下書き」になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-478
**件名**: P10-RT-01 発注却下→修正→再申請フロー（完全フロー） - should allow resubmitting POD-00006 for approval after returning to 下書き
**テスト意図**: 下書きに戻した後に再度承認依頼できることを確認する
**前提条件**: POD-00006 が下書きに戻った状態
**テスト内容**: #pod-submit-approval-btn をクリックし「承認依頼中」になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`

### E2E-479
**件名**: P10-RT-01 発注却下→修正→再申請フロー（完全フロー） - should reach 承認済・発注待ち after full reject→return→resubmit→approve cycle
**テスト意図**: 却下→下書き戻し→再申請→承認の完全サイクルで「承認済・発注待ち」になることを確認する
**前提条件**: POD-00006 が承認依頼中
**テスト内容**: 4ステップの完全サイクルを実行し「承認済・発注待ち」になることを確認する
**ファイル**: `e2e/purchaseOrder.spec.js`


---

## S-07 納品登録

### 納品登録

### E2E-480
**件名**: S-07 納品登録 - should show 納品登録 button for 発注済 purchase order
**テスト意図**: 発注済みステータスの発注詳細に「納品登録」ボタンが表示されることを確認する
**前提条件**: POD-00002を発注済みに変更済み
**テスト内容**: [data-action-delivery-register="POD-00002"] が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-481
**件名**: S-07 納品登録 - should not show 納品登録 button for 下書き purchase order
**テスト意図**: 下書きステータスの発注詳細には「納品登録」ボタンが表示されないことを確認する
**前提条件**: POD-00001（下書き）の詳細画面を表示済み
**テスト内容**: [data-action-delivery-register] が非表示であることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-482
**件名**: S-07 納品登録 - should show delivery form when 納品登録 button clicked
**テスト意図**: 納品登録ボタンをクリックすると納品登録フォームが表示されることを確認する
**前提条件**: POD-00002が発注済み
**テスト内容**: .panel-label に「S-07 納品登録」が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-483
**件名**: S-07 納品登録 - should show generated delivery code in form
**テスト意図**: 納品登録フォームに自動採番された納品コードが表示されることを確認する
**前提条件**: 納品登録フォームを表示済み
**テスト内容**: #f-dlv-code の値が「DLV-\d{5}」のパターンであることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-484
**件名**: S-07 納品登録 - should show purchase order code in form
**テスト意図**: 納品登録フォームに発注コードが表示されることを確認する
**前提条件**: POD-00002の納品登録フォームを表示済み
**テスト内容**: #f-dlv-pod-code の値が「POD-00002」であることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-485
**件名**: S-07 納品登録 - should show validation error when deliveryDate is empty
**テスト意図**: 納品日が空のまま送信するとバリデーションエラーが表示されることを確認する
**前提条件**: 納品登録フォームを表示済み
**テスト内容**: 送信をクリックし .error-message に「納品日は必須です」が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-486
**件名**: S-07 納品登録 - should register delivery and return to detail when form submitted
**テスト意図**: 納品日を入力して送信すると発注詳細画面に戻ることを確認する
**前提条件**: 納品日「2026-06-20」を入力済み
**テスト内容**: 送信後 .panel-label に「S-06 発注詳細」が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-487
**件名**: S-07 納品登録 - should update purchase order status to 納品済 after delivery registration
**テスト意図**: 納品登録後に発注ステータスが「納品済」に更新されることを確認する
**前提条件**: 納品日「2026-06-20」を入力して登録済み
**テスト内容**: .status-badge が「納品済」になることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-488
**件名**: S-07 納品登録 - should show registered delivery in 納品実績 section
**テスト意図**: 登録した納品が「納品実績」セクションに表示されることを確認する
**前提条件**: 備考「検収依頼済み」付きで納品登録済み
**テスト内容**: .detail-section-label に「納品実績」が含まれることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-489
**件名**: S-07 納品登録 - should return to detail screen when cancel button clicked
**テスト意図**: キャンセルボタンをクリックすると発注詳細に戻ることを確認する
**前提条件**: 納品登録フォームを表示済み
**テスト内容**: #delivery-form-cancel をクリックし「S-06 発注詳細」が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-490
**件名**: S-07 納品登録 - should show existing deliveries in POD-00003 detail
**テスト意図**: 既納品の POD-00003 詳細に納品実績と DLV-00001 が表示されることを確認する
**前提条件**: POD-00003（納品済み）の詳細画面を表示済み
**テスト内容**: 「納品実績」セクションと [data-delivery-code="DLV-00001"] が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`


### 検収結果登録

### E2E-491
**件名**: S-07 検収結果登録 - should show 検収済にする button for 検収待ち delivery
**テスト意図**: 検収待ちの納品に「検収済にする」ボタンが表示されることを確認する
**前提条件**: 納品登録済み（検収待ち）
**テスト内容**: [data-action-accept-delivery] が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-492
**件名**: S-07 検収結果登録 - should show 検収NG button for 検収待ち delivery
**テスト意図**: 検収待ちの納品に「検収NG」ボタンが表示されることを確認する
**前提条件**: 納品登録済み（検収待ち）
**テスト内容**: [data-action-reject-delivery] が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-493
**件名**: S-07 検収結果登録 - should update delivery status to 検収済 when 検収済にする is clicked
**テスト意図**: 「検収済にする」をクリックすると納品ステータスが「検収済」に更新されることを確認する
**前提条件**: 納品登録済み（検収待ち）
**テスト内容**: [data-action-accept-delivery] をクリックし当該納品行の3番目の要素が「検収済」になることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-494
**件名**: S-07 検収結果登録 - should update delivery status to 検収NG when 検収NG is clicked
**テスト意図**: 「検収NG」をクリックすると納品ステータスが「検収NG」に更新されることを確認する
**前提条件**: 納品登録済み（検収待ち）
**テスト内容**: [data-action-reject-delivery] をクリックし当該納品行の3番目の要素が「検収NG」になることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-495
**件名**: S-07 検収結果登録 - should not show 検収済にする button after delivery is accepted
**テスト意図**: 検収済み後は「検収済にする」ボタンが非表示になることを確認する
**前提条件**: 検収済み操作後
**テスト内容**: [data-action-accept-delivery] が非表示であることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-496
**件名**: S-07 検収結果登録 - should show 検収済 status for DLV-00001 which is already accepted
**テスト意図**: 既に検収済みの DLV-00001 が「検収済」ステータスで表示されることを確認する
**前提条件**: POD-00003（納品済み）の詳細画面を表示済み
**テスト内容**: [data-delivery-code="DLV-00001"] の3番目の要素が「検収済」であることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-497
**件名**: S-07 検収結果登録 - should not show inspection buttons for already accepted delivery
**テスト意図**: 検収済みの納品には検収操作ボタンが表示されないことを確認する
**前提条件**: POD-00003（DLV-00001 検収済み）の詳細画面を表示済み
**テスト内容**: [data-action-accept-delivery] と [data-action-reject-delivery] が非表示であることを確認する
**ファイル**: `e2e/delivery.spec.js`


### 一部納品対応

### E2E-498
**件名**: S-07 一部納品対応 - should show delivery quantity input for each PO detail line
**テスト意図**: 納品登録フォームに発注明細行の数量入力が表示されることを確認する
**前提条件**: POD-00002の納品登録フォームを表示済み
**テスト内容**: #f-dlv-qty-1 が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-499
**件名**: S-07 一部納品対応 - should set status to 一部納品 when partial quantities delivered
**テスト意図**: 一部の数量のみ納品するとステータスが「一部納品」になることを確認する
**前提条件**: 数量0で納品登録
**テスト内容**: .status-badge が「一部納品」になることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-500
**件名**: S-07 一部納品対応 - should set status to 納品済 when all quantities delivered
**テスト意図**: 全数量を納品するとステータスが「納品済」になることを確認する
**前提条件**: 全数量で納品登録
**テスト内容**: .status-badge が「納品済」になることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-501
**件名**: S-07 一部納品対応 - should show 納品登録 button when status is 一部納品
**テスト意図**: 一部納品状態でも「納品登録」ボタンが引き続き表示されることを確認する
**前提条件**: 一部納品後の発注詳細画面
**テスト内容**: [data-action-delivery-register="POD-00002"] が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-502
**件名**: S-07 一部納品対応 - should accumulate deliveries and reach 納品済 after second delivery
**テスト意図**: 2回の納品で「納品済」に達することを確認する
**前提条件**: 1回目（数量0）で一部納品後
**テスト内容**: 2回目の納品登録後 .status-badge が「納品済」になることを確認する
**ファイル**: `e2e/delivery.spec.js`


### P10-RT-04 発注→納品→請求 データ連鎖整合性

### E2E-503
**件名**: P10-RT-04 発注→納品→請求 データ連鎖整合性 - should show 一部納品 and keep delivery registration available after partial delivery
**テスト意図**: 一部納品後もステータスと納品登録ボタンが正しく表示されることを確認する
**前提条件**: POD-00002を一部納品（数量0）
**テスト内容**: ステータス「一部納品」と [data-action-delivery-register="POD-00002"] が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-504
**件名**: P10-RT-04 発注→納品→請求 データ連鎖整合性 - should show complete delivery history for POD-00003 in 納品済 state
**テスト意図**: 納品済みの POD-00003 に DLV-00001 の完全な履歴が表示されることを確認する
**前提条件**: POD-00003（納品済み）の詳細画面を表示済み
**テスト内容**: ステータス「納品済」と [data-delivery-code="DLV-00001"] が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-505
**件名**: P10-RT-04 発注→納品→請求 データ連鎖整合性 - should list ORD-00003 in billable orders after POD-00003 delivery chain is complete
**テスト意図**: POD-00003の納品連鎖完了後、ORD-00003が請求対象一覧に表示されることを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: [data-billable-order="ORD-00003"] が表示されることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-506
**件名**: P10-RT-04 発注→納品→請求 データ連鎖整合性 - should display correct invoice amount for ORD-00003 matching its order total
**テスト意図**: ORD-00003の請求対象金額が受注合計（132,000円）と一致することを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: [data-billable-order="ORD-00003"] に「132,000」が含まれることを確認する
**ファイル**: `e2e/delivery.spec.js`

### E2E-507
**件名**: P10-RT-04 発注→納品→請求 データ連鎖整合性 - should exclude ORD-00002 from billable list when billing target is not set
**テスト意図**: 請求対象フラグがない受注（ORD-00002）は請求対象一覧に表示されないことを確認する
**前提条件**: 請求対象抽出画面を表示済み
**テスト内容**: [data-billable-order="ORD-00002"] が非表示であることを確認する
**ファイル**: `e2e/delivery.spec.js`


---

## RT-01 フルフロー（End-to-End）

### Step 1: 見積承認フロー

### E2E-508
**件名**: RT-01 Step 1: 見積承認フロー - should show 承認依頼 button on 下書き quotation and correct total
**テスト意図**: 下書き見積の編集画面に承認依頼ボタンと金額が表示されることを確認する
**前提条件**: ステートフルモックで QUO-00002 が下書き状態
**テスト内容**: 「承認依頼」ボタンが表示され .detail-amount.first() に「220,000」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-509
**件名**: RT-01 Step 1: 見積承認フロー - should change quotation status to 承認依頼中 after submitting for approval
**テスト意図**: 承認依頼をクリックすると見積ステータスが「承認依頼中」に変化することを確認する
**前提条件**: QUO-00002（下書き）の編集フォームを表示済み
**テスト内容**: 承認依頼をクリックし .status.first() が「承認依頼中」になることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-510
**件名**: RT-01 Step 1: 見積承認フロー - should change quotation status to 承認済み after approval
**テスト意図**: 承認一覧から承認操作後に見積ステータスが「承認済み」になることを確認する
**前提条件**: QUO-00002が承認依頼中のモック状態
**テスト内容**: 承認操作後に見積詳細で .status-badge.first() が「承認済み」になることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-511
**件名**: RT-01 Step 1: 見積承認フロー - should verify quotation total is 220,000 yen throughout approval flow
**テスト意図**: 承認済み後も見積合計金額が220,000円で変わらないことを確認する
**前提条件**: QUO-00002が承認済みのモック状態
**テスト内容**: 見積詳細の .detail-totals に「220,000」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`


### Step 2: 受注承認フロー

### E2E-512
**件名**: RT-01 Step 2: 受注承認フロー - should show 承認依頼 button on 受注済み order and correct total
**テスト意図**: 受注済みの受注詳細に承認依頼ボタンと金額が表示されることを確認する
**前提条件**: ステートフルモックで ORD-00001 が受注済み状態
**テスト内容**: #order-submit-approval-btn が表示され .detail-grid に「220,000」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-513
**件名**: RT-01 Step 2: 受注承認フロー - should show quotationCode QUO-00002 in order detail confirming quotation linkage
**テスト意図**: 受注詳細に見積コード「QUO-00002」が表示され連携が確認できることを確認する
**前提条件**: ORD-00001の詳細画面を表示済み
**テスト内容**: .detail-grid に「QUO-00002」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-514
**件名**: RT-01 Step 2: 受注承認フロー - should change order status to 承認依頼中 after submitting for approval
**テスト意図**: 承認依頼後に承認一覧経由で承認すると承認一覧に戻ることを確認する
**前提条件**: ORD-00001が承認依頼中のモック状態
**テスト内容**: 承認操作後に .data-table が表示され URL が #approval になることを確認する
**ファイル**: `e2e/full-flow.spec.js`


### Step 3: 発注・納品フロー

### E2E-515
**件名**: RT-01 Step 3: 発注・納品フロー - should show 発注済 button on 承認済・発注待ち purchase order
**テスト意図**: 承認済・発注待ちの発注詳細に「発注済」変更ボタンが表示されることを確認する
**前提条件**: POD-00001が承認済・発注待ちのモック状態
**テスト内容**: [data-action-pod-status="発注済"] が表示されることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-516
**件名**: RT-01 Step 3: 発注・納品フロー - should register delivery for 発注済 purchase order
**テスト意図**: 発注済み後に納品登録ボタンが表示されることを確認する
**前提条件**: POD-00001を発注済みに変更済み
**テスト内容**: [data-action-delivery-register="POD-00001"] が表示されることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-517
**件名**: RT-01 Step 3: 発注・納品フロー - should show 納品済 status after delivery registration
**テスト意図**: 納品登録後に発注ステータスが「納品済」になることを確認する
**前提条件**: 発注済みから納品日を入力して登録
**テスト内容**: .status-badge.first() が「納品済」になることを確認する
**ファイル**: `e2e/full-flow.spec.js`


### Step 4: 請求承認フロー

### E2E-518
**件名**: RT-01 Step 4: 請求承認フロー - should show 承認依頼 button on 下書き invoice and verify amount matches order
**テスト意図**: 下書き請求に承認依頼ボタンと受注と同額（220,000円）が表示されることを確認する
**前提条件**: INV-00003が下書きのモック状態
**テスト内容**: #invoice-submit-approval-btn が表示され .detail-grid に「220,000」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-519
**件名**: RT-01 Step 4: 請求承認フロー - should show orderCode ORD-00001 in invoice confirming order linkage
**テスト意図**: 請求詳細に受注コード「ORD-00001」が表示され受注との連携が確認できることを確認する
**前提条件**: INV-00003の詳細画面を表示済み
**テスト内容**: .detail-grid に「ORD-00001」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-520
**件名**: RT-01 Step 4: 請求承認フロー - should change invoice status to 承認依頼中 after submitting for approval
**テスト意図**: 承認依頼をクリックすると請求ステータスが「承認依頼中」になることを確認する
**前提条件**: INV-00003（下書き）の詳細画面を表示済み
**テスト内容**: #invoice-submit-approval-btn をクリックし .status-badge.first() が「承認依頼中」になることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-521
**件名**: RT-01 Step 4: 請求承認フロー - should change invoice status to 承認済み after approval
**テスト意図**: 承認一覧から承認操作後に請求ステータスが「承認済み」になることを確認する
**前提条件**: INV-00003が承認依頼中のモック状態
**テスト内容**: 承認操作後に請求詳細で .status-badge.first() が「承認済み」になることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-522
**件名**: RT-01 Step 4: 請求承認フロー - should change invoice status to 送付済 after marking as sent
**テスト意図**: 「送付済にする」をクリックすると請求ステータスが「送付済」になることを確認する
**前提条件**: INV-00003が確定ステータスのモック状態
**テスト内容**: [data-action-invoice-status="送付済"] をクリックし .status-badge.first() が「送付済」になることを確認する
**ファイル**: `e2e/full-flow.spec.js`


### Step 5: 入金登録・消込フロー

### E2E-523
**件名**: RT-01 Step 5: 入金登録・消込フロー - should show 入金登録 button on 送付済 invoice
**テスト意図**: 送付済み請求に「入金登録」ボタンが表示されることを確認する
**前提条件**: INV-00003が送付済みのモック状態
**テスト内容**: [data-action-register-receipt="INV-00003"] が表示されることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-524
**件名**: RT-01 Step 5: 入金登録・消込フロー - should show receipt form with correct invoice code when 入金登録 is clicked
**テスト意図**: 入金登録フォームに正しい請求コードが表示されることを確認する
**前提条件**: INV-00003の入金登録フォームを表示済み
**テスト内容**: #f-rcp-invoice-code に「INV-00003」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-525
**件名**: RT-01 Step 5: 入金登録・消込フロー - should show remaining balance of 220,000 yen in receipt form confirming data chain
**テスト意図**: 入金フォームの未収残高が220,000円（データ連鎖整合性の最終確認）であることを確認する
**前提条件**: 入金登録フォームを表示済み
**テスト内容**: #f-rcp-remaining に「220,000」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-526
**件名**: RT-01 Step 5: 入金登録・消込フロー - should require receiptDate and amount to register receipt
**テスト意図**: 入金日なしで登録しようとするとバリデーションエラーが表示されることを確認する
**前提条件**: 金額のみ入力した状態
**テスト内容**: 送信後 .error-message に「入金日」が含まれることを確認する
**ファイル**: `e2e/full-flow.spec.js`

### E2E-527
**件名**: RT-01 Step 5: 入金登録・消込フロー - should register full receipt and show 消込済み status
**テスト意図**: 全額入金登録後に請求ステータスが「消込済み」になることを確認する
**前提条件**: 入金日と全額を入力済み
**テスト内容**: 送信後 .status-badge.first() が「消込済み」になることを確認する
**ファイル**: `e2e/full-flow.spec.js`


---

## P0-09 請求承認フロー

### P0-09 請求承認フロー（3段階）

### E2E-528
**件名**: P0-09 請求承認フロー（3段階） - should show 承認依頼 button on invoice detail when status is 下書き
**テスト意図**: 下書きステータスの請求詳細に「承認依頼」ボタンが表示されることを確認する
**前提条件**: INV-00003（下書き）の詳細画面を表示済み
**テスト内容**: #invoice-submit-approval-btn が表示されることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-529
**件名**: P0-09 請求承認フロー（3段階） - should change status to 承認依頼中 when 承認依頼 is clicked
**テスト意図**: 承認依頼をクリックするとステータスが「承認依頼中」に変化することを確認する
**前提条件**: INV-00003の詳細画面で #invoice-submit-approval-btn をクリック済み
**テスト内容**: .status-badge.first() が「承認依頼中」になることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-530
**件名**: P0-09 請求承認フロー（3段階） - should show 承認する and 却下 buttons on invoice detail when status is 承認依頼中
**テスト意図**: 承認依頼中の請求詳細に「承認する」と「却下」ボタンが表示されることを確認する
**前提条件**: 承認一覧に請求タイプの承認依頼が存在する
**テスト内容**: #invoice-approve-btn と #invoice-reject-btn が表示されることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-531
**件名**: P0-09 請求承認フロー（3段階） - should expand comment panel when 承認する is clicked on invoice detail
**テスト意図**: 「承認する」をクリックするとコメントパネルが展開されることを確認する
**前提条件**: 承認一覧から請求詳細を表示済み
**テスト内容**: #approval-comment-input と #approval-confirm-approve が表示されることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-532
**件名**: P0-09 請求承認フロー（3段階） - should approve invoice and return to approval list
**テスト意図**: 請求を承認すると承認一覧に戻ることを確認する
**前提条件**: 承認一覧から請求詳細を表示済み
**テスト内容**: 承認確定後 .data-table が表示され URL が #approval になることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-533
**件名**: P0-09 請求承認フロー（3段階） - should show 確定する button after approval (stage 3)
**テスト意図**: 承認後に請求詳細の「確定する」ボタンが表示されることを確認する
**前提条件**: 承認操作後に INV-00005 の詳細を表示済み
**テスト内容**: [data-action-invoice-status="確定"] が表示されることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-534
**件名**: P0-09 請求承認フロー（3段階） - should expand comment panel when 却下 is clicked
**テスト意図**: 「却下」をクリックするとコメントパネルが展開されることを確認する
**前提条件**: 承認一覧から請求詳細を表示済み
**テスト内容**: #approval-comment-input と #approval-confirm-reject が表示されることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-535
**件名**: P0-09 請求承認フロー（3段階） - should show error when 却下 confirmed without comment
**テスト意図**: コメントなしで却下を確定するとエラーが表示されることを確認する
**前提条件**: 却下パネルが展開済み
**テスト内容**: #approval-confirm-reject をクリックし .error-message が表示されることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-536
**件名**: P0-09 請求承認フロー（3段階） - should reject invoice with comment and return to approval list
**テスト意図**: コメント付きで却下すると承認一覧に戻ることを確認する
**前提条件**: 却下パネルが展開済み
**テスト内容**: コメントを入力して却下確定し、.data-table が表示され URL が #approval になることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-537
**件名**: P0-09 請求承認フロー（3段階） - should show 承認一覧に戻る button when navigating from approval list
**テスト意図**: 承認一覧から請求詳細に遷移した場合、戻るボタンに「承認一覧に戻る」が表示されることを確認する
**前提条件**: 承認一覧から請求詳細画面に遷移済み
**テスト内容**: #invoice-detail-back のテキストが「承認一覧に戻る」であることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`


### P10-RT-01 請求却下→修正→再申請

### E2E-538
**件名**: P10-RT-01 請求却下→修正→再申請 - should show 下書きに戻す button on invoice detail after rejection
**テスト意図**: 却下後の請求詳細に「下書きに戻す」ボタンが表示されることを確認する
**前提条件**: INV-00003が却下済み
**テスト内容**: #invoice-return-draft-btn が表示されることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`

### E2E-539
**件名**: P10-RT-01 請求却下→修正→再申請 - should complete full reject→return-to-draft→resubmit→approve flow for invoice
**テスト意図**: 却下→下書き戻し→再申請→承認の完全フローが動作することを確認する
**前提条件**: INV-00003が下書き状態
**テスト内容**: 7ステップの完全フローを実行し最終的に「承認済み」になることを確認する
**ファイル**: `e2e/invoice-approval.spec.js`


---

## P0-08 受注承認フロー

### E2E-540
**件名**: P0-08 受注承認フロー - should show 承認する and 却下 buttons on order detail when status is 承認依頼中
**テスト意図**: 承認依頼中の受注詳細に「承認する」と「却下」ボタンが表示されることを確認する
**前提条件**: 承認一覧に受注タイプの承認依頼が存在する
**テスト内容**: #order-approve-btn と #order-reject-btn が表示されることを確認する
**ファイル**: `e2e/order-approval.spec.js`

### E2E-541
**件名**: P0-08 受注承認フロー - should expand comment panel when 承認する is clicked on order detail
**テスト意図**: 「承認する」をクリックするとコメントパネルが展開されることを確認する
**前提条件**: 承認一覧から受注詳細を表示済み
**テスト内容**: #approval-comment-input と #approval-confirm-approve が表示されることを確認する
**ファイル**: `e2e/order-approval.spec.js`

### E2E-542
**件名**: P0-08 受注承認フロー - should approve order and return to approval list
**テスト意図**: 受注を承認すると承認一覧に戻ることを確認する
**前提条件**: 承認一覧から受注詳細を表示済み
**テスト内容**: 承認確定後 .data-table が表示され URL が #approval になることを確認する
**ファイル**: `e2e/order-approval.spec.js`

### E2E-543
**件名**: P0-08 受注承認フロー - should expand comment panel when 却下 is clicked on order detail
**テスト意図**: 「却下」をクリックするとコメントパネルが展開されることを確認する
**前提条件**: 承認一覧から受注詳細を表示済み
**テスト内容**: #approval-comment-input と #approval-confirm-reject が表示されることを確認する
**ファイル**: `e2e/order-approval.spec.js`

### E2E-544
**件名**: P0-08 受注承認フロー - should show error when 却下 is confirmed without comment
**テスト意図**: コメントなしで却下を確定するとエラーが表示されることを確認する
**前提条件**: 却下パネルが展開済み
**テスト内容**: #approval-confirm-reject をクリックし .error-message が表示されることを確認する
**ファイル**: `e2e/order-approval.spec.js`

### E2E-545
**件名**: P0-08 受注承認フロー - should reject order with comment and return to approval list
**テスト意図**: コメント付きで却下すると承認一覧に戻ることを確認する
**前提条件**: 却下パネルが展開済み
**テスト内容**: コメントを入力して却下確定し、.data-table が表示され URL が #approval になることを確認する
**ファイル**: `e2e/order-approval.spec.js`

### E2E-546
**件名**: P0-08 受注承認フロー - should show 承認依頼 button on order detail when status is 受注済み
**テスト意図**: 受注済みステータスの受注詳細に「承認依頼」ボタンが表示されることを確認する
**前提条件**: ORD-00001（受注済み）の詳細画面を表示済み
**テスト内容**: #order-submit-approval-btn が表示されることを確認する
**ファイル**: `e2e/order-approval.spec.js`

### E2E-547
**件名**: P0-08 受注承認フロー - should show error when submitting approval without attachment
**テスト意図**: 添付ファイルなしで承認依頼するとアラートに「添付」メッセージが表示されることを確認する
**前提条件**: ORD-00001（受注済み・添付なし）の詳細画面を表示済み
**テスト内容**: ダイアログのメッセージに「添付」が含まれることを確認する
**ファイル**: `e2e/order-approval.spec.js`

### E2E-548
**件名**: P0-08 受注承認フロー - should show 承認一覧に戻る button when navigating from approval list
**テスト意図**: 承認一覧から受注詳細に遷移した場合、戻るボタンが表示されることを確認する
**前提条件**: 承認一覧から受注詳細画面に遷移済み
**テスト内容**: #order-detail-back が表示されることを確認する
**ファイル**: `e2e/order-approval.spec.js`


---

## RT-04 受注承認依頼バリデーション

### E2E-549
**件名**: RT-04 受注承認依頼バリデーション - should block approval submission and show attachment error when no attachment exists
**テスト意図**: 添付ファイルなしで承認依頼するとアラートに「添付」エラーが表示されることを確認する
**前提条件**: ORD-00001（ハードコードデータ・添付なし）の詳細画面を表示済み
**テスト内容**: 承認依頼クリック後のアラートに「添付」が含まれることを確認する
**ファイル**: `e2e/order-approval-validation.spec.js`

### E2E-550
**件名**: RT-04 受注承認依頼バリデーション - should block approval submission and show quotation linkage error when quotation is not linked
**テスト意図**: 見積未紐付けの受注で承認依頼するとアラートに「見積申請」エラーが表示されることを確認する
**前提条件**: quotationCode=null の受注をモック設定済み
**テスト内容**: 承認依頼クリック後のアラートに「見積申請」が含まれることを確認する
**ファイル**: `e2e/order-approval-validation.spec.js`

### E2E-551
**件名**: RT-04 受注承認依頼バリデーション - should block approval submission and show amount mismatch error when order total differs from quotation total
**テスト意図**: 受注合計が見積合計と異なる場合に金額不一致エラーが表示されることを確認する
**前提条件**: 合計700,000円の受注（見積660,000円と不一致）をモック設定済み
**テスト内容**: 承認依頼クリック後のアラートに「受注金額が見積金額と一致しません」が含まれることを確認する
**ファイル**: `e2e/order-approval-validation.spec.js`

### E2E-552
**件名**: RT-04 受注承認依頼バリデーション - should allow saving order without attachment when creating from quotation
**テスト意図**: 受注作成時は添付ファイルなしで登録できることを確認する（添付チェックは承認依頼時のみ）
**前提条件**: QUO-00001から受注フォームを開いた状態
**テスト内容**: 添付なしで受注登録が成功し受注一覧に戻ることを確認する
**ファイル**: `e2e/order-approval-validation.spec.js`

### E2E-553
**件名**: RT-04 受注承認依頼バリデーション - should show all validation errors when both attachment and quotation linkage are missing
**テスト意図**: 添付なしで承認依頼するとアラートにエラーメッセージが表示されることを確認する
**前提条件**: ORD-00001（ハードコードデータ・添付なし）の詳細画面を表示済み
**テスト内容**: 承認依頼クリック後のアラートメッセージが空でないことを確認する
**ファイル**: `e2e/order-approval-validation.spec.js`


---

## RT-02 社長決裁

### 社長決裁条件設定

### E2E-554
**件名**: RT-02 社長決裁条件設定 - should show approval condition tab with default thresholds
**テスト意図**: 承認条件設定タブが表示されアクティブになることを確認する
**前提条件**: 設定画面の承認条件設定タブを表示済み
**テスト内容**: [data-settings-tab="approval-condition"] が表示されアクティブクラスを持つことを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-555
**件名**: RT-02 社長決裁条件設定 - should show default amount threshold of 10,000,000 yen
**テスト意図**: デフォルトの金額閾値が1,000万円に設定されていることを確認する
**前提条件**: 承認条件設定タブを表示済み
**テスト内容**: #s-condition-amount の値が「10000000」であることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-556
**件名**: RT-02 社長決裁条件設定 - should show default profit rate threshold of 20 percent
**テスト意図**: デフォルトの利益率閾値が20%に設定されていることを確認する
**前提条件**: 承認条件設定タブを表示済み
**テスト内容**: #s-condition-profit-rate の値が「20」であることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-557
**件名**: RT-02 社長決裁条件設定 - should show OR condition hint text
**テスト意図**: OR条件のヒントテキストが表示されることを確認する
**前提条件**: 承認条件設定タブを表示済み
**テスト内容**: .field-hint に「OR条件」と「社長決裁」が含まれることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-558
**件名**: RT-02 社長決裁条件設定 - should save updated amount threshold
**テスト意図**: 金額閾値を変更して保存すると変更が維持されることを確認する
**前提条件**: 承認条件設定タブを表示済み
**テスト内容**: 閾値を5,000,000に変更して保存し、#s-condition-amount の値が「5000000」のままであることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-559
**件名**: RT-02 社長決裁条件設定 - should save updated profit rate threshold
**テスト意図**: 利益率閾値を変更して保存すると変更が維持されることを確認する
**前提条件**: 承認条件設定タブを表示済み
**テスト内容**: 利益率閾値を15に変更して保存し、#s-condition-profit-rate の値が「15」のままであることを確認する
**ファイル**: `e2e/president-approval.spec.js`


### 社長決裁ルート設定確認

### E2E-560
**件名**: RT-02 社長決裁ルート設定確認 - should show 2-step approval route for quotation representing president approval path
**テスト意図**: 見積の承認ルートが2ステップ（営業部長・社長）で構成されていることを確認する
**前提条件**: 設定画面の承認ルート設定タブを表示済み
**テスト内容**: .data-table-body-row が2件で「第 1 ステップ」「第 2 ステップ」が表示されることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-561
**件名**: RT-02 社長決裁ルート設定確認 - should show quotation document type selected by default in approval route settings
**テスト意図**: 承認ルート設定で見積タイプがデフォルト選択されていることを確認する
**前提条件**: 設定画面の承認ルート設定タブを表示済み
**テスト内容**: [data-action-route-doctype] が表示されることを確認する
**ファイル**: `e2e/president-approval.spec.js`


### 高額見積 社長決裁ルート 承認フロー

### E2E-562
**件名**: RT-02 高額見積 社長決裁ルート 承認フロー - should show high-value quotation in approval list with correct amount
**テスト意図**: 高額見積（1,320万円）が承認一覧に正しい金額で表示されることを確認する
**前提条件**: 高額見積モックを設定済み
**テスト内容**: 承認一覧に「QUO-HIGH」と「13,200,000」が含まれることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-563
**件名**: RT-02 高額見積 社長決裁ルート 承認フロー - should show approve and reject buttons for high-value quotation requiring president approval
**テスト意図**: 社長決裁が必要な高額見積の詳細に承認・却下ボタンが表示されることを確認する
**前提条件**: QUO-HIGH（承認依頼中）の詳細画面を表示済み
**テスト内容**: #quotation-approve-btn と #quotation-reject-btn が表示されることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-564
**件名**: RT-02 高額見積 社長決裁ルート 承認フロー - should complete step 1 approval and show updated status
**テスト意図**: 第1ステップ（営業部長）承認後に承認一覧に戻ることを確認する
**前提条件**: QUO-HIGH（承認依頼中）の詳細画面を表示済み
**テスト内容**: コメント付きで承認確定後 .data-table が表示され URL が #approval になることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-565
**件名**: RT-02 高額見積 社長決裁ルート 承認フロー - should complete step 2 approval and show 承認済み
**テスト意図**: 第2ステップ（社長）承認後に見積ステータスが「承認済み」になることを確認する
**前提条件**: 承認操作後の QUO-HIGH 詳細を表示済み
**テスト内容**: .status-badge.first() が「承認済み」になることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-566
**件名**: RT-02 高額見積 社長決裁ルート 承認フロー - should reject high-value quotation and change status to 却下
**テスト意図**: 高額見積を却下するとステータスが「却下」に変化することを確認する
**前提条件**: QUO-HIGH（承認依頼中）の詳細画面を表示済み
**テスト内容**: 却下理由を入力して確定し、見積詳細で .status-badge.first() が「却下」になることを確認する
**ファイル**: `e2e/president-approval.spec.js`


### 社長決裁閾値境界値テスト

### E2E-567
**件名**: RT-02 社長決裁閾値境界値テスト - should show amount threshold 10,000,000 exactly at boundary in settings
**テスト意図**: デフォルト閾値が境界値（10,000,000円）に設定されていることを確認する
**前提条件**: 承認条件設定タブを表示済み
**テスト内容**: #s-condition-amount の値が「10000000」であることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-568
**件名**: RT-02 社長決裁閾値境界値テスト - should display above-threshold quotation (10,000,001) requiring president approval in approval list
**テスト意図**: 閾値1円超の見積（社長決裁必要）が承認一覧に表示されることを確認する
**前提条件**: QUO-ABOVE（10,000,001円・承認依頼中）モックを設定済み
**テスト内容**: 承認一覧に「QUO-ABOVE」と「10,000,001」が含まれることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-569
**件名**: RT-02 社長決裁閾値境界値テスト - should display below-threshold quotation (9,999,999) in approval list
**テスト意図**: 閾値1円未満の見積が承認一覧に表示されることを確認する
**前提条件**: QUO-BELOW（9,999,999円・承認依頼中）モックを設定済み
**テスト内容**: 承認一覧に「QUO-BELOW」が含まれることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-570
**件名**: RT-02 社長決裁閾値境界値テスト - should display exact-threshold quotation (10,000,000) in approval list
**テスト意図**: 閾値ちょうどの見積（社長決裁不要）が承認一覧に表示されることを確認する
**前提条件**: QUO-THRESHOLD（10,000,000円・承認依頼中）モックを設定済み
**テスト内容**: 承認一覧に「QUO-THRESHOLD」が含まれることを確認する
**ファイル**: `e2e/president-approval.spec.js`

### E2E-571
**件名**: RT-02 社長決裁閾値境界値テスト - should save threshold of 1 yen as minimum valid amount
**テスト意図**: 金額閾値を最小値（1円）に設定して保存できることを確認する
**前提条件**: 承認条件設定タブを表示済み
**テスト内容**: 閾値を「1」に変更して保存し、#s-condition-amount の値が「1」のままであることを確認する
**ファイル**: `e2e/president-approval.spec.js`


---

## RT-03 入金消込異常系

### E2E-572
**件名**: RT-03 入金消込異常系 - should show correct remaining balance when invoice is partially paid
**テスト意図**: 一部入金（300,000円/528,000円）時に未収残高（228,000円）が正しく表示されることを確認する
**前提条件**: INV-00001（送付済・合計528,000円）に対し入金300,000円のモックを設定済み
**テスト内容**: 請求詳細を開き、#f-rcp-remaining に「228,000」が表示されることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`

### E2E-573
**件名**: RT-03 入金消込異常系 - should show zero remaining balance when invoice is over-paid
**テスト意図**: 過入金（600,000円/528,000円）時に未収残高が0（負にならない）ことを確認する
**前提条件**: INV-00001に対し入金600,000円のモックを設定済み
**テスト内容**: 請求詳細を開き、#f-rcp-remaining に「0」が含まれることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`

### E2E-574
**件名**: RT-03 入金消込異常系 - should accumulate remaining balance correctly across multiple partial payments
**テスト意図**: 複数回分割入金（100,000円＋150,000円）の累積後、残高（278,000円）が正しく計算されることを確認する
**前提条件**: INV-00001に対し2件の入金（合計250,000円）モックを設定済み
**テスト内容**: 請求詳細を開き、#f-rcp-remaining に「278,000」が含まれることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`

### E2E-575
**件名**: RT-03 入金消込異常系 - should show both partial receipt records in history when multiple payments exist
**テスト意図**: 複数回入金時に全入金履歴レコードが表示されることを確認する
**前提条件**: INV-00001に対し RCP-MULTI-01・RCP-MULTI-02 の2件入金モックを設定済み
**テスト内容**: 請求詳細を開き、[data-receipt-code="RCP-MULTI-01"] と [data-receipt-code="RCP-MULTI-02"] が両方表示されることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`

### E2E-576
**件名**: RT-03 入金消込異常系 - should compute remaining balance from payment amount excluding bank transfer fee
**テスト意図**: 振込手数料（500円）差引後の入金額（527,500円）で残高が算定される（残高500円）ことを確認する
**前提条件**: 入金額527,500円・手数料500円のモックを設定済み
**テスト内容**: 請求詳細を開き、#f-rcp-remaining に「500」が含まれることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`

### E2E-577
**件名**: RT-03 入金消込異常系 - should display bank transfer fee in receipt history
**テスト意図**: 振込手数料が設定された入金の履歴に手数料金額が表示されることを確認する
**前提条件**: 手数料500円の入金（RCP-FEE-01）モックを設定済み
**テスト内容**: 請求詳細を開き、[data-receipt-code="RCP-FEE-01"] に「500」が含まれることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`

### E2E-578
**件名**: RT-03 入金消込異常系 - should show receipt history section when receipts exist for 送付済 invoice
**テスト意図**: 送付済請求に入金が存在する場合、入金履歴セクションと履歴レコードが表示されることを確認する
**前提条件**: INV-00001に入金1件（RCP-HIST-01）のモックを設定済み
**テスト内容**: 請求詳細を開き、「入金履歴」セクションラベルと [data-receipt-code="RCP-HIST-01"] が表示されることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`

### E2E-579
**件名**: RT-03 入金消込異常系 - should still show 入金登録 button for 送付済 invoice regardless of partial payment
**テスト意図**: 一部入金後もステータスが「送付済」のままなら入金登録ボタンが表示されることを確認する
**前提条件**: INV-00001（送付済）に入金1件のモックを設定済み
**テスト内容**: 請求詳細を開き、[data-action-register-receipt="INV-00001"] が表示されていることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`

### E2E-580
**件名**: RT-03 入金消込異常系 - should show zero remaining balance and receipt entry for exact full payment
**テスト意図**: 全額入金（528,000円）後に未収残高が0円になり、入金レコードが表示されることを確認する
**前提条件**: INV-00001に全額入金（RCP-FULL-01）のモックを設定済み
**テスト内容**: 請求詳細を開き、#f-rcp-remaining に「0」が含まれ、[data-receipt-code="RCP-FULL-01"] が表示されることを確認する
**ファイル**: `e2e/receipt-edge.spec.js`


---

## S-13 レポート画面

### E2E-581
**件名**: S-13 レポート画面 - should show report screen from navigation
**テスト意図**: ナビゲーションからレポート画面に遷移すると集計テーブルが表示されることを確認する
**前提条件**: 管理者ユーザでログイン済み
**テスト内容**: レポートナビをクリックし、#report-summary-table が表示されることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-582
**件名**: S-13 レポート画面 - should show 年月 column header
**テスト意図**: 集計テーブルに「年月」カラムヘッダーが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-table の .data-table-head に「年月」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-583
**件名**: S-13 レポート画面 - should show 売上合計 column header
**テスト意図**: 集計テーブルに「売上合計」カラムヘッダーが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-table の .data-table-head に「売上合計」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-584
**件名**: S-13 レポート画面 - should show 2026-01 in sales summary
**テスト意図**: 2026年1月の売上データが集計テーブルに表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-table に「2026-01」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-585
**件名**: S-13 レポート画面 - should show 2026-03 in sales summary
**テスト意図**: 2026年3月の売上データが集計テーブルに表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-table に「2026-03」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-586
**件名**: S-13 レポート画面 - should show 528,000 yen for 2026-01
**テスト意図**: 2026年1月行の売上合計が528,000円であることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: 「2026-01」を含む行が「528,000 円」を含むことを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-587
**件名**: S-13 レポート画面 - should show 2,200,000 yen for 2026-03
**テスト意図**: 2026年3月行の売上合計が2,200,000円であることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: 「2026-03」を含む行が「2,200,000 円」を含むことを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-588
**件名**: S-13 レポート画面 - should not show 下書き invoice amount in summary
**テスト意図**: 下書き請求の金額（385,000円）が集計テーブルに含まれないことを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-table に「385,000」が含まれないことを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-589
**件名**: S-13 レポート画面 - should show report nav item for finance01 who has report:view
**テスト意図**: report:view 権限を持つ finance01 がレポートメニューを閲覧できることを確認する
**前提条件**: admin でログイン後ログアウトし、finance01 でログイン済み
**テスト内容**: [data-route="report"] が表示されていることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-590
**件名**: S-13 レポート画面 - should show 原価合計 column header
**テスト意図**: 集計テーブルに「原価合計」カラムヘッダーが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-table の .data-table-head に「原価合計」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-591
**件名**: S-13 レポート画面 - should show 粗利 column header
**テスト意図**: 集計テーブルに「粗利」カラムヘッダーが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-table の .data-table-head に「粗利」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-592
**件名**: S-13 レポート画面 - should show 2026-04 row for paid payment cost
**テスト意図**: 支払済コストが2026年4月行として集計テーブルに表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-table に「2026-04」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-593
**件名**: S-13 レポート画面 - should show 110,000 yen cost for 2026-04
**テスト意図**: 2026年4月行の原価合計が110,000円であることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: 「2026-04」を含む行が「110,000 円」を含むことを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-594
**件名**: S-13 レポート画面 - should show gross profit for 2026-01
**テスト意図**: 2026年1月行に粗利（528,000円）が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: 「2026-01」を含む行が「528,000 円」を含むことを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-595
**件名**: S-13 レポート画面 - should show 未収一覧 section
**テスト意図**: 未収一覧セクションが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-uncollected-table が表示されていることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-596
**件名**: S-13 レポート画面 - should show INV-00001 in uncollected list
**テスト意図**: 未収一覧に INV-00001 が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-uncollected-table に「INV-00001」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-597
**件名**: S-13 レポート画面 - should show uncollected invoice total amount
**テスト意図**: 未収一覧に請求合計額（528,000円）が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-uncollected-table に「528,000 円」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-598
**件名**: S-13 レポート画面 - should show 送付済 status badge in uncollected list
**テスト意図**: 未収一覧に「送付済」ステータスバッジが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-uncollected-table に「送付済」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-599
**件名**: S-13 レポート画面 - should show 未払一覧 section
**テスト意図**: 未払一覧セクションが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-unpaid-table が表示されていることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-600
**件名**: S-13 レポート画面 - should show PMT-00002 in unpaid list
**テスト意図**: 未払一覧に PMT-00002 が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-unpaid-table に「PMT-00002」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-601
**件名**: S-13 レポート画面 - should show unpaid payment amount
**テスト意図**: 未払一覧に未払金額（1,100,000円）が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-unpaid-table に「1,100,000 円」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-602
**件名**: S-13 レポート画面 - should show 承認済 status badge in unpaid list
**テスト意図**: 未払一覧に「承認済」ステータスバッジが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-unpaid-table に「承認済」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-603
**件名**: S-13 レポート画面 - should not show 支払済 payment in unpaid list
**テスト意図**: 支払済の支払（PMT-00001）が未払一覧に表示されないことを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-unpaid-table に「PMT-00001」が含まれないことを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-604
**件名**: S-13 レポート画面 - should show year filter dropdown
**テスト意図**: 年フィルタードロップダウンが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-year-filter が表示されていることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-605
**件名**: S-13 レポート画面 - should show 2026 as year option in filter
**テスト意図**: 年フィルターに「2026年」の選択肢が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-year-filter に「2026年」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-606
**件名**: S-13 レポート画面 - should filter summary table when year is selected
**テスト意図**: 年フィルターで2026年を選択すると集計テーブルに2026年データが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-year-filter で「2026」を選択し、#report-summary-table に「2026-01」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-607
**件名**: S-13 レポート画面 - should show CSV 出力 button for uncollected list
**テスト意図**: 未収一覧にCSV出力ボタンが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-export-uncollected が表示されていることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-608
**件名**: S-13 レポート画面 - should show CSV 出力 button for unpaid list
**テスト意図**: 未払一覧にCSV出力ボタンが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-export-unpaid が表示されていることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-609
**件名**: S-13 レポート画面 - should show totals row in summary table
**テスト意図**: 集計テーブルに合計行が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-totals-row が表示されていることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-610
**件名**: S-13 レポート画面 - should show 合計 label in totals row
**テスト意図**: 合計行に「合計」ラベルが表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-totals-row に「合計」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-611
**件名**: S-13 レポート画面 - should show total sales in totals row
**テスト意図**: 合計行に売上合計（2,783,000円）が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-totals-row に「2,783,000 円」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-612
**件名**: S-13 レポート画面 - should show total cost in totals row
**テスト意図**: 合計行に原価合計（110,000円）が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-totals-row に「110,000 円」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-613
**件名**: S-13 レポート画面 - should show total gross profit in totals row
**テスト意図**: 合計行に粗利合計（2,673,000円）が表示されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-summary-totals-row に「2,673,000 円」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`

### E2E-614
**件名**: S-13 レポート画面 - should update totals row when year filter is applied
**テスト意図**: 年フィルター適用後に合計行が更新されることを確認する
**前提条件**: レポート画面表示済み
**テスト内容**: #report-year-filter で「2026」を選択し、#report-summary-totals-row に「2,783,000 円」が含まれることを確認する
**ファイル**: `e2e/report.spec.js`


---

## レポート ドリルダウン（顧客別→案件別）

### E2E-615
**件名**: レポート ドリルダウン（顧客別→案件別） - should show 顧客別集計 section
**テスト意図**: レポート画面に顧客別集計テーブルが表示されることを確認する
**前提条件**: 管理者ユーザでログインしレポート画面を表示済み
**テスト内容**: #report-customer-table が表示されていることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-616
**件名**: レポート ドリルダウン（顧客別→案件別） - should show 案件別 button for each customer row
**テスト意図**: 顧客別集計の各行にドリルダウン（案件別）ボタンが表示されることを確認する
**前提条件**: レポート画面・顧客別集計セクション表示済み
**テスト内容**: [data-action-drill-customer] の最初の要素が表示されていることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-617
**件名**: レポート ドリルダウン（顧客別→案件別） - should show customer name in customer table
**テスト意図**: 顧客別集計テーブルに顧客名（株式会社青葉システム）が表示されることを確認する
**前提条件**: レポート画面・顧客別集計セクション表示済み
**テスト内容**: #report-customer-table に「株式会社青葉システム」が含まれることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-618
**件名**: レポート ドリルダウン（顧客別→案件別） - should show sales total in customer table
**テスト意図**: 顧客別集計テーブルに売上合計（円）が表示されることを確認する
**前提条件**: レポート画面・顧客別集計セクション表示済み
**テスト内容**: #report-customer-table に「円」が含まれることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-619
**件名**: レポート ドリルダウン（顧客別→案件別） - should show 案件別集計 section when customer drill button is clicked
**テスト意図**: 顧客行のドリルダウンボタンをクリックすると案件別集計セクションが表示されることを確認する
**前提条件**: レポート画面・顧客別集計セクション表示済み
**テスト内容**: 最初の [data-action-drill-customer] ボタンをクリックし、#report-project-section が表示されることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-620
**件名**: レポート ドリルダウン（顧客別→案件別） - should show customer name in 案件別集計 section title
**テスト意図**: 案件別集計セクションタイトルに「案件別集計」が表示されることを確認する
**前提条件**: ドリルダウンボタンをクリック済み
**テスト内容**: #report-project-section の .panel-title-text に「案件別集計」が含まれることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-621
**件名**: レポート ドリルダウン（顧客別→案件別） - should show project rows in project table
**テスト意図**: 案件別集計テーブルに案件行が表示されることを確認する
**前提条件**: ドリルダウンボタンをクリック済み
**テスト内容**: #report-project-table の .data-table-body-row が0件でないことを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-622
**件名**: レポート ドリルダウン（顧客別→案件別） - should highlight selected customer row
**テスト意図**: ドリルダウン選択中の顧客行に is-selected クラスが付与されることを確認する
**前提条件**: ドリルダウンボタンをクリック済み
**テスト内容**: .data-table-body-row.is-selected が表示されていることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-623
**件名**: レポート ドリルダウン（顧客別→案件別） - should show 閉じる button on active customer row
**テスト意図**: 選択中顧客行に「閉じる」ボタンが表示されることを確認する
**前提条件**: ドリルダウンボタンをクリック済み
**テスト内容**: .data-table-body-row.is-selected 内の button に「閉じる」が含まれることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-624
**件名**: レポート ドリルダウン（顧客別→案件別） - should hide 案件別集計 section when 閉じる is clicked
**テスト意図**: 「閉じる」ボタンをクリックすると案件別集計セクションが非表示になることを確認する
**前提条件**: ドリルダウンボタンをクリック済み
**テスト内容**: 「閉じる」ボタンをクリックし、#report-project-section が非表示になることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-625
**件名**: レポート ドリルダウン（顧客別→案件別） - should reset drilldown when year filter changes
**テスト意図**: 年フィルターを変更するとドリルダウン（案件別集計）がリセットされることを確認する
**前提条件**: ドリルダウンボタンをクリック済み
**テスト内容**: 年フィルターで「2026」を選択し、#report-project-section が非表示になることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`

### E2E-626
**件名**: レポート ドリルダウン（顧客別→案件別） - should show project code chip in project table
**テスト意図**: 案件別集計テーブルに案件コード（PJ-プレフィックス）が表示されることを確認する
**前提条件**: ドリルダウンボタンをクリック済み
**テスト内容**: #report-project-table に「PJ-」が含まれることを確認する
**ファイル**: `e2e/report-drilldown.spec.js`


---

## ET-01 ログインと権限制御（探索的テスト）

### E2E-627
**件名**: ET-01: ログインと権限制御 - 不正パスワードでログインできないこと
**テスト意図**: 誤ったパスワードでログインするとエラーメッセージが表示されることを探索的に確認する
**前提条件**: ログイン画面を表示済み
**テスト内容**: ID「admin」・パスワード「wrongpass」でログインし、エラー要素（.login-error 等）が表示されることを確認する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-628
**件名**: ET-01: ログインと権限制御 - ユーザーIDが空のままログインできないこと
**テスト意図**: ユーザーIDが空の場合にログインが阻止されることを探索的に確認する
**前提条件**: ログイン画面を表示済み
**テスト内容**: IDを空にしてパスワードのみ入力しログインし、サイドバーが表示されないことを確認する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-629
**件名**: ET-01: ログインと権限制御 - admin でログインしメニューを記録する
**テスト意図**: admin ユーザーでログイン後に表示されるメニュー項目を探索的に記録・確認する
**前提条件**: adminUser モックでログイン設定済み
**テスト内容**: ログイン後 .menu-item の全テキストを取得し、1件以上存在することを確認する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-630
**件名**: ET-01: ログインと権限制御 - sales01 でログインしメニューを記録する
**テスト意図**: sales01 ユーザーでログイン後に表示されるメニュー項目を探索的に記録・確認する
**前提条件**: sales01 ユーザーモックでログイン設定済み
**テスト内容**: ログイン後 .menu-item の全テキストを取得し、1件以上存在することを確認する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-631
**件名**: ET-01: ログインと権限制御 - finance01 でログインしメニューを記録する
**テスト意図**: finance01 ユーザーでログイン後に表示されるメニュー項目を探索的に記録・確認する
**前提条件**: finance01 ユーザーモックでログイン設定済み
**テスト内容**: ログイン後 .menu-item の全テキストを取得し、1件以上存在することを確認する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-632
**件名**: ET-01: ログインと権限制御 - admin はマスタ管理が表示される
**テスト意図**: admin ユーザーにはマスタ管理メニューが表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: .menu-item（「マスタ管理」）が表示されていることを確認する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-633
**件名**: ET-01: ログインと権限制御 - admin はレポートが表示される
**テスト意図**: admin ユーザーにはレポートメニューが表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: .menu-item（「レポート」）が表示されていることを確認する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-634
**件名**: ET-01: ログインと権限制御 - sales01 にはレポートが表示されない
**テスト意図**: sales01 ユーザーにはレポートメニューが表示されないことを探索的に確認する
**前提条件**: sales01 ユーザーでログイン済み
**テスト内容**: .menu-item（「レポート」）が表示されていないことを確認する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-635
**件名**: ET-01: ログインと権限制御 - finance01 は見積・案件メニューが表示されない
**テスト意図**: finance01 ユーザーには見積・案件メニューが表示されないことを探索的に確認する
**前提条件**: finance01 ユーザーでログイン済み
**テスト内容**: 見積・案件メニューの表示有無をコンソールに記録する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-636
**件名**: ET-01: ログインと権限制御 - ログアウト後に戻るボタンで保護画面に戻れないこと
**テスト意図**: ログアウト後にブラウザの戻るボタンを押しても保護画面にアクセスできないことを探索的に確認する
**前提条件**: admin ユーザーでログイン済みの後ログアウト済み
**テスト内容**: ブラウザの戻るボタンを押し、ログイン画面かリダイレクトされることをコンソールに記録する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`

### E2E-637
**件名**: ET-01: ログインと権限制御 - sales01 のマスタ管理ページで編集ボタンの表示を確認
**テスト意図**: sales01 がマスタ管理にアクセスできる場合の編集ボタン有無を探索的に確認する
**前提条件**: sales01 ユーザーでログイン済み
**テスト内容**: マスタ管理メニューが表示されている場合はクリックし、編集ボタン数をコンソールに記録する
**ファイル**: `e2e/explore-et01-login-permissions.spec.js`


---

## ET-02 見積フロー探索

### E2E-638
**件名**: ET-02: 見積フロー探索 - 見積一覧が表示され、既存件数を確認する
**テスト意図**: 見積一覧画面に既存の見積行が表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: 見積メニューをクリックし、table tbody tr の行数が1以上であることを確認する
**ファイル**: `e2e/explore-et02-quotation.spec.js`

### E2E-639
**件名**: ET-02: 見積フロー探索 - 見積一覧でステータス絞り込みが機能するか確認
**テスト意図**: ステータスフィルターが存在し承認済みで絞り込みができることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: ステータスフィルターの有無を確認し、存在すれば「承認済み」で絞り込んだ件数をコンソールに記録する
**ファイル**: `e2e/explore-et02-quotation.spec.js`

### E2E-640
**件名**: ET-02: 見積フロー探索 - 新規見積ボタンが存在し、フォームが開くか確認
**テスト意図**: 新規見積ボタンの有無とクリック後のフォーム表示を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: 新規ボタンの表示有無をコンソールに記録し、存在すればクリックしてフォーム要素数を記録する
**ファイル**: `e2e/explore-et02-quotation.spec.js`

### E2E-641
**件名**: ET-02: 見積フロー探索 - 承認済み見積(QUO-00001)の詳細を開いて金額確認
**テスト意図**: QUO-00001 の詳細画面に金額「660」と「承認済み」が含まれることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: QUO-00001 行をクリックして詳細を開き、「660」と「承認済み」の含有をコンソールに記録する
**ファイル**: `e2e/explore-et02-quotation.spec.js`

### E2E-642
**件名**: ET-02: 見積フロー探索 - 見積(QUO-00002)で改版ボタンの有無を確認
**テスト意図**: QUO-00002 詳細画面に改版ボタンが存在するかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: QUO-00002 行を開いて改版ボタンの表示有無をコンソールに記録する
**ファイル**: `e2e/explore-et02-quotation.spec.js`

### E2E-643
**件名**: ET-02: 見積フロー探索 - QUO-00003(承認依頼中)で承認依頼ボタンの状態を確認
**テスト意図**: 承認依頼中の見積に対して承認依頼ボタンが非活性になるかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: QUO-00003 行を開き、承認依頼ボタンの表示・非活性状態をコンソールに記録する
**ファイル**: `e2e/explore-et02-quotation.spec.js`

### E2E-644
**件名**: ET-02: 見積フロー探索 - 見積書PDF出力ボタンの有無を確認
**テスト意図**: QUO-00001 詳細画面にPDF/印刷出力ボタンが存在するかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: QUO-00001 行を開き、PDF/印刷出力ボタンの表示有無をコンソールに記録する
**ファイル**: `e2e/explore-et02-quotation.spec.js`

### E2E-645
**件名**: ET-02: 見積フロー探索 - sales01は見積の編集・承認依頼ができるか確認
**テスト意図**: sales01 ユーザーが見積の新規作成ボタンを操作できるかを探索的に確認する
**前提条件**: sales01 ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: 新規見積ボタンの表示有無をコンソールに記録する
**ファイル**: `e2e/explore-et02-quotation.spec.js`

### E2E-646
**件名**: ET-02: 見積フロー探索 - finance01は見積メニューにアクセスできないか確認
**テスト意図**: finance01 ユーザーが見積メニューを持たない場合、ハッシュ直接アクセス時の動作を探索的に確認する
**前提条件**: finance01 ユーザーでログイン済み
**テスト内容**: 見積メニューの有無を確認し、無ければ /#quotation への直接遷移後の画面をコンソールに記録する
**ファイル**: `e2e/explore-et02-quotation.spec.js`


---

## ET-03 受注→発注引き継ぎ探索

### E2E-647
**件名**: ET-03: 受注→発注引き継ぎ探索 - 受注一覧が表示され、件数を確認する
**テスト意図**: 受注一覧に既存の受注行が表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: 受注メニューをクリックし、table tbody tr の行数が1以上であることを確認する
**ファイル**: `e2e/explore-et03-order-purchase.spec.js`

### E2E-648
**件名**: ET-03: 受注→発注引き継ぎ探索 - ORD-00001の詳細で顧客名がCUS-001(株式会社青葉システム)と一致するか確認
**テスト意図**: ORD-00001 詳細画面に顧客「青葉/CUS-001」と金額「660」が表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、受注一覧表示済み
**テスト内容**: ORD-00001 行を開き、「青葉」または「CUS-001」の含有をコンソールに記録する
**ファイル**: `e2e/explore-et03-order-purchase.spec.js`

### E2E-649
**件名**: ET-03: 受注→発注引き継ぎ探索 - ORD-00002の詳細で修正後の顧客(CUS-005)が表示されるか確認
**テスト意図**: ORD-00002 詳細画面に修正後の顧客（CUS-005/新都建設）が表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、受注一覧表示済み
**テスト内容**: ORD-00002 行を開き、「新都建設」または「CUS-005」の含有と旧顧客「みなと/CUS-003」の残存をコンソールに記録する
**ファイル**: `e2e/explore-et03-order-purchase.spec.js`

### E2E-650
**件名**: ET-03: 受注→発注引き継ぎ探索 - 発注一覧が表示され、既存件数を確認する
**テスト意図**: 発注一覧に既存の発注行が表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: 発注メニューをクリックし、table tbody tr の行数が1以上であることを確認する
**ファイル**: `e2e/explore-et03-order-purchase.spec.js`

### E2E-651
**件名**: ET-03: 受注→発注引き継ぎ探索 - POD-00001の詳細で金額がORD-00001と整合するか確認
**テスト意図**: POD-00001 詳細画面に「528」（528,000円）が含まれることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、発注一覧表示済み
**テスト内容**: POD-00001 行を開き、「528」と「下書き」の含有をコンソールに記録する
**ファイル**: `e2e/explore-et03-order-purchase.spec.js`

### E2E-652
**件名**: ET-03: 受注→発注引き継ぎ探索 - 発注の discount 値の解釈を確認（発注書プレビューで金額チェック）
**テスト意図**: POD-00001 詳細画面に発注書出力ボタンが存在するかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、発注一覧表示済み
**テスト内容**: POD-00001 行を開き、発注書/PDF/印刷出力ボタンの有無をコンソールに記録する
**ファイル**: `e2e/explore-et03-order-purchase.spec.js`

### E2E-653
**件名**: ET-03: 受注→発注引き継ぎ探索 - 受注詳細から発注起票ボタンの有無を確認
**テスト意図**: ORD-00001 詳細画面に発注起票ボタンがあるかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、受注一覧表示済み
**テスト内容**: ORD-00001 行を開き、「発注」または「発注起票」ボタンの有無をコンソールに記録する
**ファイル**: `e2e/explore-et03-order-purchase.spec.js`

### E2E-654
**件名**: ET-03: 受注→発注引き継ぎ探索 - POD-00002のステータス"承認済・発注待ち"が正しく表示されるか確認
**テスト意図**: 発注一覧に「承認済・発注待ち」ステータスが表示されるかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、発注一覧表示済み
**テスト内容**: 発注一覧の本文に「承認済・発注待ち」等のステータス含有をコンソールに記録する
**ファイル**: `e2e/explore-et03-order-purchase.spec.js`


---

## ET-04 マスタ管理探索

### E2E-655
**件名**: ET-04: マスタ管理探索 - 顧客マスタ一覧が表示され、ページあたり5件以下か確認
**テスト意図**: 顧客マスタ一覧のページネーション設定（PAGE_SIZE=5）が機能していることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: マスタ管理メニューをクリックし、table tbody tr が5件以下であることを確認する
**ファイル**: `e2e/explore-et04-master.spec.js`

### E2E-656
**件名**: ET-04: マスタ管理探索 - ページングで2ページ目に遷移できるか確認
**テスト意図**: マスタ管理一覧で次ページボタンが機能することを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 次ページボタンの有無を確認し、存在すればクリックして2ページ目の行数をコンソールに記録する
**ファイル**: `e2e/explore-et04-master.spec.js`

### E2E-657
**件名**: ET-04: マスタ管理探索 - 顧客名でキーワード検索が機能するか確認
**テスト意図**: 顧客マスタ一覧で「青葉」キーワード検索が機能することを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 検索入力フィールドに「青葉」を入力し、絞り込み後の行数と「青葉」含有をコンソールに記録する
**ファイル**: `e2e/explore-et04-master.spec.js`

### E2E-658
**件名**: ET-04: マスタ管理探索 - 新規顧客登録フォームが開き、自動採番がCUS-010になるか確認
**テスト意図**: 新規顧客登録時に自動採番コード（CUS-010）が設定されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 新規登録ボタンをクリックしてフォームを開き、コードフィールドの自動採番値をコンソールに記録する
**ファイル**: `e2e/explore-et04-master.spec.js`

### E2E-659
**件名**: ET-04: マスタ管理探索 - 顧客を新規登録して一覧に追加されるか確認
**テスト意図**: 顧客の新規登録後に一覧への反映を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 顧客名「テスト商事株式会社」を入力して保存し、一覧に反映されているかをコンソールに記録する
**ファイル**: `e2e/explore-et04-master.spec.js`

### E2E-660
**件名**: ET-04: マスタ管理探索 - 仕入先タブへの切り替えを確認
**テスト意図**: 仕入先タブへの切り替えと一覧表示を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 仕入先タブの有無を確認し、存在すればクリックして行数をコンソールに記録する
**ファイル**: `e2e/explore-et04-master.spec.js`

### E2E-661
**件名**: ET-04: マスタ管理探索 - 商品マスタで単価フィールドの入力値の型を確認
**テスト意図**: 商品マスタ一覧の単価表示形式（カンマ区切りか生文字列か）を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 商品タブに切り替えて「50,000」（カンマ区切り）と「50000」（生文字列）の含有をコンソールに記録する
**ファイル**: `e2e/explore-et04-master.spec.js`

### E2E-662
**件名**: ET-04: マスタ管理探索 - sales01 はマスタを閲覧できるが編集ボタンがない（またはマスタ自体非表示）
**テスト意図**: sales01 のマスタ管理アクセス有無と編集ボタン非表示を探索的に確認する
**前提条件**: sales01 ユーザーでログイン済み
**テスト内容**: マスタ管理メニューの有無を確認し、存在すれば編集・新規登録ボタン数をコンソールに記録する
**ファイル**: `e2e/explore-et04-master.spec.js`


---

## ET-07 バリデーション探索

### E2E-663
**件名**: ET-07: バリデーション探索 - 顧客名を空で送信したときエラーメッセージが表示されるか確認
**テスト意図**: 顧客名が空のまま保存すると必須バリデーションエラーが表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理の新規登録フォームを開いた状態
**テスト内容**: 顧客名を空のまま保存ボタンをクリックし、エラーメッセージの内容と「必須」「入力」含有をコンソールに記録する
**ファイル**: `e2e/explore-et07-validation.spec.js`

### E2E-664
**件名**: ET-07: バリデーション探索 - 重複する顧客コードで登録したときエラーが出るか確認
**テスト意図**: 既存コード（CUS-001）で登録するとエラーが表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理の新規登録フォームを開いた状態
**テスト内容**: コードを「CUS-001」に設定して保存し、重複エラーメッセージの含有をコンソールに記録する
**ファイル**: `e2e/explore-et07-validation.spec.js`

### E2E-665
**件名**: ET-07: バリデーション探索 - 複数フィールドが空のとき全フィールドのエラーが同時表示されるか確認
**テスト意図**: 複数フィールドが空の場合に全フィールドのエラーが同時表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理の新規登録フォームを開いた状態
**テスト内容**: コードも名前も空のまま保存し、表示されるエラー件数をコンソールに記録する
**ファイル**: `e2e/explore-et07-validation.spec.js`

### E2E-666
**件名**: ET-07: バリデーション探索 - ログインフォームで空IDを送信したときのエラー確認
**テスト意図**: ユーザーIDが空のままログインするとエラーが表示されることを探索的に確認する
**前提条件**: ログイン画面表示済み
**テスト内容**: IDを空にしてパスワードのみ入力しログインし、エラー表示とサイドバー表示状況をコンソールに記録する
**ファイル**: `e2e/explore-et07-validation.spec.js`

### E2E-667
**件名**: ET-07: バリデーション探索 - ログインフォームで空パスワードを送信したときのエラー確認
**テスト意図**: パスワードが空のままログインするとエラーが表示されることを探索的に確認する
**前提条件**: ログイン画面表示済み
**テスト内容**: パスワードを空にしてIDのみ入力しログインし、エラー表示とサイドバー表示状況をコンソールに記録する
**ファイル**: `e2e/explore-et07-validation.spec.js`

### E2E-668
**件名**: ET-07: バリデーション探索 - 見積明細の数量に0を入力したとき金額がどうなるか確認
**テスト意図**: 見積明細の数量を0にしたとき合計がどう計算されるかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、QUO-00001 詳細の編集モードを開いた状態
**テスト内容**: 数量フィールドに「0」を入力し、合計が0になるかとバリデーションエラーの有無をコンソールに記録する
**ファイル**: `e2e/explore-et07-validation.spec.js`

### E2E-669
**件名**: ET-07: バリデーション探索 - エラー後に正しい値を入力すると保存できるかを確認
**テスト意図**: バリデーションエラー後に正しい値を入力して再送信すると保存できることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理の新規登録フォームを開いた状態
**テスト内容**: 空送信でエラーを出した後、正しい名前を入力して保存し、一覧への反映をコンソールに記録する
**ファイル**: `e2e/explore-et07-validation.spec.js`


---

## ET-02/04/07 複合探索的テスト

### E2E-670
**件名**: ET-02: 見積フロー探索 - 見積一覧の行数を確認（.data-table-body-row）
**テスト意図**: 正しいセレクタ（.data-table-body-row）を使って見積一覧の行数を探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: 見積メニューをクリックし、.data-table-body-row の行数が1以上であることを確認する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-671
**件名**: ET-02: 見積フロー探索 - 見積ステータスフィルターに「却下」が存在することを確認
**テスト意図**: ステータスフィルターの選択肢（却下・失注・取消）の有無を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: select[data-table-filter="status"] の option テキストを取得し、各ステータスの含有をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-672
**件名**: ET-02: 見積フロー探索 - QUO-00001（承認済み）の詳細を開いて金額を確認
**テスト意図**: QUO-00001 詳細画面に「承認済み」「660」「600」が含まれることと改版・PDF出力ボタンの有無を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: QUO-00001 行の詳細ボタンをクリックし、金額・ステータス・ボタンの有無をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-673
**件名**: ET-02: 見積フロー探索 - QUO-00003（承認依頼中）詳細での承認依頼ボタン状態確認
**テスト意図**: 承認依頼中の見積に対して承認依頼ボタンが非活性になるかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: QUO-00003 行の詳細ボタンをクリックし、承認依頼ボタンの表示と非活性状態をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-674
**件名**: ET-02: 見積フロー探索 - 新規見積フォームのフィールド数と自動採番を確認
**テスト意図**: 新規見積フォームの入力要素数と自動採番コード（QUO-00006）を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、見積一覧表示済み
**テスト内容**: #new-quotation-btn をクリックしてフォームを開き、入力要素数と採番コードをコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-675
**件名**: ET-02: 見積フロー探索 - finance01が見積URLへ直接アクセスしたときダッシュボードへリダイレクトされるか
**テスト意図**: finance01 ユーザーが見積ハッシュへ直接アクセスした際のリダイレクト挙動を探索的に確認する
**前提条件**: finance01 ユーザーでログイン済み
**テスト内容**: ハッシュを「quotation」に変更し、遷移後の画面タイトルをコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-676
**件名**: ET-03: 受注→発注引き継ぎ探索 - 受注一覧の行数と全件表示を確認
**テスト意図**: 受注一覧に既存の受注行が .data-table-body-row セレクタで表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: 受注メニューをクリックし、.data-table-body-row の行数が1以上であることを確認する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-677
**件名**: ET-03: 受注→発注引き継ぎ探索 - ORD-00001の詳細で顧客・金額が正しいか確認
**テスト意図**: ORD-00001 詳細画面に顧客「青葉」・金額「660」が含まれること、発注起票ボタンと請求対象化ボタンの有無を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、受注一覧表示済み
**テスト内容**: ORD-00001 行の詳細ボタンをクリックし、顧客・金額・ボタン有無をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-678
**件名**: ET-03: 受注→発注引き継ぎ探索 - ORD-00002の詳細でデータ修正後の顧客(CUS-005)が表示されるか確認
**テスト意図**: ORD-00002 詳細画面に修正後の顧客（CUS-005/新都建設）が反映されているかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、受注一覧表示済み
**テスト内容**: ORD-00002 行の詳細ボタンをクリックし、新旧顧客の含有をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-679
**件名**: ET-03: 受注→発注引き継ぎ探索 - 発注一覧の行数とステータス値を確認
**テスト意図**: 発注一覧に各種ステータス（下書き・納品済・承認済・発注待ち）が表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: 発注メニューをクリックし、.data-table-body-row の行数と各ステータス含有をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-680
**件名**: ET-03: 受注→発注引き継ぎ探索 - POD-00001の詳細で金額・仕入先・発注書出力を確認
**テスト意図**: POD-00001 詳細画面に金額「528」・仕入先「日本テクノロジー」・発注書出力ボタンが含まれることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、発注一覧表示済み
**テスト内容**: POD-00001 行の詳細ボタンをクリックし、金額・仕入先・ボタン有無をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-681
**件名**: ET-04: マスタ管理探索 - 顧客マスタ一覧 表示件数（PAGE_SIZE=5）の確認
**テスト意図**: 顧客マスタ一覧が5件以下表示されることと table-summary の内容を探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: マスタ管理メニューをクリックし、.data-table-body-row が5件以下で .table-summary の内容をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-682
**件名**: ET-04: マスタ管理探索 - ページング（次へ/前へ）の動作確認
**テスト意図**: 顧客マスタの「次へ」「前へ」ページングが機能することを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 「次へ」ボタンの活性状態を確認し、クリックして2ページ目の行数とサマリーをコンソールに記録し「前へ」で戻る
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-683
**件名**: ET-04: マスタ管理探索 - キーワード検索「青葉」で絞り込み確認
**テスト意図**: 顧客マスタ一覧で「青葉」キーワード検索後の件数と含有を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: input[data-table-input="search"] に「青葉」を入力し、絞り込み後の行数と「青葉」含有をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-684
**件名**: ET-04: マスタ管理探索 - 新規顧客登録で自動採番コード(CUS-010)と保存後の一覧反映を確認
**テスト意図**: 新規顧客登録時の自動採番（CUS-010）と保存後の一覧反映を探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 新規登録ボタンをクリックして採番コードを記録し、「探索テスト商事株式会社」を登録して検索で件数を確認する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-685
**件名**: ET-04: マスタ管理探索 - 商品マスタで単価の表示形式（文字列 vs 数値）を確認
**テスト意図**: 商品マスタ一覧の単価が数値フォーマット（50,000）で表示されるかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: 商品タブに切り替えて「50,000」（カンマ区切り）と「50000」（生文字列）の含有をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-686
**件名**: ET-04: マスタ管理探索 - sales01のマスタ管理: 閲覧可能・新規登録/編集ボタン非表示の確認
**テスト意図**: sales01 がマスタを閲覧できるが新規登録・編集ボタンが非表示であることを探索的に確認する
**前提条件**: sales01 ユーザーでログイン済み、マスタ管理表示済み
**テスト内容**: .data-table-body-row の行数・新規登録ボタン数・編集ボタン数をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-687
**件名**: ET-07: バリデーション探索 - 顧客名を空のまま保存したときのエラーメッセージ確認
**テスト意図**: 顧客名が空のまま保存すると必須バリデーションエラーが表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理の新規登録フォームを開いた状態
**テスト内容**: 空のまま保存ボタンをクリックし、エラーメッセージの内容と件数をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-688
**件名**: ET-07: バリデーション探索 - 既存コード(CUS-001)を入力して保存したとき重複エラーが出るか確認
**テスト意図**: 既存コード（CUS-001）で保存すると重複エラーが表示されることを探索的に確認する
**前提条件**: admin ユーザーでログイン済み、マスタ管理の新規登録フォームを開いた状態
**テスト内容**: コードフィールドを「CUS-001」に変更して保存し、重複エラーメッセージの含有をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-689
**件名**: ET-07: バリデーション探索 - 空IDでログインしたときのエラー確認
**テスト意図**: IDが空のままログインするとエラーが表示されることを探索的に確認する
**前提条件**: ログイン画面表示済み
**テスト内容**: IDを空にしてパスワード「admin123」でログインし、エラー表示とサイドバー表示状況をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-690
**件名**: ET-07: バリデーション探索 - 空パスワードでログインしたときのエラー確認
**テスト意図**: パスワードが空のままログインするとエラーが表示されることを探索的に確認する
**前提条件**: ログイン画面表示済み
**テスト内容**: パスワードを空にしてID「admin」でログインし、エラー表示とサイドバー表示状況をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-691
**件名**: ET-07: バリデーション探索 - CSV出力ボタンが各一覧に存在するか確認
**テスト意図**: マスタ管理・見積・受注・発注一覧にそれぞれCSV出力ボタンが存在するかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: 各メニュー（マスタ管理・見積・受注・発注）をクリックし、CSVボタンの有無をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`

### E2E-692
**件名**: ET-07: バリデーション探索 - 請求・入金・支払・承認・レポート画面がプレースホルダーか確認
**テスト意図**: 各画面（入金登録・支払依頼・承認一覧・レポート・通知一覧）がプレースホルダーか実コンテンツかを探索的に確認する
**前提条件**: admin ユーザーでログイン済み
**テスト内容**: 各メニューをクリックし、プレースホルダーテキストと実コンテンツ（.data-table 等）の有無をコンソールに記録する
**ファイル**: `e2e/explore-et02-04-07.spec.js`
