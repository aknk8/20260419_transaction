import { describe, it, expect } from 'vitest';
import { getDashboardMetrics } from './dashboard.js';

describe('getDashboardMetrics', () => {
  it('should return zero counts when all inputs are empty', () => {
    // Arrange / Act
    const result = getDashboardMetrics([], [], [], [], []);

    // Assert
    expect(result.pendingApprovals).toBe(0);
    expect(result.unbilled).toBe(0);
    expect(result.uncollected).toBe(0);
    expect(result.unpaid).toBe(0);
  });

  it('should count quotations with status 承認依頼中 as pending approvals', () => {
    // Arrange
    const quotations = [
      { code: 'QUO-00001', status: '承認依頼中' },
      { code: 'QUO-00002', status: '下書き' }
    ];

    // Act
    const result = getDashboardMetrics(quotations, [], [], [], []);

    // Assert
    expect(result.pendingApprovals).toBe(1);
  });

  it('should count purchase orders with status 承認依頼中 as pending approvals', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', status: '承認依頼中' }
    ];

    // Act
    const result = getDashboardMetrics([], purchaseOrders, [], [], []);

    // Assert
    expect(result.pendingApprovals).toBe(1);
  });

  it('should count payments with status 承認待ち as pending approvals', () => {
    // Arrange
    const payments = [
      { code: 'PMT-00001', status: '承認待ち' }
    ];

    // Act
    const result = getDashboardMetrics([], [], payments, [], []);

    // Assert
    expect(result.pendingApprovals).toBe(1);
  });

  it('should sum pending approvals across all three entity types', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', status: '承認依頼中' }];
    const purchaseOrders = [{ code: 'POD-00001', status: '承認依頼中' }];
    const payments = [{ code: 'PMT-00001', status: '承認待ち' }];

    // Act
    const result = getDashboardMetrics(quotations, purchaseOrders, payments, [], []);

    // Assert
    expect(result.pendingApprovals).toBe(3);
  });

  it('should count orders with billingTarget true and no confirmed invoice as unbilled', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', billingTarget: true }];

    // Act
    const result = getDashboardMetrics([], [], [], orders, []);

    // Assert
    expect(result.unbilled).toBe(1);
  });

  it('should not count orders with billingTarget false as unbilled', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', billingTarget: false }];

    // Act
    const result = getDashboardMetrics([], [], [], orders, []);

    // Assert
    expect(result.unbilled).toBe(0);
  });

  it('should not count unbilled when order has a confirmed invoice', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', billingTarget: true }];
    const invoices = [{ code: 'INV-00001', orderCode: 'ORD-00001', status: '確定' }];

    // Act
    const result = getDashboardMetrics([], [], [], orders, invoices);

    // Assert
    expect(result.unbilled).toBe(0);
  });

  it('should not count unbilled when order has a 送付済 invoice', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', billingTarget: true }];
    const invoices = [{ code: 'INV-00001', orderCode: 'ORD-00001', status: '送付済' }];

    // Act
    const result = getDashboardMetrics([], [], [], orders, invoices);

    // Assert
    expect(result.unbilled).toBe(0);
  });

  it('should still count unbilled when order has only a 下書き invoice', () => {
    // Arrange
    const orders = [{ code: 'ORD-00001', billingTarget: true }];
    const invoices = [{ code: 'INV-00001', orderCode: 'ORD-00001', status: '下書き' }];

    // Act
    const result = getDashboardMetrics([], [], [], orders, invoices);

    // Assert
    expect(result.unbilled).toBe(1);
  });

  it('should count invoices with status 送付済 as uncollected', () => {
    // Arrange
    const invoices = [{ code: 'INV-00001', orderCode: 'ORD-00001', status: '送付済' }];

    // Act
    const result = getDashboardMetrics([], [], [], [], invoices);

    // Assert
    expect(result.uncollected).toBe(1);
  });

  it('should count invoices with status 一部入金 as uncollected', () => {
    // Arrange
    const invoices = [{ code: 'INV-00001', orderCode: 'ORD-00001', status: '一部入金' }];

    // Act
    const result = getDashboardMetrics([], [], [], [], invoices);

    // Assert
    expect(result.uncollected).toBe(1);
  });

  it('should not count invoices with status 入金済 as uncollected', () => {
    // Arrange
    const invoices = [{ code: 'INV-00001', orderCode: 'ORD-00001', status: '入金済' }];

    // Act
    const result = getDashboardMetrics([], [], [], [], invoices);

    // Assert
    expect(result.uncollected).toBe(0);
  });

  it('should count payments with status 承認済 as unpaid', () => {
    // Arrange
    const payments = [{ code: 'PMT-00001', status: '承認済' }];

    // Act
    const result = getDashboardMetrics([], [], payments, [], []);

    // Assert
    expect(result.unpaid).toBe(1);
  });

  it('should not count payments with status 支払済 as unpaid', () => {
    // Arrange
    const payments = [{ code: 'PMT-00001', status: '支払済' }];

    // Act
    const result = getDashboardMetrics([], [], payments, [], []);

    // Assert
    expect(result.unpaid).toBe(0);
  });
});
