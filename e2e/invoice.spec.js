import { test, expect } from '@playwright/test';

test.describe('S-08 請求一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display invoice list with 6 rows', async ({ page }) => {
    const rowCount = await page.locator('.data-table-body-row').count();
    expect(rowCount).toBeGreaterThanOrEqual(6);
    await expect(page.locator('.table-summary')).toContainText('全 ');
  });

  test('should show invoice code in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('INV-00001');
  });

  test('should show customer name (not code) in list', async ({ page }) => {
    const firstRow = page.locator('.data-table-body-row').first();
    await expect(firstRow).not.toContainText('CUS-001');
    await expect(firstRow).toContainText('株式会社');
  });

  test('should show total amount formatted with yen in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('528');
  });

  test('should show status badge in list', async ({ page }) => {
    await expect(page.locator('.status-badge').first()).toBeVisible();
  });

  test('should filter invoice list by status', async ({ page }) => {
    await page.locator('select').filter({ hasText: '全ステータス' }).selectOption('入金済');
    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
    await expect(page.locator('.data-table')).toContainText('INV-00002');
  });

  test('should filter invoice list when keyword is entered in search box', async ({ page }) => {
    await page.fill('[data-table-input="search"]', '追加作業');
    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
    await expect(page.locator('.data-table')).toContainText('INV-00003');
  });

  test('should show invoice nav item for finance01 who has invoice:view', async ({ page }) => {
    await page.locator('#logout-button').click();
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('.sidebar [data-route="invoice"]')).toBeVisible();
  });
});

test.describe('S-08 請求対象抽出', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 請求対象抽出 button on invoice list', async ({ page }) => {
    await expect(page.locator('#invoice-extract-btn')).toBeVisible();
  });

  test('should show billable orders screen when 請求対象抽出 is clicked', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-08 請求対象' })).toBeVisible();
  });

  test('should show billable order in extraction list', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    await expect(page.locator('[data-billable-order]')).toBeVisible();
  });

  test('should show 請求起票 button for each billable order', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    await expect(page.locator('[data-action-create-invoice]')).toBeVisible();
  });

  test('should pre-fill invoiceDate with today in billable list', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    await expect(page.locator('[data-inv-date-for]').first()).not.toHaveValue('');
  });

  test('should pre-fill dueDate with end of current month in billable list', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    await expect(page.locator('[data-inv-due-date-for]').first()).not.toHaveValue('');
  });

  test('should create invoice from billable list and remain on billable screen', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    await page.locator('[data-action-create-invoice]').first().click();
    await expect(page.locator('.panel-label').filter({ hasText: 'S-08 請求対象' })).toBeVisible();
  });

  test('should show new invoice in list after creation', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    await page.locator('[data-action-create-invoice]').first().click();
    await page.click('#invoice-back-to-list');
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table-body-row')).toHaveCount(7);
  });

  test('should not show invoiced order in billable list after invoice creation', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    const countBefore = await page.locator('[data-billable-order]').count();
    await page.locator('[data-action-create-invoice]').first().click();
    const countAfter = await page.locator('[data-billable-order]').count();
    expect(countAfter).toBe(countBefore - 1);
  });

  test('should allow editing invoiceDate before creating invoice', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    const orderCode = await page.locator('[data-billable-order]').first().getAttribute('data-billable-order');
    await page.fill('[data-inv-date-for="' + orderCode + '"]', '2026-06-01');
    await page.locator('[data-action-create-invoice]').first().click();
    await page.click('#invoice-back-to-list');
    await expect(page.locator('.data-table')).toContainText('2026-06-01');
  });

  test('should return to invoice list when 一覧に戻る is clicked', async ({ page }) => {
    await page.click('#invoice-extract-btn');
    await page.click('#invoice-back-to-list');
    await expect(page.locator('.data-table')).toBeVisible();
  });
});

