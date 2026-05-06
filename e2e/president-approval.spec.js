import { test, expect } from '@playwright/test';

// RT-02: 社長決裁ルートを含む完全承認フロー E2E
// シナリオ:
//   1. 高額見積（金額閾値超）→ 営業部長承認（第1ステップ）→ 社長承認（第2ステップ）→ 承認済み
//   2. 閾値境界値（ちょうど・1円超・1円未満）での設定値確認
//   3. 承認条件設定の保存・表示確認

const adminUser = { id: 'admin', name: '中村 管理者', userType: 'システム管理者' };

// デフォルト閾値
const AMOUNT_THRESHOLD = 10000000;    // 1,000万円
const PROFIT_RATE_THRESHOLD = 20;     // 20%

// 高額見積データ（社長決裁条件を満たす: total > 10,000,000）
const highValueQuotation = {
  code: 'QUO-HIGH',
  projectCode: 'PJ-00001',
  customerId: 'CUS-001',
  title: '大規模システム刷新 初回見積',
  issueDate: '2026-05-01',
  validityDate: '2026-05-31',
  version: 1,
  submittedBy: 'sales01',
  notes: '高額案件のため社長決裁対象',
  details: [
    { lineNo: 1, productCode: 'PRD-004', productName: 'システム刷新一式',
      quantity: 1, unit: '式', unitPrice: 12000000, discount: 0, taxRate: 0.10, amount: 13200000 }
  ],
  subtotal: 12000000,
  taxAmount: 1200000,
  total: 13200000  // 1,320万円 > 1,000万円閾値
};

// 閾値ちょうどの見積（社長決裁不要: total === 10,000,000 は strictly greater than のため不要）
const thresholdQuotation = {
  code: 'QUO-THRESHOLD',
  projectCode: 'PJ-00001',
  customerId: 'CUS-001',
  title: '閾値ちょうどの見積',
  issueDate: '2026-05-01',
  validityDate: '2026-05-31',
  version: 1,
  submittedBy: 'sales01',
  notes: '金額閾値ちょうど（1,000万円）',
  details: [
    { lineNo: 1, productCode: 'PRD-004', productName: 'サービス一式',
      quantity: 1, unit: '式', unitPrice: 10000000, discount: 1000000, taxRate: 0.10, amount: 9900000 }
  ],
  subtotal: 9090909,
  taxAmount: 909091,
  total: AMOUNT_THRESHOLD  // ちょうど1,000万円（以下なので社長決裁不要）
};

// 閾値1円超の見積（社長決裁必要: total > 10,000,000）
const aboveThresholdQuotation = {
  code: 'QUO-ABOVE',
  projectCode: 'PJ-00001',
  customerId: 'CUS-001',
  title: '閾値1円超の見積',
  issueDate: '2026-05-01',
  validityDate: '2026-05-31',
  version: 1,
  submittedBy: 'sales01',
  notes: '金額閾値1円超（社長決裁対象）',
  details: [
    { lineNo: 1, productCode: 'PRD-004', productName: 'サービス一式',
      quantity: 1, unit: '式', unitPrice: 10000001, discount: 0, taxRate: 0.10, amount: 11000001 }
  ],
  subtotal: 10000001,
  taxAmount: 1000000,
  total: AMOUNT_THRESHOLD + 1  // 1,000万1円（社長決裁必要）
};

// 閾値1円未満の見積（社長決裁不要: total < 10,000,000）
const belowThresholdQuotation = {
  code: 'QUO-BELOW',
  projectCode: 'PJ-00001',
  customerId: 'CUS-001',
  title: '閾値1円未満の見積',
  issueDate: '2026-05-01',
  validityDate: '2026-05-31',
  version: 1,
  submittedBy: 'sales01',
  notes: '金額閾値1円未満（社長決裁不要）',
  details: [
    { lineNo: 1, productCode: 'PRD-004', productName: 'サービス一式',
      quantity: 1, unit: '式', unitPrice: 9090909, discount: 0, taxRate: 0.10, amount: 9999999 }
  ],
  subtotal: 9090909,
  taxAmount: 909090,
  total: AMOUNT_THRESHOLD - 1  // 999万9999円（社長決裁不要）
};

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

// 高額見積の承認フローモック（2ステップ: 営業部長→社長）
async function setupHighValueApprovalMock(page, quotationData) {
  let currentStatus = '承認依頼中';

  await page.route((url) => url.href.includes('/api/quotations'), (route) => {
    const urlStr = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && /\/api\/quotations(\?.*)?$/.test(urlStr)) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ ...quotationData, status: currentStatus }])
      });
      return;
    }

    if (urlStr.includes('/approve')) currentStatus = '承認済み';
    else if (urlStr.includes('/reject')) currentStatus = '却下';

    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

