import { describe, it, expect } from 'vitest';
import { getPendingApprovals, getApprovalDetailRoute, buildApprovalHistoryEntry, addApprovalHistoryEntry } from './approval.js';

// getPendingApprovals の受注テストは既存の引数を orders パラメータとして追加

describe('getPendingApprovals', () => {
  it('should return empty array when all inputs are empty', () => {
    // Arrange
    const quotations = [];
    const purchaseOrders = [];
    const payments = [];

    // Act
    const result = getPendingApprovals(quotations, purchaseOrders, payments);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return quotation with status 承認依頼中', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: 'テスト見積', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals(quotations, [], []);

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not return quotation with status 下書き', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: 'テスト見積', total: 100000, issueDate: '2026-05-01', status: '下書き' }];

    // Act
    const result = getPendingApprovals(quotations, [], []);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should set type to 見積 for quotation', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: 'テスト見積', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals(quotations, [], []);

    // Assert
    expect(result[0].type).toBe('見積');
  });

  it('should set code from quotation', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: 'テスト見積', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals(quotations, [], []);

    // Assert
    expect(result[0].code).toBe('QUO-00001');
  });

  it('should set amount from quotation total', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: 'テスト見積', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals(quotations, [], []);

    // Assert
    expect(result[0].amount).toBe(100000);
  });

  it('should set submittedAt from quotation issueDate', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: 'テスト見積', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals(quotations, [], []);

    // Assert
    expect(result[0].submittedAt).toBe('2026-05-01');
  });

  it('should return purchase order with status 承認依頼中', () => {
    // Arrange
    const purchaseOrders = [{ code: 'POD-00001', title: 'テスト発注', total: 110000, orderDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], purchaseOrders, []);

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not return purchase order with status 下書き', () => {
    // Arrange
    const purchaseOrders = [{ code: 'POD-00001', title: 'テスト発注', total: 110000, orderDate: '2026-05-01', status: '下書き' }];

    // Act
    const result = getPendingApprovals([], purchaseOrders, []);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should set type to 発注 for purchase order', () => {
    // Arrange
    const purchaseOrders = [{ code: 'POD-00001', title: 'テスト発注', total: 110000, orderDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], purchaseOrders, []);

    // Assert
    expect(result[0].type).toBe('発注');
  });

  it('should set submittedAt from purchase order orderDate', () => {
    // Arrange
    const purchaseOrders = [{ code: 'POD-00001', title: 'テスト発注', total: 110000, orderDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], purchaseOrders, []);

    // Assert
    expect(result[0].submittedAt).toBe('2026-05-01');
  });

  it('should return payment with status 承認待ち', () => {
    // Arrange
    const payments = [{ code: 'PMT-00001', title: 'テスト支払依頼', amount: 110000, paymentDate: '2026-05-31', status: '承認待ち' }];

    // Act
    const result = getPendingApprovals([], [], payments);

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not return payment with status 下書き', () => {
    // Arrange
    const payments = [{ code: 'PMT-00001', title: 'テスト支払依頼', amount: 110000, paymentDate: '2026-05-31', status: '下書き' }];

    // Act
    const result = getPendingApprovals([], [], payments);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should set type to 支払依頼 for payment', () => {
    // Arrange
    const payments = [{ code: 'PMT-00001', title: 'テスト支払依頼', amount: 110000, paymentDate: '2026-05-31', status: '承認待ち' }];

    // Act
    const result = getPendingApprovals([], [], payments);

    // Assert
    expect(result[0].type).toBe('支払依頼');
  });

  it('should set submittedAt from payment paymentDate', () => {
    // Arrange
    const payments = [{ code: 'PMT-00001', title: 'テスト支払依頼', amount: 110000, paymentDate: '2026-05-31', status: '承認待ち' }];

    // Act
    const result = getPendingApprovals([], [], payments);

    // Assert
    expect(result[0].submittedAt).toBe('2026-05-31');
  });

  it('should set submittedBy from quotation', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: 'テスト見積', total: 100000, issueDate: '2026-05-01', status: '承認依頼中', submittedBy: 'user01' }];

    // Act
    const result = getPendingApprovals(quotations, [], []);

    // Assert
    expect(result[0].submittedBy).toBe('user01');
  });

  it('should set submittedBy to empty string when quotation has no submittedBy', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: 'テスト見積', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals(quotations, [], []);

    // Assert
    expect(result[0].submittedBy).toBe('');
  });

  it('should set submittedBy from purchase order', () => {
    // Arrange
    const purchaseOrders = [{ code: 'POD-00001', title: 'テスト発注', total: 110000, orderDate: '2026-05-01', status: '承認依頼中', submittedBy: 'user01' }];

    // Act
    const result = getPendingApprovals([], purchaseOrders, []);

    // Assert
    expect(result[0].submittedBy).toBe('user01');
  });

  it('should set submittedBy from payment', () => {
    // Arrange
    const payments = [{ code: 'PMT-00001', title: 'テスト支払依頼', amount: 110000, paymentDate: '2026-05-31', status: '承認待ち', submittedBy: 'user01' }];

    // Act
    const result = getPendingApprovals([], [], payments);

    // Assert
    expect(result[0].submittedBy).toBe('user01');
  });

  it('should return all pending items from mixed inputs', () => {
    // Arrange
    const quotations = [
      { code: 'QUO-00001', title: '見積1', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' },
      { code: 'QUO-00002', title: '見積2', total: 200000, issueDate: '2026-05-02', status: '下書き' }
    ];
    const purchaseOrders = [
      { code: 'POD-00001', title: '発注1', total: 110000, orderDate: '2026-05-03', status: '承認依頼中' }
    ];
    const payments = [
      { code: 'PMT-00001', title: '支払1', amount: 50000, paymentDate: '2026-05-04', status: '承認待ち' }
    ];

    // Act
    const result = getPendingApprovals(quotations, purchaseOrders, payments);

    // Assert
    expect(result).toHaveLength(3);
  });
});

