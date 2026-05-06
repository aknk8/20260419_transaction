import { test, expect } from '@playwright/test';

test.describe('S-05 受注一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display order list with 6 rows', async ({ page }) => {
    await expect(page.locator('.data-table-body-row')).toHaveCount(6);
    await expect(page.locator('.table-summary')).toContainText('全 6 件中');
  });

  test('should show project name (not code) in order list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('新規保守案件');
    await expect(page.locator('.data-table')).not.toContainText('PJ-00001');
  });

  test('should show customer name (not code) in order list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('株式会社青葉システム');
    await expect(page.locator('.data-table')).not.toContainText('CUS-001');
  });

  test('should show total amount formatted with yen in order list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('660,000 円');
  });

  test('should filter order list when keyword is entered in search box', async ({ page }) => {
    await page.locator('[data-table-input="search"]').fill('保守');

    await expect(page.locator('.data-table-body-row')).toHaveCount(3);
  });

  test('should filter order list by status', async ({ page }) => {
    await page.locator('[data-table-filter="status"]').selectOption('完了');

    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
  });

});

test.describe('S-05 受注作成', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 受注作成 button on detail screen for 承認済み quotation', async ({ page }) => {
    // QUO-00001 は承認済み
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    await expect(page.locator('[data-action-create-order="QUO-00001"]')).toBeVisible();
  });

  test('should not show 受注作成 button for 下書き quotation', async ({ page }) => {
    // QUO-00002 は下書き
    await page.locator('[data-action-detail-quotation="QUO-00002"]').click();

    await expect(page.locator('[data-action-create-order="QUO-00002"]')).not.toBeVisible();
  });

  test('should open order form pre-filled with quotation data when 受注作成 is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();
    await page.locator('[data-action-create-order="QUO-00001"]').click();

    await expect(page.locator('#order-register-form')).toBeVisible();
    await expect(page.locator('#f-order-quotation-code')).toHaveValue('QUO-00001');
    await expect(page.locator('#f-order-title')).toHaveValue('新規保守案件 初回見積');
  });

  test('should auto-fill order code with next sequential value when form opens', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();
    await page.locator('[data-action-create-order="QUO-00001"]').click();

    // 既存6件の次は ORD-00007
    await expect(page.locator('#f-order-code')).toHaveValue('ORD-00007');
  });

  test('should show validation error when order date is empty', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();
    await page.locator('[data-action-create-order="QUO-00001"]').click();

    await page.getByRole('button', { name: '受注登録' }).click();

    await expect(page.locator('.field-error').filter({ hasText: '受注日は必須です。' })).toBeVisible();
  });

  test('should show validation error when order title is cleared on submit', async ({ page }) => {
    // Arrange: open form and clear the pre-filled title
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();
    await page.locator('[data-action-create-order="QUO-00001"]').click();
    await page.fill('#f-order-title', '');
    await page.fill('#f-order-date', '2026-05-10');

    // Act
    await page.getByRole('button', { name: '受注登録' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '受注件名は必須です。' })).toBeVisible();
  });

  test('should save order and show it in order list when 受注登録 is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();
    await page.locator('[data-action-create-order="QUO-00001"]').click();
    await page.fill('#f-order-date', '2026-05-10');

    await page.getByRole('button', { name: '受注登録' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('ORD-00007');
  });

  test('should return to quotation detail when キャンセル is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();
    await page.locator('[data-action-create-order="QUO-00001"]').click();

    await page.getByRole('button', { name: 'キャンセル' }).click();

    await expect(page.locator('.detail-grid')).toBeVisible();
    await expect(page.locator('#order-register-form')).not.toBeVisible();
  });
});