test.describe('S-08 請求詳細', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show invoice detail when detail button is clicked', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-08 請求詳細' })).toBeVisible();
  });

  test('should show invoice code in detail', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await expect(page.locator('.panel-content')).toContainText('INV-00001');
  });

  test('should show customer name in detail', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await expect(page.locator('.panel-content')).toContainText('株式会社');
  });

  test('should show line items in detail', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await expect(page.locator('.detail-section-label').filter({ hasText: '請求明細' })).toBeVisible();
  });

  test('should show 確定する button for 下書き invoice', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00003"]');
    await expect(page.locator('[data-action-invoice-status="確定"]')).toBeVisible();
  });

  test('should update status to 確定 when 確定する is clicked', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00003"]');
    await page.click('[data-action-invoice-status="確定"]');
    await expect(page.locator('.status-badge')).toHaveText('確定');
  });

  test('should show 送付済にする button when status is 確定', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00003"]');
    await page.click('[data-action-invoice-status="確定"]');
    await expect(page.locator('[data-action-invoice-status="送付済"]')).toBeVisible();
  });

  test('should update status to 送付済 when 送付済にする is clicked', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00003"]');
    await page.click('[data-action-invoice-status="確定"]');
    await page.click('[data-action-invoice-status="送付済"]');
    await expect(page.locator('.status-badge')).toHaveText('送付済');
  });

  test('should not show 確定する button when status is 送付済', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await expect(page.locator('[data-action-invoice-status="確定"]')).not.toBeVisible();
  });

  test('should show キャンセル button for 下書き invoice', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00003"]');
    await expect(page.locator('[data-action-invoice-status="キャンセル"]')).toBeVisible();
  });

  test('should return to invoice list when 一覧に戻る is clicked', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('#invoice-detail-back');
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 印刷 button in invoice detail', async ({ page }) => {
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await expect(page.locator('[data-action-print-invoice="INV-00001"]')).toBeVisible();
  });
});

test.describe('P10-RT-02 請求起票 バリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.click('#invoice-extract-btn');
    await expect(page.locator('[data-billable-order]')).toBeVisible();
  });

  test('should not create invoice when invoiceDate is cleared before clicking 請求起票', async ({ page }) => {
    // Arrange: clear the invoice date for the first billable order
    const orderCode = await page.locator('[data-billable-order]').first().getAttribute('data-billable-order');
    await page.fill('[data-inv-date-for="' + orderCode + '"]', '');
    const countBefore = await page.locator('[data-billable-order]').count();

    // Act
    await page.locator('[data-action-create-invoice]').first().click();

    // Assert: billable order count unchanged (invoice creation silently blocked)
    const countAfter = await page.locator('[data-billable-order]').count();
    expect(countAfter).toBe(countBefore);
  });

  test('should not create invoice when dueDate is cleared before clicking 請求起票', async ({ page }) => {
    // Arrange: clear the due date for the first billable order
    const orderCode = await page.locator('[data-billable-order]').first().getAttribute('data-billable-order');
    await page.fill('[data-inv-due-date-for="' + orderCode + '"]', '');
    const countBefore = await page.locator('[data-billable-order]').count();

    // Act
    await page.locator('[data-action-create-invoice]').first().click();

    // Assert: billable order count unchanged (invoice creation silently blocked)
    const countAfter = await page.locator('[data-billable-order]').count();
    expect(countAfter).toBe(countBefore);
  });
});

test.describe('RT-05 伝票状態遷移制御 - 確定済み請求', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 確定 status badge on INV-00006', async ({ page }) => {
    // Arrange: INV-00006 is seeded with status '確定'
    await page.locator('[data-action-detail-invoice="INV-00006"]').click();

    await expect(page.locator('.status-badge').first()).toContainText('確定');
  });

  test('should not show 承認依頼 button on 確定 invoice INV-00006', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00006"]').click();

    // Assert: 承認依頼 button is only for 下書き status — not visible for 確定
    await expect(page.locator('#invoice-submit-approval-btn')).not.toBeVisible();
  });

  test('should not show 下書きに戻す button on 確定 invoice INV-00006', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00006"]').click();

    // Assert: 下書きに戻す is only for 却下 status — not visible for 確定
    await expect(page.locator('#invoice-return-draft-btn')).not.toBeVisible();
  });

  test('should only show 送付済にする and キャンセル buttons on 確定 invoice INV-00006', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00006"]').click();

    // Assert: only forward-state-transition buttons are available
    await expect(page.locator('[data-action-invoice-status="送付済"]')).toBeVisible();
    await expect(page.locator('[data-action-invoice-status="キャンセル"]')).toBeVisible();
    // No backward transition
    await expect(page.locator('[data-action-invoice-status="承認済み"]')).not.toBeVisible();
  });
});

