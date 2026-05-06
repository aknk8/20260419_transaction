import { test, expect } from '@playwright/test';

test.describe('S-06 発注一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display purchase order list with correct row count', async ({ page }) => {
    const rowCount = await page.locator('.data-table-body-row').count();
    expect(rowCount).toBeGreaterThanOrEqual(6);
    await expect(page.locator('.table-summary')).toContainText('全 ');
  });

  test('should show supplier name (not code) in purchase order list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('株式会社日本テクノロジー');
    await expect(page.locator('.data-table')).not.toContainText('SUP-001');
  });

  test('should show order code in purchase order list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('ORD-00001');
  });

  test('should show total amount formatted with yen in purchase order list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('528,000 円');
  });

  test('should filter purchase order list when keyword is entered in search box', async ({ page }) => {
    await page.locator('[data-table-input="search"]').fill('セキュリティ');

    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
  });

  test('should filter purchase order list by status', async ({ page }) => {
    await page.locator('[data-table-filter="status"]').selectOption('納品済');

    await expect(page.locator('.data-table-body-row')).toHaveCount(3);
  });
});

test.describe('S-06 発注起票', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-order="ORD-00001"]').click();
    await expect(page.locator('.detail-grid')).toBeVisible();
    await page.locator('[data-action-create-purchase-order="ORD-00001"]').click();
    await expect(page.locator('#purchase-order-register-form')).toBeVisible();
  });

  test('should open purchase order form pre-filled with order data', async ({ page }) => {
    await expect(page.locator('#f-pod-order-code')).toHaveValue('ORD-00001');
    await expect(page.locator('#f-pod-title')).toHaveValue('新規保守案件 初回見積');
  });

  test('should auto-fill purchase order code with next sequential value', async ({ page }) => {
    await expect(page.locator('#f-pod-code')).toHaveValue('POD-00007');
  });

  test('should show validation error when supplier is not selected', async ({ page }) => {
    await page.fill('#f-pod-date', '2026-05-10');
    await page.getByRole('button', { name: '発注登録' }).click();

    await expect(page.locator('.field-error').filter({ hasText: '仕入先は必須です。' })).toBeVisible();
  });

  test('should show validation error when order date is empty', async ({ page }) => {
    await page.locator('#f-pod-supplier').selectOption('SUP-001');
    await page.getByRole('button', { name: '発注登録' }).click();

    await expect(page.locator('.field-error').filter({ hasText: '発注日は必須です。' })).toBeVisible();
  });

  test('should save purchase order and show it in purchase order list', async ({ page }) => {
    await page.locator('#f-pod-supplier').selectOption('SUP-001');
    await page.fill('#f-pod-date', '2026-05-10');
    await page.getByRole('button', { name: '発注登録' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('POD-00007');
  });

  test('should return to order detail when キャンセル is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await expect(page.locator('.detail-grid')).toBeVisible();
    await expect(page.locator('#purchase-order-register-form')).not.toBeVisible();
  });
});

test.describe('S-06 発注新規作成', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 新規発注 button on purchase order list', async ({ page }) => {
    await expect(page.locator('#new-purchase-order-btn')).toBeVisible();
  });

  test('should open empty purchase order form when 新規発注 is clicked', async ({ page }) => {
    await page.locator('#new-purchase-order-btn').click();

    await expect(page.locator('#purchase-order-register-form')).toBeVisible();
    await expect(page.locator('#f-pod-title')).toHaveValue('');
    await expect(page.locator('#f-pod-order-code-input')).toBeVisible();
  });

  test('should save standalone purchase order and show it in list', async ({ page }) => {
    await page.locator('#new-purchase-order-btn').click();
    await page.fill('#f-pod-title', 'スタンドアロン発注テスト');
    await page.locator('#f-pod-supplier').selectOption('SUP-002');
    await page.fill('#f-pod-date', '2026-05-15');
    await page.getByRole('button', { name: '発注登録' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('スタンドアロン発注テスト');
  });
});

test.describe('S-06 発注添付', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('#new-purchase-order-btn').click();
    await expect(page.locator('#purchase-order-register-form')).toBeVisible();
  });

  test('should show file input on purchase order form', async ({ page }) => {
    await expect(page.locator('#f-pod-attachment')).toBeVisible();
  });

  test('should show uploaded file name in attachment list after file is selected', async ({ page }) => {
    await page.locator('#f-pod-attachment').setInputFiles({
      name: '発注書.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content')
    });

    await expect(page.locator('.attachment-list')).toBeVisible();
    await expect(page.locator('.attachment-name')).toContainText('発注書.pdf');
  });

  test('should remove attachment when 削除 is clicked', async ({ page }) => {
    await page.locator('#f-pod-attachment').setInputFiles({
      name: '発注書.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('dummy pdf content')
    });
    await expect(page.locator('.attachment-item')).toHaveCount(1);

    await page.locator('[data-action-remove-pod-attachment="0"]').click();

    await expect(page.locator('.attachment-item')).toHaveCount(0);
  });
});

