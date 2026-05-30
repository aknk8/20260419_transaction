# E2E / CI 修正方針メモ

作成日: 2026-05-30  
対象ブランチ: `fix/e2e-test-failures`  
前提: 直近CI失敗 run `26598615421` と、現在の未コミット実装を踏まえた整理

## 結論

直近CIの主な失敗原因は、E2E実行時の初期データ状態がテスト間で安定していないことと、現行アプリの承認ワークフローに対して一部テスト・seed期待値が古いこと。

現在の実装では、以下の方向には既に修正が進んでいる。

- CIのE2E対象サーバーをPostgreSQLモードで起動する
- CI開始時にPostgreSQLへE2E seedを投入する
- Playwright fixtureでテストごとにreset APIを呼ぶ
- reset APIのHTTP statusを検証し、reset失敗を早期に落とす
- PostgreSQL向けに `TRUNCATE ... RESTART IDENTITY CASCADE` + seed再投入の `resetDb` を追加する

一方で、このままではまだCI安定化としては不十分な可能性がある。特に `approval_routes` の再seed、承認済み状態を前提にした受注・請求テスト、固定件数・固定採番期待の見直しが次の焦点になる。

## 現在の実装状況

### 反映済みの対策

`.github/workflows/ci.yml`

- `DBシードデータ投入` ステップを追加し、`node scripts/seed-e2e.js` を実行するようになっている。
- バックエンドサーバー起動時に `DATABASE_URL` を渡すようになっている。
- これにより、E2E対象サーバーはin-memoryではなくPostgreSQLを使う構成に近づいている。

`server/db/resetDb.js`

- PostgreSQL用のDBリセット処理が追加されている。
- 主要テーブルを `TRUNCATE` し、ユーザー、顧客、仕入先、商品、案件、見積、受注、発注、請求、入金、支払、納品、採番をseedから再投入している。
- `sequence_counters` もin-memory初期値と揃える方針になっている。

`server/index.js`

- DBモードでは `resetDb(db)` を呼ぶようになっている。
- in-memory専用の `reset()` 呼び出しだけではなく、PostgreSQLの実データを初期化できるようになっている。

`e2e/fixtures.js`

- `/api/test/reset` のレスポンスが `204` であることを検証するようになっている。
- reset endpoint未登録、500、ポート違いなどが起きた場合に、後続のUI操作失敗ではなくreset失敗として検知できる。

`package.json` / `playwright.uat.config.js` / `e2e/uat-staging-scenario.spec.js`

- 通常E2Eとは別に、UAT用のPlaywright configとシナリオが追加されている。
- CI安定化とは直接別軸だが、ステージング相当の業務フロー確認として使える。

## 残っている主要リスク

### 1. `approval_routes` がreset後に空になる可能性

`server/db/resetDb.js` は `approval_routes` を `TRUNCATE` 対象に含めているが、現時点では再投入処理がない。

承認依頼、承認、却下、複数段階承認を含むE2Eは、承認ルートが存在することを前提にしている。reset後に承認ルートが空だと、以下のようなテストが不安定または失敗する可能性が高い。

- 見積承認
- 受注承認
- 発注承認
- 請求承認
- 支払承認
- 承認ルート設定表示

方針:

- seed用の標準承認ルートデータを明示的に定義する。
- `resetDb` で `approval_routes` にも再投入する。
- in-memoryの `createInMemoryApprovalRouteRepository` 初期値とPostgreSQL seedの内容を揃える。

### 2. 受注詳細のボタン表示条件とE2E期待値がずれている

現行UIでは、受注詳細の以下ボタンは `order.status === '承認済み'` のときだけ表示される。

- `data-action-billing-target`
- `data-action-create-purchase-order`

一方で、既存E2Eには `ORD-00001` などの `受注済み` データで、発注起票や請求対象化ボタンを期待している箇所が残っている。

方針:

- 仕様として「承認済み受注のみ発注起票・請求対象化できる」が正しいなら、テストを現行仕様へ合わせる。
- 具体的には、テスト内で受注を承認済みに遷移させてからボタンを検証するか、承認済みのseed受注を追加してそれを使う。
- 旧仕様に戻す判断は避ける。承認ワークフロー導入後の業務制御として、承認済み条件のほうが自然。

### 3. 請求詳細の確定ボタン条件とE2E期待値がずれている

現行UIでは、請求の `確定する` ボタンは `invoice.status === '承認済み'` のときだけ表示される。

既存E2Eには `INV-00003` のような `下書き` 請求で `確定する` ボタンを期待している箇所が残っている。

方針:

- 「請求は承認後に確定できる」を正とする。
- テストは `下書き -> 承認依頼中 -> 承認済み -> 確定` の流れを踏む。
- 単体的に確定ボタンだけ見たいテストでは、承認済み請求のseedを用意する。

### 4. 固定件数・固定採番期待がseed変更に弱い

ログには `Expected: 5 / Received: 9`、`Expected: 7 / Received: 11` のような失敗が出ている。

