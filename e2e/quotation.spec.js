import { test, expect } from './fixtures.js';

test.describe('S-04 見積一覧', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should display all 11 quotations when default page size is 20', async ({ page }) => {
    await expect(page.locator('.data-table-body-row')).toHaveCount(11);
    await expect(page.locator('.table-summary')).toContainText('全 11 件中');
  });

  test('should show project name (not code) in quotation list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('新規保守案件');
    await expect(page.locator('.data-table')).not.toContainText('PJ-00001');
  });

  test('should show customer name (not code) in quotation list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('株式会社青葉システム');
    await expect(page.locator('.data-table')).not.toContainText('CUS-001');
  });

  test('should show total amount formatted with yen in quotation list', async ({ page }) => {
    await expect(page.locator('.data-table')).toContainText('660,000 円');
  });

  test('should filter quotation list when keyword is entered in search box', async ({ page }) => {
    await page.locator('[data-table-input="search"]').fill('初回');

    await expect(page.locator('.data-table-body-row')).toHaveCount(2);
  });

  test('should filter quotation list by status', async ({ page }) => {
    await page.locator('[data-table-filter="status"]').selectOption('下書き');

    await expect(page.locator('.data-table-body-row')).toHaveCount(2);
  });

  test('should show new-quotation button for admin', async ({ page }) => {
    await expect(page.locator('#new-quotation-btn')).toBeVisible();
  });
});

