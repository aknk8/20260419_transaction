import { describe, it, expect } from 'vitest';
import { generatePurchaseOrderCode, createPurchaseOrderFromOrder, createPurchaseOrder, calcTotalsFromDetails, findPurchaseOrderByCode, updatePurchaseOrderStatus, buildPurchaseOrderPrintHtml, submitPurchaseOrderApproval } from './purchaseOrder.js';

describe('generatePurchaseOrderCode', () => {
  it('should return POD-00001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];

    // Act
    const result = generatePurchaseOrderCode(existingCodes);

    // Assert
    expect(result).toBe('POD-00001');
  });

  it('should return POD-00006 when codes POD-00001 to POD-00005 exist', () => {
    // Arrange
    const existingCodes = ['POD-00001', 'POD-00002', 'POD-00003', 'POD-00004', 'POD-00005'];

    // Act
    const result = generatePurchaseOrderCode(existingCodes);

    // Assert
    expect(result).toBe('POD-00006');
  });

  it('should return POD-00010 when max code is POD-00009', () => {
    // Arrange
    const existingCodes = ['POD-00009', 'POD-00003'];

    // Act
    const result = generatePurchaseOrderCode(existingCodes);

    // Assert
    expect(result).toBe('POD-00010');
  });
});

describe('createPurchaseOrderFromOrder', () => {
  const order = {
    code: 'ORD-00001',
    title: '新規保守案件 初回見積',
    projectCode: 'PJ-00001',
    subtotal: 600000,
    taxAmount: 60000,
    total: 660000,
    notes: '別途交通費実費',
    details: [
      { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 40000, amount: 528000 }
    ]
  };

  it('should set code from parameter', () => {
    // Arrange & Act
    const result = createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(result.code).toBe('POD-00004');
  });

  it('should link orderCode to sales order code', () => {
    // Arrange & Act
    const result = createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(result.orderCode).toBe('ORD-00001');
  });

  it('should set supplierId from parameter', () => {
    // Arrange & Act
    const result = createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(result.supplierId).toBe('SUP-001');
  });

  it('should copy title from order', () => {
    // Arrange & Act
    const result = createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(result.title).toBe('新規保守案件 初回見積');
  });

  it('should set orderDate from parameter', () => {
    // Arrange & Act
    const result = createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(result.orderDate).toBe('2026-05-10');
  });

  it('should set status to 下書き', () => {
    // Arrange & Act
    const result = createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(result.status).toBe('下書き');
  });

  it('should copy detail lines from order', () => {
    // Arrange & Act
    const result = createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(result.details).toHaveLength(1);
    expect(result.details[0].productName).toBe('サーバー保守サービス');
  });

  it('should not mutate original order', () => {
    // Arrange & Act
    createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(order.code).toBe('ORD-00001');
    expect(order.details).toHaveLength(1);
  });

  it('should initialize empty attachments array', () => {
    // Arrange & Act
    const result = createPurchaseOrderFromOrder(order, 'POD-00004', 'SUP-001', '2026-05-10');

    // Assert
    expect(result.attachments).toEqual([]);
  });
});

describe('createPurchaseOrder', () => {
  it('should set code from parameter', () => {
    // Arrange & Act
    const result = createPurchaseOrder('POD-00004', 'SUP-001', 'スタンドアロン発注', '2026-05-10');

    // Assert
    expect(result.code).toBe('POD-00004');
  });

  it('should set orderCode to empty string', () => {
    // Arrange & Act
    const result = createPurchaseOrder('POD-00004', 'SUP-001', 'スタンドアロン発注', '2026-05-10');

    // Assert
    expect(result.orderCode).toBe('');
  });

  it('should set supplierId from parameter', () => {
    // Arrange & Act
    const result = createPurchaseOrder('POD-00004', 'SUP-001', 'スタンドアロン発注', '2026-05-10');

    // Assert
    expect(result.supplierId).toBe('SUP-001');
  });

  it('should set title from parameter', () => {
    // Arrange & Act
    const result = createPurchaseOrder('POD-00004', 'SUP-001', 'スタンドアロン発注', '2026-05-10');

    // Assert
    expect(result.title).toBe('スタンドアロン発注');
  });

  it('should set status to 下書き', () => {
    // Arrange & Act
    const result = createPurchaseOrder('POD-00004', 'SUP-001', 'スタンドアロン発注', '2026-05-10');

    // Assert
    expect(result.status).toBe('下書き');
  });

  it('should initialize empty attachments array', () => {
    // Arrange & Act
    const result = createPurchaseOrder('POD-00004', 'SUP-001', 'スタンドアロン発注', '2026-05-10');

    // Assert
    expect(result.attachments).toEqual([]);
  });
});

describe('findPurchaseOrderByCode', () => {
  const purchaseOrders = [
    { code: 'POD-00001', title: '保守発注', status: '発注済み' },
    { code: 'POD-00002', title: 'セキュリティ発注', status: '納品済み' }
  ];

  it('should return purchase order when code matches', () => {
    // Arrange & Act
    const result = findPurchaseOrderByCode(purchaseOrders, 'POD-00001');

    // Assert
    expect(result.title).toBe('保守発注');
  });

  it('should return undefined when code does not match', () => {
    // Arrange & Act
    const result = findPurchaseOrderByCode(purchaseOrders, 'POD-99999');

    // Assert
    expect(result).toBeUndefined();
  });
});

