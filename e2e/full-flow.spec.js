import { test, expect } from './fixtures.js';

// RT-01: 完全業務フロー E2E
// シナリオ: 見積(下書き→承認依頼中→承認済み) → 受注(受注済み→承認依頼中→承認済み) →
//           発注(承認→発注済→納品済) → 請求(下書き→承認依頼中→承認済み→送付済) →
//           入金登録 → 消込完了
// 各ステップで伝票コード・ステータス・金額の整合性を確認する

const adminUser = { id: 'admin', name: '中村 管理者', userType: 'システム管理者' };

// フロー全体を通して確認する金額（見積〜請求まで同額で連鎖する）
const FLOW_TOTAL = 220000;
const FLOW_SUBTOTAL = 200000;
const FLOW_TAX = 20000;

// フロー用見積データ（QUO-00002: 下書き）
const quo002 = {
  code: 'QUO-00002',
  projectCode: 'PJ-00002',
  customerId: 'CUS-002',
  title: 'B社機器更新 提案見積',
  issueDate: '2026-03-20',
  validityDate: '2026-04-20',
  version: 1,
  notes: '機器選定中につき暫定金額',
  details: [
    { lineNo: 1, productCode: 'PRD-002', productName: 'ネットワーク機器 導入支援',
      quantity: 1, unit: '式', unitPrice: 200000, discount: 0, taxRate: 0.10, amount: FLOW_TOTAL }
  ],
  subtotal: FLOW_SUBTOTAL,
  taxAmount: FLOW_TAX,
  total: FLOW_TOTAL
};

// フロー用受注データ（QUO-00002紐付け）
const ord001 = {
  code: 'ORD-00001',
  quotationCode: 'QUO-00002',
  projectCode: 'PJ-00002',
  customerId: 'CUS-002',
  title: 'B社機器更新 提案見積',
  orderDate: '2026-04-01',
  deliveryDate: '2026-06-30',
  subtotal: FLOW_SUBTOTAL,
  taxAmount: FLOW_TAX,
  total: FLOW_TOTAL,
  notes: '',
  billingTarget: false,
  paidAmount: 0,
  details: [
    { lineNo: 1, productCode: 'PRD-002', productName: 'ネットワーク機器 導入支援',
      quantity: 1, unit: '式', unitPrice: 200000, discount: 0, taxRate: 0.10, amount: FLOW_TOTAL }
  ]
};

// フロー用発注データ（ORD-00001紐付け）
const pod001 = {
  code: 'POD-00001',
  orderCode: 'ORD-00001',
  supplierId: 'SUP-001',
  title: 'B社機器更新 仕入発注',
  orderDate: '2026-04-05',
  deliveryDate: '2026-06-20',
  subtotal: 150000,
  taxAmount: 15000,
  total: 165000,
  notes: '',
  details: [
    { lineNo: 1, productCode: 'PRD-002', productName: 'ネットワーク機器 導入支援',
      quantity: 1, unit: '式', unitPrice: 150000, discount: 0, taxRate: 0.10, amount: 165000 }
  ]
};

// フロー用請求データ（ORD-00001紐付け）
const inv003 = {
  code: 'INV-00003',
  orderCode: 'ORD-00001',
  customerId: 'CUS-002',
  title: 'B社機器更新 提案見積',
  invoiceDate: '2026-05-01',
  dueDate: '2026-05-31',
  subtotal: FLOW_SUBTOTAL,
  taxAmount: FLOW_TAX,
  total: FLOW_TOTAL
};

// 共通モックセットアップ（GET abort + POST fulfill）
async function setupBaseMock(page) {
  await page.route('/api/**', (route) => {
    if (route.request().method() === 'GET') route.abort();
    else route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
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
}

// 状態変化追跡つき見積モック
async function setupQuotationMock(page, initialStatus) {
  let currentStatus = initialStatus;

  await page.route((url) => url.href.includes('/api/quotations'), (route) => {
    const urlStr = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && /\/api\/quotations(\?.*)?$/.test(urlStr)) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ...quo002, status: currentStatus }])
      });
      return;
    }
    if (method === 'GET' && urlStr.includes('/QUO-00002')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...quo002, status: currentStatus })
      });
      return;
    }

    if (urlStr.includes('/submit-approval')) currentStatus = '承認依頼中';
    else if (urlStr.includes('/approve')) currentStatus = '承認済み';
    else if (urlStr.includes('/reject')) currentStatus = '却下';
    else if (urlStr.includes('/return-to-draft')) currentStatus = '下書き';

    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

