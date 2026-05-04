import { test, expect } from '@playwright/test';

test.describe('S-01 ログイン', () => {
  test('should navigate to dashboard when valid admin credentials are submitted', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    // Assert: アプリシェルとダッシュボードが表示される
    await expect(page.locator('.workspace')).toBeVisible();
    await expect(page.locator('.identity-name')).toContainText('中村 管理者');
    await expect(page.locator('.page-title')).toContainText('ダッシュボード');
  });

  test('should display all permitted menu items for admin user after login', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    // Assert: admin に許可された全メニューが表示される
    await expect(page.locator('[data-route="dashboard"]')).toBeVisible();
    await expect(page.locator('[data-route="master"]')).toBeVisible();
    await expect(page.locator('[data-route="approval"]')).toBeVisible();
    await expect(page.locator('[data-route="report"]')).toBeVisible();
  });

  test('should return to login screen when logout button is clicked', async ({ page }) => {
    // Arrange: ログイン済み状態にする
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('.workspace')).toBeVisible();

    // Act
    await page.locator('#logout-button').click();

    // Assert: ログイン画面に戻る
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('.feedback-success')).toContainText('ログアウトしました');
  });
});