test.describe('S-05 受注添付', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();
    await page.locator('[data-action-create-order="QUO-00001"]').click();
    await expect(page.locator('#order-register-form')).toBeVisible();
  });

  test('should show file input on order form', async ({ page }) => {
    await expect(page.locator('#f-order-attachment')).toBeVisible();
  });

  test('should show uploaded file name in attachment list after file is selected', async ({ page }) => {
    const buffer = Buffer.from('dummy pdf content');
    await page.locator('#f-order-attachment').setInputFiles({
      name: '契約書.pdf',
      mimeType: 'application/pdf',
      buffer
    });

    await expect(page.locator('.attachment-list')).toBeVisible();
    await expect(page.locator('.attachment-name')).toContainText('契約書.pdf');
  });

  test('should remove attachment when 削除 is clicked', async ({ page }) => {
    const buffer = Buffer.from('dummy pdf content');
    await page.locator('#f-order-attachment').setInputFiles({
      name: '契約書.pdf',
      mimeType: 'application/pdf',
      buffer
    });
    await expect(page.locator('.attachment-item')).toHaveCount(1);

    await page.locator('[data-action-remove-attachment="0"]').click();

    await expect(page.locator('.attachment-item')).toHaveCount(0);
  });

  test('should save order with attachments after registration', async ({ page }) => {
    const buffer = Buffer.from('dummy pdf content');
    await page.locator('#f-order-attachment').setInputFiles({
      name: '注文書.pdf',
      mimeType: 'application/pdf',
      buffer
    });
    await page.fill('#f-order-date', '2026-05-10');

    await page.getByRole('button', { name: '受注登録' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('ORD-00007');
  });
});

test.describe('S-05 受注詳細', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-order="ORD-00001"]').click();
    await expect(page.locator('.detail-grid')).toBeVisible();
  });

  test('should show order code in detail view', async ({ page }) => {
    await expect(page.locator('.detail-grid')).toContainText('ORD-00001');
  });

  test('should show project name (not code) in detail view', async ({ page }) => {
    await expect(page.locator('.detail-grid')).toContainText('新規保守案件');
    await expect(page.locator('.detail-grid')).not.toContainText('PJ-00001');
  });

  test('should show customer name (not code) in detail view', async ({ page }) => {
    await expect(page.locator('.detail-grid')).toContainText('株式会社青葉システム');
    await expect(page.locator('.detail-grid')).not.toContainText('CUS-001');
  });

  test('should show status badge in detail view', async ({ page }) => {
    await expect(page.locator('.status-badge')).toBeVisible();
    await expect(page.locator('.status-badge')).toContainText('受注済み');
  });

  test('should return to order list when 一覧に戻る is clicked', async ({ page }) => {
    await page.locator('#order-detail-back').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.detail-grid')).not.toBeVisible();
  });

  test('should show 完了 status badge for order completed by full payment', async ({ page }) => {
    await page.locator('#order-detail-back').click();
    await page.locator('[data-action-detail-order="ORD-00003"]').click();

    await expect(page.locator('.status-badge').first()).toContainText('完了');
  });

  test('should update status to キャンセル when キャンセル button is clicked', async ({ page }) => {
    await page.locator('[data-action-order-status="キャンセル"]').click();

    await expect(page.locator('.status-badge').first()).toContainText('キャンセル');
  });

  test('should not show 完了にする button', async ({ page }) => {
    await expect(page.locator('[data-action-order-status="完了"]')).not.toBeVisible();
  });
});

test.describe('S-05 発注起票・請求対象化', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 発注起票 button when order status is 受注済み', async ({ page }) => {
    await page.locator('[data-action-detail-order="ORD-00001"]').click();

    await expect(page.locator('[data-action-create-purchase-order="ORD-00001"]')).toBeVisible();
  });

  test('should not show 発注起票 button when order status is 完了', async ({ page }) => {
    await page.locator('[data-action-detail-order="ORD-00003"]').click();

    await expect(page.locator('[data-action-create-purchase-order]')).not.toBeVisible();
  });

  test('should show 請求対象化 button when order status is 受注済み and not yet billing target', async ({ page }) => {
    await page.locator('[data-action-detail-order="ORD-00001"]').click();

    await expect(page.locator('[data-action-billing-target="ORD-00001"]')).toBeVisible();
  });

  test('should show 請求対象 badge and hide 請求対象化 button after clicking 請求対象化', async ({ page }) => {
    await page.locator('[data-action-detail-order="ORD-00001"]').click();
    await page.locator('[data-action-billing-target="ORD-00001"]').click();

    await expect(page.locator('[data-action-billing-target]')).not.toBeVisible();
    await expect(page.locator('.panel-actions')).toContainText('請求対象');
  });

  test('should not show 請求対象化 button when order is already billing target', async ({ page }) => {
    await page.locator('[data-action-detail-order="ORD-00003"]').click();

    await expect(page.locator('[data-action-billing-target]')).not.toBeVisible();
  });
});