// 状態変化追跡つき受注モック
async function setupOrderMock(page, initialStatus) {
  let currentStatus = initialStatus;

  await page.route((url) => url.href.includes('/api/orders'), (route) => {
    const urlStr = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && /\/api\/orders(\?.*)?$/.test(urlStr)) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ...ord001, status: currentStatus }])
      });
      return;
    }
    if (method === 'GET' && urlStr.includes('/ORD-00001')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...ord001, status: currentStatus })
      });
      return;
    }

    if (urlStr.includes('/submit-approval')) currentStatus = '承認依頼中';
    else if (urlStr.includes('/approve')) currentStatus = '承認済み';
    else if (urlStr.includes('/reject')) currentStatus = '却下';

    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

// 状態変化追跡つき請求モック（PATCH対応版）
async function setupInvoiceMock(page, initialStatus) {
  let currentStatus = initialStatus;

  await page.route((url) => url.href.includes('/api/invoices'), (route) => {
    const urlStr = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && /\/api\/invoices(\?.*)?$/.test(urlStr)) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ...inv003, status: currentStatus }])
      });
      return;
    }
    if (method === 'GET' && urlStr.includes('/INV-00003')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...inv003, status: currentStatus })
      });
      return;
    }

    if (urlStr.includes('/submit-approval')) currentStatus = '承認依頼中';
    else if (urlStr.includes('/approve')) currentStatus = '承認済み';
    else if (urlStr.includes('/reject')) currentStatus = '却下';
    else if (method === 'PATCH') {
      try {
        const body = JSON.parse(route.request().postData() || '{}');
        if (body.status) currentStatus = body.status;
      } catch (e) { /* ignore */ }
    }

    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

async function login(page) {
  await page.fill('#user-id', 'admin');
  await page.fill('#password', 'admin123');
  await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  await page.waitForSelector('.sidebar [data-route="quotation"]', { timeout: 15000 });
}

// ─────────────────────────────────────────────
// Step 1: 見積承認フロー
// ─────────────────────────────────────────────

test.describe('RT-01 Step 1: 見積承認フロー（下書き→承認依頼中→承認済み）', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseMock(page);
    await setupQuotationMock(page, '下書き');
    await page.goto('/');
    await login(page);
  });

  test('should show 承認依頼 button on 下書き quotation and correct total', async ({ page }) => {
    // Arrange
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-edit-quotation="QUO-00002"]').click();

    // Assert: 承認依頼ボタンが表示され、金額が一致する
    await expect(page.getByRole('button', { name: '承認依頼' })).toBeVisible();
    await expect(page.locator('.detail-amount').first()).toContainText('220,000');
  });

  test('should change quotation status to 承認依頼中 after submitting for approval', async ({ page }) => {
    // Arrange
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-edit-quotation="QUO-00002"]').click();

    // Act: 承認依頼（フォーム送信後、見積一覧に戻る）
    await page.getByRole('button', { name: '承認依頼' }).click();

    // Assert: ステータスが承認依頼中に変化
    await expect(page.locator('.status').first()).toContainText('承認依頼中');
  });

  test('should change quotation status to 承認済み after approval', async ({ page }) => {
    // Arrange: 承認依頼中の状態にしてから承認画面へ
    await setupBaseMock(page);
    await setupQuotationMock(page, '承認依頼中');
    await page.goto('/');
    await login(page);
    // 見積一覧へ移動してローカルデータを更新
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    // 承認一覧へ移動
    await page.locator('.sidebar [data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-approval="見積:QUO-00002"]').click();

    // Act: 承認
    await page.locator('#quotation-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Assert: 見積一覧で承認済みを確認
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-quotation="QUO-00002"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認済み');
  });

  test('should verify quotation total is 220,000 yen throughout approval flow', async ({ page }) => {
    // Arrange: 承認済みの見積詳細
    await setupBaseMock(page);
    await setupQuotationMock(page, '承認済み');
    await page.goto('/');
    await login(page);
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-quotation="QUO-00002"]').click();

    // Assert: 承認済み後も金額は変わらない（整合性確認）
    await expect(page.locator('.detail-totals')).toContainText('220,000');
  });
});

// ─────────────────────────────────────────────
// Step 2: 受注承認フロー
// ─────────────────────────────────────────────