describe('getApprovalDetailRoute', () => {
  it('should return screen quotation when type is 見積', () => {
    // Arrange
    const item = { type: '見積', code: 'QUO-00001' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.screen).toBe('quotation');
  });

  it('should return screen purchaseOrder when type is 発注', () => {
    // Arrange
    const item = { type: '発注', code: 'POD-00001' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.screen).toBe('purchaseOrder');
  });

  it('should return screen payment when type is 支払依頼', () => {
    // Arrange
    const item = { type: '支払依頼', code: 'PMT-00001' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.screen).toBe('payment');
  });

  it('should preserve code when type is 見積', () => {
    // Arrange
    const item = { type: '見積', code: 'QUO-00042' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.code).toBe('QUO-00042');
  });

  it('should preserve code when type is 発注', () => {
    // Arrange
    const item = { type: '発注', code: 'POD-00007' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.code).toBe('POD-00007');
  });

  it('should preserve code when type is 支払依頼', () => {
    // Arrange
    const item = { type: '支払依頼', code: 'PMT-00003' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.code).toBe('PMT-00003');
  });

  it('should return null when type is unknown', () => {
    // Arrange
    const item = { type: '不明', code: 'XXX-00001' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result).toBeNull();
  });
});

describe('getPendingApprovals with orders', () => {
  it('should return order with status 承認依頼中', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', title: 'テスト受注', total: 660000, orderDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], [], [], orders);

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not return order with status 受注済み', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', title: 'テスト受注', total: 660000, orderDate: '2026-05-01', status: '受注済み' }];

    // Act
    const result = getPendingApprovals([], [], [], orders);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should set type to 受注 for order', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', title: 'テスト受注', total: 660000, orderDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], [], [], orders);

    // Assert
    expect(result[0].type).toBe('受注');
  });

  it('should set submittedAt from order orderDate', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', title: 'テスト受注', total: 660000, orderDate: '2026-05-10', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], [], [], orders);

    // Assert
    expect(result[0].submittedAt).toBe('2026-05-10');
  });

  it('should include orders and other items together', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: '見積1', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' }];
    const orders = [{ code: 'ORD-00001', title: '受注1', total: 660000, orderDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals(quotations, [], [], orders);

    // Assert
    expect(result).toHaveLength(2);
  });
});

describe('getApprovalDetailRoute with 受注', () => {
  it('should return screen order when type is 受注', () => {
    // Arrange
    const item = { type: '受注', code: 'ORD-00001' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.screen).toBe('order');
  });

  it('should preserve code when type is 受注', () => {
    // Arrange
    const item = { type: '受注', code: 'ORD-00042' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.code).toBe('ORD-00042');
  });
});

