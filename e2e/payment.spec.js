import { test, expect } from '@playwright/test';

test.describe('S-10 支払依頼作成', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="payment"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 支払依頼作成 button for user with payment:edit', async ({ page }) => {
    await expect(page.locator('#payment-create-btn')).toBeVisible();
  });

  test('should show payable purchase orders when 支払依頼作成 is clicked', async ({ page }) => {
    await page.click('#payment-create-btn');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払対象' })).toBeVisible();
  });

  test('should show payable PO in extraction list', async ({ page }) => {
    await page.click('#payment-create-btn');
    await expect(page.locator('.detail-table')).toContainText('POD-00005');
  });

  test('should show payment form when 依頼作成 is clicked', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払依頼登録' })).toBeVisible();
  });

  test('should show purchase order code in payment form', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await expect(page.locator('#f-pmt-po-code')).toContainText('POD-00005');
  });

  test('should show default amount from purchase order in form', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await expect(page.locator('#f-pmt-amount')).toBeVisible();
    const val = await page.locator('#f-pmt-amount').inputValue();
    expect(val).toBe('1100000');
  });

  test('should show validation error when paymentDate is empty', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('支払予定日は必須です');
  });

  test('should show validation error when amount is empty', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.fill('#f-pmt-amount', '');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('支払金額は必須です');
  });

  test('should create payment and return to list', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show new payment code in list after creation', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await expect(page.locator('.data-table')).toContainText('PMT-00003');
  });

  test('should not show paid PO in payable list', async ({ page }) => {
    await page.click('#payment-create-btn');
    await expect(page.locator('.detail-table')).not.toContainText('POD-00003');
  });

  test('should return to payable list when cancel is clicked', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.click('#payment-form-cancel');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払対象' })).toBeVisible();
  });

  test('should return to payment list when 一覧に戻る is clicked', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('#payment-back-to-list');
    await expect(page.locator('.data-table')).toBeVisible();
  });
});

test.describe('S-10 支払依頼一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="payment"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show payment list from navigation', async ({ page }) => {
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show payment code in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('PMT-00001');
  });

  test('should show purchase order code in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('POD-00003');
  });

  test('should show supplier name in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('アジア部品サプライ株式会社');
  });

  test('should show payment status badge in list', async ({ page }) => {
    await expect(page.locator('.status-badge').filter({ hasText: '支払済' })).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    await page.selectOption('[data-table-filter="status"]', '下書き');
    await expect(page.locator('.data-table')).toContainText('支払依頼データがありません');
  });

  test('should show payment list for finance01 who has payment:view', async ({ page }) => {
    await page.locator('#logout-button').click();
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('[data-route="payment"]')).toBeVisible();
  });
});

test.describe('S-10 支払承認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="payment"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 詳細 button in payment list', async ({ page }) => {
    await expect(page.locator('[data-action-detail-payment="PMT-00001"]')).toBeVisible();
  });

  test('should show payment detail when 詳細 is clicked', async ({ page }) => {
    await page.click('[data-action-detail-payment="PMT-00001"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払依頼詳細' })).toBeVisible();
  });

  test('should show payment code in detail', async ({ page }) => {
    await page.click('[data-action-detail-payment="PMT-00001"]');
    await expect(page.locator('.detail-grid')).toContainText('PMT-00001');
  });

  test('should show status badge in detail', async ({ page }) => {
    await page.click('[data-action-detail-payment="PMT-00001"]');
    await expect(page.locator('.status-badge')).toBeVisible();
  });

  test('should show 承認依頼 button for 下書き payment with payment:edit', async ({ page }) => {
    // create a new 下書き payment first via form
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await expect(page.locator('[data-action-payment-status="承認待ち"]')).toBeVisible();
  });

  test('should update status to 承認待ち when 承認依頼 is clicked', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await page.click('[data-action-payment-status="承認待ち"]');
    await expect(page.locator('.status-badge')).toHaveText('承認待ち');
  });

  test('should show 承認 button for 承認待ち payment with approval:act', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await page.click('[data-action-payment-status="承認待ち"]');
    await expect(page.locator('#payment-approve-btn')).toBeVisible();
  });

  test('should update status to 承認済 when 承認 is clicked', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await page.click('[data-action-payment-status="承認待ち"]');
    await page.click('#payment-approve-btn');
    await page.locator('#approval-confirm-approve').click();
    // After approval, navigateBackToApproval() fires; navigate back to verify status
    await page.locator('[data-route="payment"]').click();
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await expect(page.locator('.status-badge')).toHaveText('承認済');
  });

  test('should update status to 却下 when 却下 is clicked', async ({ page }) => {
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await page.click('[data-action-payment-status="承認待ち"]');
    await page.click('#payment-reject-btn');
    await page.locator('#approval-comment-input').fill('テスト却下理由');
    await page.locator('#approval-confirm-reject').click();
    // After rejection, navigateBackToApproval() fires; navigate back to verify status
    await page.locator('[data-route="payment"]').click();
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await expect(page.locator('.status-badge')).toHaveText('却下');
  });

  test('should return to payment list when 一覧に戻る is clicked from detail', async ({ page }) => {
    await page.click('[data-action-detail-payment="PMT-00001"]');
    await page.click('#payment-detail-back');
    await expect(page.locator('.data-table')).toBeVisible();
  });
});

