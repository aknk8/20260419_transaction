import { test, expect } from '@playwright/test';

test.describe('S-11 マスタ管理 権限制御', () => {
  test('should show master menu and customer list for sales01 user', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    // Act
    await page.locator('[data-route="master"]').click();

    // Assert: 顧客一覧が参照できる
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
  });

  test('should not show edit button or new registration button for sales01 user', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="master"]').click();
    await expect(page.locator('.data-table')).toBeVisible();

    // Assert: 新規登録ボタンが表示されない
    await expect(page.locator('#new-customer-btn')).not.toBeVisible();
    // Assert: 編集ボタンが表示されない
    await expect(page.locator('[data-action-edit]')).toHaveCount(0);
  });

  test('should show master menu and customer list for finance01 user', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    // Act
    await page.locator('[data-route="master"]').click();

    // Assert: 顧客一覧が参照できる
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
  });
});
