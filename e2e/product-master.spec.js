import { test, expect } from '@playwright/test';

test.describe('S-11 商品マスタ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="master"]').click();
    await page.locator('[data-master-tab="product"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display product list with 5 rows on product tab', async ({ page }) => {
    // Assert: 5件表示される
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
    // Assert: ページングテキストが表示される
    await expect(page.locator('.table-summary')).toContainText('全 5 件中');
  });

  test('should filter product list when keyword is entered in search box', async ({ page }) => {
    // Act: キーワード検索
    await page.locator('[data-table-input="search"]').fill('サーバー');

    // Assert: 1件だけ表示される
    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
    await expect(page.locator('.data-table')).toContainText('サーバー保守サービス');
  });

  test('should show new registration form when new product button is clicked', async ({ page }) => {
    // Act
    await page.locator('#new-product-btn').click();

    // Assert: 登録フォームが表示される
    await expect(page.locator('#product-register-form')).toBeVisible();
    await expect(page.locator('.panel-title-text')).toContainText('商品マスタ登録');
  });

  test('should auto-fill product code with next sequential value when form opens', async ({ page }) => {
    // Act
    await page.locator('#new-product-btn').click();

    // Assert: 商品コードが PRD-006 と自動採番される
    await expect(page.locator('#f-code')).toHaveValue('PRD-006');
  });

  test('should register new product and show it in list when valid form is submitted', async ({ page }) => {
    // Arrange
    await page.locator('#new-product-btn').click();

    // Act: 必須フィールドをすべて入力
    await page.fill('#f-name', 'テスト商品サービス');
    await page.selectOption('#f-unit', '月');
    await page.fill('#f-unit-price', '30000');
    await page.selectOption('#f-tax', '課税');
    await page.locator('#product-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert: 一覧画面に戻る
    await expect(page.locator('.data-table')).toBeVisible();
    // Assert: 登録した商品名が表示される
    await expect(page.locator('.data-table')).toContainText('テスト商品サービス');
  });

  test('should show edit button per row for admin user', async ({ page }) => {
    // Assert: 編集ボタンが各行に表示される
    const editBtns = page.locator('[data-action-edit-product]');
    await expect(editBtns.first()).toBeVisible();
  });

  test('should pre-fill form with existing product data when edit button is clicked', async ({ page }) => {
    // Act: 1行目の編集ボタンをクリック
    await page.locator('[data-action-edit-product]').first().click();

    // Assert: フォームに既存データが入っている
    await expect(page.locator('#product-register-form')).toBeVisible();
    await expect(page.locator('#f-code')).toHaveAttribute('readonly', '');
    await expect(page.locator('#f-name')).not.toHaveValue('');
  });

  test('should update product and show changes in list when edit form is saved', async ({ page }) => {
    // Arrange: PRD-001 の編集ボタンをクリック
    await page.locator('[data-action-edit-product="PRD-001"]').click();
    await expect(page.locator('#product-register-form')).toBeVisible();

    // Act: 商品名を変更して更新
    await page.fill('#f-name', 'サーバー保守サービス（改）');
    await page.locator('#product-register-form').getByRole('button', { name: '更新する' }).click();

    // Assert: 一覧に戻り変更が反映されている
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('サーバー保守サービス（改）');
  });

  test('should return to list when cancel button is clicked on registration form', async ({ page }) => {
    // Arrange
    await page.locator('#new-product-btn').click();
    await expect(page.locator('#product-register-form')).toBeVisible();

    // Act
    await page.locator('#product-form-cancel').click();

    // Assert: 一覧画面に戻る（フォームが消える）
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('#product-register-form')).not.toBeVisible();
  });

  test('should show all three tabs on master screen', async ({ page }) => {
    // Assert: 3つのタブが表示される
    await expect(page.locator('[data-master-tab="customer"]')).toBeVisible();
    await expect(page.locator('[data-master-tab="supplier"]')).toBeVisible();
    await expect(page.locator('[data-master-tab="product"]')).toBeVisible();
  });
});

test.describe('S-11 商品マスタ 権限制御', () => {
  test('should show product list for sales01 user on product tab', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="master"]').click();

    // Act
    await page.locator('[data-master-tab="product"]').click();

    // Assert: 商品一覧が参照できる
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table-body-row')).toHaveCount(6);
  });

  test('should not show edit button or new registration button for sales01 user on product tab', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="master"]').click();
    await page.locator('[data-master-tab="product"]').click();
    await expect(page.locator('.data-table')).toBeVisible();

    // Assert: 新規登録ボタンが表示されない
    await expect(page.locator('#new-product-btn')).not.toBeVisible();
    // Assert: 編集ボタンが表示されない
    await expect(page.locator('[data-action-edit-product]')).toHaveCount(0);
  });
});
