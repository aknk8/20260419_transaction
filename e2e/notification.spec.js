import { test, expect } from '@playwright/test';

test.describe('S-14 通知一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('[data-route="notification"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show notification list from navigation', async ({ page }) => {
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show approval request notification in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('QUO-00003');
  });

  test('should show 承認依頼 type badge in notification list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('承認依頼');
  });

  test('should show notification message in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('見積 QUO-00003 の承認依頼が届いています');
  });

  test('should show purchase order notification in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('POD-00006');
  });

  test('should show payment notification in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('PMT-00002');
  });

  test('should show 未読 badge for unread notifications', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('未読');
  });

  test('should show 既読 badge for read notifications', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('既読');
  });

  test('should show notification date in list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('2026-04-20');
  });

  test('should filter by type 承認依頼', async ({ page }) => {
    await page.selectOption('[data-table-filter="type"]', '承認依頼');
    await expect(page.locator('.data-table')).toContainText('QUO-00003');
  });

  test('should show notification list for finance01 who has notification:view', async ({ page }) => {
    await page.locator('#logout-button').click();
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await expect(page.locator('[data-route="notification"]')).toBeVisible();
  });
});
