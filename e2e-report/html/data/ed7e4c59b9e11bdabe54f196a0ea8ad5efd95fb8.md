# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.js >> S-10 支払登録 >> should show validation error when paidDate is empty
- Location: e2e\payment.spec.js:268:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-route="payment"]')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - complementary [ref=e5]:
    - generic [ref=e7]: 取引管理システム
    - generic [ref=e8]: requirements_definition.md と implementation_plan.md に基づく初期実装です。共通基盤、認証認可、フォーム共通部品、顧客マスタ一覧・登録まで実装済みです。
    - generic [ref=e9]:
      - generic [ref=e10]: CB-01 画面レイアウト基盤
      - generic [ref=e11]: CB-02 認証・認可基盤
      - generic [ref=e12]: CB-03 一覧画面共通部品
      - generic [ref=e13]: CB-04 フォーム共通部品
      - generic [ref=e14]: S-11 顧客マスタ 一覧・登録
  - generic [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]: Implementation Start
        - generic [ref=e19]: 所属・役職・個別権限
        - generic [ref=e20]: 利用者区分を「システム管理者 / 一般ユーザ」の2区分とし、所属部門・役職・ユーザ個別権限の組み合わせで認可する前提を反映しています。
      - generic [ref=e21]:
        - generic [ref=e22]: Current Scope
        - generic [ref=e23]: Login / Layout / Guard / List / Form
        - generic [ref=e24]: レビュー対象は、ログイン導線、権限に応じたメニュー表示、一覧部品、顧客マスタ一覧・登録フォームまでです。
    - generic [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e27]: S-01
        - heading "ログイン" [level=1] [ref=e28]
        - generic [ref=e29]: サンプルユーザでログインし、画面表示と操作可否が所属部門・役職・個別権限に応じて切り替わることを確認できます。admin は顧客マスタ登録も操作可能です。
        - generic [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]: ユーザ ID
            - textbox "ユーザ ID" [ref=e33]:
              - /placeholder: admin / sales01 / finance01
          - generic [ref=e34]:
            - generic [ref=e35]: パスワード
            - textbox "パスワード" [ref=e36]:
              - /placeholder: パスワードを入力
          - generic [ref=e37]:
            - button "ログイン" [ref=e38] [cursor=pointer]
            - button "管理者サンプル" [ref=e39] [cursor=pointer]
          - generic [ref=e40]: ログインに失敗しました。しばらく後で再試行してください。
      - generic [ref=e41]:
        - article [ref=e42]:
          - generic [ref=e43]: 中村 管理者
          - generic [ref=e44]:
            - text: "ID: admin"
            - text: "区分: システム管理者"
            - text: "所属: 管理部門 / 役職: 部長"
          - generic [ref=e45]:
            - generic [ref=e46]: dashboard:view
            - generic [ref=e47]: master:view
            - generic [ref=e48]: master:edit
            - generic [ref=e49]: project:view
        - article [ref=e50]:
          - generic [ref=e51]: 佐藤 営業
          - generic [ref=e52]:
            - text: "ID: sales01"
            - text: "区分: 一般ユーザ"
            - text: "所属: 営業部門 / 役職: 担当者"
          - generic [ref=e53]:
            - generic [ref=e54]: dashboard:view
            - generic [ref=e55]: master:view
            - generic [ref=e56]: project:view
            - generic [ref=e57]: project:edit
        - article [ref=e58]:
          - generic [ref=e59]: 鈴木 経理
          - generic [ref=e60]:
            - text: "ID: finance01"
            - text: "区分: 一般ユーザ"
            - text: "所属: 経理部門 / 役職: 課長"
          - generic [ref=e61]:
            - generic [ref=e62]: dashboard:view
            - generic [ref=e63]: master:view
            - generic [ref=e64]: invoice:view
            - generic [ref=e65]: invoice:edit
