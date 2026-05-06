import { describe, it, expect, vi } from 'vitest';
import { createOrderRepository } from './orderRepository.js';

const detailRow = { id: 1, orderCode: 'ORD-00001', lineNo: 1, productName: '商品A', quantity: '1.00', unitPrice: '2000.00', amount: '2200.00' };
const attachmentRow = { id: 1, orderCode: 'ORD-00001', fileName: 'contract.pdf', fileSize: 1024, fileType: 'application/pdf', uploadedAt: new Date() };
const headerRow = {
  code: 'ORD-00001',
  quotationCode: 'QUO-00001',
  title: 'テスト受注',
  status: '受注済み',
  subtotal: '2000.00',
  taxAmount: '200.00',
  total: '2200.00',
  billingTarget: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    orders: {
      findMany: vi.fn().mockResolvedValue([headerRow]),
      findFirst: vi.fn().mockResolvedValue(headerRow)
    },
    orderDetails: {
      findMany: vi.fn().mockResolvedValue([detailRow])
    },
    orderAttachments: {
      findMany: vi.fn().mockResolvedValue([attachmentRow])
    }
  },
  insert: vi.fn()
    .mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([headerRow]) }) })
    .mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([detailRow]) }) })
    .mockReturnValueOnce({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([attachmentRow]) }) }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([headerRow]) })
    })
  }),
  ...overrides
});

describe('createOrderRepository', () => {
  describe('findAll', () => {
    it('should return all order headers', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createOrderRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([headerRow]);
      expect(db.query.orders.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return order with details and attachments when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createOrderRepository(db);

      // Act
      const result = await repo.findByCode('ORD-00001');

      // Assert
      expect(result.code).toBe('ORD-00001');
      expect(result.details).toEqual([detailRow]);
      expect(result.attachments).toEqual([attachmentRow]);
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          orders: { findMany: vi.fn(), findFirst: vi.fn().mockResolvedValue(undefined) },
          orderDetails: { findMany: vi.fn() },
          orderAttachments: { findMany: vi.fn() }
        }
      });
      const repo = createOrderRepository(db);

      // Act
      const result = await repo.findByCode('ORD-99999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createOrderRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(result).toContain('ORD-00001');
    });
  });

  describe('save', () => {
    it('should insert header and details returning combined record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createOrderRepository(db);
      const order = { ...headerRow, details: [{ lineNo: 1, productName: '商品A' }], attachments: [] };

      // Act
      const result = await repo.save(order);

      // Assert
      expect(result.code).toBe('ORD-00001');
      expect(db.insert).toHaveBeenCalledTimes(2);
    });

    it('should insert attachments when provided', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createOrderRepository(db);
      const order = {
        ...headerRow,
        details: [{ lineNo: 1, productName: '商品A' }],
        attachments: [{ fileName: 'contract.pdf', fileSize: 1024, fileType: 'application/pdf' }]
      };

      // Act
      const result = await repo.save(order);

      // Assert
      expect(db.insert).toHaveBeenCalledTimes(3);
    });
  });

  describe('update', () => {
    it('should update order header and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createOrderRepository(db);

      // Act
      const result = await repo.update('ORD-00001', { status: '承認依頼中' });

      // Assert
      expect(result.code).toBe('ORD-00001');
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
