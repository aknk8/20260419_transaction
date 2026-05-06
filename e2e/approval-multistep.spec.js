import { test, expect } from '@playwright/test';

const adminUser = { id: 'admin', name: '中村 管理者', userType: 'システム管理者' };

const quo003Base = {
  code: 'QUO-00003',
  projectCode: 'PJ-00003',
  customerId: 'CUS-003',
  title: 'C社定例運用 継続見積',
  issueDate: '2026-04-01',
  validityDate: '2026-04-30',
  version: 2,
  submittedBy: 'sales01',
  notes: '前回から単価改定あり',
  details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 55000, discount: 0, taxRate: 0.10, amount: 726000 }],
  subtotal: 660000,
  taxAmount: 66000,
  total: 726000
};

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

// reject/approve/return-to-draft 後の状態変化を GET /api/quotations に反映する stateful セットアップ
// /api/quotations と /api/quotations/** を別グロブで分けると glob の曖昧マッチが起きるため、
// URL 文字列チェックで一つの関数ハンドラーに統合している
async function setupPageForApprovalFlow(page) {
  let quotationStatus = '承認依頼中';

  await page.route('/api/**', (route) => {
    if (route.request().method() === 'GET') {
      route.abort();
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });

  await page.route((url) => url.href.includes('/api/quotations'), (route) => {
    const urlStr = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && /\/api\/quotations(\?.*)?$/.test(urlStr)) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ...quo003Base, status: quotationStatus }])
      });
      return;
    }

    if (urlStr.includes('/reject')) {
      quotationStatus = '却下';
    } else if (urlStr.includes('/approve')) {
      quotationStatus = '承認済み';
    } else if (urlStr.includes('/submit-approval')) {
      quotationStatus = '承認依頼中';
    } else if (method === 'PATCH') {
      quotationStatus = '下書き';
    }
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
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

test.describe('P10-RT-03 複数ステップ承認ルート設定確認（UI）', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="settings"]').click();
    await page.locator('[data-settings-tab="approval-route"]').click();
  });

  test('should show 2 steps configured for quotation approval route', async ({ page }) => {
    // Arrange: quotation doctype shown by default in route settings

    // Assert
    await expect(page.locator('.data-table-body-row')).toHaveCount(2);
    await expect(page.locator('.data-table')).toContainText('第 1 ステップ');
    await expect(page.locator('.data-table')).toContainText('第 2 ステップ');
  });

  test('should show approve and reject buttons for 承認依頼中 quotation when 2-step route is configured', async ({ page }) => {
    // Arrange
    await page.locator('[data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();

    // Act: open QUO-00003 (承認依頼中, 2-step route configured)
    await page.locator('[data-action-detail-approval="見積:QUO-00003"]').click();

    // Assert: both approve and reject are available at step 1
    await expect(page.locator('#quotation-approve-btn')).toBeVisible();
    await expect(page.locator('#quotation-reject-btn')).toBeVisible();
  });

  test('should show comment panel when reject is clicked on 2-step pending quotation', async ({ page }) => {
    // Arrange
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="見積:QUO-00003"]').click();

    // Act
    await page.locator('#quotation-reject-btn').click();

    // Assert: comment input and confirm button appear
    await expect(page.locator('#approval-comment-input')).toBeVisible();
    await expect(page.locator('#approval-confirm-reject')).toBeVisible();
  });

  test('should return to approval list after approving quotation in 2-step route', async ({ page }) => {
    // Arrange
    await page.locator('[data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="見積:QUO-00003"]').click();

    // Act: approve step 1
    await page.locator('#quotation-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Assert: returned to approval list
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page).toHaveURL(/#approval/);
  });
});

test.describe('P10-RT-03 複数ステップ承認 途中却下フロー', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageForApprovalFlow(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should update quotation to 却下 when rejected at intermediate step', async ({ page }) => {
    // Arrange: QUO-00003 is 承認依頼中 in a 2-step approval route

    // Act: reject at step 1 (intermediate rejection)
    await page.locator('[data-action-detail-approval="見積:QUO-00003"]').click();
    await page.locator('#quotation-reject-btn').click();
    await page.locator('#approval-comment-input').fill('内容に誤りがあります。修正してください。');
    await page.locator('#approval-confirm-reject').click();

    // Assert: navigate to quotation and verify 却下 status
    await page.locator('[data-route="quotation"]').click();
    await page.locator('[data-action-detail-quotation="QUO-00003"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('却下');
  });

  test('should show 下書きに戻す button after intermediate step rejection', async ({ page }) => {
    // Arrange: reject QUO-00003 at step 1
    await page.locator('[data-action-detail-approval="見積:QUO-00003"]').click();
    await page.locator('#quotation-reject-btn').click();
    await page.locator('#approval-comment-input').fill('内容に誤りがあります。修正してください。');
    await page.locator('#approval-confirm-reject').click();

    // Navigate to quotation detail
    await page.locator('[data-route="quotation"]').click();
    await page.locator('[data-action-detail-quotation="QUO-00003"]').click();

    // Assert: 下書きに戻す available to re-submit through the full 2-step route
    await expect(page.locator('#quotation-return-draft-btn')).toBeVisible();
  });

  test('should allow re-submission after intermediate step rejection', async ({ page }) => {
    // Step 1: Reject QUO-00003 at intermediate step
    await page.locator('[data-action-detail-approval="見積:QUO-00003"]').click();
    await page.locator('#quotation-reject-btn').click();
    await page.locator('#approval-comment-input').fill('内容に誤りがあります。修正してください。');
    await page.locator('#approval-confirm-reject').click();

    // Step 2: Return to draft
    await page.locator('[data-route="quotation"]').click();
    await page.locator('[data-action-detail-quotation="QUO-00003"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('却下');
    await page.locator('#quotation-return-draft-btn').click();
    await expect(page.locator('.status').first()).toContainText('下書き');

    // Step 3: Re-submit for approval (restarts the 2-step route from beginning)
    await page.locator('#quotation-detail-back').click();
    await page.locator('[data-action-edit-quotation="QUO-00003"]').click();
    await page.getByRole('button', { name: '承認依頼' }).click();
    await expect(page.locator('.status').first()).toContainText('承認依頼中');
  });

  test('should not show reject button for 承認済み quotation after final approval', async ({ page }) => {
    // Arrange: approve QUO-00003 (current impl: → 承認済み directly)
    await page.locator('[data-action-detail-approval="見積:QUO-00003"]').click();
    await page.locator('#quotation-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Navigate to approved quotation
    await page.locator('[data-route="quotation"]').click();
    await page.locator('[data-action-detail-quotation="QUO-00003"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('承認済み');

    // Assert: 却下 button not visible for fully approved quotation
    await expect(page.locator('#quotation-reject-btn')).not.toBeVisible();
  });
});
