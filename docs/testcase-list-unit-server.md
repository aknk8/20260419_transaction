# server/ テストケース一覧

## はじめに

本ドキュメントは `server/` ディレクトリ配下のすべてのテストケースを一覧化したものです。PMおよび開発者が各テストの目的・前提条件・検証内容を把握しやすいよう、分類・通し番号・件名・テスト意図・実行するための前提・テスト内容・パス・ファイル名の各項目を文章形式で記述しています。

テストフレームワークには Vitest を使用しています。ルートテストは Fastify の `app.inject()` を用いたHTTPレベルの検証であり、サービス・リポジトリテストは依存性の注入（DI）によるモック差し替えを基本としています。すべてのテストは AAA（Arrange / Act / Assert）パターンに従って記述されています。

分類略号の対応は以下のとおりです。RT はルートテスト（server/routes/）、ST はサービステスト（server/services/）、PT はプラグインテスト（server/plugins/）、IT はインフラテスト（server/db/ ・ server/jobs/ など）、ReT はリポジトリテスト（server/repositories/）をそれぞれ表します。

---

## ルートテスト（RT）

---

**RT-001**

件名：POST /api/auth/login — 正しい認証情報でログインに成功する

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：有効なユーザー名とパスワードを持つユーザーが認証に成功した際に HTTP 200 が返ることを保証します。ログイン機能の基本的な正常系動作を確認します。

実行するための前提：ユーザーサービスが有効なユーザーオブジェクトを返すようモック設定されており、セッションリポジトリの save メソッドもモック済みです。

テスト内容：POST /api/auth/login に有効な username と password を送信し、レスポンスのステータスコードが 200 であることを確認します。

---

**RT-002**

件名：POST /api/auth/login — レスポンスに HttpOnly クッキーが設定される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログイン成功時に JWT トークンが HttpOnly クッキーとして発行されることを確認します。JavaScript からクッキーへの直接アクセスを禁止し、XSS によるトークン窃取を防ぐためのセキュリティ要件です。

実行するための前提：RT-001 と同様のモック設定です。

テスト内容：ログイン成功後の Set-Cookie ヘッダーに HttpOnly 属性が含まれることを検証します。

---

**RT-003**

件名：POST /api/auth/login — クッキーに SameSite=Strict が設定される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：発行されるクッキーの SameSite 属性が Strict であることを確認します。クロスサイトリクエストへのクッキー送信を防止し CSRF 攻撃を軽減します。

実行するための前提：RT-001 と同様のモック設定です。

テスト内容：Set-Cookie ヘッダーに SameSite=Strict が含まれることを検証します。

---

**RT-004**

件名：POST /api/auth/login — レスポンスにユーザー情報が含まれ passwordHash は含まれない

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログイン成功時のレスポンスボディに id・name・userType が含まれる一方、passwordHash が含まれないことを確認します。機密情報のクライアントへの漏洩を防ぐための検証です。

実行するための前提：RT-001 と同様のモック設定です。

テスト内容：res.json() の内容に id・name・userType が存在し、passwordHash フィールドが存在しないことを検証します。

---

**RT-005**

件名：POST /api/auth/login — 誤ったパスワードで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：存在するユーザーに対して誤ったパスワードを送信したとき HTTP 401 が返ることを確認します。基本的な認証失敗の挙動を保証します。

実行するための前提：ユーザーサービスが認証失敗エラーをスローするようモック設定されています。

テスト内容：不正なパスワードで POST し、ステータスコードが 401 であることを検証します。

---

**RT-006**

件名：POST /api/auth/login — 存在しないユーザー名で 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：存在しないユーザー名でのログイン試行が 401 で拒否されることを確認します。ユーザーの存在有無を攻撃者に教えないよう、パスワード誤りと同じエラー形式を返すことも確認します。

実行するための前提：ユーザーサービスが not found 相当のエラーをスローするよう設定されています。

テスト内容：存在しない username で POST し、ステータスコードが 401 であることを検証します。

---

**RT-007**

件名：POST /api/auth/login — 5 回連続失敗後にアカウントがロックされる

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ブルートフォース攻撃対策として、ログイン失敗が 5 回連続した場合にアカウントロック状態となりアクセスが拒否されることを確認します。

実行するための前提：ユーザーサービスがアカウントロック状態を示すエラーを返すよう設定されています。

テスト内容：5 回の失敗後のリクエストに対してアクセスが拒否（403 または 401）されることを検証します。

---

**RT-008**

件名：POST /api/auth/login — 短時間内の連続リクエストでレートリミット 429 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログインエンドポイントへの集中アクセスに対してレートリミットが機能し HTTP 429 を返すことを確認します。DDoS・ブルートフォース攻撃の軽減が目的です。

実行するための前提：fastify-rate-limit プラグインが設定済みです。

テスト内容：許容回数（5 回）を超えたリクエストに対してステータスコード 429 が返ることを検証します。

---

**RT-009**

件名：POST /api/auth/login — ログイン成功時にセッションが保存される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログイン成功時にサーバー側でセッション（jti）が永続化され、以降のリクエスト検証に使用できる状態になることを確認します。

実行するための前提：セッションリポジトリのモックが設定済みです。

テスト内容：セッションリポジトリの save メソッドが呼ばれることを検証します。

---

**RT-010**

件名：POST /api/auth/logout — 認証済みトークンでログアウトに成功する

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：有効な JWT クッキーを持つリクエストがログアウトに成功し HTTP 200 が返ることを確認します。

実行するための前提：有効な JWT クッキーが設定されたリクエストが用意されています。

テスト内容：POST /api/auth/logout でステータスコード 200 が返ることを検証します。

---

**RT-011**

件名：POST /api/auth/logout — ログアウト時にセッション（jti）が失効される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：ログアウト時にサーバー側でセッション jti がリボークされ、同じトークンでの再アクセスが不可能になることを確認します。ログアウト後のトークン再利用を防止します。

実行するための前提：セッションリポジトリの revoke メソッドがモック済みです。

テスト内容：セッションリポジトリの revoke メソッドが呼ばれることを検証します。

---

**RT-012**

件名：POST /api/auth/logout — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：クッキーなしのログアウトリクエストが 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-013**

件名：GET /api/auth/me — 認証済みトークンでユーザー情報が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：有効な JWT クッキーを持つリクエストが現在のログインユーザー情報を取得できることを確認します。

実行するための前提：有効なトークンがクッキーに設定されており、セッションが有効な状態です。

テスト内容：ステータスコード 200 と id・name・userType を含むレスポンスを検証します。

---

**RT-014**

件名：GET /api/auth/me — セッションが有効なときに 200 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：JWT の有効期限確認に加えて、サーバー側セッション（jti）が失効していないことを確認してから 200 を返す二重チェックを検証します。

実行するための前提：セッションリポジトリがリボーク済みではないセッションを返します。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-015**

件名：GET /api/auth/me — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：クッキーなしの /me アクセスが 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-016**

件名：GET /api/auth/me — リボーク済みセッションのトークンで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：JWT が有効期限内であってもサーバー側でセッションがリボーク済みの場合に 401 が返ることを確認します。ログアウト後にキャプチャしたトークンの再利用を防止します。

実行するための前提：セッションリポジトリがリボーク済みセッションを返すようモック設定されています。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-017**

件名：POST /api/auth/refresh-token — 有効なリフレッシュトークンで新しいアクセストークンが発行される

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：有効なリフレッシュトークンを送信したとき新しいアクセストークン（JWT クッキー）が発行されることを確認します。セッション継続の仕組みを検証します。

実行するための前提：リフレッシュトークンサービスが新しいトークンペアを返すようモック設定されています。

テスト内容：ステータスコード 200 と新しいクッキーの設定を検証します。

---

**RT-018**

件名：POST /api/auth/refresh-token — リフレッシュトークンがローテーションされる

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：リフレッシュ操作ごとに新しいリフレッシュトークンが発行され古いトークンが無効化されるローテーション動作を確認します。トークンの使い回しを防止します。

実行するための前提：RT-017 と同様のモック設定です。

テスト内容：古いリフレッシュトークンがリボークされ新しいトークンが保存されることを検証します。

---

**RT-019**

件名：POST /api/auth/refresh-token — リボーク済みのトークン使用でトークン窃盗を検知し全セッションを失効させる

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：すでにリボーク済みのリフレッシュトークンが再利用された場合（トークン窃盗の検知）、そのユーザーの全セッションを強制リボークしエラーを返すことを確認します。リプレイアタックへの対策です。

実行するための前提：リフレッシュトークンリポジトリがリボーク済みのレコードを返すよう設定されています。

テスト内容：全セッションリボーク処理（revokeAllForUser）の呼び出しとエラーレスポンスを検証します。

---

**RT-020**

件名：POST /api/auth/refresh-token — 有効期限切れのトークンで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：期限切れのリフレッシュトークンが 401 で拒否されることを確認します。

実行するための前提：リフレッシュトークンサービスが期限切れエラーをスローするよう設定されています。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-021**

件名：POST /api/auth/refresh-token — 存在しないトークンで 401 が返る

分類：ルートテスト（server/routes/auth.test.js）

テスト意図：DB に存在しないリフレッシュトークンが 401 で拒否されることを確認します。

実行するための前提：リフレッシュトークンサービスが not found エラーをスローするよう設定されています。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-022**

件名：GET /api/health — DB が設定されていない状態で 200 が返る

分類：ルートテスト（server/routes/health.test.js）

テスト意図：DB 接続が未設定の環境（開発初期など）でもヘルスチェックエンドポイントが 200 を返すことを確認します。DB なしでもサーバー起動確認が可能なことを保証します。

実行するための前提：DB 接続が設定されていない状態でアプリが構築されています。

テスト内容：GET /api/health のステータスコードが 200 であることを検証します。

---

**RT-023**

件名：GET /api/health — レスポンスのタイムスタンプが ISO 8601 形式である

分類：ルートテスト（server/routes/health.test.js）

テスト意図：ヘルスチェックレスポンスに含まれるタイムスタンプが ISO 8601 形式であることを確認します。監視ツールとの互換性を担保します。

実行するための前提：DB が未設定の状態でアプリが起動しています。

テスト内容：レスポンスの timestamp フィールドが ISO 8601 フォーマットに適合することを検証します。

---

**RT-024**

件名：GET /api/health — DB チェック成功時に 200 が返る

分類：ルートテスト（server/routes/health.test.js）

テスト意図：DB 接続が正常な場合にヘルスチェックが 200 を返すことを確認します。DB 込みの正常稼働状態を検証します。

実行するための前提：DB チェック関数が成功を返すようモック設定されています。

テスト内容：GET /api/health のステータスコードが 200 であることを検証します。

---

**RT-025**

件名：GET /api/health — DB チェック失敗時に 503 が返る

分類：ルートテスト（server/routes/health.test.js）

テスト意図：DB 接続障害が発生した場合にヘルスチェックが 503 を返すことを確認します。監視システムが障害を検知できることを保証します。

実行するための前提：DB チェック関数が例外をスローするようモック設定されています。

テスト内容：GET /api/health のステータスコードが 503 であることを検証します。

---

**RT-026**

件名：GET /api/users — 認証済みユーザーにユーザー一覧 200 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：user-permission:edit 権限を持つ認証済みユーザーがユーザー一覧を取得できることを確認します。

実行するための前提：user-permission:edit 権限を含む JWT トークンが設定されており、ユーザーサービスがモックリストを返します。

テスト内容：ステータスコード 200 とユーザーリストを含むレスポンスを検証します。

---

**RT-027**

件名：GET /api/users — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：認証なしのユーザー一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-028**

件名：GET /api/users — user-permission:edit 権限がない場合に 403 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：認証済みであっても user-permission:edit 権限を持たないユーザーがアクセスした場合に 403 が返ることを確認します。エンドポイントの認可制御を検証します。

実行するための前提：user-permission:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

---

**RT-029**

件名：GET /api/users — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/users.test.js）

テスト意図：ユーザー一覧エンドポイントがページネーション対応のレスポンス形式（data 配列と meta オブジェクト）を返すことを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：レスポンスに data 配列と total・page・pageSize・totalPages を含む meta オブジェクトが含まれることを検証します。

---

**RT-030**

件名：GET /api/users/:id — ユーザーが存在するとき 200 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：指定した ID のユーザーを正常取得できることを確認します。

実行するための前提：ユーザーサービスが対象ユーザーを返すようモック設定されています。

テスト内容：ステータスコード 200 と対象ユーザーのデータを検証します。

---

**RT-031**

件名：GET /api/users/:id — ユーザーが存在しないとき 404 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：存在しない ID 指定時に 404 が返ることを確認します。

実行するための前提：ユーザーサービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-032**

件名：POST /api/users — 認証済みかつ権限ありで 201 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：適切な権限を持つユーザーが新規ユーザーを登録でき HTTP 201 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されており、ユーザーサービスの registerUser がモックされています。

テスト内容：ステータスコード 201 と作成されたユーザーデータを検証します。

---

**RT-033**

件名：POST /api/users — 必須フィールド欠落で 400 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：name や password などの必須フィールドが欠落したリクエストで 400 が返ることを確認します。入力バリデーションを検証します。

実行するための前提：ユーザーサービスがバリデーションエラーをスローするよう設定されています。

テスト内容：必須フィールドなしのリクエストに対してステータスコード 400 が返ることを検証します。

---

**RT-034**

件名：POST /api/users — 未定義フィールドの送信で 400 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：スキーマに存在しない余分なフィールドを含むリクエストが 400 で拒否されることを確認します。意図しないデータの書き込みを防ぎます。

実行するための前提：ユーザーサービスが追加フィールドを拒否するよう設定されています。

テスト内容：不正フィールドを含むリクエストに対してステータスコード 400 が返ることを検証します。

---

**RT-035**

件名：PATCH /api/users/:id — 認証済みかつ権限ありで更新が成功する

分類：ルートテスト（server/routes/users.test.js）

テスト意図：適切な権限を持つユーザーがユーザー情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と更新後のユーザーデータを検証します。

---

**RT-036**

件名：PATCH /api/users/:id — 存在しないユーザー更新で 404 が返る

分類：ルートテスト（server/routes/users.test.js）

テスト意図：存在しないユーザーへの更新リクエストが 404 で拒否されることを確認します。

実行するための前提：ユーザーサービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-037**

件名：GET /api/products — 認証済みユーザーに商品一覧 200 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：認証済みユーザーが商品一覧を取得できることを確認します。参照系エンドポイントの基本正常系です。

実行するための前提：営業ロールの JWT トークンが設定されており、商品サービスがモックリストを返します。

テスト内容：GET /api/products のステータスコードが 200 であり、res.json().data に商品リストが含まれることを検証します。

---

**RT-038**

件名：GET /api/products — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：認証なしの商品一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-039**

件名：GET /api/products — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/products.test.js）

テスト意図：商品一覧エンドポイントが data 配列と meta オブジェクト（total・page・pageSize・totalPages）を含むページネーション対応レスポンスを返すことを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

**RT-040**

件名：GET /api/products — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/products.test.js）

テスト意図：存在しないページを指定したとき data が空配列になる一方、meta の total は正しい件数を返すことを確認します。ページネーションの境界動作を検証します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?page=2 でリクエストし、body.data が空配列、meta.page=2・meta.total=1 であることを検証します。

---

**RT-041**

件名：GET /api/products — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/products.test.js）

テスト意図：limit パラメーターを指定したとき meta.pageSize がその値になり、返却件数が limit 以内に収まることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 配列の長さが 1 であることを検証します。

---

**RT-042**

件名：GET /api/products/:code — コードが存在するとき 200 と商品データが返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：指定したコードの商品を正常取得できることを確認します。

実行するための前提：商品サービスが対象商品を返すようモック設定されています。

テスト内容：ステータスコード 200 と res.json().code が 'PRD-001' であることを検証します。

---

**RT-043**

件名：GET /api/products/:code — 商品が存在しないとき 404 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：商品サービスが statusCode=404 のエラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-044**

件名：POST /api/products — master:edit 権限ありで 201 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：master:edit 権限を持つユーザーが新規商品を登録でき HTTP 201 が返ることを確認します。

実行するための前提：master:edit 権限を含む JWT トークンが設定されており、商品サービスの registerProduct がモックされています。

テスト内容：ステータスコード 201 と res.json().code が 'PRD-001' であることを検証します。

---

**RT-045**

件名：POST /api/products — 商品名欠落で 400 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：name フィールドなしの登録リクエストで 400 が返ることを確認します。必須フィールドのバリデーションを検証します。

実行するための前提：商品サービスがバリデーションエラーをスローするよう設定されています。

