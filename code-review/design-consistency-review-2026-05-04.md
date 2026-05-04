# デザイン整合性レビュー

**担当**: UXデザイナー  
**実施日**: 2026-05-04  
**調査対象**: 全画面のHTMLレンダリング関数（app.js）・スタイル定義（styles.css）  
**調査手法**: 悉皆調査（全画面レンダリング関数の横断的コードリーディング）

---

## エグゼクティブサマリー

全画面を横断的に調査した結果、**15カテゴリの設計不整合**を検出した。  
うち **2件はCSSクラス未定義によるスタイル崩壊**（重大度：致命的）、**4件は機能は動くが見た目が揺れる不整合**（重大度：高）、残り9件は統一感の欠如（重大度：中〜低）である。

### 重大度別サマリー

| 重大度 | 件数 | 概要 |
|--------|------|------|
| 🔴 致命的 | 2 | 使用しているCSSクラスがstyles.cssに未定義 → スタイル崩壊 |
| 🟠 高 | 4 | 同じ目的の要素に異なるクラス名を使用 |
| 🟡 中 | 6 | テキスト表記・ボタンラベルの不統一 |
| 🟢 低 | 3 | 意味的な揺れ（機能・見た目への影響小） |

---

## 詳細調査結果

---

### #1 ステータスバッジのクラス名不統一（🔴 致命的）

**影響画面**: 受注詳細（S-05）、発注詳細（S-06）、請求詳細（S-08）

**問題**: `status-badge` クラスが使われているが、`styles.css` に定義が存在しない。定義があるのは `.status` のみ（styles.css 661行付近）。

| 画面 | 使用クラス | styles.css での定義 |
|------|-----------|-------------------|
| プロジェクト詳細 | `class="status is-open"` | ✅ `.status` 定義あり |
| 見積詳細 | `class="status is-draft"` | ✅ `.status` 定義あり |
| 受注詳細 | `class="status-badge is-open"` | ❌ `.status-badge` 未定義 |
| 発注詳細 | `class="status-badge is-approved"` | ❌ `.status-badge` 未定義 |
| 請求詳細 | `class="status-badge is-pending"` | ❌ `.status-badge` 未定義 |

**具体的なHTML差異**:

```html
<!-- プロジェクト詳細（正しい） -->
<span class="status is-open">進行中</span>

<!-- 受注詳細（スタイル崩壊） -->
<span class="status-badge is-open">受注済み</span>
```

**修正方針**: 受注・発注・請求の `status-badge` を `status` に統一するか、`styles.css` に `.status-badge` を `.status` と同等の定義として追加する。

---

### #2 未定義CSSクラスの多用（🔴 致命的）

**影響画面**: 受注詳細、発注詳細、請求詳細

以下のクラスが `app.js` 内で使用されているが、`styles.css` に定義が存在しない。

| クラス名 | 使用箇所 | styles.css定義 |
|---------|---------|--------------|
| `detail-field` | 受注詳細、発注詳細の詳細グリッド内行 | ❌ なし（`detail-row` は定義あり） |
| `detail-item` | 請求詳細のグリッド内行 | ❌ なし |
| `detail-section-body` | 発注詳細・請求詳細の備考セクション | ❌ なし |
| `button-xs` | 発注詳細の「検収済にする」ボタン | ❌ なし（`button-sm` は定義あり） |
| `panel-content` | 請求詳細のコンテンツラッパー | ❌ なし |

**具体的なHTML差異**:

```html
<!-- プロジェクト詳細・見積詳細（定義あり） -->
<div class="detail-row">
  <span class="detail-label">案件コード</span>
  <span class="detail-value">PJ-00001</span>
</div>

<!-- 受注詳細・発注詳細（定義なし → 崩壊） -->
<div class="detail-field">
  <div class="detail-label">受注番号</div>
  <div class="detail-value">ORD-00001</div>
</div>

<!-- 発注詳細の納品ボタン（button-xs 未定義） -->
<button class="button button-primary button-xs">検収済にする</button>

<!-- 他画面の同等ボタン（button-sm は定義あり） -->
<button class="button button-ghost button-sm">編集</button>
```

**修正方針**: 各クラスについて以下のいずれかを選択する。
- `detail-field` → `detail-row` に統一（推奨）
- `detail-item` → `detail-row` に統一（推奨）
- `detail-section-body` → `styles.css` に定義追加、または既存クラスへ変更
- `button-xs` → `button-sm` に統一（推奨）
- `panel-content` → 削除（不要なラッパー）

