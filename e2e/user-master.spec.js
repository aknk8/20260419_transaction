import { test, expect } from '@playwright/test';

test.describe('S-11 ユーザ管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="master"]').click();
    await page.locator('[data-master-tab="user"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display user list with 3 rows on user tab', async ({ page }) => {
    // Assert: 3件表示される
    await expect(page.locator('.data-table-body-row')).toHaveCount(3);
    await expect(page.locator('.table-summary')).toContainText('全 3 件中');
  });

  test('should filter user list when keyword is entered in search box', async ({ page }) => {
    // Act
    await page.locator('[data-table-input="search"]').fill('佐藤');

    // Assert: 1件だけ表示される
    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
    await expect(page.locator('.data-table')).toContainText('佐藤 営業');
  });

  test('should show new registration form when new user button is clicked', async ({ page }) => {
    // Act
    await page.locator('#new-user-btn').click();

    // Assert
    await expect(page.locator('#user-register-form')).toBeVisible();
    await expect(page.locator('.panel-title-text')).toContainText('ユーザ登録');
  });

  test('should register new user and show it in list when valid form is submitted', async ({ page }) => {
    // Arrange
    await page.locator('#new-user-btn').click();

    // Act
    await page.fill('#f-user-id', 'newuser01');
    await page.fill('#f-password', 'pass123');
    await page.fill('#f-user-name', '山田 新規');
    await page.selectOption('#f-user-type', '一般ユーザ');
    await page.selectOption('#f-user-department', '営業部門');
    await page.fill('#f-position', '担当者');
    await page.locator('#user-register-form').getByRole('button', { name: '登録する' }).click();

    // Assert: 一覧に戻り登録したユーザが表示される
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('山田 新規');
  });

  test('should show edit button per row for admin user', async ({ page }) => {
    // Assert
    const editBtns = page.locator('[data-action-edit-user]');
    await expect(editBtns.first()).toBeVisible();
  });

  test('should pre-fill form with existing user data when edit button is clicked', async ({ page }) => {
    // Act
    await page.locator('[data-action-edit-user="sales01"]').click();

    // Assert
    await expect(page.locator('#user-register-form')).toBeVisible();
    await expect(page.locator('#f-user-id')).toHaveAttribute('readonly', '');
    await expect(page.locator('#f-user-name')).toHaveValue('佐藤 営業');
  });

  test('should update user and show changes in list when edit form is saved', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-edit-user="sales01"]').click();
    await expect(page.locator('#user-register-form')).toBeVisible();

    // Act: 氏名を変更して更新
    await page.fill('#f-user-name', '佐藤 営業（改）');
    await page.locator('#user-register-form').getByRole('button', { name: '更新する' }).click();

    // Assert
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('佐藤 営業（改）');
  });

  test('should return to list when cancel button is clicked', async ({ page }) => {
    // Arrange
    await page.locator('#new-user-btn').click();
    await expect(page.locator('#user-register-form')).toBeVisible();

    // Act
    await page.locator('#user-form-cancel').click();

    // Assert
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('#user-register-form')).not.toBeVisible();
  });
});

test.describe('S-11 支払条件・税率マスタ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="master"]').click();
  });

  test('should display payment term list on payment-term tab', async ({ page }) => {
    // Act
    await page.locator('[data-master-tab="payment-term"]').click();

    // Assert
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table-body-row')).toHaveCount(4);
    await expect(page.locator('.data-table')).toContainText('翌月末払い');
  });

  test('should display tax rate list on tax-rate tab', async ({ page }) => {
    // Act
    await page.locator('[data-master-tab="tax-rate"]').click();

    // Assert
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table-body-row')).toHaveCount(3);
    await expect(page.locator('.data-table')).toContainText('標準税率');
  });
});

test.describe('S-11 ユーザ管理 権限制御', () => {
  test('should not show user tab for sales01 user', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="master"]').click();

    // Assert: ユーザ管理タブが表示されない
    await expect(page.locator('[data-master-tab="user"]')).not.toBeVisible();
  });

  test('should prevent login for stopped user', async ({ page }) => {
    // Arrange: admin でログインして sales01 を停止に変更
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="master"]').click();
    await page.locator('[data-master-tab="user"]').click();
    await page.locator('[data-action-edit-user="sales01"]').click();
    await page.selectOption('#f-user-status', '停止');
    await page.locator('#user-register-form').getByRole('button', { name: '更新する' }).click();

    // Act: ログアウトして sales01 でログイン試行
    await page.locator('#logout-button').click();
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    // Assert: ログイン失敗メッセージが表示される
    await expect(page.locator('#feedback')).toContainText('停止');
  });
});
