import { describe, it, expect, vi } from 'vitest';
import { createInvoiceRepository } from './invoiceRepository.js';

const detailRow = { id: 1, invoiceCode: 'INV-00001', lineNo: 1, productName: '商品A', quantity: '1.00', unitPrice: '5000.00', amount: '5500.00' };
const headerRow = {
  code: 'INV-00001',
  orderCode: 'ORD-00001',
  customerId: 'CUS-00001',
  title: 'テスト請求',
  status: '下書き',
  subtotal: '5000.00',
  taxAmount: '500.00',
  total: '5500.00',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    invoices: {
      findMany: vi.fn().mockResolvedValue([headerRow]),
      findFirst: vi.fn().mockResolvedValue(headerRow)
    },
    invoiceDetails: {
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

describe('createInvoiceRepository', () => {
  describe('findAll', () => {
    it('should return all invoice headers', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createInvoiceRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([headerRow]);
      expect(db.query.invoices.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return invoice with details when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createInvoiceRepository(db);

      // Act
      const result = await repo.findByCode('INV-00001');

      // Assert
      expect(result.code).toBe('INV-00001');
      expect(result.details).toEqual([detailRow]);
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          invoices: { findMany: vi.fn(), findFirst: vi.fn().mockResolvedValue(undefined) },
          invoiceDetails: { findMany: vi.fn() }
        }
      });
      const repo = createInvoiceRepository(db);

      // Act
      const result = await repo.findByCode('INV-99999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createInvoiceRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(result).toContain('INV-00001');
    });
  });

  describe('save', () => {
    it('should insert header and details, returning combined record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createInvoiceRepository(db);
      const invoice = { ...headerRow, details: [{ lineNo: 1, productName: '商品A' }] };

      // Act
      const result = await repo.save(invoice);

      // Assert
      expect(result.code).toBe('INV-00001');
      expect(db.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    it('should update invoice header and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createInvoiceRepository(db);

      // Act
      const result = await repo.update('INV-00001', { status: '承認依頼中' });

      // Assert
      expect(result.code).toBe('INV-00001');
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
