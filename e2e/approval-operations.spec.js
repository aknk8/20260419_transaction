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

test.describe('S-12 承認操作（承認/却下+コメント）', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 承認する button on quotation detail when status is 承認依頼中', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();

    await expect(page.locator('#quotation-approve-btn')).toBeVisible();
  });

  test('should show 却下 button on quotation detail when status is 承認依頼中', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();

    await expect(page.locator('#quotation-reject-btn')).toBeVisible();
  });

  test('should expand comment panel when 承認する is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();
    await page.locator('#quotation-approve-btn').click();

    await expect(page.locator('#approval-comment-input')).toBeVisible();
    await expect(page.locator('#approval-confirm-approve')).toBeVisible();
  });

  test('should expand comment panel when 却下 is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();
    await page.locator('#quotation-reject-btn').click();

    await expect(page.locator('#approval-comment-input')).toBeVisible();
    await expect(page.locator('#approval-confirm-reject')).toBeVisible();
  });

  test('should show error when 却下を確定 is clicked without comment', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();
    await page.locator('#quotation-reject-btn').click();

    await page.locator('#approval-confirm-reject').click();

    await expect(page.locator('.error-message')).toContainText('却下理由は必須です');
  });

  test('should return to approval list after approving quotation', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();
    await page.locator('#quotation-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should return to approval list after rejecting quotation with reason', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();
    await page.locator('#quotation-reject-btn').click();
    await page.fill('#approval-comment-input', '金額が予算を超過しています');
    await page.locator('#approval-confirm-reject').click();

    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should hide action panel when キャンセル is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();
    await page.locator('#quotation-reject-btn').click();
    await expect(page.locator('#approval-comment-input')).toBeVisible();

    await page.locator('#approval-action-cancel').click();

    await expect(page.locator('#approval-comment-input')).not.toBeVisible();
  });

  test('should show 承認する button on purchase order detail when status is 承認依頼中', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="発注:"]').first().click();

    await expect(page.locator('#pod-approve-btn')).toBeVisible();
  });

  test('should show 却下 button on purchase order detail when status is 承認依頼中', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="発注:"]').first().click();

    await expect(page.locator('#pod-reject-btn')).toBeVisible();
  });

  test('should return to approval list after approving purchase order', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="発注:"]').first().click();
    await page.locator('#pod-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    await expect(page.locator('.data-table')).toBeVisible();
  });
});
