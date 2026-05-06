# 取引管理システム 第6期実装計画

策定日: 2026-05-06

入力ドキュメント:
- `implementation_plan-5.md` — 第5期計画
- QA-E着手調査（2026-05-06 第5期 Day1 実施）

---

## 1. 第5期 Day1 調査で判明した事実

### 1.1 E2Eテスト全滅の根本原因：バックエンドサーバーのクラッシュ

**前回テスト結果（2026-05-05 21:47 実施）**
- Expected（通過）: **18件**
- Unexpected（失敗）: **436件**
- Skipped: 88件
- 失敗パターン: 全テストが `beforeEach` フックで30秒タイムアウト

**原因**: `Process from config.webServer was not able to start. Exit code: 1`

Playwright は playwright.config.js の `webServer` 設定でサーバーを自動起動するが、
バックエンドサーバー（`npm run server` → `node server/index.js`）が起動直後にクラッシュする。

**クラッシュエラー内容**:
```
Error [ERR_HTTP_HEADERS_SENT]: Cannot write headers after they are sent to the client
    at ServerResponse.writeHead (node:_http_server:352:11)
    at safeWriteHead (fastify/lib/reply.js:566:9)
    at onSendEnd (fastify/lib/reply.js:631:5)
    at wrapOnSendEnd (fastify/lib/reply.js:559:5)
    at next (fastify/lib/hooks.js:292:7)
    at handleResolve (fastify/lib/hooks.js:309:5)
```

サーバー起動後、Playwright が `http://localhost:3000/api/auth/me` にヘルスチェックを送った直後に発生。

### 1.2 バグ箇所（T-01 修正対象）

**バグ1: `server/plugins/authorization.js:8`**

```javascript
// 現在（バグあり）
if (!userPermissions.includes(permission)) {
  reply.code(403).send({ error: { message: '権限がありません' } });
  // return が欠落 → 関数が正常終了扱いになりルートハンドラも実行される
}
```

`reply.send()` の後に `return` がないため、Fastify は preHandler が正常終了したと判断し、
後続のルートハンドラも実行してしまう。結果、2回レスポンスを送ろうとして `ERR_HTTP_HEADERS_SENT` が発生。

**バグ2: `server/plugins/csrf.js:13`**

```javascript
// 現在（バグあり）
if (!allowedOrigins.includes(origin)) {
  reply.code(403).send({ error: ... });
  // return が欠落 → 同じ問題
}
```

同様に `return` が欠落している。

**修正方針**: 両ファイルの `reply.send()` 呼び出し直前に `return` を追加する。

```javascript
// 修正後
return reply.code(403).send({ error: ... });
```

---

### 1.3 spec ファイルの実装状況調査結果

#### 実装済み（テスト記述あり）

| spec ファイル | P10-RT-01（却下→再申請） | RT-05（状態遷移制御） | P10-RT-02（バリデーション） |
|---|---|---|---|
| `quotation.spec.js` | ✅ 2テスト（見積） | ✅ 3テスト（取消済み見積） | 一部あり |
| `order.spec.js` | ✅ 5テスト（受注） | — | 一部あり |
| `purchaseOrder.spec.js` | ✅ 7テスト（発注） | — | ✅ 3テスト |
| `invoice.spec.js` | **❌ 未実装** | ✅ 4テスト（確定済み請求） | ✅ 2テスト |

#### 未実装（追加が必要）

- `invoice.spec.js` に **P10-RT-01（請求 却下→修正→再申請）** が存在しない

---

### 1.4 invoice P10-RT-01 実装に必要な情報

**シードデータ**:
- `INV-00005`: 承認依頼中（P10-RT-01 テスト用途に使用可）
- `INV-00006`: 確定（RT-05 テスト用途）

**請求の承認フロー**（他伝票と異なる点）:
- 承認後ステータスは **`確定`**（他は `承認済み`）
- `submitInvoiceApproval`: `下書き` → `承認依頼中`（`下書き` 以外は 400 エラー）
- `approveInvoice`: `承認依頼中` → `確定`
- `rejectInvoice`: `承認依頼中` → `却下`
- 下書きに戻す: `PATCH /api/invoices/:code` に `{ status: '下書き' }` を送る

**フロントエンド ボタン ID**:
| ボタン | ID |
|---|---|
| 承認依頼ボタン | `#invoice-submit-approval-btn` |
| 承認するボタン | `#invoice-approve-btn` |
| 却下ボタン | `#invoice-reject-btn` |
| 下書きに戻すボタン | `#invoice-return-draft-btn` |
| 却下確定ボタン | `#approval-confirm-reject` |
| 承認確定ボタン | `#approval-confirm-approve` |
| 却下理由入力 | `#approval-comment-input` |

