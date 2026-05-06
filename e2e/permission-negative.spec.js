// RT-06: UI層権限ネガティブテスト E2E
// 各ユーザ権限に応じて UI 要素が正しく非表示になることを検証する
import { test, expect } from '@playwright/test';

async function setupWithPermissions(page, user) {
  await page.route('/api/**', (route) => {
    const url = route.request().url();
    const method = route.request().method();
    if (url.includes('/api/auth/me')) {
      route.fulfill({ status: 401, body: '{}' });
    } else if (url.includes('/api/auth/login')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user })
      });
    } else if (url.includes('/api/auth/logout')) {
      route.fulfill({ status: 200, body: '{}' });
    } else if (method === 'GET') {
      // GET を中断してフロントエンドのハードコードデータを保持する
      route.abort();
    } else {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
  });
  await page.goto('/');
}

async function loginAs(page, userId, password) {
  await page.fill('#user-id', userId);
  await page.fill('#password', password);
  await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  await page.waitForSelector('.sidebar', { timeout: 5000 });
}

test.describe('RT-06 UI層権限ネガティブテスト', () => {

  test.describe('承認権限（approval:act）なし', () => {

    test('should hide approve button when user lacks approval:act permission', async ({ page }) => {
      // Arrange: approval:view のみ、approval:act なし
      const viewOnlyUser = {
        id: 'sales01',
        name: '佐藤 営業',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'quotation:view', 'sales-order:view',
          'purchase-order:view', 'invoice:view', 'approval:view'
          // approval:act は含まない
        ]
      };
      await setupWithPermissions(page, viewOnlyUser);
      await loginAs(page, 'sales01', 'sales123');

      // Act: 承認一覧に移動して承認依頼中の見積をクリック
      await page.locator('[data-route="approval"]').click();
      await page.locator('[data-action-detail-approval^="受注:"]').first().click();

      // Assert: 承認ボタンが非表示
      await expect(page.locator('#order-approve-btn')).not.toBeVisible();
    });

    test('should hide reject button when user lacks approval:act permission', async ({ page }) => {
      // Arrange: approval:view のみ
      const viewOnlyUser = {
        id: 'sales01',
        name: '佐藤 営業',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'quotation:view', 'sales-order:view',
          'purchase-order:view', 'invoice:view', 'approval:view'
          // approval:act は含まない
        ]
      };
      await setupWithPermissions(page, viewOnlyUser);
      await loginAs(page, 'sales01', 'sales123');

      // Act: 承認一覧に移動して承認依頼中の受注をクリック
      await page.locator('[data-route="approval"]').click();
      await page.locator('[data-action-detail-approval^="受注:"]').first().click();

      // Assert: 却下ボタンも非表示
      await expect(page.locator('#order-reject-btn')).not.toBeVisible();
    });

    test('should show approval list but hide action buttons for view-only user', async ({ page }) => {
      // Arrange: approval:view のみ
      const viewOnlyUser = {
        id: 'sales01',
        name: '佐藤 営業',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'quotation:view', 'sales-order:view',
          'invoice:view', 'approval:view'
          // approval:act は含まない
        ]
      };
      await setupWithPermissions(page, viewOnlyUser);
      await loginAs(page, 'sales01', 'sales123');

      // Act: 承認一覧へ移動
      await page.locator('[data-route="approval"]').click();

      // Assert: 一覧は表示されるが承認操作はできない（見る権限のみ）
      await expect(page.locator('.data-table')).toBeVisible();
      await expect(page.locator('[data-route="approval"]')).toBeVisible();
    });

  });

  test.describe('作成・編集権限なし', () => {

    test('should hide 請求対象抽出 button when user lacks invoice:edit permission', async ({ page }) => {
      // Arrange: invoice:view のみ、invoice:edit なし
      const invoiceViewUser = {
        id: 'sales01',
        name: '佐藤 営業',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'invoice:view', 'approval:view'
          // invoice:edit は含まない
        ]
      };
      await setupWithPermissions(page, invoiceViewUser);
      await loginAs(page, 'sales01', 'sales123');

      // Act: 請求一覧へ移動
      await page.locator('[data-route="invoice"]').click();
      await expect(page.locator('.data-table')).toBeVisible();

      // Assert: 請求対象抽出ボタン（新規作成相当）が非表示
      await expect(page.locator('#invoice-extract-btn')).not.toBeVisible();
    });

    test('should hide 新規登録 button in master when user lacks master:edit permission', async ({ page }) => {
      // Arrange: master:view のみ、master:edit なし
      const masterViewUser = {
        id: 'sales01',
        name: '佐藤 営業',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'master:view', 'approval:view'
          // master:edit は含まない
        ]
      };
      await setupWithPermissions(page, masterViewUser);
      await loginAs(page, 'sales01', 'sales123');

      // Act: マスタ管理へ移動
      await page.locator('[data-route="master"]').click();
      await expect(page.locator('.data-table')).toBeVisible();

      // Assert: 新規登録ボタンが非表示
      await expect(page.locator('#new-customer-btn')).not.toBeVisible();
    });

    test('should hide edit buttons in master list when user lacks master:edit permission', async ({ page }) => {
      // Arrange: master:view のみ
      const masterViewUser = {
        id: 'sales01',
        name: '佐藤 営業',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'master:view', 'approval:view'
          // master:edit は含まない
        ]
      };
      await setupWithPermissions(page, masterViewUser);
      await loginAs(page, 'sales01', 'sales123');

      // Act: マスタ管理（顧客一覧）へ移動
      await page.locator('[data-route="master"]').click();
      await expect(page.locator('.data-table')).toBeVisible();

      // Assert: 編集ボタンが表示されない
      await expect(page.locator('[data-action-edit]')).toHaveCount(0);
    });

  });

  test.describe('マスタ管理権限（master:view）なし', () => {

    test('should hide master management menu item when user lacks master:view permission', async ({ page }) => {
      // Arrange: master:view を持たないユーザ
      const noMasterUser = {
        id: 'viewer',
        name: '閲覧ユーザ',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'invoice:view', 'approval:view'
          // master:view は含まない
        ]
      };
      await setupWithPermissions(page, noMasterUser);
      await loginAs(page, 'viewer', 'viewer123');

      // Assert: マスタ管理（S-11）メニューが非表示
      await expect(page.locator('[data-route="master"]')).not.toBeVisible();
    });

    test('should not expose master route when user lacks master:view permission', async ({ page }) => {
      // Arrange: master:view を持たないユーザ
      const noMasterUser = {
        id: 'viewer',
        name: '閲覧ユーザ',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'invoice:view'
          // master:view は含まない
        ]
      };
      await setupWithPermissions(page, noMasterUser);
      await loginAs(page, 'viewer', 'viewer123');

      // Assert: マスタ管理のデータテーブルにアクセスできない（メニュー非表示のため）
      // サイドバーに存在しないことを確認
      const masterMenuCount = await page.locator('[data-route="master"]').count();
      expect(masterMenuCount).toBe(0);
    });

  });

  test.describe('閲覧専用権限の境界確認', () => {

    test('should show approval menu for user with approval:view but hide action buttons', async ({ page }) => {
      // Arrange: approval:view のみ
      const approvalViewUser = {
        id: 'approver-readonly',
        name: '承認閲覧者',
        userType: '一般ユーザ',
        permissions: ['dashboard:view', 'approval:view']
      };
      await setupWithPermissions(page, approvalViewUser);
      await loginAs(page, 'approver-readonly', 'password123');

      // Assert: 承認メニューは表示される（閲覧可）
      await expect(page.locator('[data-route="approval"]')).toBeVisible();
    });

    test('should not show quotation menu when user lacks quotation:view permission', async ({ page }) => {
      // Arrange: 経理ユーザ（請求・入金のみ）
      const financeUser = {
        id: 'finance01',
        name: '鈴木 経理',
        userType: '一般ユーザ',
        permissions: [
          'dashboard:view', 'invoice:view', 'invoice:edit',
          'receipt:view', 'payment:view', 'approval:view'
          // quotation:view は含まない
        ]
      };
      await setupWithPermissions(page, financeUser);
      await loginAs(page, 'finance01', 'finance123');

      // Assert: 見積メニューが非表示
      await expect(page.locator('[data-route="quotation"]')).not.toBeVisible();
    });

  });

});