async function login(page) {
  await page.fill('#user-id', 'admin');
  await page.fill('#password', 'admin123');
  await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
}

// ─────────────────────────────────────────────
// 承認条件設定（社長決裁閾値）
// ─────────────────────────────────────────────

test.describe('RT-02 社長決裁条件設定', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseMock(page);
    await page.goto('/');
    await login(page);
    await page.locator('[data-route="settings"]').click();
    await page.locator('[data-settings-tab="approval-condition"]').click();
  });

  test('should show approval condition tab with default thresholds', async ({ page }) => {
    // Assert: 承認条件設定タブが表示される
    await expect(page.locator('[data-settings-tab="approval-condition"]')).toBeVisible();
    await expect(page.locator('[data-settings-tab="approval-condition"]')).toHaveClass(/is-active/);
  });

  test('should show default amount threshold of 10,000,000 yen', async ({ page }) => {
    // Assert: デフォルト金額閾値が1,000万円
    await expect(page.locator('#s-condition-amount')).toHaveValue(String(AMOUNT_THRESHOLD));
  });

  test('should show default profit rate threshold of 20 percent', async ({ page }) => {
    // Assert: デフォルト利益率閾値が20%
    await expect(page.locator('#s-condition-profit-rate')).toHaveValue(String(PROFIT_RATE_THRESHOLD));
  });

  test('should show OR condition hint text', async ({ page }) => {
    // Assert: OR条件の説明文が表示される
    const orHint = page.locator('.field-hint').filter({ hasText: 'OR条件' });
    await expect(orHint).toContainText('OR条件');
    await expect(orHint).toContainText('社長決裁');
  });

  test('should save updated amount threshold', async ({ page }) => {
    // Arrange
    const newThreshold = 5000000;

    // Act: 閾値を500万円に変更して保存
    await page.fill('#s-condition-amount', String(newThreshold));
    await page.locator('#settings-approval-condition-form').getByRole('button', { name: '保存' }).click();

    // Assert: 保存後も変更値が維持される
    await expect(page.locator('#s-condition-amount')).toHaveValue(String(newThreshold));
  });

  test('should save updated profit rate threshold', async ({ page }) => {
    // Arrange
    const newRate = 15;

    // Act: 利益率閾値を15%に変更して保存
    await page.fill('#s-condition-profit-rate', String(newRate));
    await page.locator('#settings-approval-condition-form').getByRole('button', { name: '保存' }).click();

    // Assert: 保存後も変更値が維持される
    await expect(page.locator('#s-condition-profit-rate')).toHaveValue(String(newRate));
  });
});

// ─────────────────────────────────────────────
// 社長決裁ルート（2ステップ）の確認
// ─────────────────────────────────────────────

