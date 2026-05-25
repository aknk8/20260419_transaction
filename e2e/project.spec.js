import { test, expect } from '@playwright/test';

test.describe('S-03 案件一覧・詳細', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="project"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display project list with 5 rows', async ({ page }) => {
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
    await expect(page.locator('.table-summary')).toContainText('全 5 件中');
  });

  test('should show customer name (not code) in project list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('株式会社青葉システム');
    await expect(page.locator('.data-table')).not.toContainText('CUS-001');
  });

  test('should filter project list when keyword is entered in search box', async ({ page }) => {
    await page.locator('[data-table-input="search"]').fill('保守');

    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
    await expect(page.locator('.data-table')).toContainText('新規保守案件');
  });

  test('should filter project list by status', async ({ page }) => {
    await page.locator('[data-table-filter="status"]').selectOption('進行中');

    await expect(page.locator('.data-table-body-row')).toHaveCount(1);
    await expect(page.locator('.data-table')).toContainText('新規保守案件');
  });

  test('should show project detail when detail button is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-project="PJ-00001"]').click();

    await expect(page.locator('.panel-title-text')).toContainText('新規保守案件');
    await expect(page.locator('.detail-grid')).toBeVisible();
    await expect(page.locator('.detail-grid')).toContainText('株式会社青葉システム');
  });

  test('should return to list when back button is clicked on detail screen', async ({ page }) => {
    await page.locator('[data-action-detail-project="PJ-00001"]').click();
    await expect(page.locator('.detail-grid')).toBeVisible();

    await page.locator('#project-detail-back').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.detail-grid')).not.toBeVisible();
  });
});

test.describe('S-03 案件登録・編集', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="project"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show new registration form when new project button is clicked', async ({ page }) => {
    await page.locator('#new-project-btn').click();

    await expect(page.locator('#project-register-form')).toBeVisible();
    await expect(page.locator('.panel-title-text')).toContainText('案件登録');
  });

  test('should auto-fill project code with next sequential value when form opens', async ({ page }) => {
    await page.locator('#new-project-btn').click();

    await expect(page.locator('#f-code')).toHaveValue('PJ-00006');
  });

  test('should show customer dropdown when typing in customer search field', async ({ page }) => {
    await page.locator('#new-project-btn').click();

    await page.locator('[data-customer-search-input]').fill('青葉');

    await expect(page.locator('.customer-search-dropdown.is-open')).toBeVisible();
    await expect(page.locator('.customer-search-item')).toContainText('株式会社青葉システム');
  });

  test('should select customer from dropdown and close it', async ({ page }) => {
    await page.locator('#new-project-btn').click();

    await page.locator('[data-customer-search-input]').fill('青葉');
    await page.locator('.customer-search-item').click();

    await expect(page.locator('[data-customer-search-input]')).toHaveValue('株式会社青葉システム');
    await expect(page.locator('.customer-search-dropdown')).not.toHaveClass(/is-open/);
  });

  test('should register new project and show it in list when valid form is submitted', async ({ page }) => {
    await page.locator('#new-project-btn').click();

    await page.fill('#f-name', 'テスト新規案件');
    await page.locator('[data-customer-search-input]').fill('青葉');
    await page.locator('.customer-search-item').click();
    await page.selectOption('#f-department', '営業部門');
    await page.locator('#project-register-form').getByRole('button', { name: '登録する' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('テスト新規案件');
  });

  test('should pre-fill form with existing project data when edit button is clicked', async ({ page }) => {
    await page.locator('[data-action-edit-project="PJ-00001"]').click();

    await expect(page.locator('#project-register-form')).toBeVisible();
    await expect(page.locator('#f-code')).toHaveAttribute('readonly', '');
    await expect(page.locator('#f-name')).toHaveValue('新規保守案件');
    await expect(page.locator('[data-customer-search-input]')).toHaveValue('株式会社青葉システム');
  });

  test('should update project and show changes in list when edit form is saved', async ({ page }) => {
    await page.locator('[data-action-edit-project="PJ-00001"]').click();
    await expect(page.locator('#project-register-form')).toBeVisible();

    await page.fill('#f-name', '新規保守案件（改）');
    await page.locator('#project-register-form').getByRole('button', { name: '更新する' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('新規保守案件（改）');
  });

  test('should return to list when cancel button is clicked on registration form', async ({ page }) => {
    await page.locator('#new-project-btn').click();
    await expect(page.locator('#project-register-form')).toBeVisible();

    await page.locator('#project-form-cancel').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('#project-register-form')).not.toBeVisible();
  });
});

test.describe('S-03 案件 権限制御', () => {
  test('should show project list and new-project button for sales01', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="project"]').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('#new-project-btn')).toBeVisible();
  });

  test('should not show project nav item for finance01 who lacks project:view', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.locator('.sidebar [data-route="project"]')).not.toBeVisible();
  });
});