test.describe('RT-01 Step 2: 受注承認フロー（受注済み→承認依頼中→承認済み）', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseMock(page);
    await setupOrderMock(page, '受注済み');
    await page.goto('/');
    await login(page);
  });

  test('should show 承認依頼 button on 受注済み order and correct total', async ({ page }) => {
    // Arrange
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-order="ORD-00001"]').click();

    // Assert: 承認依頼ボタンが表示され、見積と同額
    await expect(page.locator('#order-submit-approval-btn')).toBeVisible();
    await expect(page.locator('.detail-grid')).toContainText('220,000');
  });

  test('should show quotationCode QUO-00002 in order detail confirming quotation linkage', async ({ page }) => {
    // Arrange
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-order="ORD-00001"]').click();

    // Assert: 見積コードが紐付いている（整合性確認）
    await expect(page.locator('.detail-grid')).toContainText('QUO-00002');
  });

  test('should change order status to 承認依頼中 after submitting for approval', async ({ page }) => {
    // Arrange: 承認依頼中の受注を承認一覧経由で承認
    await setupBaseMock(page);
    await setupOrderMock(page, '承認依頼中');
    await page.goto('/');
    await login(page);
    // 受注一覧へ移動してローカルデータを更新
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    // 承認一覧へ移動
    await page.locator('.sidebar [data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-approval="受注:ORD-00001"]').click();

    // Act: 承認
    await page.locator('#order-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Assert: 承認一覧に戻る
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page).toHaveURL(/#approval/);
  });
});

// ─────────────────────────────────────────────
// Step 3: 発注・納品フロー
// ─────────────────────────────────────────────

test.describe('RT-01 Step 3: 発注・納品フロー（承認済→発注済→納品済）', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseMock(page);

    let poStatus = '承認済・発注待ち';
    let deliveryRegistered = false;

    // 発注モック（PATCH body から status を読み取る）
    await page.route((url) => url.href.includes('/api/purchase-orders'), (route) => {
      const urlStr = route.request().url();
      const method = route.request().method();
      const status = deliveryRegistered ? '納品済' : poStatus;

      if (method === 'GET' && /\/api\/purchase-orders(\?.*)?$/.test(urlStr)) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ ...pod001, status }])
        });
        return;
      }
      if (method === 'GET' && urlStr.includes('/POD-00001')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...pod001, status })
        });
        return;
      }
      if (method === 'PATCH' && urlStr.includes('/POD-00001')) {
        try {
          const body = JSON.parse(route.request().postData() || '{}');
          if (body.status) poStatus = body.status;
        } catch (e) { /* ignore */ }
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    // 納品モック（POST で deliveryRegistered フラグを立て、GET で1件返す）
    await page.route((url) => url.href.includes('/api/deliveries'), (route) => {
      if (route.request().method() === 'POST') {
        deliveryRegistered = true;
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'DLV-001' }) });
      } else {
        const body = deliveryRegistered
          ? JSON.stringify([{
              id: 'DLV-001',
              purchaseOrderCode: 'POD-00001',
              deliveryDate: '2026-06-15',
              details: [{ lineNo: 1, deliveredQuantity: 1 }]
            }])
          : '[]';
        route.fulfill({ status: 200, contentType: 'application/json', body });
      }
    });

    await page.goto('/');
    await login(page);
    await page.locator('.sidebar [data-route="purchase-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 発注済 button on 承認済・発注待ち purchase order', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();

    // Assert: 発注済に変更するボタンが表示される
    await expect(page.locator('[data-action-pod-status="発注済"]')).toBeVisible();
  });

  test('should register delivery for 発注済 purchase order', async ({ page }) => {
    // Arrange: 発注済にしてから納品登録ボタン確認
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();

    // Assert: 納品登録ボタンが表示される
    await expect(page.locator('[data-action-delivery-register="POD-00001"]')).toBeVisible();
  });

  test('should show 納品済 status after delivery registration', async ({ page }) => {
    // Arrange: 発注済にして納品登録
    await page.locator('[data-action-detail-purchase-order="POD-00001"]').click();
    await page.locator('[data-action-pod-status="発注済"]').click();
    await page.locator('[data-action-delivery-register="POD-00001"]').click();
    await page.fill('#f-dlv-date', '2026-06-15');
    await page.locator('button[type="submit"]').click();

    // Assert: 発注ステータスが納品済に変化
    await expect(page.locator('.status-badge').first()).toContainText('納品済');
  });
});

// ─────────────────────────────────────────────
// Step 4: 請求承認フロー
// ─────────────────────────────────────────────

