import { describe, it, expect } from 'vitest';
import {
  getNotificationsForUser,
  createApprovalRequestNotifications,
  createApprovalCompleteNotification,
  createRejectionNotification,
  checkOverdueApprovals,
  createInvoiceDueNotifications,
  createDeliveryDueNotifications
} from './notification.js';

describe('getNotificationsForUser', () => {
  it('should return empty array when notifications is empty', () => {
    // Arrange
    const notifications = [];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return notifications for the given user', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not return notifications for other users', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'sales01', type: '承認依頼', message: 'テスト' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return only notifications for the specified user when mixed recipients exist', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト1' },
      { id: 'NTF-00002', recipientId: 'sales01', type: '承認完了', message: 'テスト2' },
      { id: 'NTF-00003', recipientId: 'admin', type: '差戻し', message: 'テスト3' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(2);
  });

  it('should return notification with correct id', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result[0].id).toBe('NTF-00001');
  });

  it('should return notification with correct type', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result[0].type).toBe('承認依頼');
  });

  it('should return notification with correct message', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: '見積 QUO-00003 の承認依頼があります' }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result[0].message).toBe('見積 QUO-00003 の承認依頼があります');
  });

  it('should return notification with isRead field', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト', isRead: false }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result[0].isRead).toBe(false);
  });

  it('should return unread notification', () => {
    // Arrange
    const notifications = [
      { id: 'NTF-00001', recipientId: 'admin', type: '承認依頼', message: 'テスト', isRead: false },
      { id: 'NTF-00002', recipientId: 'admin', type: '承認完了', message: 'テスト2', isRead: true }
    ];

    // Act
    const result = getNotificationsForUser(notifications, 'admin');

    // Assert
    expect(result).toHaveLength(2);
    expect(result.filter(function(n) { return !n.isRead; })).toHaveLength(1);
  });
});

describe('createApprovalRequestNotifications (N-01)', () => {
  it('should return empty array when no approvers', () => {
    // Arrange & Act
    const result = createApprovalRequestNotifications('見積', 'QUO-00001', []);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should create one notification per approver', () => {
    // Arrange & Act
    const result = createApprovalRequestNotifications('見積', 'QUO-00001', ['mgr01', 'mgr02']);

    // Assert
    expect(result).toHaveLength(2);
  });

  it('should set recipientId to each approver userId', () => {
    // Arrange & Act
    const result = createApprovalRequestNotifications('発注', 'POD-00001', ['mgr01']);

    // Assert
    expect(result[0].recipientId).toBe('mgr01');
  });

  it('should set type to N-01', () => {
    // Arrange & Act
    const result = createApprovalRequestNotifications('見積', 'QUO-00001', ['mgr01']);

    // Assert
    expect(result[0].type).toBe('N-01');
  });

  it('should set isRead to false', () => {
    // Arrange & Act
    const result = createApprovalRequestNotifications('見積', 'QUO-00001', ['mgr01']);

    // Assert
    expect(result[0].isRead).toBe(false);
  });

  it('should include docCode in message', () => {
    // Arrange & Act
    const result = createApprovalRequestNotifications('見積', 'QUO-00001', ['mgr01']);

    // Assert
    expect(result[0].message).toContain('QUO-00001');
  });

  it('should include docType in message', () => {
    // Arrange & Act
    const result = createApprovalRequestNotifications('発注', 'POD-00001', ['mgr01']);

    // Assert
    expect(result[0].message).toContain('発注');
  });
});

describe('createApprovalCompleteNotification (N-02)', () => {
  it('should create one notification for the applicant', () => {
    // Arrange & Act
    const result = createApprovalCompleteNotification('見積', 'QUO-00001', 'sales01');

    // Assert
    expect(result.recipientId).toBe('sales01');
  });

  it('should set type to N-02', () => {
    // Arrange & Act
    const result = createApprovalCompleteNotification('見積', 'QUO-00001', 'sales01');

    // Assert
    expect(result.type).toBe('N-02');
  });

  it('should set isRead to false', () => {
    // Arrange & Act
    const result = createApprovalCompleteNotification('見積', 'QUO-00001', 'sales01');

    // Assert
    expect(result.isRead).toBe(false);
  });

  it('should include docCode in message', () => {
    // Arrange & Act
    const result = createApprovalCompleteNotification('見積', 'QUO-00001', 'sales01');

    // Assert
    expect(result.message).toContain('QUO-00001');
  });

  it('should include docType in message', () => {
    // Arrange & Act
    const result = createApprovalCompleteNotification('発注', 'POD-00001', 'purchase01');

    // Assert
    expect(result.message).toContain('発注');
  });
});

