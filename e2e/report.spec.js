import { test, expect } from './fixtures.js';

test.describe('S-13 レポート画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="report"]').click();
    await expect(page.locator('#report-summary-table')).toBeVisible();
  });

  test('should show report screen from navigation', async ({ page }) => {
    await expect(page.locator('#report-summary-table')).toBeVisible();
  });

  test('should show 年月 column header', async ({ page }) => {
    await expect(page.locator('#report-summary-table .data-table-head')).toContainText('年月');
  });

  test('should show 売上合計 column header', async ({ page }) => {
    await expect(page.locator('#report-summary-table .data-table-head')).toContainText('売上合計');
  });

  test('should show 2026-01 in sales summary', async ({ page }) => {
    await expect(page.locator('#report-summary-table')).toContainText('2026-01');
  });

  test('should show 2026-03 in sales summary', async ({ page }) => {
    await expect(page.locator('#report-summary-table')).toContainText('2026-03');
  });

  test('should show 528,000 yen for 2026-01', async ({ page }) => {
    const row = page.locator('#report-summary-table .data-table-body-row').filter({ hasText: '2026-01' });
    await expect(row).toContainText('528,000 円');
  });

  test('should show 2,200,000 yen for 2026-03', async ({ page }) => {
    const row = page.locator('#report-summary-table .data-table-body-row').filter({ hasText: '2026-03' });
    await expect(row).toContainText('2,200,000 円');
  });

  test('should not show 下書き invoice amount in summary', async ({ page }) => {
    await expect(page.locator('#report-summary-table')).not.toContainText('385,000');
  });

  test('should show report nav item for finance01 who has report:view', async ({ page }) => {
    await page.locator('#logout-button').click();
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('.sidebar [data-route="report"]')).toBeVisible();
  });

  test('should show 原価合計 column header', async ({ page }) => {
    await expect(page.locator('#report-summary-table .data-table-head')).toContainText('原価合計');
  });

  test('should show 粗利 column header', async ({ page }) => {
    await expect(page.locator('#report-summary-table .data-table-head')).toContainText('粗利');
  });

  test('should show 2026-04 row for paid payment cost', async ({ page }) => {
    await expect(page.locator('#report-summary-table')).toContainText('2026-04');
  });

  test('should show 110,000 yen cost for 2026-04', async ({ page }) => {
    const row = page.locator('#report-summary-table .data-table-body-row').filter({ hasText: '2026-04' });
    await expect(row).toContainText('110,000 円');
  });

  test('should show gross profit for 2026-01', async ({ page }) => {
    const row = page.locator('#report-summary-table .data-table-body-row').filter({ hasText: '2026-01' });
    await expect(row).toContainText('528,000 円');
  });

  test('should show 未収一覧 section', async ({ page }) => {
    await expect(page.locator('#report-uncollected-table')).toBeVisible();
  });

  test('should show INV-00001 in uncollected list', async ({ page }) => {
    await expect(page.locator('#report-uncollected-table')).toContainText('INV-00001');
  });

  test('should show uncollected invoice total amount', async ({ page }) => {
    await expect(page.locator('#report-uncollected-table')).toContainText('528,000 円');
  });

  test('should show 送付済 status badge in uncollected list', async ({ page }) => {
    await expect(page.locator('#report-uncollected-table')).toContainText('送付済');
  });

  test('should show 未払一覧 section', async ({ page }) => {
    await expect(page.locator('#report-unpaid-table')).toBeVisible();
  });

  test('should show PMT-00002 in unpaid list', async ({ page }) => {
    await expect(page.locator('#report-unpaid-table')).toContainText('PMT-00002');
  });

  test('should show unpaid payment amount', async ({ page }) => {
    await expect(page.locator('#report-unpaid-table')).toContainText('1,100,000 円');
  });

  test('should show 承認済 status badge in unpaid list', async ({ page }) => {
    await expect(page.locator('#report-unpaid-table')).toContainText('承認済');
  });

  test('should not show 支払済 payment in unpaid list', async ({ page }) => {
    await expect(page.locator('#report-unpaid-table')).not.toContainText('PMT-00001');
  });

  test('should show year filter dropdown', async ({ page }) => {
    await expect(page.locator('#report-year-filter')).toBeVisible();
  });

  test('should show 2026 as year option in filter', async ({ page }) => {
    await expect(page.locator('#report-year-filter')).toContainText('2026年');
  });

  test('should filter summary table when year is selected', async ({ page }) => {
    await page.selectOption('#report-year-filter', '2026');
    await expect(page.locator('#report-summary-table')).toContainText('2026-01');
  });

  test('should show CSV 出力 button for uncollected list', async ({ page }) => {
    await expect(page.locator('#report-export-uncollected')).toBeVisible();
  });

  test('should show CSV 出力 button for unpaid list', async ({ page }) => {
    await expect(page.locator('#report-export-unpaid')).toBeVisible();
  });

  test('should show totals row in summary table', async ({ page }) => {
    await expect(page.locator('#report-summary-totals-row')).toBeVisible();
  });

  test('should show 合計 label in totals row', async ({ page }) => {
    await expect(page.locator('#report-summary-totals-row')).toContainText('合計');
  });

  test('should show total sales in totals row', async ({ page }) => {
    await expect(page.locator('#report-summary-totals-row')).toContainText('2,783,000 円');
  });

  test('should show total cost in totals row', async ({ page }) => {
    await expect(page.locator('#report-summary-totals-row')).toContainText('110,000 円');
  });

  test('should show total gross profit in totals row', async ({ page }) => {
    await expect(page.locator('#report-summary-totals-row')).toContainText('2,673,000 円');
  });

  test('should update totals row when year filter is applied', async ({ page }) => {
    await page.selectOption('#report-year-filter', '2026');
    await expect(page.locator('#report-summary-totals-row')).toContainText('2,783,000 円');
  });
});
