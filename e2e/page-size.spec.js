import { test, expect } from './fixtures.js';

test.describe('表示件数選択', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show page size selector in list screen', async ({ page }) => {
    await expect(page.locator('[data-table-pagesize]')).toBeVisible();
  });

  test('should show 20件 as default page size', async ({ page }) => {
    await expect(page.locator('[data-table-pagesize]')).toHaveValue('20');
  });

  test('should show all 7 quotations by default with page size 20', async ({ page }) => {
    await expect(page.locator('.data-table-body-row')).toHaveCount(7);
  });

  test('should show 5 rows when page size 5 is selected', async ({ page }) => {
    await page.selectOption('[data-table-pagesize]', '5');

    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
  });

  test('should update summary text when page size is changed to 5', async ({ page }) => {
    await page.selectOption('[data-table-pagesize]', '5');

    await expect(page.locator('.table-summary')).toContainText('全 7 件中 1 - 5 件を表示');
  });

  test('should reset to page 1 when page size is changed', async ({ page }) => {
    // まず5件表示にしてページ2へ移動
    await page.selectOption('[data-table-pagesize]', '5');
    await page.locator('[data-table-action="next"]').click();
    await expect(page.locator('.pagination-text')).toContainText('2 / 2 ページ');

    // 20件に変更するとページ1に戻る
    await page.selectOption('[data-table-pagesize]', '20');

    await expect(page.locator('.pagination-text')).toContainText('1 / 1 ページ');
  });

  test('should show 5件 as option in page size selector', async ({ page }) => {
    await expect(page.locator('[data-table-pagesize] option[value="5"]')).toBeAttached();
  });

  test('should show 20件 as option in page size selector', async ({ page }) => {
    await expect(page.locator('[data-table-pagesize] option[value="20"]')).toBeAttached();
  });

  test('should show 50件 as option in page size selector', async ({ page }) => {
    await expect(page.locator('[data-table-pagesize] option[value="50"]')).toBeAttached();
  });
});
