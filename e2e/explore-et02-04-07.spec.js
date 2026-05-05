// ET-02/03/04/07: 正しいセレクタ（.data-table-body-row）で再実行
import { test, expect } from '@playwright/test';

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
  await page.waitForTimeout(500);
}

// ─── ET-02: 見積フロー ──────────────────────────────────────────
test.describe('ET-02: 見積フロー探索', () => {

  test('見積一覧の行数を確認（.data-table-body-row）', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const rows = await page.locator('.data-table-body-row').count();
    console.log(`[ET-02] 見積一覧 表示行数: ${rows}（PAGE_SIZE=5, 全5件→1ページに収まるはず）`);
    expect(rows).toBeGreaterThan(0);
  });

  test('見積ステータスフィルターに「却下」が存在することを確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const filterSelect = page.locator('select[data-table-filter="status"]');
    const options = await filterSelect.locator('option').allTextContents();
    console.log(`[ET-02] ステータスフィルター選択肢: ${JSON.stringify(options)}`);
    const hasKakka = options.includes('却下');
    const hasShitsu = options.includes('失注');
    const hasTorisk = options.includes('取消');
    console.log(`[ET-02] 「却下」あり: ${hasKakka} ← 要件定義7.3に記載なし`);
    console.log(`[ET-02] 「失注」あり: ${hasShitsu}`);
    console.log(`[ET-02] 「取消」あり: ${hasTorisk}`);
  });

  test('QUO-00001（承認済み）の詳細を開いて金額を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const row = page.locator('.data-table-body-row', { hasText: 'QUO-00001' });
    const rowVisible = await row.isVisible().catch(() => false);
    console.log(`[ET-02] QUO-00001 行表示: ${rowVisible}`);
    if (rowVisible) {
      const detailBtn = row.locator('button', { hasText: '詳細' });
      await detailBtn.click();
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText().catch(() => '');
      console.log(`[ET-02] 詳細に"承認済み"含む: ${content.includes('承認済み')}`);
      console.log(`[ET-02] 詳細に"660"含む（660,000円）: ${content.includes('660')}`);
      console.log(`[ET-02] 詳細に"600"含む（小計600,000円）: ${content.includes('600')}`);

      // 改版ボタンを確認
      const revBtn = page.locator('button', { hasText: '改版' });
      console.log(`[ET-02] 改版ボタン表示: ${await revBtn.isVisible().catch(() => false)}`);

      // PDF出力ボタンを確認
      const pdfBtn = page.locator('button', { hasText: 'PDF' }).or(page.locator('button', { hasText: '見積書' })).or(page.locator('button', { hasText: '出力' })).or(page.locator('button', { hasText: '印刷' })).first();
      console.log(`[ET-02] PDF/出力ボタン表示: ${await pdfBtn.isVisible().catch(() => false)}`);
    }
  });

  test('QUO-00003（承認依頼中）詳細での承認依頼ボタン状態確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const row = page.locator('.data-table-body-row', { hasText: 'QUO-00003' });
    if (await row.isVisible().catch(() => false)) {
      await row.locator('button', { hasText: '詳細' }).click();
      await page.waitForTimeout(500);
      const approvalBtn = page.locator('button', { hasText: '承認依頼' });
      const visible = await approvalBtn.isVisible().catch(() => false);
      const disabled = visible ? await approvalBtn.isDisabled().catch(() => false) : null;
      console.log(`[ET-02] 承認依頼中の見積に「承認依頼」ボタン: 表示=${visible}, 非活性=${disabled}`);
    }
  });

  test('新規見積フォームのフィールド数と自動採番を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    const newBtn = page.locator('#new-quotation-btn');
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(500);
      const inputs = await page.locator('input, select, textarea').count();
      console.log(`[ET-02] 新規見積フォームの入力要素数: ${inputs}`);
      const codeInput = page.locator('input[name="code"], #quotation-code, input').first();
      const codeVal = await codeInput.inputValue().catch(() => '');
      console.log(`[ET-02] 自動採番コード: "${codeVal}"（期待: QUO-00006）`);
    } else {
      console.log('[ET-02] 新規登録ボタンが見当たらない');
    }
  });

  test('finance01が見積URLへ直接アクセスしたときダッシュボードへリダイレクトされるか', async ({ page }) => {
    await login(page, 'finance01', 'finance123');
    // finance01 のデフォルト画面を確認
    const content = await page.locator('main .page-title, main h1, main .panel-title-text').first().innerText().catch(() => '');
    console.log(`[ET-02] finance01のデフォルト画面: "${content}"`);
    // ルート変更を試みる
    await page.evaluate(() => { window.location.hash = 'quotation'; });
    await page.waitForTimeout(500);
    const afterContent = await page.locator('main .page-title, main .page-copy').first().innerText().catch(() => '');
    console.log(`[ET-02] quotationハッシュアクセス後の画面: "${afterContent.substring(0, 60)}"`);
  });
});

