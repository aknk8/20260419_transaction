import { describe, it, expect } from 'vitest';
import { generateOrderCode, createOrderFromQuotation, addAttachment, removeAttachment, findOrderByCode, updateOrderStatus, markAsBillingTarget, applyPayment, validateOrderApprovalSubmit, submitOrderApproval, approveOrder, rejectOrder, returnOrderToDraft, completeContractProcedure } from './order.js';

describe('generateOrderCode', () => {
  it('should return ORD-00001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];

    // Act
    const result = generateOrderCode(existingCodes);

    // Assert
    expect(result).toBe('ORD-00001');
  });

  it('should return ORD-00006 when codes ORD-00001 to ORD-00005 exist', () => {
    // Arrange
    const existingCodes = ['ORD-00001', 'ORD-00002', 'ORD-00003', 'ORD-00004', 'ORD-00005'];

    // Act
    const result = generateOrderCode(existingCodes);

    // Assert
    expect(result).toBe('ORD-00006');
  });

  it('should return ORD-00010 when max code is ORD-00009', () => {
    // Arrange
    const existingCodes = ['ORD-00009', 'ORD-00003'];

    // Act
    const result = generateOrderCode(existingCodes);

    // Assert
    expect(result).toBe('ORD-00010');
  });
});

describe('createOrderFromQuotation', () => {
  const quotation = {
    code: 'QUO-00001',
    projectCode: 'PJ-00001',
    customerId: 'CUS-001',
    title: '新規保守案件 初回見積',
    issueDate: '2026-01-10',
    subtotal: 600000,
    taxAmount: 60000,
    total: 660000,
    details: [
      { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 660000 }
    ],
    notes: '別途交通費実費'
  };

  it('should create order with code and quotation reference', () => {
    // Arrange & Act
    const result = createOrderFromQuotation(quotation, 'ORD-00001', '2026-01-20');

    // Assert
    expect(result.code).toBe('ORD-00001');
    expect(result.quotationCode).toBe('QUO-00001');
  });

  it('should copy project, customer, title from quotation', () => {
    // Arrange & Act
    const result = createOrderFromQuotation(quotation, 'ORD-00001', '2026-01-20');

    // Assert
    expect(result.projectCode).toBe('PJ-00001');
    expect(result.customerId).toBe('CUS-001');
    expect(result.title).toBe('新規保守案件 初回見積');
  });

  it('should set order date from parameter', () => {
    // Arrange & Act
    const result = createOrderFromQuotation(quotation, 'ORD-00001', '2026-01-20');

    // Assert
    expect(result.orderDate).toBe('2026-01-20');
  });

  it('should copy subtotal, taxAmount, total from quotation', () => {
    // Arrange & Act
    const result = createOrderFromQuotation(quotation, 'ORD-00001', '2026-01-20');

    // Assert
    expect(result.subtotal).toBe(600000);
    expect(result.taxAmount).toBe(60000);
    expect(result.total).toBe(660000);
  });

  it('should set status to 受注済み by default', () => {
    // Arrange & Act
    const result = createOrderFromQuotation(quotation, 'ORD-00001', '2026-01-20');

    // Assert
    expect(result.status).toBe('受注済み');
  });

  it('should copy detail lines from quotation', () => {
    // Arrange & Act
    const result = createOrderFromQuotation(quotation, 'ORD-00001', '2026-01-20');

    // Assert
    expect(result.details).toHaveLength(1);
    expect(result.details[0].productName).toBe('サーバー保守サービス');
  });

  it('should not mutate original quotation', () => {
    // Arrange & Act
    createOrderFromQuotation(quotation, 'ORD-00001', '2026-01-20');

    // Assert
    expect(quotation.code).toBe('QUO-00001');
    expect(quotation.details).toHaveLength(1);
  });
});

describe('addAttachment', () => {
  it('should add attachment to order with empty attachments', () => {
    // Arrange
    const order = { code: 'ORD-00001', attachments: [] };
    const attachment = { name: '契約書.pdf', size: 102400, type: 'application/pdf', uploadedAt: '2026-05-10' };

    // Act
    const result = addAttachment(order, attachment);

    // Assert
    expect(result.attachments).toHaveLength(1);
    expect(result.attachments[0].name).toBe('契約書.pdf');
  });

  it('should append attachment to existing attachments', () => {
    // Arrange
    const order = {
      code: 'ORD-00001',
      attachments: [{ name: '注文書.pdf', size: 51200, type: 'application/pdf', uploadedAt: '2026-05-10' }]
    };
    const attachment = { name: '契約書.pdf', size: 102400, type: 'application/pdf', uploadedAt: '2026-05-10' };

    // Act
    const result = addAttachment(order, attachment);

    // Assert
    expect(result.attachments).toHaveLength(2);
    expect(result.attachments[1].name).toBe('契約書.pdf');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', attachments: [] };
    const attachment = { name: '契約書.pdf', size: 102400, type: 'application/pdf', uploadedAt: '2026-05-10' };

    // Act
    addAttachment(order, attachment);

    // Assert
    expect(order.attachments).toHaveLength(0);
  });
});

