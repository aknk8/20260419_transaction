import { describe, it, expect, vi } from 'vitest';
import { createReceiptRepository } from './receiptRepository.js';

const receiptRow = {
  code: 'RCP-00001',
  invoiceCode: 'INV-00001',
  receiptDate: '2026-05-10',
  amount: '5500.00',
  fee: '0.00',
  status: '未消込',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    receipts: {
      findMany: vi.fn().mockResolvedValue([receiptRow]),
      findFirst: vi.fn().mockResolvedValue(receiptRow)
    }
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([receiptRow]) })
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([receiptRow]) })
    })
  }),
  ...overrides
});

describe('createReceiptRepository', () => {
  describe('findAll', () => {
    it('should return all receipts', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createReceiptRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([receiptRow]);
      expect(db.query.receipts.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createReceiptRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(result).toContain('RCP-00001');
    });
  });

  describe('save', () => {
    it('should insert and return the new receipt', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createReceiptRepository(db);

      // Act
      const result = await repo.save({ invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 5500 });

      // Assert
      expect(result.code).toBe('RCP-00001');
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update and return the updated receipt', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createReceiptRepository(db);

      // Act
      const result = await repo.update('RCP-00001', { status: '消込済み' });

      // Assert
      expect(result.code).toBe('RCP-00001');
      expect(db.update).toHaveBeenCalledOnce();
    });
  });

  describe('findByInvoiceCode', () => {
    it('should return receipts for the given invoiceCode', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createReceiptRepository(db);

      // Act
      const result = await repo.findByInvoiceCode('INV-00001');

      // Assert
      expect(result).toEqual([receiptRow]);
      expect(db.query.receipts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Function) })
      );
    });

    it('should return empty array when no receipts exist for invoice', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          receipts: {
            findMany: vi.fn().mockResolvedValue([]),
            findFirst: vi.fn().mockResolvedValue(null)
          }
        }
      });
      const repo = createReceiptRepository(db);

      // Act
      const result = await repo.findByInvoiceCode('INV-99999');

      // Assert
      expect(result).toEqual([]);
    });
  });
});
