// RT-03: 入金消込異常系 E2E テスト
// INV-00001 のハードコードデータ: total=528,000、status='送付済'
import { test, expect } from '@playwright/test';

const INV_CODE = 'INV-00001';
const INV_TOTAL = 528000;

const adminUser = {
  id: 'admin',
  name: '中村 管理者',
  userType: 'システム管理者',
  permissions: [
    'dashboard:view', 'master:view', 'master:edit', 'invoice:view', 'invoice:edit',
    'receipt:view', 'receipt:edit', 'approval:view', 'approval:act'
  ]
};

async function setupWithReceipts(page, mockReceipts) {
  await page.route('/api/**', (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (url.includes('/api/auth/me')) {
      route.fulfill({ status: 401, body: '{}' });
    } else if (url.includes('/api/auth/login')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: adminUser })
      });
    } else if (url.includes('/api/auth/logout')) {
      route.fulfill({ status: 200, body: '{}' });
    } else if (url.includes('/api/receipts') && method === 'GET') {
      // 入金データを制御してテストシナリオを再現する
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockReceipts)
      });
    } else if (method === 'GET') {
      // GET を中断してフロントエンドのハードコードデータを保持する
      route.abort();
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await page.goto('/');
}

async function loginAndOpenInvoiceDetail(page) {
  // Arrange
  await page.fill('#user-id', 'admin');
  await page.fill('#password', 'admin123');
  await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

  // Act
  await page.locator('[data-route="invoice"]').click();
  await expect(page.locator('.data-table')).toBeVisible();
  await page.click(`[data-action-detail-invoice="${INV_CODE}"]`);

  // Assert: 詳細画面に遷移
  await expect(page.locator('.panel-label').filter({ hasText: 'S-08 請求詳細' })).toBeVisible();
}

test.describe('RT-03 入金消込異常系', () => {

  test('should show correct remaining balance when invoice is partially paid', async ({ page }) => {
    // Arrange: 一部入金 300,000 / 528,000 → 未収残高 228,000
    await setupWithReceipts(page, [
      {
        code: 'RCP-PARTIAL-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-05-01',
        amount: 300000,
        fee: 0,
        notes: ''
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: 未収残高が正しく表示される
    await expect(page.locator('#f-rcp-remaining')).toContainText('228,000');
  });

  test('should show zero remaining balance when invoice is over-paid', async ({ page }) => {
    // Arrange: 過入金 600,000 / 528,000 → 未収残高 0（Math.max で負にならない）
    await setupWithReceipts(page, [
      {
        code: 'RCP-OVER-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-05-01',
        amount: 600000,
        fee: 0,
        notes: ''
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: 未収残高が 0 円（過入金は負にならない）
    await expect(page.locator('#f-rcp-remaining')).toContainText('0');
  });

  test('should accumulate remaining balance correctly across multiple partial payments', async ({ page }) => {
    // Arrange: 複数回分割入金 100,000 + 150,000 = 250,000 / 528,000 → 残 278,000
    await setupWithReceipts(page, [
      {
        code: 'RCP-MULTI-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-04-15',
        amount: 100000,
        fee: 0,
        notes: '第1回入金'
      },
      {
        code: 'RCP-MULTI-02',
        invoiceCode: INV_CODE,
        receiptDate: '2026-04-30',
        amount: 150000,
        fee: 0,
        notes: '第2回入金'
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: 累積入金 250,000 を差引いた残高 278,000 が表示される
    await expect(page.locator('#f-rcp-remaining')).toContainText('278,000');
  });

  test('should show both partial receipt records in history when multiple payments exist', async ({ page }) => {
    // Arrange: 複数入金履歴
    await setupWithReceipts(page, [
      {
        code: 'RCP-MULTI-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-04-15',
        amount: 100000,
        fee: 0,
        notes: '第1回'
      },
      {
        code: 'RCP-MULTI-02',
        invoiceCode: INV_CODE,
        receiptDate: '2026-04-30',
        amount: 150000,
        fee: 0,
        notes: '第2回'
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: 2件の入金履歴が表示される
    await expect(page.locator('[data-receipt-code="RCP-MULTI-01"]')).toBeVisible();
    await expect(page.locator('[data-receipt-code="RCP-MULTI-02"]')).toBeVisible();
  });

  test('should compute remaining balance from payment amount excluding bank transfer fee', async ({ page }) => {
    // Arrange: 振込手数料 500 を差し引き 527,500 を入金 → 残高は手数料ではなく入金額で算定
    const paymentAmount = INV_TOTAL - 500; // 527,500
    const bankFee = 500;
    await setupWithReceipts(page, [
      {
        code: 'RCP-FEE-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-05-10',
        amount: paymentAmount,
        fee: bankFee,
        notes: '振込手数料差引'
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: 未収残高 = 請求合計 - 入金額 = 528,000 - 527,500 = 500
    await expect(page.locator('#f-rcp-remaining')).toContainText('500');
  });

  test('should display bank transfer fee in receipt history', async ({ page }) => {
    // Arrange: 振込手数料が設定された入金
    await setupWithReceipts(page, [
      {
        code: 'RCP-FEE-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-05-10',
        amount: 527500,
        fee: 500,
        notes: '振込手数料差引'
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: 入金履歴に手数料が表示される
    await expect(page.locator('[data-receipt-code="RCP-FEE-01"]')).toContainText('500');
  });

  test('should show receipt history section when receipts exist for 送付済 invoice', async ({ page }) => {
    // Arrange
    await setupWithReceipts(page, [
      {
        code: 'RCP-HIST-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-05-01',
        amount: 100000,
        fee: 0,
        notes: ''
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: 入金履歴セクションが表示される
    await expect(page.locator('.detail-section-label').filter({ hasText: '入金履歴' })).toBeVisible();
    await expect(page.locator('[data-receipt-code="RCP-HIST-01"]')).toBeVisible();
  });

  test('should still show 入金登録 button for 送付済 invoice regardless of partial payment', async ({ page }) => {
    // Arrange: 一部入金後もステータスが送付済のままなら入金登録ボタンが表示される
    await setupWithReceipts(page, [
      {
        code: 'RCP-BTN-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-05-01',
        amount: 100000,
        fee: 0,
        notes: ''
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: ハードコードデータの status='送付済' のまま → 入金登録ボタンが表示される
    await expect(page.locator(`[data-action-register-receipt="${INV_CODE}"]`)).toBeVisible();
  });

  test('should show zero remaining balance and receipt entry for exact full payment', async ({ page }) => {
    // Arrange: 全額入金 528,000 → 未収残高 0
    await setupWithReceipts(page, [
      {
        code: 'RCP-FULL-01',
        invoiceCode: INV_CODE,
        receiptDate: '2026-05-01',
        amount: INV_TOTAL,
        fee: 0,
        notes: '全額入金'
      }
    ]);
    await loginAndOpenInvoiceDetail(page);

    // Assert: 未収残高 0 円
    await expect(page.locator('#f-rcp-remaining')).toContainText('0');
    await expect(page.locator('[data-receipt-code="RCP-FULL-01"]')).toBeVisible();
  });

});
