# テスト追加観点レビュー: 異常系・権限周り

作成日: 2026-05-05

対象:

- `server/routes/*.test.js`
- `server/services/*.test.js`
- `src/*.test.js`
- `e2e/*.spec.js`

## 総評

既存テストは、業務機能の正常系、未認証時の401、画面上の権限制御、バリデーションエラーを広く確認している。一方で、サーバー側APIについては「ログイン済みだが権限がない場合に403になること」の検証が不足している。

特に、E2Eでは「ボタンが表示されない」ことを確認しているが、APIを直接呼び出した場合の防御は別に必要である。CIで守るべき本命は、`server/routes/*.test.js` に権限なしユーザの403ケース、所有者不一致の拒否ケース、余剰フィールド拒否ケースを追加すること。

## 既存テストで確認できていること

- 多くのAPIで未認証時の401を確認している。
- 認証APIでは、正常ログイン、誤パスワード、存在しないユーザ、CookieのHttpOnly、SameSite=Strict、無効JWTを確認している。
- E2Eでは、営業ユーザや経理ユーザで一部メニュー・ボタンが表示されないことを確認している。
- 業務ロジックの単体テストでは、状態遷移、必須入力、金額計算、承認状態などの異常系を一定程度確認している。

## 追加すべきテスト

### Finding 1 [P1] 権限なしログインユーザの403を検証していない

該当箇所:

- `server/routes/customers.test.js:106`
- `server/routes/customers.test.js:162`

内容:

`POST /api/customers` と `PATCH /api/customers/:code` は、正常系と未認証401は確認しているが、ログイン済みで `master:edit` を持たないユーザが403になることを確認していない。

追加すべきテスト:

- `master:view` のみを持つユーザで `POST /api/customers` が403になること。
- `master:view` のみを持つユーザで `PATCH /api/customers/:code` が403になること。
- 403時に `customerService.registerCustomer` / `customerService.updateCustomer` が呼ばれないこと。

期待する実装:

- サーバー側に `requirePermission('master:edit')` を追加する。
- 画面上のボタン表示ではなく、API実行時に認可する。

### Finding 2 [P1] ユーザ管理APIの管理者権限テストがない

該当箇所:

- `server/routes/users.test.js:97`
- `server/routes/users.test.js:151`

内容:

ユーザ作成・更新は権限昇格に直結するが、現在のテストはadmin相当トークンの成功と未認証401に寄っている。一般ユーザや営業ユーザのトークンで拒否されることを確認していない。

追加すべきテスト:

- 一般ユーザで `GET /api/users` が403になること。
- 一般ユーザで `POST /api/users` が403になること。
- 一般ユーザで `PATCH /api/users/:id` が403になること。
- `user-permission:edit` を持つ管理者だけがユーザ作成・更新できること。

期待する実装:

- ユーザ管理APIには `requirePermission('user-permission:edit')` を適用する。
- ユーザ参照だけ許可する要件がある場合でも、作成・更新とは権限を分ける。

### Finding 3 [P2] 他ユーザ通知の既読化を防ぐテストがない

該当箇所:

- `server/routes/notifications.test.js:74`

内容:

通知一覧はログインユーザIDで絞り込むことを確認しているが、既読化は通知IDのみで成功するケースしかない。他ユーザ宛通知を既読化できないことを確認していない。

追加すべきテスト:

- `PUT /api/notifications/:id/read` が `req.user.id` をserviceへ渡すこと。
- 他ユーザ宛通知IDを指定した場合に403または404になること。
- 他ユーザ宛通知IDでは `markAsRead` が成功扱いにならないこと。

期待する実装:

- `markAsRead(id, userId)` に変更する。
- repository更新条件を `id` と `recipientId` の両方にする。

### Finding 4 [P2] 認証Cookieの安全属性は一部のみ検証されている

該当箇所:

- `server/routes/auth.test.js:59`

内容:

HttpOnly、SameSite=Strict、無効JWTの401は確認済み。ただし、production時のSecure属性、JWT秘密鍵の必須化、ログイン試行制限、停止ユーザのログイン拒否はAPIレベルで不足している。

追加すべきテスト:

- `NODE_ENV=production` 時、ログインCookieに `Secure` が付くこと。
- `NODE_ENV=production` かつ `JWT_SECRET` 未設定ならアプリが起動失敗すること。
- 停止ユーザでログインできないこと。
- ログイン失敗を短時間に繰り返すと429になること。

期待する実装:

- productionではJWT秘密鍵未設定を許容しない。
- 認証サービスで `status === '有効'` を確認する。
- `/api/auth/login` に専用rate limitを設定する。

## 追加で検討すべき異常系

### Mass Assignment対策

対象:

- `server/routes/users.test.js`
- `server/routes/customers.test.js`
- `server/routes/products.test.js`
- `server/routes/projects.test.js`

追加すべきテスト:

- `POST /api/users` に `passwordHash`, `permissions`, `role`, `createdBy` など余剰フィールドを含めた場合に400になること、または保存されないこと。
- `PATCH /api/users/:id` で権限・内部フィールドを直接変更できないこと。
- マスタAPIでも未知フィールドが保存されないこと。

### 承認操作の権限検証

対象:

- `server/routes/quotations.test.js`
- `server/routes/orders.test.js`
- `server/routes/purchaseOrders.test.js`
- `server/routes/invoices.test.js`
- `server/routes/payments.test.js`

追加すべきテスト:

- `approval:act` を持たないユーザで `/approve` が403になること。
- `approval:act` を持たないユーザで `/reject` が403になること。
- 申請権限を持たないユーザで `/submit-approval` が403になること。
- 403時に通知作成や状態更新が実行されないこと。

### CSRF相当の防御

対象:

- 状態変更API全般

追加すべきテスト:

- Cookie認証の状態変更APIで、CSRFトークンまたは許可Originがない場合に403になること。
- 許可OriginまたはCSRFトークンがある場合だけ成功すること。

### 出力権限

対象:

- CSV出力
- PDF/帳票出力

追加すべきテスト:

- `master:export` または各画面の `*:export` を持たないユーザでCSV/PDF出力APIまたは画面操作が拒否されること。
- 表示権限のみのユーザでは出力ボタンが表示されず、API直接呼び出しでも403になること。

## 優先順位

1. `server/routes/users.test.js` に一般ユーザ403テストを追加する。
2. `server/routes/customers.test.js` などマスタ更新APIに403テストを追加する。
3. 承認APIに `approval:act` なしユーザの403テストを追加する。
4. `server/routes/notifications.test.js` に他ユーザ通知の既読化拒否テストを追加する。
5. 認証Cookie、JWT_SECRET、停止ユーザ、rate limitの異常系を追加する。
6. Mass AssignmentとCSRF防御のテストを追加する。

## CI観点

これらはE2EよりもAPIテストで守る方が速く、原因も特定しやすい。CIでは、`npm run test` の中で `server/routes/*.test.js` を必ず実行し、権限・異常系の回帰を早期に検出する運用が望ましい。
