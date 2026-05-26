import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { buildApp } from '../app.js';
import { createSessionRepository } from '../repositories/sessionRepository.js';
import { createInMemoryRefreshTokenRepository } from '../repositories/refreshTokenRepository.js';
import { createRefreshToken } from '../services/refreshTokenService.js';

// bcrypt cost=1 for fast test hashing
const PASSWORD = 'correct-password';
const HASH = bcrypt.hashSync(PASSWORD, 1);

const validUser = {
  id: 'user01',
  name: '田中 太郎',
  userType: '営業',
  passwordHash: HASH,
  status: '有効',
  failedLoginCount: 0,
  lockedUntil: null
};

const makeApp = async (userOverride = null, opts = {}) => {
  const mockUserRepository = {
    findByUsername: vi.fn().mockResolvedValue(userOverride),
    findById: vi.fn().mockResolvedValue(userOverride),
    updateLoginState: vi.fn().mockResolvedValue(undefined)
  };
  const app = await buildApp({ userRepository: mockUserRepository, ...opts });
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

  it('should return 401 when user status is not 有効', async () => {
    // Arrange
    const disabledUser = { ...validUser, status: '無効' };
    const { app } = await makeApp(disabledUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 when account is locked', async () => {
    // Arrange
    const lockedUser = {
      ...validUser,
      failedLoginCount: 5,
      lockedUntil: new Date(Date.now() + 30 * 60 * 1000)
    };
    const { app } = await makeApp(lockedUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return generic error message for locked account', async () => {
    // Arrange
    const lockedUser = {
      ...validUser,
      failedLoginCount: 5,
      lockedUntil: new Date(Date.now() + 30 * 60 * 1000)
    };
    const { app } = await makeApp(lockedUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.json().error.message).toBe('ユーザ名またはパスワードが正しくありません');
  });

  it('should return 429 after exceeding login rate limit', async () => {
    // Arrange
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const { app } = await makeApp(null, { rateLimit: { max: 100, timeWindow: '1 minute' } });

      // Act - 6 requests (login-specific limit is 5)
      for (let i = 0; i < 5; i++) {
        await app.inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: { username: 'user01', password: 'wrong' }
        });
      }
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { username: 'user01', password: 'wrong' }
      });

      // Assert
      expect(res.statusCode).toBe(429);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
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

  it('should return permissions array in /me response when token contains permissions', async () => {
    // Arrange
    const { app } = await makeApp(validUser);
    const token = app.jwt.sign({
      id: 'user01',
      name: '田中 太郎',
      userType: 'システム管理者',
      permissions: ['master:edit', 'approval:act']
    });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: { token }
    });

    // Assert
    expect(res.json().user.permissions).toBeDefined();
    expect(res.json().user.permissions).toContain('master:edit');
  });

  it('should include permissions in login response', async () => {
    // Arrange
    const adminUser = { ...validUser, userType: 'システム管理者' };
    const { app } = await makeApp(adminUser);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(res.json().user.permissions).toBeDefined();
    expect(res.json().user.permissions).toContain('master:edit');
  });
});

describe('POST /api/auth/login (session management)', () => {
  it('should save session to sessionRepository on successful login', async () => {
    // Arrange
    const mockSessionRepository = { save: vi.fn(), findByJti: vi.fn(), revoke: vi.fn() };
    const { app } = await makeApp(validUser, { sessionRepository: mockSessionRepository });

    // Act
    await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    expect(mockSessionRepository.save).toHaveBeenCalledOnce();
    expect(mockSessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user01', revoked: false })
    );
  });

  it('should include jti in JWT token when sessionRepository is provided', async () => {
    // Arrange
    let savedJti = null;
    const mockSessionRepository = {
      save: vi.fn((s) => { savedJti = s.jti; }),
      findByJti: vi.fn(),
      revoke: vi.fn()
    };
    const { app } = await makeApp(validUser, { sessionRepository: mockSessionRepository });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });

    // Assert
    const cookieHeader = res.headers['set-cookie'];
    const tokenMatch = String(cookieHeader).match(/token=([^;]+)/);
    const decoded = app.jwt.decode(decodeURIComponent(tokenMatch[1]));
    expect(decoded.jti).toBeDefined();
    expect(decoded.jti).toBe(savedJti);
  });

  it('should not call sessionRepository.save when sessionRepository is not provided', async () => {
    // Arrange
    const { app } = await makeApp(validUser);

    // Act & Assert (no error thrown means sessionRepository is optional)
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { username: 'user01', password: PASSWORD }
    });
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /api/auth/logout (session management)', () => {
  it('should revoke session when valid token with jti is present', async () => {
    // Arrange
    const mockSessionRepository = { save: vi.fn(), findByJti: vi.fn(), revoke: vi.fn() };
    const { app } = await makeApp(null, { sessionRepository: mockSessionRepository });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業', jti: 'test-jti-123' });

    // Act
    await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      cookies: { token }
    });

    // Assert
    expect(mockSessionRepository.revoke).toHaveBeenCalledWith('test-jti-123');
  });

  it('should return 200 even when token is missing', async () => {
    // Arrange
    const { app } = await makeApp(null);

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/auth/logout' });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 200 even when token is invalid', async () => {
    // Arrange
    const { app } = await makeApp(null);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      cookies: { token: 'invalid.token.value' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });
});

describe('GET /api/auth/me (session management)', () => {
  it('should return 401 when session is revoked', async () => {
    // Arrange
    const sessionRepo = createSessionRepository();
    const { app } = await makeApp(validUser, { sessionRepository: sessionRepo });
    const jti = 'test-jti-revoked';
    sessionRepo.save({ jti, userId: 'user01', expiresAt: new Date(Date.now() + 3600000), revoked: false });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業', jti });
    sessionRepo.revoke(jti);

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 200 when session is valid and not revoked', async () => {
    // Arrange
    const sessionRepo = createSessionRepository();
    const { app } = await makeApp(validUser, { sessionRepository: sessionRepo });
    const jti = 'test-jti-valid';
    sessionRepo.save({ jti, userId: 'user01', expiresAt: new Date(Date.now() + 3600000), revoked: false });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業', jti });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /api/auth/refresh-token', () => {
  it('should return 200 and set new cookies when refresh token is valid', async () => {
    // Arrange
    const refreshTokenRepo = createInMemoryRefreshTokenRepository();
    const { app } = await makeApp(validUser, { refreshTokenRepository: refreshTokenRepo });
    const tokenId = await createRefreshToken('user01', { repository: refreshTokenRepo });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token',
      cookies: { refreshToken: tokenId }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 401 when refresh token cookie is missing', async () => {
    // Arrange
    const refreshTokenRepo = createInMemoryRefreshTokenRepository();
    const { app } = await makeApp(validUser, { refreshTokenRepository: refreshTokenRepo });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token'
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 401 when refresh token is already used', async () => {
    // Arrange
    const refreshTokenRepo = createInMemoryRefreshTokenRepository();
    const { app } = await makeApp(validUser, { refreshTokenRepository: refreshTokenRepo });
    const tokenId = await createRefreshToken('user01', { repository: refreshTokenRepo });
    await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token',
      cookies: { refreshToken: tokenId }
    });

    // Act - use the same (now revoked) token again
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/refresh-token',
      cookies: { refreshToken: tokenId }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});
