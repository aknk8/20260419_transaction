import { test, expect } from '@playwright/test';

const ADMIN_ID = process.env.UAT_ADMIN_ID || 'admin';
const ADMIN_PASSWORD = process.env.UAT_ADMIN_PASSWORD || 'admin123';
const STEP_PAUSE = Number(process.env.UAT_STEP_PAUSE || 350);

test.describe.serial('UAT: staging business flow and permission walkthrough', () => {
  test.setTimeout(10 * 60 * 1000);

  const runId = new Date().toISOString().replace(/\D/g, '').slice(4, 14);
  const data = {
    userId: `uat${runId}`,
    userName: `UAT 閲覧担当 ${runId}`,
    customerName: `UAT顧客株式会社 ${runId}`,
    supplierName: `UAT仕入先株式会社 ${runId}`,
    projects: Array.from({ length: 6 }, (_, index) => ({
      name: `UAT案件 ${runId}-${index + 1}`,
      quotationTitle: `UAT見積 ${runId}-${index + 1}`,
      projectCode: '',
      quotationCode: '',
      orderCode: '',
      purchaseOrderCode: '',
      invoiceCode: '',
      paymentCode: '',
    })),
  };

  test('admin creates masters, 6 projects, documents, billing, receipts, payments, and verifies restricted users', async ({ page }, testInfo) => {
    await login(page, ADMIN_ID, ADMIN_PASSWORD);
    await verifyDashboard(page, testInfo, 'initial-dashboard');

    await createUser(page, data.userId, data.userName);
    await createCustomer(page, data.customerName);
    await createSupplier(page, data.supplierName);

    for (const project of data.projects) {
      project.projectCode = await createProject(page, project.name, data.customerName);
      project.quotationCode = await createQuotation(page, project.name, project.quotationTitle);
      await approveDocument(page, '見積', project.quotationCode);
    }

    for (const project of data.projects.slice(0, 3)) {
      project.orderCode = await createOrderFromQuotation(page, project.quotationCode);
      await submitAndApproveOrder(page, project.orderCode);
      await markOrderAsBillable(page, project.orderCode);
    }

    const main = data.projects[0];
    main.purchaseOrderCode = await createPurchaseOrderFromOrder(page, main.orderCode, data.supplierName);
    await submitAndApprovePurchaseOrder(page, main.purchaseOrderCode);
    await markPurchaseOrderIssuedAndDelivered(page, main.purchaseOrderCode);

    main.invoiceCode = await createInvoiceFromBillableOrder(page, main.orderCode);
    await finalizeSendAndReceiveInvoice(page, main.invoiceCode);

    main.paymentCode = await createApproveAndPayPayment(page, main.purchaseOrderCode);

    await verifyDashboard(page, testInfo, 'after-uat-data-dashboard');
    await verifyPermissionBoundaries(page);
  });
});

async function login(page, userId, password) {
  await page.goto('/#/project', { waitUntil: 'domcontentloaded' });
  await page.locator('#user-id').fill(userId);
  await page.locator('#password').fill(password);
  await page.locator('#login-form').getByRole('button', { name: 'ログイン' }).click();
  await expect(page.locator('.sidebar')).toBeVisible();
  await pause(page);
}

async function logout(page) {
  await page.locator('#logout-button').click();
  await expect(page.locator('#login-form')).toBeVisible();
  await pause(page);
}

async function openRoute(page, route) {
  await page.locator(`.sidebar [data-route="${route}"]`).click();
  await expect(page.locator('.panel')).toBeVisible();
  await pause(page);
}

async function pause(page) {
  if (STEP_PAUSE > 0) await page.waitForTimeout(STEP_PAUSE);
}

async function createUser(page, userId, userName) {
  await openRoute(page, 'master');
  await page.locator('[data-master-tab="user"]').click();
  await expect(page.locator('.data-table')).toBeVisible();
  await page.locator('#new-user-btn').click();
  await expect(page.locator('#user-register-form')).toBeVisible();
  await page.locator('#f-user-id').fill(userId);
  await page.locator('#f-password').fill('uatPass123');
  await page.locator('#f-user-name').fill(userName);
  await page.locator('#f-user-type').selectOption('一般ユーザ');
  await page.locator('#f-user-department').selectOption('営業部門');
  await page.locator('#f-position').fill('UAT閲覧担当');
  await page.locator('#user-register-form').getByRole('button', { name: '登録する' }).click();
  await expect(page.locator('.data-table')).toContainText(userName);
  await pause(page);
}

