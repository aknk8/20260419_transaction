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

test.describe('P10-RT-01 請求却下→修正→再申請', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 下書きに戻す button on invoice detail after rejection', async ({ page }) => {
    // Submit INV-00003 (下書き) for approval then reject it
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await page.locator('#invoice-submit-approval-btn').click();
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="請求:INV-00003"]').click();
    await page.locator('#invoice-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額に誤りがあります');
    await page.locator('#approval-confirm-reject').click();
    // Navigate to invoice detail
    await page.locator('[data-route="invoice"]').click();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    await expect(page.locator('#invoice-return-draft-btn')).toBeVisible();
  });

  test('should complete full reject→return-to-draft→resubmit→approve flow for invoice', async ({ page }) => {
    // Step 1: Submit INV-00003 for approval
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await page.locator('#invoice-submit-approval-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');

    // Step 2: Reject from approval screen
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="請求:INV-00003"]').click();
    await page.locator('#invoice-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額に誤りがあります');
    await page.locator('#approval-confirm-reject').click();

    // Step 3: Verify 却下 status
    await page.locator('[data-route="invoice"]').click();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('却下');

    // Step 4: Return to draft
    await page.locator('#invoice-return-draft-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('下書き');

    // Step 5: Re-submit for approval
    await page.locator('#invoice-submit-approval-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');

    // Step 6: Approve from approval screen
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="請求:INV-00003"]').click();
    await page.locator('#invoice-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Step 7: Verify final approved status
    await page.locator('[data-route="invoice"]').click();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認済み');
  });
});
