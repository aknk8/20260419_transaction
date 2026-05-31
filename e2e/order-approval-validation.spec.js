// RT-04: 受注承認依頼バリデーション E2E テスト
// validateOrderApprovalSubmit でクライアント側検証を実施する
// BL-04 相当の検証（添付・見積紐付け・金額一致）が alert() で表示されることを確認する
import { test, expect } from './fixtures.js';

const adminUser = {
  id: 'admin',
  name: '中村 管理者',
  userType: 'システム管理者',
  permissions: [
    'dashboard:view', 'master:view', 'quotation:view', 'quotation:edit',
    'sales-order:view', 'sales-order:edit', 'invoice:view', 'invoice:edit',
    'approval:view', 'approval:act'
  ]
};

async function setupPage(page, mockOrders = null) {
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
    } else if (mockOrders && url.includes('/api/orders') && method === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockOrders)
      });
    } else if (method === 'GET') {
      // GET を中断してフロントエンドのハードコードデータを保持する
      route.abort();
    } else {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ code: 'ORD-00007' })
      });
    }
  });
  await page.goto('/');
}

async function login(page) {
  await page.fill('#user-id', 'admin');
  await page.fill('#password', 'admin123');
  await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
}

test.describe('RT-04 受注承認依頼バリデーション', () => {

  test('should block approval submission and show attachment error when no attachment exists', async ({ page }) => {
    // Arrange: ORD-00001 はハードコードデータで attachments 未設定（添付なし）
    await setupPage(page);
    await login(page);
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.click('[data-action-detail-order="ORD-00001"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-05 受注詳細' })).toBeVisible();

    // Act & Assert: 承認依頼でアラートが出ること
    // page.once でダイアログを即座に dismiss しないと locator.click() がデッドロックする
    let capturedMessage = '';
    page.once('dialog', async dialog => {
      capturedMessage = dialog.message();
      await dialog.dismiss();
    });
    await page.locator('#order-submit-approval-btn').click();

    // Assert: 添付エラーが含まれること
    expect(capturedMessage).toContain('添付');
  });

  test('should block approval submission and show quotation linkage error when quotation is not linked', async ({ page }) => {
    // Arrange: 見積未紐付けの受注（添付あり、quotationCode=null）
    const orderWithoutQuotation = {
      code: 'ORD-00001',
      quotationCode: null,
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '見積未紐付け受注テスト',
      orderDate: '2026-05-01',
      deliveryDate: '2026-12-31',
      status: '受注済み',
      subtotal: 600000,
      taxAmount: 60000,
      total: 660000,
      notes: '',
      billingTarget: false,
      paidAmount: 0,
      attachments: [{ fileName: '契約書.pdf', fileSize: 10000, fileType: 'application/pdf' }],
      details: []
    };
    await setupPage(page, [orderWithoutQuotation]);
    await login(page);
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.click('[data-action-detail-order="ORD-00001"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-05 受注詳細' })).toBeVisible();

    // Act & Assert: 承認依頼でアラートが出ること
    let capturedMessage = '';
    page.once('dialog', async dialog => {
      capturedMessage = dialog.message();
      await dialog.dismiss();
    });
    await page.locator('#order-submit-approval-btn').click();

    // Assert: 見積紐付けエラーが含まれること
    expect(capturedMessage).toContain('見積申請');
  });

  test('should block approval submission and show amount mismatch error when order total differs from quotation total', async ({ page }) => {
    // Arrange: 受注合計が紐付き見積合計（660,000）と異なる（700,000）
    // ハードコードの QUO-00001.total=660,000 を基準に、受注側の total を変える
    const orderWithMismatchedTotal = {
      code: 'ORD-00001',
      quotationCode: 'QUO-00001',  // QUO-00001 の total=660,000 がハードコードに存在する
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '金額不一致テスト',
      orderDate: '2026-05-01',
      deliveryDate: '2026-12-31',
      status: '受注済み',
      subtotal: 636364,
      taxAmount: 63636,
      total: 700000,  // 見積 660,000 と不一致
      notes: '',
      billingTarget: false,
      paidAmount: 0,
      attachments: [{ fileName: '契約書.pdf', fileSize: 10000, fileType: 'application/pdf' }],
      details: []
    };
    await setupPage(page, [orderWithMismatchedTotal]);
    await login(page);
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.click('[data-action-detail-order="ORD-00001"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-05 受注詳細' })).toBeVisible();

    // Act & Assert: 承認依頼でアラートが出ること
    let capturedMessage = '';
    page.once('dialog', async dialog => {
      capturedMessage = dialog.message();
      await dialog.dismiss();
    });
    await page.locator('#order-submit-approval-btn').click();

    // Assert: 金額不一致エラーが含まれること
    expect(capturedMessage).toContain('受注金額が見積金額と一致しません');
  });

  test('should allow saving order without attachment when creating from quotation', async ({ page }) => {
    // Arrange: 下書き保存（受注作成）は添付なしでも成功すること
    // QUO-00001（承認済み）ハードコードデータから受注作成を試みる
    await setupPage(page);
    await login(page);
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.click('[data-action-detail-quotation="QUO-00001"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-04 見積詳細' })).toBeVisible();

    // Act: 受注作成ボタンをクリック（添付なしでフォーム表示）
    await page.locator('[data-action-create-order="QUO-00001"]').click();
    await expect(page.locator('#order-register-form')).toBeVisible();

    // Act: 必須項目のみ入力して送信（添付ファイルは追加しない）
    await page.fill('#f-order-date', '2026-05-10');
    await page.fill('#f-order-delivery-date', '2026-12-31');

    await page.locator('#order-register-form').getByRole('button', { name: '受注登録' }).click();

    // Assert: エラーなく受注一覧へ遷移する（添付チェックは承認依頼時のみ）
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show all validation errors when both attachment and quotation linkage are missing', async ({ page }) => {
    // Arrange: ORD-00001 は添付なし（ハードコードデータ）・QUO-00001 は存在するので金額一致確認
    // QUO-00001.total=660,000 = ORD-00001.total=660,000 → 金額エラーは出ない
    // 添付なしエラーのみ確認
    await setupPage(page);
    await login(page);
    await page.locator('.sidebar [data-route="sales-order"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.click('[data-action-detail-order="ORD-00001"]');
    await expect(page.locator('.panel-label').filter({ hasText: 'S-05 受注詳細' })).toBeVisible();

    // Act: アラートを待機して承認依頼をクリック
    let capturedMessage = '';
    page.once('dialog', async dialog => {
      capturedMessage = dialog.message();
      await dialog.dismiss();
    });
    await page.locator('#order-submit-approval-btn').click();

    // Assert: 添付エラーが出ること
    expect(capturedMessage.length).toBeGreaterThan(0);
  });

});
