#!/usr/bin/env bash
# INF-01: ステージング環境へのデプロイスクリプト
# GitHub Actions の deploy-staging ジョブから呼び出される
#
# 必要な環境変数（GitHub Secrets で設定）:
#   STAGING_HOST    — デプロイ先ホスト名またはIPアドレス
#   STAGING_USER    — SSH ユーザー名
#   STAGING_SSH_KEY — SSH 秘密鍵（PEM形式）
#   DB_PASSWORD     — ステージングDB パスワード
#   JWT_SECRET      — JWT シークレット

set -euo pipefail

STAGING_HOST="${STAGING_HOST:?STAGING_HOST を設定してください}"
STAGING_USER="${STAGING_USER:?STAGING_USER を設定してください}"
STAGING_SSH_KEY="${STAGING_SSH_KEY:?STAGING_SSH_KEY を設定してください}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD を設定してください}"
JWT_SECRET="${JWT_SECRET:?JWT_SECRET を設定してください}"

DEPLOY_DIR="/opt/transaction"
COMPOSE_FILE="docker-compose.staging.yml"

echo "==> [deploy-staging] デプロイ先: ${STAGING_USER}@${STAGING_HOST}:${DEPLOY_DIR}"

# SSH 鍵をファイルに書き出す
SSH_KEY_FILE=$(mktemp)
echo "${STAGING_SSH_KEY}" > "${SSH_KEY_FILE}"
chmod 600 "${SSH_KEY_FILE}"
trap 'rm -f "${SSH_KEY_FILE}"' EXIT

SSH_OPTS="-i ${SSH_KEY_FILE} -o StrictHostKeyChecking=no -o BatchMode=yes"

# リモートサーバー上でデプロイを実行
ssh ${SSH_OPTS} "${STAGING_USER}@${STAGING_HOST}" bash -s << REMOTE_SCRIPT
set -euo pipefail

cd "${DEPLOY_DIR}"

echo "==> git pull"
git pull origin main

echo "==> Docker イメージのビルド"
DB_PASSWORD="${DB_PASSWORD}" \
JWT_SECRET="${JWT_SECRET}" \
docker compose -f ${COMPOSE_FILE} build app

echo "==> コンテナ再起動（ダウンタイム最小化）"
DB_PASSWORD="${DB_PASSWORD}" \
JWT_SECRET="${JWT_SECRET}" \
docker compose -f ${COMPOSE_FILE} up -d --no-deps app

echo "==> 古い Docker イメージのクリーンアップ"
docker image prune -f

echo "==> デプロイ完了"
REMOTE_SCRIPT

echo "==> [deploy-staging] リモートデプロイ完了"
