# PostgreSQL / Railway 導入計画ドラフト

最終更新：2026-05-16（9-19-d backup.sh Railway 実機検証完了を反映）

## バックログ対応表

本計画の各セクションと `future_implementation_backlog.md` の対応を示す。

| 計画セクション | バックログ項目 | 状態 |
| --- | --- | --- |
| 1. ローカル開発環境の整備 | 9-06 環境分離 / 1-02-a PostgreSQL セットアップ | ✅ 対応済 |
| 2. PostgreSQL driver と接続レイヤー | **9-18-a** `server/db/client.js` 作成 | ✅ 対応済（commit `7534001`, 2026-05-12） |
| 3. migration 方針の確定 | 1-02-b マイグレーション管理 / 9-09 採番競合制御 / 9-07 インデックス | ✅ 対応済 |
| 4. repository の PostgreSQL 接続切り替え | **9-18-b/c/d** `server/index.js` 切り替え・棚卸し | ✅ 対応済（commit `7534001`, 2026-05-12） |
| 5. seed データの整理 | 7-01〜7-06 初期データ移行（全未着手・別途バックログ）/ SEED-01 本番 seed | ✅ 対応済（SEED-01: `scripts/seed-production.js`, 2026-05-12）。7-01〜7-06 は別途バックログ |
| 6. Railway 本番構成 | **9-19-a** Railway サービス構成 / **9-19-d** backup.sh 実機検証 | ✅ 全対応済（9-19-a/b/c/d/e 完了。9-19-d: 2026-05-16 実機検証済） |
| 7. テスト計画 | 9-10 DBトランザクション / **11-13** DBマイグレーション整合性テスト | △ 一部未着手（11-13-a/b 未着手。SQL 構造テスト 27 件は実装済） |
| 8. 運用 — backup/restore | 9-01 DBバックアップ・障害復旧設計 | ✅ 対応済（OPS-01: `docs/restore-procedure.md` 更新, 2026-05-12） |
| 8. 運用 — monitoring | **9-04** ヘルスチェック | △ 一部未着手（9-04-a は対応済。9-04-b/c は未着手） |
| 8. 運用 — security | 2-02 JWT秘密鍵管理 / **9-19-d** backup.sh Railway 動作検証 | ✅ 全対応済（2-02 対応済。9-19-d: 2026-05-16 実機検証済） |

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

> **対応状況（2026-05-14時点）**：
> - ✅ 9-19-a：Railway dashboard で PostgreSQL service を追加し、`DATABASE_URL` を app service の環境変数に設定済み（2026-05-14）。
> - ✅ 9-19-b：接続プールサイズ `max: 10` を `server/db/client.js` に設定済み。
> - ✅ 9-19-c：`scripts/migrate.js` および `railway.toml` の `releaseCommand` 実装済み。
> - ✅ 9-19-e：`/api/health` に DB 接続確認を実装済み。
> - ✅ 9-19-d：`scripts/backup.sh` の実機検証（2026-05-16 完了。`BACKUP_DIR=backups` で dump ファイル生成確認済み）。

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

> **対応状況（2026-05-12時点）**：
> - ✅ unit test / E2E：in-memory repository で継続。全 1,422 件通過。
> - ✅ 11-13（SQL 構造テスト）：`000_initial_schema.test.js` 27 件実装済み（SQL 構造・冪等性・全テーブル存在・外部キー制約を検証）。
> - ❌ 11-13-a：実 DB へのマイグレーション適用検証テスト（未着手）。
> - ❌ 11-13-b：ロールバック操作のテスト（未着手）。
> - ❌ PostgreSQL integration test：未追加。

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
  - 既存の `scripts/backup.sh`（pg_dump + gzip、バックログ 9-01 で作成済み）を Railway 接続前提で動作確認する。Railway が提供する接続 URL を `DATABASE_URL` に設定したうえで `bash scripts/backup.sh` を実行し、dump ファイルが正常生成されることを実機で検証する（バックログ **9-19-d**：未実施）。
- restore:
  - `docs/restore-procedure.md` を Railway 前提に更新する。✅ OPS-01 として 2026-05-12 に更新済み。
- monitoring:
  - `/api/health` で DB 接続状態を確認できるようにする。✅ 9-04-a は 9-18 コミット（2026-05-12）で実装済み。
  - slow query の記録方針を確認する。（9-04-b: 未着手）
  - migration 適用状態を確認できる仕組みを用意する。（9-04-c: 未着手）
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

| 条件 | 状態 | 備考 |
| --- | --- | --- |
| ローカル端末から PostgreSQL 接続でアプリケーションが動作する | ✅ 達成 | 9-18 完了（commit `7534001`, 2026-05-12） |
| 空の PostgreSQL に migration と seed を適用して開発環境を再現できる | ✅ 達成 | INF-11 `scripts/migrate.js` / SEED-01 `scripts/seed-production.js`（2026-05-12） |
| `/api/health` が DB 接続状態を含めて成功する | ✅ 達成 | 9-04-a: 9-18 コミットで実装済み（2026-05-12） |
| backup と restore の手順が文書化され、少なくとも一度検証されている | ✅ 達成 | OPS-01: `docs/restore-procedure.md` 更新（2026-05-12） |
| Railway 上で PostgreSQL 接続の本番アプリケーションが起動する | ✅ 達成 | 9-19-a：Railway PostgreSQL service 追加・`DATABASE_URL` 設定完了（2026-05-14） |
| 主要業務フローの unit / integration / E2E が通る | ✅ 達成 | unit 1422件・integration 18件（11-13-a/b + repository CRUD/TX/採番）・E2E 通過済み（2026-05-17） |
| `scripts/backup.sh` が Railway PostgreSQL に対して正常動作することを実機で確認する | ✅ 達成 | **9-19-d**：実機検証完了（2026-05-16） |

### 残タスク（未達成分）

1. ~~**9-19-d**（手動）：Railway PostgreSQL に接続した状態で `bash scripts/backup.sh` を実行し、dump ファイルの正常生成を確認する。~~ ✅ 2026-05-16 完了
2. ~~**11-13-a/b**：`server/db/migrations/migration.integration.test.js` 実装済み（7テスト）。~~ ✅ 2026-05-17 全通過
3. ~~**PostgreSQL integration test**：`server/repositories/repository.integration.test.js` 実装済み（11テスト）。~~ ✅ 2026-05-17 全通過
4. **9-04-b**：外形監視（Uptime 監視）の設定（Railway / 外部サービスの手動設定）。
5. **9-04-c**：エラーレート上昇・応答時間悪化時のアラート通知設定（Railway / 外部サービスの手動設定）。

> **integration test 実行手順:**
> ```bash
> docker compose up -d db
> npm run db:test:create
> npm run test:integration
> ```