**承認画面との対応**:
- 承認一覧から請求を開く: `[data-action-detail-approval="請求:INV-00005"]`
- 請求一覧の詳細ボタン: `[data-action-detail-invoice="INV-00005"]`

---

## 2. 残タスク一覧（第6期対象）

### 2.1 最優先：サーバークラッシュ修正（全テストのブロッカー）

| ID | タスク | 担当 | 優先度 | 状態 |
|----|-------|------|--------|------|
| BUG-01 | `server/plugins/authorization.js` の `return` 欠落修正 | チームC1（BE-G）または QA-E | 🔴 最高 | ❌ 未修正 |
| BUG-02 | `server/plugins/csrf.js` の `return` 欠落修正 | 同上 | 🔴 最高 | ❌ 未修正 |

**修正後に `npx playwright test e2e/login.spec.js` で動作確認してから全テスト実行**

---

### 2.2 QA・E2Eテスト（第5期からの継続）

| ID | タスク | 担当 | 優先度 | 状態 |
|----|-------|------|--------|------|
| T-01 | BUG-01/02 修正後に全テスト再実行・残失敗テストを特定・修正 | QA-E | 🔴 最高 | ❌ BUG修正待ち |
| P10-RT-01 | 請求 却下→修正→再申請 E2E（`invoice.spec.js` への追加） | QA-E | 🔴 最高 | ❌ 未実装 |
| P10-RT-02 | 各画面バリデーションE2Eの分散追加（8ファイル確認・補完） | QA-F | 🔴 最高 | ❓ 移植状況未確認 |
| P10-RT-04 | 発注→納品→請求のデータ連鎖整合性 E2E | QA-F + QA-I | 🟠 高 | △ 部分着手 |
| RT-05 | 伝票状態遷移制御 E2E | QA-E + チームE | 🟠 高 | ✅ quotation/invoice に実装済み |
| T-13 | 全E2Eテストパス + 性能要件確認 | QA 全員 | 🔴 最高 | ❌ 全開発完了後 |

### 2.3 インフラ基盤（第5期からの継続）

第5期 `implementation_plan-5.md` セクション2.1 参照。INF-10 → INF-07 → INF-08 の順に着手。

---

## 3. 即着手リスト（第6期 Day 1）

### 最優先: BUG-01/02 サーバークラッシュ修正

```
# server/plugins/authorization.js (line 8)
# 修正: reply.code(403).send() の前に return を追加

# server/plugins/csrf.js (line 13)
# 修正: reply.code(403).send() の前に return を追加
```

### 修正後の動作確認手順

```
1. npx playwright test e2e/login.spec.js --reporter=list
   → ログインテストが全通過すれば BUG 修正成功

2. npx playwright test --reporter=list
   → 全スイートを実行して通過数・失敗数を確認

3. 残失敗テストをリストアップし、フロント/バックの不整合原因を特定・修正
```

### QA-E: P10-RT-01 請求テスト追加（BUG修正後）

`e2e/invoice.spec.js` の末尾に以下の describe ブロックを追加:

```
test.describe('P10-RT-01 請求却下→修正→再申請フロー', () => {
  // INV-00005（承認依頼中）を対象にする
  // 却下 → 下書きに戻す → 再申請 → 承認（確定へ）の 5 シナリオ
})
```

---

## 4. RT-05 完了確認

第5期計画の RT-05 シナリオは以下のとおり既存 spec に実装済み:
- `quotation.spec.js`: `describe('RT-05 伝票状態遷移制御 - 取消済み見積', ...)` — 3テスト
- `invoice.spec.js`: `describe('RT-05 伝票状態遷移制御 - 確定済み請求', ...)` — 4テスト

BUG-01/02 修正後のテスト実行で通過を確認すれば RT-05 は完了とみなせる。

---

## 5. チーム構成（第6期）

| チーム | 担当スコープ |
|-------|------------|
| チームC1 または QA-E | BUG-01/02 サーバープラグイン修正（最優先） |
| QA-E | T-01（全テスト再実行・修正） → P10-RT-01（invoice）→ T-13支援 |
| QA-F | P10-RT-02 補完 → P10-RT-04 充実 → P10-RT-05（INF-08後） |
| チームB + チームC1 + チームA | INF-10（DBトランザクション） → INF-07 → INF-08（第5期計画継続） |
| その他 | 第5期計画のチーム再配置を継続 |

---

## 6. 依存関係メモ

```
BUG-01/02 修正
  └─ T-01（全テスト再実行）
       └─ 残失敗テスト修正
            └─ P10-RT-01（invoice 追加）
                 └─ T-13（全スイート最終確認）
```

P10-RT-05（ページネーション E2E）は INF-08 完了まで着手不可（第5期計画と同じ）。
