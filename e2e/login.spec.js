import { test, expect } from './fixtures.js';

// P1移行後: 認証はAPIを通じて行われるため、Playwrightのルートインターセプトでモック
const adminUser = { id: 'admin', name: '中村 管理者', userType: 'システム管理者' };

async function setupPage(page, { loginResponse } = {}) {
  // ページロード時の initSession() → /api/auth/me は未ログイン状態を返す
  await page.route('/api/auth/me', (route) =>
    route.fulfill({ status: 401, body: '{}' })
  );

  // ログイン API のモック
  await page.route('/api/auth/login', (route) =>
    route.fulfill(
      loginResponse ?? {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: adminUser })
      }
    )
  );

  // ログアウト API のモック
  await page.route('/api/auth/logout', (route) =>
    route.fulfill({ status: 200, body: '{}' })
  );

  await page.goto('/');
}

test.describe('S-01 ログイン', () => {
  test('should navigate to dashboard when valid admin credentials are submitted', async ({ page }) => {
    // Arrange
    await setupPage(page);

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
    await setupPage(page);

    // Act
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    // Assert: admin に許可された全メニューが表示される
    await expect(page.locator('.sidebar [data-route="dashboard"]')).toBeVisible();
    await expect(page.locator('.sidebar [data-route="master"]')).toBeVisible();
    await expect(page.locator('.sidebar [data-route="approval"]')).toBeVisible();
    await expect(page.locator('.sidebar [data-route="report"]')).toBeVisible();
  });

  test('should return to login screen when logout button is clicked', async ({ page }) => {
    // Arrange: ログイン済み状態にする
    await setupPage(page);
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

  test('should show error message when credentials are invalid', async ({ page }) => {
    // Arrange
    await setupPage(page, { loginResponse: { status: 401, body: '{}' } });

    // Act
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'wrongpassword');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    // Assert: エラーメッセージが表示される
    await expect(page.locator('.feedback-error')).toContainText('ユーザ ID またはパスワードが正しくありません');
  });

  test('should show login form on initial load before authentication', async ({ page }) => {
    // Arrange & Act
    await setupPage(page);

    // Assert: 未認証状態ではログインフォームが表示される
    await expect(page.locator('#login-form')).toBeVisible();
    await expect(page.locator('.workspace')).not.toBeVisible();
  });
});
