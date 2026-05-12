# バックアップ・リストア手順書

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
- 保存先: ローカルまたは S3 互換ストレージ

### Railway 環境でのバックアップ実行

```bash
# Railway の DATABASE_URL を使ってバックアップ
DATABASE_URL="<Railway PostgreSQL の接続URL>" bash scripts/backup.sh
```

Railway コンソールから `DATABASE_URL` を取得し、上記コマンドを手元で実行する。
dump ファイルは `backups/transaction_db_YYYYMMDD_HHMMSS.sql.gz` に出力される。

### cron 設定例（CI/外部サーバーから実行する場合）

```bash
# crontab -e で追加
0 2 * * * DATABASE_URL="..." BACKUP_DIR=/var/backups/transaction /path/to/scripts/backup.sh >> /var/log/transaction-backup.log 2>&1
```

---

## リストア手順（Railway PostgreSQL）

### 前提条件

- `pg_dump` / `psql` がインストール済みであること
- Railway の `DATABASE_URL` を手元に取得済みであること
- バックアップファイル（`.sql.gz`）が手元にあること

### Step 1: バックアップファイルの確認

```bash
# ローカルの場合
ls -lh backups/

# S3の場合
aws s3 ls s3://your-bucket/production/backups/ | sort | tail -10
aws s3 cp s3://your-bucket/production/backups/transaction_db_YYYYMMDD_HHMMSS.sql.gz ./
```

### Step 2: Railway アプリケーションの停止（任意）

Railway コンソールまたは CLI でアプリケーションサービスをスリープ・停止させる。

```bash
# Railway CLI を使う場合
railway down
```

### Step 3: リストア先 DB の準備（必要に応じて）

```bash
# 既存データを全削除してリストアする場合
# Railway の DATABASE_URL から接続情報を取得して実行
psql "${DATABASE_URL}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

> ⚠️ 上記はデータが全て消えます。部分リストアが必要な場合は pg_restore オプションを使用してください。

### Step 4: マイグレーション適用（スキーマのみ再構築する場合）

```bash
DATABASE_URL="<Railway PostgreSQL の接続URL>" node scripts/migrate.js
```

### Step 5: バックアップからリストア実行

```bash
# 解凍しながら psql に流し込む
gunzip -c /path/to/transaction_db_YYYYMMDD_HHMMSS.sql.gz | psql "${DATABASE_URL}"
```

### Step 6: 動作確認

```bash
# レコード数を確認して復旧を検証
psql "${DATABASE_URL}" -c "
  SELECT
    (SELECT COUNT(*) FROM users)      AS users,
    (SELECT COUNT(*) FROM quotations) AS quotations,
    (SELECT COUNT(*) FROM orders)     AS orders,
    (SELECT COUNT(*) FROM invoices)   AS invoices;
"
```

### Step 7: アプリケーションの再起動

Railway コンソールまたは CLI でアプリケーションを再デプロイする。

```bash
# Railway CLI を使う場合
railway up
```

### Step 8: ヘルスチェック確認

```bash
curl -f https://<Railway-アプリURL>/api/health
# → {"status":"ok","timestamp":"..."}
```

---

## 障害対応フロー

```
障害検知
  ↓
1. アラート確認
2. ヘルスチェック手動確認 → /api/health が 5xx の場合
3. Railway コンソールでアプリケーションのログを確認
   ↓
DB 障害の場合:
  4. バックアップファイルの特定（最新 RPO を確認）
  5. 上記リストア手順を実施
  6. RTO 4時間以内に復旧
   ↓
アプリ障害の場合:
  4. Railway コンソールから再デプロイ
  または
  4. 直前の正常デプロイにロールバック
```

---

## 関連ドキュメント

- [環境分離設計](infra-envs.md)
- [バックアップスクリプト](../scripts/backup.sh)
- [マイグレーション実行](../scripts/migrate.js)
- [Railway 本番構成計画](postgresql-railway-plan.md)