これはresetの有無に関係なく、seed件数が変わるだけで壊れるテストが残っていることを示している。

方針:

- 業務上「seed件数そのもの」が検証対象でないテストでは、固定件数の検証を避ける。
- 検索後の一意な行、登録した名称、取得したコードなど、テストが作ったデータを軸に検証する。
- ページングのテストでは、前提件数を満たす専用データをテスト内で作るか、ページサイズを明示的に小さくしてから検証する。

### 5. 固定コード依存が状態変更テストと相性が悪い

`PMT-00003`、`POD-00005`、`INV-00003`、`ORD-00001` など、固定コードを複数テストで状態変更している箇所がある。

テストごとのDB resetが正しく動けば軽減されるが、固定コード依存は仕様変更やseed変更に弱い。

方針:

- 作成系テストでは、登録後に画面から実際のコードを取得して使う。
- 固定seedは「読み取り専用の表示確認」に限定する。
- 状態遷移テストは、各テスト内で必要な前提状態を作ってから検証する。

## 優先順位

### P0: reset後の承認ルート再seed

最初に対応する。

理由:

- 承認フローが横断的に壊れると、見積、受注、発注、請求、支払の失敗が連鎖する。
- 現在の `resetDb` は `approval_routes` を消しているため、reset導入後に新しい失敗を生む可能性がある。

実装方針:

- `server/db/seedData.js` または専用ファイルに標準承認ルートseedを定義する。
- `server/db/resetDb.js` で `approvalRoutes` をimportし、ユーザーseed投入後に承認ルートをinsertする。
- 承認ルート設定画面のE2Eが期待する初期状態と一致させる。

### P1: 受注・請求の承認済み前提を整理

次に対応する。

理由:

- 現行アプリのボタン表示条件は承認ワークフロー後の仕様を反映している。
- テストだけが旧仕様を引きずっている箇所がある。

実装方針:

- `order.spec.js` の発注起票・請求対象化テストは、承認済み受注を使う。
- `purchaseOrder.spec.js` のbeforeEachは、発注起票可能な受注を確実に用意する。
- `invoice.spec.js` の確定・送付済テストは、承認済み請求を使うか、テスト内で承認フローを踏む。

### P2: 固定件数・固定採番の弱いテストを修正

P0/P1後に対応する。

理由:

- resetが正しく動いても、seed件数変更で再発する。
- CIの安定性だけでなく、今後の開発速度にも影響する。

実装方針:

- `page-size.spec.js` は現行seed件数に合わせるだけでなく、ページング対象データを明示する。
- `explore-et04-master.spec.js` は「次へ」クリック前に、次ページが存在する条件を作る。
- 登録系は `CUS-010` のような固定採番だけに依存せず、登録した名称の表示も検証する。

### P3: UATシナリオをCI本線と分離して扱う

最後に整理する。

理由:

- UATは実環境にデータを作る長い業務フローで、通常のPR CIとは性質が違う。
- PRごとの必須チェックに入れると、外部環境、既存データ、権限、ネットワーク状態に影響されやすい。

方針:

- `test:uat` は手動実行、夜間実行、またはステージングデプロイ後の任意チェックに寄せる。
- 通常CIの `npx playwright test` には含めない。
- UATで作成するデータは一意なprefixを付け、後で識別しやすくする。

## 推奨作業順

1. `resetDb` に `approval_routes` 再seedを追加する。
2. reset後に承認ルートが存在することを軽いテストまたはスキーマ確認ステップで検証する。
3. `order.spec.js` / `purchaseOrder.spec.js` の発注起票・請求対象化前提を `承認済み` に揃える。
4. `invoice.spec.js` の確定前提を `承認済み` に揃える。
5. `payment.spec.js` の承認依頼・承認フローが、承認ルート再seed後に通るか確認する。
6. `page-size.spec.js` / `explore-et04-master.spec.js` の固定件数・ページング前提を修正する。
7. ローカルで対象specを分割実行する。
8. 最後にE2E全体を通し実行し、GitHub Actionsを再実行する。

## 確認コマンド案

個別確認:

```bash
npx playwright test e2e/order.spec.js e2e/purchaseOrder.spec.js --workers=1
npx playwright test e2e/invoice.spec.js e2e/payment.spec.js --workers=1
npx playwright test e2e/page-size.spec.js e2e/explore-et04-master.spec.js --workers=1
```

通し確認:

```bash
npx playwright test --workers=1
```

CI相当の前提確認:

```bash
npm ci
npm run db:migrate
node scripts/seed-e2e.js
npx playwright test
```

## 判定基準

修正完了の判定は、単にE2Eが一度通ることではなく、以下を満たすこと。

- PostgreSQLモードでE2E対象サーバーが起動している。
- 各テスト前のreset失敗が即座に検知される。
- reset後に主要seedと `approval_routes` と `sequence_counters` が初期状態に戻る。
- 承認ワークフロー後の現行仕様にテスト期待値が揃っている。
- 固定件数・固定採番への依存が、必要最小限に抑えられている。