// ─── ET-03: 受注→発注 ──────────────────────────────────────────
test.describe('ET-03: 受注→発注引き継ぎ探索', () => {

  test('受注一覧の行数と全件表示を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '受注');
    const rows = await page.locator('.data-table-body-row').count();
    console.log(`[ET-03] 受注一覧 表示行数: ${rows}`);
    expect(rows).toBeGreaterThan(0);
  });

  test('ORD-00001の詳細で顧客・金額が正しいか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '受注');
    const row = page.locator('.data-table-body-row', { hasText: 'ORD-00001' });
    if (await row.isVisible().catch(() => false)) {
      await row.locator('button', { hasText: '詳細' }).click();
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText();
      console.log(`[ET-03] ORD-00001詳細に"青葉"(CUS-001顧客名)含む: ${content.includes('青葉')}`);
      console.log(`[ET-03] ORD-00001詳細に"660"含む: ${content.includes('660')}`);
      // 発注起票ボタン確認
      const purchBtn = page.locator('button', { hasText: '発注' });
      console.log(`[ET-03] 発注起票ボタン: ${await purchBtn.isVisible().catch(() => false)}`);
      // 請求対象化ボタン確認
      const billBtn = page.locator('button', { hasText: '請求対象' });
      console.log(`[ET-03] 請求対象化ボタン: ${await billBtn.isVisible().catch(() => false)}`);
    }
  });

  test('ORD-00002の詳細でデータ修正後の顧客(CUS-005)が表示されるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '受注');
    const row = page.locator('.data-table-body-row', { hasText: 'ORD-00002' });
    if (await row.isVisible().catch(() => false)) {
      await row.locator('button', { hasText: '詳細' }).click();
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText();
      const hasCUS005 = content.includes('新都建設') || content.includes('CUS-005');
      const hasCUS003 = content.includes('みなと') || content.includes('CUS-003');
      console.log(`[ET-03] ORD-00002に修正後の顧客(CUS-005/新都建設)表示: ${hasCUS005}`);
      console.log(`[ET-03] ORD-00002に旧顧客(CUS-003/みなと)残存: ${hasCUS003} ← trueなら修正未反映`);
    }
  });

  test('発注一覧の行数とステータス値を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '発注');
    const rows = await page.locator('.data-table-body-row').count();
    console.log(`[ET-03] 発注一覧 表示行数: ${rows}`);
    const content = await page.locator('.data-table').innerText().catch(() => '');
    console.log(`[ET-03] 発注一覧に"承認済・発注待ち"含む: ${content.includes('承認済・発注待ち')} ← 定義外ステータス`);
    console.log(`[ET-03] 発注一覧に"下書き"含む: ${content.includes('下書き')}`);
    console.log(`[ET-03] 発注一覧に"納品済"含む: ${content.includes('納品済')}`);
  });

  test('POD-00001の詳細で金額・仕入先・発注書出力を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '発注');
    const row = page.locator('.data-table-body-row', { hasText: 'POD-00001' });
    if (await row.isVisible().catch(() => false)) {
      await row.locator('button', { hasText: '詳細' }).click();
      await page.waitForTimeout(500);
      const content = await page.locator('main').innerText();
      console.log(`[ET-03] POD-00001詳細に"528"含む（528,000円）: ${content.includes('528')}`);
      console.log(`[ET-03] POD-00001詳細に"日本テクノロジー"含む: ${content.includes('日本テクノロジー')}`);
      // 発注書PDF出力ボタン確認
      const pdfBtn = page.locator('button', { hasText: '発注書' }).or(page.locator('button', { hasText: 'PDF' })).or(page.locator('button', { hasText: '出力' })).first();
      console.log(`[ET-03] 発注書出力ボタン: ${await pdfBtn.isVisible().catch(() => false)}`);
      // 承認依頼ボタン確認
      const approvalBtn = page.locator('button', { hasText: '承認依頼' });
      console.log(`[ET-03] 承認依頼ボタン: ${await approvalBtn.isVisible().catch(() => false)}`);
    }
  });
});

