import { describe, it, expect, vi } from 'vitest';
import { createProjectRepository } from './projectRepository.js';

const row1 = {
  code: 'PJ-00001',
  name: 'テストプロジェクト',
  customerId: 'CUS-001',
  department: '営業部',
  status: '進行中',
  startDate: '2026-04-01',
  dueDate: '2026-09-30',
  description: '説明文',
  createdAt: new Date(),
  updatedAt: new Date()
};

const makeMockDb = (overrides = {}) => ({
  query: {
    projects: {
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

describe('createProjectRepository', () => {
  describe('findAll', () => {
    it('should return all projects', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProjectRepository(db);

      // Act
      const result = await repo.findAll();

      // Assert
      expect(result).toEqual([row1]);
      expect(db.query.projects.findMany).toHaveBeenCalledOnce();
    });
  });

  describe('findByCode', () => {
    it('should return project when code matches', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProjectRepository(db);

      // Act
      const result = await repo.findByCode('PJ-00001');

      // Assert
      expect(result).toEqual(row1);
    });

    it('should return null when code does not match', async () => {
      // Arrange
      const db = makeMockDb({
        query: {
          projects: {
            findMany: vi.fn(),
            findFirst: vi.fn().mockResolvedValue(undefined)
          }
        }
      });
      const repo = createProjectRepository(db);

      // Act
      const result = await repo.findByCode('PJ-99999');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findAllCodes', () => {
    it('should return array of code strings', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProjectRepository(db);

      // Act
      const result = await repo.findAllCodes();

      // Assert
      expect(result).toContain('PJ-00001');
    });
  });

  describe('save', () => {
    it('should insert project and return saved record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProjectRepository(db);

      // Act
      const result = await repo.save(row1);

      // Assert
      expect(result).toEqual(row1);
      expect(db.insert).toHaveBeenCalledOnce();
    });
  });

  describe('update', () => {
    it('should update project and return updated record', async () => {
      // Arrange
      const db = makeMockDb();
      const repo = createProjectRepository(db);

      // Act
      const result = await repo.update('PJ-00001', { name: '変更後' });

      // Assert
      expect(result).toEqual(row1);
      expect(db.update).toHaveBeenCalledOnce();
    });
  });
});
