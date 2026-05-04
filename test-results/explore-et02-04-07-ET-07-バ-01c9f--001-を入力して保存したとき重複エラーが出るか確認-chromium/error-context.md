# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: explore-et02-04-07.spec.js >> ET-07: バリデーション探索 >> 既存コード(CUS-001)を入力して保存したとき重複エラーが出るか確認
- Location: e2e\explore-et02-04-07.spec.js:339:3

# Error details

```
TypeError: Cannot read properties of null (reading 'includes')
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - complementary [ref=e5]:
    - generic [ref=e6]:
      - generic [ref=e8]: 取引管理システム
      - generic [ref=e9]: 共通基盤、認証認可、フォーム部品、顧客マスタ一覧・登録まで実装済み。
    - navigation [ref=e10]:
      - generic [ref=e11] [cursor=pointer]:
        - generic [ref=e12]: ダッシュボード
        - generic [ref=e13]: S-02
      - generic [ref=e14] [cursor=pointer]:
        - generic [ref=e15]: 案件一覧・詳細
        - generic [ref=e16]: S-03
      - generic [ref=e17] [cursor=pointer]:
        - generic [ref=e18]: 見積一覧・登録・詳細
        - generic [ref=e19]: S-04
      - generic [ref=e20] [cursor=pointer]:
        - generic [ref=e21]: 受注一覧・詳細
        - generic [ref=e22]: S-05
      - generic [ref=e23] [cursor=pointer]:
        - generic [ref=e24]: 発注一覧・登録・詳細
        - generic [ref=e25]: S-06
      - generic [ref=e26] [cursor=pointer]:
        - generic [ref=e27]: 請求一覧・登録・詳細
        - generic [ref=e28]: S-08
      - generic [ref=e29] [cursor=pointer]:
        - generic [ref=e30]: 入金登録
        - generic [ref=e31]: S-09
      - generic [ref=e32] [cursor=pointer]:
        - generic [ref=e33]: 支払依頼・支払登録
        - generic [ref=e34]: S-10
      - generic [ref=e35] [cursor=pointer]:
        - generic [ref=e36]: マスタ管理
        - generic [ref=e37]: S-11
      - generic [ref=e38] [cursor=pointer]:
        - generic [ref=e39]: 承認一覧
        - generic [ref=e40]: S-12
      - generic [ref=e41] [cursor=pointer]:
        - generic [ref=e42]: レポート
        - generic [ref=e43]: S-13
      - generic [ref=e44] [cursor=pointer]:
        - generic [ref=e45]: 通知一覧
        - generic [ref=e46]: S-14
    - generic [ref=e47]:
      - generic [ref=e48]:
        - generic [ref=e49]: 中村 管理者
        - generic [ref=e50]:
          - text: システム管理者
          - text: 管理部門 / 部長
      - button "ログアウト" [ref=e51] [cursor=pointer]
  - main [ref=e52]:
    - generic [ref=e53]:
      - generic [ref=e54]:
        - generic [ref=e55]: S-11
        - generic [ref=e56]: マスタ管理
        - generic [ref=e57]: 顧客、仕入先、商品、ユーザ、部門、役職、権限を管理します。
      - generic [ref=e58]:
        - generic [ref=e59]: 管理部門
        - generic [ref=e60]: 部長
        - generic [ref=e61]: 権限 21件
    - generic [ref=e62]:
      - button "顧客マスタ" [ref=e63] [cursor=pointer]
      - button "仕入先マスタ" [ref=e64] [cursor=pointer]
      - button "商品マスタ" [ref=e65] [cursor=pointer]
      - button "支払条件" [ref=e66] [cursor=pointer]
      - button "税率" [ref=e67] [cursor=pointer]
      - button "ユーザ管理" [ref=e68] [cursor=pointer]
    - generic [ref=e69]:
      - generic [ref=e70]:
        - generic [ref=e71]:
          - generic [ref=e72]: S-11 Step 2
          - generic [ref=e73]: 顧客マスタ登録
        - generic [ref=e74]: 新規登録
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e77]:
            - generic [ref=e78]:
              - text: 顧客コード
              - generic [ref=e79]: 必須
            - textbox "顧客コード 必須" [active] [ref=e80]:
              - /placeholder: CUS-XXX
              - text: CUS-001
          - generic [ref=e82]:
            - generic [ref=e83]:
              - text: 顧客名
              - generic [ref=e84]: 必須
            - textbox "顧客名 必須" [ref=e85]:
              - /placeholder: 株式会社 例
          - generic [ref=e87]:
            - generic [ref=e88]:
              - text: 主管部門
              - generic [ref=e89]: 必須
            - combobox "主管部門 必須" [ref=e90]:
              - option "選択してください" [selected]
              - option "営業部門"
              - option "営業事務部門"
              - option "購買部門"
              - option "経理部門"
              - option "管理部門"
          - generic [ref=e92]:
            - generic [ref=e93]: 担当窓口
            - textbox "担当窓口" [ref=e94]:
              - /placeholder: 山田 太郎
          - generic [ref=e96]:
            - generic [ref=e97]:
              - text: 締日
              - generic [ref=e98]: 必須
            - combobox "締日 必須" [ref=e99]:
              - option "選択してください" [selected]
              - option "末日"
              - option "10日"
              - option "15日"
              - option "20日"
              - option "25日"
          - generic [ref=e101]:
            - generic [ref=e102]:
              - text: 支払サイト
              - generic [ref=e103]: 必須
            - textbox "支払サイト 必須" [ref=e104]:
              - /placeholder: 翌月末
          - generic [ref=e106]:
            - generic [ref=e107]: 請求先
            - textbox "請求先" [ref=e108]:
              - /placeholder: 本社経理部
          - generic [ref=e110]:
            - generic [ref=e111]:
              - text: 状態
              - generic [ref=e112]: 必須
            - combobox "状態 必須" [ref=e113]:
              - option "選択してください"
              - option "有効" [selected]
              - option "停止"
        - generic [ref=e115]:
          - button "登録する" [ref=e116] [cursor=pointer]
          - button "キャンセル" [ref=e117] [cursor=pointer]
```

