import { test, expect } from '@playwright/test';

test.describe('サイドバー折りたたみ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('should show sidebar toggle button', async ({ page }) => {
    await expect(page.locator('#sidebar-toggle')).toBeVisible();
  });

  test('should collapse sidebar when toggle is clicked', async ({ page }) => {
    await page.locator('#sidebar-toggle').click();

    await expect(page.locator('.sidebar')).toHaveClass(/is-collapsed/);
  });

  test('should hide sidebar header text when collapsed', async ({ page }) => {
    await page.locator('#sidebar-toggle').click();

    await expect(page.locator('.sidebar-header')).not.toBeVisible();
  });

  test('should hide user identity info when collapsed', async ({ page }) => {
    await page.locator('#sidebar-toggle').click();

    await expect(page.locator('.identity')).not.toBeVisible();
  });

  test('should still show nav tags when collapsed', async ({ page }) => {
    await page.locator('#sidebar-toggle').click();

    await expect(page.locator('.menu-tag').first()).toBeVisible();
  });

  test('should expand sidebar when toggle is clicked again', async ({ page }) => {
    await page.locator('#sidebar-toggle').click();
    await expect(page.locator('.sidebar')).toHaveClass(/is-collapsed/);

    await page.locator('#sidebar-toggle').click();

    await expect(page.locator('.sidebar')).not.toHaveClass(/is-collapsed/);
    await expect(page.locator('.sidebar-header')).toBeVisible();
  });

  test('should navigate to screen when collapsed menu item is clicked', async ({ page }) => {
    await page.locator('#sidebar-toggle').click();
    await page.locator('.sidebar [data-route="project"]').click();

    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should preserve collapsed state after navigation', async ({ page }) => {
    await page.locator('#sidebar-toggle').click();
    await page.locator('.sidebar [data-route="project"]').click();

    await expect(page.locator('.sidebar')).toHaveClass(/is-collapsed/);
  });
});
