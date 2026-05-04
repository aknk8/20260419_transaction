import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.fill('#user-id', 'admin');
  await page.fill('#password', 'admin123');
  await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  await page.locator('[data-route="purchase-order"]').click();
  await expect(page.locator('.data-table')).toBeVisible();
});

test.describe('S-07 納品登録', () => {
  test('should show 納品登録 button for 発注済 purchase order', async ({ page }) => {
    // 発注済ステータスのサンプルデータが必要 → POD-00002を承認済・発注待ち→発注済にする
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await expect(page.locator('[data-action-delivery-register="POD-00002"]')).toBeVisible();
  });

  test('should not show 納品登録 button for 下書き purchase order', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00001"]');
    await expect(page.locator('[data-action-delivery-register]')).not.toBeVisible();
  });

  test('should show delivery form when 納品登録 button clicked', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-07 納品登録' })).toBeVisible();
  });

  test('should show generated delivery code in form', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await expect(page.locator('#f-dlv-code')).toHaveValue(/DLV-\d{5}/);
  });

  test('should show purchase order code in form', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await expect(page.locator('#f-dlv-pod-code')).toHaveValue('POD-00002');
  });

  test('should show validation error when deliveryDate is empty', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toContainText('納品日は必須です');
  });

  test('should register delivery and return to detail when form submitted', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-06 発注詳細' })).toBeVisible();
  });

  test('should update purchase order status to 納品済 after delivery registration', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');
    await expect(page.locator('.status-badge')).toHaveText('納品済');
  });

  test('should show registered delivery in 納品実績 section', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.fill('#f-dlv-notes', '検収依頼済み');
    await page.click('button[type="submit"]');
    await expect(page.locator('.detail-section-label').filter({ hasText: '納品実績' })).toBeVisible();
  });

  test('should return to detail screen when cancel button clicked', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.click('#delivery-form-cancel');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-06 発注詳細' })).toBeVisible();
  });

  test('should show existing deliveries in POD-00003 detail', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00003"]');
    await expect(page.locator('.detail-section-label').filter({ hasText: '納品実績' })).toBeVisible();
    await expect(page.locator('[data-delivery-code="DLV-00001"]')).toBeVisible();
  });
});

test.describe('S-07 検収結果登録', () => {
  test('should show 検収済にする button for 検収待ち delivery', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-action-accept-delivery]')).toBeVisible();
  });

  test('should show 検収NG button for 検収待ち delivery', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-action-reject-delivery]')).toBeVisible();
  });

  test('should update delivery status to 検収済 when 検収済にする is clicked', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');
    const dlvCode = await page.locator('[data-action-accept-delivery]').getAttribute('data-action-accept-delivery');
    await page.click('[data-action-accept-delivery]');
    await expect(page.locator('[data-delivery-code="' + dlvCode + '"] div:nth-child(3)')).toHaveText('検収済');
  });

  test('should update delivery status to 検収NG when 検収NG is clicked', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');
    const dlvCode = await page.locator('[data-action-reject-delivery]').getAttribute('data-action-reject-delivery');
    await page.click('[data-action-reject-delivery]');
    await expect(page.locator('[data-delivery-code="' + dlvCode + '"] div:nth-child(3)')).toHaveText('検収NG');
  });

  test('should not show 検収済にする button after delivery is accepted', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');
    await page.click('[data-action-accept-delivery]');
    await expect(page.locator('[data-action-accept-delivery]')).not.toBeVisible();
  });

  test('should show 検収済 status for DLV-00001 which is already accepted', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00003"]');
    await expect(page.locator('[data-delivery-code="DLV-00001"] div:nth-child(3)')).toHaveText('検収済');
  });

  test('should not show inspection buttons for already accepted delivery', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00003"]');
    await expect(page.locator('[data-action-accept-delivery]')).not.toBeVisible();
    await expect(page.locator('[data-action-reject-delivery]')).not.toBeVisible();
  });
});

test.describe('S-07 一部納品対応', () => {
  test('should show delivery quantity input for each PO detail line', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await expect(page.locator('#f-dlv-qty-1')).toBeVisible();
  });

  test('should set status to 一部納品 when partial quantities delivered', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.fill('#f-dlv-qty-1', '0');
    await page.click('button[type="submit"]');
    await expect(page.locator('.status-badge')).toHaveText('一部納品');
  });

  test('should set status to 納品済 when all quantities delivered', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.click('button[type="submit"]');
    await expect(page.locator('.status-badge')).toHaveText('納品済');
  });

  test('should show 納品登録 button when status is 一部納品', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.fill('#f-dlv-qty-1', '0');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-action-delivery-register="POD-00002"]')).toBeVisible();
  });

  test('should accumulate deliveries and reach 納品済 after second delivery', async ({ page }) => {
    await page.click('[data-action-detail-purchase-order="POD-00002"]');
    await page.click('[data-action-pod-status="発注済"]');
    // 1回目: 一部納品
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-06-20');
    await page.fill('#f-dlv-qty-1', '0');
    await page.click('button[type="submit"]');
    await expect(page.locator('.status-badge')).toHaveText('一部納品');
    // 2回目: 残り全量納品
    await page.click('[data-action-delivery-register="POD-00002"]');
    await page.fill('#f-dlv-date', '2026-07-01');
    await page.click('button[type="submit"]');
    await expect(page.locator('.status-badge')).toHaveText('納品済');
  });
});
