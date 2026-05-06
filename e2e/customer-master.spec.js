import { test, expect } from '@playwright/test';

const adminUser = { id: 'admin', name: '中村 管理者', userType: 'システム管理者' };

async function setupPage(page) {
  await page.route('/api/**', (route) => {
    if (route.request().method() === 'GET') {
      route.abort();
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await page.route('/api/auth/me', (route) =>
    route.fulfill({ status: 401, body: '{}' })
  );
  await page.route('/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: adminUser })
    })
  );
  await page.route('/api/auth/logout', (route) =>
    route.fulfill({ status: 200, body: '{}' })
  );
  await page.goto('/');
}

test.describe('S-11 顧客マスタ', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="master"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display all 9 customers when default page size is 20', async ({ page }) => {
    await expect(page.locator('.data-table-body-row')).toHaveCount(9);
    await expect(page.locator('.table-summary')).toContainText('全 9 件中');
  });

  test('should filter customer list when keyword is entered in search box', async ({ page }) => {
    // Arrange: beforeEach でマスタ管理画面を表示済み

    // Act: キーワード検索
    await page.locator('[data-table-input="search"]').fill('青葉');

    // Assert: 1件だけ表示される
    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
    await expect(page.locator('.data-table')).toContainText('株式会社青葉システム');
  });

  test('should show new registration form when new customer button is clicked', async ({ page }) => {
    // Arrange: beforeEach でマスタ管理画面を表示済み

    // Act
    await page.locator('#new-customer-btn').click();

    // Assert: 登録フォームが表示される
    await expect(page.locator('#customer-register-form')).toBeVisible();
    await expect(page.locator('.panel-title-text')).toContainText('顧客マスタ登録');
  });

  test('should auto-fill customer code with next sequential value when form opens', async ({ page }) => {
    // Arrange: beforeEach でマスタ管理画面を表示済み（既存コード CUS-001〜009）

    // Act
    await page.locator('#new-customer-btn').click();

    // Assert: 顧客コードが CUS-010 と自動採番される
    await expect(page.locator('#f-code')).toHaveValue('CUS-010');
  });

  test('should register new customer and show it in list when valid form is submitted', async ({ page }) => {
    // Arrange
    await page.locator('#new-customer-btn').click();

    // Act: 必須フィールドをすべて入力
    await page.fill('#f-name', 'テスト株式会社');
    await page.selectOption('#f-department', '営業部門');
    await page.fill('#f-contact', '田中 テスト');
    await page.selectOption('#f-closing-day', '末日');
    await page.fill('#f-payment-site', '翌月末');
    await page.fill('#f-billing-to', 'テスト本社');
    await page.locator('#customer-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert: 一覧画面に戻る
    await expect(page.locator('.data-table')).toBeVisible();
    // Assert: 登録した顧客名が表示される
    await expect(page.locator('.data-table')).toContainText('テスト株式会社');
  });

  test('should show edit button per row for admin user', async ({ page }) => {
    // Assert: 編集ボタンが各行に表示される
    const editBtns = page.locator('[data-action-edit]');
    await expect(editBtns.first()).toBeVisible();
  });

  test('should pre-fill form with existing customer data when edit button is clicked', async ({ page }) => {
    // Act: 1行目の編集ボタンをクリック
    await page.locator('[data-action-edit]').first().click();

    // Assert: フォームに既存データが入っている
    await expect(page.locator('#customer-register-form')).toBeVisible();
    await expect(page.locator('#f-code')).toHaveAttribute('readonly', '');
    await expect(page.locator('#f-name')).not.toHaveValue('');
  });

  test('should update customer and show changes in list when edit form is saved', async ({ page }) => {
    // Arrange: CUS-001 の編集ボタンをクリック
    await page.locator('[data-action-edit="CUS-001"]').click();
    await expect(page.locator('#customer-register-form')).toBeVisible();

    // Act: 顧客名を変更して更新
    await page.fill('#f-name', '株式会社青葉システム（改）');
    await page.locator('#customer-register-form').getByRole('button', { name: '更新する' }).click();

    // Assert: 一覧に戻り変更が反映されている
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('株式会社青葉システム（改）');
  });

  test('should return to list when cancel button is clicked on registration form', async ({ page }) => {
    // Arrange
    await page.locator('#new-customer-btn').click();
    await expect(page.locator('#customer-register-form')).toBeVisible();

    // Act
    await page.locator('#customer-form-cancel').click();

    // Assert: 一覧画面に戻る（フォームが消える）
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('#customer-register-form')).not.toBeVisible();
  });
});

test.describe('P10-RT-02 顧客マスタ バリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="master"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('#new-customer-btn').click();
    await expect(page.locator('#customer-register-form')).toBeVisible();
  });

  test('should show 顧客名は必須です error when name is empty on submit', async ({ page }) => {
    // Arrange: select required fields, leave name empty
    await page.selectOption('#f-department', '営業部門');
    await page.selectOption('#f-closing-day', '末日');
    await page.fill('#f-payment-site', '翌月末');

    // Act
    await page.locator('#customer-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '顧客名は必須です。' })).toBeVisible();
  });

  test('should show multiple field errors when all required fields are empty on submit', async ({ page }) => {
    // Arrange: all fields at defaults (name empty, selects at placeholder)

    // Act
    await page.locator('#customer-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '顧客名は必須です。' })).toBeVisible();
    await expect(page.locator('.field-error').filter({ hasText: '主管部門は必須です。' })).toBeVisible();
  });

  test('should show 顧客コードはすでに使用されています error when duplicate code is entered', async ({ page }) => {
    // Arrange: change auto-filled code to existing CUS-001
    await page.fill('#f-code', 'CUS-001');
    await page.fill('#f-name', 'テスト顧客');
    await page.selectOption('#f-department', '営業部門');
    await page.selectOption('#f-closing-day', '末日');
    await page.fill('#f-payment-site', '翌月末');

    // Act
    await page.locator('#customer-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '顧客コードはすでに使用されています。' })).toBeVisible();
  });
});