test.describe('S-06 仕入先別分割', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-order="ORD-00001"]').click();
    await page.locator('[data-action-create-purchase-order="ORD-00001"]').click();
    await expect(page.locator('#purchase-order-register-form')).toBeVisible();
  });

  test('should show order detail lines with checkboxes in purchase order form', async ({ page }) => {
    await expect(page.locator('.pod-line-check')).toHaveCount(2);
    await expect(page.locator('.detail-table')).toContainText('サーバー保守サービス');
    await expect(page.locator('.detail-table')).toContainText('ネットワーク機器保守');
  });

  test('should have all lines checked by default', async ({ page }) => {
    const checkboxes = page.locator('.pod-line-check');
    await expect(checkboxes.nth(0)).toBeChecked();
    await expect(checkboxes.nth(1)).toBeChecked();
  });

  test('should update total when a line is unchecked', async ({ page }) => {
    // Uncheck line 2 (ネットワーク機器保守: 10000 * 12 * 1.1 = 132000)
    await page.locator('.pod-line-check[data-line-no="2"]').uncheck();

    // Only line 1 remains: 40000 * 12 * 1.1 = 528000
    await expect(page.locator('.form-grid')).toContainText('528,000 円');
  });

  test('should save purchase order with only selected lines', async ({ page }) => {
    await page.locator('.pod-line-check[data-line-no="2"]').uncheck();
    await page.locator('#f-pod-supplier').selectOption('SUP-001');
    await page.fill('#f-pod-date', '2026-05-10');
    await page.getByRole('button', { name: '発注登録' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('POD-00007');
    // 528,000 円 (line 1 only)
    await expect(page.locator('.data-table')).toContainText('528,000 円');
  });
});

test.describe('S-06 発注詳細', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await expect(page.locator('.detail-grid')).toBeVisible();
  });

  test('should show purchase order code in detail view', async ({ page }) => {
    await expect(page.locator('.detail-grid')).toContainText('POD-00001');
  });

  test('should show supplier name (not code) in detail view', async ({ page }) => {
    await expect(page.locator('.detail-grid')).toContainText('株式会社日本テクノロジー');
    await expect(page.locator('.detail-grid')).not.toContainText('SUP-001');
  });

  test('should show status badge 下書き in detail view', async ({ page }) => {
    await expect(page.locator('.status-badge')).toBeVisible();
    await expect(page.locator('.status-badge')).toContainText('下書き');
  });

  test('should return to purchase order list when 一覧に戻る is clicked', async ({ page }) => {
    await page.locator('#pod-detail-back').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.detail-grid')).not.toBeVisible();
  });

  test('should update status to 取下げ when 取下げ is clicked', async ({ page }) => {
    await page.locator('[data-action-pod-status="取下げ"]').click();

    await expect(page.locator('.status-badge').first()).toContainText('取下げ');
  });

  test('should show 納品済 status for already delivered order', async ({ page }) => {
    await page.locator('#pod-detail-back').click();
    await page.locator('[data-action-detail-purchase-order="POD-00003"]').click();

    await expect(page.locator('.status-badge').first()).toContainText('納品済');
  });

  test('should not show 発注確定 button when status is 下書き', async ({ page }) => {
    await expect(page.locator('[data-action-pod-status="発注済"]')).not.toBeVisible();
  });

  test('should not show 取下げ button when status is 承認依頼中', async ({ page }) => {
    await page.locator('#pod-submit-approval-btn').click();

    await expect(page.locator('[data-action-pod-status="取下げ"]')).not.toBeVisible();
  });

  test('should show 発注書出力 button in purchase order detail', async ({ page }) => {
    await expect(page.locator('[data-action-print-pod="POD-00001"]')).toBeVisible();
  });

  test('should show 発注書出力 button regardless of status', async ({ page }) => {
    await page.locator('#pod-detail-back').click();
    await page.locator('[data-action-detail-purchase-order="POD-00003"]').click();

    await expect(page.locator('[data-action-print-pod="POD-00003"]')).toBeVisible();
  });
});