describe('getPendingApprovals with invoices', () => {
  it('should return invoice with status 承認依頼中', () => {
    // Arrange
    const invoices = [{ code: 'INV-00001', title: 'テスト請求', total: 660000, invoiceDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], [], [], [], invoices);

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not return invoice with status 下書き', () => {
    // Arrange
    const invoices = [{ code: 'INV-00001', title: 'テスト請求', total: 660000, invoiceDate: '2026-05-01', status: '下書き' }];

    // Act
    const result = getPendingApprovals([], [], [], [], invoices);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should set type to 請求 for invoice', () => {
    // Arrange
    const invoices = [{ code: 'INV-00001', title: 'テスト請求', total: 660000, invoiceDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], [], [], [], invoices);

    // Assert
    expect(result[0].type).toBe('請求');
  });

  it('should set submittedAt from invoice invoiceDate', () => {
    // Arrange
    const invoices = [{ code: 'INV-00001', title: 'テスト請求', total: 660000, invoiceDate: '2026-05-10', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals([], [], [], [], invoices);

    // Assert
    expect(result[0].submittedAt).toBe('2026-05-10');
  });

  it('should include invoices and other items together', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: '見積1', total: 100000, issueDate: '2026-05-01', status: '承認依頼中' }];
    const invoices = [{ code: 'INV-00001', title: '請求1', total: 660000, invoiceDate: '2026-05-01', status: '承認依頼中' }];

    // Act
    const result = getPendingApprovals(quotations, [], [], [], invoices);

    // Assert
    expect(result).toHaveLength(2);
  });
});

describe('getApprovalDetailRoute with 請求', () => {
  it('should return screen invoice when type is 請求', () => {
    // Arrange
    const item = { type: '請求', code: 'INV-00001' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.screen).toBe('invoice');
  });

  it('should preserve code when type is 請求', () => {
    // Arrange
    const item = { type: '請求', code: 'INV-00042' };

    // Act
    const result = getApprovalDetailRoute(item);

    // Assert
    expect(result.code).toBe('INV-00042');
  });
});

describe('buildApprovalHistoryEntry', () => {
  it('should return entry with given action', () => {
    // Arrange & Act
    const result = buildApprovalHistoryEntry('承認依頼', 'user01', '', '2026-05-01T10:00:00');

    // Assert
    expect(result.action).toBe('承認依頼');
  });

  it('should return entry with given operatorName', () => {
    // Arrange & Act
    const result = buildApprovalHistoryEntry('承認', '山田太郎', '問題なし', '2026-05-02T11:00:00');

    // Assert
    expect(result.operatorName).toBe('山田太郎');
  });

  it('should return entry with given comment', () => {
    // Arrange & Act
    const result = buildApprovalHistoryEntry('却下', '鈴木部長', '金額に誤りがあります', '2026-05-03T09:00:00');

    // Assert
    expect(result.comment).toBe('金額に誤りがあります');
  });

  it('should return entry with given timestamp', () => {
    // Arrange & Act
    const result = buildApprovalHistoryEntry('承認依頼', 'user01', '', '2026-05-01T10:00:00');

    // Assert
    expect(result.timestamp).toBe('2026-05-01T10:00:00');
  });
});

describe('addApprovalHistoryEntry', () => {
  it('should add entry to document with empty approvalHistory', () => {
    // Arrange
    const doc = { code: 'QUO-00001', status: '承認依頼中', approvalHistory: [] };
    const entry = buildApprovalHistoryEntry('承認依頼', 'user01', '', '2026-05-01T10:00:00');

    // Act
    const result = addApprovalHistoryEntry(doc, entry);

    // Assert
    expect(result.approvalHistory).toHaveLength(1);
  });

  it('should append entry to existing approvalHistory', () => {
    // Arrange
    const existing = buildApprovalHistoryEntry('承認依頼', 'user01', '', '2026-05-01T10:00:00');
    const doc = { code: 'QUO-00001', status: '承認依頼中', approvalHistory: [existing] };
    const newEntry = buildApprovalHistoryEntry('承認', '山田部長', '', '2026-05-02T10:00:00');

    // Act
    const result = addApprovalHistoryEntry(doc, newEntry);

    // Assert
    expect(result.approvalHistory).toHaveLength(2);
    expect(result.approvalHistory[1].action).toBe('承認');
  });

  it('should not mutate original document', () => {
    // Arrange
    const doc = { code: 'QUO-00001', status: '承認依頼中', approvalHistory: [] };
    const entry = buildApprovalHistoryEntry('承認依頼', 'user01', '', '2026-05-01T10:00:00');

    // Act
    addApprovalHistoryEntry(doc, entry);

    // Assert
    expect(doc.approvalHistory).toHaveLength(0);
  });

  it('should handle document without approvalHistory field', () => {
    // Arrange
    const doc = { code: 'QUO-00001', status: '承認依頼中' };
    const entry = buildApprovalHistoryEntry('承認依頼', 'user01', '', '2026-05-01T10:00:00');

    // Act
    const result = addApprovalHistoryEntry(doc, entry);

    // Assert
    expect(result.approvalHistory).toHaveLength(1);
  });
});
