import { describe, it, expect, vi } from 'vitest';
import { createDeliveryRepository } from './deliveryRepository.js';

const deliveryRow = {
  code: 'DLV-00001',
  purchaseOrderCode: 'POD-00001',
  deliveryDate: '2026-05-01',
  notes: '',
  status: '検収待ち',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    deliveries: {
      findMany: vi.fn().mockResolvedValue([deliveryRow])
    }
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([deliveryRow]) })
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([deliveryRow]) })
    })
  }),
  ...overrides
});

describe('createDeliveryRepository', () => {
  describe('findAll', () => {
    it('should return all deliveries', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createDeliveryRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([deliveryRow]);
      expect(db.query.deliveries.findMany).toHaveBeenCalledOnce();
    });

    it('should return empty array when no deliveries exist', async () => {
      // Arrange
      const db = makeMockDb({
        query: { deliveries: { findMany: vi.fn().mockResolvedValue([]) } }
      });
      const repo = createDeliveryRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createDeliveryRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(result).toContain('DLV-00001');
    });
  });

  describe('save', () => {
    it('should insert and return the new delivery', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createDeliveryRepository(db);

      // Act
      const result = await repo.save({ code: 'DLV-00001', purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01', status: '検収待ち' });

      // Assert
      expect(result.code).toBe('DLV-00001');
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update and return the updated delivery', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createDeliveryRepository(db);

      // Act
      const result = await repo.update('DLV-00001', { status: '検収済' });

      // Assert
      expect(result.code).toBe('DLV-00001');
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
