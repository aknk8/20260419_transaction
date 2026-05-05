import { describe, it, expect, vi } from 'vitest';
import { createSupplierRepository } from './supplierRepository.js';

const row1 = {
  code: 'SUP-001',
  name: '株式会社テスト仕入先',
  contact: '山田 次郎',
  paymentSite: '翌月末',
  status: '有効',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    suppliers: {
      findMany: vi.fn().mockResolvedValue([row1]),
      findFirst: vi.fn().mockResolvedValue(row1)
    }
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([row1]) })
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([row1]) })
    })
  }),
  ...overrides
});

describe('createSupplierRepository', () => {
  describe('findAll', () => {
    it('should return all suppliers', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createSupplierRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([row1]);
      expect(db.query.suppliers.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return supplier when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createSupplierRepository(db);

      // Act
      const result = await repo.findByCode('SUP-001');

      // Assert
      expect(result).toEqual(row1);
      expect(db.query.suppliers.findFirst).toHaveBeenCalledOnce();
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          suppliers: {
            findMany: vi.fn(),
            findFirst: vi.fn().mockResolvedValue(undefined)
          }
        }
      });
      const repo = createSupplierRepository(db);

      // Act
      const result = await repo.findByCode('SUP-999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createSupplierRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('SUP-001');
    });
  });

  describe('save', () => {
    it('should insert supplier and return saved record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createSupplierRepository(db);

      // Act
      const result = await repo.save({ code: 'SUP-001', name: '株式会社テスト仕入先', status: '有効' });

      // Assert
      expect(result).toEqual(row1);
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update supplier and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createSupplierRepository(db);

      // Act
      const result = await repo.update('SUP-001', { name: '変更後' });

      // Assert
      expect(result).toEqual(row1);
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
