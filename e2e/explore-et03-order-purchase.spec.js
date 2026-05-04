// ET-03: 受注→発注起票への金額引き継ぎ確認
import { test, expect } from '@playwright/test';

async function login(page, id, pass) {
  await page.goto('/');
  await page.fill('#user-id', id);
  await page.fill('#password', pass);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.sidebar', { timeout: 5000 });
}

async function navigateTo(page, menuText) {
  await page.locator('.menu-item', { hasText: menuText }).click();
  await page.waitForTimeout(400);
}

test.describe('ET-03: 受注→発注引き継ぎ探索', () => {

  test('受注一覧が表示され、件数を確認する', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '受注');
    const rows = await page.locator('table tbody tr').count();
    console.log(`[ET-03] 受注一覧の行数: ${rows}`);
    expect(rows).toBeGreaterThan(0);
  });

  test('ORD-00001の詳細で顧客名がCUS-001(株式会社青葉システム)と一致するか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '受注');
    const row = page.locator('tr', { hasText: 'ORD-00001' });
    if (await row.isVisible().catch(() => false)) {
      await row.click().catch(async () => row.locator('button').first().click());
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText().catch(() => '');
      const hasCorrectCustomer = content.includes('青葉') || content.includes('CUS-001');
      console.log(`[ET-03] ORD-00001に顧客"青葉/CUS-001"表示: ${hasCorrectCustomer}`);
      console.log(`[ET-03] ORD-00001の合計金額に"660"が含まれる: ${content.includes('660')}`);
    }
  });

  test('ORD-00002の詳細で修正後の顧客(CUS-005)が表示されるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '受注');
    const row = page.locator('tr', { hasText: 'ORD-00002' });
    if (await row.isVisible().catch(() => false)) {
      await row.click().catch(async () => row.locator('button').first().click());
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText().catch(() => '');
      // 修正後: CUS-005(新都建設)が表示されるはず
      const hasCUS005 = content.includes('新都建設') || content.includes('CUS-005');
      const hasCUS003 = content.includes('みなと') || content.includes('CUS-003');
      console.log(`[ET-03] ORD-00002に修正後の顧客(CUS-005/新都建設)表示: ${hasCUS005}`);
      console.log(`[ET-03] ORD-00002に修正前の顧客(CUS-003/みなと)表示: ${hasCUS003} ← 残っていれば修正未反映`);
    }
  });

  test('発注一覧が表示され、既存件数を確認する', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '発注');
    const rows = await page.locator('table tbody tr').count();
    console.log(`[ET-03] 発注一覧の行数: ${rows}`);
    expect(rows).toBeGreaterThan(0);
  });

  test('POD-00001の詳細で金額がORD-00001と整合するか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '発注');
    const row = page.locator('tr', { hasText: 'POD-00001' });
    if (await row.isVisible().catch(() => false)) {
      await row.click().catch(async () => row.locator('button').first().click());
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText().catch(() => '');
      // POD-00001の合計は528,000円
      console.log(`[ET-03] POD-00001に"528"が含まれる: ${content.includes('528')}`);
      console.log(`[ET-03] POD-00001のステータス: 下書きが含まれる=${content.includes('下書き')}`);
    }
  });

  test('発注の discount 値の解釈を確認（発注書プレビューで金額チェック）', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '発注');
    const row = page.locator('tr', { hasText: 'POD-00001' });
    if (await row.isVisible().catch(() => false)) {
      await row.click().catch(async () => row.locator('button').first().click());
      await page.waitForTimeout(500);
      // 発注書出力ボタンを探す
      const printBtn = page.locator('button', { hasText: '発注書' }).or(page.locator('button', { hasText: 'PDF' })).or(page.locator('button', { hasText: '印刷' })).or(page.locator('button', { hasText: '出力' })).first();
      const hasPrint = await printBtn.isVisible().catch(() => false);
      console.log(`[ET-03] 発注書出力ボタン表示: ${hasPrint}`);
    }
  });

  test('受注詳細から発注起票ボタンの有無を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '受注');
    const row = page.locator('tr', { hasText: 'ORD-00001' });
    if (await row.isVisible().catch(() => false)) {
      await row.click().catch(async () => row.locator('button').first().click());
      await page.waitForTimeout(500);
      const purchaseBtn = page.locator('button', { hasText: '発注' }).or(page.locator('button', { hasText: '発注起票' })).first();
      const hasPurchaseBtn = await purchaseBtn.isVisible().catch(() => false);
      console.log(`[ET-03] 受注詳細からの発注起票ボタン: ${hasPurchaseBtn}`);
      // 発注ボタンがあれば押して金額を確認
      if (hasPurchaseBtn) {
        await purchaseBtn.click();
        await page.waitForTimeout(500);
        const formContent = await page.locator('main, .modal, form').last().innerText().catch(() => '');
        console.log(`[ET-03] 発注起票フォームの金額表示: ${formContent.substring(0, 200)}`);
      }
    }
  });

  test('POD-00002のステータス"承認済・発注待ち"が正しく表示されるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '発注');
    const content = await page.locator('main').innerText().catch(() => '');
    const hasStatus = content.includes('承認済・発注待ち') || content.includes('承認済') || content.includes('発注待ち');
    console.log(`[ET-03] 発注一覧に"承認済・発注待ち"表示: ${hasStatus}`);
  });
});