test.describe('S-04 見積ヘッダ登録', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('#new-quotation-btn').click();
    await expect(page.locator('#quotation-register-form')).toBeVisible();
  });

  test('should auto-fill quotation code with next sequential value when form opens', async ({ page }) => {
    await expect(page.locator('#f-quo-code')).toHaveValue('QUO-00012');
  });

  test('should show only 商談中 projects in project search dropdown', async ({ page }) => {
    // "システム" は D社システム導入（商談中）と 青葉システム顧客の案件（進行中）の両方にマッチしうる
    await page.locator('[data-project-search-input]').fill('システム');

    await expect(page.locator('.project-search-dropdown.is-open')).toBeVisible();
    // 商談中のみ（PJ-00004 D社システム導入）が候補に出る
    await expect(page.locator('.project-search-item')).toContainText('D社システム導入');
    // 進行中の新規保守案件（顧客: 株式会社青葉システム）は出ない
    await expect(page.locator('.project-search-dropdown')).not.toContainText('新規保守案件');
  });

  test('should show customer name when project is selected from dropdown', async ({ page }) => {
    await page.locator('[data-project-search-input]').fill('D社');
    await page.locator('.project-search-item').click();

    await expect(page.locator('#quotation-customer-display')).toContainText('新都建設エンジニアリング株式会社');
  });

  test('should show 下書き保存 and 承認依頼 buttons on new registration form', async ({ page }) => {
    await expect(page.getByRole('button', { name: '下書き保存' })).toBeVisible();
    await expect(page.getByRole('button', { name: '承認依頼' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible();
  });

  test('should save as 下書き and return to list when 下書き保存 is clicked', async ({ page }) => {
    await page.fill('#f-quo-title', 'テスト見積（下書き）');
    await page.locator('[data-project-search-input]').fill('D社');
    await page.locator('.project-search-item').click();
    await page.fill('#f-quo-issue-date', '2026-05-10');

    await page.getByRole('button', { name: '下書き保存' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('テスト見積（下書き）');
  });

  test('should save as 承認依頼中 and return to list when 承認依頼 is clicked', async ({ page }) => {
    await page.fill('#f-quo-title', 'テスト見積（承認依頼）');
    await page.locator('[data-project-search-input]').fill('D社');
    await page.locator('.project-search-item').click();
    await page.fill('#f-quo-issue-date', '2026-05-10');

    await page.getByRole('button', { name: '承認依頼' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('承認依頼中');
  });

  test('should return to list when cancel button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'キャンセル' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('#quotation-register-form')).not.toBeVisible();
  });

  test('should show validation error when required fields are empty', async ({ page }) => {
    await page.getByRole('button', { name: '下書き保存' }).click();

    await expect(page.locator('.field-error').filter({ hasText: '見積件名は必須です。' })).toBeVisible();
  });
});

test.describe('S-04 見積明細登録', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('#new-quotation-btn').click();
    await expect(page.locator('#quotation-register-form')).toBeVisible();
  });

  test('should show detail section with add-line button on registration form', async ({ page }) => {
    await expect(page.locator('.detail-section')).toBeVisible();
    await expect(page.locator('#add-detail-line')).toBeVisible();
  });

  test('should add a new detail line when add-line button is clicked', async ({ page }) => {
    await page.locator('#add-detail-line').click();

    await expect(page.locator('.detail-line')).toHaveCount(1);
  });

  test('should auto-fill product name and unit price when product is selected', async ({ page }) => {
    await page.locator('#add-detail-line').click();

    await page.locator('.detail-line').first().locator('[data-detail-field="productCode"]').selectOption('PRD-001');

    await expect(page.locator('.detail-line').first().locator('[data-detail-field="productName"]')).toHaveValue('サーバー保守サービス');
    await expect(page.locator('.detail-line').first().locator('[data-detail-field="unitPrice"]')).toHaveValue('50000');
  });

  test('should remove detail line when delete button is clicked', async ({ page }) => {
    await page.locator('#add-detail-line').click();
    await page.locator('#add-detail-line').click();
    await expect(page.locator('.detail-line')).toHaveCount(2);

    await page.locator('[data-remove-line="1"]').click();

    await expect(page.locator('.detail-line')).toHaveCount(1);
  });

  test('should show subtotal and total in detail totals section', async ({ page }) => {
    await page.locator('#add-detail-line').click();
    await page.locator('.detail-line').first().locator('[data-detail-field="productCode"]').selectOption('PRD-001');

    await expect(page.locator('.detail-totals')).toContainText('円');
  });

  test('should save quotation with detail lines when 下書き保存 is clicked', async ({ page }) => {
    await page.fill('#f-quo-title', '明細テスト見積');
    await page.locator('[data-project-search-input]').fill('D社');
    await page.locator('.project-search-item').click();
    await page.fill('#f-quo-issue-date', '2026-05-10');
    await page.locator('#add-detail-line').click();
    await page.locator('.detail-line').first().locator('[data-detail-field="productCode"]').selectOption('PRD-001');

    await page.getByRole('button', { name: '下書き保存' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('明細テスト見積');
  });

  test('should show existing detail lines when editing a quotation', async ({ page }) => {
    await page.locator('#quotation-form-cancel').click();
    // QUO-00001 は明細1行あり
    await page.locator('[data-action-edit-quotation="QUO-00001"]').click();

    await expect(page.locator('.detail-line')).toHaveCount(1);
    await expect(page.locator('.detail-line').first().locator('[data-detail-field="productName"]')).toHaveValue('サーバー保守サービス');
  });
});

test.describe('S-04 見積詳細表示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show quotation detail when detail button is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    await expect(page.locator('.panel-title-text')).toContainText('新規保守案件 初回見積');
    await expect(page.locator('.detail-grid')).toBeVisible();
  });

  test('should show project name and customer name in detail view', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    await expect(page.locator('.detail-grid')).toContainText('新規保守案件');
    await expect(page.locator('.detail-grid')).toContainText('株式会社青葉システム');
  });

  test('should show detail lines in detail view', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    await expect(page.locator('.detail-line')).toHaveCount(1);
    await expect(page.locator('.detail-section').first()).toContainText('サーバー保守サービス');
  });

  test('should show totals in detail view', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    await expect(page.locator('.detail-totals')).toContainText('660,000 円');
  });

  test('should return to list when back button is clicked on detail screen', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();
    await expect(page.locator('.detail-grid')).toBeVisible();

    await page.locator('#quotation-detail-back').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.detail-grid')).not.toBeVisible();
  });

  test('should show edit button on detail screen for 下書き quotation', async ({ page }) => {
    // QUO-00002 は下書き
    await page.locator('[data-action-detail-quotation="QUO-00002"]').click();

    await expect(page.locator('[data-action-edit-quotation="QUO-00002"]')).toBeVisible();
  });

  test('should not show edit button on detail screen for 承認依頼中 quotation', async ({ page }) => {
    // QUO-00003 は承認依頼中
    await page.locator('[data-action-detail-quotation="QUO-00003"]').click();

    await expect(page.locator('[data-action-edit-quotation="QUO-00003"]')).not.toBeVisible();
  });
});

