import { describe, it, expect, vi } from 'vitest';
import { createNotificationService } from './notificationService.js';

const sampleNotification = {
  id: 'uuid-001',
  type: 'N-01',
  recipientId: 'user01',
  docCode: 'QUO-00001',
  message: 'テスト',
  isRead: false
};

const makeRepo = (overrides = {}) => ({
  findByRecipientId: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(sampleNotification),
  save: vi.fn().mockImplementation(async (n) => ({ id: 'uuid-001', ...n })),
  markAsRead: vi.fn().mockResolvedValue({ id: 'uuid-001', isRead: true }),
  ...overrides
});

describe('createNotificationService', () => {
  describe('getNotificationsForUser', () => {
    it('should return notifications from repository for given user', async () => {
      // Arrange
      const notifications = [{ id: 'uuid-001', recipientId: 'user01', type: 'N-01', message: 'テスト', isRead: false }];
      const repo = makeRepo({ findByRecipientId: vi.fn().mockResolvedValue(notifications) });
      const svc = createNotificationService();

      // Act
      const result = await svc.getNotificationsForUser('user01', { repository: repo });

      // Assert
      expect(result).toEqual(notifications);
      expect(repo.findByRecipientId).toHaveBeenCalledWith('user01');
    });

    it('should return empty array when no notifications exist', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      const result = await svc.getNotificationsForUser('user01', { repository: repo });

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('notifyApprovalRequest (N-01)', () => {
    it('should save one notification per approver', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      await svc.notifyApprovalRequest('見積', 'QUO-00001', ['mgr01', 'mgr02'], { repository: repo });

      // Assert
      expect(repo.save).toHaveBeenCalledTimes(2);
    });

    it('should set type N-01 for each notification', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      await svc.notifyApprovalRequest('見積', 'QUO-00001', ['mgr01'], { repository: repo });

      // Assert
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'N-01' }));
    });

    it('should set recipientId to each approver', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      await svc.notifyApprovalRequest('見積', 'QUO-00001', ['mgr01'], { repository: repo });

      // Assert
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ recipientId: 'mgr01' }));
    });

    it('should set docCode in notification', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      await svc.notifyApprovalRequest('見積', 'QUO-00001', ['mgr01'], { repository: repo });

      // Assert
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ docCode: 'QUO-00001' }));
    });

    it('should not save when approver list is empty', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      await svc.notifyApprovalRequest('見積', 'QUO-00001', [], { repository: repo });

      // Assert
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('notifyApprovalComplete (N-02)', () => {
    it('should save one notification to applicant', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      await svc.notifyApprovalComplete('見積', 'QUO-00001', 'sales01', { repository: repo });

      // Assert
      expect(repo.save).toHaveBeenCalledOnce();
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'N-02', recipientId: 'sales01' }));
    });
  });

  describe('notifyRejection (N-03)', () => {
    it('should save one notification to applicant with reject comment', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      await svc.notifyRejection('見積', 'QUO-00001', 'sales01', '金額超過', { repository: repo });

      // Assert
      expect(repo.save).toHaveBeenCalledOnce();
      const call = repo.save.mock.calls[0][0];
      expect(call.type).toBe('N-03');
      expect(call.recipientId).toBe('sales01');
      expect(call.message).toContain('金額超過');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read when user is the owner', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act
      const result = await svc.markAsRead('uuid-001', 'user01', { repository: repo });

      // Assert
      expect(repo.markAsRead).toHaveBeenCalledWith('uuid-001');
      expect(result.isRead).toBe(true);
    });

    it('should throw 404 when notification does not exist', async () => {
      // Arrange
      const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
      const svc = createNotificationService();

      // Act & Assert
      await expect(svc.markAsRead('no-such-id', 'user01', { repository: repo }))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 404 when requesting user is not the owner', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();

      // Act & Assert
      await expect(svc.markAsRead('uuid-001', 'other-user', { repository: repo }))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('markAllAsRead', () => {
    it('should call repository markAllAsRead with given userId', async () => {
      // Arrange
      const repo = makeRepo({ markAllAsRead: vi.fn().mockResolvedValue(undefined) });
      const svc = createNotificationService();

      // Act
      await svc.markAllAsRead('user01', { repository: repo });

      // Assert
      expect(repo.markAllAsRead).toHaveBeenCalledWith('user01');
    });
  });

  describe('notifyApprovalRequest (N-01) - 部分失敗', () => {
    it('should reject when any repo.save fails (Promise.all partial failure)', async () => {
      // Arrange
      // Promise.all で2件中1件が失敗した場合、全体がrejectされる
      const saveError = new Error('DB write failed');
      const repo = makeRepo({
        save: vi.fn()
          .mockResolvedValueOnce({ id: 'uuid-001', type: 'N-01' })
          .mockRejectedValueOnce(saveError)
      });
      const svc = createNotificationService();

      // Act & Assert
      await expect(
        svc.notifyApprovalRequest('見積', 'QUO-00001', ['mgr01', 'mgr02'], { repository: repo })
      ).rejects.toThrow('DB write failed');
    });
  });

  describe('notifyStaleApprovals (N-04)', () => {
    it('should save N-04 notification for each stale pending document', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();
      const pendingDocuments = [
        { code: 'QUO-00001', docType: 'quotation', submittedAt: '2026-04-01', submittedBy: 'user01' }
      ];

      // Act
      await svc.notifyStaleApprovals(3, '2026-05-05', { pendingDocuments, repository: repo });

      // Assert
      expect(repo.save).toHaveBeenCalledOnce();
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'N-04', recipientId: 'user01' }));
    });

    it('should not save when no documents exceed staleDays', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();
      const pendingDocuments = [
        { code: 'QUO-00001', docType: 'quotation', submittedAt: '2026-05-04', submittedBy: 'user01' }
      ];

      // Act
      await svc.notifyStaleApprovals(3, '2026-05-05', { pendingDocuments, repository: repo });

      // Assert
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should return the count of notifications sent', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();
      const pendingDocuments = [
        { code: 'QUO-00001', docType: 'quotation', submittedAt: '2026-04-01', submittedBy: 'user01' },
        { code: 'ORD-00001', docType: 'order', submittedAt: '2026-04-01', submittedBy: 'user02' }
      ];

      // Act
      const count = await svc.notifyStaleApprovals(3, '2026-05-05', { pendingDocuments, repository: repo });

      // Assert
      expect(count).toBe(2);
    });

    it('should skip documents without submittedAt', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();
      const pendingDocuments = [
        { code: 'QUO-00001', docType: 'quotation', submittedAt: null, submittedBy: 'user01' }
      ];

      // Act
      await svc.notifyStaleApprovals(3, '2026-05-05', { pendingDocuments, repository: repo });

      // Assert
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should set docCode in N-04 notification', async () => {
      // Arrange
      const repo = makeRepo();
      const svc = createNotificationService();
      const pendingDocuments = [
        { code: 'ORD-00001', docType: 'order', submittedAt: '2026-04-01', submittedBy: 'user01' }
      ];

      // Act
      await svc.notifyStaleApprovals(3, '2026-05-05', { pendingDocuments, repository: repo });

      // Assert
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ docCode: 'ORD-00001' }));
    });

    it('should reject when any repo.save fails during Promise.all (partial failure)', async () => {
      // Arrange
      // 複数通知の一部のsaveが失敗した場合、Promise.allが全体をrejectする
      const saveError = new Error('DB write failed');
      const repo = makeRepo({
        save: vi.fn()
          .mockResolvedValueOnce({ id: 'uuid-001', type: 'N-04' })
          .mockRejectedValueOnce(saveError)
      });
      const svc = createNotificationService();
      const pendingDocuments = [
        { code: 'QUO-00001', docType: 'quotation', submittedAt: '2026-04-01', submittedBy: 'user01' },
        { code: 'ORD-00001', docType: 'order', submittedAt: '2026-04-01', submittedBy: 'user02' }
      ];

      // Act & Assert
      await expect(
        svc.notifyStaleApprovals(3, '2026-05-05', { pendingDocuments, repository: repo })
      ).rejects.toThrow('DB write failed');
    });
  });
});
