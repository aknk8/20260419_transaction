# インフラ環境設計（INF-06）

## 環境一覧

| 環境 | NODE_ENV | ファイル | 用途 |
|------|----------|---------|------|
| 開発 | development | `.env.development` | ローカル開発 |
| ステージング | staging | `.env.staging` | リリース前検証 |
| 本番 | production | `.env.production` | 本番サービス |

## 環境変数管理方針

- `.env.example` — テンプレート。リポジトリに含める
- `.env.development` — 開発用ダミー値。リポジトリに含める
- `.env.staging` / `.env.production` — **リポジトリに含めない**（`.gitignore` 参照）
  - 実際の値は GitHub Actions の Secrets または専用の秘密管理サービス（Vault等）から注入する

## 環境別の主な設定値

### DATABASE_URL

| 環境 | 接続先 | DB名 |
|------|--------|------|
| development | localhost:5432 | transaction_db_dev |
| staging | staging-db:5432 | transaction_db_staging |
| production | db:5432 | transaction_db |

### JWT_SECRET

- 64文字以上のランダム文字列を使用すること
- 生成方法: `openssl rand -hex 32`
- 環境ごとに異なる値を設定すること（共有禁止）

### CORS_ORIGIN

| 環境 | 値 |
|------|-----|
| development | `http://localhost:5173` |
| staging | `https://staging.example.com` |
| production | `https://your-domain.example.com` |

### LOG_LEVEL

| 環境 | 推奨値 | 理由 |
|------|--------|------|
| development | `debug` | 詳細ログで開発効率向上 |
| staging | `info` | 動作確認に必要な情報を記録 |
| production | `warn` | ノイズを減らし重要イベントのみ記録 |

## Docker Compose 構成

### 開発環境

```bash
# docker-compose.yml を使用
docker compose up -d
```

### ステージング環境

```bash
# 環境変数を設定してから起動
export DB_PASSWORD="your-staging-db-password"
export JWT_SECRET="your-staging-jwt-secret"
export CORS_ORIGIN="https://staging.example.com"

docker compose -f docker-compose.staging.yml up -d
```

## ステージング環境の構築手順

1. サーバーに Docker / Docker Compose をインストール
2. リポジトリをクローン
3. `.env.staging` を作成（`.env.example` をコピーして値を設定）
4. 必要な環境変数をエクスポート
5. `docker compose -f docker-compose.staging.yml up -d` で起動
6. `docker compose -f docker-compose.staging.yml ps` で稼働確認
7. `scripts/init-tls.sh` を実行してLet's Encrypt証明書を取得（INF-03参照）

## セキュリティ要件

- `.env.staging` / `.env.production` は安全なサーバー上でのみ管理
- JWT_SECRET は定期的にローテーション（90日推奨）
- DB_PASSWORD は各環境で異なる値を使用
- 本番環境のDB接続は VPC 内のプライベートネットワーク経由のみ許可

## 関連ドキュメント

- [nginx / TLS 設定](../infra/nginx.conf) — INF-03
- [バックアップ・復旧手順](restore-procedure.md) — INF-02
- [CI/CD パイプライン](.github/workflows/ci.yml) — INF-01
