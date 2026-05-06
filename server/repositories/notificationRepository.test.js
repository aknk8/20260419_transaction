import { describe, it, expect, vi } from 'vitest';
import { createNotificationRepository } from './notificationRepository.js';

const sampleRow = {
  id: 'uuid-001',
  type: 'N-01',
  recipientId: 'user01',
  docType: '見積',
  docCode: 'QUO-00001',
  message: '見積 QUO-00001 の承認依頼があります',
  isRead: false,
  createdAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    notifications: {
      findMany: vi.fn().mockResolvedValue([sampleRow])
    }
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([sampleRow]) })
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ ...sampleRow, isRead: true }]) })
    })
  }),
  ...overrides
});

describe('createNotificationRepository', () => {
  describe('findByRecipientId', () => {
    it('should return notifications for the given user', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createNotificationRepository(db);

      // Act
      const result = await repo.findByRecipientId('user01');

      // Assert
      expect(result).toEqual([sampleRow]);
      expect(db.query.notifications.findMany).toHaveBeenCalledOnce();
    });

    it('should pass where clause filtering by recipientId', async () => {
      // Arrange
      const db = makeMockDb({ query: { notifications: { findMany: vi.fn().mockResolvedValue([]) } } });
      const repo = createNotificationRepository(db);

      // Act
      await repo.findByRecipientId('user02');

      // Assert
      expect(db.query.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Function) })
      );
    });
  });

  describe('save', () => {
    it('should insert notification and return saved record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createNotificationRepository(db);
      const notification = { type: 'N-01', recipientId: 'user01', docType: '見積', docCode: 'QUO-00001', message: 'テスト', isRead: false };

      // Act
      const result = await repo.save(notification);

      // Assert
      expect(result.id).toBe('uuid-001');
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('markAsRead', () => {
    it('should update isRead to true and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createNotificationRepository(db);

      // Act
      const result = await repo.markAsRead('uuid-001');

      // Assert
      expect(result.isRead).toBe(true);
      expect(db.update).toHaveBeenCalledOnce();
    });
  });

  describe('markAllAsRead', () => {
    it('should update all notifications for the user to isRead true', async () => {
      // Arrange
      const whereMock = vi.fn().mockResolvedValue(undefined);
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      const db = makeMockDb({ update: vi.fn().mockReturnValue({ set: setMock }) });
      const repo = createNotificationRepository(db);

      // Act
      await repo.markAllAsRead('user01');

      // Assert
      expect(db.update).toHaveBeenCalledOnce();
      expect(setMock).toHaveBeenCalledWith({ isRead: true });
    });

    it('should filter by recipientId when marking all as read', async () => {
      // Arrange
      const whereMock = vi.fn().mockResolvedValue(undefined);
      const setMock = vi.fn().mockReturnValue({ where: whereMock });
      const db = makeMockDb({ update: vi.fn().mockReturnValue({ set: setMock }) });
      const repo = createNotificationRepository(db);

      // Act
      await repo.markAllAsRead('user01');

      // Assert
      expect(whereMock).toHaveBeenCalledOnce();
    });
  });

  describe('findById', () => {
    it('should return notification for the given id', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          notifications: {
            findMany: vi.fn().mockResolvedValue([sampleRow]),
            findFirst: vi.fn().mockResolvedValue(sampleRow)
          }
        }
      });
      const repo = createNotificationRepository(db);

      // Act
      const result = await repo.findById('uuid-001');

      // Assert
      expect(result).toEqual(sampleRow);
      expect(db.query.notifications.findFirst).toHaveBeenCalledOnce();
    });

    it('should return null when notification does not exist', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          notifications: {
            findMany: vi.fn().mockResolvedValue([]),
            findFirst: vi.fn().mockResolvedValue(undefined)
          }
        }
      });
      const repo = createNotificationRepository(db);

      // Act
      const result = await repo.findById('no-such-id');

      // Assert
      expect(result).toBeNull();
    });
  });
});
