# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: check_errors.spec.js >> check console errors after login
- Location: e2e\check_errors.spec.js:2:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-route="approval"]')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[data-route="approval"]')

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
  1  | import { test, expect } from '@playwright/test';
  2  | test('check console errors after login', async ({ page }) => {
  3  |   const errors = [];
  4  |   page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  5  |   page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
  6  |   await page.goto('/');
  7  |   await page.fill('#user-id', 'admin');
  8  |   await page.fill('#password', 'admin123');
  9  |   await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  10 |   await page.waitForTimeout(3000);
  11 |   console.log('BROWSER ERRORS AFTER LOGIN:', JSON.stringify(errors));
> 12 |   await expect(page.locator('[data-route="approval"]')).toBeVisible({ timeout: 10000 });
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  13 |   await page.locator('[data-route="approval"]').click();
  14 |   await page.waitForTimeout(2000);
  15 |   console.log('BROWSER ERRORS AFTER APPROVAL CLICK:', JSON.stringify(errors));
  16 | });
  17 | 
```