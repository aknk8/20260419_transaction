import { test, expect } from './fixtures.js';

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

test.describe('P0-11 S-15 承認ルート設定タブ', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="settings"]').click();
  });

  test('should show 承認ルート設定 tab in settings screen', async ({ page }) => {
    await expect(page.locator('[data-settings-tab="approval-route"]')).toBeVisible();
    await expect(page.locator('[data-settings-tab="approval-route"]')).toContainText('承認ルート設定');
  });

  test('should show approval route settings panel when tab is clicked', async ({ page }) => {
    await page.locator('[data-settings-tab="approval-route"]').click();

    await expect(page.locator('.panel')).toBeVisible();
    await expect(page.locator('.panel-title-text')).toContainText('承認ルート設定');
  });

  test('should show document type selector in approval route tab', async ({ page }) => {
    await page.locator('[data-settings-tab="approval-route"]').click();

    await expect(page.locator('[data-action-route-doctype]')).toBeVisible();
  });

  test('should show default quotation routes when tab is first opened', async ({ page }) => {
    await page.locator('[data-settings-tab="approval-route"]').click();

    await expect(page.locator('.data-table')).toContainText('第 1 ステップ');
  });

  test('should show AND condition hint text', async ({ page }) => {
    await page.locator('[data-settings-tab="approval-route"]').click();

    await expect(page.locator('.field-hint')).toContainText('AND条件');
  });

  test('should switch routes when document type is changed', async ({ page }) => {
    await page.locator('[data-settings-tab="approval-route"]').click();
    await page.locator('[data-action-route-doctype]').selectOption('order');

    await expect(page.locator('.data-table')).toContainText('第 1 ステップ');
  });

  test('should add a new step when approver is selected and button clicked', async ({ page }) => {
    await page.locator('[data-settings-tab="approval-route"]').click();
    await page.locator('#s-route-new-approver').selectOption({ index: 1 });
    await page.locator('#s-route-add-step').click();

    const rows = page.locator('.data-table-body-row');
    await expect(rows).toHaveCount(3);
  });

  test('should remove a step when 削除 button is clicked', async ({ page }) => {
    await page.locator('[data-settings-tab="approval-route"]').click();
    const rowsBefore = await page.locator('.data-table-body-row').count();
    await page.locator('[data-action-remove-route]').first().click();

    await expect(page.locator('.data-table-body-row')).toHaveCount(rowsBefore - 1);
  });
});