---

### #3 詳細画面のアクションボタン配置コンテナ不統一（🟠 高）

**影響画面**: 全詳細画面

同じ「詳細画面上部のアクションボタン群」に対して、異なるクラス名が使われている。

| 画面 | コンテナクラス | 「戻る」ボタンスタイル |
|------|-------------|-------------------|
| プロジェクト詳細 | `class="toolbar"` | `button-ghost`（サイズ修飾なし） |
| 見積詳細 | `class="toolbar"` | `button-ghost`（サイズ修飾なし） |
| 受注詳細 | `class="panel-actions"` | `button-secondary button-sm` |
| 発注詳細 | `class="panel-actions"` | `button-secondary button-sm` |
| 請求詳細 | `class="panel-actions"` | `button-secondary button-sm` |

**具体的なHTML差異**:

```html
<!-- プロジェクト詳細 -->
<div class="toolbar">
  <button class="button button-secondary">編集</button>
  <button class="button button-ghost">一覧へ戻る</button>
</div>

<!-- 受注詳細 -->
<div class="panel-actions">
  <button class="button button-primary button-sm">請求対象化</button>
  <button class="button button-secondary button-sm">発注起票</button>
  <button class="button button-secondary button-sm">一覧に戻る</button>
</div>
```

**修正方針**: `panel-actions` に統一する（`toolbar` はページ上部のグローバルナビ的な文脈で使用されており、詳細画面内のローカルアクションには `panel-actions` が意味的に適切）。

---

### #4 「戻る」ボタンのテキスト表記ゆれ（🟡 中）

**影響画面**: 全詳細画面

| 画面 | ボタンテキスト |
|------|-------------|
| プロジェクト詳細 | `一覧へ戻る` |
| 見積詳細 | `一覧へ戻る` |
| 受注詳細 | `一覧に戻る` |
| 発注詳細 | `一覧に戻る` |
| 請求詳細 | `一覧に戻る` |

「へ」と「に」の助詞差異。機能的な差はないが、コピーライティングの不統一はプロフェッショナリティの低下につながる。

**修正方針**: `一覧へ戻る` に統一（方向を示す「へ」が自然なUXコピー）。

---

### #5 フォーム送信ボタンのラベル・スタイル不統一（🟡 中）

**影響画面**: 全登録・編集フォーム

| 画面 | 主アクションボタン | スタイル |
|------|----------------|---------|
| プロジェクトフォーム | `登録する` | `button-primary` |
| 受注フォーム | `受注登録` | `button-primary` |
| 顧客マスタフォーム | `保存` | `button-primary` |
| 仕入先マスタフォーム | `保存` | `button-primary` |
| 商品マスタフォーム | `保存` | `button-primary` |
| 見積フォーム | `下書き保存` | `button-primary` |
| 見積フォーム（承認依頼） | `承認依頼` | `button-warning` ← 異質 |

**問題**: 「承認依頼」は主たるポジティブアクションにもかかわらず `button-warning`（警告色）が使われており、意味的に矛盾している。また「登録する」「受注登録」「保存」とラベルが統一されていない。

**修正方針**:
- 新規登録系: `保存` に統一
- 「承認依頼」ボタン: `button-primary` に変更（または意図的に区別するなら `button-success` を追加定義）

---

### #6 詳細画面のコンテナ要素の型不統一（🟠 高）

**影響画面**: 全詳細画面

詳細情報のラベル・値ペアを包む要素に `<span>` と `<div>` が混在している。

| 画面 | ラベル要素 | 値要素 |
|------|----------|-------|
| プロジェクト詳細 | `<span class="detail-label">` | `<span class="detail-value">` |
| 見積詳細 | `<span class="detail-label">` | `<span class="detail-value">` |
| 受注詳細 | `<div class="detail-label">` | `<div class="detail-value">` |
| 発注詳細 | `<div class="detail-label">` | `<div class="detail-value">` |
| 請求詳細 | `<span class="detail-label">` | `<span class="detail-value">` |（一部のみ） |

**修正方針**: `<span>` に統一（ラベルと値はインラインコンテンツであり `<span>` が意味的に正しい。また `styles.css` が `detail-label` / `detail-value` を `<span>` 前提でスタイリングしている可能性が高い）。

---

### #7 パネルヘッダーのサブタイル要素の有無（🟡 中）

