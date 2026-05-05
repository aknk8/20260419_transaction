import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCustomerRepository } from './customerRepository.js';

const row1 = {
  code: 'CUS-001',
  name: '株式会社テスト',
  department: '購買部',
  contact: '田中 太郎',
  closingDay: '月末',
  paymentSite: '翌月末',
  billingTo: '本社',
  status: '有効',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    customers: {
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
  select: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({ then: vi.fn() })
  }),
  ...overrides
});

describe('createCustomerRepository', () => {
  describe('findAll', () => {
    it('should return all customers', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createCustomerRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([row1]);
      expect(db.query.customers.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return customer when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createCustomerRepository(db);

      // Act
      const result = await repo.findByCode('CUS-001');

      // Assert
      expect(result).toEqual(row1);
      expect(db.query.customers.findFirst).toHaveBeenCalledOnce();
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          customers: {
            findMany: vi.fn(),
            findFirst: vi.fn().mockResolvedValue(undefined)
          }
        }
      });
      const repo = createCustomerRepository(db);

      // Act
      const result = await repo.findByCode('CUS-999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createCustomerRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('CUS-001');
    });
  });

  describe('save', () => {
    it('should insert customer and return saved record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createCustomerRepository(db);
      const newCustomer = { code: 'CUS-001', name: '株式会社テスト', status: '有効' };

      // Act
      const result = await repo.save(newCustomer);

      // Assert
      expect(result).toEqual(row1);
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update customer and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createCustomerRepository(db);

      // Act
      const result = await repo.update('CUS-001', { name: '変更後' });

      // Assert
      expect(result).toEqual(row1);
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