test.describe('S-06 発注承認依頼', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 下書き as initial status when purchase order is created', async ({ page }) => {
    await page.locator('#new-purchase-order-btn').click();
    await page.fill('#f-pod-title', '承認フロー確認発注');
    await page.locator('#f-pod-supplier').selectOption('SUP-001');
    await page.fill('#f-pod-date', '2026-05-10');
    await page.getByRole('button', { name: '発注登録' }).click();

    await page.locator('[data-action-detail-purchase-order="POD-00007"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('下書き');
  });

  test('should update status to 承認依頼中 when 承認依頼 button is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await page.locator('#pod-submit-approval-btn').click();

    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');
  });

  test('should show 却下 button when status is 承認依頼中', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await page.locator('#pod-submit-approval-btn').click();

    await expect(page.locator('#pod-reject-btn')).toBeVisible();
  });

  test('should update status to 却下 when 却下 is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await page.locator('#pod-submit-approval-btn').click();
    await page.locator('#pod-reject-btn').click();
    await page.locator('#approval-comment-input').fill('テスト却下理由');
    await page.locator('#approval-confirm-reject').click();
    // After rejection, navigateBackToApproval() fires; navigate back to verify status
    await page.locator('[data-route="purchase-order"]').click();
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('却下');
  });

  test('should show 発注確定 button when status is 承認済・発注待ち', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();

    await expect(page.locator('[data-action-pod-status="発注済"]')).toBeVisible();
  });

  test('should update status to 発注済 when 発注確定 is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();

    await expect(page.locator('.status-badge').first()).toContainText('発注済');
  });

  test('should show 納品登録 button when status is 発注済', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();

    await expect(page.locator('[data-action-delivery-register="POD-00002"]')).toBeVisible();
  });

  test('should update status to 納品済 after 発注確定 and 納品登録', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();
    await page.locator('[data-action-delivery-register="POD-00002"]').click();
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');

    await expect(page.locator('.status-badge').first()).toContainText('納品済');
  });
});

test.describe('S-06 契約書類出力', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 契約書類出力 button when status is 承認済・発注待ち', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();

    await expect(page.locator('[data-action-contract-process="POD-00002"]')).toBeVisible();
  });

  test('should not show 契約書類出力 button when status is 下書き', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();

    await expect(page.locator('[data-action-contract-process="POD-00001"]')).not.toBeVisible();
  });

  test('should not show 契約書類出力 button when status is 納品済', async ({ page }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00003"]').click();

    await expect(page.locator('[data-action-contract-process="POD-00003"]')).not.toBeVisible();
  });

  test('should open print window with purchase order content when 契約書類出力 is clicked', async ({ page, context }) => {
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('[data-action-contract-process="POD-00002"]').click()
    ]);

    await newPage.waitForLoadState();
    await expect(newPage.locator('h1')).toContainText('発 注 書');
    await expect(newPage.locator('body')).toContainText('POD-00002');
  });
});

test.describe('S-06 契約処理方法', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('#new-purchase-order-btn').click();
    await expect(page.locator('#purchase-order-register-form')).toBeVisible();
  });

  test('should show contract method select on purchase order form', async ({ page }) => {
    await expect(page.locator('#f-pod-contract-method')).toBeVisible();
  });

  test('should have 注文請書 as selectable option', async ({ page }) => {
    await page.locator('#f-pod-contract-method').selectOption('注文請書');

    await expect(page.locator('#f-pod-contract-method')).toHaveValue('注文請書');
  });

  test('should save contract method and show in detail view', async ({ page }) => {
    await page.fill('#f-pod-title', '契約処理方法テスト発注');
    await page.locator('#f-pod-supplier').selectOption('SUP-001');
    await page.fill('#f-pod-date', '2026-05-10');
    await page.locator('#f-pod-contract-method').selectOption('発注書');
    await page.getByRole('button', { name: '発注登録' }).click();

    await page.locator('[data-action-detail-purchase-order="POD-00007"]').click();
    await expect(page.locator('.detail-grid')).toContainText('発注書');
  });
});

test.describe('P10-RT-02 発注バリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('#new-purchase-order-btn').click();
    await expect(page.locator('#purchase-order-register-form')).toBeVisible();
  });

  test('should show 発注件名は必須です error when title is empty for standalone purchase order', async ({ page }) => {
    // Arrange: provide supplier and date but leave title empty
    await page.locator('#f-pod-supplier').selectOption('SUP-001');
    await page.fill('#f-pod-date', '2026-05-10');

    // Act
    await page.getByRole('button', { name: '発注登録' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '発注件名は必須です。' })).toBeVisible();
  });

  test('should show all required field errors simultaneously when standalone purchase order form is submitted empty', async ({ page }) => {
    // Act
    await page.getByRole('button', { name: '発注登録' }).click();

    // Assert: all three required fields show errors simultaneously
    await expect(page.locator('.field-error').filter({ hasText: '発注件名は必須です。' })).toBeVisible();
    await expect(page.locator('.field-error').filter({ hasText: '仕入先は必須です。' })).toBeVisible();
    await expect(page.locator('.field-error').filter({ hasText: '発注日は必須です。' })).toBeVisible();
  });

  test('should clear field errors and succeed after correcting all required fields', async ({ page }) => {
    // Arrange: trigger validation errors first
    await page.getByRole('button', { name: '発注登録' }).click();
    await expect(page.locator('.field-error').filter({ hasText: '発注件名は必須です。' })).toBeVisible();

    // Act: fill all required fields
    await page.fill('#f-pod-title', 'バリデーション修正テスト発注');
    await page.locator('#f-pod-supplier').selectOption('SUP-001');
    await page.fill('#f-pod-date', '2026-05-10');
    await page.getByRole('button', { name: '発注登録' }).click();

    // Assert: registration succeeds and returns to list
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('バリデーション修正テスト発注');
  });
});

