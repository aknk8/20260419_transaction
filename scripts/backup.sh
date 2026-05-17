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

# ログ用に接続先だけを伏せ字なしで表示する。認証情報は表示しない。
DB_LABEL=$(echo "${DATABASE_URL}" | sed -E 's|^postgres(ql)?://[^@]+@||; s|[?].*$||')

# ---- バックアップ実行 -----------------------------------------------------
echo "[$(date -Iseconds)] バックアップ開始: ${DB_LABEL} → ${BACKUP_PATH}"

mkdir -p "${BACKUP_DIR}"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "ERROR: pg_dump が見つかりません。PostgreSQL client をインストールしてください。" >&2
  exit 1
fi

if command -v psql >/dev/null 2>&1; then
  SERVER_VERSION_NUM=$(psql "${DATABASE_URL}" -Atc "SHOW server_version_num;" 2>/dev/null || true)
  PG_DUMP_VERSION=$(pg_dump --version | sed -E 's/.* ([0-9]+)(\.[0-9]+)?.*/\1/')

  if [[ "${SERVER_VERSION_NUM}" =~ ^[0-9]+$ && "${PG_DUMP_VERSION}" =~ ^[0-9]+$ ]]; then
    SERVER_MAJOR=$((SERVER_VERSION_NUM / 10000))
    if (( PG_DUMP_VERSION < SERVER_MAJOR )); then
      echo "ERROR: pg_dump のメジャーバージョンが PostgreSQL server より古いためバックアップできません。" >&2
      echo "  server major: ${SERVER_MAJOR}" >&2
      echo "  pg_dump major: ${PG_DUMP_VERSION}" >&2
      echo "PostgreSQL ${SERVER_MAJOR} 以上の client に更新してから再実行してください。" >&2
      exit 1
    fi
  fi
fi

pg_dump \
  --dbname="${DATABASE_URL}" \
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
