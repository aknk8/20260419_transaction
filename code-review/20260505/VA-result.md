# 脆弱性診断結果

診断日: 2026-05-05

対象:

- フロントエンド: `app.js`, `src/*.js`
- バックエンド: `server/**/*.js`
- 依存関係: `package.json`, `package-lock.json`

実施内容:

- 依存関係診断: `npm audit --audit-level=low`
- 認証・認可処理の静的レビュー
- Cookie/JWT/CORS/Helmet/rate limit 設定の静的レビュー
- DOM XSSにつながるHTML生成箇所の静的レビュー
- API入力検証、所有者チェック、監査ログ処理の静的レビュー

制約:

- 動的脆弱性診断、ブラウザ操作による攻撃再現、外部スキャナによる診断は未実施。
- `npm audit` はローカル環境で実行し、結果は 0 vulnerabilities。

## 総合評価

現時点の主なリスクは、依存ライブラリの既知脆弱性ではなく、アプリケーション実装上の認可不備に集中している。

バックエンドAPIはCookie JWTによる認証を導入しているが、多くの更新系APIが「ログイン済みであること」だけを確認しており、業務権限、操作権限、対象データの所有者・担当者チェックを行っていない。そのため、認証済みユーザであれば本来許可されないマスタ更新、ユーザ更新、承認、支払操作などを実行できる可能性が高い。

## 診断結果

### VA-01 [P1] APIが認証のみで認可を行っていない

該当箇所:

- `server/app.js:54`
- `server/routes/users.js:24`
- `server/routes/users.js:38`
- `server/routes/customers.js:20`
- `server/routes/customers.js:33`
- `server/routes/products.js:20`
- `server/routes/products.js:33`
- `server/routes/quotations.js`
- `server/routes/orders.js`
- `server/routes/purchaseOrders.js`
- `server/routes/invoices.js`
- `server/routes/payments.js`
- `server/routes/approvalRoutes.js`

内容:

各APIルートは `preHandler: [fastify.authenticate]` によりJWTの有無だけを確認している。`master:edit`, `user-permission:edit`, `approval:act`, `payment:edit` などの権限をサーバー側で確認する共通処理がない。

影響:

認証済みユーザであれば、本来許可されない操作をAPI直接呼び出しで実行できる。特に `/api/users`, `/api/approval-routes`, `/api/payments/:code/approve`, `/api/invoices/:code/approve` などは業務上の影響が大きい。

推奨対応:

- JWTまたはDBからユーザ権限を取得し、サーバー側に `requirePermission(permission)` を実装する。
- すべてのルートに操作単位の権限を付与する。
- 画面側のボタン表示制御は補助扱いにし、API実行時の認可を正とする。
- 401と403のテストを分け、権限なしユーザで更新・承認・出力APIが403になることを自動テストする。

### VA-02 [P1] JWT秘密鍵が未設定でも固定の開発用秘密鍵で起動する

該当箇所:

- `server/app.js:50`

内容:

`process.env.JWT_SECRET || 'dev-secret-change-in-production'` により、環境変数が未設定でも固定文字列でJWT署名が行われる。

影響:

本番環境で `JWT_SECRET` が未設定のまま起動した場合、既知の秘密鍵で任意のJWTを生成できる。Cookieに入れるだけで任意ユーザとして認証を通過できる可能性がある。

推奨対応:

- `NODE_ENV === 'production'` では `JWT_SECRET` 未設定時に起動失敗させる。
- 十分な長さのランダム値を必須にする。
- 可能であれば鍵IDとローテーション方針を設ける。
- テストでは明示的にテスト用secretを注入する。

### VA-03 [P2] 通知の既読化に所有者チェックがない

該当箇所:

- `server/routes/notifications.js:9`
- `server/routes/notifications.js:11`
- `server/services/notificationService.js:20`
- `server/repositories/notificationRepository.js:14`

内容:

通知一覧取得では `req.user.id` で受信者を絞り込んでいるが、既読化では `notificationId` のみを受け取り、`recipientId` とログインユーザの一致を確認していない。

影響:

認証済みユーザが他ユーザの通知IDを推測または取得できた場合、その通知を既読化できる。通知が承認依頼や却下通知に使われるため、業務上の見落としや監査上の不整合につながる。

推奨対応:

- `markAsRead(id, userId)` に変更する。
- DB更新条件を `id = ? AND recipient_id = ?` にする。
- 対象が存在しない、または所有者でない場合は404または403を返す。
- 他ユーザ通知を既読化できないことをAPIテストに追加する。

### VA-04 [P2] 入力スキーマとホワイトリストが不足し、Mass Assignmentが起こり得る

該当箇所:

- `server/routes/customers.js`
- `server/routes/products.js`
- `server/routes/users.js`
- `server/services/userService.js:33`
- `server/services/userService.js:42`

内容:

認証API以外の多くのルートでFastify schemaまたはZodによるrequest body検証が定義されていない。サービス層では必須項目の一部は確認しているが、許可フィールドのホワイトリスト化が弱く、`registerUser` は `formData` の余剰フィールドをそのまま保存対象に含める。

影響:

意図しないフィールドが保存される可能性がある。ユーザ作成・更新では、権限・状態・内部管理フィールドが混入した場合に権限昇格やデータ破壊につながる。

推奨対応:

- すべてのAPIにrequest schemaを定義する。
- サービス層でも許可フィールドだけを明示的に取り出して保存する。
- `additionalProperties: false` 相当の制御を入れる。
- ユーザ登録・更新では、権限変更APIを通常のユーザ更新APIから分離する。

### VA-05 [P2] ログイン試行への防御が弱い

