# 取引管理システム 第6期実装計画

策定日: 2026-05-06（コード実態確認に基づき同日改訂）

入力ドキュメント:
- `implementation_plan-5.md` — 第5期計画
- `implementation_plan-5.1.md` — QA-E 着手調査（Day1 実施）
- `implementation_plan-5.2.md` — QA-F 着手調査・P10-RT-02 実装記録（Day1 実施）
- コード実態調査（2026-05-06 実施）— server/routes/*, server/db/paginate.js, e2e/*.spec.js

---

## 1. 完了確認済みタスク（第5期〜第6期 Day1 実績）

| タスク | 担当 | 根拠 |
|-------|------|------|
| INF-10: DBトランザクション境界 | チームB + チームC1 + チームA | commit e7ac2e8 / M7-3達成 |
| INF-07: DBインデックス設計・クエリ最適化 | チームB + SRE-I | commit 4d1eb3c / M7-4達成・SRE-I離脱 |
| INF-08: APIページネーション（12エンドポイント） | チームB + チームC2 + チームA | server/db/paginate.js + 全ルートファイルに paginateArray 適用済み・テスト完備 / M7-1達成 |
| P10-RT-01: 却下→修正→再申請 E2E（全4伝票） | QA-E | quotation/order/purchaseOrder.spec.js + invoice-approval.spec.js に実装済み / M6-6達成 |
| P10-RT-02: バリデーションE2E（全8画面） | QA-F | 各spec追加済み（11件）・サーバー修正後の実行確認のみ残る |
| RT-05: 伝票状態遷移制御 E2E | QA-E + チームE | quotation.spec.js 3件・invoice.spec.js 4件 / BUG修正後の通過確認で完了 |
| P10-RT-05: ページネーション動作確認 E2E | QA-F | zzz-pagination.spec.js 10件実装済み（モックAPI使用） |
| P10-RT-04: 発注→納品→請求のデータ連鎖 E2E（基本部分） | QA-F + QA-I | zzz-data-chain.spec.js 7件実装済み（入金消込シナリオのみ未実装） |

---

## 2. 第5期 Day1 調査で判明した事実（統合・確定版）

### 2.1 E2Eテスト全滅の根本原因：Fastify v5 の破壊的変更

**前回テスト結果（2026-05-05 21:47 実施）**
- Expected（通過）: **18件**
- Unexpected（失敗）: **436件**
- 失敗パターン: 全テストが `beforeEach` で 30秒タイムアウト

**根本原因**: バックエンドサーバーが起動直後にクラッシュする

```
Error [ERR_HTTP_HEADERS_SENT]: Cannot write headers after they are sent to the client
```

**Fastify v4 → v5 の破壊的変更（QA-F 深掘り調査）**:

Fastify v5 では `reply.sent` が**非同期 getter**に変わった:

```javascript
// Fastify v5: reply.js
sent: {
  get () {
    return (this[kReplyHijacked] || this.raw.writableEnded) === true
  }
}
```

`writableEnded` は Node.js がレスポンスストリームを実際に閉じた後にのみ `true` になる（非同期）。
これにより、preHandler で `reply.send()` を呼んでも `return` するだけでは route handler の実行を止められない。

**クラッシュの発生メカニズム**:
1. preHandler が `reply.code(4xx).send(error)` を呼ぶ
2. Fastify v5 の `handleResolve` は戻り値を無視して `next()` を無条件に呼ぶ
3. route handler が起動し、2本目の `reply.send()` を送信しようとする
4. `writableEnded` がまだ `false` のため guard を通過 → 2本目の `onSend` パイプライン並走
5. `onSendEnd` → `writeHead()` → `ERR_HTTP_HEADERS_SENT` → プロセスクラッシュ

**v4 との差異**: v4 では `reply.sent` は同期的に `true` がセットされるプロパティだったため、`return reply.send()` で route handler をブロックできた。

### 2.2 修正が必要な 3 箇所（コード実態確認済み）

| # | ファイル | 現在のコード | 問題 |
|---|---------|------------|------|
| BUG-01 | `server/app.js` line 82, 87 | `return reply.code(401).send(...)` | `return` 追加済みだが Fastify v5 では不十分 |
| BUG-02 | `server/plugins/authorization.js` line 8 | `reply.code(403).send(...)` | `return` すらない |
| BUG-03 | `server/plugins/csrf.js` line 13 | `reply.code(403).send(...)` | `return` すらない |

**正しい修正パターン（Fastify v5 対応）**:

パターンB: `throw` でエラーハンドラーに委譲（**推奨**）

```javascript
const err = new Error('認証が必要です');
err.statusCode = 401;
throw err; // Fastify の handleReject が処理するため route handler は呼ばれない
```

`throw` が推奨される理由: Fastify のエラーパイプライン（handleReject → reply.send(err) → onSend フック）を経由するため、`auditLogPlugin` の `onSend` フックが正常に呼ばれ、認証・認可・CSRF 失敗がすべて監査ログに記録される。

パターンA: `reply.hijack()` で即時終了（**非推奨**）

```javascript
reply.hijack();
reply.raw.statusCode = 401; // または 403
reply.raw.setHeader('content-type', 'application/json; charset=utf-8');
reply.raw.end(JSON.stringify({ error: { message: '...' } }));
```

`reply.hijack()` はプロセスクラッシュを防げるが、Fastify の `onSend` パイプラインを完全にバイパスする。`auditLogPlugin` は `onSend` フックで失敗ログを書くため、認証失敗・認可失敗・CSRF 違反がすべて監査ログから消える。セキュリティ上の観点から採用しないこと。

### 2.3 実装状況スナップショット（2026-05-06 コード確認）

#### P10-RT-01（却下→修正→再申請）— 全4伝票完了

| spec ファイル | 実装状況 |
|---|---|
| `e2e/quotation.spec.js` | ✅ 2件（見積） |
| `e2e/order.spec.js` | ✅ 5件（受注） |
| `e2e/purchaseOrder.spec.js` | ✅ 7件（発注） |
| `e2e/invoice-approval.spec.js` | ✅ 2件（請求） — `P10-RT-01 請求却下→修正→再申請` describe ブロックあり |

#### P10-RT-02（バリデーションE2E）— 全8画面実装済み

| spec ファイル | 実装状況 |
|---|---|
| `e2e/invoice.spec.js` | ✅ `P10-RT-02 請求起票バリデーション` 2件 |
| `e2e/customer-master.spec.js` | ✅ 既存ブロックあり |
| `e2e/payment.spec.js` | ✅ バリデーションテスト 3件 |
| `e2e/delivery.spec.js` | ✅ バリデーションテスト 1件（十分と判断） |
| `e2e/quotation.spec.js` | ✅ `P10-RT-02 見積バリデーション` 3件（QA-F 追加） |
| `e2e/order.spec.js` | ✅ `P10-RT-02 受注承認依頼バリデーション` 2件（QA-F 追加） |
| `e2e/purchaseOrder.spec.js` | ✅ `P10-RT-02 発注バリデーション` 3件（QA-F 追加） |
| `e2e/supplier-master.spec.js` | ✅ `P10-RT-02 仕入先マスタバリデーション` 3件（QA-F 追加） |

#### INF-08（ページネーション）— 全12エンドポイント完了

`server/db/paginate.js` に `paginateArray()` ヘルパーが実装済み。
全ルートファイルで `import { paginateArray } from '../db/paginate.js'` + `page`/`limit` クエリパラメータ対応済み。
各 `.test.js` に `meta.total / page / pageSize / totalPages` の検証テストあり。

#### P10-RT-05（ページネーション E2E）— 実装済み（モック使用）

`e2e/zzz-pagination.spec.js` に `P10-RT-05 複数ページ遷移・件数表示確認` describe ブロック（10件）。
モック API を使用して前端ページネーション UI の動作を検証。
**注意**: 実サーバーを使った「3秒以内」の性能確認は T-13 で別途実施が必要。

---

## 3. 残タスク一覧（第6期対象）

### 3.1 最優先：サーバークラッシュ修正（全E2Eテストのブロッカー）

| ID | タスク | 担当 | 優先度 | 状態 |
|----|-------|------|--------|------|
| BUG-01 | `server/app.js` authenticate デコレータ（line 82, 87）を `throw` パターンに修正 | チームB（BE-D） | 🔴 最高 | ❌ `return reply.send()` のみで不十分 |
| BUG-02 | `server/plugins/authorization.js`（line 8）を `throw` パターンに修正 | チームB（BE-D） | 🔴 最高 | ❌ `return` も欠落 |
| BUG-03 | `server/plugins/csrf.js`（line 13）を `throw` パターンに修正 | チームB（BE-D） | 🔴 最高 | ❌ `return` も欠落 |

修正後に既存バックエンドテスト全件通過を確認してから E2E に進むこと。

---

### 3.2 QA・E2Eテスト

| ID | タスク | 担当 | 優先度 | 状態 |
|----|-------|------|--------|------|
| T-01 | BUG 修正後に全テスト再実行・残失敗テストを特定・修正 | QA-E | 🔴 最高 | ❌ BUG修正待ち |
| P10-RT-02 | 全11件を実行して通過確認 | QA-F | 🔴 最高 | △ 実装済み・BUG修正待ち |
| RT-05 | BUG 修正後の通過確認（実装済み） | QA-E | 🟠 高 | △ 実装済み・BUG修正待ち |
| P10-RT-04（追加） | 入金登録→消込完了シナリオを `zzz-data-chain.spec.js` に追加 | QA-F + QA-I | 🟠 高 | △ 7件実装済み・入金消込のみ未実装 |
| T-13 | 全E2Eテストパス + 性能要件確認（一覧3秒以内） | QA 全員 | 🔴 最高 | ❌ 全タスク完了後 |

---

## 4. タスク詳細

### BUG-01/02/03: Fastify v5 preHandler 二重送信修正

#### `server/app.js` — authenticate デコレータ（BUG-01）

修正対象: line 82（session revoked チェック）と line 87（catch ブロック）の 2箇所

```javascript
// 修正前（現状）
return reply.code(401).send({ error: { message: '認証が必要です' } });

// 修正後（line 82: session revoked チェック）
const err = new Error('認証が必要です');
err.statusCode = 401;
throw err;

// 修正後（line 86〜88: catch ブロック全体）
// 注意: catch 節では jwtVerify が投げた内部エラーを握りつぶし、
//       固定メッセージの新規エラーを投げ直す。
//       statusCode 付きエラーはそのまま再スロー、それ以外は 401 に統一する。
} catch (e) {
  if (e.statusCode) throw e;
  const err = new Error('認証が必要です');
  err.statusCode = 401;
  throw err;
}
```

#### `server/plugins/authorization.js` — requirePermission（BUG-02）

修正対象: line 8

```javascript
// 修正前（現状）
reply.code(403).send({ error: { message: '権限がありません' } });

// 修正後
const err = new Error('権限がありません');
err.statusCode = 403;
throw err;
```

#### `server/plugins/csrf.js` — CSRF チェック（BUG-03）

修正対象: line 13

```javascript
// 修正前（現状）
reply.code(403).send({ error: { message: 'CSRF: リクエスト元が許可されていません' } });

// 修正後
const err = new Error('CSRF: リクエスト元が許可されていません');
err.statusCode = 403;
throw err;
```

TDD: 追加テスト不要。既存バックエンドテストが全件グリーンになることで回帰確認とする。
ただし注意: 既存の `authorization.test.js` / `csrf.test.js` は `app.inject()` を使うため
Fastify の実ストリームを通らず、二重送信バグ自体は再現しない。
ステータスコードの正しさ（403/401 が返ること）は検証できるが、クラッシュしないことは
E2E テスト（T-01）で最終確認する。

---

### P10-RT-04（追加）: 入金登録→消込完了シナリオ

**ファイル**: `e2e/zzz-data-chain.spec.js`（既存 describe ブロックに追加）

既存 7件は発注→納品フロー + 請求金額整合性を検証済み。以下のシナリオが未実装:

```
test('should mark invoice as 消込済 after full payment receipt', async ({ page }) => {
  // Arrange: INV-00003（下書き）を確定状態にする
  // Act: 入金を登録し消込処理を実行する
  // Assert: 請求ステータスが '消込済' になること
})

test('should show remaining balance after partial payment', async ({ page }) => {
  // Arrange: 一部入金を登録する
  // Assert: 未収残高が正しく表示されること
})
```

使用可能なシードデータ:
- `INV-00001`: 確定済み（消込テストに使用可）
- `receipt.spec.js` / `receipt-edge.spec.js` の既存実装を参照して整合させること

---

### T-01: BUG修正後の全テスト再実行・残失敗修正

```bash
# ステップ1: ログインテストのみで BUG 修正確認
npx playwright test e2e/login.spec.js --reporter=list

# ステップ2: 全スイート実行して失敗テストを特定
npx playwright test --reporter=list

# ステップ3: 残失敗テストをリストアップしてフロント/バックの不整合を修正
```

---

### P10-RT-02: 通過確認

BUG 修正後に以下を実行し、11本全通過を確認:

```bash
npx playwright test e2e/supplier-master.spec.js e2e/quotation.spec.js e2e/order.spec.js e2e/purchaseOrder.spec.js --grep "P10-RT-02" --reporter=line
```

---

### T-13: 全E2Eテストパス + 性能要件確認

**前提**: BUG-01/02/03、T-01、P10-RT-02/04/RT-05 すべて完了後

**作業手順**:
1. `npx playwright test` を全 spec 対象で実行
2. 全テスト 0件失敗を確認
3. 主要一覧画面（見積・受注・請求）の初期表示 3秒以内を手動確認
   - P10-RT-05 の E2E はモック使用のため、ここで実サーバーでの性能を確認する
4. M5-Final チェックリスト（F-1〜F-6）を全項目確認・記録

---

## 5. チーム構成（第6期）

| チーム | 第6期担当スコープ | 状態 |
|-------|---------------|------|
| チームB（BE-D） | BUG-01/02/03 修正（最優先）→ 完了後離脱 | 継続（短期） |
| QA-E | T-01（全テスト再実行・残失敗修正）→ RT-05 通過確認 → T-13支援 | 継続 |
| QA-F | P10-RT-02 通過確認（BUG修正後）→ P10-RT-04 入金消込追加 → T-13 | 継続 |
| QA-I | P10-RT-04 入金消込サポート → T-13 全スイート実行・集計 | 継続 |
| チームE（FE-K） | T-01 で発見するフロントバグ修正（随時・QA-Eと連携）→ T-13 | 継続 |
| QA-H | T-13 最終確認支援（完了済みspec回帰確認・結果集計） | 継続 |
| チームC2（BE-H） | INF-08完了・離脱済み | ✅ 離脱 |
| チームA（BE-C） | INF-08完了・離脱済み | ✅ 離脱 |
| チームC1（BE-G） | INF-10完了・離脱済み | ✅ 離脱 |
| SRE-I | INF-07完了・離脱済み | ✅ 離脱 |
| チームD（FE-A+FE-B） | 全タスク完了・離脱済み | ✅ 離脱 |

---

## 6. マイルストーン（第6期）

### M7: バックエンド基盤完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M7-1 | INF-08 全一覧APIにページネーション実装済み | チームB + チームC2 + チームA | ✅ **達成済み** |
| M7-2 | INF-09 採番競合制御が機能する | チームB | ✅ 達成済み |
| M7-3 | INF-10 複数テーブル更新が1トランザクションで実行される | チームB + チームC1 + チームA | ✅ 達成済み |
| M7-4 | INF-07 インデックス適用後の一覧表示3秒以内をEXPLAIN確認 | チームB + SRE-I | ✅ 達成済み |
| M7-5 | INF-04/05 Pinoログ出力・ヘルスチェック動作確認 | チームC1 | ✅ 達成済み |

**M7 は全項目達成済み。**

### M6: 残E2E完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M6-6 | P10-RT-01 却下→再申請E2Eが4伝票でパス | QA-E | ✅ **達成済み**（invoice-approval.spec.js 確認） |
| M6-7 | P10-RT-02 バリデーションE2Eが各画面specに追加・パス | QA-F | △ 実装済み・BUG修正後の通過確認が残る |
| M6-8 | P10-RT-03/04 追加E2Eがパス | QA-H / QA-F + QA-I | P10-RT-03: ✅ / P10-RT-04: △ 入金消込シナリオ未実装 |

### M10: UX・テスト強化完了

| # | 確認項目 | 担当 | 進捗 |
|---|---------|------|------|
| M10-1 | UX-01 全画面でローディング・トースト・エラーが表示される | チームD + チームE | ✅ 達成済み |
| M10-2 | RT-01〜RT-06 全新規E2Eがパス | QA-H + QA-I | RT-01/02/03/04/06 ✅ / RT-05 △ 実装済み・BUG修正後通過確認待ち |
| M10-3 | AT-01 ログイン429・停止401のAPIテストがパス | QA-H | ✅ 達成済み |

### M5-Final: 本番リリース準備完了

| # | 確認項目 | 状態 |
|---|---------|------|
| F-1 | M6〜M10 の全確認項目が満たされている | △ M6-7/8・M10-2 のBUG修正後通過確認が残る |
| F-2 | T-13: 全E2Eテストがゼロ退行でパスする | ❌ 未実施 |
| F-3 | 主要一覧画面の初期表示が3秒以内 | △ INF-08実装済み・T-13で実測確認が必要 |
| F-4 | HTTPS通信・CSPヘッダー・レートリミット・認可が全て機能する | ✅ 達成済み |
| F-5 | CI/CD パイプラインがmainブランチで自動実行されている | ✅ 達成済み |
| F-6 | バックアップスクリプトが本番環境で設定済み | ✅ 達成済み |

---

## 7. 依存関係と並行実行マップ

```
2026-05-06 第6期起点
│
├─[チームB] ── BUG-01/02/03 修正（最優先・全E2Eのブロッカー）──→ 離脱
│               └─[BE確認] 既存バックエンドテスト全件通過
│                    │
│                    ├─[QA-E] T-01 全E2E再実行・残失敗修正
│                    │         └─[QA-E + チームE] RT-05 通過確認
│                    │
│                    └─[QA-F] P10-RT-02 通過確認（11件）
│                              └─[QA-F + QA-I] P10-RT-04 入金消込追加
│
└─[T-13] ← T-01 + P10-RT-02 + P10-RT-04 + RT-05 完了後 ──→ M5-Final ✅

直列依存ゲート:
  BUG-01/02/03修正  → T-01（全テスト再実行）→ 残失敗修正
  T-01・P10-RT-02・P10-RT-04・RT-05 全完了 → T-13（最終E2E + 性能確認）→ M5-Final
```

---

## 8. 即着手リスト（第6期 Day 1）

### 最優先: チームB（BE-D）— BUG-01/02/03 修正

```
1. server/app.js（line 82, 87）
   → return reply.code(401).send() を throw パターンに置き換え（2箇所）
   → line 82: throw err（statusCode = 401）
   → catch ブロック(line 86〜88): catch(e) に変更し、statusCode 付きは再スロー、それ以外は throw err

2. server/plugins/authorization.js（line 8）
   → reply.code(403).send() を throw パターンに置き換え

3. server/plugins/csrf.js（line 13）
   → reply.code(403).send() を throw パターンに置き換え

4. npx vitest run（または npm test）で既存バックエンドテスト全件グリーンを確認
   （inject モードなので二重送信クラッシュは再現しないが、403/401 返却の正しさは検証できる）
```

### BUG修正後: QA-E — T-01 全テスト再実行

```bash
# ログインテストで動作確認
npx playwright test e2e/login.spec.js --reporter=list

# 全スイート実行
npx playwright test --reporter=list

# 残失敗テストを修正してチームEに連携
```

### BUG修正後: QA-F — P10-RT-02 通過確認

```bash
npx playwright test e2e/supplier-master.spec.js e2e/quotation.spec.js e2e/order.spec.js e2e/purchaseOrder.spec.js --grep "P10-RT-02" --reporter=line
```

### BUG修正後（並行）: QA-F + QA-I — P10-RT-04 入金消込シナリオ追加

`e2e/zzz-data-chain.spec.js` の既存 describe ブロックに入金登録→消込完了テストを追加。
`e2e/receipt.spec.js` / `receipt-edge.spec.js` の実装を参照して整合させること。

---

## 9. スケジュール（第6期）

```
（凡例: △=着手・確認待ち  ✅=完了  ❌=未着手）

        N日（Day1）    N+1    N+2    N+3
チームB ├─BUG修正──┤ 離脱
                  ↑即日完了を目標

QA-E    ├─T-01（全テスト再実行・残失敗修正）──────┤RT-05確認─┤T-13支援─┤
                  ↑BUG修正後                                ✅M10-2

QA-F    ├─P10-RT-02確認─┤P10-RT-04入金消込追加──┤T-13──────────────────┤
                        ↑BUG修正後               ↑QA-Iと並行  ✅M6-7/8

チームE ├─T-01 フロントバグ修正対応（随時・QA-Eと連携）──────→ T-13フロントバグ─┤

QA-H    ├─T-13最終確認支援（全specパス確認・結果集計）────────────────────────┤

QA-I    ├─P10-RT-04入金消込サポート──────────→ T-13最終確認────────────────┤

【T-13】 ← BUG修正 + T-01 + P10-RT-02/04 + RT-05 完了後 ──→ M5-Final ✅
```

---

## 10. 工数見積もり（第6期）

| タスク | チームB | チームE | QA-E | QA-F | QA-H | QA-I |
|-------|--------|--------|------|------|------|------|
| BUG-01/02/03 | 0.5日 | — | — | — | — | — |
| T-01（全テスト再実行・修正） | — | 随時 | 1日 | — | — | — |
| P10-RT-02（通過確認） | — | — | — | 0.5日 | — | — |
| P10-RT-04（入金消込追加） | — | — | — | 0.5日 | — | 0.5日 |
| RT-05（通過確認） | — | 随時 | 0.5日 | — | — | — |
| T-13（最終E2E + 性能確認） | — | 随時 | 1日 | 1日 | 1日 | 1日 |
| **合計** | **0.5日** | **随時** | **2.5日** | **2日** | **1日** | **1.5日** |

**カレンダー日数目標: 約3〜4日（BUG修正から M5-Final 達成まで）**