テスト内容：name なしのリクエストに対してステータスコード 400 が返ることを検証します。

---

**RT-046**

件名：POST /api/products — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：認証なしの商品登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-047**

件名：PATCH /api/products/:code — master:edit 権限ありで更新が成功する

分類：ルートテスト（server/routes/products.test.js）

テスト意図：適切な権限を持つユーザーが商品情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-048**

件名：PATCH /api/products/:code — 存在しない商品更新で 404 が返る

分類：ルートテスト（server/routes/products.test.js）

テスト意図：存在しないコードの商品更新が 404 で拒否されることを確認します。

実行するための前提：商品サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-049**

件名：GET /api/customers — 認証済みユーザーに顧客一覧 200 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：認証済みユーザーが顧客一覧を取得できることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、顧客サービスがモックリストを返します。

テスト内容：GET /api/customers のステータスコードが 200 であり、res.json().data に顧客リストが含まれることを検証します。

---

**RT-050**

件名：GET /api/customers — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：認証なしの顧客一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-051**

件名：GET /api/customers — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：顧客一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

**RT-052**

件名：GET /api/customers — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：存在しないページ指定時に data が空配列になることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?page=2 でリクエストし、data が空配列、meta.page=2 であることを検証します。

---

**RT-053**

件名：GET /api/customers — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：limit パラメーターが meta.pageSize と返却件数に正しく反映されることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 長さが 1 であることを検証します。

---

**RT-054**

件名：GET /api/customers/:code — コードが存在するとき 200 と顧客データが返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：指定したコードの顧客を正常取得できることを確認します。

実行するための前提：顧客サービスが対象顧客を返すようモック設定されています。

テスト内容：ステータスコード 200 と res.json().code が 'CUS-001' であることを検証します。

---

**RT-055**

件名：GET /api/customers/:code — 顧客が存在しないとき 404 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：顧客サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-056**

件名：POST /api/customers — master:edit 権限ありで 201 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：master:edit 権限を持つユーザーが新規顧客を登録でき HTTP 201 が返ることを確認します。

実行するための前提：master:edit 権限を含む JWT トークンが設定されています。

テスト内容：ステータスコード 201 と res.json().code が 'CUS-001' であることを検証します。

---

**RT-057**

件名：POST /api/customers — closingDay・paymentSite・billingTo が registerCustomer に渡される

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：請求サイクル関連フィールド（closingDay・paymentSite・billingTo）がリクエストボディから正しくサービス層に渡されることを確認します。フィールドの取りこぼしを防ぎます。

実行するための前提：master:edit 権限付き JWT トークンが設定されており、mockCustomerService がキャプチャ可能な状態です。

テスト内容：registerCustomer が expect.objectContaining({ closingDay, paymentSite, billingTo }) で呼ばれることを検証します。

---

**RT-058**

件名：POST /api/customers — 顧客名欠落で 400 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：name フィールドなしの登録リクエストで 400 が返ることを確認します。

実行するための前提：顧客サービスがバリデーションエラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

**RT-059**

件名：POST /api/customers — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：認証なしの顧客登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-060**

件名：PATCH /api/customers/:code — master:edit 権限ありで更新が成功する

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：適切な権限を持つユーザーが顧客情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-061**

件名：PATCH /api/customers/:code — closingDay・paymentSite・billingTo が updateCustomer に渡される

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：更新時に closingDay・paymentSite・billingTo フィールドがサービス層に正しく渡されることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されており、mockCustomerService がキャプチャ可能な状態です。

テスト内容：updateCustomer が 'CUS-001' と expect.objectContaining({ closingDay, paymentSite, billingTo }) で呼ばれることを検証します。

---

**RT-062**

件名：PATCH /api/customers/:code — 存在しない顧客更新で 404 が返る

分類：ルートテスト（server/routes/customers.test.js）

テスト意図：存在しないコードの顧客更新が 404 で拒否されることを確認します。

実行するための前提：顧客サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-063**

件名：GET /api/suppliers — 認証済みユーザーに仕入先一覧 200 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：認証済みユーザーが仕入先一覧を取得できることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、仕入先サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に仕入先リストが含まれることを検証します。

---

**RT-064**

件名：GET /api/suppliers — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：認証なしの仕入先一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-065**

件名：GET /api/suppliers — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：仕入先一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

**RT-066**

件名：GET /api/suppliers — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：存在しないページ指定時に data が空配列になることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?page=2 で data が空配列、meta.page=2 であることを検証します。

---

**RT-067**

件名：GET /api/suppliers — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：limit パラメーターが pageSize と返却件数に正しく反映されることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 長さが 1 であることを検証します。

---

**RT-068**

件名：GET /api/suppliers/:code — コードが存在するとき 200 と仕入先データが返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：指定したコードの仕入先を正常取得できることを確認します。

実行するための前提：仕入先サービスが対象仕入先を返すようモック設定されています。

テスト内容：ステータスコード 200 と res.json().code が 'SUP-001' であることを検証します。

---

**RT-069**

件名：GET /api/suppliers/:code — 仕入先が存在しないとき 404 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：仕入先サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-070**

件名：POST /api/suppliers — master:edit 権限ありで 201 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：master:edit 権限を持つユーザーが新規仕入先を登録でき HTTP 201 が返ることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 201 と res.json().code が 'SUP-001' であることを検証します。

---

**RT-071**

件名：POST /api/suppliers — 仕入先名欠落で 400 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：name フィールドなしの登録リクエストで 400 が返ることを確認します。

実行するための前提：仕入先サービスがバリデーションエラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

**RT-072**

件名：POST /api/suppliers — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：認証なしの仕入先登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-073**

件名：PATCH /api/suppliers/:code — master:edit 権限ありで更新が成功する

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：適切な権限を持つユーザーが仕入先情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：master:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-074**

件名：PATCH /api/suppliers/:code — 存在しない仕入先更新で 404 が返る

分類：ルートテスト（server/routes/suppliers.test.js）

テスト意図：存在しないコードの仕入先更新が 404 で拒否されることを確認します。

実行するための前提：仕入先サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-075**

件名：GET /api/deliveries — 認証済みユーザーに納品一覧 200 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証済みユーザーが納品一覧を取得できることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、納品サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に納品リストが含まれることを検証します。

---

**RT-076**

件名：GET /api/deliveries — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証なしの納品一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-077**

件名：GET /api/deliveries — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：納品一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

**RT-078**

件名：GET /api/deliveries — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：存在しないページ指定時に data が空配列になることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?page=2 で data が空配列、meta.page=2 であることを検証します。

---

**RT-079**

件名：GET /api/deliveries — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：limit パラメーターが pageSize と返却件数に正しく反映されることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 長さが 1 であることを検証します。

---

**RT-080**

件名：POST /api/deliveries — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証済みユーザーが納品を登録でき HTTP 201 が返ることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、納品サービスの registerDelivery がモックされています。

テスト内容：ステータスコード 201 と res.json().code が 'DLV-00001' であることを検証します。

---

**RT-081**

件名：POST /api/deliveries — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証なしの納品登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-082**

件名：PATCH /api/deliveries/:code — 認証済みユーザーで更新が成功する

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証済みユーザーが納品ステータスを更新でき HTTP 200 が返ることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、納品サービスの updateDelivery がモックされています。

テスト内容：ステータスコード 200 と res.json().status が '検収済' であることを検証します。

---

**RT-083**

件名：PATCH /api/deliveries/:code — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/deliveries.test.js）

テスト意図：認証なしの納品更新が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-084**

件名：GET /api/projects — 認証済みユーザーにプロジェクト一覧 200 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：認証済みユーザーがプロジェクト一覧を取得できることを確認します。

実行するための前提：営業ロールの JWT トークンが設定されており、プロジェクトサービスがモックリストを返します。

テスト内容：ステータスコード 200 と data にプロジェクトリストが含まれることを検証します。

---

**RT-085**

件名：GET /api/projects — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：認証なしのプロジェクト一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-086**

件名：GET /api/projects/:code — コードが存在するとき 200 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：指定コードのプロジェクトを正常取得できることを確認します。

実行するための前提：プロジェクトサービスが対象プロジェクトを返すようモック設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-087**

件名：GET /api/projects/:code — プロジェクトが存在しないとき 404 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：プロジェクトサービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-088**

件名：POST /api/projects — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：認証済みユーザーがプロジェクトを登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、プロジェクトサービスの registerProject がモックされています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

**RT-089**

件名：POST /api/projects — プロジェクト名欠落で 400 が返る

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：name フィールドなしの登録リクエストで 400 が返ることを確認します。

実行するための前提：プロジェクトサービスがバリデーションエラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

**RT-090**

件名：PATCH /api/projects/:code — 認証済みユーザーで更新が成功する

分類：ルートテスト（server/routes/projects.test.js）

テスト意図：認証済みユーザーがプロジェクト情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-091**

件名：GET /api/settings — 認証済みユーザーにシステム設定 200 が返る

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：認証済みユーザーがシステム設定を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、設定サービスがモックデータを返します。

テスト内容：ステータスコード 200 と設定オブジェクトが返ることを検証します。

---

**RT-092**

件名：GET /api/settings — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：認証なしの設定取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-093**

件名：PUT /api/settings — 認証済みユーザーで設定更新が成功する

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：認証済みユーザーがシステム設定を更新でき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、設定サービスの updateSettings がモックされています。

テスト内容：ステータスコード 200 と更新後の設定オブジェクトが返ることを検証します。

---

**RT-094**

件名：PUT /api/settings — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：認証なしの設定更新が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-095**

件名：PUT /api/settings — ルートが設定サービスの updateSettings に委譲する

分類：ルートテスト（server/routes/settings.test.js）

テスト意図：PUT /api/settings ルートがリクエストボディをそのまま設定サービスの updateSettings に渡す委譲動作を確認します。ルートがビジネスロジックを持たず、サービス層への正しい委譲が行われることを検証します。

実行するための前提：JWT トークンと mockSettingsService が設定されています。

テスト内容：mockSettingsService.updateSettings がリクエストボディと同じ引数で呼ばれることを検証します。

---

**RT-096**

件名：GET /api/notifications — 認証済みユーザーに通知一覧 200 が返る

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：認証済みユーザーが自分宛の通知一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、通知サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に通知リストが含まれることを検証します。

---

**RT-097**

件名：GET /api/notifications — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：認証なしの通知一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-098**

件名：GET /api/notifications — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：通知一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

**RT-099**

件名：GET /api/notifications — ユーザー ID がサービスに正しく渡される

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：JWT から取得したユーザー ID が通知取得サービスに正しく渡され、自分宛の通知のみ取得できることを確認します。

実行するための前提：JWT トークンに id フィールドが含まれており、mockNotificationService がキャプチャ可能な状態です。

テスト内容：getNotificationsForUser が JWT の id で呼ばれることを検証します。

---

**RT-100**

件名：PUT /api/notifications/:id/read — 自分の通知を既読にできる

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：通知の所有者が自分宛の通知を既読状態に更新できることを確認します。

実行するための前提：JWT トークンが設定されており、通知サービスの markAsRead がモックされています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-101**

件名：PUT /api/notifications/:id/read — 他人の通知を既読にしようとすると 404 が返る

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：通知の所有者以外が既読操作を行った場合に 404 が返ることを確認します。通知の所有権チェックを検証します。

実行するための前提：通知サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-102**

件名：POST /api/notifications/read-all — 認証済みユーザーの全通知を既読にできる

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：認証済みユーザーが自分宛の全通知を一括既読にできることを確認します。

実行するための前提：JWT トークンが設定されており、通知サービスの markAllAsRead がモックされています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-103**

件名：POST /api/notifications/read-all — ユーザー ID がサービスに正しく渡される

分類：ルートテスト（server/routes/notifications.test.js）

テスト意図：一括既読操作が JWT の userId を使って正しいユーザーの通知のみを既読にすることを確認します。

実行するための前提：JWT トークンに id フィールドが含まれています。

テスト内容：markAllAsRead が JWT の id で呼ばれることを検証します。

---

**RT-104**

件名：GET /api/quotations — 認証済みユーザーに見積一覧 200 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：認証済みユーザーが見積一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、見積サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に見積リストが含まれることを検証します。

---

**RT-105**

件名：GET /api/quotations — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：認証なしの見積一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-106**

件名：GET /api/quotations — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：見積一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

**RT-107**

件名：GET /api/quotations/:code — コードが存在するとき 200 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：指定コードの見積を正常取得できることを確認します。

実行するための前提：見積サービスが対象見積を返すようモック設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-108**

件名：GET /api/quotations/:code — 見積が存在しないとき 404 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：見積サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-109**

件名：POST /api/quotations — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：認証済みユーザーが見積を登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、見積サービスの registerQuotation がモックされています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

**RT-110**

件名：PATCH /api/quotations/:code — 認証済みユーザーで更新が成功する

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：認証済みユーザーが見積情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-111**

件名：POST /api/quotations/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：approval:apply 権限を持つユーザーが見積の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されており、見積サービスの submitQuotationApproval がモックされています。

テスト内容：ステータスコード 200 と res.json().status が '承認依頼中' であることを検証します。

---

**RT-112**

件名：POST /api/quotations/:code/submit-approval — 不正なステータス遷移で 400 が返る

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：承認申請が下書き状態以外から行われた場合に 400 が返ることを確認します。不正なステータス遷移を防止します。

実行するための前提：見積サービスがステータス遷移エラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

**RT-113**

件名：POST /api/quotations/:code/approve — approval:act 権限ありで承認済みになる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：approval:act 権限を持つユーザーが見積を承認でき、ステータスが「承認済み」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認済み' であることを検証します。

---

**RT-114**

件名：POST /api/quotations/:code/reject — approval:act 権限ありで却下になる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：approval:act 権限を持つユーザーが見積を却下でき、ステータスが「却下」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '却下' であることを検証します。

---

**RT-115**

件名：POST /api/quotations/:code/submit-approval — N-01 通知：承認者 ID リストで notifyApprovalRequest が呼ばれる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：承認申請送信後に承認経路リポジトリから承認者を取得し、通知サービスの notifyApprovalRequest が正しい引数で呼ばれることを確認します。承認依頼通知（N-01）のトリガーを検証します。

実行するための前提：approvalRouteRepository がモック承認者リストを返す設定であり、通知サービスがモック済みです。

テスト内容：notifyApprovalRequest が ('quotation', code, ['approver01'], userObj) で呼ばれることを検証します。

---

**RT-116**

件名：POST /api/quotations/:code/approve — N-02 通知：申請者 ID で notifyApprovalComplete が呼ばれる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：承認操作後に承認完了通知（N-02）がオリジナルの申請者 ID に送付されることを確認します。

実行するための前提：見積サービスが submittedBy フィールドを含む見積を返し、通知サービスがモック済みです。

テスト内容：notifyApprovalComplete が ('quotation', code, submittedBy, userObj) で呼ばれることを検証します。

---

**RT-117**

件名：POST /api/quotations/:code/reject — N-03 通知：申請者 ID と却下理由で notifyRejection が呼ばれる

分類：ルートテスト（server/routes/quotations.test.js）

テスト意図：却下操作後に却下通知（N-03）が申請者に送付され、理由が含まれることを確認します。

実行するための前提：見積サービスが submittedBy を含む見積を返し、通知サービスがモック済みです。

テスト内容：notifyRejection が ('quotation', code, submittedBy, reason, userObj) で呼ばれることを検証します。

---

**RT-118**

件名：GET /api/orders — 認証済みユーザーに受注一覧 200 が返る

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：認証済みユーザーが受注一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、受注サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に受注リストが含まれることを検証します。

---

**RT-119**

件名：GET /api/orders — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：受注一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

**RT-120**

件名：POST /api/orders/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：approval:apply 権限を持つユーザーが受注の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認依頼中' であることを検証します。

---

**RT-121**

件名：POST /api/orders/:code/approve — N-02 通知：承認完了通知が申請者に送付される

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：受注の承認操作後に承認完了通知が申請者に送付されることを確認します。

実行するための前提：受注サービスが submittedBy を含む受注を返し、通知サービスがモック済みです。

テスト内容：notifyApprovalComplete が正しい引数で呼ばれることを検証します。

---

**RT-122**

件名：POST /api/orders/:code/reject — N-03 通知：却下通知が申請者に送付される

分類：ルートテスト（server/routes/orders.test.js）

テスト意図：受注の却下操作後に却下通知が申請者に送付されることを確認します。

実行するための前提：受注サービスが submittedBy を含む受注を返し、通知サービスがモック済みです。

テスト内容：notifyRejection が正しい引数で呼ばれることを検証します。

