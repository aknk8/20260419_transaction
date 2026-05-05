import { describe, it, expect, vi } from 'vitest';
import { createProductRepository } from './productRepository.js';

const row1 = {
  code: 'PRD-001',
  name: 'テスト商品A',
  unit: '個',
  unitPrice: '1000.00',
  tax: '10.00',
  status: '有効',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    products: {
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

describe('createProductRepository', () => {
  describe('findAll', () => {
    it('should return all products', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProductRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([row1]);
      expect(db.query.products.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return product when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProductRepository(db);

      // Act
      const result = await repo.findByCode('PRD-001');

      // Assert
      expect(result).toEqual(row1);
      expect(db.query.products.findFirst).toHaveBeenCalledOnce();
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          products: {
            findMany: vi.fn(),
            findFirst: vi.fn().mockResolvedValue(undefined)
          }
        }
      });
      const repo = createProductRepository(db);

      // Act
      const result = await repo.findByCode('PRD-999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProductRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('PRD-001');
    });
  });

  describe('save', () => {
    it('should insert product and return saved record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProductRepository(db);

      // Act
      const result = await repo.save({ code: 'PRD-001', name: 'テスト商品A', status: '有効' });

      // Assert
      expect(result).toEqual(row1);
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update product and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProductRepository(db);

      // Act
      const result = await repo.update('PRD-001', { name: '変更後商品' });

      // Assert
      expect(result).toEqual(row1);
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
