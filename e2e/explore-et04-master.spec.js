// ET-04: マスタ管理の登録・編集・検索・ページング
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

test.describe('ET-04: マスタ管理探索', () => {

  test('顧客マスタ一覧が表示され、ページあたり5件以下か確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);
    const rows = await page.locator('table tbody tr').count();
    console.log(`[ET-04] 顧客マスタ一覧の表示行数: ${rows}（PAGE_SIZE=5）`);
    // 9件存在→1ページ目は5件のはず
    expect(rows).toBeLessThanOrEqual(5);
  });

  test('ページングで2ページ目に遷移できるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const nextBtn = page.locator('button', { hasText: '次' }).or(page.locator('button', { hasText: '>' })).or(page.locator('[class*="next"]')).first();
    const hasNext = await nextBtn.isVisible().catch(() => false);
    console.log(`[ET-04] 次ページボタン表示: ${hasNext}`);
    if (hasNext) {
      await nextBtn.click();
      await page.waitForTimeout(300);
      const rows2 = await page.locator('table tbody tr').count();
      console.log(`[ET-04] 2ページ目の表示行数: ${rows2}（残り4件のはず）`);
    }
  });

  test('顧客名でキーワード検索が機能するか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[type="text"]').first();
    const hasSearch = await searchInput.isVisible().catch(() => false);
    if (hasSearch) {
      await searchInput.fill('青葉');
      await page.waitForTimeout(400);
      const rows = await page.locator('table tbody tr').count();
      const content = await page.locator('table').innerText().catch(() => '');
      console.log(`[ET-04] "青葉"検索後の行数: ${rows}`);
      console.log(`[ET-04] "青葉"が検索結果に含まれる: ${content.includes('青葉')}`);
    } else {
      console.log('[ET-04] 検索入力フィールドが見当たらない');
    }
  });

  test('新規顧客登録フォームが開き、自動採番がCUS-010になるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const newBtn = page.locator('button', { hasText: '新規登録' }).or(page.locator('button', { hasText: '新規顧客' })).or(page.locator('button', { hasText: '登録' })).first();
    const hasBtn = await newBtn.isVisible().catch(() => false);
    console.log(`[ET-04] 新規登録ボタン表示: ${hasBtn}`);
    if (hasBtn) {
      await newBtn.click();
      await page.waitForTimeout(400);
      // コードフィールドを確認
      const codeInput = page.locator('input[name="code"], input[id="code"], input[placeholder*="コード"]').first();
      const codeValue = await codeInput.inputValue().catch(() => '（取得不可）');
      console.log(`[ET-04] 自動採番されたコード: "${codeValue}"（期待値: CUS-010）`);
      // CUS-010 かどうか確認
      if (codeValue === 'CUS-010') {
        console.log('[ET-04] ✅ 自動採番が正しい');
      } else if (codeValue === '') {
        console.log('[ET-04] ⚠️ コードフィールドが空（自動採番されていない可能性）');
      } else {
        console.log(`[ET-04] ⚠️ 期待値と異なる採番: ${codeValue}`);
      }
    }
  });

  test('顧客を新規登録して一覧に追加されるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const newBtn = page.locator('button', { hasText: '新規登録' }).or(page.locator('button', { hasText: '登録' })).first();
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(400);

      // フォームを埋める
      const nameInput = page.locator('input[name="name"], input[id="name"], input[placeholder*="顧客名"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('テスト商事株式会社');
      }
      // 保存ボタン
      const saveBtn = page.locator('button[type="submit"]').or(page.locator('button', { hasText: '保存' })).or(page.locator('button', { hasText: '登録' })).last();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(500);
        const content = await page.locator('main').innerText().catch(() => '');
        console.log(`[ET-04] 登録後に"テスト商事"が一覧に出現: ${content.includes('テスト商事')}`);
      }
    }
  });

  test('仕入先タブへの切り替えを確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const supplierTab = page.locator('[class*="tab"]', { hasText: '仕入先' }).or(page.locator('button', { hasText: '仕入先' })).first();
    const hasTab = await supplierTab.isVisible().catch(() => false);
    console.log(`[ET-04] 仕入先タブ表示: ${hasTab}`);
    if (hasTab) {
      await supplierTab.click();
      await page.waitForTimeout(300);
      const rows = await page.locator('table tbody tr').count();
      console.log(`[ET-04] 仕入先一覧の行数: ${rows}（期待値: 5件以下）`);
    }
  });

  test('商品マスタで単価フィールドの入力値の型を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    // 商品タブへ切り替え
    const productTab = page.locator('[class*="tab"]', { hasText: '商品' }).or(page.locator('button', { hasText: '商品' })).first();
    if (await productTab.isVisible().catch(() => false)) {
      await productTab.click();
      await page.waitForTimeout(300);
      const content = await page.locator('table').innerText().catch(() => '');
      console.log(`[ET-04] 商品マスタ一覧に"50,000"（カンマ区切り）が含まれる: ${content.includes('50,000')}`);
      console.log(`[ET-04] 商品マスタ一覧に"50000"（生文字列）が含まれる: ${content.includes('50000')}`);
    }
  });

  test('sales01 はマスタを閲覧できるが編集ボタンがない（またはマスタ自体非表示）', async ({ page }) => {
    await login(page, 'sales01', 'sales123');
    const masterMenu = page.locator('.menu-item', { hasText: 'マスタ管理' });
    const menuVisible = await masterMenu.isVisible().catch(() => false);
    console.log(`[ET-04] sales01にマスタ管理メニュー: ${menuVisible}`);
    if (menuVisible) {
      await masterMenu.click();
      await page.waitForTimeout(300);
      const editBtns = await page.locator('button', { hasText: '編集' }).count();
      const newBtns  = await page.locator('button', { hasText: '新規登録' }).count();
      console.log(`[ET-04] sales01のマスタ画面: 編集ボタン=${editBtns}件, 新規ボタン=${newBtns}件`);
    }
  });
});
