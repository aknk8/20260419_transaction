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

test.describe('P0-09 請求承認フロー（3段階）', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  });

  test('should show 承認依頼 button on invoice detail when status is 下書き', async ({ page }) => {
    await page.locator('[data-route="invoice"]').click();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    await expect(page.locator('#invoice-submit-approval-btn')).toBeVisible();
  });

  test('should change status to 承認依頼中 when 承認依頼 is clicked', async ({ page }) => {
    await page.locator('[data-route="invoice"]').click();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await page.locator('#invoice-submit-approval-btn').click();

    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');
  });

  test('should show 承認する and 却下 buttons on invoice detail when status is 承認依頼中', async ({ page }) => {
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();

    await expect(page.locator('#invoice-approve-btn')).toBeVisible();
    await expect(page.locator('#invoice-reject-btn')).toBeVisible();
  });

  test('should expand comment panel when 承認する is clicked on invoice detail', async ({ page }) => {
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();
    await page.locator('#invoice-approve-btn').click();

    await expect(page.locator('#approval-comment-input')).toBeVisible();
    await expect(page.locator('#approval-confirm-approve')).toBeVisible();
  });

  test('should approve invoice and return to approval list', async ({ page }) => {
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();
    await page.locator('#invoice-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page).toHaveURL(/#approval/);
  });

  test('should show 確定する button after approval (stage 3)', async ({ page }) => {
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();
    await page.locator('#invoice-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    await page.locator('[data-route="invoice"]').click();
    await page.locator('[data-action-detail-invoice="INV-00005"]').click();

    await expect(page.locator('[data-action-invoice-status="確定"]')).toBeVisible();
  });

  test('should expand comment panel when 却下 is clicked', async ({ page }) => {
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();
    await page.locator('#invoice-reject-btn').click();

    await expect(page.locator('#approval-comment-input')).toBeVisible();
    await expect(page.locator('#approval-confirm-reject')).toBeVisible();
  });

  test('should show error when 却下 confirmed without comment', async ({ page }) => {
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();
    await page.locator('#invoice-reject-btn').click();
    await page.locator('#approval-confirm-reject').click();

    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should reject invoice with comment and return to approval list', async ({ page }) => {
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();
    await page.locator('#invoice-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額に誤りがあります');
    await page.locator('#approval-confirm-reject').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page).toHaveURL(/#approval/);
  });

  test('should show 承認一覧に戻る button when navigating from approval list', async ({ page }) => {
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval^="請求:"]').first().click();

    await expect(page.locator('#invoice-detail-back')).toContainText('承認一覧に戻る');
  });
});
