# 第5期 QA-F 作業記録・判明事実

作成日: 2026-05-06  
対象: QA-F の P10-RT-02 着手から中断までの記録

---

## 1. 実施した作業

### 1.1 P10-RT-02: 各画面バリデーション E2E の棚卸し

既存 8 ファイルを確認した結果:

| ファイル | 棚卸し結果 | 対応 |
|---------|-----------|------|
| `e2e/invoice.spec.js` | P10-RT-02 ブロック既存 | 追加不要 ✅ |
| `e2e/customer-master.spec.js` | P10-RT-02 ブロック既存 | 追加不要 ✅ |
| `e2e/payment.spec.js` | バリデーションテスト 3 本散在 | 十分と判断、追加不要 ✅ |
| `e2e/delivery.spec.js` | バリデーションテスト 1 本散在 | 十分と判断、追加不要 ✅ |
| `e2e/quotation.spec.js` | バリデーションブロックなし | 3 本追加 ✍️ |
| `e2e/order.spec.js` | バリデーションブロックなし | 2 本追加 ✍️ |
| `e2e/purchaseOrder.spec.js` | バリデーションブロックなし | 3 本追加 ✍️ |
| `e2e/supplier-master.spec.js` | バリデーションブロックなし | 3 本追加 ✍️ |

### 1.2 追加したテスト（計 11 本）

#### `e2e/quotation.spec.js` — describe: `P10-RT-02 見積バリデーション`（3 本）
- `should show 案件は必須です error when project is not selected on submit`
- `should show 発行日は必須です error when issue date is empty on submit`
- `should show all required field errors simultaneously when form is submitted completely empty`

エラーメッセージの根拠: `app.js` の quotation バリデーションルール  
- `projectCode` → `案件は必須です。`  
- `issueDate` → `発行日は必須です。`  
- `title` → `見積件名は必須です。`

#### `e2e/order.spec.js` — describe: `P10-RT-02 受注承認依頼バリデーション`（2 本）
- `should show alert with attachment required message when submitting approval without attachment`
- `should keep 受注済み status when approval is blocked by missing attachment`

特記: 受注のバリデーションは `alert()` を使用（`.field-error` ではない）。  
対象データ: ORD-00001（status=受注済み, attachments=[]）。

#### `e2e/purchaseOrder.spec.js` — describe: `P10-RT-02 発注バリデーション`（3 本）
- `should show 発注件名は必須です error when title is empty for standalone purchase order`
- `should show all required field errors simultaneously when standalone purchase order form is submitted empty`
- `should clear field errors and succeed after correcting all required fields`

エラーメッセージ: `発注件名は必須です。` / `仕入先は必須です。` / `発注日は必須です。`

#### `e2e/supplier-master.spec.js` — describe: `P10-RT-02 仕入先マスタ バリデーション`（3 本）
- `should show 仕入先名は必須です error when name is empty on submit`
- `should show multiple field errors simultaneously when all required fields are empty on submit`
- `should show 仕入先コードはすでに使用されています error when duplicate code is entered`

---

## 2. テスト実行結果

### 実行 1 回目（supplier-master.spec.js 単体、--grep P10-RT-02）
- 3 本全て失敗（約 37 秒でタイムアウト）
- 失敗個所: `beforeEach` の `[data-route="master"]` click が見つからない
- サーバー側に `ERR_HTTP_HEADERS_SENT` エラーが発生し、Node.js プロセスがクラッシュ

### 実行 2 回目（同上）
- サーバーが起動直後にクラッシュ → `Process from config.webServer was not able to start. Exit code: 1`

### 実行 3 回目（`server/app.js` に `return` 追加後）
- **1 本目 PASS**（`仕入先名は必須です`）
- 2 本目・3 本目 FAIL（サーバーがまだクラッシュ、ログイン後ナビが表示されない）

---

## 3. 判明した事実（バグ）

### 3.1 バグの場所

サーバーに**3箇所**、同じパターンのバグがある:

| ファイル | 箇所 | 症状 |
|---------|-----|------|
| `server/app.js:87` | `authenticate` デコレータの `catch` ブロック | JWT 検証失敗時に `reply.send(401)` を呼んで `return` しない |
| `server/plugins/authorization.js:8` | `requirePermission` の権限チェック | 権限不足時に `reply.send(403)` を呼んで `return` しない |
| `server/plugins/csrf.js:13` | CSRF チェック | Origin 不一致時に `reply.send(403)` を呼んで `return` しない |

