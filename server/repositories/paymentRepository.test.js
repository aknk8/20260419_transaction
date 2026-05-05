import { describe, it, expect, vi } from 'vitest';
import { createPaymentRepository } from './paymentRepository.js';

const paymentRow = {
  code: 'PMT-00001',
  purchaseOrderCode: 'POD-00001',
  supplierId: 'SUP-00001',
  title: 'テスト支払',
  paymentDate: '2026-05-31',
  amount: '5500.00',
  status: '下書き',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    payments: {
      findMany: vi.fn().mockResolvedValue([paymentRow]),
      findFirst: vi.fn().mockResolvedValue(paymentRow)
    }
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([paymentRow]) })
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([paymentRow]) })
    })
  }),
  ...overrides
});

describe('createPaymentRepository', () => {
  describe('findAll', () => {
    it('should return all payments', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPaymentRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([paymentRow]);
      expect(db.query.payments.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return payment when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPaymentRepository(db);

      // Act
      const result = await repo.findByCode('PMT-00001');

      // Assert
      expect(result.code).toBe('PMT-00001');
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: { payments: { findMany: vi.fn(), findFirst: vi.fn().mockResolvedValue(undefined) } }
      });
      const repo = createPaymentRepository(db);

      // Act
      const result = await repo.findByCode('PMT-99999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPaymentRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(result).toContain('PMT-00001');
    });
  });

  describe('save', () => {
    it('should insert and return the new payment', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPaymentRepository(db);

      // Act
      const result = await repo.save({ supplierId: 'SUP-00001', title: 'テスト支払', paymentDate: '2026-05-31', amount: 5500 });

      // Assert
      expect(result.code).toBe('PMT-00001');
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update and return the updated payment', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPaymentRepository(db);

      // Act
      const result = await repo.update('PMT-00001', { status: '承認依頼中' });

      // Assert
      expect(result.code).toBe('PMT-00001');
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
