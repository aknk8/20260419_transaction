# PostgreSQL / Railway 導入計画ドラフト

最終更新：2026-05-12（`future_implementation_backlog.md` との対応整理。バックログ対応表・依存関係注記を追加）

## バックログ対応表

本計画の各セクションと `future_implementation_backlog.md` の対応を示す。

| 計画セクション | バックログ項目 | 状態 |
| --- | --- | --- |
| 1. ローカル開発環境の整備 | 9-06 環境分離 / 1-02-a PostgreSQL セットアップ | ✅ 対応済 |
| 2. PostgreSQL driver と接続レイヤー | **9-18-a** `server/db/client.js` 作成 | **未着手（本計画が主眼）** |
| 3. migration 方針の確定 | 1-02-b マイグレーション管理 / 9-09 採番競合制御 / 9-07 インデックス | ✅ 対応済 |
| 4. repository の PostgreSQL 接続切り替え | **9-18-b/c/d** `server/index.js` 切り替え・棚卸し | **未着手（本計画が主眼）** |
| 5. seed データの整理 | 7-01〜7-06 初期データ移行（全未着手）/ 9-07 seed-staging.js | 一部対応済 |
| 6. Railway 本番構成 | **9-19-a/b/c** Railway サービス構成 / 9-06 / 2-02 | **未着手（9-18 完了後）** |
| 7. テスト計画 | 9-10 DBトランザクション / **11-13** DBマイグレーション整合性テスト | 一部未着手 |
| 8. 運用 — backup/restore | 9-01 DBバックアップ・障害復旧設計 | ✅ 対応済 |
| 8. 運用 — monitoring | **9-04** ヘルスチェック（★★★ 未着手・本計画の完了条件の前提） | **未着手** |
| 8. 運用 — security | 2-02 JWT秘密鍵管理 / **9-19-d** backup.sh Railway 動作検証 | 一部未着手 |

## 前提

- 本番環境は Railway にデプロイする。
- 開発時は開発者のローカル端末を使う。
- ローカル開発では、アプリケーションはローカル端末で起動し、PostgreSQL は Docker Compose で起動する方針とする。
- 本番では Railway のアプリケーションサービスから Railway PostgreSQL に接続する。

## 現状整理

- `server/db/schema.js` は Drizzle の PostgreSQL schema として定義済み。
- `docker-compose.yml` には PostgreSQL サービスが定義済み。
- `.env.example` には `DATABASE_URL` が定義済み。
- `railway.toml` は Dockerfile builder と `/api/health` の health check を定義済み。
- 一方で、`server/index.js` は現在も in-memory repository を組み立てており、本番起動時に PostgreSQL repository へ接続する経路が未整備。
- 初期テーブル作成用の baseline migration が不足している可能性があるため、空の PostgreSQL から環境を再現できる状態にする必要がある。

## 進め方

### 1. ローカル開発環境の整備

- `docker compose up -d db` で PostgreSQL を起動できることを確認する。
- `.env.development` と `.env.example` の接続先を整理する。

```env
DATABASE_URL=postgres://app_user:app_password@localhost:5432/transaction_db
NODE_ENV=development
PORT=3000
```

- 開発者は以下の流れで起動する。

```bash
docker compose up -d db
npm run server:dev
npm run dev
```

### 2. PostgreSQL driver と接続レイヤーの追加

- Drizzle から PostgreSQL に接続するための driver を追加する。
- `server/db/client.js` のような接続モジュールを作成する。
- `DATABASE_URL` から接続 pool と Drizzle client を生成する。
- `NODE_ENV=production` または `DATABASE_URL` が必要な起動モードでは、未設定時に明示的に起動失敗させる。

### 3. migration 方針の確定

- 空の PostgreSQL に対して全テーブルを作成できる `001_initial_schema.sql` を作成する。
- 既存 migration を適用順に整理する。

想定順序:

1. `001_initial_schema.sql`
2. `002_account_lock.sql`
3. `003_sequence_counters.sql`
4. `004_indexes.sql`
5. 以後の追加 migration

- migration は冪等性を意識し、可能な範囲で `IF NOT EXISTS` を使う。
- 本番適用前には必ずバックアップを取得する。

### 4. repository の PostgreSQL 接続切り替え

- `server/index.js` の repository 組み立てを環境別に切り替える。
- 本番および PostgreSQL 接続モードでは `createCustomerRepository(db)` などの DB repository を使用する。
- unit test では in-memory repository を維持し、高速なテストを継続する。
- DB repository が未実装または不完全な entity がないか棚卸しする。

確認対象:

- user
- customer
- supplier
- product
- project
- quotation
- order
- purchase order
- invoice
- receipt
- payment
- delivery
- approval route
- approval history
- notification
- audit log
- session / refresh token
- sequence counter
- settings

### 5. seed データの整理