test.describe('S-04 見積ワークフロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 承認する and 却下する buttons when opening 承認依頼中 quotation', async ({ page }) => {
    // QUO-00003 は承認依頼中
    await page.locator('[data-action-edit-quotation="QUO-00003"]').click();

    await expect(page.getByRole('button', { name: '承認する' })).toBeVisible();
    await expect(page.getByRole('button', { name: '却下する' })).toBeVisible();
  });

  test('should update status to 承認済み when 承認する is clicked', async ({ page }) => {
    await page.locator('[data-action-edit-quotation="QUO-00003"]').click();
    await page.getByRole('button', { name: '承認する' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    // QUO-00003 の行が承認済みになっている
    await expect(page.locator('[data-action-edit-quotation="QUO-00003"]').locator('xpath=ancestor::div[contains(@class,"data-table-body-row")]')).toContainText('承認済み');
  });

  test('should show 失注に変更 button when opening 承認済み quotation', async ({ page }) => {
    // QUO-00001 は承認済み
    await page.locator('[data-action-edit-quotation="QUO-00001"]').click();

    await expect(page.getByRole('button', { name: '失注に変更' })).toBeVisible();
  });

  test('should update status to 失注 when 失注に変更 is clicked', async ({ page }) => {
    await page.locator('[data-action-edit-quotation="QUO-00001"]').click();
    await page.getByRole('button', { name: '失注に変更' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('[data-action-edit-quotation="QUO-00001"]').locator('xpath=ancestor::div[contains(@class,"data-table-body-row")]')).toContainText('失注');
  });

  test('should show reject reason textarea when 承認依頼中 quotation is opened', async ({ page }) => {
    // QUO-00009 は承認依頼中（QUO-00003はtest 280で承認済みになる）
    await page.locator('[data-action-edit-quotation="QUO-00009"]').click();

    await expect(page.locator('#f-quo-reject-reason')).toBeVisible();
  });

  test('should show validation error when 却下する is clicked without reject reason', async ({ page }) => {
    await page.locator('[data-action-edit-quotation="QUO-00009"]').click();
    await page.getByRole('button', { name: '却下する' }).click();

    await expect(page.locator('.field-error').filter({ hasText: '却下理由は必須です。' })).toBeVisible();
  });

  test('should update status to 却下 when reject reason is entered and 却下する is clicked', async ({ page }) => {
    await page.locator('[data-action-edit-quotation="QUO-00009"]').click();
    await page.fill('#f-quo-reject-reason', '金額が予算を超過しています。');
    await page.getByRole('button', { name: '却下する' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('[data-action-edit-quotation="QUO-00009"]').locator('xpath=ancestor::div[contains(@class,"data-table-body-row")]')).toContainText('却下');
  });

  test('should show reject reason on detail view after rejection', async ({ page }) => {
    // QUO-00009 was already rejected by the previous test with reason '金額が予算を超過しています。'
    await page.locator('[data-action-detail-quotation="QUO-00009"]').click();

    await expect(page.locator('.detail-grid')).toContainText('金額が予算を超過しています。');
  });
});

test.describe('S-04 見積改版', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 改版 button on detail screen for 承認済み quotation', async ({ page }) => {
    // QUO-00010 は承認済み（QUO-00001はtest 296で失注になる）
    await page.locator('[data-action-detail-quotation="QUO-00010"]').click();

    await expect(page.locator('[data-action-revise-quotation="QUO-00010"]')).toBeVisible();
  });

  test('should not show 改版 button on detail screen for 下書き quotation', async ({ page }) => {
    // QUO-00002 は下書き
    await page.locator('[data-action-detail-quotation="QUO-00002"]').click();

    await expect(page.locator('[data-action-revise-quotation="QUO-00002"]')).not.toBeVisible();
  });

  test('should open edit form with incremented version when 改版 is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00010"]').click();
    await page.locator('[data-action-revise-quotation="QUO-00010"]').click();

    await expect(page.locator('#quotation-register-form')).toBeVisible();
    // 版数が 2 になっている（QUO-00010 は第1版 → 第2版）
    await expect(page.locator('#f-quo-version')).toHaveValue('2');
  });

  test('should assign new quotation code to revised quotation', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00010"]').click();
    await page.locator('[data-action-revise-quotation="QUO-00010"]').click();

    // 既存11件 + 3件作成後の次は QUO-00015
    await expect(page.locator('#f-quo-code')).toHaveValue('QUO-00015');
  });

  test('should save revised quotation and show it in list', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00010"]').click();
    await page.locator('[data-action-revise-quotation="QUO-00010"]').click();

    await page.getByRole('button', { name: '下書き保存' }).click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('.data-table')).toContainText('QUO-00015');
  });
});