test.describe('S-05 受注 権限制御', () => {
  test('should show 受注一覧 nav item for sales01', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.locator('[data-route="sales-order"]')).toBeVisible();
  });

  test('should not show 受注 nav item for finance01 who lacks sales-order:view', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.locator('[data-route="sales-order"]')).not.toBeVisible();
  });
});

test.describe('P10-RT-01 受注却下→修正→再申請フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 却下 status after rejecting ORD-00006 from approval list', async ({ page }) => {
    // Arrange: ORD-00006 is seeded as 承認依頼中
    await page.locator('[data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-approval="受注:ORD-00006"]').click();

    // Act: reject
    await page.locator('#order-reject-btn').click();
    await page.locator('#approval-comment-input').fill('添付書類を差し替えてください');
    await page.locator('#approval-confirm-reject').click();

    // Assert: navigate to order list and verify 却下
    await page.locator('[data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00006"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('却下');
  });

  test('should show 下書きに戻す button on rejected ORD-00006', async ({ page }) => {
    // Arrange: reject ORD-00006
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="受注:ORD-00006"]').click();
    await page.locator('#order-reject-btn').click();
    await page.locator('#approval-comment-input').fill('添付書類を差し替えてください');
    await page.locator('#approval-confirm-reject').click();

    // Navigate to ORD-00006 detail
    await page.locator('[data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00006"]').click();

    // Assert: 下書きに戻す button is visible for 却下 status
    await expect(page.locator('#order-return-draft-btn')).toBeVisible();
  });

  test('should return ORD-00006 to 受注済み when 下書きに戻す is clicked', async ({ page }) => {
    // Arrange: reject ORD-00006 first
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="受注:ORD-00006"]').click();
    await page.locator('#order-reject-btn').click();
    await page.locator('#approval-comment-input').fill('添付書類を差し替えてください');
    await page.locator('#approval-confirm-reject').click();

    await page.locator('[data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00006"]').click();

    // Act: return to 受注済み
    await page.locator('#order-return-draft-btn').click();

    // Assert: status becomes 受注済み
    await expect(page.locator('.status-badge').first()).toContainText('受注済み');
  });

  test('should allow resubmitting ORD-00006 for approval after returning to 受注済み', async ({ page }) => {
    // Arrange: reject then return to 受注済み
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="受注:ORD-00006"]').click();
    await page.locator('#order-reject-btn').click();
    await page.locator('#approval-comment-input').fill('添付書類を差し替えてください');
    await page.locator('#approval-confirm-reject').click();
    await page.locator('[data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00006"]').click();
    await page.locator('#order-return-draft-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('受注済み');

    // Act: resubmit for approval (attachment is still present from seed data)
    await page.locator('#order-submit-approval-btn').click();

    // Assert: status becomes 承認依頼中
    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');
  });

  test('should reach 承認済み status after full reject→return→resubmit→approve cycle', async ({ page }) => {
    // Arrange: reject ORD-00006
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="受注:ORD-00006"]').click();
    await page.locator('#order-reject-btn').click();
    await page.locator('#approval-comment-input').fill('確認のため却下');
    await page.locator('#approval-confirm-reject').click();

    // Return to 受注済み
    await page.locator('[data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00006"]').click();
    await page.locator('#order-return-draft-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('受注済み');

    // Resubmit approval
    await page.locator('#order-submit-approval-btn').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');

    // Approve from approval list
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="受注:ORD-00006"]').click();
    await page.locator('#order-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Assert: final status is 承認済み
    await page.locator('[data-route="sales-order"]').click();
    await page.locator('[data-action-detail-order="ORD-00006"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認済み');
  });
});