- 開発用 seed と本番初期データを分離する。
- 開発用 seed はサンプルユーザー、マスター、取引データを含める。
- 本番初期データは管理者ユーザーと必須マスターのみに限定する。
- seed script は複数回実行しても壊れないように冪等化する。
- 本番初期投入後の顧客・仕入先・商品マスタの CSV インポート機能はバックログ **7-01〜7-06**（初期データ移行、★ 通常・全未着手）として別途計画する。本計画の seed 整備は本番稼働前の手動投入を対象とし、7章との役割分担を維持する。

### 6. Railway 本番構成

- Railway project に PostgreSQL service を追加する。
- アプリケーション service に以下の環境変数を設定する。

```env
DATABASE_URL=<Railway PostgreSQL service の接続URL>
JWT_SECRET=<64文字以上のランダム文字列>
CORS_ORIGIN=<本番フロントエンドURL>
NODE_ENV=production
```

- `PORT` は Railway が注入する値を優先する。
- Railway 上ではデプロイ前またはリリース手順内で migration を実行する。
- 本番 DB への直接接続は必要時のみとし、通常運用では Railway service 間接続を使う。
- 接続プールサイズは Railway PostgreSQL プランの `max_connections`（無料プランは通常 25）を超えないよう設定する。アプリケーション側の `connectionString` に `pool_max` を明示する（例：`max: 10`）。バックログ **9-19-b** として管理する。

### 7. テスト計画

- unit test は既存の in-memory repository を使って継続する。
- PostgreSQL を使う integration test を追加する。

重点確認:

- repository の CRUD
- transaction rollback
- sequence counter の同時採番
- 承認フロー
- 見積、受注、発注、請求、入金、支払の主要ワークフロー
- migration 適用後の schema 整合性

- E2E はローカル PostgreSQL 接続で実行できるようにする。

### 8. 運用設計

- backup:
  - Railway の backup 機能（自動スナップショット）の利用可否をプランに応じて確認する。
  - 既存の `scripts/backup.sh`（pg_dump + gzip、バックログ 9-01 で作成済み）を Railway 接続前提で動作確認する。Railway が提供する接続 URL を `DATABASE_URL` に設定したうえで `bash scripts/backup.sh` を実行し、dump ファイルが正常生成されることを実機で検証する（バックログ **9-19-d**）。
- restore:
  - `docs/restore-procedure.md` を Railway 前提に更新する。
- monitoring:
  - `/api/health` で DB 接続状態を確認できるようにする。これはバックログ **9-04-a**（★★★ 未着手）の実装が前提となる。本計画の完了条件に含まれるため、**9-04 は本計画と並行して先行着手が必要**。
  - slow query の記録方針を確認する。
  - migration 適用状態を確認できる仕組みを用意する。
- security:
  - `JWT_SECRET` と `DATABASE_URL` は Railway Variables で管理する。
  - 本番 DB の認証情報を repository に含めない。
  - 本番 DB の外部公開は必要最小限にする。

## リリース手順案

1. ローカル PostgreSQL を起動する。
2. initial migration を適用する。
3. 開発用 seed を投入する。
4. unit test を実行する。
5. PostgreSQL integration test を実行する。
6. E2E を実行する。
7. Railway に PostgreSQL service を追加する。
8. Railway app service に環境変数を設定する。
9. 本番 DB に migration を適用する。
10. 本番初期データを投入する。
11. アプリケーションを Railway にデプロイする。
12. `/api/health`、ログイン、主要 CRUD、承認フローを確認する。
13. backup と restore 手順を確認する。

## 優先順位

1. PostgreSQL 接続レイヤーを追加する。
2. 空 DB から再現できる initial migration を整備する。
3. `server/index.js` の repository 組み立てを PostgreSQL に切り替える。
4. ローカル PostgreSQL で主要機能を検証する。
5. Railway の PostgreSQL service と環境変数を設定する。
6. 本番 migration、seed、デプロイ手順を確立する。

## 主なリスク

- 本番で in-memory repository のまま起動すると、再起動時にデータが消える。
- initial migration が不足していると、Railway の空 DB から環境を再現できない。
- seed が冪等でないと、再実行時に重複データや制約違反が発生する。
- Railway の環境変数参照が誤っていると、アプリケーションが DB に接続できない。
- backup / restore 手順が未検証だと、障害時の復旧時間を見積もれない。

## 完了条件

> ⚠️ 完了条件のうち `/api/health` の DB 接続確認はバックログ **9-04-a**（★★★ 未着手）の先行実装が必要。9-04 の着手計画を本計画と合わせて立案すること。

- ローカル端末から PostgreSQL 接続でアプリケーションが動作する。
- 空の PostgreSQL に migration と seed を適用して開発環境を再現できる。
- Railway 上で PostgreSQL 接続の本番アプリケーションが起動する。
- `/api/health` が DB 接続状態を含めて成功する（**9-04-a の実装が前提**）。
- 主要業務フローの unit / integration / E2E が通る。
- `scripts/backup.sh` が Railway PostgreSQL に対して正常動作することを実機で確認する（**9-19-d**）。
- backup と restore の手順が文書化され、少なくとも一度検証されている。