---

**RT-123**

件名：GET /api/purchase-orders — 認証済みユーザーに発注一覧 200 が返る

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：認証済みユーザーが発注一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、発注サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に発注リストが含まれることを検証します。

---

**RT-124**

件名：GET /api/purchase-orders — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：発注一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

**RT-125**

件名：POST /api/purchase-orders/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：approval:apply 権限を持つユーザーが発注の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認依頼中' であることを検証します。

---

**RT-126**

件名：POST /api/purchase-orders/:code/approve — N-02 通知：承認完了通知が申請者に送付される

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：発注の承認操作後に承認完了通知が申請者に送付されることを確認します。

実行するための前提：発注サービスが submittedBy を含む発注を返し、通知サービスがモック済みです。

テスト内容：notifyApprovalComplete が正しい引数で呼ばれることを検証します。

---

**RT-127**

件名：POST /api/purchase-orders/:code/reject — N-03 通知：却下通知が申請者に送付される

分類：ルートテスト（server/routes/purchaseOrders.test.js）

テスト意図：発注の却下操作後に却下通知が申請者に送付されることを確認します。

実行するための前提：発注サービスが submittedBy を含む発注を返し、通知サービスがモック済みです。

テスト内容：notifyRejection が正しい引数で呼ばれることを検証します。

---

**RT-128**

件名：GET /api/invoices — 認証済みユーザーに請求一覧 200 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証済みユーザーが請求一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、請求サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に請求リストが含まれることを検証します。

---

**RT-129**

件名：GET /api/invoices — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証なしの請求一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-130**

件名：GET /api/invoices — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta.total=1・page=1・pageSize=20・totalPages=1 であることを検証します。

---

**RT-131**

件名：GET /api/invoices — ページが総ページ数を超えた場合に data が空になる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：存在しないページ指定時に data が空配列になることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?page=2 で data が空配列、meta.page=2 であることを検証します。

---

**RT-132**

件名：GET /api/invoices — limit クエリパラメーターが反映される

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：limit パラメーターが pageSize と返却件数に正しく反映されることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?limit=1 でリクエストし、meta.pageSize=1 かつ data 長さが 1 であることを検証します。

---

**RT-133**

件名：GET /api/invoices/:code — コードが存在するとき 200 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：指定コードの請求を正常取得できることを確認します。

実行するための前提：請求サービスが対象請求を返すようモック設定されています。

テスト内容：ステータスコード 200 と res.json().code が 'INV-00001' であることを検証します。

---

**RT-134**

件名：GET /api/invoices/:code — 請求が存在しないとき 404 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：存在しないコード指定時に 404 が返ることを確認します。

実行するための前提：請求サービスが 404 エラーをスローするよう設定されています。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-135**

件名：POST /api/invoices — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証済みユーザーが請求を登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、請求サービスの registerInvoice がモックされています。

テスト内容：ステータスコード 201 と res.json().code が 'INV-00001' であることを検証します。

---

**RT-136**

件名：POST /api/invoices — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証なしの請求登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-137**

件名：PATCH /api/invoices/:code — 認証済みユーザーで更新が成功する

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証済みユーザーが請求情報を更新でき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-138**

件名：POST /api/invoices/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：approval:apply 権限を持つユーザーが請求の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と res.json().status が '承認依頼中' であることを検証します。

---

**RT-139**

件名：POST /api/invoices/:code/submit-approval — 不正なステータス遷移で 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：承認申請が下書き状態以外から行われた場合に 400 が返ることを確認します。

実行するための前提：請求サービスがステータス遷移エラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

**RT-140**

件名：POST /api/invoices/:code/approve — approval:act 権限ありで確定になる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：approval:act 権限を持つユーザーが請求を承認でき、ステータスが「確定」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '確定' であることを検証します。

---

**RT-141**

件名：POST /api/invoices/:code/reject — approval:act 権限ありで却下になる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：approval:act 権限を持つユーザーが請求を却下でき、ステータスが「却下」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '却下' であることを検証します。

---

**RT-142**

件名：POST /api/invoices/:code/submit-approval — N-01 通知：承認者 ID リストで notifyApprovalRequest が呼ばれる

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求承認申請送信後に承認者リストに対して notifyApprovalRequest が呼ばれることを確認します。

実行するための前提：approvalRouteRepository がモック承認者を返す設定で、通知サービスがモック済みです。

テスト内容：notifyApprovalRequest が ('invoice', code, ['approver01'], userObj) で呼ばれることを検証します。

---

**RT-143**

件名：POST /api/invoices/:code/approve — N-02 通知：承認完了通知が申請者に送付される

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求承認操作後に承認完了通知が申請者に送付されることを確認します。

実行するための前提：請求サービスが submittedBy を含む請求を返し、通知サービスがモック済みです。

テスト内容：notifyApprovalComplete が ('invoice', code, submittedBy, userObj) で呼ばれることを検証します。

---

**RT-144**

件名：POST /api/invoices/:code/reject — N-03 通知：却下通知が申請者に送付される

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求却下操作後に却下通知が申請者に理由とともに送付されることを確認します。

実行するための前提：請求サービスが submittedBy を含む請求を返し、通知サービスがモック済みです。

テスト内容：notifyRejection が ('invoice', code, submittedBy, reason, userObj) で呼ばれることを検証します。

---

**RT-145**

件名：GET /api/invoices/candidates — 認証済みユーザーに請求候補一覧 200 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：請求書作成の候補となる受注一覧が year と month パラメーターを指定して取得できることを確認します。

実行するための前提：JWT トークンが設定されており、請求サービスの listInvoiceCandidates がモックデータを返します。

テスト内容：?year=2026&month=5 でリクエストし、ステータス 200 と配列レスポンスを検証します。

---

**RT-146**

件名：GET /api/invoices/candidates — month が欠落した場合に 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：必須クエリパラメーター month が欠落した場合に 400 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?year=2026 のみでリクエストし、ステータスコード 400 が返ることを検証します。

---

**RT-147**

件名：GET /api/invoices/candidates — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証なしの請求候補一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-148**

件名：GET /api/reports/monthly-summary — 認証済みユーザーに月次サマリー 200 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証済みユーザーが指定年月のプロジェクト別月次サマリー（売上・原価・利益）を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、請求サービスの getMonthlySummary がモックデータを返します。

テスト内容：?year=2026&month=5 でリクエストし、ステータス 200 と projectCode・sales・cost・profit を含む配列を検証します。

---

**RT-149**

件名：GET /api/reports/monthly-summary — year が欠落した場合に 400 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：必須クエリパラメーター year が欠落した場合に 400 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：?month=5 のみでリクエストし、ステータスコード 400 が返ることを検証します。

---

**RT-150**

件名：GET /api/reports/monthly-summary — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/invoices.test.js）

テスト意図：認証なしの月次サマリー取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-151**

件名：GET /api/payments — 認証済みユーザーに支払一覧 200 が返る

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：認証済みユーザーが支払一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、支払サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に支払リストが含まれることを検証します。

---

**RT-152**

件名：GET /api/payments — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：支払一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

**RT-153**

件名：POST /api/payments — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：認証済みユーザーが支払を登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、支払サービスの registerPayment がモックされています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

**RT-154**

件名：POST /api/payments/:code/submit-approval — approval:apply 権限ありで承認依頼中になる

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：approval:apply 権限を持つユーザーが支払の承認申請を送信でき、ステータスが「承認依頼中」になることを確認します。

実行するための前提：approval:apply 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認依頼中' であることを検証します。

---

**RT-155**

件名：POST /api/payments/:code/approve — approval:act 権限ありで承認済みになる

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：approval:act 権限を持つユーザーが支払を承認でき、ステータスが「承認済み」になることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認済み' であることを検証します。

---

**RT-156**

件名：POST /api/payments/:code/reject — 不正なステータス遷移で 400 が返る

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：却下操作が承認依頼中以外の状態から行われた場合に 400 が返ることを確認します。

実行するための前提：支払サービスがステータス遷移エラーをスローするよう設定されています。

テスト内容：ステータスコード 400 が返ることを検証します。

---

**RT-157**

件名：POST /api/payments/:code/cancel — 認証済みユーザーでキャンセルが成功する

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：認証済みユーザーが支払をキャンセルでき HTTP 200 が返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が 'キャンセル' であることを検証します。

---

**RT-158**

件名：POST /api/payments/:code/register-result — payment:edit 権限ありで支払済みになる

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：payment:edit 権限を持つユーザーが支払実績を登録でき、ステータスが「支払済み」になることを確認します。

実行するための前提：payment:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '支払済み' であることを検証します。

---

**RT-159**

件名：POST /api/payments/:code/register-result — payment:edit 権限がない場合に 403 が返る

分類：ルートテスト（server/routes/payments.test.js）

テスト意図：payment:edit 権限を持たないユーザーによる支払実績登録が 403 で拒否されることを確認します。

実行するための前提：payment:edit 権限のない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

---

**RT-160**

件名：GET /api/receipts — 認証済みユーザーに入金一覧 200 が返る

分類：ルートテスト（server/routes/receipts.test.js）

テスト意図：認証済みユーザーが入金一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、入金サービスがモックリストを返します。

テスト内容：ステータスコード 200 と data に入金リストが含まれることを検証します。

---

**RT-161**

件名：GET /api/receipts — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/receipts.test.js）

テスト意図：認証なしの入金一覧取得が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-162**

件名：POST /api/receipts — 認証済みユーザーで 201 が返る

分類：ルートテスト（server/routes/receipts.test.js）

テスト意図：認証済みユーザーが入金を登録でき HTTP 201 が返ることを確認します。

実行するための前提：JWT トークンが設定されており、入金サービスの registerReceipt がモックされています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

**RT-163**

件名：POST /api/receipts — 未認証リクエストで 401 が返る

分類：ルートテスト（server/routes/receipts.test.js）

テスト意図：認証なしの入金登録が 401 で拒否されることを確認します。

実行するための前提：認証クッキーがリクエストに含まれていません。

テスト内容：ステータスコード 401 が返ることを検証します。

---

**RT-164**

件名：GET /api/approvals — 認証済みユーザーに承認待ち一覧 200 が返る

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：認証済みユーザーがすべての承認待ちドキュメント一覧を取得できることを確認します。

実行するための前提：JWT トークンが設定されており、承認サービスがモック一覧を返します。

テスト内容：ステータスコード 200 と data に承認待ち一覧が含まれることを検証します。

---

**RT-165**

件名：GET /api/approvals — pending-only フィルターが機能する

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：?pending=true クエリパラメーターを指定したとき承認待ち（承認依頼中）のドキュメントのみが返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：返却されるドキュメントがすべて承認依頼中ステータスであることを検証します。

---

**RT-166**

件名：GET /api/approvals — docType フィルターが機能する

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：?docType=quotation などのフィルターを指定したとき対象種別のドキュメントのみが返ることを確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：指定した docType のドキュメントのみ含まれることを検証します。

---

**RT-167**

件名：GET /api/approvals — ページネーションレスポンスに data と meta が含まれる

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：承認一覧エンドポイントのページネーション対応レスポンス形式を確認します。

実行するための前提：JWT トークンが設定されています。

テスト内容：meta に total・page・pageSize・totalPages が含まれることを検証します。

---

**RT-168**

件名：POST /api/approvals/:code/approve — QUO- プレフィックスで見積承認ルートに正しく委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：汎用承認エンドポイントがコードのプレフィックス（QUO-）から対象サービスを判定し、見積の承認処理に正しく委譲することを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と status が '承認済み' であることを検証します。

---

**RT-169**

件名：POST /api/approvals/:code/approve — ORD- プレフィックスで受注承認ルートに委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：ORD- プレフィックスのコードで受注の承認処理に正しく委譲されることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-170**

件名：POST /api/approvals/:code/approve — POD- プレフィックスで発注承認ルートに委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：POD- プレフィックスのコードで発注の承認処理に正しく委譲されることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-171**

件名：POST /api/approvals/:code/approve — INV- プレフィックスで請求承認ルートに委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：INV- プレフィックスのコードで請求の承認処理に正しく委譲されることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-172**

件名：POST /api/approvals/:code/approve — PAY- プレフィックスで支払承認ルートに委譲される

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：PAY- プレフィックスのコードで支払の承認処理に正しく委譲されることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-173**

件名：POST /api/approvals/:code/approve — 未知のプレフィックスで 400 が返る

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：認識できないプレフィックスのコードが指定された場合に 400 が返ることを確認します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：認識できないプレフィックスのコードで POST し、ステータスコード 400 が返ることを検証します。

---

**RT-174**

件名：POST /api/approvals/:code/reject — reason が欠落した場合に 400 が返る

分類：ルートテスト（server/routes/approvals.test.js）

テスト意図：却下操作において理由（reason）が欠落した場合に 400 が返ることを確認します。却下理由の記録を必須とするビジネスルールを検証します。

実行するための前提：approval:act 権限付き JWT トークンが設定されています。

テスト内容：reason なしで却下リクエストを送信し、ステータスコード 400 が返ることを検証します。

---

**RT-175**

件名：GET /api/approval-routes — 認証済みかつ権限ありに承認経路一覧 200 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：user-permission:edit 権限を持つ認証済みユーザーが承認経路一覧を取得できることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 と承認経路リストが返ることを検証します。

---

**RT-176**

件名：GET /api/approval-routes — user-permission:edit 権限がない場合に 403 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：承認経路の参照が user-permission:edit 権限を必要とすることを確認します。

実行するための前提：user-permission:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

---

**RT-177**

件名：GET /api/approval-routes/:id — ID が存在するとき 200 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：指定 ID の承認経路を正常取得できることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されており、承認経路リポジトリが対象を返します。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-178**

件名：GET /api/approval-routes/:id — 承認経路が存在しないとき 404 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：存在しない ID 指定時に 404 が返ることを確認します。

実行するための前提：承認経路リポジトリが null を返します。

テスト内容：ステータスコード 404 が返ることを検証します。

---

**RT-179**

件名：POST /api/approval-routes — user-permission:edit 権限ありで 201 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：user-permission:edit 権限を持つユーザーが承認経路を作成でき HTTP 201 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 201 が返ることを検証します。

---

**RT-180**

件名：PATCH /api/approval-routes/:id — user-permission:edit 権限ありで更新が成功する

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：user-permission:edit 権限を持つユーザーが承認経路を更新でき HTTP 200 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-181**

件名：DELETE /api/approval-routes/:id — user-permission:edit 権限ありで削除が成功する

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：user-permission:edit 権限を持つユーザーが承認経路を削除でき HTTP 200 が返ることを確認します。

実行するための前提：user-permission:edit 権限付き JWT トークンが設定されています。

テスト内容：ステータスコード 200 が返ることを検証します。

---

**RT-182**

件名：DELETE /api/approval-routes/:id — user-permission:edit 権限がない場合に 403 が返る

分類：ルートテスト（server/routes/approvalRoutes.test.js）

テスト意図：承認経路の削除が user-permission:edit 権限を必要とすることを確認します。

実行するための前提：user-permission:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

---


## サービステスト（ST）

---

**ST-001**

件名：getPermissionsForUserType — システム管理者は全権限を持つ

分類：サービステスト（server/services/authService.test.js）

テスト意図：システム管理者ロールに master:edit・user-permission:edit・approval:apply・approval:act・payment:edit の 5 権限すべてが付与されることを確認します。

実行するための前提：authService を直接インポートします。

テスト内容：'システム管理者' を引数に getPermissionsForUserType を呼び出し、5 権限がすべて含まれることを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-002**

件名：getPermissionsForUserType — 一般ユーザーは approval:apply のみ持つ

分類：サービステスト（server/services/authService.test.js）

テスト意図：一般ユーザーロールには approval:apply のみが付与されることを確認します。最小権限の原則に基づく権限割り当てを検証します。

実行するための前提：authService を直接インポートします。

テスト内容：'一般ユーザ' を引数に getPermissionsForUserType を呼び出し、approval:apply のみを含むことを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-003**

件名：authenticate — 有効な認証情報で認証が成功する

分類：サービステスト（server/services/authService.test.js）

テスト意図：正しいユーザー名とパスワードで authenticate を呼び出したとき認証が成功してユーザーオブジェクトが返ることを確認します。

実行するための前提：ユーザーリポジトリがモックユーザーを返し、bcrypt がパスワード比較を成功させます。

テスト内容：認証成功で id・name・userType を含むユーザーオブジェクトが返ることを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-004**

件名：authenticate — 認証結果に passwordHash が含まれない

分類：サービステスト（server/services/authService.test.js）

テスト意図：authenticate の返却値に passwordHash が含まれないことを確認します。機密情報の流出を防ぎます。

