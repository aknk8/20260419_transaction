# Transaction Management System

受発注・請求・入金を一元管理するフルスタック Web アプリケーションです。

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Vite 5 / Vanilla JS / CSS |
| バックエンド | Node.js / Fastify 5 |
| データベース | PostgreSQL 16 / Drizzle ORM |
| 認証 | JWT (@fastify/jwt) |
| テスト（ユニット） | Vitest 2 |
| テスト（E2E） | Playwright 1.44 |
| インフラ | Docker / Docker Compose / Nginx |

## ディレクトリ構成

```
.
├── src/                    # フロントエンドビジネスロジック（モデル・ユーティリティ）
├── server/
│   ├── index.js            # サーバーエントリーポイント（DI 設定）
│   ├── app.js              # Fastify アプリファクトリ
│   ├── db/                 # DB スキーマ・シードデータ
│   ├── repositories/       # データアクセス層
│   ├── services/           # ビジネスロジック層
│   ├── routes/             # REST API ルート定義
│   ├── plugins/            # Fastify プラグイン（認可・CSRF 等）
│   └── jobs/               # バックグラウンドジョブ（node-cron）
├── e2e/                    # Playwright E2E テスト
├── docs/                   # 要件定義・ユーザーマニュアル等
├── infra/                  # Nginx 設定
├── scripts/                # ユーティリティスクリプト
├── app.js                  # フロントエンドエントリーポイント
├── index.html              # HTML テンプレート
├── docker-compose.yml      # 開発用 DB 環境
└── docker-compose.staging.yml  # ステージング環境（Nginx + TLS）
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
| `DATABASE_URL` | PostgreSQL 接続文字列 | `postgres://app_user:app_password@localhost:5432/transaction_db_dev` |
| `JWT_SECRET` | JWT 署名シークレット（本番は 64 文字以上のランダム文字列） | 開発用ダミー値 |
| `PORT` | API サーバーポート | `3000` |
| `NODE_ENV` | 実行環境 | `development` |
| `CORS_ORIGIN` | 許可するフロントエンドオリジン | `http://localhost:5173` |
| `RATE_LIMIT_MAX` | レートリミット（リクエスト数/分） | `1000` |
| `APPROVAL_STALE_DAYS` | 滞留承認アラート閾値（日数） | `3` |
| `LOG_LEVEL` | ログレベル（debug / info / warn / error） | `debug` |

### 4. データベースの起動

Docker Compose で PostgreSQL を起動します。

```bash
docker compose up -d
```

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

### ユニット・インテグレーションテスト

```bash
# 一度実行して終了
npm test

# ウォッチモード（ファイル変更時に自動再実行）
npm run test:watch
```

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

テスト結果は `playwright-report/` および `test-results/` に保存されます。

## API エンドポイント

| カテゴリ | パスプレフィックス |
|----------|-------------------|
| 認証 | `/api/auth` |
| 顧客管理 | `/api/customers` |
| 仕入先管理 | `/api/suppliers` |
| 商品管理 | `/api/products` |
| 見積管理 | `/api/quotations` |
| 受注管理 | `/api/orders` |
| 請求管理 | `/api/invoices` |
| 入金管理 | `/api/payments` |
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

## ドキュメント

| ドキュメント | 場所 |
|-------------|------|
| 要件定義 | `docs/requirements_definition.md` |
| ユーザーマニュアル | `docs/user_manual.md` |
| 受け入れテストシナリオ | `docs/acceptance-test-scenarios.md` |
| E2E テストケース一覧 | `docs/testcase-list_e2e.md` |
| インフラ・環境設定 | `docs/infra-envs.md` |

## 開発規約

- **TDD 必須**: テストを先に書いてから実装する（Red → Green → Refactor）
- **カバレッジ**: 新規コード 80% 以上、決済・認証パスは 95% 以上
- **E2E テスト**: 機能完成後に QA エンジニアが Playwright で Happy path を作成
- 詳細は [CLAUDE.md](CLAUDE.md) を参照