async function createCustomer(page, customerName) {
  await openRoute(page, 'master');
  await page.locator('[data-master-tab="customer"]').click();
  await expect(page.locator('.data-table')).toBeVisible();
  await page.locator('#new-customer-btn').click();
  await expect(page.locator('#customer-register-form')).toBeVisible();
  await page.locator('#f-name').fill(customerName);
  await page.locator('#f-department').selectOption('営業部門');
  await page.locator('#f-contact').fill('UAT 顧客担当');
  await page.locator('#f-closing-day').selectOption('末日');
  await page.locator('#f-payment-site').fill('翌月末');
  await page.locator('#f-billing-to').fill(`${customerName} 経理部`);
  await page.locator('#customer-register-form').getByRole('button', { name: '登録する' }).click();
  await expect(page.locator('.data-table')).toContainText(customerName);
  await pause(page);
}

async function createSupplier(page, supplierName) {
  await openRoute(page, 'master');
  await page.locator('[data-master-tab="supplier"]').click();
  await expect(page.locator('.data-table')).toBeVisible();
  await page.locator('#new-supplier-btn').click();
  await expect(page.locator('#supplier-register-form')).toBeVisible();
  await page.locator('#f-name').fill(supplierName);
  await page.locator('#f-contact').fill('UAT 仕入担当');
  await page.locator('#f-payment-site').fill('翌月末');
  await page.locator('#supplier-register-form').getByRole('button', { name: '登録する' }).click();
  await expect(page.locator('.data-table')).toContainText(supplierName);
  await pause(page);
}

async function createProject(page, projectName, customerName) {
  await openRoute(page, 'project');
  await expect(page.locator('.data-table')).toBeVisible();
  await page.locator('#new-project-btn').click();
  await expect(page.locator('#project-register-form')).toBeVisible();
  const projectCode = await page.locator('#f-code').inputValue();
  await page.locator('#f-name').fill(projectName);
  await page.locator('[data-customer-search-input]').fill(customerName);
  await page.locator('.customer-search-item').filter({ hasText: customerName }).first().click();
  await page.locator('#f-department').selectOption('営業部門');
  await page.locator('#f-description').fill('UAT自動操作で登録した案件');
  await page.locator('#project-register-form').getByRole('button', { name: '登録する' }).click();
  await expect(page.locator('.data-table')).toContainText(projectName);
  await pause(page);
  return projectCode;
}

async function createQuotation(page, projectName, quotationTitle) {
  await openRoute(page, 'quotation');
  await expect(page.locator('.data-table')).toBeVisible();
  await page.locator('#new-quotation-btn').click();
  await expect(page.locator('#quotation-register-form')).toBeVisible();
  const quotationCode = await page.locator('#f-quo-code').inputValue();
  await page.locator('#f-quo-title').fill(quotationTitle);
  await page.locator('[data-project-search-input]').fill(projectName);
  await page.locator('.project-search-item').filter({ hasText: projectName }).first().click();
  await page.locator('#f-quo-issue-date').fill(today());
  await page.locator('#add-detail-line').click();
  await page.locator('.detail-line').first().locator('[data-detail-field="productCode"]').selectOption({ index: 1 });
  await page.getByRole('button', { name: '承認依頼' }).click();
  await expect(page.locator('.data-table')).toContainText(quotationCode);
  await pause(page);
  return quotationCode;
}

async function approveDocument(page, type, code) {
  await openRoute(page, 'approval');
  await expect(page.locator('.data-table')).toBeVisible();
  await page.locator(`[data-action-detail-approval="${type}:${code}"]`).click();
  const buttonIdByType = {
    '見積': '#quotation-approve-btn',
    '受注': '#order-approve-btn',
    '発注': '#pod-approve-btn',
    '請求': '#invoice-approve-btn',
    '支払': '#payment-approve-btn',
  };
  await page.locator(buttonIdByType[type]).click();
  await page.locator('#approval-confirm-approve').click();
  await expect(page.locator('.data-table')).toBeVisible();
  await pause(page);
}

async function createOrderFromQuotation(page, quotationCode) {
  await openRoute(page, 'quotation');
  await page.locator(`[data-action-detail-quotation="${quotationCode}"]`).click();
  await expect(page.locator('.detail-grid')).toBeVisible();
  await page.locator(`[data-action-create-order="${quotationCode}"]`).click();
  await expect(page.locator('#order-register-form')).toBeVisible();
  const orderCode = await page.locator('#f-order-code').inputValue();
  await page.locator('#f-order-date').fill(today());
  await page.locator('#f-order-attachment').setInputFiles({
    name: `${orderCode}-order.txt`,
    mimeType: 'text/plain',
    buffer: Buffer.from('UAT order evidence'),
  });
  await page.getByRole('button', { name: '受注登録' }).click();
  await expect(page.locator('.data-table')).toContainText(orderCode);
  await pause(page);
  return orderCode;
}