実行するための前提：ST-003 と同様のモック設定です。

テスト内容：返却オブジェクトに passwordHash プロパティが存在しないことを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-005**

件名：authenticate — 無効なパスワードで認証が失敗する

分類：サービステスト（server/services/authService.test.js）

テスト意図：誤ったパスワードで authenticate を呼び出したとき認証エラーが発生することを確認します。

実行するための前提：bcrypt がパスワード比較を失敗させます。

テスト内容：authenticate が認証失敗エラーをスローすることを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-006**

件名：authenticate — 5 回失敗後にアカウントがロックされる

分類：サービステスト（server/services/authService.test.js）

テスト意図：ログイン失敗が 5 回に達したときアカウントロック状態になることを確認します。ブルートフォース攻撃対策の実装を検証します。

実行するための前提：ユーザーリポジトリが failedLoginCount=5 のユーザーを返します。

テスト内容：認証試行が失敗しアカウントロックエラーが返ることを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-007**

件名：authenticate — ロック有効期限切れのユーザーは自動アンロックされる

分類：サービステスト（server/services/authService.test.js）

テスト意図：アカウントロックの有効期限（30 分）を過ぎた場合に自動でアンロックされ正しいパスワードで認証できることを確認します。

実行するための前提：ユーザーリポジトリが lockUntil が過去の値を持つユーザーを返します。

テスト内容：アンロック後に認証が成功することを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-008**

件名：authenticate — 認証成功時に failedLoginCount がリセットされる

分類：サービステスト（server/services/authService.test.js）

テスト意図：認証成功後にユーザーの failedLoginCount がリセット（0）されることを確認します。一時的な失敗カウントが次回認証に影響しないことを保証します。

実行するための前提：ユーザーリポジトリのモックが update メソッドを持ちます。

テスト内容：userRepository.update が failedLoginCount=0 で呼ばれることを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-009**

件名：authenticate — 無効化ユーザーは汎用エラーメッセージで拒否される

分類：サービステスト（server/services/authService.test.js）

テスト意図：無効化されたユーザーが認証を試みた場合、アカウント無効化の詳細を明かさない汎用エラーメッセージが返ることを確認します。

実行するための前提：ユーザーリポジトリが status='無効' のユーザーを返します。

テスト内容：汎用的なエラーメッセージで認証が失敗することを検証します。

パス・ファイル名：server/services/authService.test.js

---

**ST-010**

件名：listUsers — パスワードハッシュを含まないユーザー一覧が返る

分類：サービステスト（server/services/userService.test.js）

テスト意図：ユーザー一覧取得時にすべてのユーザーから passwordHash が除かれていることを確認します。

実行するための前提：ユーザーリポジトリが passwordHash を含むユーザーリストを返します。

テスト内容：返却リストの各ユーザーに passwordHash が含まれないことを検証します。

パス・ファイル名：server/services/userService.test.js

---

**ST-011**

件名：getUserById — 存在しない ID で 404 エラーが発生する

分類：サービステスト（server/services/userService.test.js）

テスト意図：存在しない ID でユーザー取得を試みた場合、statusCode=404 のエラーが発生することを確認します。

実行するための前提：ユーザーリポジトリが null を返します。

テスト内容：statusCode=404 のエラーがスローされることを検証します。

パス・ファイル名：server/services/userService.test.js

---

**ST-012**

件名：registerUser — パスワードがハッシュ化されて保存される

分類：サービステスト（server/services/userService.test.js）

テスト意図：ユーザー登録時にパスワードが bcrypt ハッシュとして保存されることを確認します。

実行するための前提：ユーザーリポジトリのモックと bcrypt が設定されています。

テスト内容：リポジトリ save に渡される passwordHash が平文パスワードと異なることを検証します。

パス・ファイル名：server/services/userService.test.js

---

**ST-013**

件名：registerUser — 登録結果に passwordHash が含まれない

分類：サービステスト（server/services/userService.test.js）

テスト意図：ユーザー登録の返却値に passwordHash が含まれないことを確認します。

実行するための前提：ユーザーリポジトリの save がモック済みです。

テスト内容：返却オブジェクトに passwordHash が存在しないことを検証します。

パス・ファイル名：server/services/userService.test.js

---

**ST-014**

件名：registerUser — 必須フィールド欠落で 400 エラーが発生する

分類：サービステスト（server/services/userService.test.js）

テスト意図：id・name・password などの必須フィールドが欠落した場合に statusCode=400 のエラーが発生することを確認します。

実行するための前提：必須フィールドを省いた入力を用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/userService.test.js

---

**ST-015**

件名：registerUser — パスワード複雑性要件を満たさない場合に 400 エラーが発生する

分類：サービステスト（server/services/userService.test.js）

テスト意図：パスワードポリシー（8 文字以上・大文字・小文字・数字を含む）を満たさないパスワードで 400 エラーが発生することを確認します。

実行するための前提：ポリシー違反のパスワードを含む入力を用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/userService.test.js

---

**ST-016**

件名：updateUser — パスワード変更時に新しいパスワードが再ハッシュされる

分類：サービステスト（server/services/userService.test.js）

テスト意図：ユーザー更新時にパスワードが変更された場合、新しいパスワードが再ハッシュされて保存されることを確認します。

実行するための前提：更新前のユーザーリポジトリとモック bcrypt が設定されています。

テスト内容：リポジトリ update に渡される passwordHash が新パスワードのハッシュであることを検証します。

パス・ファイル名：server/services/userService.test.js

---

**ST-017**

件名：validatePassword — 8 文字未満で「8 文字以上」エラーが発生する

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：パスワードが最小文字数（8 文字）を下回った場合に適切なエラーメッセージが返ることを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：7 文字以下のパスワードで「8 文字以上」のメッセージを含むエラーがスローされることを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

**ST-018**

件名：validatePassword — 大文字がない場合にエラーが発生する

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：大文字を含まないパスワードで「大文字」を要求するエラーが返ることを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：大文字のないパスワードでエラーがスローされることを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

**ST-019**

件名：validatePassword — 小文字がない場合にエラーが発生する

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：小文字を含まないパスワードでエラーが返ることを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：小文字のないパスワードでエラーがスローされることを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

**ST-020**

件名：validatePassword — 数字がない場合に「数字」エラーが発生する

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：数字を含まないパスワードで「数字」を要求するエラーが返ることを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：数字のないパスワードでエラーがスローされることを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

**ST-021**

件名：validatePassword — 有効なパスワードでエラーが発生しない

分類：サービステスト（server/services/passwordPolicy.test.js）

テスト意図：すべての要件を満たすパスワードでエラーが発生しないことを確認します。

実行するための前提：passwordPolicy モジュールを直接インポートします。

テスト内容：有効なパスワードで関数が例外をスローしないことを検証します。

パス・ファイル名：server/services/passwordPolicy.test.js

---

**ST-022**

件名：createRefreshToken — 文字列トークンが返り、リポジトリに保存され、ハッシュ化される

分類：サービステスト（server/services/refreshTokenService.test.js）

テスト意図：createRefreshToken が文字列トークンを返し、リポジトリに保存する際にハッシュ化されることを確認します。DB 漏洩時のトークン窃取を防ぎます。

実行するための前提：リフレッシュトークンリポジトリのモックが設定されています。

テスト内容：返却値が文字列型であること・リポジトリ save が呼ばれること・保存される tokenHash が返却トークンと異なることを検証します。

パス・ファイル名：server/services/refreshTokenService.test.js

---

**ST-023**

件名：createRefreshToken — expiresAt が未来の日時で保存される

分類：サービステスト（server/services/refreshTokenService.test.js）

テスト意図：生成されたリフレッシュトークンの有効期限が現在より未来であることを確認します。

実行するための前提：リフレッシュトークンリポジトリのモックが設定されています。

テスト内容：save に渡される expiresAt が現在時刻より未来であることを検証します。

パス・ファイル名：server/services/refreshTokenService.test.js

---

**ST-024**

件名：verifyAndRotate — リボーク済みトークンで全セッションをリボークしてエラーをスローする

分類：サービステスト（server/services/refreshTokenService.test.js）

テスト意図：すでにリボークされたリフレッシュトークンが使用された場合（窃盗検知）、全セッションをリボークしエラーをスローすることを確認します。

実行するための前提：リポジトリがリボーク済みのトークンレコードを返します。

テスト内容：revokeAllForUser が呼ばれ、エラーがスローされることを検証します。

パス・ファイル名：server/services/refreshTokenService.test.js

---

**ST-025**

件名：verifyAndRotate — 成功時に古いトークンがリボークされ新しい tokenId と userId が返る

分類：サービステスト（server/services/refreshTokenService.test.js）

テスト意図：正常なリフレッシュ操作で古いトークンが失効し新しいトークンが発行されることを確認します。

実行するための前提：リポジトリが有効なトークンレコードを返します。

テスト内容：古いトークンのリボークと新しい tokenId・userId の返却を検証します。

パス・ファイル名：server/services/refreshTokenService.test.js

---

**ST-026**

件名：notifyApprovalRequest — 承認者ごとに N-01 通知が保存される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：承認依頼通知（N-01）が承認者リスト全員に対して個別に作成されることを確認します。承認者が複数いる場合に全員に通知されることを保証します。

実行するための前提：通知リポジトリのモックが設定されています。

テスト内容：notificationRepository.save が承認者数分呼ばれ type='N-01'・recipientId・docCode が含まれることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

**ST-027**

件名：notifyApprovalRequest — 承認者リストが空の場合に通知が作成されない

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：承認者が設定されていない場合（空のリスト）に通知が作成されないことを確認します。

実行するための前提：承認者リストとして空配列を渡します。

テスト内容：notificationRepository.save が呼ばれないことを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

**ST-028**

件名：notifyApprovalComplete — 申請者に N-02 通知が保存される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：承認完了通知（N-02）がオリジナルの申請者 ID 宛に作成されることを確認します。

実行するための前提：通知リポジトリのモックが設定されています。

テスト内容：notificationRepository.save が type='N-02'・recipientId=申請者 ID で呼ばれることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

**ST-029**

件名：notifyRejection — 理由を含む N-03 通知が申請者に保存される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：却下通知（N-03）が申請者 ID 宛に作成され、メッセージに却下理由が含まれることを確認します。

実行するための前提：通知リポジトリのモックが設定されています。

テスト内容：notificationRepository.save の呼び出しで type='N-03'・message に reason が含まれることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

**ST-030**

件名：markAsRead — 通知の所有者でない場合に 404 エラーが発生する

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：自分以外の通知を既読にしようとした場合に 404 エラーが発生することを確認します。通知の所有権チェックを検証します。

実行するための前提：通知リポジトリが異なる recipientId を持つ通知を返します。

テスト内容：statusCode=404 のエラーがスローされることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

**ST-031**

件名：notifyStaleApprovals — 未処理の期限切れ承認に N-04 通知が送付される

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：staleDays を超えて承認依頼中のままのドキュメントがある場合に N-04（督促通知）が生成されることを確認します。

実行するための前提：staleDays=3 として submittedAt が閾値を過ぎたドキュメントをモックします。

テスト内容：N-04 通知が作成されることを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

**ST-032**

件名：notifyStaleApprovals — submittedAt が null のドキュメントはスキップされる

分類：サービステスト（server/services/notificationService.test.js）

テスト意図：submittedAt が設定されていないドキュメントは期限切れ判定から除外されることを確認します。

実行するための前提：submittedAt=null のドキュメントをモックします。

テスト内容：当該ドキュメントに対して N-04 通知が作成されないことを検証します。

パス・ファイル名：server/services/notificationService.test.js

---

**ST-033**

件名：getSettings — settingsRepository.findOne に委譲して設定を返す

分類：サービステスト（server/services/settingsService.test.js）

テスト意図：getSettings が settingsRepository.findOne に正しく委譲し設定オブジェクトを返すことを確認します。

実行するための前提：設定リポジトリのモックが設定されています。

テスト内容：settingsRepository.findOne が呼ばれ設定オブジェクトが返ることを検証します。

パス・ファイル名：server/services/settingsService.test.js

---

**ST-034**

件名：updateSettings — 全フィールドが settingsRepository.update に委譲される

分類：サービステスト（server/services/settingsService.test.js）

テスト意図：updateSettings が入力フィールドをすべて settingsRepository.update に渡すことを確認します。フィールドの取りこぼしを防ぎます。

実行するための前提：設定リポジトリのモックが設定されています。

テスト内容：settingsRepository.update が入力と同じフィールドで呼ばれることを検証します。

パス・ファイル名：server/services/settingsService.test.js

---

**ST-035**

件名：generateCode — QUO エンティティタイプで QUO-XXXXX 形式のコードが生成される

分類：サービステスト（server/services/sequenceService.test.js）

テスト意図：見積コードが QUO- プレフィックスと 5 桁ゼロパディングで生成されることを確認します。

実行するための前提：シーケンスカウンターリポジトリのモックが設定されています。

テスト内容：'quotation' タイプで nextVal=1 の場合に 'QUO-00001' が返ることを検証します。

パス・ファイル名：server/services/sequenceService.test.js

---

**ST-036**

件名：generateCode — 各エンティティタイプで正しいプレフィックスのコードが生成される

分類：サービステスト（server/services/sequenceService.test.js）

テスト意図：ORD・POD・INV・RCP・PMT・DLV 各エンティティタイプに対して正しいプレフィックスのコードが生成されることを確認します。

実行するための前提：シーケンスカウンターリポジトリのモックが設定されています。

テスト内容：各タイプに対応するプレフィックス（ORD-/POD-/INV-/RCP-/PMT-/DLV-）が付いたコードが返ることを検証します。

パス・ファイル名：server/services/sequenceService.test.js

---

**ST-037**

件名：generateCode — 未知のエンティティタイプでエラーがスローされる

分類：サービステスト（server/services/sequenceService.test.js）

テスト意図：登録されていないエンティティタイプを指定した場合にエラーがスローされることを確認します。

実行するための前提：存在しないエンティティタイプ文字列を用意します。

テスト内容：エラーがスローされることを検証します。

パス・ファイル名：server/services/sequenceService.test.js

---

**ST-038**

件名：listPendingApprovals — 5 種のドキュメントタイプを含む承認待ち一覧が返る

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：見積・受注・発注・請求・支払の 5 種すべての承認依頼中ドキュメントが一覧に含まれることを確認します。

実行するための前提：各ドキュメントタイプのリポジトリが承認依頼中のドキュメントを返します。

テスト内容：返却リストに 5 種すべてのドキュメントタイプが含まれることを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

**ST-039**

件名：listPendingApprovals — 承認依頼中でないドキュメントは除外される

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：承認依頼中以外のドキュメントが一覧から除外されることを確認します。

実行するための前提：混在したステータスのドキュメントをリポジトリがモックします。

テスト内容：返却リストに承認依頼中以外のドキュメントが含まれないことを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

**ST-040**

件名：approveDocument — QUO- プレフィックスで見積承認サービスに委譲される

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：approveDocument が QUO- プレフィックスから対象サービスを判定し見積承認処理に正しく委譲することを確認します。

実行するための前提：見積サービスの approveQuotation がモックされています。

テスト内容：approveQuotation が正しい引数で呼ばれることを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

**ST-041**

件名：approveDocument — 承認後に承認履歴が保存される

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：承認操作後に承認履歴（approvalHistoryRepository.save）が記録されることを確認します。承認の証跡管理を検証します。

実行するための前提：承認履歴リポジトリのモックが設定されています。

テスト内容：approvalHistoryRepository.save が承認情報で呼ばれることを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

**ST-042**

件名：rejectDocument — reason が欠落した場合に 400 エラーがスローされる

分類：サービステスト（server/services/approvalService.test.js）

テスト意図：却下操作に理由（reason）が必須であることを確認します。理由なしの却下を防ぎます。

実行するための前提：reason を省いた引数を用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/approvalService.test.js

---

**ST-043**

件名：registerQuotation — QUO-XXXXX コードが自動生成される

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：見積登録時にシーケンスサービスから QUO-XXXXX コードが自動生成されることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却見積のコードが 'QUO-' で始まることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

**ST-044**

件名：registerQuotation — タイトル欠落で 400 エラーが発生する

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：title フィールドが欠落した場合に statusCode=400 のエラーが発生することを確認します。

実行するための前提：title を省いた見積データを用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

**ST-045**

件名：submitQuotationApproval — 下書き状態から承認依頼中への遷移が成功し submittedBy が保存される

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：下書き状態の見積が承認申請により「承認依頼中」に遷移し submittedBy が保存されることを確認します。

