# E2Eテスト実行手順

## 目的

`e2e/*.spec.js` のPlaywright E2Eテストをまとめて実行し、実行結果、失敗時スクリーンショット、トレース、動画、HTML/JSON/JUnitレポートを保管する。

## 実行対象

- テストディレクトリ: `e2e`
- 実行コマンド: `npm run test:e2e`
- 現在の対象: `*.spec.js` 35ファイル
- ブラウザ: Chromium

## 通常実行

```powershell
npm run test:e2e
```

Playwright設定の `webServer` により、Vite開発サーバーは自動起動される。既に `http://localhost:5173` が起動している場合は既存サーバーを再利用する。

## レポート確認

```powershell
npm run test:e2e:show-report
```

HTMLレポートは以下に作成される。

```text
e2e-report/html
```

CI連携や集計用の機械可読レポートは以下に作成される。

```text
e2e-report/results.json
e2e-report/results.xml
```

## スクリーンショット・トレース・動画

通常設定では、失敗したテストについて以下が保存される。

```text
e2e-report/artifacts
```

保存対象:

- 失敗時スクリーンショット
- 失敗時トレース
- 失敗時動画

全テストのスクリーンショットも保存したい場合は、以下のように環境変数を指定して実行する。

```powershell
$env:E2E_SCREENSHOT = 'on'
npm run test:e2e
Remove-Item Env:E2E_SCREENSHOT
```

全件スクリーンショットは保存容量が増えるため、通常は失敗時のみを推奨する。

## 画面を表示して確認する場合

```powershell
npm run test:e2e:headed
```

## 保管方針

ローカル実行では `e2e-report/` 配下を結果保管先とする。CIで実行する場合は、次のパスを成果物として保存する。

```text
e2e-report/html
e2e-report/artifacts
e2e-report/results.json
e2e-report/results.xml
```

## 推奨CI手順

```powershell
npm ci
npm run build
npm run test
npm run test:e2e
```

E2Eは実行時間が長くなりやすいため、PRでは代表シナリオ、mainブランチや夜間実行では全件実行に分ける運用も検討する。