describe('removeAttachment', () => {
  it('should remove attachment at given index', () => {
    // Arrange
    const order = {
      code: 'ORD-00001',
      attachments: [
        { name: '注文書.pdf', size: 51200, type: 'application/pdf', uploadedAt: '2026-05-10' },
        { name: '契約書.pdf', size: 102400, type: 'application/pdf', uploadedAt: '2026-05-10' }
      ]
    };

    // Act
    const result = removeAttachment(order, 0);

    // Assert
    expect(result.attachments).toHaveLength(1);
    expect(result.attachments[0].name).toBe('契約書.pdf');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = {
      code: 'ORD-00001',
      attachments: [{ name: '注文書.pdf', size: 51200, type: 'application/pdf', uploadedAt: '2026-05-10' }]
    };

    // Act
    removeAttachment(order, 0);

    // Assert
    expect(order.attachments).toHaveLength(1);
  });
});

describe('findOrderByCode', () => {
  const orders = [
    { code: 'ORD-00001', title: '保守案件A' },
    { code: 'ORD-00002', title: '保守案件B' }
  ];

  it('should return order when code matches', () => {
    // Arrange & Act
    const result = findOrderByCode(orders, 'ORD-00001');

    // Assert
    expect(result).not.toBeUndefined();
    expect(result.title).toBe('保守案件A');
  });

  it('should return undefined when code does not match', () => {
    // Arrange & Act
    const result = findOrderByCode(orders, 'ORD-99999');

    // Assert
    expect(result).toBeUndefined();
  });
});

describe('updateOrderStatus', () => {
  it('should update status to 完了', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '受注済み' };

    // Act
    const result = updateOrderStatus(order, '完了');

    // Assert
    expect(result.status).toBe('完了');
  });

  it('should update status to キャンセル', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '受注済み' };

    // Act
    const result = updateOrderStatus(order, 'キャンセル');

    // Assert
    expect(result.status).toBe('キャンセル');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '受注済み' };

    // Act
    updateOrderStatus(order, '完了');

    // Assert
    expect(order.status).toBe('受注済み');
  });
});

describe('markAsBillingTarget', () => {
  it('should set billingTarget to true', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '完了', billingTarget: false };

    // Act
    const result = markAsBillingTarget(order);

    // Assert
    expect(result.billingTarget).toBe(true);
  });

  it('should not change status', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '完了', billingTarget: false };

    // Act
    const result = markAsBillingTarget(order);

    // Assert
    expect(result.status).toBe('完了');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '完了', billingTarget: false };

    // Act
    markAsBillingTarget(order);

    // Assert
    expect(order.billingTarget).toBe(false);
  });
});

describe('applyPayment', () => {
  it('should add payment amount to paidAmount', () => {
    // Arrange
    const order = { code: 'ORD-00001', total: 660000, paidAmount: 0, status: '受注済み' };

    // Act
    const result = applyPayment(order, 330000);

    // Assert
    expect(result.paidAmount).toBe(330000);
  });

  it('should keep status 受注済み when paidAmount is less than total', () => {
    // Arrange
    const order = { code: 'ORD-00001', total: 660000, paidAmount: 0, status: '受注済み' };

    // Act
    const result = applyPayment(order, 330000);

    // Assert
    expect(result.status).toBe('受注済み');
  });

  it('should set status to 完了 when paidAmount reaches total', () => {
    // Arrange
    const order = { code: 'ORD-00001', total: 660000, paidAmount: 330000, status: '受注済み' };

    // Act
    const result = applyPayment(order, 330000);

    // Assert
    expect(result.status).toBe('完了');
    expect(result.paidAmount).toBe(660000);
  });

  it('should set status to 完了 when paidAmount exceeds total', () => {
    // Arrange
    const order = { code: 'ORD-00001', total: 660000, paidAmount: 0, status: '受注済み' };

    // Act
    const result = applyPayment(order, 700000);

    // Assert
    expect(result.status).toBe('完了');
  });

  it('should accumulate paidAmount from existing value', () => {
    // Arrange
    const order = { code: 'ORD-00001', total: 660000, paidAmount: 200000, status: '受注済み' };

    // Act
    const result = applyPayment(order, 200000);

    // Assert
    expect(result.paidAmount).toBe(400000);
    expect(result.status).toBe('受注済み');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', total: 660000, paidAmount: 0, status: '受注済み' };

    // Act
    applyPayment(order, 330000);

    // Assert
    expect(order.paidAmount).toBe(0);
    expect(order.status).toBe('受注済み');
  });
});

