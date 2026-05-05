import { describe, it, expect, vi } from 'vitest';
import { createQuotationRepository } from './quotationRepository.js';

const detailRow = { id: 1, quotationCode: 'QUO-00001', lineNo: 1, productName: '商品A', quantity: '1.00', unitPrice: '1000.00', discount: '0.00', taxRate: '0.1000', amount: '1100.00' };
const headerRow = {
  code: 'QUO-00001',
  title: 'テスト見積',
  projectCode: 'PJ-00001',
  customerId: 'CUS-001',
  version: 1,
  status: '下書き',
  subtotal: '1000.00',
  taxAmount: '100.00',
  total: '1100.00',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    quotations: {
      findMany: vi.fn().mockResolvedValue([headerRow]),
      findFirst: vi.fn().mockResolvedValue(headerRow)
    },
    quotationDetails: {
      findMany: vi.fn().mockResolvedValue([detailRow])
    }
  },
  insert: vi.fn().mockImplementation((table) => ({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue(
      table === undefined ? [headerRow] : [headerRow]
    ) })
  })),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([headerRow]) })
    })
  }),
  ...overrides
});

describe('createQuotationRepository', () => {
  describe('findAll', () => {
    it('should return all quotation headers', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createQuotationRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([headerRow]);
      expect(db.query.quotations.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return quotation with details when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createQuotationRepository(db);

      // Act
      const result = await repo.findByCode('QUO-00001');

      // Assert
      expect(result.code).toBe('QUO-00001');
      expect(result.details).toEqual([detailRow]);
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          quotations: { findMany: vi.fn(), findFirst: vi.fn().mockResolvedValue(undefined) },
          quotationDetails: { findMany: vi.fn() }
        }
      });
      const repo = createQuotationRepository(db);

      // Act
      const result = await repo.findByCode('QUO-99999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createQuotationRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(result).toContain('QUO-00001');
    });
  });

  describe('save', () => {
    it('should insert header and details, returning combined record', async () => {
      // Arrange
      const db = makeMockDb({
        insert: vi.fn()
          .mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([headerRow]) }) })
          .mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([detailRow]) }) })
      });
      const repo = createQuotationRepository(db);
      const quotation = { ...headerRow, details: [{ lineNo: 1, productName: '商品A' }] };

      // Act
      const result = await repo.save(quotation);

      // Assert
      expect(result.code).toBe('QUO-00001');
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it('should insert header only when details are empty', async () => {
      // Arrange
      const db = makeMockDb({
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([headerRow]) }) })
      });
      const repo = createQuotationRepository(db);

      // Act
      const result = await repo.save({ ...headerRow, details: [] });

      // Assert
      expect(result.code).toBe('QUO-00001');
      expect(db.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update header and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createQuotationRepository(db);

      // Act
      const result = await repo.update('QUO-00001', { status: '承認依頼中' });

      // Assert
      expect(result.code).toBe('QUO-00001');
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
