// ET-02: 見積作成から承認依頼までの一気通貫
import { test, expect } from './fixtures.js';

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

async function navigateTo(page, menuText) {
  await page.locator('.menu-item', { hasText: menuText }).click();
  await page.waitForTimeout(400);
}

test.describe('ET-02: 見積フロー探索', () => {

  test('見積一覧が表示され、既存件数を確認する', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const rows = await page.locator('.data-table-body-row').count();
    console.log(`[ET-02] 見積一覧の行数: ${rows}`);
    expect(rows).toBeGreaterThan(0);
  });

  test('見積一覧でステータス絞り込みが機能するか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const allRows = await page.locator('table tbody tr').count();

    // ステータス絞り込みがあれば試す
    const statusFilter = page.locator('select[data-filter="status"], select#status-filter, select[name="status"]');
    const hasFilter = await statusFilter.isVisible().catch(() => false);
    if (hasFilter) {
      await statusFilter.selectOption('承認済み');
      await page.waitForTimeout(300);
      const filteredRows = await page.locator('table tbody tr').count();
      console.log(`[ET-02] 全件: ${allRows}, 承認済みのみ: ${filteredRows}`);
    } else {
      console.log('[ET-02] ステータスフィルターが見当たらない（別の形式の可能性あり）');
      const filterElements = await page.locator('select').allTextContents();
      console.log(`[ET-02] ページ内のselectボックス: ${JSON.stringify(filterElements)}`);
    }
  });

  test('新規見積ボタンが存在し、フォームが開くか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');

    const newBtn = page.locator('button', { hasText: '新規' }).or(page.locator('button', { hasText: '見積作成' })).or(page.locator('button', { hasText: '新規見積' })).first();
    const btnVisible = await newBtn.isVisible().catch(() => false);
    console.log(`[ET-02] 新規ボタン表示: ${btnVisible}`);
    if (btnVisible) {
      await newBtn.click();
      await page.waitForTimeout(500);
      // フォームまたはモーダルが開いたか確認
      const formVisible = await page.locator('form, .modal, [class*="form"]').first().isVisible().catch(() => false);
      console.log(`[ET-02] フォーム/モーダル表示: ${formVisible}`);
      const inputs = await page.locator('input[type="text"], input[type="number"], select').count();
      console.log(`[ET-02] フォーム内の入力フィールド数: ${inputs}`);
    }
  });

  test('承認済み見積(QUO-00001)の詳細を開いて金額確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');

    // QUO-00001行を探してクリック
    const row = page.locator('tr', { hasText: 'QUO-00001' });
    const rowVisible = await row.isVisible().catch(() => false);
    if (rowVisible) {
      await row.click();
      await page.waitForTimeout(500);
      const pageContent = await page.locator('main').innerText().catch(() => '');
      console.log(`[ET-02] QUO-00001詳細に"660"が含まれる: ${pageContent.includes('660')}`);
      console.log(`[ET-02] QUO-00001詳細に"承認済み"が含まれる: ${pageContent.includes('承認済み')}`);
    } else {
      console.log('[ET-02] QUO-00001の行が見つからない');
    }
  });

  test('見積(QUO-00002)で改版ボタンの有無を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');

    const row = page.locator('tr', { hasText: 'QUO-00002' });
    const rowVisible = await row.isVisible().catch(() => false);
    if (rowVisible) {
      // 行内の詳細ボタンまたは行クリックで詳細へ
      const detailBtn = row.locator('button').first();
      await detailBtn.click().catch(() => row.click());
      await page.waitForTimeout(500);
      const revisionBtn = page.locator('button', { hasText: '改版' });
      const hasRevision = await revisionBtn.isVisible().catch(() => false);
      console.log(`[ET-02] 改版ボタン表示: ${hasRevision}`);
    }
  });

  test('QUO-00003(承認依頼中)で承認依頼ボタンの状態を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const row = page.locator('tr', { hasText: 'QUO-00003' });
    const rowVisible = await row.isVisible().catch(() => false);
    if (rowVisible) {
      await row.click().catch(async () => {
        const btn = row.locator('button').first();
        await btn.click();
      });
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText().catch(() => '');
      console.log(`[ET-02] QUO-00003に"承認依頼中"が含まれる: ${content.includes('承認依頼中')}`);

      // 承認依頼ボタンが押せないか確認（すでに依頼中なので）
      const approvalBtn = page.locator('button', { hasText: '承認依頼' });
      const btnVisible = await approvalBtn.isVisible().catch(() => false);
      const btnDisabled = btnVisible ? await approvalBtn.isDisabled().catch(() => false) : null;
      console.log(`[ET-02] 承認依頼ボタン: 表示=${btnVisible}, 非活性=${btnDisabled}`);
    }
  });

  test('見積書PDF出力ボタンの有無を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const row = page.locator('tr', { hasText: 'QUO-00001' });
    if (await row.isVisible().catch(() => false)) {
      await row.click().catch(async () => row.locator('button').first().click());
      await page.waitForTimeout(500);
      const pdfBtn = page.locator('button', { hasText: 'PDF' }).or(page.locator('button', { hasText: '見積書' })).or(page.locator('button', { hasText: '印刷' })).or(page.locator('button', { hasText: '出力' })).first();
      const hasPdf = await pdfBtn.isVisible().catch(() => false);
      console.log(`[ET-02] PDF/印刷出力ボタン表示: ${hasPdf}`);
    }
  });

  test('sales01は見積の編集・承認依頼ができるか確認', async ({ page }) => {
    await login(page, 'sales01', 'sales123');
    await navigateTo(page, '見積');
    const newBtn = page.locator('button', { hasText: '新規' }).first();
    const hasNewBtn = await newBtn.isVisible().catch(() => false);
    console.log(`[ET-02] sales01の新規見積ボタン表示: ${hasNewBtn}`);
  });

  test('finance01は見積メニューにアクセスできないか確認', async ({ page }) => {
    await login(page, 'finance01', 'finance123');
    const quotationMenu = page.locator('.menu-item', { hasText: '見積' });
    const hasMenu = await quotationMenu.isVisible().catch(() => false);
    console.log(`[ET-02] finance01の見積メニュー表示: ${hasMenu}`);
    if (!hasMenu) {
      // 直接URLで見積ページへ遷移を試みる（ルートがハッシュベースか確認）
      await page.goto('/#quotation').catch(() => {});
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText().catch(() => '');
      console.log(`[ET-02] 直接アクセス後のコンテンツ冒頭: ${content.substring(0, 80)}`);
    }
  });
});