該当箇所:

- `server/index.js:35`
- `server/routes/auth.js:5`

内容:

全体のrate limitは `RATE_LIMIT_MAX` で設定されているが、デフォルトは100回/分であり、ログイン試行に対する専用制限、ユーザID単位のロック、IP単位の段階的遅延は見当たらない。

影響:

パスワード総当たりや認証情報リスト攻撃に対する耐性が弱い。

推奨対応:

- `/api/auth/login` に専用の低いrate limitを設定する。
- ユーザID/IP単位の失敗回数管理、短時間ロック、監査ログ記録を追加する。
- ログイン失敗イベントを監査ログまたはセキュリティログとして集計する。

### VA-06 [P2] JWTセッションをサーバー側で失効できない

該当箇所:

- `server/routes/auth.js:24`
- `server/routes/auth.js:42`

内容:

ログイン時に15分有効のJWTを発行し、ログアウト時はCookieを削除している。ただし、発行済みJWTのサーバー側失効リストやセッションID管理はない。

影響:

JWTが漏洩した場合、有効期限まではサーバー側で失効できない。パスワード変更、ユーザ停止、強制ログアウトにも即時反映しにくい。

推奨対応:

- JWTに `jti` を入れ、サーバー側セッションテーブルまたは失効リストを持つ。
- ユーザ停止・パスワード変更時に既存セッションを無効化する。
- refresh token方式を採用する場合はローテーションと再利用検知を入れる。

### VA-07 [P2] Cookie認証のCSRF対策がSameSite依存に寄っている

該当箇所:

- `server/routes/auth.js:29`
- `server/routes/auth.js:31`
- `server/routes/customers.js`
- `server/routes/products.js`
- `server/routes/users.js`
- `server/routes/payments.js`

内容:

Cookieには `HttpOnly` と `SameSite=Strict` が設定されており、基本的なCSRF耐性はある。ただし、状態変更APIにCSRFトークン検証はなく、同一サイト配下や将来のCORS/ドメイン構成変更に対する防御は薄い。

影響:

構成変更、サブドメイン運用、SameSite属性の変更時にCSRFリスクが再発しやすい。Cookie認証を継続するなら、状態変更APIに明示的なCSRF防御を置く方が安全。

推奨対応:

- 状態変更APIにCSRFトークンまたはカスタムヘッダ検証を追加する。
- `Origin` / `Referer` 検証も併用する。
- Cookie属性 `Secure`, `HttpOnly`, `SameSite` をセキュリティテストで固定する。

### VA-08 [P3] フロントエンドの権限判定がローカル定義に依存している

該当箇所:

- `app.js:1473`
- `app.js:1478`
- `app.js:5287`

内容:

`/api/auth/me` から取得したAPIユーザに対して、フロント側のローカルユーザ定義から `permissions` を合成している。

影響:

サーバー側の実ユーザ権限とフロント側の表示・操作可否がずれる。特にバックエンド移行中は、画面で許可/不許可と表示される内容が実際のAPI認可と一致しない可能性がある。

推奨対応:

- `/api/auth/me` でサーバー側の権限一覧を返す。
- フロントのローカル権限定義は削除または開発用モックに限定する。
- ただし最終的な認可判断はサーバー側で行う。

### VA-09 [P3] DOM生成はescapeが多用されているが、HTML文字列連結の面積が大きい

該当箇所:

- `app.js:5207`
- `app.js:5398`
- `app.js:5620`
- `app.js:7582`

内容:

画面描画は `innerHTML` による大きなHTML文字列連結が中心である。多くの値は `escapeHtml` されているが、実装面積が大きく、将来の追加箇所でescape漏れが起きやすい。

影響:

ユーザ入力やマスタ名などがescapeされずにHTMLへ混入した場合、DOM XSSにつながる。

推奨対応:

- `innerHTML` 直書き箇所を減らし、DOM APIまたはテンプレート関数の安全なラッパーに寄せる。
- `escapeHtml` 未使用の動的値を静的解析で検出するルールを追加する。
- CSPを明示的に設定し、インラインスクリプト実行を抑止する。

## 依存関係診断

実行コマンド:

```powershell
npm audit --audit-level=low
```

結果:

```text
found 0 vulnerabilities
```

補足:

- 既知脆弱性は検出されなかった。
- ただし、`npm audit` は依存ライブラリの既知CVE検出であり、認可漏れ、IDOR、CSRF、業務ロジック不備は検出できない。

## 優先対応順

1. サーバー側認可ミドルウェアの実装と全ルート適用。
2. `JWT_SECRET` 未設定時の起動失敗化。
3. 通知既読化などID指定APIの所有者チェック追加。
4. 全APIの入力スキーマ化と保存フィールドのホワイトリスト化。
5. ログイン専用rate limit、失敗回数管理、監査ログ追加。
6. JWT失効設計、セッション管理、強制ログアウト対応。
7. CSRFトークンまたはOrigin検証の導入。
8. フロント権限定義のサーバー権限定義への移行。
9. XSS防止のためのDOM生成ルール整備とCSP明示化。

## 推奨する自動テスト

- 権限なしユーザで各POST/PATCH/DELETE/承認APIが403になること。
- 一般ユーザが `/api/users` を作成・更新できないこと。
- 一般ユーザが `/api/approval-routes` を変更できないこと。
- `approval:act` なしユーザが承認・却下APIを実行できないこと。
- 他ユーザの通知IDを既読化できないこと。
- `JWT_SECRET` 未設定のproduction起動が失敗すること。
- リクエストbodyに未知フィールドを含めた場合に400になること。
- ログイン失敗を短時間に繰り返すと429になること。