// ─── ET-04: マスタ管理 ──────────────────────────────────────────
test.describe('ET-04: マスタ管理探索', () => {

  test('顧客マスタ一覧 表示件数（PAGE_SIZE=5）の確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);
    const rows = await page.locator('.data-table-body-row').count();
    const summary = await page.locator('.table-summary').innerText().catch(() => '');
    console.log(`[ET-04] 顧客マスタ表示行数: ${rows}`);
    console.log(`[ET-04] サマリー: "${summary}"`);
    expect(rows).toBeLessThanOrEqual(5);
  });

  test('ページング（次へ/前へ）の動作確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const nextBtn = page.locator('button', { hasText: '次へ' });
    const isNextEnabled = !(await nextBtn.isDisabled().catch(() => true));
    console.log(`[ET-04] 「次へ」ボタン活性: ${isNextEnabled}（9件あるので2ページあるはず）`);

    if (isNextEnabled) {
      await nextBtn.click();
      await page.waitForTimeout(300);
      const rows2 = await page.locator('.data-table-body-row').count();
      const summary2 = await page.locator('.table-summary').innerText().catch(() => '');
      console.log(`[ET-04] 2ページ目の表示行数: ${rows2}（期待値: 4）`);
      console.log(`[ET-04] 2ページ目サマリー: "${summary2}"`);

      const prevBtn = page.locator('button', { hasText: '前へ' });
      const isPrevEnabled = !(await prevBtn.isDisabled().catch(() => true));
      console.log(`[ET-04] 「前へ」ボタン活性: ${isPrevEnabled}`);
      if (isPrevEnabled) {
        await prevBtn.click();
        await page.waitForTimeout(300);
        const rows1Again = await page.locator('.data-table-body-row').count();
        console.log(`[ET-04] 1ページ目に戻ったときの行数: ${rows1Again}`);
      }
    }
  });

  test('キーワード検索「青葉」で絞り込み確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const searchInput = page.locator('input[data-table-input="search"]');
    await searchInput.fill('青葉');
    await page.waitForTimeout(400);
    const rows = await page.locator('.data-table-body-row').count();
    const content = await page.locator('.data-table').innerText().catch(() => '');
    console.log(`[ET-04] "青葉"検索後 行数: ${rows}（期待値: 1）`);
    console.log(`[ET-04] "青葉"が結果に含まれる: ${content.includes('青葉')}`);
  });

  test('新規顧客登録で自動採番コード(CUS-010)と保存後の一覧反映を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const newBtn = page.locator('#new-customer-btn, button', { hasText: '新規登録' }).first();
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(400);
      // コードの自動採番確認
      const codeInput = page.locator('input[name="code"], input#code, input').first();
      const codeVal = await codeInput.inputValue().catch(() => '（取得不可）');
      console.log(`[ET-04] 自動採番コード: "${codeVal}"（期待値: CUS-010）`);

      // 顧客名を入力して保存
      const nameInputs = await page.locator('input').all();
      for (const inp of nameInputs) {
        const nm = await inp.getAttribute('name').catch(() => '');
        const ph = await inp.getAttribute('placeholder').catch(() => '');
        if (nm.includes('name') || ph.includes('名')) {
          await inp.fill('探索テスト商事株式会社');
          break;
        }
      }

      const saveBtn = page.locator('button[type="submit"], button', { hasText: '登録' }).last();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(500);
        // 一覧に反映されているか
        const summary = await page.locator('.table-summary').innerText().catch(() => '');
        console.log(`[ET-04] 登録後サマリー: "${summary}"`);
        // キーワード検索で確認
        const searchInput = page.locator('input[data-table-input="search"]');
        await searchInput.fill('探索テスト商事');
        await page.waitForTimeout(300);
        const rows = await page.locator('.data-table-body-row').count();
        console.log(`[ET-04] 登録後"探索テスト商事"の検索結果: ${rows}件`);
      }
    } else {
      console.log('[ET-04] 新規登録ボタンが見当たらない');
    }
  });

  test('商品マスタで単価の表示形式（文字列 vs 数値）を確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);
    // 商品タブへ切り替え
    const productTab = page.locator('[data-master-tab="product"], button', { hasText: '商品' }).first();
    if (await productTab.isVisible().catch(() => false)) {
      await productTab.click();
      await page.waitForTimeout(300);
      const content = await page.locator('.data-table').innerText().catch(() => '');
      console.log(`[ET-04] 商品マスタ一覧に"50,000"（数値フォーマット）含む: ${content.includes('50,000')}`);
      console.log(`[ET-04] 商品マスタ一覧に"50000"（生文字列）含む: ${content.includes('50000')}`);
    } else {
      console.log('[ET-04] 商品タブが見当たらない');
      const tabs = await page.locator('[class*="tab"], .master-tab-btn').allTextContents();
      console.log(`[ET-04] 利用可能なタブ: ${JSON.stringify(tabs)}`);
    }
  });

  test('sales01のマスタ管理: 閲覧可能・新規登録/編集ボタン非表示の確認', async ({ page }) => {
    await login(page, 'sales01', 'sales123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);
    const rows = await page.locator('.data-table-body-row').count();
    const newBtns = await page.locator('button', { hasText: '新規登録' }).count();
    const editBtns = await page.locator('button', { hasText: '編集' }).count();
    console.log(`[ET-04] sales01 一覧行数: ${rows}, 新規登録ボタン: ${newBtns}個, 編集ボタン: ${editBtns}個`);
  });
});

