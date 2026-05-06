import { describe, it, expect, vi } from 'vitest';
import { createApprovalHistoryRepository } from './approvalHistoryRepository.js';

const sampleHistory = {
  id: 'uuid-h01',
  documentType: 'order',
  documentId: 'ORD-00001',
  stepNumber: 1,
  actorUserId: 'user01',
  actorName: '承認者A',
  action: '承認',
  comment: 'LGTM',
  createdAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    approvalHistory: {
      findMany: vi.fn().mockResolvedValue([sampleHistory])
    }
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([sampleHistory]) })
  }),
  ...overrides
});

describe('createApprovalHistoryRepository', () => {
  describe('save', () => {
    it('should insert approval history and return saved record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createApprovalHistoryRepository(db);
      const entry = { documentType: 'order', documentId: 'ORD-00001', stepNumber: 1, action: '承認', comment: 'OK' };

      // Act
      const result = await repo.save(entry);

      // Assert
      expect(result.id).toBe('uuid-h01');
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('findByDocument', () => {
    it('should return history records for given documentType and documentId', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createApprovalHistoryRepository(db);

      // Act
      const result = await repo.findByDocument('order', 'ORD-00001');

      // Assert
      expect(result).toEqual([sampleHistory]);
      expect(db.query.approvalHistory.findMany).toHaveBeenCalledOnce();
    });
  });
});
