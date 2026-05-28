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

test.describe('P0-10 承認ステップ表示＋承認履歴テーブル', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  });

  test('should show approval history section on order detail with 承認依頼中 status', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();

    await expect(page.locator('#approval-history-section')).toBeVisible();
  });

  test('should show 承認依頼中 status badge in approval history section', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();

    await expect(page.locator('#approval-history-section .status-badge')).toBeVisible();
    await expect(page.locator('#approval-history-section .status-badge')).toContainText('承認依頼中');
  });

  test('should record history entry when order approval is submitted', async ({ page }) => {
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00001"]').click();

    page.once('dialog', async dialog => { await dialog.dismiss(); });
    await page.locator('#order-submit-approval-btn').click();

    await expect(page.locator('#approval-history-section')).not.toBeVisible();
  });

  test('should record 承認 history entry after approving from approval list', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();
    await page.locator('#order-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    await page.locator('.sidebar [data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00006"]').click();

    await expect(page.locator('#approval-history-section')).toBeVisible();
    await expect(page.locator('#approval-history-section .detail-table-row')).toContainText('承認');
  });

  test('should record 却下 history entry with reason after rejecting', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();
    await page.locator('#order-reject-btn').click();
    await page.locator('#approval-comment-input').fill('添付書類不備のため却下します');
    await page.locator('#approval-confirm-reject').click();

    await page.locator('.sidebar [data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00006"]').click();

    await expect(page.locator('#approval-history-section .detail-table-row')).toContainText('却下');
    await expect(page.locator('#approval-history-section .detail-table-row')).toContainText('添付書類不備のため却下します');
  });

  test('should show approval history section on invoice detail with 承認依頼中 status', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();

    await expect(page.locator('#approval-history-section')).toBeVisible();
  });

  test('should show approval history section on purchase order detail with 承認依頼中 status', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="発注:"]').first().click();

    await expect(page.locator('#approval-history-section')).toBeVisible();
  });
});
