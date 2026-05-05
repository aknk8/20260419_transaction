import { describe, it, expect } from 'vitest';
import { generateInvoiceCode, createInvoice, findBillableOrders, createInvoiceFromOrder, getDefaultDueDate, confirmInvoice, markInvoiceAsSent, cancelInvoice, buildInvoicePrintHtml } from './invoice.js';

describe('generateInvoiceCode', () => {
  it('should return INV-00001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];

    // Act
    const result = generateInvoiceCode(existingCodes);

    // Assert
    expect(result).toBe('INV-00001');
  });

  it('should return INV-00006 when codes INV-00001 to INV-00005 exist', () => {
    // Arrange
    const existingCodes = ['INV-00001', 'INV-00002', 'INV-00003', 'INV-00004', 'INV-00005'];

    // Act
    const result = generateInvoiceCode(existingCodes);

    // Assert
    expect(result).toBe('INV-00006');
  });

  it('should return INV-00010 when max code is INV-00009', () => {
    // Arrange
    const existingCodes = ['INV-00009', 'INV-00003'];

    // Act
    const result = generateInvoiceCode(existingCodes);

    // Assert
    expect(result).toBe('INV-00010');
  });
});

describe('createInvoice', () => {
  it('should set code from parameter', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.code).toBe('INV-00001');
  });

  it('should set orderCode from parameter', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.orderCode).toBe('ORD-00001');
  });

  it('should set customerId from parameter', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.customerId).toBe('CUS-001');
  });

  it('should set title from parameter', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.title).toBe('サーバー保守サービス 請求');
  });

  it('should set invoiceDate from parameter', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.invoiceDate).toBe('2026-05-31');
  });

  it('should set dueDate from parameter', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.dueDate).toBe('2026-06-30');
  });

  it('should set status to 下書き', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.status).toBe('下書き');
  });

  it('should initialize subtotal taxAmount and total to zero', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should initialize empty details array', () => {
    // Arrange & Act
    const result = createInvoice('INV-00001', 'ORD-00001', 'CUS-001', 'サーバー保守サービス 請求', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.details).toEqual([]);
  });
});

describe('findBillableOrders', () => {
  const orders = [
    { code: 'ORD-00001', title: '案件A', customerId: 'CUS-001', billingTarget: true },
    { code: 'ORD-00002', title: '案件B', customerId: 'CUS-002', billingTarget: false },
    { code: 'ORD-00003', title: '案件C', customerId: 'CUS-001', billingTarget: true }
  ];

  it('should return orders where billingTarget is true', () => {
    // Arrange
    const invoices = [];

    // Act
    const result = findBillableOrders(orders, invoices);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].code).toBe('ORD-00001');
    expect(result[1].code).toBe('ORD-00003');
  });

  it('should exclude orders that already have an invoice', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', orderCode: 'ORD-00001' }
    ];

    // Act
    const result = findBillableOrders(orders, invoices);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('ORD-00003');
  });

  it('should return empty array when no billable orders exist', () => {
    // Arrange
    const noBillingOrders = [
      { code: 'ORD-00001', billingTarget: false }
    ];

    // Act
    const result = findBillableOrders(noBillingOrders, []);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return empty array when all billable orders already have invoices', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', orderCode: 'ORD-00001' },
      { code: 'INV-00002', orderCode: 'ORD-00003' }
    ];

    // Act
    const result = findBillableOrders(orders, invoices);

    // Assert
    expect(result).toHaveLength(0);
  });
});

describe('createInvoiceFromOrder', () => {
  const order = {
    code: 'ORD-00001',
    customerId: 'CUS-001',
    title: '案件A 受注',
    total: 660000,
    subtotal: 600000,
    taxAmount: 60000,
    notes: '別途交通費実費',
    details: [
      { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守', quantity: 12, unit: '月', unitPrice: 50000, taxRate: 0.10, amount: 660000 }
    ]
  };

  it('should set code from parameter', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.code).toBe('INV-00005');
  });

  it('should set orderCode from order', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.orderCode).toBe('ORD-00001');
  });

  it('should set customerId from order', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.customerId).toBe('CUS-001');
  });

  it('should copy title from order', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.title).toBe('案件A 受注');
  });

  it('should set invoiceDate from parameter', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.invoiceDate).toBe('2026-05-31');
  });

  it('should set dueDate from parameter', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.dueDate).toBe('2026-06-30');
  });

  it('should copy totals from order', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.subtotal).toBe(600000);
    expect(result.taxAmount).toBe(60000);
    expect(result.total).toBe(660000);
  });

  it('should copy detail lines from order', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.details).toHaveLength(1);
    expect(result.details[0].productName).toBe('サーバー保守');
  });

  it('should set status to 下書き', () => {
    // Arrange & Act
    const result = createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(result.status).toBe('下書き');
  });

  it('should not mutate original order', () => {
    // Arrange & Act
    createInvoiceFromOrder(order, 'INV-00005', '2026-05-31', '2026-06-30');

    // Assert
    expect(order.code).toBe('ORD-00001');
    expect(order.details).toHaveLength(1);
  });
});