// ─── ET-07: バリデーション ──────────────────────────────────────
test.describe('ET-07: バリデーション探索', () => {

  test('顧客名を空のまま保存したときのエラーメッセージ確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const newBtn = page.locator('button', { hasText: '新規登録' }).first();
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(400);
      const saveBtn = page.locator('button[type="submit"], button', { hasText: '登録' }).last();
      await saveBtn.click();
      await page.waitForTimeout(400);
      const errors = await page.locator('[class*="error"], .field-error, .error-message').allTextContents();
      console.log(`[ET-07] 必須エラーメッセージ: ${JSON.stringify(errors)}`);
      console.log(`[ET-07] エラー件数: ${errors.length}`);
    }
  });

  test('既存コード(CUS-001)を入力して保存したとき重複エラーが出るか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const newBtn = page.locator('button', { hasText: '新規登録' }).first();
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(400);

      // コードを既存値に上書き
      const allInputs = await page.locator('input[type="text"], input:not([type])').all();
      for (const inp of allInputs) {
        const val = await inp.inputValue().catch(() => '');
        if (val.startsWith('CUS-')) {
          await inp.fill('CUS-001'); // 重複コード
          break;
        }
      }
      // 顧客名を入れる
      const nameInputs = await page.locator('input').all();
      for (const inp of nameInputs) {
        const nm = await inp.getAttribute('name').catch(() => '');
        const ph = await inp.getAttribute('placeholder').catch(() => '');
        if (nm.includes('name') || ph.includes('名')) {
          await inp.fill('重複テスト株式会社');
          break;
        }
      }

      const saveBtn = page.locator('button[type="submit"], button', { hasText: '登録' }).last();
      await saveBtn.click();
      await page.waitForTimeout(400);

      const errors = await page.locator('[class*="error"], .field-error').allTextContents();
      const hasDupError = errors.some(t => t.includes('使用') || t.includes('重複') || t.includes('既に'));
      console.log(`[ET-07] 重複コードエラー: ${JSON.stringify(errors)}`);
      console.log(`[ET-07] 重複バリデーション機能: ${hasDupError}`);
    }
  });

  test('空IDでログインしたときのエラー確認', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', '');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(400);
    const errVisible = await page.locator('[class*="error"], .login-error').first().isVisible().catch(() => false);
    const sidebarVisible = await page.locator('.sidebar').isVisible().catch(() => false);
    console.log(`[ET-07] 空IDログイン → エラー表示: ${errVisible}, ログイン成功: ${sidebarVisible}`);
  });

  test('空パスワードでログインしたときのエラー確認', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.fill('#password', '');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(400);
    const errVisible = await page.locator('[class*="error"], .login-error').first().isVisible().catch(() => false);
    const sidebarVisible = await page.locator('.sidebar').isVisible().catch(() => false);
    console.log(`[ET-07] 空パスワードログイン → エラー表示: ${errVisible}, ログイン成功: ${sidebarVisible}`);
  });

  test('CSV出力ボタンが各一覧に存在するか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    const screens = [
      { menu: 'マスタ管理', label: 'マスタ' },
      { menu: '見積', label: '見積' },
      { menu: '受注', label: '受注' },
      { menu: '発注', label: '発注' },
    ];
    for (const s of screens) {
      await navigateTo(page, s.menu);
      await page.waitForTimeout(300);
      const csvBtn = page.locator('button', { hasText: 'CSV' }).or(page.locator('button', { hasText: 'CSV 出力' })).first();
      const hasCSV = await csvBtn.isVisible().catch(() => false);
      console.log(`[ET-07] ${s.label}一覧のCSV出力ボタン: ${hasCSV}`);
    }
  });

  test('請求・入金・支払・承認・レポート画面がプレースホルダーか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    const placeholderScreens = [
      { menu: '入金登録',       label: 'S-09入金' },
      { menu: '支払依頼',       label: 'S-10支払' },
      { menu: '承認一覧',       label: 'S-12承認' },
      { menu: 'レポート',       label: 'S-13レポート' },
      { menu: '通知一覧',       label: 'S-14通知' },
    ];
    for (const s of placeholderScreens) {
      await navigateTo(page, s.menu);
      await page.waitForTimeout(300);
      const content = await page.locator('main').innerText().catch(() => '');
      const isPlaceholder = content.includes('実装予定') || content.includes('coming soon') || content.includes('工事中') || content.includes('準備中');
      const hasRealContent = await page.locator('.data-table, form, table').count() > 0;
      console.log(`[ET-07] ${s.label}: プレースホルダー=${isPlaceholder}, 実コンテンツ=${hasRealContent}, 先頭100文字="${content.substring(0, 100)}"`);
    }
  });
});