実行するための前提：リポジトリが下書き状態の見積を返します。

テスト内容：status='承認依頼中' と submittedBy がリポジトリに保存されることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

**ST-046**

件名：submitQuotationApproval — 下書き以外の状態から承認申請すると 400 エラーが発生する

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：下書き以外の状態からの承認申請が 400 エラーで拒否されることを確認します。不正なステータス遷移を防ぎます。

実行するための前提：リポジトリが非下書きステータスの見積を返します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

**ST-047**

件名：approveQuotation — 承認依頼中から承認済みへの遷移が成功する

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：承認依頼中の見積が承認操作により「承認済み」に遷移することを確認します。

実行するための前提：リポジトリが承認依頼中の見積を返します。

テスト内容：status='承認済み' が保存されることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

**ST-048**

件名：rejectQuotation — 承認依頼中から却下への遷移が成功し理由が保存される

分類：サービステスト（server/services/quotationService.test.js）

テスト意図：承認依頼中の見積が却下操作により「却下」に遷移し理由が保存されることを確認します。

実行するための前提：リポジトリが承認依頼中の見積を返します。

テスト内容：status='却下' と reason が保存されることを検証します。

パス・ファイル名：server/services/quotationService.test.js

---

**ST-049**

件名：registerInvoice — BL-02: 税額は各明細ではなく小計合計に対して計算される

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：請求書の税額計算がビジネスルール BL-02 に従い、小計合計に対して計算されることを確認します。各明細に個別計算した場合と比べた丸め誤差の防止が目的です。

実行するための前提：単価 315 円の明細を含む請求データを用意します。

テスト内容：taxAmount が subtotal × 税率で計算されていることを検証します（315 × 0.1 → 31）。

パス・ファイル名：server/services/invoiceService.test.js

---

**ST-050**

件名：registerInvoice — 複数受注の請求書で明細がマージされる

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：複数の受注から請求書を作成した場合に各受注の明細が統合されることを確認します。

実行するための前提：複数の受注データをモックします。

テスト内容：請求書の details に全受注の明細が含まれることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

**ST-051**

件名：registerInvoice — トランザクション失敗時にロールバックされる

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：請求書登録処理の途中でエラーが発生した場合、トランザクションがロールバックされることを確認します。

実行するための前提：リポジトリの一部でエラーをスローするモックを設定します。

テスト内容：トランザクションロールバックが実行されることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

**ST-052**

件名：approveInvoice — 承認時に監査ログ INVOICE_APPROVE が記録される

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：請求書の承認操作に対して INVOICE_APPROVE アクションの監査ログが記録されることを確認します。コンプライアンス要件のトレーサビリティを検証します。

実行するための前提：監査ログリポジトリのモックが設定されています。

テスト内容：auditLogRepository.save が action='INVOICE_APPROVE' で呼ばれることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

**ST-053**

件名：listInvoiceCandidates — 締め日「末日」の場合に月末までの受注が対象になる

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：closingDay が「末日」の顧客の場合、その月の月末までに承認済みになった受注が請求候補として返ることを確認します。

実行するための前提：受注リポジトリが承認済み受注をモックします。

テスト内容：月末の期間内の承認済み受注が返ることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

**ST-054**

件名：listInvoiceCandidates — 締め日「15 日」の場合に翌月 15 日までの受注が対象になる

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：closingDay が「15 日」の顧客の場合、翌月 15 日を含む期間の受注が候補として返ることを確認します。

実行するための前提：受注リポジトリが承認済み受注をモックします。

テスト内容：翌月 15 日を含む期間の承認済み受注が返ることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

**ST-055**

件名：getMonthlySummary — プロジェクト別の売上・原価・利益が集計される

分類：サービステスト（server/services/invoiceService.test.js）

テスト意図：月次サマリーがプロジェクト別に売上・原価・利益を正しく集計して返すことを確認します。

実行するための前提：複数の請求データをモックします。

テスト内容：各プロジェクトの sales・cost・profit が正しい値であることを検証します。

パス・ファイル名：server/services/invoiceService.test.js

---

**ST-056**

件名：registerPayment — PMT-XXXXX コードが自動生成される

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：支払登録時に PMT-XXXXX 形式のコードが自動生成されることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却支払オブジェクトのコードが 'PMT-' で始まることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

**ST-057**

件名：approvePayment — 承認依頼中から承認済みへの遷移が成功する

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：承認依頼中の支払が承認操作により「承認済み」に遷移することを確認します。

実行するための前提：リポジトリが承認依頼中の支払を返します。

テスト内容：status='承認済み' が保存されることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

**ST-058**

件名：approvePayment — 承認依頼中以外のステータスで 400 エラーが発生する

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：承認依頼中以外の支払を承認しようとした場合に 400 エラーが発生することを確認します。

実行するための前提：リポジトリが承認依頼中以外のステータスの支払を返します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

**ST-059**

件名：cancelPayment — 承認済みの支払はキャンセルできない（400 エラー）

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：承認済みの支払をキャンセルしようとした場合に 400 エラーが発生することを確認します。承認後のキャンセル禁止ルールを検証します。

実行するための前提：リポジトリが承認済みステータスの支払を返します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

**ST-060**

件名：registerPaymentResult — 承認済みから支払済みへの遷移が成功する

分類：サービステスト（server/services/paymentService.test.js）

テスト意図：承認済みの支払に実績を登録することでステータスが「支払済み」に遷移することを確認します。

実行するための前提：リポジトリが承認済みの支払を返します。

テスト内容：status='支払済み' が保存されることを検証します。

パス・ファイル名：server/services/paymentService.test.js

---

**ST-061**

件名：registerReceipt — RCP-XXXXX コードが生成され初期ステータスが「未消込」になる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：入金登録時に RCP-XXXXX コードが自動生成され初期ステータスが「未消込」になることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却入金のコードが 'RCP-' で始まり status='未消込' であることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

**ST-062**

件名：registerReceipt — 入金額が請求合計と一致する場合に請求が消込済みになる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：入金額が請求合計と完全一致する場合、請求書が「消込済み」に更新されることを確認します。

実行するための前提：請求リポジトリが total=5500 の請求を返し入金額も 5500 で設定します。

テスト内容：invoiceRepository.update が status='消込済み' で呼ばれることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

**ST-063**

件名：registerReceipt — 入金額が請求合計より少ない場合に一部消込になる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：入金額が請求合計に満たない場合、請求書が「一部消込」に更新されることを確認します。

実行するための前提：請求合計より少ない入金額を設定します。

テスト内容：invoiceRepository.update が status='一部消込' で呼ばれることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

**ST-064**

件名：registerReceipt — 手数料が入金純額から差し引かれる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：振込手数料（fee）が差し引かれた純額で消込が行われることを確認します。

実行するための前提：fee を含む入金データを用意します。

テスト内容：純額（amount - fee）が消込に使用されることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

**ST-065**

件名：registerReceipt — トランザクション失敗時にロールバックされる

分類：サービステスト（server/services/receiptService.test.js）

テスト意図：入金登録後の請求書更新でエラーが発生した場合、トランザクションがロールバックされることを確認します。

実行するための前提：invoiceRepository.update でエラーをスローするモックを設定します。

テスト内容：トランザクションロールバックが実行されることを検証します。

パス・ファイル名：server/services/receiptService.test.js

---

**ST-066**

件名：registerOrder — 承認済み見積からのみ受注登録できる

分類：サービステスト（server/services/orderService.test.js）

テスト意図：承認済み以外の見積から受注を作成しようとした場合に 400 エラーが発生することを確認します。承認フローが完了した見積のみが受注化できることを保証します。

実行するための前提：非承認済みの見積をリポジトリがモックします。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

**ST-067**

件名：registerOrder — 見積のフィールドが受注にコピーされ ORD-XXXXX コードが生成される

分類：サービステスト（server/services/orderService.test.js）

テスト意図：受注登録時に見積の明細・金額が受注にコピーされ ORD-XXXXX コードが生成されることを確認します。

実行するための前提：承認済み見積のモックデータとシーケンスサービスが設定されています。

テスト内容：受注オブジェクトに見積の項目がコピーされ コードが 'ORD-' で始まることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

**ST-068**

件名：submitOrderApproval — BL-04: 添付ファイルがない場合に 400 エラーが発生する

分類：サービステスト（server/services/orderService.test.js）

テスト意図：受注の承認申請においてビジネスルール BL-04 に従い、添付ファイルが存在しない場合に 400 エラーが発生することを確認します。受注承認には契約書類の添付が必須です。

実行するための前提：attachments が空配列の受注をリポジトリがモックします。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

**ST-069**

件名：submitOrderApproval — BL-04: 受注金額が見積合計と不一致の場合に 400 エラーが発生する

分類：サービステスト（server/services/orderService.test.js）

テスト意図：受注の承認申請においてビジネスルール BL-04 に従い、受注金額が元の見積合計と不一致の場合に 400 エラーが発生することを確認します。

実行するための前提：受注 total と見積 total が異なる値のモックを設定します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

**ST-070**

件名：approveOrder — 承認依頼中から承認済みへの遷移が成功する

分類：サービステスト（server/services/orderService.test.js）

テスト意図：承認依頼中の受注が承認操作により「承認済み」に遷移することを確認します。

実行するための前提：リポジトリが承認依頼中の受注を返します。

テスト内容：status='承認済み' が保存されることを検証します。

パス・ファイル名：server/services/orderService.test.js

---

**ST-071**

件名：submitPurchaseOrderApproval — 下書きから承認依頼中への遷移が成功する

分類：サービステスト（server/services/purchaseOrderService.test.js）

テスト意図：下書き状態の発注が承認申請により「承認依頼中」に遷移することを確認します。

実行するための前提：リポジトリが下書き状態の発注を返します。

テスト内容：status='承認依頼中' が保存されることを検証します。

パス・ファイル名：server/services/purchaseOrderService.test.js

---

**ST-072**

件名：approvePurchaseOrder — 承認依頼中から承認済みへの遷移が成功する

分類：サービステスト（server/services/purchaseOrderService.test.js）

テスト意図：承認依頼中の発注が承認操作により「承認済み」に遷移することを確認します。

実行するための前提：リポジトリが承認依頼中の発注を返します。

テスト内容：status='承認済み' が保存されることを検証します。

パス・ファイル名：server/services/purchaseOrderService.test.js

---

**ST-073**

件名：registerCustomer — CUS-NNN コードが既存コードから採番され closingDay 等が保存される

分類：サービステスト（server/services/customerService.test.js）

テスト意図：顧客コードが既存最大値から採番され、closingDay・paymentSite・billingTo が欠落せずに保存されることを確認します。

実行するための前提：顧客リポジトリが既存コードリストを返すようモックします。

テスト内容：返却顧客のコードが正しい採番値であり save に closingDay 等が渡されることを検証します。

パス・ファイル名：server/services/customerService.test.js

---

**ST-074**

件名：registerCustomer — 顧客名欠落で 400 エラーが発生する

分類：サービステスト（server/services/customerService.test.js）

テスト意図：name フィールドが欠落した場合に statusCode=400 のエラーが発生することを確認します。

実行するための前提：name を省いた顧客データを用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/customerService.test.js

---

**ST-075**

件名：registerProduct — PRD-NNN コードが既存コードから採番される

分類：サービステスト（server/services/productService.test.js）

テスト意図：商品コードが既存コード最大値から採番されることを確認します。

実行するための前提：商品リポジトリが既存コードリストを返すようモックします。

テスト内容：返却商品のコードが 'PRD-' で始まる正しい採番値であることを検証します。

パス・ファイル名：server/services/productService.test.js

---

**ST-076**

件名：registerSupplier — SUP-NNN コードが既存コードから採番される

分類：サービステスト（server/services/supplierService.test.js）

テスト意図：仕入先コードが既存コード最大値から採番されることを確認します。

実行するための前提：仕入先リポジトリが既存コードリストを返すようモックします。

テスト内容：返却仕入先のコードが 'SUP-' で始まる正しい採番値であることを検証します。

パス・ファイル名：server/services/supplierService.test.js

---

**ST-077**

件名：registerDelivery — DLV-XXXXX コードが生成され初期ステータスが「検収待ち」になる

分類：サービステスト（server/services/deliveryService.test.js）

テスト意図：納品登録時に DLV-XXXXX コードが自動生成され初期ステータスが「検収待ち」になることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却納品のコードが 'DLV-' で始まり status='検収待ち' であることを検証します。

パス・ファイル名：server/services/deliveryService.test.js

---

**ST-078**

件名：registerProject — PJ-NNNNN コードが自動生成される

分類：サービステスト（server/services/projectService.test.js）

テスト意図：プロジェクト登録時に PJ-NNNNN コードが自動生成されることを確認します。

実行するための前提：シーケンスサービスとリポジトリのモックが設定されています。

テスト内容：返却プロジェクトのコードが 'PJ-' で始まることを検証します。

パス・ファイル名：server/services/projectService.test.js

---

**ST-079**

件名：registerProject — プロジェクト名欠落で 400 エラーが発生する

分類：サービステスト（server/services/projectService.test.js）

テスト意図：name フィールドが欠落した場合に statusCode=400 のエラーが発生することを確認します。

実行するための前提：name を省いたプロジェクトデータを用意します。

テスト内容：statusCode=400 のエラーがスローされることを検証します。

パス・ファイル名：server/services/projectService.test.js

---

**ST-080**

件名：getPermissionsForUserType — undefined の userType で空配列が返る

分類：サービステスト（server/services/permissionService.test.js）

テスト意図：userType が未設定の場合に空の権限配列が返ることを確認します。未知のロールに権限を付与しないことを保証します。

実行するための前提：permissionService を直接インポートします。

テスト内容：undefined を引数として空配列が返ることを検証します。

パス・ファイル名：server/services/permissionService.test.js

---

## プラグインテスト（PT）

---

**PT-001**

件名：requirePermission — master:edit 権限がない場合に 403 が返る（顧客登録）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：POST /api/customers に master:edit 権限なしでアクセスした場合に 403 が返ることを確認します。マスタ登録の認可制御を検証します。

実行するための前提：master:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

**PT-002**

件名：requirePermission — master:edit 権限ありの場合は通過する

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：master:edit 権限を持つユーザーがマスタ登録エンドポイントにアクセスできることを確認します。

実行するための前提：master:edit を含む JWT トークンが設定されています。

テスト内容：ステータスコードが 403 以外であることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

**PT-003**

件名：requirePermission — user-permission:edit 権限がない場合に 403 が返る（ユーザー管理）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：/api/users に user-permission:edit 権限なしでアクセスした場合に 403 が返ることを確認します。

実行するための前提：user-permission:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

**PT-004**

件名：requirePermission — approval:apply 権限がない場合に 403 が返る（承認申請）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：submit-approval エンドポイントに approval:apply 権限なしでアクセスした場合に 403 が返ることを確認します。

実行するための前提：approval:apply を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

**PT-005**

件名：requirePermission — approval:act 権限がない場合に 403 が返る（承認・却下操作）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：approve/reject エンドポイントに approval:act 権限なしでアクセスした場合に 403 が返ることを確認します。

実行するための前提：approval:act を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

**PT-006**

件名：requirePermission — payment:edit 権限がない場合に 403 が返る（支払実績登録）

分類：プラグインテスト（server/plugins/authorization.test.js）

テスト意図：支払実績登録エンドポイントに payment:edit 権限なしでアクセスした場合に 403 が返ることを確認します。

実行するための前提：payment:edit を持たない JWT トークンが設定されています。

テスト内容：ステータスコード 403 が返ることを検証します。

パス・ファイル名：server/plugins/authorization.test.js

---

**PT-007**

件名：auditLog — POST 成功時に CREATE アクションが記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：POST リクエストが成功した場合に CREATE アクションの監査ログが記録されることを確認します。データ作成操作の証跡を担保します。

実行するための前提：監査ログリポジトリのモックが設定されています。

テスト内容：auditLogRepository.save が action='CREATE' で呼ばれることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

**PT-008**

件名：auditLog — x-entity-id ヘッダーからエンティティ ID が記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：監査ログに x-entity-id ヘッダーの値が entityId として記録されることを確認します。どのレコードへの操作かを特定できることを保証します。

実行するための前提：x-entity-id ヘッダーを含むリクエストを設定します。

テスト内容：auditLogRepository.save の entityId がヘッダー値と一致することを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

**PT-009**

件名：auditLog — 4xx エラー時に FAILURE 結果が記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：リクエストが 4xx エラーで失敗した場合に FAILURE 結果の監査ログが記録されることを確認します。

実行するための前提：4xx レスポンスを返すルートハンドラーがモックされています。

