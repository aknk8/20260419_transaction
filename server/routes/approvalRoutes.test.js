import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleRoute = { id: 1, documentType: 'quotation', stepNumber: 1, approverUserId: 'user01', isActive: true };

const makeApp = async (repoOverrides = {}) => {
  const mockApprovalRouteRepository = {
    findAll: vi.fn().mockResolvedValue([sampleRoute]),
    findById: vi.fn().mockResolvedValue(sampleRoute),
    save: vi.fn().mockResolvedValue(sampleRoute),
    update: vi.fn().mockResolvedValue(sampleRoute),
    remove: vi.fn().mockResolvedValue(),
    ...repoOverrides
  };
  const mockUserRepository = {
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null)
  };
  const app = await buildApp({ userRepository: mockUserRepository, approvalRouteRepository: mockApprovalRouteRepository });
  return { app, mockApprovalRouteRepository };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '管理部長' });
const makeAdminToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: 'システム管理者', permissions: ['user-permission:edit'] });

describe('GET /api/approval-routes', () => {
  it('should return 200 with route list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/approval-routes', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleRoute]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/approval-routes' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/approval-routes/:id', () => {
  it('should return 200 with route when id exists', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/approval-routes/1', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe(1);
  });

  it('should return 404 when id does not exist', async () => {
    // Arrange
    const { app } = await makeApp({ findById: vi.fn().mockResolvedValue(null) });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/approval-routes/99', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/approval-routes', () => {
  it('should return 201 with created route', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approval-routes',
      cookies: { token: makeAdminToken(app) },
      payload: { documentType: 'quotation', stepNumber: 1, approverUserId: 'user01' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().id).toBe(1);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/approval-routes', payload: {} });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/approval-routes/:id', () => {
  it('should return 200 with updated route', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PATCH', url: '/api/approval-routes/1',
      cookies: { token: makeAdminToken(app) },
      payload: { isActive: false }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 when id does not exist', async () => {
    // Arrange
    const { app } = await makeApp({ update: vi.fn().mockResolvedValue(null) });

    // Act
    const res = await app.inject({
      method: 'PATCH', url: '/api/approval-routes/99',
      cookies: { token: makeAdminToken(app) },
      payload: { isActive: false }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /api/approval-routes/:id', () => {
  it('should return 204 when deleted', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'DELETE', url: '/api/approval-routes/1',
      cookies: { token: makeAdminToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(204);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'DELETE', url: '/api/approval-routes/1' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});