```

# Test source

```ts
  136 |     await page.fill('#password', 'finance123');
  137 |     await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  138 |     await expect(page.locator('[data-route="payment"]')).toBeVisible();
  139 |   });
  140 | });
  141 | 
  142 | test.describe('S-10 支払承認', () => {
  143 |   test.beforeEach(async ({ page }) => {
  144 |     await page.goto('/');
  145 |     await page.fill('#user-id', 'admin');
  146 |     await page.fill('#password', 'admin123');
  147 |     await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  148 |     await page.locator('[data-route="payment"]').click();
  149 |     await expect(page.locator('.data-table')).toBeVisible();
  150 |   });
  151 | 
  152 |   test('should show 詳細 button in payment list', async ({ page }) => {
  153 |     await expect(page.locator('[data-action-detail-payment="PMT-00001"]')).toBeVisible();
  154 |   });
  155 | 
  156 |   test('should show payment detail when 詳細 is clicked', async ({ page }) => {
  157 |     await page.click('[data-action-detail-payment="PMT-00001"]');
  158 |     await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払依頼詳細' })).toBeVisible();
  159 |   });
  160 | 
  161 |   test('should show payment code in detail', async ({ page }) => {
  162 |     await page.click('[data-action-detail-payment="PMT-00001"]');
  163 |     await expect(page.locator('.detail-grid')).toContainText('PMT-00001');
  164 |   });
  165 | 
  166 |   test('should show status badge in detail', async ({ page }) => {
  167 |     await page.click('[data-action-detail-payment="PMT-00001"]');
  168 |     await expect(page.locator('.status-badge')).toBeVisible();
  169 |   });
  170 | 
  171 |   test('should show 承認依頼 button for 下書き payment with payment:edit', async ({ page }) => {
  172 |     // create a new 下書き payment first via form
  173 |     await page.click('#payment-create-btn');
  174 |     await page.click('[data-action-create-payment="POD-00005"]');
  175 |     await page.fill('#f-pmt-date', '2026-05-31');
  176 |     await page.click('button[type="submit"]');
  177 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  178 |     await expect(page.locator('[data-action-payment-status="承認待ち"]')).toBeVisible();
  179 |   });
  180 | 
  181 |   test('should update status to 承認待ち when 承認依頼 is clicked', async ({ page }) => {
  182 |     await page.click('#payment-create-btn');
  183 |     await page.click('[data-action-create-payment="POD-00005"]');
  184 |     await page.fill('#f-pmt-date', '2026-05-31');
  185 |     await page.click('button[type="submit"]');
  186 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  187 |     await page.click('[data-action-payment-status="承認待ち"]');
  188 |     await expect(page.locator('.status-badge')).toHaveText('承認待ち');
  189 |   });
  190 | 
  191 |   test('should show 承認 button for 承認待ち payment with approval:act', async ({ page }) => {
  192 |     await page.click('#payment-create-btn');
  193 |     await page.click('[data-action-create-payment="POD-00005"]');
  194 |     await page.fill('#f-pmt-date', '2026-05-31');
  195 |     await page.click('button[type="submit"]');
  196 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  197 |     await page.click('[data-action-payment-status="承認待ち"]');
  198 |     await expect(page.locator('#payment-approve-btn')).toBeVisible();
  199 |   });
  200 | 
  201 |   test('should update status to 承認済 when 承認 is clicked', async ({ page }) => {
  202 |     await page.click('#payment-create-btn');
  203 |     await page.click('[data-action-create-payment="POD-00005"]');
  204 |     await page.fill('#f-pmt-date', '2026-05-31');
  205 |     await page.click('button[type="submit"]');
  206 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  207 |     await page.click('[data-action-payment-status="承認待ち"]');
  208 |     await page.click('#payment-approve-btn');
  209 |     await page.locator('#approval-confirm-approve').click();
  210 |     // After approval, navigateBackToApproval() fires; navigate back to verify status
  211 |     await page.locator('[data-route="payment"]').click();
  212 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  213 |     await expect(page.locator('.status-badge')).toHaveText('承認済');
  214 |   });
  215 | 
  216 |   test('should update status to 却下 when 却下 is clicked', async ({ page }) => {
  217 |     await page.click('#payment-create-btn');
  218 |     await page.click('[data-action-create-payment="POD-00005"]');
  219 |     await page.fill('#f-pmt-date', '2026-05-31');
  220 |     await page.click('button[type="submit"]');
  221 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  222 |     await page.click('[data-action-payment-status="承認待ち"]');
  223 |     await page.click('#payment-reject-btn');
  224 |     await page.locator('#approval-comment-input').fill('テスト却下理由');
  225 |     await page.locator('#approval-confirm-reject').click();
  226 |     // After rejection, navigateBackToApproval() fires; navigate back to verify status
  227 |     await page.locator('[data-route="payment"]').click();
  228 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  229 |     await expect(page.locator('.status-badge')).toHaveText('却下');
  230 |   });
  231 | 
  232 |   test('should return to payment list when 一覧に戻る is clicked from detail', async ({ page }) => {
  233 |     await page.click('[data-action-detail-payment="PMT-00001"]');
  234 |     await page.click('#payment-detail-back');
  235 |     await expect(page.locator('.data-table')).toBeVisible();
> 236 |   });
      |                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  237 | });
  238 | 
  239 | test.describe('S-10 支払登録', () => {
  240 |   test.beforeEach(async ({ page }) => {
  241 |     await page.goto('/');
  242 |     await page.fill('#user-id', 'finance01');
  243 |     await page.fill('#password', 'finance123');
  244 |     await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  245 |     await page.locator('[data-route="payment"]').click();
  246 |     await expect(page.locator('.data-table')).toBeVisible();
  247 |     // 支払依頼を作成して承認済にする
  248 |     await page.click('#payment-create-btn');
  249 |     await page.click('[data-action-create-payment="POD-00005"]');
  250 |     await page.fill('#f-pmt-date', '2026-05-31');
  251 |     await page.click('button[type="submit"]');
  252 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  253 |     await page.click('[data-action-payment-status="承認待ち"]');
  254 |     await page.click('#payment-approve-btn');
  255 |     await page.locator('#approval-confirm-approve').click();
  256 |     // After approval, navigateBackToApproval() fires; navigate back to payment detail
  257 |     await page.locator('[data-route="payment"]').click();
  258 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  259 |   });
  260 | 
  261 |   test('should show 支払登録 button for 承認済 payment', async ({ page }) => {
  262 |     await expect(page.locator('#payment-register-btn')).toBeVisible();
  263 |   });
  264 | 
  265 |   test('should show payment registration form when 支払登録 is clicked', async ({ page }) => {
  266 |     await page.click('#payment-register-btn');
  267 |     await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払登録' })).toBeVisible();
  268 |   });
  269 | 
  270 |   test('should show payment code in registration form', async ({ page }) => {
  271 |     await page.click('#payment-register-btn');
  272 |     await expect(page.locator('#f-pmte-code')).toContainText('PMT-00003');
  273 |   });
  274 | 
  275 |   test('should prefill amount from payment request', async ({ page }) => {
  276 |     await page.click('#payment-register-btn');
  277 |     const val = await page.locator('#f-pmte-amount').inputValue();
  278 |     expect(val).toBe('1100000');
  279 |   });
  280 | 
  281 |   test('should show validation error when paidDate is empty', async ({ page }) => {
  282 |     await page.click('#payment-register-btn');
  283 |     await page.click('button[type="submit"]');
  284 |     await expect(page.locator('.error-message')).toContainText('支払日は必須です');
  285 |   });
  286 | 
  287 |   test('should update status to 支払済 after registration', async ({ page }) => {
  288 |     await page.click('#payment-register-btn');
  289 |     await page.fill('#f-pmte-date', '2026-05-31');
  290 |     await page.click('button[type="submit"]');
  291 |     await expect(page.locator('.status-badge')).toHaveText('支払済');
  292 |   });
  293 | 
  294 |   test('should return to detail after registration', async ({ page }) => {
  295 |     await page.click('#payment-register-btn');
  296 |     await page.fill('#f-pmte-date', '2026-05-31');
  297 |     await page.click('button[type="submit"]');
  298 |     await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払依頼詳細' })).toBeVisible();
  299 |   });
  300 | 
  301 |   test('should not show 支払登録 button after payment is registered', async ({ page }) => {
  302 |     await page.click('#payment-register-btn');
  303 |     await page.fill('#f-pmte-date', '2026-05-31');
  304 |     await page.click('button[type="submit"]');
  305 |     await expect(page.locator('#payment-register-btn')).not.toBeVisible();
  306 |   });
  307 | 
  308 |   test('should return to detail when cancel is clicked', async ({ page }) => {
  309 |     await page.click('#payment-register-btn');
  310 |     await page.click('#payment-exec-cancel');
  311 |     await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払依頼詳細' })).toBeVisible();
  312 |   });
  313 | });
  314 | 
  315 | test.describe('P10-RT-01 支払却下フロー', () => {
  316 |   test.beforeEach(async ({ page }) => {
  317 |     await page.goto('/');
  318 |     await page.fill('#user-id', 'finance01');
  319 |     await page.fill('#password', 'finance123');
  320 |     await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  321 |     await page.locator('[data-route="payment"]').click();
  322 |     await expect(page.locator('.data-table')).toBeVisible();
  323 |     // Create PMT-00003 and submit for approval
  324 |     await page.click('#payment-create-btn');
  325 |     await page.click('[data-action-create-payment="POD-00005"]');
  326 |     await page.fill('#f-pmt-date', '2026-05-31');
  327 |     await page.click('button[type="submit"]');
  328 |     await page.click('[data-action-detail-payment="PMT-00003"]');
  329 |     await page.click('[data-action-payment-status="承認待ち"]');
  330 |   });
  331 | 
  332 |   test('should show 却下 status in payment detail after rejection', async ({ page }) => {
  333 |     // Arrange: reject PMT-00003
  334 |     await page.click('#payment-reject-btn');
  335 |     await page.locator('#approval-comment-input').fill('支払金額を確認してください');
  336 |     await page.locator('#approval-confirm-reject').click();
```