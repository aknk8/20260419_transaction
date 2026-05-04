# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: explore-et02-04-07.spec.js >> ET-04: マスタ管理探索 >> 新規顧客登録で自動採番コード(CUS-010)と保存後の一覧反映を確認
- Location: e2e\explore-et02-04-07.spec.js:244:3

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
            - textbox "顧客コード 必須" [ref=e80]:
              - /placeholder: CUS-XXX
              - text: CUS-010
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
  163 |     console.log(`[ET-03] 発注一覧に"下書き"含む: ${content.includes('下書き')}`);
  164 |     console.log(`[ET-03] 発注一覧に"納品済"含む: ${content.includes('納品済')}`);
  165 |   });
  166 | 
  167 |   test('POD-00001の詳細で金額・仕入先・発注書出力を確認', async ({ page }) => {
  168 |     await login(page, 'admin', 'admin123');
  169 |     await navigateTo(page, '発注');
  170 |     const row = page.locator('.data-table-body-row', { hasText: 'POD-00001' });
  171 |     if (await row.isVisible().catch(() => false)) {
  172 |       await row.locator('button', { hasText: '詳細' }).click();
  173 |       await page.waitForTimeout(500);
  174 |       const content = await page.locator('main').innerText();
  175 |       console.log(`[ET-03] POD-00001詳細に"528"含む（528,000円）: ${content.includes('528')}`);
  176 |       console.log(`[ET-03] POD-00001詳細に"日本テクノロジー"含む: ${content.includes('日本テクノロジー')}`);
  177 |       // 発注書PDF出力ボタン確認
  178 |       const pdfBtn = page.locator('button', { hasText: '発注書' }).or(page.locator('button', { hasText: 'PDF' })).or(page.locator('button', { hasText: '出力' })).first();
  179 |       console.log(`[ET-03] 発注書出力ボタン: ${await pdfBtn.isVisible().catch(() => false)}`);
  180 |       // 承認依頼ボタン確認
  181 |       const approvalBtn = page.locator('button', { hasText: '承認依頼' });
  182 |       console.log(`[ET-03] 承認依頼ボタン: ${await approvalBtn.isVisible().catch(() => false)}`);
  183 |     }
  184 |   });
  185 | });
  186 | 
  187 | // ─── ET-04: マスタ管理 ──────────────────────────────────────────
  188 | test.describe('ET-04: マスタ管理探索', () => {
  189 | 
  190 |   test('顧客マスタ一覧 表示件数（PAGE_SIZE=5）の確認', async ({ page }) => {
  191 |     await login(page, 'admin', 'admin123');
  192 |     await navigateTo(page, 'マスタ管理');
  193 |     await page.waitForTimeout(300);
  194 |     const rows = await page.locator('.data-table-body-row').count();
  195 |     const summary = await page.locator('.table-summary').innerText().catch(() => '');
  196 |     console.log(`[ET-04] 顧客マスタ表示行数: ${rows}`);
  197 |     console.log(`[ET-04] サマリー: "${summary}"`);
  198 |     expect(rows).toBeLessThanOrEqual(5);
  199 |   });
  200 | 
  201 |   test('ページング（次へ/前へ）の動作確認', async ({ page }) => {
  202 |     await login(page, 'admin', 'admin123');
  203 |     await navigateTo(page, 'マスタ管理');
  204 |     await page.waitForTimeout(300);
  205 | 
  206 |     const nextBtn = page.locator('button', { hasText: '次へ' });
  207 |     const isNextEnabled = !(await nextBtn.isDisabled().catch(() => true));
  208 |     console.log(`[ET-04] 「次へ」ボタン活性: ${isNextEnabled}（9件あるので2ページあるはず）`);
  209 | 
  210 |     if (isNextEnabled) {
  211 |       await nextBtn.click();
  212 |       await page.waitForTimeout(300);
  213 |       const rows2 = await page.locator('.data-table-body-row').count();
  214 |       const summary2 = await page.locator('.table-summary').innerText().catch(() => '');
  215 |       console.log(`[ET-04] 2ページ目の表示行数: ${rows2}（期待値: 4）`);
  216 |       console.log(`[ET-04] 2ページ目サマリー: "${summary2}"`);
  217 | 
  218 |       const prevBtn = page.locator('button', { hasText: '前へ' });
  219 |       const isPrevEnabled = !(await prevBtn.isDisabled().catch(() => true));
  220 |       console.log(`[ET-04] 「前へ」ボタン活性: ${isPrevEnabled}`);
  221 |       if (isPrevEnabled) {
  222 |         await prevBtn.click();
  223 |         await page.waitForTimeout(300);
  224 |         const rows1Again = await page.locator('.data-table-body-row').count();
  225 |         console.log(`[ET-04] 1ページ目に戻ったときの行数: ${rows1Again}`);
  226 |       }
  227 |     }
  228 |   });
  229 | 
  230 |   test('キーワード検索「青葉」で絞り込み確認', async ({ page }) => {
  231 |     await login(page, 'admin', 'admin123');
  232 |     await navigateTo(page, 'マスタ管理');
  233 |     await page.waitForTimeout(300);
  234 | 
  235 |     const searchInput = page.locator('input[data-table-input="search"]');
  236 |     await searchInput.fill('青葉');
  237 |     await page.waitForTimeout(400);
  238 |     const rows = await page.locator('.data-table-body-row').count();
  239 |     const content = await page.locator('.data-table').innerText().catch(() => '');
  240 |     console.log(`[ET-04] "青葉"検索後 行数: ${rows}（期待値: 1）`);
  241 |     console.log(`[ET-04] "青葉"が結果に含まれる: ${content.includes('青葉')}`);
  242 |   });
  243 | 
  244 |   test('新規顧客登録で自動採番コード(CUS-010)と保存後の一覧反映を確認', async ({ page }) => {
  245 |     await login(page, 'admin', 'admin123');
  246 |     await navigateTo(page, 'マスタ管理');
  247 |     await page.waitForTimeout(300);
  248 | 
  249 |     const newBtn = page.locator('#new-customer-btn, button', { hasText: '新規登録' }).first();
  250 |     if (await newBtn.isVisible().catch(() => false)) {
  251 |       await newBtn.click();
  252 |       await page.waitForTimeout(400);
  253 |       // コードの自動採番確認
  254 |       const codeInput = page.locator('input[name="code"], input#code, input').first();
  255 |       const codeVal = await codeInput.inputValue().catch(() => '（取得不可）');
  256 |       console.log(`[ET-04] 自動採番コード: "${codeVal}"（期待値: CUS-010）`);
  257 | 
  258 |       // 顧客名を入力して保存
  259 |       const nameInputs = await page.locator('input').all();
  260 |       for (const inp of nameInputs) {
  261 |         const nm = await inp.getAttribute('name').catch(() => '');
  262 |         const ph = await inp.getAttribute('placeholder').catch(() => '');
> 263 |         if (nm.includes('name') || ph.includes('名')) {
      |                ^ TypeError: Cannot read properties of null (reading 'includes')
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
  363 |         if (nm.includes('name') || ph.includes('名')) {
```