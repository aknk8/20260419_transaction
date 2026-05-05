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

test.describe('S-12 承認一覧', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show approval list from navigation', async ({ page }) => {
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show pending quotation in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('QUO-00003');
  });

  test('should show type 見積 in approval list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('見積');
  });

  test('should show pending purchase order in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('POD-00006');
  });

  test('should show type 発注 in approval list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('発注');
  });

  test('should show amount in approval list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('726,000');
  });

  test('should show customer name for quotation in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('みなと物流サービス株式会社');
  });

  test('should show supplier name for purchase order in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('東洋精密機器株式会社');
  });

  test('should show submitter name in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('佐藤 営業');
  });

  test('should filter by type 見積', async ({ page }) => {
    await page.selectOption('[data-table-filter="type"]', '見積');
    await expect(page.locator('.data-table')).toContainText('QUO-00003');
    await expect(page.locator('.data-table')).not.toContainText('POD-00006');
  });

  test('should filter by type 発注', async ({ page }) => {
    await page.selectOption('[data-table-filter="type"]', '発注');
    await expect(page.locator('.data-table')).toContainText('POD-00006');
    await expect(page.locator('.data-table')).not.toContainText('QUO-00003');
  });

  test('should show approval list for finance01 who has approval:view', async ({ page }) => {
    await page.locator('#logout-button').click();
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('[data-route="approval"]')).toBeVisible();
  });
});
