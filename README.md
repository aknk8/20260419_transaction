# Transaction Management System

受発注・請求・入金を一元管理するフルスタック Web アプリケーションです。

PostgreSQL による完全永続化・JWT 認証・ロールベース認可・承認ワークフローを備え、Railway へのデプロイに対応しています。

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Vite 8 / Vanilla JS / CSS |
| バックエンド | Node.js / Fastify 5 |
| データベース | PostgreSQL 16 / Drizzle ORM |
| 認証 | JWT (@fastify/jwt) + bcrypt + httpOnly Cookie |
| テスト（ユニット/統合） | Vitest 4 |
| テスト（E2E） | Playwright 1.44 |
| インフラ | Docker / Docker Compose / Nginx |
| 本番デプロイ | Railway |

## ディレクトリ構成

```
.
├── src/                    # フロントエンドビジネスロジック（モデル・ユーティリティ）
├── server/
│   ├── index.js            # サーバーエントリーポイント（DI 設定）
│   ├── app.js              # Fastify アプリファクトリ
│   ├── db/                 # DB スキーマ・マイグレーション・シードデータ
│   │   ├── schema.js       # Drizzle ORM スキーマ定義
│   │   ├── client.js       # DB 接続クライアント
│   │   ├── migrate.js      # マイグレーション実行モジュール
│   │   ├── seedData.js     # 開発用初期データ
│   │   ├── seedProduction.js  # 本番初期データ（冪等）
│   │   ├── transaction.js  # トランザクション境界ヘルパー
│   │   ├── paginate.js     # ページネーション共通処理
│   │   └── migrations/     # SQL マイグレーションファイル（000〜004）
│   ├── repositories/       # データアクセス層
│   ├── services/           # ビジネスロジック層
│   ├── routes/             # REST API ルート定義
│   ├── plugins/            # Fastify プラグイン（認可・CSRF・監査ログ等）
│   └── jobs/               # バックグラウンドジョブ（node-cron）
├── e2e/                    # Playwright E2E テスト
├── docs/                   # 要件定義・ユーザーマニュアル等
├── infra/                  # Nginx 設定
├── scripts/
│   ├── migrate.js          # DB マイグレーション CLI ラッパー
│   ├── seed-production.js  # 本番 seed SQL 出力 CLI
│   ├── seed-staging.js     # ステージング seed
│   └── create-test-db.js   # 統合テスト用 DB 作成
├── app.js                  # フロントエンドエントリーポイント
├── index.html              # HTML テンプレート
├── vitest.config.js        # ユニット/統合テスト共通設定
├── vitest.integration.config.js  # 統合テスト専用設定
├── docker-compose.yml      # 開発用 DB 環境（ホスト側ポート 5433）
├── docker-compose.staging.yml    # ステージング環境（Nginx + TLS）
└── railway.toml            # Railway デプロイ設定
```

## 前提条件

- **Node.js** v20 以上
- **Docker** および **Docker Compose**（PostgreSQL 起動用）
- **npm** v10 以上

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd 20260419_transaction
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、必要に応じて値を編集します。

```bash
cp .env.example .env
```

開発環境では `.env.development` がデフォルト値として使用されます（リポジトリ管理下）。

| 変数名 | 説明 | デフォルト（開発） |
|--------|------|--------------------|
| `DATABASE_URL` | PostgreSQL 接続文字列 | `postgres://app_user:app_password@localhost:5433/transaction_db_dev` |
| `TEST_DATABASE_URL` | 統合テスト用 DB 接続文字列 | `postgres://app_user:app_password@localhost:5433/transaction_db_test` |
| `JWT_SECRET` | JWT 署名シークレット（本番は 64 文字以上のランダム文字列） | 開発用ダミー値 |
| `PORT` | API サーバーポート | `3000` |
| `NODE_ENV` | 実行環境 | `development` |
| `CORS_ORIGIN` | 許可するフロントエンドオリジン | `http://localhost:5173` |
| `RATE_LIMIT_MAX` | レートリミット（リクエスト数/分） | `1000` |
| `APPROVAL_STALE_DAYS` | 滞留承認アラート閾値（日数） | `3` |
| `LOG_LEVEL` | ログレベル（debug / info / warn / error） | `debug` |

> **注意**: Docker Compose はホスト側ポート **5433** にマッピングしています（ローカルの PostgreSQL との競合回避）。`DATABASE_URL` のポートを `5433` に設定してください。

### 4. データベースの起動

