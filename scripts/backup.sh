#!/usr/bin/env bash
# INF-02: PostgreSQL 日次フルバックアップスクリプト
# 目標: RTO 4時間 / RPO 1時間
#
# 使用方法:
#   ./scripts/backup.sh
#
# 環境変数:
#   DATABASE_URL          — postgres://user:pass@host:port/dbname
#   BACKUP_RETENTION_DAYS — バックアップ保持日数（デフォルト: 7）
#   BACKUP_S3_BUCKET      — S3バケットURI（例: s3://my-bucket/backups）空欄はローカル保存
#   BACKUP_DIR            — ローカル保存先ディレクトリ（デフォルト: /var/backups/transaction）

set -euo pipefail

# ---- 設定 ----------------------------------------------------------------
DATABASE_URL="${DATABASE_URL:?DATABASE_URL 環境変数を設定してください}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/transaction}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILENAME="transaction_db_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

# DATABASE_URL をパースして pg_dump の引数を組み立てる
# 形式: postgres://user:password@host:port/dbname
DB_USER=$(echo "${DATABASE_URL}" | sed -E 's|postgres://([^:]+):.*|\1|')
DB_PASS=$(echo "${DATABASE_URL}" | sed -E 's|postgres://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "${DATABASE_URL}" | sed -E 's|postgres://[^@]+@([^:/]+).*|\1|')
DB_PORT=$(echo "${DATABASE_URL}" | sed -E 's|postgres://[^@]+@[^:]+:([0-9]+)/.*|\1|')
DB_NAME=$(echo "${DATABASE_URL}" | sed -E 's|postgres://[^@]+@[^/]+/(.+)|\1|')

# ---- バックアップ実行 -----------------------------------------------------
echo "[$(date -Iseconds)] バックアップ開始: ${DB_NAME} → ${BACKUP_PATH}"

mkdir -p "${BACKUP_DIR}"

PGPASSWORD="${DB_PASS}" pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --format=plain \
  --no-owner \
  --no-acl \
  | gzip > "${BACKUP_PATH}"

BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)
echo "[$(date -Iseconds)] バックアップ完了: ${BACKUP_FILENAME} (${BACKUP_SIZE})"

# ---- S3 アップロード（任意）----------------------------------------------
if [[ -n "${BACKUP_S3_BUCKET:-}" ]]; then
  echo "[$(date -Iseconds)] S3 アップロード: ${BACKUP_S3_BUCKET}/${BACKUP_FILENAME}"
  aws s3 cp "${BACKUP_PATH}" "${BACKUP_S3_BUCKET}/${BACKUP_FILENAME}"
  echo "[$(date -Iseconds)] S3 アップロード完了"
fi

# ---- 古いバックアップの削除 -----------------------------------------------
echo "[$(date -Iseconds)] ${RETENTION_DAYS}日以上前のバックアップを削除します"
find "${BACKUP_DIR}" -name "transaction_db_*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete
echo "[$(date -Iseconds)] クリーンアップ完了"

# ---- 現在のバックアップ一覧を表示 ----------------------------------------
echo "[$(date -Iseconds)] 保存済みバックアップ:"
ls -lh "${BACKUP_DIR}"/transaction_db_*.sql.gz 2>/dev/null || echo "  (なし)"
