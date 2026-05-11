import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAuditLogRepository, createDbAuditLogRepository } from './auditLogRepository.js';

let repo;

beforeEach(() => {
  repo = createAuditLogRepository([]);
});

describe('createAuditLogRepository', () => {
  describe('save', () => {
    it('should insert audit log and return saved record with generated id', async () => {
      // Arrange
      const entry = {
        userId: 'user-001',
        userName: '田中 太郎',
        action: 'CREATE',
        entityType: 'quotation',
        entityId: 'QUO-00001',
        beforeData: null,
        afterData: { code: 'QUO-00001', status: '下書き' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        result: 'SUCCESS',
        errorDetail: null
      };

      // Act
      const result = await repo.save(entry);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.action).toBe('CREATE');
      expect(result.entityType).toBe('quotation');
      expect(result.userId).toBe('user-001');
    });

    it('should assign sequential ids to multiple entries', async () => {
      // Arrange
      const entry1 = { action: 'LOGIN', result: 'SUCCESS' };
      const entry2 = { action: 'LOGOUT', result: 'SUCCESS' };

      // Act
      const r1 = await repo.save(entry1);
      const r2 = await repo.save(entry2);

      // Assert
      expect(r1.id).not.toEqual(r2.id);
    });

    it('should record createdAt timestamp', async () => {
      // Arrange
      const entry = { action: 'CREATE', result: 'SUCCESS' };

      // Act
      const result = await repo.save(entry);

      // Assert
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('findAll', () => {
    it('should return all audit logs', async () => {
      // Arrange
      await repo.save({ action: 'CREATE', result: 'SUCCESS' });
      await repo.save({ action: 'UPDATE', result: 'SUCCESS' });

      // Act
      const results = await repo.findAll();

      // Assert
      expect(results).toHaveLength(2);
    });

    it('should return empty array when no logs exist', async () => {
      // Arrange & Act
      const results = await repo.findAll();

      // Assert
      expect(results).toHaveLength(0);
    });
  });
});

describe('createDbAuditLogRepository', () => {
  describe('save', () => {
    it('should insert entry via db.insert and return the saved row', async () => {
      // Arrange
      const saved = { id: 1, action: 'CREATE', result: 'SUCCESS', createdAt: new Date() };
      const returning = vi.fn().mockResolvedValue([saved]);
      const values = vi.fn(() => ({ returning }));
      const insert = vi.fn(() => ({ values }));
      const db = { insert, query: { auditLogs: { findMany: vi.fn().mockResolvedValue([]) } } };
      const repo = createDbAuditLogRepository(db);
      const entry = { action: 'CREATE', result: 'SUCCESS' };

      // Act
      const result = await repo.save(entry);

      // Assert
      expect(insert).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });
  });

  describe('findAll', () => {
    it('should return rows from db.query.auditLogs.findMany', async () => {
      // Arrange
      const rows = [{ id: 1, action: 'LOGIN', result: 'SUCCESS' }];
      const findMany = vi.fn().mockResolvedValue(rows);
      const db = {
        insert: vi.fn(),
        query: { auditLogs: { findMany } }
      };
      const repo = createDbAuditLogRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(findMany).toHaveBeenCalled();
      expect(result).toEqual(rows);
    });
  });
});
