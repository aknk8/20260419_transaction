# E2Eテスト修正レビュー（2026-05-29）

## 対象

- Commit: `f88e6138cbb36f832ad928d04eace3d028a96aae`
- Commit message: `fix(e2e): テストごとのDB reset機構を導入し設定デフォルト値を修正`

## レビュー観点

- 過去にCI失敗した原因を潰し込めているか
- 本番環境がPostgreSQLであることを考慮したつくりになっているか

## 結論

今回の修正は、in-memory実行時のE2Eテスト間データ汚染には一定効果がある。
また、設定画面の期待値と `settingsRepository` のデフォルト値不一致は解消されている。

ただし、過去CI失敗の本質が「PostgreSQL DBを共有したままテスト間で状態が持ち越されること」であるなら、現状の修正は不十分。
PostgreSQLモードでは今回追加されたreset機構が主要テーブルに効かないため、本番相当のDB構成を考慮したつくりにはなっていない。

## 指摘事項

### P1: PostgreSQLモードではresetが実質効かない

`server/index.js` の `resetAll()` は、各リポジトリに `reset()` が存在する場合だけ呼び出す。

```js
for (const repo of repos) {
  if (typeof repo.reset === 'function') repo.reset();
}
```

しかし今回 `reset()` が追加されたのはin-memoryリポジトリ側だけで、DBリポジトリ側には追加されていない。
例えば `createCustomerRepository(db)` や `createSequenceCounterRepository(db)` には `reset()` がない。

そのため、PostgreSQL接続でサーバーを起動した場合、`POST /api/test/reset` は `204` を返しても、顧客・見積・受注・発注・請求・支払・採番などのDB状態はリセットされない。

これは過去CI失敗の主因だった「テスト間でDB状態が残る」問題をPostgreSQLでは潰せていないことを意味する。

### P1: CIのバックエンド起動がPostgreSQLを使っていない

`.github/workflows/ci.yml` では、migrationとスキーマ確認には `DATABASE_URL` を渡している。

一方で、バックエンドサーバー起動ステップには `DATABASE_URL` が渡されていない。

```yaml
- name: バックエンドサーバー起動
  run: node server/index.js &
  env:
    NODE_ENV: test
    PORT: 3000
    JWT_SECRET: ci-test-secret-not-for-production
    CORS_ORIGIN: http://localhost:5173
    RATE_LIMIT_MAX: 1000
    LOG_LEVEL: warn
```

`server/index.js` は `process.env.DATABASE_URL` の有無でDBリポジトリとin-memoryリポジトリを切り替える。
現在のCIでは、PostgreSQL serviceとmigrationを用意していても、実際のE2E対象サーバーはin-memoryモードで起動する。

この状態でE2Eが通っても、「PostgreSQL本番相当でE2Eが通る」ことの検証にはならない。

### P2: fixtureがreset失敗を検知していない

`e2e/fixtures.js` はreset APIの戻り値を確認していない。

```js
await request.post('http://localhost:3000/api/test/reset');
await use();
```

このため、reset endpointが未登録、404、500、DB reset失敗、ポート違いなどが起きても、テストはそのまま続行される。
テスト前提が壊れた状態で後続のUI操作が失敗し、原因調査が難しくなる。

少なくとも以下のようにステータスを検証すべき。

```js
const response = await request.post('http://localhost:3000/api/test/reset');
expect(response.status()).toBe(204);
await use();
```

## 良い点

- 全E2E specが `./fixtures.js` 経由の `test` / `expect` インポートに統一されている。
- in-memoryリポジトリには `reset()` が追加されており、ローカルのin-memory E2Eではテスト間の状態持ち越しを抑制できる。
- `settingsRepository` のデフォルト値が `settings.spec.js` の期待値に揃えられている。
- `/api/test/reset` は `NODE_ENV !== 'production'` のときだけ登録されるため、本番環境に直接露出しない配慮はある。

## 推奨対応

優先度順に以下を対応する。

1. CIのバックエンド起動ステップに `DATABASE_URL` を渡し、E2E対象サーバーをPostgreSQLモードで起動する。
2. PostgreSQL用のreset処理を実装する。候補は `TRUNCATE ... RESTART IDENTITY CASCADE` とseed再投入、またはテスト専用DBの再作成。
3. `sequence_counters` もseed初期値に戻す。固定採番期待のE2Eが残っているため、採番リセットは必須。
4. `e2e/fixtures.js` でreset APIのHTTP statusを検証し、失敗時は即座にテストを落とす。
5. reset APIの有効条件を `NODE_ENV !== 'production'` ではなく、必要なら `NODE_ENV === 'test'` や `ENABLE_TEST_RESET=true` など、より明示的な条件にする。
6. PostgreSQLモードのreset処理に対する統合テストを追加し、主要テーブルと採番が初期状態へ戻ることを確認する。

## 判定

現時点のコミットは、in-memory前提のE2E安定化としては妥当。

一方で、本番環境がPostgreSQLであることを前提にすると、まだCI失敗原因の根本対策には届いていない。
このままCIが通った場合でも、PostgreSQL上での状態汚染や採番ずれは検出できない可能性が高い。