### 3.2 Fastify v5 における根本原因

**Fastify v4 → v5 の破壊的変更**:

Fastify v5 では `reply.sent` が **getter** に変わった:

```javascript
// Fastify v5: reply.js
sent: {
  get () {
    return (this[kReplyHijacked] || this.raw.writableEnded) === true
  }
}
```

`writableEnded` は Node.js が HTTP レスポンスのストリームを **実際に閉じた後** にのみ `true` になる（非同期）。

**クラッシュの発生メカニズム**:

1. `preHandler`（例: `authenticate`）が `reply.code(401).send(error)` を呼ぶ
2. `reply.send()` は非同期パイプライン（`onSend` フック群 → `onSendEnd`）を開始するが、`writableEnded` はまだ `false`
3. Fastify v5 の `hookRunnerGenerator` は `handleResolve()` で `next()` を無条件に呼ぶ（`reply.sent` チェックなし）
4. `routeHandler` が起動し、戻り値を `reply.send()` で送信しようとする
5. `reply.sent` がまだ `false` なので guard は通過 → 2本目の `onSend` パイプラインが並走
6. 1本目: `onSendEnd` → `writeHead()` → ヘッダー書き込み完了
7. 2本目: `onSendEnd` → `writeHead()` → `ERR_HTTP_HEADERS_SENT` をスロー
8. Fastify が例外を再スローし、Node.js プロセスがクラッシュ

**v4 との差異**:

- v4: `reply.sent` は同期的に `true` がセットされるプロパティだったため、route handler の `reply.send()` が guard で弾かれた
- v5: `reply.sent` は非同期 getter になったため、上記の `return` なしコードで二重送信が発生する

### 3.3 正しい修正パターン（Fastify v5）

Fastify v5 では preHandler でレスポンスを送って処理を止めるには、`reply.hijack()` を使う必要がある:

```javascript
// 修正前（Fastify v4 では動作するが v5 ではクラッシュ）
reply.code(401).send({ error: { message: '...' } });

// 修正後: hijack() で writableEnded を待たず即座に sent=true にする
reply.hijack();
reply.raw.statusCode = 401;
reply.raw.setHeader('content-type', 'application/json; charset=utf-8');
reply.raw.end(JSON.stringify({ error: { message: '...' } }));
```

あるいは、エラーオブジェクトに `statusCode` を付けて `throw` する方式:

```javascript
const err = new Error('認証が必要です');
err.statusCode = 401;
throw err;
```

この場合、Fastify の `handleReject` がエラーハンドラーに渡すため route handler は呼ばれない。

### 3.4 既実施の修正（不十分）

`server/app.js` の catch ブロックに `return` を追加した（line 87）:
```javascript
// 現在の状態（return を追加済み）
} catch {
  return reply.code(401).send({ error: { message: '認証が必要です' } });
}
```

**なぜ不十分か**: `return` しても Fastify v5 の `handleResolve` は戻り値を無視して `next()` を呼ぶため、route handler の実行を止められない。

---

## 4. 次のアクション（チームへの引き継ぎ事項）

### 4.1 優先度：最高 — サーバークラッシュ修正（BE 担当）

以下 3 箇所を **Fastify v5 対応パターン**（`reply.hijack()` または `throw`）で修正すること。

| ファイル | 対象コード |
|---------|---------|
| `server/app.js` `authenticate` デコレータ | catch ブロック（line 87）+ session revoked チェック（line 82）|
| `server/plugins/authorization.js` `requirePermission` | 権限不足ブロック（line 8） |
| `server/plugins/csrf.js` CSRF チェック | Origin 不一致ブロック（line 13） |

修正後、既存の全バックエンドテストが通過することを確認してから E2E に進むこと。

### 4.2 優先度：高 — P10-RT-02 E2E の全件実行（QA-F）

サーバークラッシュ修正後に、以下の 11 本テストを実行して全通過を確認:

```bash
npx playwright test e2e/supplier-master.spec.js e2e/quotation.spec.js e2e/order.spec.js e2e/purchaseOrder.spec.js --grep "P10-RT-02" --reporter=line
```

### 4.3 P10-RT-04 / P10-RT-05 は後続

- P10-RT-04（発注→納品→請求データ連鎖）: サーバー修正・P10-RT-02 完了後
- P10-RT-05（大量データ・ページネーション）: INF-08 完了待ち
