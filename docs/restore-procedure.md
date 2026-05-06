# バックアップ・リストア手順書（INF-02）

## 目標値

| 指標 | 目標値 |
|------|--------|
| RTO（目標復旧時間） | 4時間以内 |
| RPO（目標復旧時点） | 1時間以内 |

## バックアップ設計

### バックアップ方式

- `pg_dump` による**フル論理バックアップ**（gzip圧縮）
- 実行頻度: **日次**（cron: 毎日 2:00 AM 推奨）
- 保持期間: **7日間**（`BACKUP_RETENTION_DAYS` で変更可能）
- 保存先: `/var/backups/transaction/` (ローカル) または S3互換ストレージ

### cron 設定例（本番サーバー）

```bash
# crontab -e で追加
0 2 * * * DATABASE_URL="..." BACKUP_DIR=/var/backups/transaction /path/to/scripts/backup.sh >> /var/log/transaction-backup.log 2>&1
```

---

## リストア手順

### 前提条件

- `pg_dump` / `psql` がインストール済みであること
- リストア先 DB への接続権限があること
- バックアップファイル（`.sql.gz`）が手元にあること

### Step 1: バックアップファイルの確認

```bash
# ローカルの場合
ls -lh /var/backups/transaction/

# S3の場合
aws s3 ls s3://your-bucket/production/backups/ | sort | tail -10
aws s3 cp s3://your-bucket/production/backups/transaction_db_YYYYMMDD_HHMMSS.sql.gz ./
```

### Step 2: アプリケーションの停止

```bash
# 本番環境
docker compose down app

# ステージング環境
docker compose -f docker-compose.staging.yml down app
```

### Step 3: リストア先 DB の準備（必要に応じて）

```bash
# DB を一旦削除して再作成（データが全て消えるので注意）
psql -h ${DB_HOST} -U ${DB_USER} -c "DROP DATABASE IF EXISTS transaction_db;"
psql -h ${DB_HOST} -U ${DB_USER} -c "CREATE DATABASE transaction_db OWNER app_user;"
```

### Step 4: リストア実行

```bash
# 解凍しながら psql に流し込む
PGPASSWORD="${DB_PASS}" gunzip -c /path/to/transaction_db_YYYYMMDD_HHMMSS.sql.gz \
  | psql \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --username="${DB_USER}" \
    --dbname="transaction_db"
```

### Step 5: 動作確認

```bash
# レコード数を確認して復旧を検証
psql -h ${DB_HOST} -U ${DB_USER} -d transaction_db -c "
  SELECT
    (SELECT COUNT(*) FROM users)          AS users,
    (SELECT COUNT(*) FROM quotations)     AS quotations,
    (SELECT COUNT(*) FROM orders)         AS orders,
    (SELECT COUNT(*) FROM invoices)       AS invoices;
"
```

### Step 6: アプリケーションの再起動

```bash
# 本番環境
docker compose up -d app

# ステージング環境
docker compose -f docker-compose.staging.yml up -d app
```

### Step 7: ヘルスチェック確認

```bash
curl -f https://your-domain.example.com/api/health
# → {"status":"ok","timestamp":"..."}
```

---

## 障害対応フロー

```
障害検知
  ↓
1. アラート確認（UptimeRobot / Slack）
2. ヘルスチェック手動確認 → /api/health が 5xx の場合
3. docker compose ps で各コンテナの状態確認
4. docker compose logs app で直近エラーを確認
   ↓
DB 障害の場合:
  5. バックアップファイルの特定（最新 RPO を確認）
  6. 上記リストア手順を実施
  7. RTO 4時間以内に復旧
   ↓
アプリ障害の場合:
  5. docker compose restart app
  または
  5. 直前の正常 Docker イメージにロールバック
     docker compose pull app && docker compose up -d app
```

---

## 関連ドキュメント

- [環境分離設計](infra-envs.md) — INF-06
- [バックアップスクリプト](../scripts/backup.sh) — 実行スクリプト
- [nginx / TLS 設定](../infra/nginx.conf) — INF-03