テスト内容：監査ログの result が 'FAILURE' であることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

**PT-010**

件名：auditLog — GET リクエストには監査ログが記録されない

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：参照系の GET リクエストに対して監査ログが記録されないことを確認します。参照操作を監査対象から除外します。

実行するための前提：監査ログリポジトリのモックが設定されています。

テスト内容：GET リクエスト後に auditLogRepository.save が呼ばれないことを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

**PT-011**

件名：auditLog — ログインアクションが LOGIN として記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：ログインエンドポイントの監査ログが action='LOGIN' で記録されることを確認します。

実行するための前提：config.action='LOGIN' で監査ログプラグインが設定されています。

テスト内容：監査ログの action が 'LOGIN' であることを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

**PT-012**

件名：auditLog — JWT からユーザー ID とユーザー名が記録される

分類：プラグインテスト（server/plugins/auditLog.test.js）

テスト意図：監査ログに JWT から取得したユーザー ID とユーザー名が記録されることを確認します。誰が操作したかのトレーサビリティを保証します。

実行するための前提：有効な JWT トークンが設定されています。

テスト内容：監査ログの userId と userName が JWT の値と一致することを検証します。

パス・ファイル名：server/plugins/auditLog.test.js

---

**PT-013**

件名：security — X-Content-Type-Options: nosniff ヘッダーが設定される

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：X-Content-Type-Options: nosniff が設定されることを確認します。MIME スニッフィング攻撃を防ぎます。

実行するための前提：セキュリティプラグイン（fastify/helmet）が設定済みです。

テスト内容：レスポンスに X-Content-Type-Options: nosniff ヘッダーが含まれることを検証します。

パス・ファイル名：server/plugins/security.test.js

---

**PT-014**

件名：security — X-Frame-Options ヘッダーが設定される

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：クリックジャッキング対策として X-Frame-Options ヘッダーが設定されることを確認します。

実行するための前提：セキュリティプラグインが設定済みです。

テスト内容：レスポンスに X-Frame-Options ヘッダーが含まれることを検証します。

パス・ファイル名：server/plugins/security.test.js

---

**PT-015**

件名：security — CSP ヘッダーが設定され default-src が 'self' である

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：CSP ヘッダーが設定され default-src が 'self' に設定されることを確認します。XSS などのコンテンツインジェクション攻撃を緩和します。

実行するための前提：セキュリティプラグインが設定済みです。

テスト内容：Content-Security-Policy ヘッダーに default-src 'self' が含まれることを検証します。

パス・ファイル名：server/plugins/security.test.js

---

**PT-016**

件名：security — CORS: 許可オリジンからのリクエストが通過し、未許可オリジンが拒否される

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：CORS 設定で許可されたオリジンのリクエストが通過し、未許可オリジンのリクエストが拒否されることを確認します。

実行するための前提：許可オリジンが設定済みです。

テスト内容：許可オリジンへの Access-Control-Allow-Origin 設定と未許可オリジンの拒否を検証します。

パス・ファイル名：server/plugins/security.test.js

---

**PT-017**

件名：security — レートリミット: 閾値以内は通過し、超過で 429 が返る

分類：プラグインテスト（server/plugins/security.test.js）

テスト意図：レートリミットの許容範囲内のリクエストが正常に処理され、超過したリクエストに 429 が返ることを確認します。

実行するための前提：レートリミットプラグインが設定済みです。

テスト内容：許容回数以内は 200、超過時に 429 が返ることを検証します。

パス・ファイル名：server/plugins/security.test.js

---

**PT-018**

件名：csrf — 未許可オリジンからの POST で 403 とエラーメッセージが返る

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：未許可オリジンからの POST が 403 で拒否され「CSRF: リクエスト元が許可されていません」メッセージが返ることを確認します。

実行するための前提：CSRF 保護プラグインと許可オリジンが設定済みです。

テスト内容：未許可オリジンからの POST でステータス 403 と期待メッセージが返ることを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

**PT-019**

件名：csrf — 許可オリジンからの POST は通過する

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：許可されたオリジンからの POST が CSRF チェックを通過することを確認します。

実行するための前提：許可オリジンを含む Origin ヘッダーが設定されています。

テスト内容：許可オリジンからの POST が 403 以外で返ることを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

**PT-020**

件名：csrf — Origin ヘッダーなしのリクエストは CSRF チェックをスキップする

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：Origin ヘッダーがないリクエスト（サーバー間通信など）が CSRF でブロックされないことを確認します。

実行するための前提：Origin ヘッダーを含まないリクエストを用意します。

テスト内容：Origin なしの POST が 403 で返らないことを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

**PT-021**

件名：csrf — GET リクエストは CSRF チェックされない

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：GET リクエストは CSRF 保護の対象外であることを確認します。

実行するための前提：未許可オリジンからの GET リクエストを用意します。

テスト内容：GET リクエストが 403 で返らないことを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

**PT-022**

件名：csrf — PUT/PATCH/DELETE も未許可オリジンで 403 が返る

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：CSRF 保護が PUT・PATCH・DELETE にも適用されることを確認します。

実行するための前提：未許可オリジンからの各メソッドリクエストを用意します。

テスト内容：これらのメソッドで 403 が返ることを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

**PT-023**

件名：csrf — allowedOrigins が未設定の場合は CSRF チェックが無効になる

分類：プラグインテスト（server/plugins/csrf.test.js）

テスト意図：allowedOrigins が未設定（開発環境など）の場合は CSRF チェックが動作しないことを確認します。

実行するための前提：allowedOrigins なしで CSRF プラグインを設定します。

テスト内容：未許可オリジンからの POST が 403 で返らないことを検証します。

パス・ファイル名：server/plugins/csrf.test.js

---

**PT-024**

件名：slowQuery — 閾値を超えたレスポンス時間で log.warn が発生する

分類：プラグインテスト（server/plugins/slowQuery.test.js）

テスト意図：レスポンス時間が設定閾値を超えた場合に log.warn が記録されることを確認します。パフォーマンス劣化の早期検知を担保します。

実行するための前提：threshold=0 に設定しすべてのリクエストがスロークエリ判定されるようにします。

テスト内容：log.warn が呼ばれることを検証します。

パス・ファイル名：server/plugins/slowQuery.test.js

---

**PT-025**

件名：slowQuery — 閾値未満のレスポンス時間では log.warn が発生しない

分類：プラグインテスト（server/plugins/slowQuery.test.js）

テスト意図：レスポンス時間が閾値未満の場合に不要な警告ログが出ないことを確認します。

実行するための前提：threshold=Infinity に設定します。

テスト内容：log.warn が呼ばれないことを検証します。

パス・ファイル名：server/plugins/slowQuery.test.js

---

**PT-026**

件名：slowQuery — 警告ログにメソッド・URL・レスポンス時間が含まれる

分類：プラグインテスト（server/plugins/slowQuery.test.js）

テスト意図：スロークエリ警告ログに method・url・responseTime が含まれ問題特定に十分な情報が提供されることを確認します。

実行するための前提：threshold=0 に設定します。

テスト内容：log.warn の引数に method・url・responseTime が含まれることを検証します。

パス・ファイル名：server/plugins/slowQuery.test.js

---

## インフラテスト（IT）

---

**IT-001**

件名：assertProductionSecrets — production 環境で JWT_SECRET 未設定の場合に process.exit(1) が呼ばれる

分類：インフラテスト（server/startupGuards.test.js）

テスト意図：本番環境で JWT_SECRET が未設定の場合にアプリの起動を中止することを確認します。デフォルト秘密鍵による脆弱性を防ぎます。

実行するための前提：NODE_ENV='production' かつ JWT_SECRET が未設定です。

テスト内容：process.exit(1) が呼ばれることを検証します。

パス・ファイル名：server/startupGuards.test.js

---

**IT-002**

件名：assertProductionSecrets — FATAL ログに JWT_SECRET が含まれる

分類：インフラテスト（server/startupGuards.test.js）

テスト意図：起動失敗時のログメッセージに JWT_SECRET が不足していることが示されることを確認します。オペレーターが原因を素早く特定できることを保証します。

実行するための前提：NODE_ENV='production' かつ JWT_SECRET が未設定です。

テスト内容：log.fatal が 'JWT_SECRET' を含むメッセージで呼ばれることを検証します。

パス・ファイル名：server/startupGuards.test.js

---

**IT-003**

件名：assertProductionSecrets — development/test 環境では process.exit が呼ばれない

分類：インフラテスト（server/startupGuards.test.js）

テスト意図：開発・テスト環境では JWT_SECRET 未設定でもアプリが起動できることを確認します。

実行するための前提：NODE_ENV='development' または 'test' に設定します。

テスト内容：process.exit が呼ばれないことを検証します。

パス・ファイル名：server/startupGuards.test.js

---

**IT-004**

件名：assertProductionSecrets — production 環境で JWT_SECRET が設定済みの場合は process.exit が呼ばれない

分類：インフラテスト（server/startupGuards.test.js）

テスト意図：本番環境で JWT_SECRET が正しく設定されている場合はアプリが正常起動することを確認します。

実行するための前提：NODE_ENV='production' かつ JWT_SECRET が設定済みです。

テスト内容：process.exit が呼ばれないことを検証します。

パス・ファイル名：server/startupGuards.test.js

---

**IT-005**

件名：withTransaction — db.transaction がある場合にトランザクション内でコールバックが実行される

分類：インフラテスト（server/db/transaction.test.js）

テスト意図：db.transaction メソッドが存在する場合、コールバックがトランザクションコンテキスト内で実行されることを確認します。

実行するための前提：db.transaction をモックします。

テスト内容：コールバックがトランザクションオブジェクト (tx) を受け取り実行されることを検証します。

パス・ファイル名：server/db/transaction.test.js

---

**IT-006**

件名：withTransaction — db.transaction がない場合に db 自体がコールバックに渡される

分類：インフラテスト（server/db/transaction.test.js）

テスト意図：トランザクション未対応の DB では db 自体がコールバックに渡されることを確認します。

実行するための前提：transaction メソッドを持たない db オブジェクトを設定します。

テスト内容：コールバックが db を受け取り実行されることを検証します。

パス・ファイル名：server/db/transaction.test.js

---

**IT-007**

件名：withTransaction — db が null の場合に null がコールバックに渡される

分類：インフラテスト（server/db/transaction.test.js）

テスト意図：DB が未接続（null）の場合でもコールバックが null を受け取り実行されることを確認します。

実行するための前提：db=null として設定します。

テスト内容：コールバックが null を受け取り実行されることを検証します。

パス・ファイル名：server/db/transaction.test.js

---

**IT-008**

件名：withTransaction — コールバックおよびロールバックのエラーが伝播する

分類：インフラテスト（server/db/transaction.test.js）

テスト意図：コールバック内またはロールバック処理でエラーが発生した場合に withTransaction がそのエラーを伝播させることを確認します。エラーが握りつぶされないことを保証します。

実行するための前提：エラーをスローするコールバック・ロールバック関数を用意します。

テスト内容：withTransaction が同じエラーをスローすることを検証します。

パス・ファイル名：server/db/transaction.test.js

---

**IT-009**

件名：buildPaginatedQuery — LIMIT/OFFSET が正しく生成され、デフォルトで page=1 limit=20 が適用される

分類：インフラテスト（server/db/paginate.test.js）

テスト意図：buildPaginatedQuery が page・limit から正しい LIMIT と OFFSET を生成し、省略時はデフォルト値（page=1, limit=20）が適用されることを確認します。

実行するための前提：page と limit のパラメーターを設定（または省略）します。

テスト内容：生成された LIMIT・OFFSET が期待値と一致することを検証します。

パス・ファイル名：server/db/paginate.test.js

---

**IT-010**

件名：paginateArray — data と meta が正しい形で返り、ページ超過時に data が空になる

分類：インフラテスト（server/db/paginate.test.js）

テスト意図：paginateArray が data と total・page・pageSize・totalPages を含む meta を返し、ページ超過時は data が空配列になることを確認します。

実行するための前提：配列データと page・pageSize パラメーターを用意します。

テスト内容：返却オブジェクトの data と meta の各フィールドを検証します。

パス・ファイル名：server/db/paginate.test.js

---

**IT-011**

件名：paginateArray — 空配列の場合に totalPages が 0 になる

分類：インフラテスト（server/db/paginate.test.js）

テスト意図：データが存在しない場合に totalPages=0 が返ることを確認します。ゼロ除算バグを防ぎます。

実行するための前提：空配列を入力します。

テスト内容：meta.totalPages が 0 であることを検証します。

パス・ファイル名：server/db/paginate.test.js

---

**IT-012**

件名：004_indexes.sql — BEGIN/COMMIT トランザクションと 8 つ以上のインデックスが含まれる

分類：インフラテスト（server/db/migrations/004_indexes.test.js）

テスト意図：インデックス作成マイグレーションがトランザクション内で実行され、必要な数のインデックスが定義されていることを確認します。

実行するための前提：004_indexes.sql ファイルを読み込みます。

テスト内容：BEGIN/COMMIT の存在と CREATE INDEX IF NOT EXISTS の件数が 8 以上であることを検証します。

パス・ファイル名：server/db/migrations/004_indexes.test.js

---

**IT-013**

件名：004_indexes.sql — 承認依頼中の見積に部分インデックスが定義されている

分類：インフラテスト（server/db/migrations/004_indexes.test.js）

テスト意図：承認依頼中の見積のみを対象とした部分インデックス（WHERE status='承認依頼中'）が定義されていることを確認します。承認ダッシュボードの性能を担保します。

実行するための前提：004_indexes.sql ファイルを読み込みます。

テスト内容：idx_quotations_approval_pending の定義と WHERE 句が含まれることを検証します。

パス・ファイル名：server/db/migrations/004_indexes.test.js

---

**IT-014**

件名：004_indexes.sql — 主要クエリパターンに対応した全インデックスが定義されている

分類：インフラテスト（server/db/migrations/004_indexes.test.js）

テスト意図：idx_quotations_status_date・idx_orders_status・idx_purchase_orders_status・idx_invoices_status_due・idx_payments_status・idx_invoices_customer・idx_payments_supplier の各インデックスが定義されていることを確認します。

実行するための前提：004_indexes.sql ファイルを読み込みます。

テスト内容：各インデックス名が SQL テキストに含まれることを検証します。

パス・ファイル名：server/db/migrations/004_indexes.test.js

---

**IT-015**

件名：staleApprovalJob — 期限切れの見積・受注・発注・請求に N-04 通知が生成される

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：staleDays（例：3 日）を超えて承認依頼中の 4 種ドキュメント（見積・受注・発注・請求）に対して N-04（承認督促）通知が生成されることを確認します。承認の放置を防ぐビジネスルールを検証します。

実行するための前提：staleDays=3・TODAY=2026-05-05 として、submittedAt=2026-04-01 の各ドキュメントをモックします。

テスト内容：各ドキュメントタイプに対して notifyStaleApprovals が呼ばれることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

**IT-016**

件名：staleApprovalJob — 承認依頼中でないドキュメントには通知が生成されない

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：承認依頼中以外のステータスのドキュメントには N-04 通知が生成されないことを確認します。

実行するための前提：承認依頼中以外のステータスのドキュメントをモックします。

テスト内容：notifyStaleApprovals が呼ばれないことを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

**IT-017**

件名：staleApprovalJob — まだ期限切れでないドキュメントには通知が生成されない

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：staleDays を超えていないドキュメントには N-04 通知が生成されないことを確認します。

実行するための前提：submittedAt が staleDays 以内のドキュメントをモックします。

テスト内容：notifyStaleApprovals が呼ばれないことを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

**IT-018**

件名：staleApprovalJob — 4 ドキュメントタイプ全体の件数が集計される

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：ジョブ実行結果として 4 種類全体の N-04 通知件数が集計されることを確認します。

実行するための前提：各タイプで期限切れドキュメントをモックします。

テスト内容：返却件数が 4 種の合計であることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

**IT-019**

件名：staleApprovalJob — staleDays=7 設定が尊重される

分類：インフラテスト（server/jobs/staleApprovalJob.test.js）

テスト意図：staleDays=7 の場合に 7 日を超えたドキュメントのみが通知対象になることを確認します。設定値の変更が正しく反映されることを保証します。

実行するための前提：staleDays=7 として 6 日経過と 8 日経過のドキュメントをモックします。

テスト内容：8 日経過のドキュメントのみ通知対象になることを検証します。

パス・ファイル名：server/jobs/staleApprovalJob.test.js

---

## リポジトリテスト（ReT）

---

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

### ReT-023: sessionRepository — 複数セッションが独立して管理される

