import { test, expect } from '@playwright/test';

test.describe('レポート ドリルダウン（顧客別→案件別）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="report"]').click();
    await expect(page.locator('#report-customer-section')).toBeVisible();
  });

  test('should show 顧客別集計 section', async ({ page }) => {
    await expect(page.locator('#report-customer-table')).toBeVisible();
  });

  test('should show 案件別 button for each customer row', async ({ page }) => {
    await expect(page.locator('[data-action-drill-customer]').first()).toBeVisible();
  });

  test('should show customer name in customer table', async ({ page }) => {
    await expect(page.locator('#report-customer-table')).toContainText('株式会社青葉システム');
  });

  test('should show sales total in customer table', async ({ page }) => {
    await expect(page.locator('#report-customer-table')).toContainText('円');
  });

  test('should show 案件別集計 section when customer drill button is clicked', async ({ page }) => {
    await page.locator('[data-action-drill-customer]').first().click();

    await expect(page.locator('#report-project-section')).toBeVisible();
  });

  test('should show customer name in 案件別集計 section title', async ({ page }) => {
    const firstBtn = page.locator('[data-action-drill-customer]').first();
    const customerId = await firstBtn.getAttribute('data-action-drill-customer');
    await firstBtn.click();

    await expect(page.locator('#report-project-section .panel-title-text')).toContainText('案件別集計');
  });

  test('should show project rows in project table', async ({ page }) => {
    await page.locator('[data-action-drill-customer]').first().click();

    await expect(page.locator('#report-project-table .data-table-body-row')).not.toHaveCount(0);
  });

  test('should highlight selected customer row', async ({ page }) => {
    await page.locator('[data-action-drill-customer]').first().click();

    await expect(page.locator('.data-table-body-row.is-selected')).toBeVisible();
  });

  test('should show 閉じる button on active customer row', async ({ page }) => {
    await page.locator('[data-action-drill-customer]').first().click();

    await expect(page.locator('.data-table-body-row.is-selected button')).toContainText('閉じる');
  });

  test('should hide 案件別集計 section when 閉じる is clicked', async ({ page }) => {
    await page.locator('[data-action-drill-customer]').first().click();
    await expect(page.locator('#report-project-section')).toBeVisible();

    await page.locator('.data-table-body-row.is-selected button').click();

    await expect(page.locator('#report-project-section')).not.toBeVisible();
  });

  test('should reset drilldown when year filter changes', async ({ page }) => {
    await page.locator('[data-action-drill-customer]').first().click();
    await expect(page.locator('#report-project-section')).toBeVisible();

    await page.selectOption('#report-year-filter', '2026');

    await expect(page.locator('#report-project-section')).not.toBeVisible();
  });

  test('should show project code chip in project table', async ({ page }) => {
    await page.locator('[data-action-drill-customer]').first().click();

    await expect(page.locator('#report-project-table')).toContainText('PJ-');
  });
});
