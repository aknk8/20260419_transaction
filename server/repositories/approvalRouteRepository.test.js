import { describe, it, expect, vi } from 'vitest';
import { createApprovalRouteRepository } from './approvalRouteRepository.js';

const routeRow = {
  id: 1,
  documentType: 'quotation',
  stepNumber: 1,
  approverUserId: 'user01',
  isActive: true,
  createdAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    approvalRoutes: {
      findMany: vi.fn().mockResolvedValue([routeRow]),
      findFirst: vi.fn().mockResolvedValue(routeRow)
    }
  },
  insert: vi.fn().mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([routeRow]) })
  }),
  update: vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([routeRow]) })
    })
  }),
  delete: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue()
  }),
  ...overrides
});

describe('createApprovalRouteRepository', () => {
  describe('findAll', () => {
    it('should return all approval routes', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createApprovalRouteRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([routeRow]);
      expect(db.query.approvalRoutes.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findById', () => {
    it('should return route when id matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createApprovalRouteRepository(db);

      // Act
      const result = await repo.findById(1);

      // Assert
      expect(result).toEqual(routeRow);
    });

    it('should return null when id does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          approvalRoutes: {
            findMany: vi.fn(),
            findFirst: vi.fn().mockResolvedValue(undefined)
          }
        }
      });
      const repo = createApprovalRouteRepository(db);

      // Act
      const result = await repo.findById(99);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should insert and return the new route', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createApprovalRouteRepository(db);

      // Act
      const result = await repo.save({ documentType: 'quotation', stepNumber: 1, approverUserId: 'user01' });

      // Assert
      expect(result).toEqual(routeRow);
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update and return the updated route', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createApprovalRouteRepository(db);

      // Act
      const result = await repo.update(1, { isActive: false });

      // Assert
      expect(result).toEqual(routeRow);
      expect(db.update).toHaveBeenCalledOnce();
    });
  });

  describe('remove', () => {
    it('should delete the route by id', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createApprovalRouteRepository(db);

      // Act
      await repo.remove(1);

      // Assert
      expect(db.delete).toHaveBeenCalledOnce();
    });
  });
});