describe('validateOrderApprovalSubmit', () => {
  it('should return null when order has attachments and quotation total matches', () => {
    // Arrange
    const order = { total: 500000, attachments: [{ name: '契約書.pdf' }], quotationCode: 'QUO-00001' };
    const quotation = { code: 'QUO-00001', total: 500000 };

    // Act
    const result = validateOrderApprovalSubmit(order, quotation);

    // Assert
    expect(result).toBeNull();
  });

  it('should return errors when attachments are empty', () => {
    // Arrange
    const order = { total: 500000, attachments: [], quotationCode: 'QUO-00001' };
    const quotation = { code: 'QUO-00001', total: 500000 };

    // Act
    const result = validateOrderApprovalSubmit(order, quotation);

    // Assert
    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return errors when attachments is null', () => {
    // Arrange
    const order = { total: 500000, attachments: null, quotationCode: 'QUO-00001' };
    const quotation = { code: 'QUO-00001', total: 500000 };

    // Act
    const result = validateOrderApprovalSubmit(order, quotation);

    // Assert
    expect(result).not.toBeNull();
  });

  it('should return errors when linked quotation is null', () => {
    // Arrange
    const order = { total: 500000, attachments: [{ name: '注文書.pdf' }], quotationCode: 'QUO-00001' };

    // Act
    const result = validateOrderApprovalSubmit(order, null);

    // Assert
    expect(result).not.toBeNull();
  });

  it('should return errors when quotation total does not match order total', () => {
    // Arrange
    const order = { total: 600000, attachments: [{ name: '注文書.pdf' }], quotationCode: 'QUO-00001' };
    const quotation = { code: 'QUO-00001', total: 500000 };

    // Act
    const result = validateOrderApprovalSubmit(order, quotation);

    // Assert
    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('submitOrderApproval', () => {
  it('should return order with status 承認依頼中', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '受注済み' };

    // Act
    const result = submitOrderApproval(order);

    // Assert
    expect(result.status).toBe('承認依頼中');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '受注済み' };

    // Act
    submitOrderApproval(order);

    // Assert
    expect(order.status).toBe('受注済み');
  });
});

describe('approveOrder', () => {
  it('should return order with status 承認済み', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '承認依頼中' };

    // Act
    const result = approveOrder(order, '');

    // Assert
    expect(result.status).toBe('承認済み');
  });

  it('should store approvalComment when comment provided', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '承認依頼中' };

    // Act
    const result = approveOrder(order, '問題なし');

    // Assert
    expect(result.approvalComment).toBe('問題なし');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '承認依頼中' };

    // Act
    approveOrder(order, '');

    // Assert
    expect(order.status).toBe('承認依頼中');
  });
});

describe('rejectOrder', () => {
  it('should return order with status 却下', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '承認依頼中' };

    // Act
    const result = rejectOrder(order, '添付書類不備');

    // Assert
    expect(result.status).toBe('却下');
  });

  it('should store rejectReason', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '承認依頼中' };

    // Act
    const result = rejectOrder(order, '添付書類不備');

    // Assert
    expect(result.rejectReason).toBe('添付書類不備');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '承認依頼中' };

    // Act
    rejectOrder(order, '添付書類不備');

    // Assert
    expect(order.status).toBe('承認依頼中');
  });
});

describe('returnOrderToDraft', () => {
  it('should return order with status 下書き when currently 却下', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '却下', rejectReason: '添付書類不備' };

    // Act
    const result = returnOrderToDraft(order);

    // Assert
    expect(result.status).toBe('下書き');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '却下' };

    // Act
    returnOrderToDraft(order);

    // Assert
    expect(order.status).toBe('却下');
  });
});

describe('completeContractProcedure', () => {
  it('should return order with status 契約手続き済 when currently 承認済み', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '承認済み' };

    // Act
    const result = completeContractProcedure(order);

    // Assert
    expect(result.status).toBe('契約手続き済');
  });

  it('should not mutate original order', () => {
    // Arrange
    const order = { code: 'ORD-00001', status: '承認済み' };

    // Act
    completeContractProcedure(order);

    // Assert
    expect(order.status).toBe('承認済み');
  });
});
