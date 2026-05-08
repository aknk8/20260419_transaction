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

test.describe('S-02 ダッシュボード', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('.dashboard-grid')).toBeVisible();
  });

  test('should show dashboard on login', async ({ page }) => {
    await expect(page.locator('.dashboard-grid')).toBeVisible();
  });

  test('should show 承認待ち metric card', async ({ page }) => {
    await expect(page.locator('.metrics-row')).toContainText('承認待ち');
  });

  test('should show 未請求 metric card', async ({ page }) => {
    await expect(page.locator('.metrics-row')).toContainText('未請求');
  });

  test('should show 未収 metric card', async ({ page }) => {
    await expect(page.locator('.metrics-row')).toContainText('未収');
  });

  test('should show 未払 metric card', async ({ page }) => {
    await expect(page.locator('.metrics-row')).toContainText('未払');
  });

  test('should show 承認待ち count as 04', async ({ page }) => {
    const card = page.locator('.metric-card').filter({ hasText: '承認待ち' });
    await expect(card.locator('.metric-value')).toContainText('04');
  });

  test('should show 未請求 count as 01', async ({ page }) => {
    const card = page.locator('.metric-card').filter({ hasText: '未請求' });
    await expect(card.locator('.metric-value')).toContainText('01');
  });

  test('should show 未収 count as 02', async ({ page }) => {
    const card = page.locator('.metric-card').filter({ hasText: '未収' });
    await expect(card.locator('.metric-value')).toContainText('02');
  });

  test('should show 未払 count as 01', async ({ page }) => {
    const card = page.locator('.metric-card').filter({ hasText: '未払' });
    await expect(card.locator('.metric-value')).toContainText('01');
  });

  test('should show QUO-00003 in pending approvals panel', async ({ page }) => {
    await expect(page.locator('.narrow-panel')).toContainText('QUO-00003');
  });

  test('should show POD-00006 in pending approvals panel', async ({ page }) => {
    await expect(page.locator('.narrow-panel')).toContainText('POD-00006');
  });

  test('should show dashboard nav item for finance01', async ({ page }) => {
    await page.locator('#logout-button').click();
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('[data-route="dashboard"]')).toBeVisible();
  });
});