async function markOrderAsBillable(page, orderCode) {
  await openRoute(page, 'sales-order');
  await page.locator(`[data-action-detail-order="${orderCode}"]`).click();
  await expect(page.locator('.detail-grid')).toBeVisible();
  const billingButton = page.locator(`[data-action-billing-target="${orderCode}"]`);
  if (await billingButton.isVisible()) {
    await billingButton.click();
    await expect(page.locator('.panel-actions')).toContainText('請求対象');
  }
  await pause(page);
}

async function submitAndApproveOrder(page, orderCode) {
  await openRoute(page, 'sales-order');
  await page.locator(`[data-action-detail-order="${orderCode}"]`).click();
  await expect(page.locator('.detail-grid')).toBeVisible();
  await page.locator('#order-submit-approval-btn').click();
  await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');
  await approveDocument(page, '受注', orderCode);
}

async function createPurchaseOrderFromOrder(page, orderCode, supplierName) {
  await openRoute(page, 'sales-order');
  await page.locator(`[data-action-detail-order="${orderCode}"]`).click();
  await expect(page.locator('.detail-grid')).toBeVisible();
  await page.locator(`[data-action-create-purchase-order="${orderCode}"]`).click();
  await expect(page.locator('#purchase-order-register-form')).toBeVisible();
  const purchaseOrderCode = await page.locator('#f-pod-code').inputValue();
  await selectOptionByText(page.locator('#f-pod-supplier'), supplierName);
  await page.locator('#f-pod-date').fill(today());
  await page.locator('#f-pod-attachment').setInputFiles({
    name: `${purchaseOrderCode}-purchase-order.txt`,
    mimeType: 'text/plain',
    buffer: Buffer.from('UAT purchase order evidence'),
  });
  await page.getByRole('button', { name: '発注登録' }).click();
  await expect(page.locator('.data-table')).toContainText(purchaseOrderCode);
  await pause(page);
  return purchaseOrderCode;
}

async function submitAndApprovePurchaseOrder(page, purchaseOrderCode) {
  await openRoute(page, 'purchase-order');
  await page.locator(`[data-action-detail-purchase-order="${purchaseOrderCode}"]`).click();
  await expect(page.locator('.detail-grid')).toBeVisible();
  await page.locator('#pod-submit-approval-btn').click();
  await expect(page.locator('.status-badge').first()).toContainText('承認依頼中');
  await approveDocument(page, '発注', purchaseOrderCode);
}

async function markPurchaseOrderIssuedAndDelivered(page, purchaseOrderCode) {
  await openRoute(page, 'purchase-order');
  await page.locator(`[data-action-detail-purchase-order="${purchaseOrderCode}"]`).click();
  await expect(page.locator('.detail-grid')).toBeVisible();
  await page.locator('[data-action-pod-status="発注済"]').click();
  await expect(page.locator('.status-badge').first()).toContainText('発注済');
  await page.locator(`[data-action-delivery-register="${purchaseOrderCode}"]`).click();
  await page.locator('#f-dlv-date').fill(today());
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.status-badge').first()).toContainText('納品済');
  await pause(page);
}

async function createInvoiceFromBillableOrder(page, orderCode) {
  await openRoute(page, 'invoice');
  await page.locator('#invoice-extract-btn').click();
  await expect(page.locator('[data-billable-order]')).toBeVisible();
  const row = page.locator(`[data-billable-order="${orderCode}"]`);
  await expect(row).toBeVisible();
  await page.locator(`[data-inv-date-for="${orderCode}"]`).fill(today());
  await page.locator(`[data-inv-due-date-for="${orderCode}"]`).fill(endOfCurrentMonth());
  await page.locator(`[data-action-create-invoice="${orderCode}"]`).click();
  await page.locator('#invoice-back-to-list').click();
  await expect(page.locator('.data-table')).toBeVisible();
  const invoiceCode = await latestCodeFromTable(page, 'INV-');
  await pause(page);
  return invoiceCode;
}