test.describe('S-04 見積PDF出力', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show PDF出力 button on quotation detail screen', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    await expect(page.locator('[data-action-print-quotation="QUO-00001"]')).toBeVisible();
  });

  test('should open print window containing quotation title when PDF出力 is clicked', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('[data-action-print-quotation="QUO-00001"]').click()
    ]);

    await popup.waitForLoadState('domcontentloaded');
    await expect(popup.locator('body')).toContainText('新規保守案件 初回見積');
  });

  test('should include customer name in print window', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('[data-action-print-quotation="QUO-00001"]').click()
    ]);

    await popup.waitForLoadState('domcontentloaded');
    await expect(popup.locator('body')).toContainText('株式会社青葉システム');
  });

  test('should include total amount in print window', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00001"]').click();

    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.locator('[data-action-print-quotation="QUO-00001"]').click()
    ]);

    await popup.waitForLoadState('domcontentloaded');
    await expect(popup.locator('body')).toContainText('660,000');
  });
});

test.describe('S-04 見積 権限制御', () => {
  test('should show quotation list and new-quotation button for sales01', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'sales01');
    await page.fill('#password', 'sales123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();

    await expect(page.locator('.data-table')).toBeVisible();
    await expect(page.locator('#new-quotation-btn')).toBeVisible();
  });

  test('should not show quotation nav item for finance01 who lacks quotation:view', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'finance01');
    await page.fill('#password', 'finance123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();

    await expect(page.locator('.sidebar [data-route="quotation"]')).not.toBeVisible();
  });
});

