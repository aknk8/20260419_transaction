import { test, expect } from '@playwright/test';

const adminUser = { id: 'admin', name: '中村 管理者', userType: 'システム管理者' };

test('check console errors after login', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
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
  await page.fill('#user-id', 'admin');
  await page.fill('#password', 'admin123');
  await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  await page.waitForTimeout(3000);
  console.log('BROWSER ERRORS AFTER LOGIN:', JSON.stringify(errors));
  await expect(page.locator('[data-route="approval"]')).toBeVisible({ timeout: 10000 });
  await page.locator('[data-route="approval"]').click();
  await page.waitForTimeout(2000);
  console.log('BROWSER ERRORS AFTER APPROVAL CLICK:', JSON.stringify(errors));
});