- **分類**: リポジトリテスト
- **テスト意図**: 一方のセッションを revoke しても他方に影響しないことを確認する（セッション分離）。
- **実行するための前提**: jti-1（userId: u01）と jti-2（userId: u02）の 2 セッションを save した状態。
- **テスト内容**: `repo.revoke('jti-1')` 後、jti-1 の `revoked` が `true` であり、jti-2 の `revoked` が `false` であることを検証する。
- **パス・ファイル名**: `server/repositories/sessionRepository.test.js`

---

### ReT-024: sequenceCounterRepository.nextVal — 初回 insert で 1 を返す

- **分類**: リポジトリテスト
- **テスト意図**: 未登録の entityType に対して nextVal が 1 を返すことを確認する（採番初期値）。
- **実行するための前提**: makeMockDb(1) で returning が `[{ currentVal: 1 }]` を返すよう設定。
- **テスト内容**: `repo.nextVal('quotation')` の戻り値が `1` であることを検証する。
- **パス・ファイル名**: `server/repositories/sequenceCounterRepository.test.js`

---

### ReT-025: sequenceCounterRepository.nextVal — 既存レコードの増分値を返す

- **分類**: リポジトリテスト
- **テスト意図**: 既に登録済みの entityType に対して nextVal がインクリメント後の値を返すことを確認する。
- **実行するための前提**: makeMockDb(5) で returning が `[{ currentVal: 5 }]` を返すよう設定。
- **テスト内容**: `repo.nextVal('order')` の戻り値が `5` であることを検証する。
- **パス・ファイル名**: `server/repositories/sequenceCounterRepository.test.js`

---

### ReT-026: sequenceCounterRepository.nextVal — 正しい entityType と初期値で insert する

- **分類**: リポジトリテスト
- **テスト意図**: values に渡される引数が `{ entityType: <指定値>, currentVal: 1 }` であることを確認する。
- **実行するための前提**: makeMockDb(1) で mock 設定。
- **テスト内容**: `repo.nextVal('invoice')` 後に `db._mocks.values` が `{ entityType: 'invoice', currentVal: 1 }` で呼ばれたことを検証する。
- **パス・ファイル名**: `server/repositories/sequenceCounterRepository.test.js`

---

### ReT-027: sequenceCounterRepository.nextVal — onConflictDoUpdate で既存値をアトミックにインクリメントする

- **分類**: リポジトリテスト
- **テスト意図**: UPSERT の競合解決に onConflictDoUpdate が使用され、set に増分式が含まれることを確認する（同時実行安全性）。
- **実行するための前提**: makeMockDb(3) で mock 設定。
- **テスト内容**: `repo.nextVal('payment')` 後に `onConflictDoUpdate` が 1 回呼ばれ、引数に `target` と `set` プロパティが含まれることを検証する。
- **パス・ファイル名**: `server/repositories/sequenceCounterRepository.test.js`

---

### ReT-028: sequenceCounterRepository.nextVal — returning で新しい currentVal を取得する

- **分類**: リポジトリテスト
- **テスト意図**: UPSERT 後に returning が呼ばれて最新の currentVal を取得していることを確認する。
- **実行するための前提**: makeMockDb(7) で mock 設定。
- **テスト内容**: `repo.nextVal('delivery')` 後に `db._mocks.returning` が 1 回呼ばれたことを検証する。
- **パス・ファイル名**: `server/repositories/sequenceCounterRepository.test.js`

---

### ReT-029: notificationRepository.findByRecipientId — 指定ユーザーの通知一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByRecipientId が対象ユーザーの通知行を返すことを確認する。
- **実行するための前提**: `db.query.notifications.findMany` が `[sampleRow]` を返す mock。
- **テスト内容**: `repo.findByRecipientId('user01')` の戻り値が `[sampleRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-030: notificationRepository.findByRecipientId — where 句で recipientId をフィルタする

- **分類**: リポジトリテスト
- **テスト意図**: findByRecipientId が findMany に where 関数を渡してフィルタリングを行うことを確認する（全通知の誤返却を防ぐ）。
- **実行するための前提**: findMany が空配列を返す mock。
- **テスト内容**: `repo.findByRecipientId('user02')` 後に `findMany` が `{ where: expect.any(Function) }` を含む引数で呼ばれたことを検証する。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-031: notificationRepository.save — 通知を insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成された通知レコード（id 含む）を返すことを確認する。
- **実行するための前提**: `db.insert` の values/returning チェーンが `[sampleRow]` を返す mock。
- **テスト内容**: `repo.save(notification)` の戻り値の `id` が `'uuid-001'` であり、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-032: notificationRepository.markAsRead — isRead を true に更新して返す

- **分類**: リポジトリテスト
- **テスト意図**: markAsRead が指定通知 id の isRead を true に更新し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` の set/where/returning チェーンが `{ ...sampleRow, isRead: true }` を返す mock。
- **テスト内容**: `repo.markAsRead('uuid-001')` の戻り値の `isRead` が `true` であり、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-033: notificationRepository.markAllAsRead — 全通知の isRead を true に設定する

- **分類**: リポジトリテスト
- **テスト意図**: markAllAsRead が update の set 呼び出しに `{ isRead: true }` を渡すことを確認する。
- **実行するための前提**: `db.update` の set mock で呼び出し引数を検証可能に設定。
- **テスト内容**: `repo.markAllAsRead('user01')` 後に `setMock` が `{ isRead: true }` で呼ばれ、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-034: notificationRepository.markAllAsRead — recipientId でフィルタして一括更新する

- **分類**: リポジトリテスト
- **テスト意図**: markAllAsRead が where 句を使って対象ユーザーの通知のみを更新することを確認する（他ユーザーの通知を誤って既読化しないこと）。
- **実行するための前提**: set/where の mock 設定。
- **テスト内容**: `repo.markAllAsRead('user01')` 後に `whereMock` が 1 回呼ばれたことを検証する。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-035: notificationRepository.findById — id 一致時に通知を返す

- **分類**: リポジトリテスト
- **テスト意図**: findById が指定 id の通知オブジェクトを返すことを確認する。
- **実行するための前提**: `db.query.notifications.findFirst` が sampleRow を返す mock。
- **テスト内容**: `repo.findById('uuid-001')` の戻り値が sampleRow に等しく、findFirst が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-036: notificationRepository.findById — id 不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findById が存在しない id に対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返す mock。
- **テスト内容**: `repo.findById('no-such-id')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-037: notificationRepository.findById — findMany を使う実装向けフォールバック

- **分類**: リポジトリテスト
- **テスト意図**: findMany + findFirst が両方モックされていても正しく findFirst の結果を返すことを確認する（実装パターン混在への対応）。
- **実行するための前提**: `findMany` が `[sampleRow]`、`findFirst` が `undefined` を返す mock。
- **テスト内容**: `repo.findById('no-such-id')` の戻り値が `null` であることを検証する（前 case の再確認）。
- **パス・ファイル名**: `server/repositories/notificationRepository.test.js`

---

### ReT-038: auditLogRepository.save — 生成 id 付きで監査ログを保存する

- **分類**: リポジトリテスト
- **テスト意図**: save がエントリに一意の id を付与して保存し、全フィールドを含むレコードを返すことを確認する。
- **実行するための前提**: `createAuditLogRepository([])` で空ストアのリポジトリを生成（beforeEach）。
- **テスト内容**: `repo.save(entry)` の戻り値に `id` が定義されており、`action` が `'CREATE'`、`entityType` が `'quotation'`、`userId` が `'user-001'` であることを検証する。
- **パス・ファイル名**: `server/repositories/auditLogRepository.test.js`

---

### ReT-039: auditLogRepository.save — 複数エントリに異なる id を付与する

- **分類**: リポジトリテスト
- **テスト意図**: 連続して save された複数のエントリが異なる id を持つことを確認する（id 重複がないこと）。
- **実行するための前提**: 空ストアのリポジトリ。
- **テスト内容**: entry1 と entry2 を save した戻り値の id が互いに等しくないことを検証する。
- **パス・ファイル名**: `server/repositories/auditLogRepository.test.js`

---

### ReT-040: auditLogRepository.save — createdAt タイムスタンプを記録する

- **分類**: リポジトリテスト
- **テスト意図**: save が保存時刻を createdAt として Date オブジェクトで記録することを確認する（監査証跡の時刻精度）。
- **実行するための前提**: 空ストアのリポジトリ。
- **テスト内容**: `repo.save({ action: 'CREATE', result: 'SUCCESS' })` の戻り値の `createdAt` が `Date` のインスタンスであることを検証する。
- **パス・ファイル名**: `server/repositories/auditLogRepository.test.js`

---

### ReT-041: auditLogRepository.findAll — 全監査ログを返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が save されたすべてのエントリを返すことを確認する。
- **実行するための前提**: 2 件のエントリ（CREATE / UPDATE）を save した状態。
- **テスト内容**: `repo.findAll()` の戻り値の長さが 2 であることを検証する。
- **パス・ファイル名**: `server/repositories/auditLogRepository.test.js`

---

### ReT-042: auditLogRepository.findAll — ログが空のとき空配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll がエントリ 0 件のとき空配列を返すことを確認する（エラーにならないこと）。
- **実行するための前提**: 空ストアのリポジトリ（save 未実行）。
- **テスト内容**: `repo.findAll()` の戻り値の長さが 0 であることを検証する。
- **パス・ファイル名**: `server/repositories/auditLogRepository.test.js`

---

### ReT-043: approvalHistoryRepository.save — 承認履歴を insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成された承認履歴レコード（id 含む）を返すことを確認する。
- **実行するための前提**: `db.insert` の values/returning チェーンが `[sampleHistory]` を返す mock。createApprovalHistoryRepository(db) でリポジトリ生成。
- **テスト内容**: `repo.save(entry)` の戻り値の `id` が `'uuid-h01'` であり、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/approvalHistoryRepository.test.js`

---

### ReT-044: approvalHistoryRepository.findByDocument — documentType と documentId に一致する履歴を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByDocument が指定伝票種別・伝票番号の承認履歴を返すことを確認する。
- **実行するための前提**: `db.query.approvalHistory.findMany` が `[sampleHistory]` を返す mock。
- **テスト内容**: `repo.findByDocument('order', 'ORD-00001')` の戻り値が `[sampleHistory]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/approvalHistoryRepository.test.js`

---

### ReT-045: approvalRouteRepository.findAll — 全承認ルートを返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が approvalRoutes テーブルの全レコードを返すことを確認する。
- **実行するための前提**: `db.query.approvalRoutes.findMany` が `[routeRow]` を返す mock。createApprovalRouteRepository(db) でリポジトリ生成。
- **テスト内容**: `repo.findAll()` の戻り値が `[routeRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/approvalRouteRepository.test.js`

---

### ReT-046: approvalRouteRepository.findById — id 一致時にルートを返す

- **分類**: リポジトリテスト
- **テスト意図**: findById が指定 id の承認ルートオブジェクトを返すことを確認する。
- **実行するための前提**: `findFirst` が routeRow を返す mock。
- **テスト内容**: `repo.findById(1)` の戻り値が routeRow に等しいことを検証する。
- **パス・ファイル名**: `server/repositories/approvalRouteRepository.test.js`

---

### ReT-047: approvalRouteRepository.findById — id 不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findById が存在しない id に対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: `repo.findById(99)` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/approvalRouteRepository.test.js`

---

### ReT-048: approvalRouteRepository.save — 新規ルートを insert して返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたルートレコードを返すことを確認する。
- **実行するための前提**: `db.insert` の values/returning チェーンが `[routeRow]` を返す mock。
- **テスト内容**: `repo.save({ documentType: 'quotation', stepNumber: 1, approverUserId: 'user01' })` の戻り値が routeRow に等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/approvalRouteRepository.test.js`

---

### ReT-049: approvalRouteRepository.update — ルートを更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が set/where を適用し、更新後のルートレコードを返すことを確認する。
- **実行するための前提**: `db.update` の set/where/returning チェーンが `[routeRow]` を返す mock。
- **テスト内容**: `repo.update(1, { isActive: false })` の戻り値が routeRow に等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/approvalRouteRepository.test.js`

---

### ReT-050: approvalRouteRepository.remove — id でルートを削除する

- **分類**: リポジトリテスト
- **テスト意図**: remove が DELETE を実行することを確認する。
- **実行するための前提**: `db.delete` の where チェーン mock。
- **テスト内容**: `repo.remove(1)` 後に `db.delete` が 1 回呼ばれたことを検証する。
- **パス・ファイル名**: `server/repositories/approvalRouteRepository.test.js`

---

### ReT-051: settingsRepository.findOne — 初期状態なしのとき既定値を返す

- **分類**: リポジトリテスト
- **テスト意図**: createSettingsRepository() を引数なしで呼んだとき、fiscalEndMonth=3・approvalStaleDays=3 などのデフォルト値が返ることを確認する。
- **実行するための前提**: `createSettingsRepository()` でリポジトリ生成（初期状態引数なし）。
- **テスト内容**: `repo.findOne()` の戻り値の `fiscalEndMonth` が `3`、`approvalStaleDays` が `3` であることを検証する。
- **パス・ファイル名**: `server/repositories/settingsRepository.test.js`

---

### ReT-052: settingsRepository.findOne — 初期状態が与えられたとき既定値とマージして返す

- **分類**: リポジトリテスト
- **テスト意図**: 初期状態を渡したとき、その値で上書きしつつ未指定フィールドはデフォルト値が適用されることを確認する。
- **実行するための前提**: `createSettingsRepository({ name: 'カスタム会社', fiscalEndMonth: 12 })` で生成。
- **テスト内容**: `repo.findOne()` の戻り値の `name` が `'カスタム会社'`、`fiscalEndMonth` が `12` であることを検証する。
- **パス・ファイル名**: `server/repositories/settingsRepository.test.js`

---

### ReT-053: settingsRepository.update — 更新フィールドを既存設定とマージして返す

- **分類**: リポジトリテスト
- **テスト意図**: update が指定フィールドだけを上書きし、未変更フィールドは既存値を保持したマージ結果を返すことを確認する。
- **実行するための前提**: defaults で生成されたリポジトリ。
- **テスト内容**: `repo.update({ name: '新会社名' })` の戻り値の `name` が `'新会社名'`、`fiscalEndMonth` が `3` であることを検証する。
- **パス・ファイル名**: `server/repositories/settingsRepository.test.js`

---

### ReT-054: settingsRepository.update — 更新値が次回 findOne に反映される

- **分類**: リポジトリテスト
- **テスト意図**: update した値が永続化され、後続の findOne 呼び出しで取得できることを確認する。
- **実行するための前提**: defaults で生成されたリポジトリ。
- **テスト内容**: `repo.update({ approvalStaleDays: 7 })` 後に `repo.findOne()` を呼び、`approvalStaleDays` が `7` であることを検証する。
- **パス・ファイル名**: `server/repositories/settingsRepository.test.js`

---

### ReT-055: settingsRepository.update — 部分更新で他フィールドを上書きしない

- **分類**: リポジトリテスト
- **テスト意図**: update が指定外フィールドを変更しないことを確認する（誤上書き防止）。
- **実行するための前提**: defaults で生成されたリポジトリ。
- **テスト内容**: `repo.update({ fiscalEndMonth: 9 })` 後に `repo.findOne()` を呼び、`fiscalEndMonth` が `9`、`name` が `defaults.name`、`approvalStaleDays` が `defaults.approvalStaleDays` であることを検証する。
- **パス・ファイル名**: `server/repositories/settingsRepository.test.js`

---

### ReT-056: customerRepository.findAll — 全顧客一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が customers テーブルの全レコードを返すことを確認する。
- **実行するための前提**: `db.query.customers.findMany` が `[customerRow]` を返す mock。createCustomerRepository(db) でリポジトリ生成。
- **テスト内容**: `repo.findAll()` の戻り値が `[customerRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/customerRepository.test.js`

---

### ReT-057: customerRepository.findByCode — コード一致時に顧客を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在するコードに対して顧客オブジェクトを返すことを確認する。
- **実行するための前提**: `db.query.customers.findFirst` が customerRow を返す mock。
- **テスト内容**: `repo.findByCode('CUS-001')` の戻り値の `code` が `'CUS-001'` であることを検証する。
- **パス・ファイル名**: `server/repositories/customerRepository.test.js`

---

### ReT-058: customerRepository.findByCode — コード不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在しないコードに対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: `repo.findByCode('CUS-999')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/customerRepository.test.js`

---

### ReT-059: customerRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する（コード重複チェック等に使用）。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: `repo.findAllCodes()` の戻り値に `'CUS-001'` が含まれることを検証する。
- **パス・ファイル名**: `server/repositories/customerRepository.test.js`