test.describe('S-10 支払登録', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="payment"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    // 支払依頼を作成して承認済にする
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await page.click('[data-action-payment-status="承認待ち"]');
    await page.click('#payment-approve-btn');
    await page.locator('#approval-confirm-approve').click();
    // After approval, navigateBackToApproval() fires; navigate back to payment detail
    await page.locator('[data-route="payment"]').click();
    await page.click('[data-action-detail-payment="PMT-00003"]');
  });

  test('should show 支払登録 button for 承認済 payment', async ({ page }) => {
    await expect(page.locator('#payment-register-btn')).toBeVisible();
  });

  test('should show payment registration form when 支払登録 is clicked', async ({ page }) => {
    await page.click('#payment-register-btn');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払登録' })).toBeVisible();
  });

  test('should show payment code in registration form', async ({ page }) => {
    await page.click('#payment-register-btn');
    await expect(page.locator('#f-pmte-code')).toContainText('PMT-00003');
  });

  test('should prefill amount from payment request', async ({ page }) => {
    await page.click('#payment-register-btn');
    const val = await page.locator('#f-pmte-amount').inputValue();
    expect(val).toBe('1100000');
  });

  test('should show validation error when paidDate is empty', async ({ page }) => {
    await page.click('#payment-register-btn');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('支払日は必須です');
  });

  test('should update status to 支払済 after registration', async ({ page }) => {
    await page.click('#payment-register-btn');
    await page.fill('#f-pmte-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await expect(page.locator('.status-badge')).toHaveText('支払済');
  });

  test('should return to detail after registration', async ({ page }) => {
    await page.click('#payment-register-btn');
    await page.fill('#f-pmte-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払依頼詳細' })).toBeVisible();
  });

  test('should not show 支払登録 button after payment is registered', async ({ page }) => {
    await page.click('#payment-register-btn');
    await page.fill('#f-pmte-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await expect(page.locator('#payment-register-btn')).not.toBeVisible();
  });

  test('should return to detail when cancel is clicked', async ({ page }) => {
    await page.click('#payment-register-btn');
    await page.click('#payment-exec-cancel');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払依頼詳細' })).toBeVisible();
  });
});

test.describe('P10-RT-01 支払却下フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="payment"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    // Create PMT-00003 and submit for approval
    await page.click('#payment-create-btn');
    await page.click('[data-action-create-payment="POD-00005"]');
    await page.fill('#f-pmt-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await page.click('[data-action-detail-payment="PMT-00003"]');
    await page.click('[data-action-payment-status="承認待ち"]');
  });

  test('should show 却下 status in payment detail after rejection', async ({ page }) => {
    // Arrange: reject PMT-00003
    await page.click('#payment-reject-btn');
    await page.locator('#approval-comment-input').fill('支払金額を確認してください');
    await page.locator('#approval-confirm-reject').click();
    // Navigate back to payment and open detail
    await page.locator('[data-route="payment"]').click();
    await page.click('[data-action-detail-payment="PMT-00003"]');

    await expect(page.locator('.status-badge')).toHaveText('却下');
  });

  test('should show 却下 status in payment list after rejection', async ({ page }) => {
    // Arrange: reject PMT-00003
    await page.click('#payment-reject-btn');
    await page.locator('#approval-comment-input').fill('支払金額を確認してください');
    await page.locator('#approval-confirm-reject').click();
    // Navigate back to payment list
    await page.locator('[data-route="payment"]').click();
    await expect(page.locator('.data-table')).toBeVisible();

    await expect(
      page.locator('[data-action-detail-payment="PMT-00003"]')
        .locator('xpath=ancestor::div[contains(@class,"data-table-body-row")]')
    ).toContainText('却下');
  });
});