test.describe('P10-RT-01 見積却下→修正→再申請', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show 下書きに戻す button on quotation detail after rejection', async ({ page }) => {
    // Reject QUO-00011 (承認依頼中) from approval screen（QUO-00003はtest 280で承認済みになる）
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="見積:QUO-00011"]').click();
    await page.locator('#quotation-reject-btn').click();
    await page.locator('#approval-comment-input').fill('金額を修正してください');
    await page.locator('#approval-confirm-reject').click();
    // Navigate to quotation detail to verify
    await page.locator('.sidebar [data-route="quotation"]').click();
    await page.locator('[data-action-detail-quotation="QUO-00011"]').click();

    await expect(page.locator('#quotation-return-draft-btn')).toBeVisible();
  });

  test('should complete full reject→return-to-draft→resubmit→approve flow', async ({ page }) => {
    // QUO-00011 was already rejected (却下) by the previous test
    // Step 2: Verify QUO-00011 is 却下
    await page.locator('.sidebar [data-route="quotation"]').click();
    await page.locator('[data-action-detail-quotation="QUO-00011"]').click();
    await expect(page.locator('.status').first()).toContainText('却下');

    // Step 3: Return to draft
    await page.locator('#quotation-return-draft-btn').click();
    await expect(page.locator('.status').first()).toContainText('下書き');

    // Step 4: Re-submit via edit form
    await page.locator('#quotation-detail-back').click();
    await page.locator('[data-action-edit-quotation="QUO-00011"]').click();
    await page.getByRole('button', { name: '承認依頼' }).click();
    await expect(page.locator('[data-action-edit-quotation="QUO-00011"]').locator('xpath=ancestor::div[contains(@class,"data-table-body-row")]')).toContainText('承認依頼中');

    // Step 5: Approve from approval screen
    await page.locator('.sidebar [data-route="approval"]').click();
    await page.locator('[data-action-detail-approval="見積:QUO-00011"]').click();
    await page.locator('#quotation-approve-btn').click();
    await page.locator('#approval-confirm-approve').click();

    // Step 6: Verify final approved status
    await page.locator('.sidebar [data-route="quotation"]').click();
    await page.locator('[data-action-detail-quotation="QUO-00011"]').click();
    await expect(page.locator('.status').first()).toContainText('承認済み');
  });
});

test.describe('P10-RT-05 大量データ・ページネーション動作確認', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should show all 15 quotations on page 1 when page size is 20', async ({ page }) => {
    // Default page size is 20 — all 15 fit on one page（11 seed + 4 created by prior tests）
    await expect(page.locator('.data-table-body-row')).toHaveCount(15);
    await expect(page.locator('.table-summary')).toContainText('全 15 件中 1 - 15 件を表示');
    await expect(page.locator('.pagination-text')).toContainText('1 / 1 ページ');
  });

  test('should show 5 rows and page 1 of 3 when page size is changed to 5', async ({ page }) => {
    // Act: change page size to 5
    await page.locator('select[data-table-pagesize][data-table="quotationList"]').selectOption('5');

    // Assert: only 5 rows visible; pagination shows 3 pages
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
    await expect(page.locator('.table-summary')).toContainText('全 15 件中 1 - 5 件を表示');
    await expect(page.locator('.pagination-text')).toContainText('1 / 3 ページ');
  });

  test('should show 5 rows on page 2 when next is clicked with page size 5', async ({ page }) => {
    // Arrange: change page size to 5 to enable pagination
    await page.locator('select[data-table-pagesize][data-table="quotationList"]').selectOption('5');
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);

    // Act: navigate to page 2
    await page.locator('[data-table-action="next"][data-table="quotationList"]').click();

    // Assert: 5 rows shown on page 2
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
    await expect(page.locator('.table-summary')).toContainText('全 15 件中 6 - 10 件を表示');
    await expect(page.locator('.pagination-text')).toContainText('2 / 3 ページ');
  });

  test('should return to page 1 with 5 rows when prev is clicked from page 2', async ({ page }) => {
    // Arrange: navigate to page 2
    await page.locator('select[data-table-pagesize][data-table="quotationList"]').selectOption('5');
    await page.locator('[data-table-action="next"][data-table="quotationList"]').click();
    await expect(page.locator('.pagination-text')).toContainText('2 / 3 ページ');

    // Act: navigate back to page 1
    await page.locator('[data-table-action="prev"][data-table="quotationList"]').click();

    // Assert: back to 5 rows on page 1
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);
    await expect(page.locator('.pagination-text')).toContainText('1 / 3 ページ');
  });

  test('should disable prev button on page 1 and next button on last page', async ({ page }) => {
    // Arrange: set page size to 5 to trigger pagination
    await page.locator('select[data-table-pagesize][data-table="quotationList"]').selectOption('5');

    // Assert: prev is disabled on page 1
    await expect(page.locator('[data-table-action="prev"][data-table="quotationList"]')).toBeDisabled();
    await expect(page.locator('[data-table-action="next"][data-table="quotationList"]')).not.toBeDisabled();

    // Navigate to last page (page 3)
    await page.locator('[data-table-action="next"][data-table="quotationList"]').click();
    await page.locator('[data-table-action="next"][data-table="quotationList"]').click();

    // Assert: next is disabled on last page
    await expect(page.locator('[data-table-action="next"][data-table="quotationList"]')).toBeDisabled();
    await expect(page.locator('[data-table-action="prev"][data-table="quotationList"]')).not.toBeDisabled();
  });

  test('should show all rows on single page when page size is increased back to 20', async ({ page }) => {
    // Arrange: switch to 5 then back to 20
    await page.locator('select[data-table-pagesize][data-table="quotationList"]').selectOption('5');
    await expect(page.locator('.data-table-body-row')).toHaveCount(5);

    // Act: restore page size to 20
    await page.locator('select[data-table-pagesize][data-table="quotationList"]').selectOption('20');

    // Assert: all 15 rows visible again on a single page
    await expect(page.locator('.data-table-body-row')).toHaveCount(15);
    await expect(page.locator('.pagination-text')).toContainText('1 / 1 ページ');
  });
});

