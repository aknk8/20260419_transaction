import { test, expect } from '@playwright/test';

test.describe('S-09 入金登録', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 入金登録 button for 送付済 invoice', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await expect(page.locator('[data-action-register-receipt="INV-00001"]')).toBeVisible();
  });

  test('should not show 入金登録 button for 下書き invoice', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00003"]');
    await expect(page.locator('[data-action-register-receipt]')).not.toBeVisible();
  });

  test('should not show 入金登録 button for 入金済 invoice', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00002"]');
    await expect(page.locator('[data-action-register-receipt]')).not.toBeVisible();
  });

  test('should show receipt form when 入金登録 is clicked', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-09 入金登録' })).toBeVisible();
  });

  test('should show invoice code in receipt form', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await expect(page.locator('#f-rcp-invoice-code')).toContainText('INV-00001');
  });

  test('should show remaining balance in receipt form', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await expect(page.locator('#f-rcp-remaining')).toBeVisible();
  });

  test('should show validation error when receiptDate is empty', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await page.fill('#f-rcp-amount', '528000');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('入金日は必須です');
  });

  test('should show validation error when amount is empty', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await page.fill('#f-rcp-date', '2026-05-31');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('入金額は必須です');
  });

  test('should register receipt and return to invoice detail', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await page.fill('#f-rcp-date', '2026-05-31');
    await page.fill('#f-rcp-amount', '528000');
    await page.click('button[type="submit"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-08 請求詳細' })).toBeVisible();
  });

  test('should update invoice status to 入金済 when fully paid', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await page.fill('#f-rcp-date', '2026-05-31');
    await page.fill('#f-rcp-amount', '528000');
    await page.click('button[type="submit"]');
    await expect(page.locator('.status-badge')).toHaveText('入金済');
  });

  test('should update invoice status to 一部入金 when partially paid', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await page.fill('#f-rcp-date', '2026-05-31');
    await page.fill('#f-rcp-amount', '100000');
    await page.click('button[type="submit"]');
    await expect(page.locator('.status-badge')).toHaveText('一部入金');
  });

  test('should show receipt in 入金履歴 after registration', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await page.fill('#f-rcp-date', '2026-05-31');
    await page.fill('#f-rcp-amount', '528000');
    await page.click('button[type="submit"]');
    await expect(page.locator('.detail-section-label').filter({ hasText: '入金履歴' })).toBeVisible();
    await expect(page.locator('[data-receipt-code]')).toBeVisible();
  });

  test('should return to invoice detail when cancel is clicked', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');
    await page.click('#receipt-form-cancel');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-08 請求詳細' })).toBeVisible();
  });
});

test.describe('S-09 入金一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="receipt"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show receipt list from navigation', async ({ page }) => {
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show receipt code in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('RCP-00001');
  });

  test('should show invoice code in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('INV-00002');
  });

  test('should show customer code in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('CUS-002');
  });

  test('should show customer name in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('東都ネットワーク株式会社');
  });

  test('should show receipt for finance01 who has receipt:view', async ({ page }) => {
    await page.locator('#logout-button').click();
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('.sidebar [data-route="receipt"]')).toBeVisible();
  });
});
