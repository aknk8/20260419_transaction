#!/usr/bin/env bash
# INF-03: Let's Encrypt 証明書の初回取得スクリプト
# 使用前に DOMAIN と TLS_EMAIL 環境変数を設定すること

set -euo pipefail

DOMAIN="${DOMAIN:?DOMAIN 環境変数を設定してください}"
TLS_EMAIL="${TLS_EMAIL:?TLS_EMAIL 環境変数を設定してください}"

echo "==> [init-tls] ドメイン: ${DOMAIN}"
echo "==> [init-tls] メール: ${TLS_EMAIL}"

# ACME チャレンジ用ディレクトリを作成
mkdir -p /var/www/certbot

# certbot コンテナが存在しない場合は直接実行
docker run --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${TLS_EMAIL}" \
    --agree-tos \
    --no-eff-email \
    -d "${DOMAIN}"

echo "==> [init-tls] 証明書取得完了。nginx を再起動します..."
docker compose -f docker-compose.staging.yml restart nginx

echo "==> [init-tls] 完了。HTTPS が有効になりました: https://${DOMAIN}"