test.describe('P10-RT-02 見積バリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
    await page.locator('#new-quotation-btn').click();
    await expect(page.locator('#quotation-register-form')).toBeVisible();
  });

  test('should show 案件は必須です error when project is not selected on submit', async ({ page }) => {
    // Arrange: fill title and date but leave project empty
    await page.fill('#f-quo-title', 'バリデーションテスト見積');
    await page.fill('#f-quo-issue-date', '2026-05-10');

    // Act
    await page.getByRole('button', { name: '下書き保存' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '案件は必須です。' })).toBeVisible();
  });

  test('should show 発行日は必須です error when issue date is empty on submit', async ({ page }) => {
    // Arrange: fill title and project but leave date empty
    await page.fill('#f-quo-title', 'バリデーションテスト見積');
    await page.locator('[data-project-search-input]').fill('D社');
    await page.locator('.project-search-item').click();

    // Act
    await page.getByRole('button', { name: '下書き保存' }).click();

    // Assert
    await expect(page.locator('.field-error').filter({ hasText: '発行日は必須です。' })).toBeVisible();
  });

  test('should show all required field errors simultaneously when form is submitted completely empty', async ({ page }) => {
    // Act
    await page.getByRole('button', { name: '下書き保存' }).click();

    // Assert: all three required field errors shown simultaneously
    await expect(page.locator('.field-error').filter({ hasText: '見積件名は必須です。' })).toBeVisible();
    await expect(page.locator('.field-error').filter({ hasText: '案件は必須です。' })).toBeVisible();
    await expect(page.locator('.field-error').filter({ hasText: '発行日は必須です。' })).toBeVisible();
  });
});

test.describe('RT-05 伝票状態遷移制御 - 取消済み見積', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', 'admin123');
    await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
    await page.locator('.sidebar [data-route="quotation"]').click();
    await expect(page.locator('.data-table')).toBeVisible();
  });

  test('should not show 受注作成 button on 取消 quotation QUO-00008', async ({ page }) => {
    // Arrange: QUO-00008 is seeded with status '取消'
    await page.locator('[data-action-detail-quotation="QUO-00008"]').click();

    // Assert: 受注作成 button is NOT visible for 取消 status
    await expect(page.locator('[data-action-create-order="QUO-00008"]')).not.toBeVisible();
  });

  test('should show 取消 status badge on QUO-00008 detail', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00008"]').click();

    await expect(page.locator('.status').first()).toContainText('取消');
  });

  test('should not show 編集 button on 取消 quotation', async ({ page }) => {
    await page.locator('[data-action-detail-quotation="QUO-00008"]').click();

    // 取消状態では編集ボタン（data-action-edit-quotation）は表示されない
    await expect(page.locator('[data-action-edit-quotation="QUO-00008"]')).not.toBeVisible();
  });
});
