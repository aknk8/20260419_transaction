import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const publicUser = {
  id: 'user01',
  name: '田中 太郎',
  userType: '営業',
  department: '営業部',
  position: '担当者',
  status: '有効'
};

const makeApp = async (serviceOverrides = {}) => {
  const mockUserService = {
    listUsers: vi.fn().mockResolvedValue([publicUser]),
    getUserById: vi.fn().mockResolvedValue(publicUser),
    registerUser: vi.fn().mockResolvedValue(publicUser),
    updateUser: vi.fn().mockResolvedValue(publicUser),
    ...serviceOverrides
  };
  const mockUserRepository = {
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null)
  };
  const app = await buildApp({ userRepository: mockUserRepository, userService: mockUserService });
  return { app, mockUserService };
};

describe('GET /api/users', () => {
  it('should return 200 with user list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'admin', name: '管理者', userType: 'システム管理者' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/users',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([publicUser]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/users' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('should return 200 with user when id exists', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'admin', name: '管理者', userType: 'システム管理者' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/users/user01',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().id).toBe('user01');
  });

  it('should return 404 when user does not exist', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({ getUserById: vi.fn().mockRejectedValue(notFoundErr) });
    const token = app.jwt.sign({ id: 'admin', name: '管理者', userType: 'システム管理者' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/users/unknown',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/users', () => {
  it('should return 201 with created user', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'admin', name: '管理者', userType: 'システム管理者' });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/users',
      cookies: { token },
      payload: { id: 'user01', name: '田中 太郎', password: 'pass', userType: '営業', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().id).toBe('user01');
  });

  it('should return 400 when validation fails', async () => {
    // Arrange
    const validationErr = new Error('ユーザIDは必須です');
    validationErr.statusCode = 400;
    const { app } = await makeApp({ registerUser: vi.fn().mockRejectedValue(validationErr) });
    const token = app.jwt.sign({ id: 'admin', name: '管理者', userType: 'システム管理者' });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/users',
      cookies: { token },
      payload: { name: '田中', password: 'pass', userType: '営業' }
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
      url: '/api/users',
      payload: { id: 'user01', name: '田中', password: 'pass', userType: '営業' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/users/:id', () => {
  it('should return 200 with updated user', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'admin', name: '管理者', userType: 'システム管理者' });

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/users/user01',
      cookies: { token },
      payload: { name: '変更後 太郎' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 when updating non-existent user', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({ updateUser: vi.fn().mockRejectedValue(notFoundErr) });
    const token = app.jwt.sign({ id: 'admin', name: '管理者', userType: 'システム管理者' });

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/users/unknown',
      cookies: { token },
      payload: { name: 'X' }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});