Docker Compose で PostgreSQL を起動します。

```bash
docker compose up -d db
```

### 5. マイグレーションの実行

```bash
npm run db:migrate
```

マイグレーションファイル（`server/db/migrations/000〜004`）が順次適用されます。

## 開発サーバーの起動

フロントエンドとバックエンドを別々のターミナルで起動します。

```bash
# バックエンド API サーバー（ポート 3000、ファイル変更時に自動再起動）
npm run server:dev

# フロントエンド開発サーバー（ポート 5173）
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。  
API リクエストはプロキシ設定により自動的に `http://localhost:3000` に転送されます。

## ビルド

```bash
# フロントエンドのプロダクションビルド（dist/ に出力）
npm run build

# ビルド結果のプレビュー
npm run preview
```

## テスト

### ユニット・インテグレーションテスト（Vitest）

```bash
# 一度実行して終了
npm test

# ウォッチモード（ファイル変更時に自動再実行）
npm run test:watch
```

### PostgreSQL 統合テスト

実際の PostgreSQL に接続する統合テストです。実行前にテスト用 DB を作成してください。

```bash
# テスト用 DB の作成（初回のみ）
docker compose up -d db
npm run db:test:create

# 統合テストの実行（TEST_DATABASE_URL が設定されている必要あり）
npm run test:integration
```

`TEST_DATABASE_URL` 未設定の場合、統合テストは自動的にスキップされます。

### E2E テスト（Playwright）

E2E テストを実行する前に、開発サーバーを **起動しておく必要はありません**（Playwright が自動起動します）。

```bash
# ヘッドレスモードで実行
npm run test:e2e

# ブラウザを表示して実行
npm run test:e2e:headed

# テストレポートを表示
npm run test:e2e:show-report
```

テスト結果は `e2e-report/html/` および `test-results/` に保存されます。

## API エンドポイント

| カテゴリ | パスプレフィックス |
|----------|-------------------|
| 認証 | `/api/auth` |
| 顧客管理 | `/api/customers` |
| 仕入先管理 | `/api/suppliers` |
| 商品管理 | `/api/products` |
| 見積管理 | `/api/quotations` |
| 受注管理 | `/api/orders` |
| 発注管理 | `/api/purchase-orders` |
| 請求管理 | `/api/invoices` |
| 入金管理 | `/api/payments` |
| 入金消込 | `/api/receipts` |
| 納品管理 | `/api/deliveries` |
| 承認ワークフロー | `/api/approvals` |
| プロジェクト管理 | `/api/projects` |
| 通知 | `/api/notifications` |
| ユーザー管理 | `/api/users` |
| 設定 | `/api/settings` |
| ヘルスチェック | `/api/health` |

## ステージング環境へのデプロイ

```bash
docker compose -f docker-compose.staging.yml up -d
```

ステージング環境は Nginx リバースプロキシと Let's Encrypt による TLS に対応しています。  
`.env.staging` に本番用シークレットを設定してください（リポジトリには含めないこと）。

## Railway へのデプロイ

`railway.toml` により Railway へのデプロイを設定済みです。

1. Railway ダッシュボードで PostgreSQL サービスを追加し、`DATABASE_URL` を app サービスに設定
2. `JWT_SECRET` 等の環境変数を設定
3. デプロイ時に `releaseCommand` として `node scripts/migrate.js` が自動実行されます

本番初期データの投入：

```bash
npm run db:seed:production
```

障害復旧手順は `docs/restore-procedure.md` を参照してください。

## ドキュメント

| ドキュメント | 場所 |
|-------------|------|
| 要件定義 | `docs/requirements_definition.md` |
| ユーザーマニュアル | `docs/user_manual.md` |
| 受け入れテストシナリオ | `docs/acceptance-test-scenarios.md` |
| E2E テストケース一覧 | `docs/testcase-list_e2e.md` |
| ユニットテストケース一覧 | `docs/testcase-list-unit.md` |
| インフラ・環境設定 | `docs/infra-envs.md` |
| 障害復旧手順 | `docs/restore-procedure.md` |
| 将来実装バックログ | `docs/future_implementation_backlog.md` |

## 開発規約

- **TDD 必須**: テストを先に書いてから実装する（Red → Green → Refactor）
- **カバレッジ**: 新規コード 80% 以上、決済・認証パスは 95% 以上
- **E2E テスト**: 機能完成後に QA エンジニアが Playwright で Happy path を作成
- 詳細は [CLAUDE.md](CLAUDE.md) を参照
