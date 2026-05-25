import { test, expect } from '@playwright/test';

// 7件の見積データを使用。ページサイズ5で2ページになることを確認する。
// 本番環境では21件以上のデータでも同様の動作を確認すること。

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

test.describe('P10-RT-05 複数ページ遷移・件数表示確認', () => {
  test.beforeEach(async ({ page }) => {
    await setupPage(page);
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.selectOption('[data-table-pagesize]', '5');
  });

  test('should show page 1 of 2 when page size 5 is selected with 7 items', async ({ page }) => {
    // Arrange: page size 5 is set in beforeEach
    // Assert
    await expect(page.locator('.pagination-text')).toContainText('1 / 2 ページ');
  });

  test('should show 5 rows on page 1 when page size is 5', async ({ page }) => {
    // Arrange: page size 5 set in beforeEach
    // Assert
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
  });

  test('should show correct summary text on page 1', async ({ page }) => {
    // Arrange: page size 5 set in beforeEach
    // Assert
    await expect(page.locator('.table-summary')).toContainText('全 7 件中 1 - 5 件を表示');
  });

  test('should navigate to page 2 when next button is clicked', async ({ page }) => {
    // Arrange: page size 5 set in beforeEach
    // Act
    await page.locator('[data-table-action="next"]').click();

    // Assert
    await expect(page.locator('.pagination-text')).toContainText('2 / 2 ページ');
  });

  test('should show 2 rows on page 2 when page size is 5', async ({ page }) => {
    // Arrange: page size 5 set in beforeEach
    // Act
    await page.locator('[data-table-action="next"]').click();

    // Assert
    await expect(page.locator('.data-table-body-row')).toHaveCount(2);
  });

  test('should show correct summary text on page 2', async ({ page }) => {
    // Arrange: page size 5 set in beforeEach
    // Act
    await page.locator('[data-table-action="next"]').click();

    // Assert
    await expect(page.locator('.table-summary')).toContainText('全 7 件中 6 - 7 件を表示');
  });

  test('should navigate back to page 1 when prev button is clicked on page 2', async ({ page }) => {
    // Arrange: navigate to page 2 first
    await page.locator('[data-table-action="next"]').click();
    await expect(page.locator('.pagination-text')).toContainText('2 / 2 ページ');

    // Act
    await page.locator('[data-table-action="prev"]').click();

    // Assert
    await expect(page.locator('.pagination-text')).toContainText('1 / 2 ページ');
  });

  test('should show 5 rows again after returning to page 1', async ({ page }) => {
    // Arrange: navigate to page 2 then back
    await page.locator('[data-table-action="next"]').click();
    await page.locator('[data-table-action="prev"]').click();

    // Assert
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
  });

  test('should disable prev button on page 1', async ({ page }) => {
    // Arrange: already on page 1 (set in beforeEach)
    // Assert
    await expect(page.locator('[data-table-action="prev"]')).toBeDisabled();
  });

  test('should disable next button on last page', async ({ page }) => {
    // Arrange: navigate to page 2 (last page)
    await page.locator('[data-table-action="next"]').click();

    // Assert
    await expect(page.locator('[data-table-action="next"]')).toBeDisabled();
  });

  test('should keep total item count consistent across page transitions', async ({ page }) => {
    // Arrange: verify total on page 1
    await expect(page.locator('.table-summary')).toContainText('全 7 件');

    // Act: navigate to page 2
    await page.locator('[data-table-action="next"]').click();

    // Assert: total count is still 7 on page 2
    await expect(page.locator('.table-summary')).toContainText('全 7 件');
  });
});