**影響画面**: マスタ管理フォーム vs. トランザクションフォーム

マスタ管理系のフォーム（顧客・仕入先・商品・ユーザー）のパネルヘッダーには `<span class="menu-tag">新規登録</span>` が付いているが、トランザクション系（プロジェクト・見積・受注・発注）には付いていない。

```html
<!-- 顧客マスタフォーム -->
<div class="panel-header">
  <div>
    <div class="panel-label">S-11 Step 2</div>
    <div class="panel-title-text">顧客マスタ登録</div>
  </div>
  <span class="menu-tag">新規登録</span>  ← マスタのみ
</div>

<!-- プロジェクトフォーム -->
<div class="panel-header">
  <div>
    <div class="panel-label">S-03 案件登録</div>
    <div class="panel-title-text">新規案件登録</div>
  </div>
  <!-- menu-tag なし -->
</div>
```

**修正方針**: 意図的な差異であれば設計書に明記する。意図的でなければ全フォームで統一する。

---

### #8 詳細セクションの内部構造不統一（🟡 中）

**影響画面**: 発注詳細、請求詳細

備考・明細などの「セクション」内部の構造が異なる。

```html
<!-- 発注詳細・請求詳細（備考） -->
<div class="detail-section">
  <div class="detail-section-label">備考</div>
  <div class="detail-section-body">...</div>  ← styles.css に未定義
</div>

<!-- 発注詳細（納品実績） -->
<div class="detail-section">
  <div class="detail-section-label">納品実績</div>
  <div class="detail-table">...</div>  ← 異なるクラス
</div>
```

セクション内のコンテンツラッパーが `detail-section-body` と `detail-table` で分かれており、かつ `detail-section-body` は未定義。

---

### #9 見積フォームの承認アクションのボタン階層（🟡 中）

**影響画面**: 見積フォーム（承認モード）

承認フローと通常登録フローでボタンの意味的階層が一致していない。

```html
<!-- 通常編集時 -->
<button class="button button-primary">下書き保存</button>   ← primary
<button class="button button-warning">承認依頼</button>      ← warning

<!-- 承認操作時 -->
<button class="button button-primary">承認する</button>      ← primary
<button class="button button-danger">却下する</button>       ← danger
```

「承認依頼」は重要度が高いアクションなのに `button-warning`（警告）が割り当てられている。承認操作時の「承認する」は `button-primary`（=成功・確定）であり整合性がない。

---

### #10 テーブル列定義とCSSグリッドの乖離（🟠 高）

**影響画面**: 顧客マスタ一覧

`styles.css` に `.data-table.customer` のグリッド列定義が存在しない。他のテーブル（`.data-table.supplier`、`.data-table.product`、`.data-table.project`、`.data-table.quotation` 等）には専用のグリッド定義がある。

顧客テーブルはデフォルトの7列グリッドにフォールバックしているが、顧客データは実際には（コード・顧客名・主管部門・締日・支払サイト・操作）の6列構成であるため、列幅が意図通りに設定されていない可能性がある。

---

### #11 フォームのキャンセルボタンの実装方式不統一（🟢 低）

**影響画面**: 全フォーム

キャンセルボタンの動作実装がすべてフォームごとに個別IDで管理されており、共通パターンがない。

| フォーム | キャンセルボタンID |
|---------|----------------|
| プロジェクト | `project-form-cancel` |
| 見積 | `quotation-form-cancel` |
| 受注 | `order-form-cancel` |
| 顧客マスタ | `customer-form-cancel` |

パターン自体は統一されているが、共通ハンドラの共有はなく、それぞれ個別にイベントリスナーが設定されている（保守性の問題）。

---

### #12 `fieldHtml` ヘルパー関数の重複定義（🟢 低）

**影響**: `app.js` 内

各マスタフォーム（顧客・仕入先・商品・ユーザー）それぞれの描画関数内でほぼ同一の `fieldHtml` という内部ヘルパー関数がローカル定義されている。内容は同一だが4箇所に重複しており、修正時の漏れリスクがある（デザイン的な不整合ではないが、不整合が生まれやすい構造）。

---

### #13 `panel-label` の表記スタイル不統一（🟢 低）

**影響画面**: 全画面

`panel-label`（画面IDラベル）の書き方が一定でない。

| 画面 | panel-label テキスト |
|------|------------------|
| プロジェクト詳細 | `S-03 案件詳細` |
| 見積詳細 | `S-04 見積詳細` |
| 顧客マスタ登録フォーム | `S-11 Step 2` |
| 仕入先マスタ登録フォーム | `S-11 Step 3` |

