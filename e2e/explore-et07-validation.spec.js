// ET-07: エラー入力とバリデーションの振る舞い
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

async function openNewForm(page) {
  const newBtn = page.locator('button', { hasText: '新規登録' }).or(page.locator('button', { hasText: '新規' })).or(page.locator('button', { hasText: '登録' })).first();
  if (await newBtn.isVisible().catch(() => false)) {
    await newBtn.click();
    await page.waitForTimeout(400);
    return true;
  }
  return false;
}

test.describe('ET-07: バリデーション探索', () => {

  test('顧客名を空で送信したときエラーメッセージが表示されるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const opened = await openNewForm(page);
    if (opened) {
      // 顧客名を空のまま保存
      const saveBtn = page.locator('button[type="submit"]').or(page.locator('button', { hasText: '保存' })).last();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(400);
        // エラーメッセージを探す
        const errorMsgs = await page.locator('[class*="error"], .error-message, .field-error').allTextContents();
        console.log(`[ET-07] 必須エラーメッセージ: ${JSON.stringify(errorMsgs)}`);
        const hasError = errorMsgs.some(t => t.includes('必須') || t.includes('入力'));
        console.log(`[ET-07] 必須バリデーションエラー表示: ${hasError}`);
      }
    } else {
      console.log('[ET-07] 新規フォームが開けなかった');
    }
  });

  test('重複する顧客コードで登録したときエラーが出るか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const opened = await openNewForm(page);
    if (opened) {
      // コードを既存の CUS-001 に書き換え
      const codeInput = page.locator('input[name="code"], input[id="code"]').first();
      if (await codeInput.isVisible().catch(() => false)) {
        await codeInput.fill('CUS-001');
      }
      const nameInput = page.locator('input[name="name"], input[id="name"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('重複テスト会社');
      }

      const saveBtn = page.locator('button[type="submit"]').or(page.locator('button', { hasText: '保存' })).last();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(400);
        const errorMsgs = await page.locator('[class*="error"], .error-message').allTextContents();
        console.log(`[ET-07] 重複コードのエラーメッセージ: ${JSON.stringify(errorMsgs)}`);
        const hasDupError = errorMsgs.some(t => t.includes('使用') || t.includes('重複') || t.includes('既に'));
        console.log(`[ET-07] 重複バリデーション表示: ${hasDupError}`);
      }
    }
  });

  test('複数フィールドが空のとき全フィールドのエラーが同時表示されるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const opened = await openNewForm(page);
    if (opened) {
      // コードも名前も空のまま保存
      const codeInput = page.locator('input[name="code"], input[id="code"]').first();
      if (await codeInput.isVisible().catch(() => false)) {
        await codeInput.fill('');
      }
      const saveBtn = page.locator('button[type="submit"]').or(page.locator('button', { hasText: '保存' })).last();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(400);
        const errorCount = await page.locator('[class*="error"], .error-message, .field-error').count();
        console.log(`[ET-07] 複数エラー時の表示件数: ${errorCount}`);
      }
    }
  });

  test('ログインフォームで空IDを送信したときのエラー確認', async ({ page }) => {
    await page.goto('/');
    await page.fill('#password', 'dummy');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(400);
    const errorVisible = await page.locator('[class*="error"], .login-error').first().isVisible().catch(() => false);
    const sidebarVisible = await page.locator('.sidebar').isVisible().catch(() => false);
    console.log(`[ET-07] 空IDログイン: エラー表示=${errorVisible}, サイドバー（ログイン成功）=${sidebarVisible}`);
  });

  test('ログインフォームで空パスワードを送信したときのエラー確認', async ({ page }) => {
    await page.goto('/');
    await page.fill('#user-id', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(400);
    const errorVisible = await page.locator('[class*="error"], .login-error').first().isVisible().catch(() => false);
    const sidebarVisible = await page.locator('.sidebar').isVisible().catch(() => false);
    console.log(`[ET-07] 空パスワードログイン: エラー表示=${errorVisible}, サイドバー（ログイン成功）=${sidebarVisible}`);
  });

  test('見積明細の数量に0を入力したとき金額がどうなるか確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, '見積');
    await page.waitForTimeout(300);

    // QUO-00001 を開く
    const row = page.locator('tr', { hasText: 'QUO-00001' });
    if (await row.isVisible().catch(() => false)) {
      await row.click().catch(async () => row.locator('button').first().click());
      await page.waitForTimeout(500);

      // 編集モードへ
      const editBtn = page.locator('button', { hasText: '編集' }).first();
      if (await editBtn.isVisible().catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(400);
        const qtyInput = page.locator('input[name="quantity"], input[type="number"]').first();
        if (await qtyInput.isVisible().catch(() => false)) {
          await qtyInput.fill('0');
          await qtyInput.press('Tab');
          await page.waitForTimeout(300);
          const content = await page.locator('main').innerText().catch(() => '');
          const hasZeroAmount = content.includes('0円') || content.includes('¥0');
          console.log(`[ET-07] 数量0で合計が0になるか: ${hasZeroAmount}`);
          const hasError = await page.locator('[class*="error"]').count();
          console.log(`[ET-07] 数量0のバリデーションエラー: ${hasError}件`);
        }
      } else {
        console.log('[ET-07] 見積の編集ボタンが見当たらない（詳細画面が別形式の可能性）');
      }
    }
  });

  test('エラー後に正しい値を入力すると保存できるかを確認', async ({ page }) => {
    await login(page, 'admin', 'admin123');
    await navigateTo(page, 'マスタ管理');
    await page.waitForTimeout(300);

    const opened = await openNewForm(page);
    if (opened) {
      // まず空で送信してエラーを出す
      const saveBtn = page.locator('button[type="submit"]').or(page.locator('button', { hasText: '保存' })).last();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(300);

        // 正しい値を入力して再送信
        const nameInput = page.locator('input[name="name"], input[id="name"]').first();
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill('バリデーション修正テスト株式会社');
        }
        await saveBtn.click();
        await page.waitForTimeout(500);
        const content = await page.locator('main').innerText().catch(() => '');
        console.log(`[ET-07] エラー後の正常登録: "バリデーション修正テスト"が表示=${content.includes('バリデーション修正テスト')}`);
      }
    }
  });
});