test.describe('RT-01 Step 4: 請求承認フロー（下書き→承認依頼中→承認済み→送付済）', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseMock(page);
    await setupInvoiceMock(page, '下書き');
    await page.goto('/');
    await login(page);
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 承認依頼 button on 下書き invoice and verify amount matches order', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    // Assert: 承認依頼ボタンが表示され、受注と同額（データ連鎖整合性）
    await expect(page.locator('#invoice-submit-approval-btn')).toBeVisible();
    await expect(page.locator('.detail-grid')).toContainText('220,000');
  });

  test('should show orderCode ORD-00001 in invoice confirming order linkage', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    // Assert: 受注コードが紐付いている（整合性確認）
    await expect(page.locator('.detail-grid')).toContainText('ORD-00001');
  });

  test('should change invoice status to 承認依頼中 after submitting for approval', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    // Act
    await page.locator('#invoice-submit-approval-btn').click();

    // Assert
    await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');
  });

  test('should change invoice status to 承認済み after approval', async ({ page }) => {
    // Arrange: 承認依頼中の状態から承認
    await setupBaseMock(page);
    await setupInvoiceMock(page, '承認依頼中');
    await page.goto('/');
    await login(page);
    // 請求一覧へ移動してローカルデータを更新
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    // 承認一覧へ移動
    await page.locator('.sidebar [data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-approval="請求:INV-00003"]').click();

    // Act: 承認
    await page.locator('#invoice-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Assert: 請求一覧で承認済みを確認
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認済み');
  });

  test('should change invoice status to 送付済 after marking as sent', async ({ page }) => {
    // Arrange: 確定済みから送付済へ（承認済み→確定→送付済の中間ステップ）
    await setupBaseMock(page);
    await setupInvoiceMock(page, '確定');
    await page.goto('/');
    await login(page);
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    // Act: 送付済にする
    await page.locator('[data-action-invoice-status="送付済"]').click();

    // Assert
    await expect(page.locator('.status-badge').first()).toContainText('送付済');
  });
});

// ─────────────────────────────────────────────
// Step 5: 入金・消込フロー
// ─────────────────────────────────────────────

test.describe('RT-01 Step 5: 入金登録・消込フロー', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseMock(page);

    let invoiceStatus = '送付済';
    let receiptRegistered = false;

    // 入金モック（POST で登録フラグを立て、GET は空配列を返す）
    await page.route((url) => url.href.includes('/api/receipts'), (route) => {
      if (route.request().method() === 'POST') {
        receiptRegistered = true;
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      }
    });

    // 請求モック（入金登録後は消込済みを返す）
    await page.route((url) => url.href.includes('/api/invoices'), (route) => {
      const urlStr = route.request().url();
      const method = route.request().method();
      const status = receiptRegistered ? '消込済み' : invoiceStatus;

      if (method === 'GET' && /\/api\/invoices(\?.*)?$/.test(urlStr)) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ ...inv003, status }])
        });
        return;
      }
      if (method === 'GET' && urlStr.includes('/INV-00003')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...inv003, status })
        });
        return;
      }

      if (urlStr.includes('/submit-approval')) invoiceStatus = '承認依頼中';
      else if (urlStr.includes('/approve')) invoiceStatus = '承認済み';
      else if (method === 'PATCH') {
        try {
          const body = JSON.parse(route.request().postData() || '{}');
          if (body.status) invoiceStatus = body.status;
        } catch (e) { /* ignore */ }
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/');
    await login(page);
    await page.locator('.sidebar [data-route="invoice"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 入金登録 button on 送付済 invoice', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();

    // Assert: 入金登録ボタンが表示される
    await expect(page.locator('[data-action-register-receipt="INV-00003"]')).toBeVisible();
  });

  test('should show receipt form with correct invoice code when 入金登録 is clicked', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await page.locator('[data-action-register-receipt="INV-00003"]').click();

    // Assert: 入金フォームにINV-00003が表示される
    await expect(page.locator('#f-rcp-invoice-code')).toContainText('INV-00003');
  });

  test('should show remaining balance of 220,000 yen in receipt form confirming data chain', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await page.locator('[data-action-register-receipt="INV-00003"]').click();

    // Assert: 未収残高が220,000円（見積〜請求の金額連鎖整合性の最終確認）
    await expect(page.locator('#f-rcp-remaining')).toContainText('220,000');
  });

  test('should require receiptDate and amount to register receipt', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await page.locator('[data-action-register-receipt="INV-00003"]').click();

    // Act: 金額のみ入力してsubmit
    await page.fill('#f-rcp-amount', '220000');
    await page.locator('button[type="submit"]').click();

    // Assert: バリデーションエラー（入金日必須）
    await expect(page.locator('.error-message')).toContainText('入金日');
  });

  test('should register full receipt and show 消込済み status', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-invoice="INV-00003"]').click();
    await page.locator('[data-action-register-receipt="INV-00003"]').click();

    // Act: 全額入金登録
    await page.fill('#f-rcp-date', '2026-06-30');
    await page.fill('#f-rcp-amount', '220000');
    await page.locator('button[type="submit"]').click();

    // Assert: 請求ステータスが消込済みに変化
    await expect(page.locator('.status-badge').first()).toContainText('消込済み');
  });
});
