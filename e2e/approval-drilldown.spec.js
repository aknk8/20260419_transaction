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

test.describe('S-12 承認一覧 行ドリルダウン', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="approval"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 詳細 button in each approval row', async ({ page }) => {
    await expect(page.locator('[data-action-detail-approval]').first()).toBeVisible();
  });

  test('should navigate to quotation detail when 詳細 button is clicked for 見積', async ({ page }) => {
    const quotationBtn = page.locator('[data-action-detail-approval^="見積:"]').first();
    await quotationBtn.click();

    await expect(page.locator('#quotation-detail-back')).toBeVisible();
  });

  test('should show 承認一覧に戻る button on quotation detail when navigated from approval list', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();

    await expect(page.locator('#quotation-detail-back')).toContainText('承認一覧に戻る');
  });

  test('should return to approval list when 承認一覧に戻る is clicked from quotation detail', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();
    await expect(page.locator('#quotation-detail-back')).toContainText('承認一覧に戻る');

    await page.locator('#quotation-detail-back').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.panel-label')).not.toContainText('S-04 見積詳細');
  });

  test('should navigate to purchase order detail when 詳細 button is clicked for 発注', async ({ page }) => {
    const podBtn = page.locator('[data-action-detail-approval^="発注:"]').first();
    await podBtn.click();

    await expect(page.locator('#pod-detail-back')).toBeVisible();
  });

  test('should show 承認一覧に戻る button on purchase order detail when navigated from approval list', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="発注:"]').first().click();

    await expect(page.locator('#pod-detail-back')).toContainText('承認一覧に戻る');
  });

  test('should return to approval list when 承認一覧に戻る is clicked from purchase order detail', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="発注:"]').first().click();
    await expect(page.locator('#pod-detail-back')).toContainText('承認一覧に戻る');

    await page.locator('#pod-detail-back').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.panel-label')).not.toContainText('S-06 発注詳細');
  });

  test('should show quotation code in detail after drilldown', async ({ page }) => {
    await page.locator('[data-action-detail-approval^="見積:"]').first().click();

    await expect(page.locator('.detail-grid')).toContainText('QUO-');
  });

  test('should not show 承認一覧に戻る when navigating to quotation detail directly', async ({ page }) => {
    await page.locator('[data-route="quotation"]').click();
    await page.locator('[data-action-detail-quotation]').first().click();

    await expect(page.locator('#quotation-detail-back')).toContainText('一覧へ戻る');
    await expect(page.locator('#quotation-detail-back')).not.toContainText('承認一覧に戻る');
  });
});