describe('createRejectionNotification (N-03)', () => {
  it('should create one notification for the applicant', () => {
    // Arrange & Act
    const result = createRejectionNotification('見積', 'QUO-00001', 'sales01', '金額が予算超過');

    // Assert
    expect(result.recipientId).toBe('sales01');
  });

  it('should set type to N-03', () => {
    // Arrange & Act
    const result = createRejectionNotification('見積', 'QUO-00001', 'sales01', '金額が予算超過');

    // Assert
    expect(result.type).toBe('N-03');
  });

  it('should set isRead to false', () => {
    // Arrange & Act
    const result = createRejectionNotification('見積', 'QUO-00001', 'sales01', '金額が予算超過');

    // Assert
    expect(result.isRead).toBe(false);
  });

  it('should include reject comment in message', () => {
    // Arrange & Act
    const result = createRejectionNotification('見積', 'QUO-00001', 'sales01', '金額が予算超過');

    // Assert
    expect(result.message).toContain('金額が予算超過');
  });

  it('should include docCode in message', () => {
    // Arrange & Act
    const result = createRejectionNotification('見積', 'QUO-00001', 'sales01', '金額が予算超過');

    // Assert
    expect(result.message).toContain('QUO-00001');
  });

  it('should include docType in message', () => {
    // Arrange & Act
    const result = createRejectionNotification('発注', 'POD-00001', 'purchase01', '仕様不一致');

    // Assert
    expect(result.message).toContain('発注');
  });
});

describe('checkOverdueApprovals (N-04)', () => {
  it('should return empty array when no pending approvals', () => {
    // Arrange & Act
    const result = checkOverdueApprovals([], 3, '2026-05-05');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return notification when approval has been pending for stalenessDays or more', () => {
    // Arrange
    const pendingApprovals = [
      { code: 'QUO-00001', docType: '見積', submittedBy: 'sales01', submittedAt: '2026-05-01' }
    ];

    // Act
    const result = checkOverdueApprovals(pendingApprovals, 3, '2026-05-05');

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not return notification when approval is within stalenessDays', () => {
    // Arrange
    const pendingApprovals = [
      { code: 'QUO-00001', docType: '見積', submittedBy: 'sales01', submittedAt: '2026-05-04' }
    ];

    // Act
    const result = checkOverdueApprovals(pendingApprovals, 3, '2026-05-05');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should set type to N-04', () => {
    // Arrange
    const pendingApprovals = [
      { code: 'POD-00001', docType: '発注', submittedBy: 'purchase01', submittedAt: '2026-05-01' }
    ];

    // Act
    const result = checkOverdueApprovals(pendingApprovals, 3, '2026-05-05');

    // Assert
    expect(result[0].type).toBe('N-04');
  });

  it('should set recipientId to submittedBy', () => {
    // Arrange
    const pendingApprovals = [
      { code: 'QUO-00001', docType: '見積', submittedBy: 'sales01', submittedAt: '2026-04-30' }
    ];

    // Act
    const result = checkOverdueApprovals(pendingApprovals, 3, '2026-05-05');

    // Assert
    expect(result[0].recipientId).toBe('sales01');
  });

  it('should include docCode in message', () => {
    // Arrange
    const pendingApprovals = [
      { code: 'QUO-00001', docType: '見積', submittedBy: 'sales01', submittedAt: '2026-04-30' }
    ];

    // Act
    const result = checkOverdueApprovals(pendingApprovals, 3, '2026-05-05');

    // Assert
    expect(result[0].message).toContain('QUO-00001');
  });

  it('should set isRead to false', () => {
    // Arrange
    const pendingApprovals = [
      { code: 'QUO-00001', docType: '見積', submittedBy: 'sales01', submittedAt: '2026-04-30' }
    ];

    // Act
    const result = checkOverdueApprovals(pendingApprovals, 3, '2026-05-05');

    // Assert
    expect(result[0].isRead).toBe(false);
  });

  it('should skip items without submittedAt', () => {
    // Arrange
    const pendingApprovals = [
      { code: 'QUO-00001', docType: '見積', submittedBy: 'sales01' }
    ];

    // Act
    const result = checkOverdueApprovals(pendingApprovals, 3, '2026-05-05');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should only return overdue items when mixed with non-overdue', () => {
    // Arrange
    const pendingApprovals = [
      { code: 'QUO-00001', docType: '見積', submittedBy: 'sales01', submittedAt: '2026-04-30' },
      { code: 'POD-00001', docType: '発注', submittedBy: 'purchase01', submittedAt: '2026-05-04' }
    ];

    // Act
    const result = checkOverdueApprovals(pendingApprovals, 3, '2026-05-05');

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].docCode).toBe('QUO-00001');
  });
});