マスタフォームは「Step N」表記、それ以外は「画面名」表記と異なる。

---

### #14 「新規登録」ボタンのラベル・クラス不統一（🟡 中）

**影響画面**: 各一覧画面

| 画面 | ボタンテキスト | ボタンクラス |
|------|-------------|-----------|
| プロジェクト一覧 | `新規案件登録` | `button-primary` |
| 見積一覧 | `新規見積作成` | `button-primary` |
| 受注一覧 | `新規受注登録` | `button-primary` |
| 発注一覧 | `新規発注` | `button-primary` |
| 顧客マスタ | `新規顧客登録` | `button-primary` |

スタイルは統一されているがラベルのパターンが不統一（「新規〇〇登録」「新規〇〇作成」「新規〇〇」）。

**修正方針**: 「新規登録」に統一（最も汎用的で短く、UXコピーとして適切）。または業務文脈を重視して「新規〇〇」形式（新規案件、新規見積、新規受注）に統一する。

---

### #15 請求詳細のラッパー構造が他と異なる（🟡 中）

**影響画面**: 請求詳細（S-08）のみ

```html
<!-- 請求詳細のみ -->
<section class="panel">
  <div class="panel-header">...</div>
  <div class="panel-content">        ← 他画面にはないラッパー
    <div class="detail-grid">...</div>
    <div class="detail-section">...</div>
  </div>
</section>

<!-- 他の詳細画面 -->
<section class="panel">
  <div class="panel-header">...</div>
  <div class="detail-grid">...</div>  ← panel-content なし
  <div class="detail-section">...</div>
</section>
```

`panel-content` が `styles.css` に未定義のため、意図した余白・背景が適用されない。

---

## 優先度別修正リスト

### P1: 即時修正（スタイル崩壊のため）

| # | 修正内容 | 対象ファイル |
|---|---------|-----------|
| 1-a | 受注・発注・請求詳細の `status-badge` → `status` に変更 | app.js |
| 1-b | `styles.css` に `.status-badge` を `.status` の別名として追加（代替案） | styles.css |
| 2-a | 受注・発注詳細の `detail-field` → `detail-row` に変更 | app.js |
| 2-b | 請求詳細の `detail-item` → `detail-row` に変更 | app.js |
| 2-c | `button-xs` → `button-sm` に変更（発注詳細） | app.js |
| 2-d | `panel-content` ラッパーを削除（請求詳細） | app.js |
| 2-e | `detail-section-body` を `styles.css` に定義追加、または既存クラスへ変更 | app.js / styles.css |

### P2: 次スプリント（UX整合性のため）

| # | 修正内容 | 対象ファイル |
|---|---------|-----------|
| 3 | 詳細画面アクションコンテナを `panel-actions` に統一 | app.js |
| 4 | 「戻る」ボタンテキストを「一覧へ戻る」に統一 | app.js |
| 5 | 「戻る」ボタンスタイルを `button-ghost` に統一 | app.js |
| 6 | ラベル・値要素を `<span>` に統一 | app.js |
| 14 | 「新規登録」ボタンラベルをパターン統一 | app.js |
| 15 | 請求詳細の `panel-content` 構造を他画面と合わせる | app.js |

### P3: バックログ（保守性のため）

| # | 修正内容 | 対象ファイル |
|---|---------|-----------|
| 7 | `menu-tag` の使用画面を揃えるか設計として明文化 | app.js / 設計書 |
| 10 | `styles.css` に `.data-table.customer` のグリッド定義を追加 | styles.css |
| 12 | `fieldHtml` ヘルパーを共通関数として一箇所に集約 | app.js |
| 13 | `panel-label` の表記スタイルを統一 | app.js |

---

## フロントエンドエンジニアへの申し送り

以下のクラスは **現在styles.cssに未定義** であるため、修正または定義追加が必要です：

- `detail-field`（受注・発注詳細で使用）
- `detail-item`（請求詳細で使用）
- `detail-section-body`（発注・請求詳細の備考）
- `button-xs`（発注詳細の「検収済にする」ボタン）
- `panel-content`（請求詳細のみ）
- `status-badge`（受注・発注・請求詳細のステータス表示）

これら6クラスの解消を **P1**（最優先）として対応をお願いします。

---

*調査実施: UXデザイナー / 2026-05-04*
