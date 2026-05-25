import { test, expect } from '@playwright/test';

test.describe('システム設定', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="settings"]').click();
    await expect(page.locator('.master-tabs')).toBeVisible();
  });

  test('should show settings screen with two tabs', async ({ page }) => {
    await expect(page.locator('[data-settings-tab="company"]')).toBeVisible();
    await expect(page.locator('[data-settings-tab="fiscal"]')).toBeVisible();
  });

  test('should show company info tab as default', async ({ page }) => {
    await expect(page.locator('[data-settings-tab="company"]')).toHaveClass(/is-active/);
    await expect(page.locator('#s-company-name')).toBeVisible();
  });

  test('should show company name input with default value', async ({ page }) => {
    await expect(page.locator('#s-company-name')).toHaveValue('株式会社サンプル商事');
  });

  test('should show company address input', async ({ page }) => {
    await expect(page.locator('#s-company-address')).toBeVisible();
  });

  test('should show company phone input', async ({ page }) => {
    await expect(page.locator('#s-company-phone')).toBeVisible();
  });

  test('should save company info when form is submitted', async ({ page }) => {
    await page.fill('#s-company-name', '新株式会社テスト');
    await page.locator('#settings-company-form').getByRole('button', { name: '保存' }).click();

    await expect(page.locator('#s-company-name')).toHaveValue('新株式会社テスト');
  });

  test('should show error when company name is empty', async ({ page }) => {
    await page.fill('#s-company-name', '');
    await page.locator('#settings-company-form').getByRole('button', { name: '保存' }).click();

    await expect(page.locator('.field-error')).toContainText('会社名は必須です。');
  });

  test('should switch to fiscal year tab when clicked', async ({ page }) => {
    await page.locator('[data-settings-tab="fiscal"]').click();

    await expect(page.locator('[data-settings-tab="fiscal"]')).toHaveClass(/is-active/);
    await expect(page.locator('#s-fiscal-end-month')).toBeVisible();
  });

  test('should show December as default fiscal end month', async ({ page }) => {
    await page.locator('[data-settings-tab="fiscal"]').click();

    await expect(page.locator('#s-fiscal-end-month')).toHaveValue('12');
  });

  test('should save fiscal end month when form is submitted', async ({ page }) => {
    await page.locator('[data-settings-tab="fiscal"]').click();
    await page.selectOption('#s-fiscal-end-month', '3');
    await page.locator('#settings-fiscal-form').getByRole('button', { name: '保存' }).click();

    await expect(page.locator('#s-fiscal-end-month')).toHaveValue('3');
  });

  test('should show all 12 month options in fiscal end month selector', async ({ page }) => {
    await page.locator('[data-settings-tab="fiscal"]').click();

    for (let m = 1; m <= 12; m++) {
      await expect(page.locator('#s-fiscal-end-month option[value="' + m + '"]')).toBeAttached();
    }
  });

  test('should show 8月 as selectable option', async ({ page }) => {
    await page.locator('[data-settings-tab="fiscal"]').click();
    await page.selectOption('#s-fiscal-end-month', '8');

    await expect(page.locator('#s-fiscal-end-month')).toHaveValue('8');
  });

  test('should switch back to company tab when clicked', async ({ page }) => {
    await page.locator('[data-settings-tab="fiscal"]').click();
    await page.locator('[data-settings-tab="company"]').click();

    await expect(page.locator('[data-settings-tab="company"]')).toHaveClass(/is-active/);
    await expect(page.locator('#s-company-name')).toBeVisible();
  });
});
