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

// POD-00002: 承認済・発注待ち, ORD-00002 連携, セキュリティ診断 数量1
// POD-00003: 納品済 (DLV-00001 済み), ORD-00003 連携
// INV-00003: 下書き, ORD-00002 連携, 合計 385,000 円

test.describe('P10-RT-04 発注→納品→請求のデータ連鎖整合性', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should set purchase order status to 一部納品 after partial delivery', async ({ page }) => {
    // Arrange: change POD-00002 to 発注済
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();

    // Act: register partial delivery (quantity=0)
    await page.locator('[data-action-delivery-register="POD-00002"]').click();
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.fill('#f-dlv-qty-1', '0');
    await page.locator('button[type="submit"]').click();

    // Assert
    await expect(page.locator('.status-badge')).toHaveText('一部納品');
  });

  test('should show 納品登録 button on 一部納品 purchase order for further delivery', async ({ page }) => {
    // Arrange: register partial delivery for POD-00002
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();
    await page.locator('[data-action-delivery-register="POD-00002"]').click();
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.fill('#f-dlv-qty-1', '0');
    await page.locator('button[type="submit"]').click();

    // Assert: 納品登録 button is still available for remaining delivery
    await expect(page.locator('[data-action-delivery-register="POD-00002"]')).toBeVisible();
  });

  test('should show 納品実績 section in purchase order detail after delivery registration', async ({ page }) => {
    // Arrange: register a delivery for POD-00002
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();
    await page.locator('[data-action-delivery-register="POD-00002"]').click();
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.locator('button[type="submit"]').click();

    // Assert: delivery history section visible in PO detail
    await expect(page.locator('.detail-section-label').filter({ hasText: '納品実績' })).toBeVisible();
  });

  test('should show 納品済 status for fully delivered purchase order', async ({ page }) => {
    // Arrange & Act: POD-00003 is already 納品済 with completed delivery DLV-00001
    await page.locator('[data-action-detail-purchase-order="POD-00003"]').click();

    // Assert: fully delivered PO shows 納品済 status
    await expect(page.locator('.status-badge').first()).toHaveText('納品済');
  });

  test('should show delivery history for 納品済 purchase order', async ({ page }) => {
    // Arrange & Act: navigate to POD-00003 (already fully delivered)
    await page.locator('[data-action-detail-purchase-order="POD-00003"]').click();

    // Assert: delivery history section and DLV-00001 record are visible
    await expect(page.locator('.detail-section-label').filter({ hasText: '納品実績' })).toBeVisible();
    await expect(page.locator('[data-delivery-code="DLV-00001"]')).toBeVisible();
  });

  test('should not show delivery register button for 納品済 purchase order', async ({ page }) => {
    // Arrange & Act: navigate to POD-00003 (already fully delivered)
    await page.locator('[data-action-detail-purchase-order="POD-00003"]').click();

    // Assert: no further delivery can be registered once 納品済
    await expect(page.locator('[data-action-delivery-register="POD-00003"]')).not.toBeVisible();
  });

  test('should show consistent invoice total in linked invoice after purchase order delivery', async ({ page }) => {
    // Arrange: complete delivery cycle for POD-00002 (linked to ORD-00002)
    await page.locator('[data-action-detail-purchase-order="POD-00002"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();
    await page.locator('[data-action-delivery-register="POD-00002"]').click();
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.locator('button[type="submit"]').click();

    // Act: navigate to INV-00003 (same order ORD-00002 as POD-00002)
    await page.locator('[data-route="invoice"]').click();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    // Assert: invoice total is unchanged and consistent (385,000 = 350,000 + 35,000 tax)
    await expect(page.locator('.detail-grid')).toContainText('385,000');
  });
});