test.describe('S-06 発注 権限制御', () => {
  test('should show 発注一覧 nav item for sales01', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.locator('[data-route="purchase-order"]')).toBeVisible();
  });

  test('should not show 発注 nav item for finance01 who lacks purchase-order:view', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.locator('[data-route="purchase-order"]')).not.toBeVisible();
  });
});

test.describe('P10-RT-01 発注却下フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 却下 status in purchase order list after rejection', async ({ page }) => {
    // Submit POD-00001 for approval then reject it
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await page.locator('#pod-submit-approval-btn').click();
    await page.locator('#pod-reject-btn').click();
    await page.locator('#approval-comment-input').fill('発注内容を修正してください');
    await page.locator('#approval-confirm-reject').click();
    // After rejection, navigateBackToApproval fires; navigate back to purchase-order list
    await page.locator('[data-route="purchase-order"]').click();

    await expect(
      page.locator('[data-action-detail-purchase-order="POD-00001"]')
        .locator('xpath=ancestor::div[contains(@class,"data-table-body-row")]')
    ).toContainText('却下');
  });

  test('should show 却下 status badge in purchase order detail after rejection', async ({ page }) => {
    // Submit POD-00001 for approval then reject it
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await page.locator('#pod-submit-approval-btn').click();
    await page.locator('#pod-reject-btn').click();
    await page.locator('#approval-comment-input').fill('発注内容を修正してください');
    await page.locator('#approval-confirm-reject').click();
    // Navigate back to the rejected PO detail
    await page.locator('[data-route="purchase-order"]').click();
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();

    await expect(page.locator('.status-badge').first()).toContainText('却下');
  });
});

test.describe('P10-RT-01 発注却下→修正→再申請フロー（完全フロー）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 却下 status on POD-00006 after rejection from approval list', async ({ page }) => {
    // Arrange: POD-00006 is seeded as 承認依頼中
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');

    // Act: reject
    await page.locator('#pod-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額を見直してください');
    await page.locator('#approval-confirm-reject').click();

    // Assert
    await page.locator('[data-route="purchase-order"]').click();
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('却下');
  });

  test('should show 下書きに戻す button on rejected POD-00006', async ({ page }) => {
    // Arrange: reject POD-00006
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await page.locator('#pod-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額を見直してください');
    await page.locator('#approval-confirm-reject').click();
    await page.locator('[data-route="purchase-order"]').click();
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();

    // Assert: 下書きに戻す is visible
    await expect(page.locator('#pod-return-draft-btn')).toBeVisible();
  });

  test('should return POD-00006 to 下書き when 下書きに戻す is clicked', async ({ page }) => {
    // Arrange: reject first
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await page.locator('#pod-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額を見直してください');
    await page.locator('#approval-confirm-reject').click();
    await page.locator('[data-route="purchase-order"]').click();
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();

    // Act
    await page.locator('#pod-return-draft-btn').click();

    // Assert
    await expect(page.locator('.status-badge').first()).toContainText('下書き');
  });

  test('should allow resubmitting POD-00006 for approval after returning to 下書き', async ({ page }) => {
    // Arrange: reject then return to 下書き
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await page.locator('#pod-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額を見直してください');
    await page.locator('#approval-confirm-reject').click();
    await page.locator('[data-route="purchase-order"]').click();
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await page.locator('#pod-return-draft-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('下書き');

    // Act: resubmit
    await page.locator('#pod-submit-approval-btn').click();

    // Assert
    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');
  });

  test('should reach 承認済・発注待ち after full reject→return→resubmit→approve cycle', async ({ page }) => {
    // Arrange: reject POD-00006
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await page.locator('#pod-reject-btn').click();
    await page.locator('#approval-comment-input').fill('確認のため却下');
    await page.locator('#approval-confirm-reject').click();

    // Return to 下書き
    await page.locator('[data-route="purchase-order"]').click();
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await page.locator('#pod-return-draft-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('下書き');

    // Resubmit
    await page.locator('#pod-submit-approval-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');

    // Approve
    await page.locator('#pod-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Assert: final status is 承認済・発注待ち
    await page.locator('[data-route="purchase-order"]').click();
    await page.locator('[data-action-detail-purchase-order="POD-00006"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認済・発注待ち');
  });
});
