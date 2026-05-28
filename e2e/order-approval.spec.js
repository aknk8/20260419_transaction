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

test.describe('P0-08 受注承認フロー', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  });

  test('should show 承認する and 却下 buttons on order detail when status is 承認依頼中', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();

    await expect(page.locator('#order-approve-btn')).toBeVisible();
    await expect(page.locator('#order-reject-btn')).toBeVisible();
  });

  test('should expand comment panel when 承認する is clicked on order detail', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();
    await page.locator('#order-approve-btn').click();

    await expect(page.locator('#approval-comment-input')).toBeVisible();
    await expect(page.locator('#approval-confirm-approve')).toBeVisible();
  });

  test('should approve order and return to approval list', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();
    await page.locator('#order-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page).toHaveURL(/#approval/);
  });

  test('should expand comment panel when 却下 is clicked on order detail', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();
    await page.locator('#order-reject-btn').click();

    await expect(page.locator('#approval-comment-input')).toBeVisible();
    await expect(page.locator('#approval-confirm-reject')).toBeVisible();
  });

  test('should show error when 却下 is confirmed without comment', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();
    await page.locator('#order-reject-btn').click();
    await page.locator('#approval-confirm-reject').click();

    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should reject order with comment and return to approval list', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();
    await page.locator('#order-reject-btn').click();
    await page.locator('#approval-comment-input').fill('添付書類不備のため却下');
    await page.locator('#approval-confirm-reject').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page).toHaveURL(/#approval/);
  });

  test('should show 承認依頼 button on order detail when status is 受注済み', async ({ page }) => {
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00001"]').click();

    await expect(page.locator('#order-submit-approval-btn')).toBeVisible();
  });

  test('should show error when submitting approval without attachment', async ({ page }) => {
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00001"]').click();

    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('添付');
      await dialog.dismiss();
    });
    await page.locator('#order-submit-approval-btn').click();
  });

  test('should show 承認一覧に戻る button when navigating from approval list', async ({ page }) => {
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="受注:"]').first().click();

    await expect(page.locator('#order-detail-back')).toBeVisible();
  });
});
