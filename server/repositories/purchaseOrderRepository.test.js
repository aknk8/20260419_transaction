import { describe, it, expect, vi } from 'vitest';
import { createPurchaseOrderRepository } from './purchaseOrderRepository.js';

const detailRow = { id: 1, purchaseOrderCode: 'POD-00001', lineNo: 1, productName: '商品A', quantity: '1.00', unitPrice: '5000.00', amount: '5500.00' };
const headerRow = {
  code: 'POD-00001',
  supplierId: 'SUP-00001',
  title: 'テスト発注',
  status: '下書き',
  subtotal: '5000.00',
  taxAmount: '500.00',
  total: '5500.00',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    purchaseOrders: {
      findMany: vi.fn().mockResolvedValue([headerRow]),
      findFirst: vi.fn().mockResolvedValue(headerRow)
    },
    purchaseOrderDetails: {
      findMany: vi.fn().mockResolvedValue([detailRow])
    }
  },
  insert: vi.fn()
    .mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([headerRow]) }) })
    .mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([detailRow]) }) }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([headerRow]) })
    })
  }),
  ...overrides
});

describe('createPurchaseOrderRepository', () => {
  describe('findAll', () => {
    it('should return all purchase order headers', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPurchaseOrderRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([headerRow]);
      expect(db.query.purchaseOrders.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return purchase order with details when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPurchaseOrderRepository(db);

      // Act
      const result = await repo.findByCode('POD-00001');

      // Assert
      expect(result.code).toBe('POD-00001');
      expect(result.details).toEqual([detailRow]);
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          purchaseOrders: { findMany: vi.fn(), findFirst: vi.fn().mockResolvedValue(undefined) },
          purchaseOrderDetails: { findMany: vi.fn() }
        }
      });
      const repo = createPurchaseOrderRepository(db);

      // Act
      const result = await repo.findByCode('POD-99999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPurchaseOrderRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(result).toContain('POD-00001');
    });
  });

  describe('save', () => {
    it('should insert header and details, returning combined record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPurchaseOrderRepository(db);
      const po = { ...headerRow, details: [{ lineNo: 1, productName: '商品A' }], attachments: [] };

      // Act
      const result = await repo.save(po);

      // Assert
      expect(result.code).toBe('POD-00001');
      expect(db.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should update purchase order header and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createPurchaseOrderRepository(db);

      // Act
      const result = await repo.update('POD-00001', { status: '承認依頼中' });

      // Assert
      expect(result.code).toBe('POD-00001');
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