async function finalizeSendAndReceiveInvoice(page, invoiceCode) {
  await openRoute(page, 'invoice');
  await page.locator(`[data-action-detail-invoice="${invoiceCode}"]`).click();
  await expect(page.locator('.panel-label').filter({ hasText: 'S-08 請求詳細' })).toBeVisible();
  const submitApprovalButton = page.locator('#invoice-submit-approval-btn');
  if (await submitApprovalButton.isVisible()) {
    await submitApprovalButton.click();
    await approveDocument(page, '請求', invoiceCode);
    await openRoute(page, 'invoice');
    await page.locator(`[data-action-detail-invoice="${invoiceCode}"]`).click();
  }
  const finalizeButton = page.locator('[data-action-invoice-status="確定"]');
  if (await finalizeButton.isVisible()) await finalizeButton.click();
  await page.locator('[data-action-invoice-status="送付済"]').click();
  await expect(page.locator('.status-badge').first()).toContainText('送付済');
  await page.locator(`[data-action-register-receipt="${invoiceCode}"]`).click();
  await page.locator('#f-rcp-date').fill(today());
  const amount = await page.locator('#f-rcp-remaining').textContent();
  await page.locator('#f-rcp-amount').fill((amount || '').replace(/\D/g, ''));
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.status-badge').first()).toContainText(/入金済|消込済み/);
  await pause(page);
}

async function createApproveAndPayPayment(page, purchaseOrderCode) {
  await openRoute(page, 'payment');
  await page.locator('#payment-create-btn').click();
  await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払対象' })).toBeVisible();
  await page.locator(`[data-action-create-payment="${purchaseOrderCode}"]`).click();
  await expect(page.locator('.panel-label').filter({ hasText: 'S-10 支払依頼登録' })).toBeVisible();
  await page.locator('#f-pmt-date').fill(endOfCurrentMonth());
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.data-table')).toBeVisible();
  const paymentCode = await latestCodeFromTable(page, 'PMT-');
  await page.locator(`[data-action-detail-payment="${paymentCode}"]`).click();
  await page.locator('[data-action-payment-status="承認待ち"]').click();
  await page.locator('#payment-approve-btn').click();
  await page.locator('#approval-confirm-approve').click();
  await openRoute(page, 'payment');
  await page.locator(`[data-action-detail-payment="${paymentCode}"]`).click();
  await page.locator('#payment-register-btn').click();
  await page.locator('#f-pmte-date').fill(today());
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('.status-badge')).toHaveText('支払済');
  await pause(page);
  return paymentCode;
}

async function verifyDashboard(page, testInfo, label) {
  await openRoute(page, 'dashboard');
  await expect(page.locator('.dashboard-grid')).toBeVisible();
  await expect(page.locator('.metrics-row')).toContainText('承認待ち');
  await expect(page.locator('.metrics-row')).toContainText('未請求');
  await expect(page.locator('.metrics-row')).toContainText('未収');
  await expect(page.locator('.metrics-row')).toContainText('未払');
  await page.screenshot({ path: testInfo.outputPath(`${label}.png`), fullPage: true });
  await pause(page);
}

async function verifyPermissionBoundaries(page) {
  await logout(page);
  await login(page, 'finance01', 'finance123');
  await expect(page.locator('.sidebar [data-route="invoice"]')).toBeVisible();
  await expect(page.locator('.sidebar [data-route="payment"]')).toBeVisible();
  await expect(page.locator('.sidebar [data-route="quotation"]')).not.toBeVisible();
  await expect(page.locator('.sidebar [data-route="project"]')).not.toBeVisible();
  await expect(page.locator('.sidebar [data-route="sales-order"]')).not.toBeVisible();
  await expect(page.locator('.sidebar [data-route="purchase-order"]')).not.toBeVisible();
  await pause(page);

  await logout(page);
  await login(page, 'sales01', 'sales123');
  await openRoute(page, 'master');
  await expect(page.locator('[data-master-tab="user"]')).not.toBeVisible();
  await page.locator('[data-master-tab="supplier"]').click();
  await expect(page.locator('#new-supplier-btn')).not.toBeVisible();
  await expect(page.locator('[data-action-edit-supplier]')).toHaveCount(0);
  await pause(page);

  await logout(page);
  await login(page, ADMIN_ID, ADMIN_PASSWORD);
}

async function selectOptionByText(selectLocator, visibleText) {
  const options = await selectLocator.locator('option').evaluateAll((nodes) =>
    nodes.map((node) => ({ value: node.value, text: node.textContent || '' }))
  );
  const option = options.find((item) => item.text.includes(visibleText));
  if (!option) throw new Error(`Option not found: ${visibleText}`);
  await selectLocator.selectOption(option.value);
}

async function latestCodeFromTable(page, prefix) {
  const text = await page.locator('.data-table').innerText();
  const codes = [...text.matchAll(new RegExp(`${prefix}\\d{5}`, 'g'))].map((match) => match[0]);
  if (codes.length === 0) throw new Error(`No ${prefix} code found in table`);
  return codes.sort().at(-1);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function endOfCurrentMonth() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
}
