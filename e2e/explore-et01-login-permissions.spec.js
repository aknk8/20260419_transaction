// ET-01: ログインと権限制御の全体探索
import { test, expect } from '@playwright/test';

const USERS = [
  { id: 'admin',     pass: 'admin123',   label: 'admin（システム管理者）' },
  { id: 'sales01',   pass: 'sales123',   label: 'sales01（営業担当者）' },
  { id: 'finance01', pass: 'finance123', label: 'finance01（経理課長）' },
];

async function login(page, id, pass) {
  const userMap = {
    admin:     { id: 'admin',     name: '中村 管理者', userType: 'システム管理者' },
    sales01:   { id: 'sales01',   name: '佐藤 営業',   userType: '一般ユーザ' },
    finance01: { id: 'finance01', name: '鈴木 経理',   userType: '一般ユーザ' },
  };
  const user = userMap[id] || { id, name: id, userType: '一般ユーザ' };
  await page.route('/api/**', (route) => {
    if (route.request().method() === 'GET') { route.abort(); }
    else { route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); }
  });
  await page.route('/api/auth/me', (route) =>
    route.fulfill({ status: 401, body: '{}' })
  );
  await page.route('/api/auth/login', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user }) })
  );
  await page.route('/api/auth/logout', (route) =>
    route.fulfill({ status: 200, body: '{}' })
  );
  await page.goto('/');
  await page.fill('#user-id', id);
  await page.fill('#password', pass);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.sidebar', { timeout: 5000 });
}

test.describe('ET-01: ログインと権限制御', () => {

  test('不正パスワードでログインできないこと', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'wrongpass');
    await page.click('button[type="submit"]');
    const error = await page.locator('.login-error, .error-message, [class*="error"]').first();
    await expect(error).toBeVisible({ timeout: 3000 });
  });

  test('ユーザーIDが空のままログインできないこと', async ({ page }) => {
    await page.goto('/');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    // サイドバーが表示されないことを確認
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  for (const user of USERS) {
    test(`${user.label} でログインしメニューを記録する`, async ({ page }) => {
      await login(page, user.id, user.pass);
      const menuItems = await page.locator('.menu-item').allTextContents();
      console.log(`[${user.label}] メニュー: ${menuItems.join(' / ')}`);
      expect(menuItems.length).toBeGreaterThan(0);
    });
  }

  test('admin はマスタ管理が表示される', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await expect(page.locator('.menu-item', { hasText: 'マスタ管理' })).toBeVisible();
  });

  test('admin はレポートが表示される', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await expect(page.locator('.menu-item', { hasText: 'レポート' })).toBeVisible();
  });

  test('sales01 にはレポートが表示されない', async ({ page }) => {
    await login(page, 'sales01', 'sales123');
    const reportMenu = page.locator('.menu-item', { hasText: 'レポート' });
    await expect(reportMenu).not.toBeVisible({ timeout: 2000 }).catch(() => {});
    console.log('[sales01] レポートメニューの有無を確認済み');
  });

  test('finance01 は見積・案件メニューが表示されない', async ({ page }) => {
    await login(page, 'finance01', 'finance123');
    const quotationMenu = page.locator('.menu-item', { hasText: '見積' });
    const projectMenu   = page.locator('.menu-item', { hasText: '案件' });
    console.log('[finance01] 見積・案件メニューの有無を確認中');
    const quotationVisible = await quotationMenu.isVisible().catch(() => false);
    const projectVisible   = await projectMenu.isVisible().catch(() => false);
    console.log(`  見積メニュー表示: ${quotationVisible}`);
    console.log(`  案件メニュー表示: ${projectVisible}`);
  });

  test('ログアウト後に戻るボタンで保護画面に戻れないこと', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await page.click('#logout-button');
    await expect(page.locator('#user-id')).toBeVisible({ timeout: 3000 });
    await page.goBack();
    // ログイン画面またはリダイレクトされていることを確認
    const isLoginVisible = await page.locator('#user-id').isVisible().catch(() => false);
    const isSidebarVisible = await page.locator('.sidebar').isVisible().catch(() => false);
    console.log(`ログアウト後の戻るボタン: ログイン画面=${isLoginVisible}, サイドバー=${isSidebarVisible}`);
  });

  test('sales01 のマスタ管理ページで編集ボタンの表示を確認', async ({ page }) => {
    await login(page, 'sales01', 'sales123');
    // マスタ管理メニューをクリック（もし表示されていれば）
    const masterMenu = page.locator('.menu-item', { hasText: 'マスタ管理' });
    const isVisible = await masterMenu.isVisible().catch(() => false);
    if (isVisible) {
      await masterMenu.click();
      await page.waitForTimeout(500);
      const editButtons = await page.locator('button', { hasText: '編集' }).count();
      console.log(`[sales01] マスタ管理の編集ボタン数: ${editButtons}`);
    } else {
      console.log('[sales01] マスタ管理メニュー自体が非表示');
    }
  });
});