---

### ReT-060: customerRepository.save — 顧客を insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたレコードを返すことを確認する。
- **実行するための前提**: `db.insert` の values/returning チェーンが `[customerRow]` を返す mock。
- **テスト内容**: `repo.save(customer)` の戻り値が customerRow に等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/customerRepository.test.js`

---

### ReT-061: customerRepository.update — 顧客を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` の set/where/returning チェーンが `[customerRow]` を返す mock。
- **テスト内容**: `repo.update('CUS-001', { name: '新社名' })` の戻り値が customerRow に等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/customerRepository.test.js`

---

### ReT-062: supplierRepository.findAll — 全仕入先一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が suppliers テーブルの全レコードを返すことを確認する。
- **実行するための前提**: `db.query.suppliers.findMany` が `[supplierRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[supplierRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/supplierRepository.test.js`

---

### ReT-063: supplierRepository.findByCode — コード一致時に仕入先を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在するコードに対して仕入先オブジェクトを返すことを確認する。
- **実行するための前提**: `findFirst` が supplierRow を返す mock。
- **テスト内容**: `repo.findByCode('SUP-001')` の戻り値の `code` が `'SUP-001'` であることを検証する。
- **パス・ファイル名**: `server/repositories/supplierRepository.test.js`

---

### ReT-064: supplierRepository.findByCode — コード不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在しないコードに対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: `repo.findByCode('SUP-999')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/supplierRepository.test.js`

---

### ReT-065: supplierRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: `repo.findAllCodes()` の戻り値に `'SUP-001'` が含まれることを検証する。
- **パス・ファイル名**: `server/repositories/supplierRepository.test.js`

---

### ReT-066: supplierRepository.save — 仕入先を insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたレコードを返すことを確認する。
- **実行するための前提**: `db.insert` の values/returning チェーンが `[supplierRow]` を返す mock。
- **テスト内容**: `repo.save(supplier)` の戻り値が supplierRow に等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/supplierRepository.test.js`

---

### ReT-067: supplierRepository.update — 仕入先を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[supplierRow]` を返す mock。
- **テスト内容**: `repo.update('SUP-001', { name: '新仕入先' })` の戻り値が supplierRow に等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/supplierRepository.test.js`

---

### ReT-068: productRepository.findAll — 全商品一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が products テーブルの全レコードを返すことを確認する。
- **実行するための前提**: `db.query.products.findMany` が `[productRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[productRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/productRepository.test.js`

---

### ReT-069: productRepository.findByCode — コード一致時に商品を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在するコードに対して商品オブジェクトを返すことを確認する。
- **実行するための前提**: `findFirst` が productRow を返す mock。
- **テスト内容**: `repo.findByCode('PRD-001')` の戻り値の `code` が `'PRD-001'` であることを検証する。
- **パス・ファイル名**: `server/repositories/productRepository.test.js`

---

### ReT-070: productRepository.findByCode — コード不一致時に null を返す（undefined→null 変換を含む）

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が `undefined` を返す Drizzle の挙動を null に変換することを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: `repo.findByCode('PRD-999')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/productRepository.test.js`

---

### ReT-071: productRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: `repo.findAllCodes()` の戻り値に `'PRD-001'` が含まれることを検証する。
- **パス・ファイル名**: `server/repositories/productRepository.test.js`

---

### ReT-072: productRepository.save — 商品を insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたレコードを返すことを確認する。
- **実行するための前提**: `db.insert` チェーンが `[productRow]` を返す mock。
- **テスト内容**: `repo.save(product)` の戻り値が productRow に等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/productRepository.test.js`

---

### ReT-073: productRepository.update — 商品を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[productRow]` を返す mock。
- **テスト内容**: `repo.update('PRD-001', { name: '新商品名' })` の戻り値が productRow に等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/productRepository.test.js`

---

### ReT-074: projectRepository.findAll — 全プロジェクト一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が projects テーブルの全レコードを返すことを確認する。
- **実行するための前提**: `db.query.projects.findMany` が `[projectRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[projectRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/projectRepository.test.js`

---

### ReT-075: projectRepository.findByCode — コード一致時にプロジェクトを返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在するコードに対してプロジェクトオブジェクトを返すことを確認する。
- **実行するための前提**: `findFirst` が projectRow を返す mock。
- **テスト内容**: `repo.findByCode('PJ-00001')` の戻り値の `code` が `'PJ-00001'` であることを検証する。
- **パス・ファイル名**: `server/repositories/projectRepository.test.js`

---

### ReT-076: projectRepository.findByCode — コード不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在しないコードに対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: `repo.findByCode('PJ-99999')` の戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/projectRepository.test.js`

---

### ReT-077: projectRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: `repo.findAllCodes()` の戻り値に `'PJ-00001'` が含まれることを検証する。
- **パス・ファイル名**: `server/repositories/projectRepository.test.js`

---

### ReT-078: projectRepository.save — プロジェクトを insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたレコードを返すことを確認する。
- **実行するための前提**: `db.insert` チェーンが `[projectRow]` を返す mock。
- **テスト内容**: `repo.save(project)` の戻り値が projectRow に等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/projectRepository.test.js`

---

### ReT-079: projectRepository.update — プロジェクトを更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[projectRow]` を返す mock。
- **テスト内容**: `repo.update('PJ-00001', { name: '新プロジェクト' })` の戻り値が projectRow に等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/projectRepository.test.js`

---

### ReT-080: purchaseOrderRepository.findAll — 全発注ヘッダー一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が purchaseOrders テーブルのヘッダー行一覧を返すことを確認する。
- **実行するための前提**: `db.query.purchaseOrders.findMany` が `[headerRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[headerRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/purchaseOrderRepository.test.js`

---

### ReT-081: purchaseOrderRepository.findByCode — コード一致時にヘッダーと明細を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が発注ヘッダーと明細配列を結合して返すことを確認する。
- **実行するための前提**: `findFirst` が headerRow を、`purchaseOrderDetails.findMany` が `[detailRow]` を返す mock。
- **テスト内容**: 戻り値の `code` が正しく、`details` が `[detailRow]` であることを検証する。
- **パス・ファイル名**: `server/repositories/purchaseOrderRepository.test.js`

---

### ReT-082: purchaseOrderRepository.findByCode — コード不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在しないコードに対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: 戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/purchaseOrderRepository.test.js`

---

### ReT-083: purchaseOrderRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: `repo.findAllCodes()` の戻り値に発注コードが含まれることを検証する。
- **パス・ファイル名**: `server/repositories/purchaseOrderRepository.test.js`

---

### ReT-084: purchaseOrderRepository.save — ヘッダーと明細を 2 回 insert して保存する

- **分類**: リポジトリテスト
- **テスト意図**: save がヘッダーと明細を別々に insert し（2 回呼び出し）、結合済みレコードを返すことを確認する。
- **実行するための前提**: `db.insert` を 2 回異なる戻り値で返す mock（mockReturnValueOnce）。
- **テスト内容**: 戻り値の `code` が正しく、`db.insert` が 2 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/purchaseOrderRepository.test.js`

---

### ReT-085: purchaseOrderRepository.update — 発注を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[headerRow]` を返す mock。
- **テスト内容**: 戻り値の `code` が正しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/purchaseOrderRepository.test.js`

---

### ReT-086: invoiceRepository.findAll — 全請求ヘッダー一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が invoices テーブルのヘッダー行一覧を返すことを確認する。
- **実行するための前提**: `db.query.invoices.findMany` が `[headerRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[headerRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/invoiceRepository.test.js`

---

### ReT-087: invoiceRepository.findByCode — コード一致時にヘッダーと明細を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が請求ヘッダーと明細配列を結合して返すことを確認する。
- **実行するための前提**: `findFirst` と `invoiceDetails.findMany` の mock 設定。
- **テスト内容**: 戻り値の `code` が正しく、`details` が含まれることを検証する。
- **パス・ファイル名**: `server/repositories/invoiceRepository.test.js`

---

### ReT-088: invoiceRepository.findByCode — コード不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在しないコードに対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: 戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/invoiceRepository.test.js`

---

### ReT-089: invoiceRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: 戻り値に請求コードが含まれることを検証する。
- **パス・ファイル名**: `server/repositories/invoiceRepository.test.js`

---

### ReT-090: invoiceRepository.save — ヘッダーと明細を 2 回 insert して保存する

- **分類**: リポジトリテスト
- **テスト意図**: save がヘッダーと明細を別々に insert し（2 回呼び出し）、結合済みレコードを返すことを確認する。
- **実行するための前提**: `db.insert` を 2 回異なる戻り値で返す mock。
- **テスト内容**: 戻り値の `code` が正しく、`db.insert` が 2 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/invoiceRepository.test.js`

---

### ReT-091: invoiceRepository.update — 請求を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[headerRow]` を返す mock。
- **テスト内容**: 戻り値の `code` が正しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/invoiceRepository.test.js`

---

### ReT-092: paymentRepository.findAll — 全支払一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が payments テーブルの全レコードを返すことを確認する。
- **実行するための前提**: `db.query.payments.findMany` が `[paymentRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[paymentRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/paymentRepository.test.js`

---

### ReT-093: paymentRepository.findByCode — コード一致時に支払を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在するコードに対して支払オブジェクトを返すことを確認する。
- **実行するための前提**: `findFirst` が paymentRow を返す mock。
- **テスト内容**: 戻り値の `code` が正しいことを検証する。
- **パス・ファイル名**: `server/repositories/paymentRepository.test.js`

---

### ReT-094: paymentRepository.findByCode — コード不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在しないコードに対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: 戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/paymentRepository.test.js`

---

### ReT-095: paymentRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: 戻り値に支払コードが含まれることを検証する。
- **パス・ファイル名**: `server/repositories/paymentRepository.test.js`

---

### ReT-096: paymentRepository.save — 支払を insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたレコードを返すことを確認する。
- **実行するための前提**: `db.insert` チェーンが `[paymentRow]` を返す mock。
- **テスト内容**: 戻り値が paymentRow に等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/paymentRepository.test.js`

---

### ReT-097: paymentRepository.update — 支払を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[paymentRow]` を返す mock。
- **テスト内容**: 戻り値が paymentRow に等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/paymentRepository.test.js`

---

### ReT-098: deliveryRepository.findAll — データありのとき納品一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が deliveries テーブルのレコードを返すことを確認する。
- **実行するための前提**: `db.query.deliveries.findMany` が `[deliveryRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[deliveryRow]` であることを検証する。
- **パス・ファイル名**: `server/repositories/deliveryRepository.test.js`

---

### ReT-099: deliveryRepository.findAll — データなしのとき空配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll がレコード 0 件のとき空配列を返すことを確認する（エラーにならないこと）。
- **実行するための前提**: `findMany` が `[]` を返すようオーバーライド。
- **テスト内容**: `repo.findAll()` の戻り値が空配列であることを検証する。
- **パス・ファイル名**: `server/repositories/deliveryRepository.test.js`

---

### ReT-100: deliveryRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: 戻り値に納品コードが含まれることを検証する。
- **パス・ファイル名**: `server/repositories/deliveryRepository.test.js`

---

### ReT-101: deliveryRepository.save — 納品を insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたレコードを返すことを確認する。
- **実行するための前提**: `db.insert` チェーンが `[deliveryRow]` を返す mock。
- **テスト内容**: 戻り値が deliveryRow に等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/deliveryRepository.test.js`

---

### ReT-102: deliveryRepository.update — 納品を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[deliveryRow]` を返す mock。
- **テスト内容**: 戻り値が deliveryRow に等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/deliveryRepository.test.js`

---

### ReT-103: orderRepository.findAll — 全受注ヘッダー一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が orders テーブルのヘッダー行一覧を返すことを確認する。
- **実行するための前提**: `db.query.orders.findMany` が `[headerRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[headerRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/orderRepository.test.js`

---

### ReT-104: orderRepository.findByCode — コード一致時にヘッダー・明細・添付ファイルを返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が受注ヘッダー・明細・添付ファイルを結合して返すことを確認する。
- **実行するための前提**: `findFirst`・`orderDetails.findMany`・`orderAttachments.findMany` の各 mock 設定。
- **テスト内容**: 戻り値に `code`・`details`・`attachments` が含まれることを検証する。
- **パス・ファイル名**: `server/repositories/orderRepository.test.js`

---

### ReT-105: orderRepository.findByCode — コード不一致時に null を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByCode が存在しないコードに対して null を返すことを確認する。
- **実行するための前提**: `findFirst` が `undefined` を返すようオーバーライド。
- **テスト内容**: 戻り値が `null` であることを検証する。
- **パス・ファイル名**: `server/repositories/orderRepository.test.js`

---

### ReT-106: orderRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: 戻り値に受注コードが含まれることを検証する。
- **パス・ファイル名**: `server/repositories/orderRepository.test.js`

---

### ReT-107: orderRepository.save — ヘッダーと明細を 2 回 insert して保存する

- **分類**: リポジトリテスト
- **テスト意図**: save がヘッダーと明細を別々に insert し（2 回呼び出し）、結合済みレコードを返すことを確認する（添付ファイルなし）。
- **実行するための前提**: `db.insert` を 2 回異なる戻り値で返す mock。
- **テスト内容**: 戻り値の `code` が正しく、`db.insert` が 2 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/orderRepository.test.js`

---

### ReT-108: orderRepository.save — 添付ファイルありのとき 3 回 insert する

- **分類**: リポジトリテスト
- **テスト意図**: save に attachments を含む受注を渡したとき、ヘッダー・明細・添付ファイルの 3 回 insert が実行されることを確認する。
- **実行するための前提**: `db.insert` を 3 回異なる戻り値で返す mock。attachments を含む受注オブジェクト。
- **テスト内容**: 戻り値の `code` が正しく、`db.insert` が 3 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/orderRepository.test.js`

---

### ReT-109: orderRepository.update — 受注を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[headerRow]` を返す mock。
- **テスト内容**: 戻り値の `code` が正しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/orderRepository.test.js`

---

### ReT-110: receiptRepository.findAll — 全入金消込一覧を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAll が receipts テーブルの全レコードを返すことを確認する。
- **実行するための前提**: `db.query.receipts.findMany` が `[receiptRow]` を返す mock。
- **テスト内容**: `repo.findAll()` の戻り値が `[receiptRow]` であり、findMany が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/receiptRepository.test.js`

---

### ReT-111: receiptRepository.findAllCodes — コード文字列の配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findAllCodes がコードのみの文字列配列を返すことを確認する。
- **実行するための前提**: デフォルト mock 設定。
- **テスト内容**: 戻り値に入金コードが含まれることを検証する。
- **パス・ファイル名**: `server/repositories/receiptRepository.test.js`

---

### ReT-112: receiptRepository.save — 入金消込を insert して保存済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: save が INSERT を実行し、生成されたレコードを返すことを確認する。
- **実行するための前提**: `db.insert` チェーンが `[receiptRow]` を返す mock。
- **テスト内容**: 戻り値が receiptRow に等しく、`db.insert` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/receiptRepository.test.js`

---

### ReT-113: receiptRepository.update — 入金消込を更新して更新済みレコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: update が SET を適用し、更新後のレコードを返すことを確認する。
- **実行するための前提**: `db.update` チェーンが `[receiptRow]` を返す mock。
- **テスト内容**: 戻り値が receiptRow に等しく、`db.update` が 1 回呼ばれることを検証する。
- **パス・ファイル名**: `server/repositories/receiptRepository.test.js`

---

### ReT-114: receiptRepository.findByInvoiceCode — 請求コードに一致する入金レコードを返す

- **分類**: リポジトリテスト
- **テスト意図**: findByInvoiceCode が指定請求コードの入金消込レコードを返すことを確認する（消込状態の照会）。
- **実行するための前提**: `db.query.receipts.findMany` が `[receiptRow]` を返す mock（where 句で invoiceCode フィルタ）。
- **テスト内容**: `repo.findByInvoiceCode('INV-00001')` の戻り値が `[receiptRow]` であることを検証する。
- **パス・ファイル名**: `server/repositories/receiptRepository.test.js`

---

### ReT-115: receiptRepository.findByInvoiceCode — 一致なしのとき空配列を返す

- **分類**: リポジトリテスト
- **テスト意図**: findByInvoiceCode が存在しない請求コードに対して空配列を返すことを確認する（消込なし判定）。
- **実行するための前提**: `findMany` が `[]` を返すようオーバーライド。
- **テスト内容**: `repo.findByInvoiceCode('INV-99999')` の戻り値が空配列であることを検証する。
- **パス・ファイル名**: `server/repositories/receiptRepository.test.js`
