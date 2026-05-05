import { describe, it, expect, vi } from 'vitest';
import {
  listProjects,
  getProjectByCode,
  registerProject,
  updateProject
} from './projectService.js';

const sampleProject = {
  code: 'PJ-00001',
  name: 'テストプロジェクト',
  customerId: 'CUS-001',
  department: '営業部',
  status: '進行中',
  startDate: '2026-04-01',
  dueDate: '2026-09-30',
  description: '説明文'
};

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleProject]),
  findByCode: vi.fn().mockResolvedValue(sampleProject),
  findAllCodes: vi.fn().mockResolvedValue(['PJ-00001']),
  save: vi.fn().mockResolvedValue(sampleProject),
  update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleProject, ...data })),
  ...overrides
});

describe('listProjects', () => {
  it('should return all projects from repository', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listProjects({ repository });

    // Assert
    expect(result).toEqual([sampleProject]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('getProjectByCode', () => {
  it('should return project when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getProjectByCode('PJ-00001', { repository });

    // Assert
    expect(result).toEqual(sampleProject);
    expect(repository.findByCode).toHaveBeenCalledWith('PJ-00001');
  });

  it('should throw 404 error when code does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getProjectByCode('PJ-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerProject', () => {
  it('should generate code from existing codes and save project', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue(['PJ-00001']),
      save: vi.fn().mockImplementation(async (p) => p)
    });
    const formData = {
      name: '新規プロジェクト',
      customerId: 'CUS-002',
      department: '開発部',
      status: '進行中',
      startDate: '2026-05-01',
      dueDate: '2026-12-31'
    };

    // Act
    const result = await registerProject(formData, { repository });

    // Assert
    expect(result.code).toBe('PJ-00002');
    expect(result.name).toBe('新規プロジェクト');
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('should assign PJ-00001 when no projects exist', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockImplementation(async (p) => p)
    });

    // Act
    const result = await registerProject({ name: 'テスト', status: '進行中' }, { repository });

    // Assert
    expect(result.code).toBe('PJ-00001');
  });

  it('should throw validation error when name is missing', async () => {
    // Arrange
    const repository = makeRepo();

    // Act & Assert
    await expect(registerProject({ status: '進行中' }, { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('updateProject', () => {
  it('should update and return the modified project', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleProject, ...data }))
    });

    // Act
    const result = await updateProject('PJ-00001', { name: '変更後プロジェクト' }, { repository });

    // Assert
    expect(result.name).toBe('変更後プロジェクト');
    expect(repository.findByCode).toHaveBeenCalledWith('PJ-00001');
    expect(repository.update).toHaveBeenCalledWith('PJ-00001', { name: '変更後プロジェクト' });
  });

  it('should throw 404 error when updating non-existent project', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(updateProject('PJ-99999', { name: 'X' }, { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
