import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { buildApp } from '../app.js';

// bcrypt cost=1 for fast test hashing
const PASSWORD = 'correct-password';
const HASH = bcrypt.hashSync(PASSWORD, 1);

const validUser = {
  id: 'user01',
  name: '田中 太郎',
  userType: '営業',
  passwordHash: HASH,
  status: '有効'
};

const makeApp = async (userOverride = null) => {
  const mockUserRepository = {
    findByUsername: vi.fn().mockResolvedValue(userOverride),
    findById: vi.fn().mockResolvedValue(userOverride)
  };
  const app = await buildApp({ userRepository: mockUserRepository });
  return { app, mockUserRepository };
};

describe('POST /api/auth/login', () => {
  it('should return 200 when credentials are valid', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should set httpOnly cookie on valid login', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    const cookie = res.headers['set-cookie'];
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('should set SameSite=Strict on cookie', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.headers['set-cookie']).toMatch(/SameSite=Strict/i);
  });

  it('should return user id in response body', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.json().user.id).toBe('user01');
  });

  it('should return user name in response body', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.json().user.name).toBe('田中 太郎');
  });

  it('should not return passwordHash in response body', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.json().user?.passwordHash).toBeUndefined();
  });

  it('should return 401 when user not found', async () => {
    // Arrange
    const { app } = await makeApp(null);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'unknown', password: 'pass' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 when password is incorrect', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: 'wrong-password' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 400 when username is missing', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { password: PASSWORD }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 when password is missing', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01' }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  it('should return 200', async () => {
    // Arrange
    const { app } = await makeApp(null);

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/auth/logout' });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should clear the token cookie', async () => {
    // Arrange
    const { app } = await makeApp(validUser);
    // Login first to set cookie
    await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/auth/logout' });

    // Assert — cookie is cleared (Max-Age=0 or empty value)
    const cookie = res.headers['set-cookie'];
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/token=/);
  });
});

describe('GET /api/auth/me', () => {
  it('should return 200 with user payload when token is valid', async () => {
    // Arrange
    const { app } = await makeApp(validUser);
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return user id in /me response', async () => {
    // Arrange
    const { app } = await makeApp(validUser);
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: { token }
    });

    // Assert
    expect(res.json().user.id).toBe('user01');
  });

  it('should return 401 when no cookie is provided', async () => {
    // Arrange
    const { app } = await makeApp(null);

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me'
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 when cookie contains invalid token', async () => {
    // Arrange
    const { app } = await makeApp(null);

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: { token: 'invalid.token.value' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return userType in /me response', async () => {
    // Arrange
    const { app } = await makeApp(validUser);
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: { token }
    });

    // Assert
    expect(res.json().user.userType).toBe('営業');
  });
});
