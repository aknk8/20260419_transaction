import { test, expect } from './fixtures.js';

const adminUser = { id: 'admin', name: '中村 管理者', userType: 'システム管理者' };

async function setupPage(page) {
  const registeredDeliveries = [];

  await page.route('/api/**', async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'GET' && /\/api\/deliveries(\?.*)?$/.test(url)) {
      const seedDelivery = { code: 'DLV-00001', purchaseOrderCode: 'POD-00003', deliveryDate: '2026-03-28', status: '検収済', notes: '', details: [{ lineNo: 1, deliveredQuantity: 1 }] };
      const all = [seedDelivery, ...registeredDeliveries];
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(all) });
    } else if (method === 'POST' && /\/api\/deliveries(\?.*)?$/.test(url)) {
      const body = JSON.parse(route.request().postData() || '{}');
      const code = 'DLV-' + String(registeredDeliveries.length + 2).padStart(5, '0');
      const dlv = { code, purchaseOrderCode: body.purchaseOrderCode || 'POD-00002', deliveryDate: body.deliveryDate || '', status: '検収待ち', notes: body.notes || '', details: body.details || [{ lineNo: 1, deliveredQuantity: 1 }] };
      registeredDeliveries.push(dlv);
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(dlv) });
    } else if (method === 'PATCH' && /\/api\/deliveries\//.test(url)) {
      const dlvCode = decodeURIComponent(url.split('/api/deliveries/')[1]);
      const dlv = registeredDeliveries.find(d => d.code === dlvCode);
      const body = JSON.parse(route.request().postData() || '{}');
      if (dlv && body.status) dlv.status = body.status;
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(dlv || {}) });
    } else if (method === 'GET') {
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

// INV-00001: 送付済, ORD-00001 連携, 合計 528,000 円（消込テスト用）
// POD-00002: 承認済・発注待ち, ORD-00002 連携, セキュリティ診断 数量1
// POD-00003: 納品済 (DLV-00001 済み), ORD-00003 連携
// INV-00003: 下書き, ORD-00002 連携, 合計 385,000 円

test.describe('P10-RT-04 発注→納品→請求のデータ連鎖整合性', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="purchase-order"]').click();
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
    await page.locator('.sidebar [data-route="invoice"]').click();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    // Assert: invoice total is unchanged and consistent (385,000 = 350,000 + 35,000 tax)
    await expect(page.locator('.detail-grid')).toContainText('385,000');
  });
});

test.describe('P10-RT-04 入金登録→消込のデータ連鎖整合性', () => {
  const INV_CODE = 'INV-00001';
  const INV_TOTAL = 528000;

  async function setupReceiptFlowMock(page, receiptAmount) {
    let receiptPosted = false;
    const receiptCode = receiptAmount >= INV_TOTAL ? 'RCP-CHAIN-01' : 'RCP-CHAIN-02';
    const invoiceStatusAfter = receiptAmount >= INV_TOTAL ? '消込済み' : '一部消込';

    await page.route('/api/**', (route) => {
      const url = route.request().url();
      const method = route.request().method();

      if (url.includes('/api/auth/me')) {
        return route.fulfill({ status: 401, body: '{}' });
      }
      if (url.includes('/api/auth/login')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: adminUser })
        });
      }
      if (url.includes('/api/auth/logout')) {
        return route.fulfill({ status: 200, body: '{}' });
      }
      if (url.includes('/api/receipts') && method === 'POST') {
        receiptPosted = true;
        return route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            code: receiptCode, invoiceCode: INV_CODE,
            receiptDate: '2026-05-31', amount: receiptAmount, fee: 0, notes: ''
          })
        });
      }
      if (url.includes('/api/receipts') && method === 'GET') {
        const data = receiptPosted
          ? [{ code: receiptCode, invoiceCode: INV_CODE, receiptDate: '2026-05-31', amount: receiptAmount, fee: 0, notes: '' }]
          : [];
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
      }
      if (url.includes('/api/invoices') && method === 'GET' && !url.includes('/candidates') && !url.includes('/summary')) {
        if (receiptPosted) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{
              code: INV_CODE, orderCode: 'ORD-00001', customerId: 'CUS-001',
              title: 'サーバー保守サービス 2026年1月分', invoiceDate: '2026-01-31',
              dueDate: '2026-02-28', status: invoiceStatusAfter,
              subtotal: 480000, taxAmount: 48000, total: INV_TOTAL, notes: '', details: []
            }])
          });
        }
        return route.abort();
      }
      if (method === 'GET') return route.abort();
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/');
  }

  test('should mark invoice as 消込済み after full payment receipt', async ({ page }) => {
    // Arrange: stateful mock returns 消込済み after full payment POST
    await setupReceiptFlowMock(page, INV_TOTAL);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');

    // Act: register full payment (528,000 / 528,000)
    await page.fill('#f-rcp-date', '2026-05-31');
    await page.fill('#f-rcp-amount', String(INV_TOTAL));
    await page.click('button[type="submit"]');

    // Assert: invoice status updated to 消込済み after receipt registration
    await expect(page.locator('.status-badge')).toHaveText('消込済み');
  });

  test('should show remaining balance after partial payment', async ({ page }) => {
    // Arrange: 300,000 partial payment against 528,000 invoice → remaining 228,000
    const partialAmount = 300000;
    await setupReceiptFlowMock(page, partialAmount);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.click('[data-action-detail-invoice="INV-00001"]');
    await page.click('[data-action-register-receipt="INV-00001"]');

    // Act: register partial payment
    await page.fill('#f-rcp-date', '2026-05-31');
    await page.fill('#f-rcp-amount', String(partialAmount));
    await page.click('button[type="submit"]');

    // Assert: remaining balance = 528,000 - 300,000 = 228,000
    await expect(page.locator('#f-rcp-remaining')).toContainText('228,000');
  });
});