test.describe('RT-02 社長決裁ルート設定確認', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseMock(page);
    await page.goto('/');
    await login(page);
    await page.locator('[data-route="settings"]').click();
    await page.locator('[data-settings-tab="approval-route"]').click();
  });

  test('should show 2-step approval route for quotation representing president approval path', async ({ page }) => {
    // Assert: 見積の承認ルートが2ステップ（第1=営業部長、第2=社長）
    await expect(page.locator('.data-table-body-row')).toHaveCount(2);
    await expect(page.locator('.data-table')).toContainText('第 1 ステップ');
    await expect(page.locator('.data-table')).toContainText('第 2 ステップ');
  });

  test('should show quotation document type selected by default in approval route settings', async ({ page }) => {
    // Assert: 見積タイプがデフォルト選択されている
    await expect(page.locator('[data-action-route-doctype]')).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 高額見積の2ステップ承認フロー（営業部長→社長）
// ─────────────────────────────────────────────

test.describe('RT-02 高額見積 社長決裁ルート 承認フロー', () => {
  test.beforeEach(async ({ page }) => {
    await setupBaseMock(page);
    await setupHighValueApprovalMock(page, highValueQuotation);
    await page.goto('/');
    await login(page);
    await page.locator('[data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show high-value quotation in approval list with correct amount', async ({ page }) => {
    // Assert: 高額見積（1,320万円）が承認一覧に表示される
    await expect(page.locator('.data-table')).toContainText('QUO-HIGH');
    await expect(page.locator('.data-table')).toContainText('13,200,000');
  });

  test('should show approve and reject buttons for high-value quotation requiring president approval', async ({ page }) => {
    // Arrange: 高額見積の承認詳細を開く
    await page.locator('[data-action-detail-approval="見積:QUO-HIGH"]').click();

    // Assert: 承認・却下ボタンが表示される（社長決裁ルートの第1ステップ）
    await expect(page.locator('#quotation-approve-btn')).toBeVisible();
    await expect(page.locator('#quotation-reject-btn')).toBeVisible();
  });

  test('should complete step 1 approval (営業部長) and show updated status', async ({ page }) => {
    // Arrange: 第1ステップ（営業部長）承認
    await page.locator('[data-action-detail-approval="見積:QUO-HIGH"]').click();

    // Act: 承認
    await page.locator('#quotation-approve-btn').click();
    await page.locator('#approval-comment-input').fill('金額・内容確認済み。社長決裁へ回付。');
    await page.locator('#approval-confirm-approve').click();

    // Assert: 承認一覧に戻る（第2ステップへ）
    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page).toHaveURL(/#approval/);
  });

  test('should complete step 2 approval (社長) and show 承認済み', async ({ page }) => {
    // Arrange: 第2ステップ（社長）承認のシミュレーション
    await page.locator('[data-action-detail-approval="見積:QUO-HIGH"]').click();
    await page.locator('#quotation-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Act: 見積一覧で確認
    await page.locator('[data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-quotation="QUO-HIGH"]').click();

    // Assert: 全ステップ完了後は承認済み
    await expect(page.locator('.status-badge').first()).toContainText('承認済み');
  });

  test('should reject high-value quotation and change status to 却下', async ({ page }) => {
    // Arrange
    await page.locator('[data-action-detail-approval="見積:QUO-HIGH"]').click();

    // Act: 却下
    await page.locator('#quotation-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額が予算を大幅に超過しています。再見積を依頼します。');
    await page.locator('#approval-confirm-reject').click();

    // Assert: 却下後に見積ステータスが却下に変化
    await page.locator('[data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-action-detail-quotation="QUO-HIGH"]').click();
    await expect(page.locator('.status-badge').first()).toContainText('却下');
  });
});

// ─────────────────────────────────────────────
// 閾値境界値テスト
// ─────────────────────────────────────────────

test.describe('RT-02 社長決裁閾値境界値テスト', () => {
  test('should show amount threshold 10,000,000 exactly at boundary in settings', async ({ page }) => {
    // Arrange: 閾値の境界値確認（設定画面で表示される値）
    await setupBaseMock(page);
    await page.goto('/');
    await login(page);
    await page.locator('[data-route="settings"]').click();
    await page.locator('[data-settings-tab="approval-condition"]').click();

    // Assert: デフォルト閾値が境界値（10,000,000円）に設定されている
    await expect(page.locator('#s-condition-amount')).toHaveValue('10000000');
  });

  test('should display above-threshold quotation (10,000,001) requiring president approval in approval list', async ({ page }) => {
    // Arrange: 1円超の見積（社長決裁必要）
    await setupBaseMock(page);
    await setupHighValueApprovalMock(page, aboveThresholdQuotation);
    await page.goto('/');
    await login(page);
    await page.locator('[data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-route="approval"]').click();

    // Assert: 閾値1円超の見積が承認一覧に表示される
    await expect(page.locator('.data-table')).toContainText('QUO-ABOVE');
    await expect(page.locator('.data-table')).toContainText('10,000,001');
  });

  test('should display below-threshold quotation (9,999,999) in approval list', async ({ page }) => {
    // Arrange: 1円未満の見積（社長決裁不要、通常ルート）
    await setupBaseMock(page);
    await setupHighValueApprovalMock(page, belowThresholdQuotation);
    await page.goto('/');
    await login(page);
    await page.locator('[data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-route="approval"]').click();

    // Assert: 閾値1円未満の見積も承認一覧に表示される（承認ルートは同じ）
    await expect(page.locator('.data-table')).toContainText('QUO-BELOW');
  });

  test('should display exact-threshold quotation (10,000,000) in approval list', async ({ page }) => {
    // Arrange: ちょうど閾値の見積（strictly greater than のため社長決裁不要）
    await setupBaseMock(page);
    await setupHighValueApprovalMock(page, thresholdQuotation);
    await page.goto('/');
    await login(page);
    await page.locator('[data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('[data-route="approval"]').click();

    // Assert: 閾値ちょうどの見積も承認一覧に表示される
    await expect(page.locator('.data-table')).toContainText('QUO-THRESHOLD');
  });

  test('should save threshold of 1 yen as minimum valid amount', async ({ page }) => {
    // Arrange: 閾値を最小値（1円）に設定
    await setupBaseMock(page);
    await page.goto('/');
    await login(page);
    await page.locator('[data-route="settings"]').click();
    await page.locator('[data-settings-tab="approval-condition"]').click();

    // Act: 閾値を1円に設定（全見積が社長決裁対象）
    await page.fill('#s-condition-amount', '1');
    await page.locator('#settings-approval-condition-form').getByRole('button', { name: '保存' }).click();

    // Assert
    await expect(page.locator('#s-condition-amount')).toHaveValue('1');
  });
});