describe('getDefaultDueDate', () => {
  it('should return last day of May when date is 2026-05-04', () => {
    // Arrange & Act
    const result = getDefaultDueDate('2026-05-04');

    // Assert
    expect(result).toBe('2026-05-31');
  });

  it('should return last day of February for non-leap year when date is 2026-02-10', () => {
    // Arrange & Act
    const result = getDefaultDueDate('2026-02-10');

    // Assert
    expect(result).toBe('2026-02-28');
  });

  it('should return last day of February for leap year when date is 2024-02-01', () => {
    // Arrange & Act
    const result = getDefaultDueDate('2024-02-01');

    // Assert
    expect(result).toBe('2024-02-29');
  });

  it('should return last day of December when date is 2026-12-15', () => {
    // Arrange & Act
    const result = getDefaultDueDate('2026-12-15');

    // Assert
    expect(result).toBe('2026-12-31');
  });

  it('should return last day of April when date is 2026-04-30', () => {
    // Arrange & Act
    const result = getDefaultDueDate('2026-04-30');

    // Assert
    expect(result).toBe('2026-04-30');
  });
});

describe('confirmInvoice', () => {
  it('should set status to 確定', () => {
    // Arrange
    const invoice = { code: 'INV-00001', status: '下書き', title: 'テスト' };

    // Act
    const result = confirmInvoice(invoice);

    // Assert
    expect(result.status).toBe('確定');
  });

  it('should preserve other fields', () => {
    // Arrange
    const invoice = { code: 'INV-00001', status: '下書き', title: 'テスト' };

    // Act
    const result = confirmInvoice(invoice);

    // Assert
    expect(result.code).toBe('INV-00001');
    expect(result.title).toBe('テスト');
  });

  it('should not mutate original invoice', () => {
    // Arrange
    const invoice = { code: 'INV-00001', status: '下書き' };

    // Act
    confirmInvoice(invoice);

    // Assert
    expect(invoice.status).toBe('下書き');
  });
});

describe('markInvoiceAsSent', () => {
  it('should set status to 送付済', () => {
    // Arrange
    const invoice = { code: 'INV-00001', status: '確定' };

    // Act
    const result = markInvoiceAsSent(invoice);

    // Assert
    expect(result.status).toBe('送付済');
  });

  it('should not mutate original invoice', () => {
    // Arrange
    const invoice = { code: 'INV-00001', status: '確定' };

    // Act
    markInvoiceAsSent(invoice);

    // Assert
    expect(invoice.status).toBe('確定');
  });
});

describe('cancelInvoice', () => {
  it('should set status to キャンセル', () => {
    // Arrange
    const invoice = { code: 'INV-00001', status: '下書き' };

    // Act
    const result = cancelInvoice(invoice);

    // Assert
    expect(result.status).toBe('キャンセル');
  });

  it('should not mutate original invoice', () => {
    // Arrange
    const invoice = { code: 'INV-00001', status: '下書き' };

    // Act
    cancelInvoice(invoice);

    // Assert
    expect(invoice.status).toBe('下書き');
  });
});

describe('buildInvoicePrintHtml', () => {
  const invoice = {
    code: 'INV-00001',
    orderCode: 'ORD-00001',
    title: 'サーバー保守サービス 2026年1月分',
    invoiceDate: '2026-01-31',
    dueDate: '2026-02-28',
    subtotal: 480000,
    taxAmount: 48000,
    total: 528000,
    notes: '振込手数料はご負担ください。',
    details: [
      { lineNo: 1, productName: 'サーバー保守', quantity: 1, unit: '月', unitPrice: 480000, taxRate: 0.10, amount: 528000 }
    ]
  };
  const customer = { name: '株式会社青葉システム' };
  const company = { name: '株式会社サンプル商事', address: '東京都千代田区1-1', phone: '03-0000-0000' };

  it('should return html string', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(typeof result).toBe('string');
  });

  it('should contain 請求書 title', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).toContain('請 求 書');
  });

  it('should contain invoice code', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).toContain('INV-00001');
  });

  it('should contain customer name', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).toContain('株式会社青葉システム');
  });

  it('should contain invoice date', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).toContain('2026-01-31');
  });

  it('should contain due date', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).toContain('2026-02-28');
  });

  it('should contain total amount', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).toContain('528,000');
  });

  it('should contain product name from details', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).toContain('サーバー保守');
  });

  it('should contain company name when company is provided', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, company);

    // Assert
    expect(result).toContain('株式会社サンプル商事');
  });

  it('should contain company address when company is provided', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, company);

    // Assert
    expect(result).toContain('東京都千代田区1-1');
  });

  it('should not contain company info when company is null', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).not.toContain('株式会社サンプル商事');
  });

  it('should contain notes', () => {
    // Act
    const result = buildInvoicePrintHtml(invoice, null, customer, null);

    // Assert
    expect(result).toContain('振込手数料はご負担ください。');
  });
});
