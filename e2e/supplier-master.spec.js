import { test, expect } from '@playwright/test';

test.describe('S-11 仕入先マスタ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="master"]').click();
    await page.locator('[data-master-tab="supplier"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display supplier list with 5 rows on supplier tab', async ({ page }) => {
    // Assert: 5件表示される
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
    // Assert: ページングテキストが表示される
    await expect(page.locator('.table-summary')).toContainText('全 5 件中');
  });

  test('should filter supplier list when keyword is entered in search box', async ({ page }) => {
    // Act: キーワード検索
    await page.locator('[data-table-input="search"]').fill('日本テクノロジー');

    // Assert: 1件だけ表示される
    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
    await expect(page.locator('.data-table')).toContainText('株式会社日本テクノロジー');
  });

  test('should switch between customer and supplier tabs', async ({ page }) => {
    // Assert: 仕入先タブがアクティブ
    await expect(page.locator('[data-master-tab="supplier"]')).toHaveClass(/is-active/);

    // Act: 顧客タブへ切り替え
    await page.locator('[data-master-tab="customer"]').click();

    // Assert: 顧客一覧が表示される
    await expect(page.locator('[data-master-tab="customer"]')).toHaveClass(/is-active/);
    await expect(page.locator('.data-table')).toContainText('顧客コード');
  });

  test('should show new registration form when new supplier button is clicked', async ({ page }) => {
    // Act
    await page.locator('#new-supplier-btn').click();

    // Assert: 登録フォームが表示される
    await expect(page.locator('#supplier-register-form')).toBeVisible();
    await expect(page.locator('.panel-title-text')).toContainText('仕入先マスタ登録');
  });

  test('should auto-fill supplier code with next sequential value when form opens', async ({ page }) => {
    // Act
    await page.locator('#new-supplier-btn').click();

    // Assert: 仕入先コードが SUP-006 と自動採番される
    await expect(page.locator('#f-code')).toHaveValue('SUP-006');
  });

  test('should register new supplier and show it in list when valid form is submitted', async ({ page }) => {
    // Arrange
    await page.locator('#new-supplier-btn').click();

    // Act: 必須フィールドをすべて入力
    await page.fill('#f-name', 'テスト仕入先株式会社');
    await page.fill('#f-contact', '山田 テスト');
    await page.fill('#f-payment-site', '翌月末');
    await page.locator('#supplier-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert: 一覧画面に戻る
    await expect(page.locator('.data-table')).toBeVisible();
    // Assert: 登録した仕入先名が表示される
    await expect(page.locator('.data-table')).toContainText('テスト仕入先株式会社');
  });

  test('should show edit button per row for admin user', async ({ page }) => {
    // Assert: 編集ボタンが各行に表示される
    const editBtns = page.locator('[data-action-edit-supplier]');
    await expect(editBtns.first()).toBeVisible();
  });

  test('should pre-fill form with existing supplier data when edit button is clicked', async ({ page }) => {
    // Act: 1行目の編集ボタンをクリック
    await page.locator('[data-action-edit-supplier]').first().click();

    // Assert: フォームに既存データが入っている
    await expect(page.locator('#supplier-register-form')).toBeVisible();
    await expect(page.locator('#f-code')).toHaveAttribute('readonly', '');
    await expect(page.locator('#f-name')).not.toHaveValue('');
  });

  test('should update supplier and show changes in list when edit form is saved', async ({ page }) => {
    // Arrange: SUP-001 の編集ボタンをクリック
    await page.locator('[data-action-edit-supplier="SUP-001"]').click();
    await expect(page.locator('#supplier-register-form')).toBeVisible();

    // Act: 仕入先名を変更して更新
    await page.fill('#f-name', '株式会社日本テクノロジー（改）');
    await page.locator('#supplier-register-form').getByRole('button', { name: '更新する' }).click();

    // Assert: 一覧に戻り変更が反映されている
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('株式会社日本テクノロジー（改）');
  });

  test('should return to list when cancel button is clicked on registration form', async ({ page }) => {
    // Arrange
    await page.locator('#new-supplier-btn').click();
    await expect(page.locator('#supplier-register-form')).toBeVisible();

    // Act
    await page.locator('#supplier-form-cancel').click();

    // Assert: 一覧画面に戻る（フォームが消える）
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('#supplier-register-form')).not.toBeVisible();
  });
});

test.describe('P10-RT-02 仕入先マスタ バリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="master"]').click();
    await page.locator('[data-master-tab="supplier"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('#new-supplier-btn').click();
    await expect(page.locator('#supplier-register-form')).toBeVisible();
  });

  test('should show 仕入先名は必須です error when name is empty on submit', async ({ page }) => {
    // Arrange: provide payment site but leave name empty
    await page.fill('#f-payment-site', '翌月末');

    // Act
    await page.locator('#supplier-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '仕入先名は必須です。' })).toBeVisible();
  });

  test('should show multiple field errors simultaneously when all required fields are empty on submit', async ({ page }) => {
    // Act
    await page.locator('#supplier-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert: both required field errors shown simultaneously
    await expect(page.locator('.field-error').filter({ hasText: '仕入先名は必須です。' })).toBeVisible();
    await expect(page.locator('.field-error').filter({ hasText: '支払サイトは必須です。' })).toBeVisible();
  });

  test('should show 仕入先コードはすでに使用されています error when duplicate code is entered', async ({ page }) => {
    // Arrange: change auto-filled code to existing SUP-001
    await page.fill('#f-code', 'SUP-001');
    await page.fill('#f-name', 'テスト仕入先');
    await page.fill('#f-payment-site', '翌月末');

    // Act
    await page.locator('#supplier-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '仕入先コードはすでに使用されています。' })).toBeVisible();
  });
});

test.describe('S-11 仕入先マスタ 権限制御', () => {
  test('should show supplier list for sales01 user on supplier tab', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="master"]').click();

    // Act
    await page.locator('[data-master-tab="supplier"]').click();

    // Assert: 仕入先一覧が参照できる
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table-body-row')).toHaveCount(6);
  });

  test('should not show edit button or new registration button for sales01 user on supplier tab', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="master"]').click();
    await page.locator('[data-master-tab="supplier"]').click();
    await expect(page.locator('.data-table')).toBeVisible();

    // Assert: 新規登録ボタンが表示されない
    await expect(page.locator('#new-supplier-btn')).not.toBeVisible();
    // Assert: 編集ボタンが表示されない
    await expect(page.locator('[data-action-edit-supplier]')).toHaveCount(0);
  });
});
