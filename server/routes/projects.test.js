import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleProject = {
  code: 'PJ-00001',
  name: 'テストプロジェクト',
  customerId: 'CUS-001',
  status: '進行中'
};

const makeApp = async (serviceOverrides = {}) => {
  const mockProjectService = {
    listProjects: vi.fn().mockResolvedValue([sampleProject]),
    getProjectByCode: vi.fn().mockResolvedValue(sampleProject),
    registerProject: vi.fn().mockResolvedValue(sampleProject),
    updateProject: vi.fn().mockResolvedValue(sampleProject),
    ...serviceOverrides
  };
  const mockUserRepository = {
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null)
  };
  const app = await buildApp({ userRepository: mockUserRepository, projectService: mockProjectService });
  return { app, mockProjectService };
};

describe('GET /api/projects', () => {
  it('should return 200 with project list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/projects',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleProject]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/projects' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/projects/:code', () => {
  it('should return 200 with project when code exists', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/projects/PJ-00001',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('PJ-00001');
  });

  it('should return 404 when project does not exist', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({ getProjectByCode: vi.fn().mockRejectedValue(notFoundErr) });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/projects/PJ-99999',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/projects', () => {
  it('should return 201 with created project', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      cookies: { token },
      payload: { name: 'テストプロジェクト', status: '進行中' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('PJ-00001');
  });

  it('should return 400 when name is missing', async () => {
    // Arrange
    const validationErr = new Error('案件名は必須です');
    validationErr.statusCode = 400;
    const { app } = await makeApp({ registerProject: vi.fn().mockRejectedValue(validationErr) });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      cookies: { token },
      payload: { status: '進行中' }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      payload: { name: 'テスト', status: '進行中' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/projects/:code', () => {
  it('should return 200 with updated project', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/projects/PJ-00001',
      cookies: { token },
      payload: { name: '変更後プロジェクト' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 when updating non-existent project', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({ updateProject: vi.fn().mockRejectedValue(notFoundErr) });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/projects/PJ-99999',
      cookies: { token },
      payload: { name: 'X' }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});
