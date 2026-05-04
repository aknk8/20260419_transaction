import { describe, it, expect } from 'vitest';
import { getPendingApprovals } from './approval.js';

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