describe('createInvoiceDueNotifications (N-05)', () => {
  it('should return empty array when no invoices due today', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', dueDate: '2026-05-10', createdBy: 'sales01', status: '送付済' }
    ];

    // Act
    const result = createInvoiceDueNotifications(invoices, '2026-05-05');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should create notification for invoice due today', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', dueDate: '2026-05-05', createdBy: 'sales01', status: '送付済' }
    ];

    // Act
    const result = createInvoiceDueNotifications(invoices, '2026-05-05');

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should set recipientId to invoice createdBy', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', dueDate: '2026-05-05', createdBy: 'sales01', status: '送付済' }
    ];

    // Act
    const result = createInvoiceDueNotifications(invoices, '2026-05-05');

    // Assert
    expect(result[0].recipientId).toBe('sales01');
  });

  it('should set type to N-05', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', dueDate: '2026-05-05', createdBy: 'sales01', status: '送付済' }
    ];

    // Act
    const result = createInvoiceDueNotifications(invoices, '2026-05-05');

    // Assert
    expect(result[0].type).toBe('N-05');
  });

  it('should set isRead to false', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', dueDate: '2026-05-05', createdBy: 'sales01', status: '送付済' }
    ];

    // Act
    const result = createInvoiceDueNotifications(invoices, '2026-05-05');

    // Assert
    expect(result[0].isRead).toBe(false);
  });

  it('should include invoice code in message', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', dueDate: '2026-05-05', createdBy: 'sales01', status: '送付済' }
    ];

    // Act
    const result = createInvoiceDueNotifications(invoices, '2026-05-05');

    // Assert
    expect(result[0].message).toContain('INV-00001');
  });

  it('should create notifications for multiple invoices due today', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', dueDate: '2026-05-05', createdBy: 'sales01', status: '送付済' },
      { code: 'INV-00002', dueDate: '2026-05-05', createdBy: 'sales02', status: '一部入金' },
      { code: 'INV-00003', dueDate: '2026-05-10', createdBy: 'sales01', status: '送付済' }
    ];

    // Act
    const result = createInvoiceDueNotifications(invoices, '2026-05-05');

    // Assert
    expect(result).toHaveLength(2);
  });
});

describe('createDeliveryDueNotifications (N-06)', () => {
  it('should return empty array when no purchase orders due today', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', deliveryDate: '2026-05-10', createdBy: 'purchase01', status: '発注済' }
    ];

    // Act
    const result = createDeliveryDueNotifications(purchaseOrders, '2026-05-05');

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should create notification for purchase order due today', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', deliveryDate: '2026-05-05', createdBy: 'purchase01', status: '発注済' }
    ];

    // Act
    const result = createDeliveryDueNotifications(purchaseOrders, '2026-05-05');

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should set recipientId to purchase order createdBy', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', deliveryDate: '2026-05-05', createdBy: 'purchase01', status: '発注済' }
    ];

    // Act
    const result = createDeliveryDueNotifications(purchaseOrders, '2026-05-05');

    // Assert
    expect(result[0].recipientId).toBe('purchase01');
  });

  it('should set type to N-06', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', deliveryDate: '2026-05-05', createdBy: 'purchase01', status: '発注済' }
    ];

    // Act
    const result = createDeliveryDueNotifications(purchaseOrders, '2026-05-05');

    // Assert
    expect(result[0].type).toBe('N-06');
  });

  it('should set isRead to false', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', deliveryDate: '2026-05-05', createdBy: 'purchase01', status: '発注済' }
    ];

    // Act
    const result = createDeliveryDueNotifications(purchaseOrders, '2026-05-05');

    // Assert
    expect(result[0].isRead).toBe(false);
  });

  it('should include purchase order code in message', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', deliveryDate: '2026-05-05', createdBy: 'purchase01', status: '発注済' }
    ];

    // Act
    const result = createDeliveryDueNotifications(purchaseOrders, '2026-05-05');

    // Assert
    expect(result[0].message).toContain('POD-00001');
  });

  it('should create notifications for multiple purchase orders due today', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', deliveryDate: '2026-05-05', createdBy: 'purchase01', status: '発注済' },
      { code: 'POD-00002', deliveryDate: '2026-05-05', createdBy: 'purchase02', status: '発注済' },
      { code: 'POD-00003', deliveryDate: '2026-05-20', createdBy: 'purchase01', status: '発注済' }
    ];

    // Act
    const result = createDeliveryDueNotifications(purchaseOrders, '2026-05-05');

    // Assert
    expect(result).toHaveLength(2);
  });
});