# Test source

```ts
  263 |         if (nm.includes('name') || ph.includes('名')) {
  264 |           await inp.fill('探索テスト商事株式会社');
  265 |           break;
  266 |         }
  267 |       }
  268 | 
  269 |       const saveBtn = page.locator('button[type="submit"], button', { hasText: '登録' }).last();
  270 |       if (await saveBtn.isVisible().catch(() => false)) {
  271 |         await saveBtn.click();
  272 |         await page.waitForTimeout(500);
  273 |         // 一覧に反映されているか
  274 |         const summary = await page.locator('.table-summary').innerText().catch(() => '');
  275 |         console.log(`[ET-04] 登録後サマリー: "${summary}"`);
  276 |         // キーワード検索で確認
  277 |         const searchInput = page.locator('input[data-table-input="search"]');
  278 |         await searchInput.fill('探索テスト商事');
  279 |         await page.waitForTimeout(300);
  280 |         const rows = await page.locator('.data-table-body-row').count();
  281 |         console.log(`[ET-04] 登録後"探索テスト商事"の検索結果: ${rows}件`);
  282 |       }
  283 |     } else {
  284 |       console.log('[ET-04] 新規登録ボタンが見当たらない');
  285 |     }
  286 |   });
  287 | 
  288 |   test('商品マスタで単価の表示形式（文字列 vs 数値）を確認', async ({ page }) => {
  289 |     await login(page, 'admin', 'admin123');
  290 |     await navigateTo(page, 'マスタ管理');
  291 |     await page.waitForTimeout(300);
  292 |     // 商品タブへ切り替え
  293 |     const productTab = page.locator('[data-master-tab="product"], button', { hasText: '商品' }).first();
  294 |     if (await productTab.isVisible().catch(() => false)) {
  295 |       await productTab.click();
  296 |       await page.waitForTimeout(300);
  297 |       const content = await page.locator('.data-table').innerText().catch(() => '');
  298 |       console.log(`[ET-04] 商品マスタ一覧に"50,000"（数値フォーマット）含む: ${content.includes('50,000')}`);
  299 |       console.log(`[ET-04] 商品マスタ一覧に"50000"（生文字列）含む: ${content.includes('50000')}`);
  300 |     } else {
  301 |       console.log('[ET-04] 商品タブが見当たらない');
  302 |       const tabs = await page.locator('[class*="tab"], .master-tab-btn').allTextContents();
  303 |       console.log(`[ET-04] 利用可能なタブ: ${JSON.stringify(tabs)}`);
  304 |     }
  305 |   });
  306 | 
  307 |   test('sales01のマスタ管理: 閲覧可能・新規登録/編集ボタン非表示の確認', async ({ page }) => {
  308 |     await login(page, 'sales01', 'sales123');
  309 |     await navigateTo(page, 'マスタ管理');
  310 |     await page.waitForTimeout(300);
  311 |     const rows = await page.locator('.data-table-body-row').count();
  312 |     const newBtns = await page.locator('button', { hasText: '新規登録' }).count();
  313 |     const editBtns = await page.locator('button', { hasText: '編集' }).count();
  314 |     console.log(`[ET-04] sales01 一覧行数: ${rows}, 新規登録ボタン: ${newBtns}個, 編集ボタン: ${editBtns}個`);
  315 |   });
  316 | });
  317 | 
  318 | // ─── ET-07: バリデーション ──────────────────────────────────────
  319 | test.describe('ET-07: バリデーション探索', () => {
  320 | 
  321 |   test('顧客名を空のまま保存したときのエラーメッセージ確認', async ({ page }) => {
  322 |     await login(page, 'admin', 'admin123');
  323 |     await navigateTo(page, 'マスタ管理');
  324 |     await page.waitForTimeout(300);
  325 | 
  326 |     const newBtn = page.locator('button', { hasText: '新規登録' }).first();
  327 |     if (await newBtn.isVisible().catch(() => false)) {
  328 |       await newBtn.click();
  329 |       await page.waitForTimeout(400);
  330 |       const saveBtn = page.locator('button[type="submit"], button', { hasText: '登録' }).last();
  331 |       await saveBtn.click();
  332 |       await page.waitForTimeout(400);
  333 |       const errors = await page.locator('[class*="error"], .field-error, .error-message').allTextContents();
  334 |       console.log(`[ET-07] 必須エラーメッセージ: ${JSON.stringify(errors)}`);
  335 |       console.log(`[ET-07] エラー件数: ${errors.length}`);
  336 |     }
  337 |   });
  338 | 
  339 |   test('既存コード(CUS-001)を入力して保存したとき重複エラーが出るか確認', async ({ page }) => {
  340 |     await login(page, 'admin', 'admin123');
  341 |     await navigateTo(page, 'マスタ管理');
  342 |     await page.waitForTimeout(300);
  343 | 
  344 |     const newBtn = page.locator('button', { hasText: '新規登録' }).first();
  345 |     if (await newBtn.isVisible().catch(() => false)) {
  346 |       await newBtn.click();
  347 |       await page.waitForTimeout(400);
  348 | 
  349 |       // コードを既存値に上書き
  350 |       const allInputs = await page.locator('input[type="text"], input:not([type])').all();
  351 |       for (const inp of allInputs) {
  352 |         const val = await inp.inputValue().catch(() => '');
  353 |         if (val.startsWith('CUS-')) {
  354 |           await inp.fill('CUS-001'); // 重複コード
  355 |           break;
  356 |         }
  357 |       }
  358 |       // 顧客名を入れる
  359 |       const nameInputs = await page.locator('input').all();
  360 |       for (const inp of nameInputs) {
  361 |         const nm = await inp.getAttribute('name').catch(() => '');
  362 |         const ph = await inp.getAttribute('placeholder').catch(() => '');
> 363 |         if (nm.includes('name') || ph.includes('名')) {
      |                ^ TypeError: Cannot read properties of null (reading 'includes')
  364 |           await inp.fill('重複テスト株式会社');
  365 |           break;
  366 |         }
  367 |       }
  368 | 
  369 |       const saveBtn = page.locator('button[type="submit"], button', { hasText: '登録' }).last();
  370 |       await saveBtn.click();
  371 |       await page.waitForTimeout(400);
  372 | 
  373 |       const errors = await page.locator('[class*="error"], .field-error').allTextContents();
  374 |       const hasDupError = errors.some(t => t.includes('使用') || t.includes('重複') || t.includes('既に'));
  375 |       console.log(`[ET-07] 重複コードエラー: ${JSON.stringify(errors)}`);
  376 |       console.log(`[ET-07] 重複バリデーション機能: ${hasDupError}`);
  377 |     }
  378 |   });
  379 | 
  380 |   test('空IDでログインしたときのエラー確認', async ({ page }) => {
  381 |     await page.goto('/');
  382 |     await page.fill('#user-id', '');
  383 |     await page.fill('#password', 'admin123');
  384 |     await page.click('button[type="submit"]');
  385 |     await page.waitForTimeout(400);
  386 |     const errVisible = await page.locator('[class*="error"], .login-error').first().isVisible().catch(() => false);
  387 |     const sidebarVisible = await page.locator('.sidebar').isVisible().catch(() => false);
  388 |     console.log(`[ET-07] 空IDログイン → エラー表示: ${errVisible}, ログイン成功: ${sidebarVisible}`);
  389 |   });
  390 | 
  391 |   test('空パスワードでログインしたときのエラー確認', async ({ page }) => {
  392 |     await page.goto('/');
  393 |     await page.fill('#user-id', 'admin');
  394 |     await page.fill('#password', '');
  395 |     await page.click('button[type="submit"]');
  396 |     await page.waitForTimeout(400);
  397 |     const errVisible = await page.locator('[class*="error"], .login-error').first().isVisible().catch(() => false);
  398 |     const sidebarVisible = await page.locator('.sidebar').isVisible().catch(() => false);
  399 |     console.log(`[ET-07] 空パスワードログイン → エラー表示: ${errVisible}, ログイン成功: ${sidebarVisible}`);
  400 |   });
  401 | 
  402 |   test('CSV出力ボタンが各一覧に存在するか確認', async ({ page }) => {
  403 |     await login(page, 'admin', 'admin123');
  404 |     const screens = [
  405 |       { menu: 'マスタ管理', label: 'マスタ' },
  406 |       { menu: '見積', label: '見積' },
  407 |       { menu: '受注', label: '受注' },
  408 |       { menu: '発注', label: '発注' },
  409 |     ];
  410 |     for (const s of screens) {
  411 |       await navigateTo(page, s.menu);
  412 |       await page.waitForTimeout(300);
  413 |       const csvBtn = page.locator('button', { hasText: 'CSV' }).or(page.locator('button', { hasText: 'CSV 出力' })).first();
  414 |       const hasCSV = await csvBtn.isVisible().catch(() => false);
  415 |       console.log(`[ET-07] ${s.label}一覧のCSV出力ボタン: ${hasCSV}`);
  416 |     }
  417 |   });
  418 | 
  419 |   test('請求・入金・支払・承認・レポート画面がプレースホルダーか確認', async ({ page }) => {
  420 |     await login(page, 'admin', 'admin123');
  421 |     const placeholderScreens = [
  422 |       { menu: '入金登録',       label: 'S-09入金' },
  423 |       { menu: '支払依頼',       label: 'S-10支払' },
  424 |       { menu: '承認一覧',       label: 'S-12承認' },
  425 |       { menu: 'レポート',       label: 'S-13レポート' },
  426 |       { menu: '通知一覧',       label: 'S-14通知' },
  427 |     ];
  428 |     for (const s of placeholderScreens) {
  429 |       await navigateTo(page, s.menu);
  430 |       await page.waitForTimeout(300);
  431 |       const content = await page.locator('main').innerText().catch(() => '');
  432 |       const isPlaceholder = content.includes('実装予定') || content.includes('coming soon') || content.includes('工事中') || content.includes('準備中');
  433 |       const hasRealContent = await page.locator('.data-table, form, table').count() > 0;
  434 |       console.log(`[ET-07] ${s.label}: プレースホルダー=${isPlaceholder}, 実コンテンツ=${hasRealContent}, 先頭100文字="${content.substring(0, 100)}"`);
  435 |     }
  436 |   });
  437 | });
  438 | 
```