describe('updatePurchaseOrderStatus', () => {
  const purchaseOrder = { code: 'POD-00001', title: '保守発注', status: '発注済み' };

  it('should return new object with updated status', () => {
    // Arrange & Act
    const result = updatePurchaseOrderStatus(purchaseOrder, '納品済み');

    // Assert
    expect(result.status).toBe('納品済み');
  });

  it('should not mutate original purchase order', () => {
    // Arrange & Act
    updatePurchaseOrderStatus(purchaseOrder, '納品済み');

    // Assert
    expect(purchaseOrder.status).toBe('発注済み');
  });

  it('should preserve other fields when updating status', () => {
    // Arrange & Act
    const result = updatePurchaseOrderStatus(purchaseOrder, 'キャンセル');

    // Assert
    expect(result.code).toBe('POD-00001');
    expect(result.title).toBe('保守発注');
  });
});

describe('calcTotalsFromDetails', () => {
  const details = [
    { lineNo: 1, quantity: 2, unitPrice: 100000, discount: 0, taxRate: 0.10 },
    { lineNo: 2, quantity: 1, unitPrice: 50000,  discount: 0, taxRate: 0.10 }
  ];

  it('should calculate subtotal as sum of quantity times unitPrice', () => {
    // Arrange & Act
    const result = calcTotalsFromDetails(details);

    // Assert
    expect(result.subtotal).toBe(250000);
  });

  it('should calculate taxAmount from each line subtotal and taxRate', () => {
    // Arrange & Act
    const result = calcTotalsFromDetails(details);

    // Assert
    expect(result.taxAmount).toBe(25000);
  });

  it('should calculate total as subtotal plus taxAmount', () => {
    // Arrange & Act
    const result = calcTotalsFromDetails(details);

    // Assert
    expect(result.total).toBe(275000);
  });

  it('should return zeros for empty details', () => {
    // Arrange & Act
    const result = calcTotalsFromDetails([]);

    // Assert
    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should apply discount when calculating line subtotal', () => {
    // Arrange
    const discountedDetails = [
      { lineNo: 1, quantity: 1, unitPrice: 100000, discount: 0.1, taxRate: 0.10 }
    ];

    // Act
    const result = calcTotalsFromDetails(discountedDetails);

    // Assert
    expect(result.subtotal).toBe(90000);
    expect(result.taxAmount).toBe(9000);
    expect(result.total).toBe(99000);
  });
});

describe('buildPurchaseOrderPrintHtml', () => {
  const purchaseOrder = {
    code: 'POD-00001',
    title: 'サーバー保守サービス 発注',
    orderDate: '2026-05-10',
    deliveryDate: '2026-12-31',
    subtotal: 480000,
    taxAmount: 48000,
    total: 528000,
    notes: '別途交通費実費',
    details: [
      { lineNo: 1, productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 40000, taxRate: 0.10, amount: 528000 }
    ]
  };
  const supplier = { code: 'SUP-001', name: '株式会社日本テクノロジー' };

  it('should include purchase order code in output', () => {
    // Arrange & Act
    const result = buildPurchaseOrderPrintHtml(purchaseOrder, supplier);

    // Assert
    expect(result).toContain('POD-00001');
  });

  it('should include supplier name in output', () => {
    // Arrange & Act
    const result = buildPurchaseOrderPrintHtml(purchaseOrder, supplier);

    // Assert
    expect(result).toContain('株式会社日本テクノロジー');
  });

  it('should include title in output', () => {
    // Arrange & Act
    const result = buildPurchaseOrderPrintHtml(purchaseOrder, supplier);

    // Assert
    expect(result).toContain('サーバー保守サービス 発注');
  });

  it('should include order date in output', () => {
    // Arrange & Act
    const result = buildPurchaseOrderPrintHtml(purchaseOrder, supplier);

    // Assert
    expect(result).toContain('2026-05-10');
  });

  it('should include total amount in output', () => {
    // Arrange & Act
    const result = buildPurchaseOrderPrintHtml(purchaseOrder, supplier);

    // Assert
    expect(result).toContain('528');
  });

  it('should include detail line product name in output', () => {
    // Arrange & Act
    const result = buildPurchaseOrderPrintHtml(purchaseOrder, supplier);

    // Assert
    expect(result).toContain('サーバー保守サービス');
  });

  it('should include notes in output', () => {
    // Arrange & Act
    const result = buildPurchaseOrderPrintHtml(purchaseOrder, supplier);

    // Assert
    expect(result).toContain('別途交通費実費');
  });

  it('should escape html special characters in supplier name', () => {
    // Arrange
    const xssSupplier = { code: 'SUP-X', name: '<script>alert(1)</script>' };

    // Act
    const result = buildPurchaseOrderPrintHtml(purchaseOrder, xssSupplier);

    // Assert
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });
});

describe('submitPurchaseOrderApproval', () => {
  const purchaseOrder = { code: 'POD-00001', title: '保守発注', status: '下書き' };

  it('should return new object with status 承認依頼中', () => {
    // Arrange & Act
    const result = submitPurchaseOrderApproval(purchaseOrder);

    // Assert
    expect(result.status).toBe('承認依頼中');
  });

  it('should not mutate original purchase order', () => {
    // Arrange & Act
    submitPurchaseOrderApproval(purchaseOrder);

    // Assert
    expect(purchaseOrder.status).toBe('下書き');
  });

  it('should preserve other fields when submitting approval', () => {
    // Arrange & Act
    const result = submitPurchaseOrderApproval(purchaseOrder);

    // Assert
    expect(result.code).toBe('POD-00001');
    expect(result.title).toBe('保守発注');
  });
});

