import { describe, it, expect } from 'vitest';
import { buildApp } from '../app.js';

const makeApp = async (opts = {}) => {
  const mockUserRepository = {
    findByUsername: async () => null,
    findById: async () => null
  };
  return buildApp({ userRepository: mockUserRepository, ...opts });
};

describe('Security headers (@fastify/helmet)', () => {
  it('should include X-Content-Type-Options: nosniff in responses', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });

    // Assert
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include X-Frame-Options header in responses', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });

    // Assert
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('should include Content-Security-Policy header in responses', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });

    // Assert
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('should set default-src to self in CSP header', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });

    // Assert
    expect(res.headers['content-security-policy']).toMatch(/default-src 'self'/);
  });

  it('should set object-src to none in CSP header', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });

    // Assert
    expect(res.headers['content-security-policy']).toMatch(/object-src 'none'/);
  });
});

describe('CORS (@fastify/cors)', () => {
  it('should allow requests from configured origin', async () => {
    // Arrange
    const app = await makeApp({ corsOrigin: 'http://localhost:5173' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { origin: 'http://localhost:5173' }
    });

    // Assert
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('should reject requests from non-configured origins', async () => {
    // Arrange
    const app = await makeApp({ corsOrigin: 'http://localhost:5173' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { origin: 'http://evil.example.com' }
    });

    // Assert
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('should respond to OPTIONS preflight with 204', async () => {
    // Arrange
    const app = await makeApp({ corsOrigin: 'http://localhost:5173' });

    // Act
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/api/customers',
      headers: {
        origin: 'http://localhost:5173',
        'access-control-request-method': 'POST'
      }
    });

    // Assert
    expect(res.statusCode).toBe(204);
  });
});

describe('Rate limit (@fastify/rate-limit)', () => {
  it('should allow requests within rate limit', async () => {
    // Arrange
    const app = await makeApp({ rateLimit: { max: 5, timeWindow: '1 minute' } });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });

    // Assert
    expect(res.statusCode).not.toBe(429);
  });

  it('should block requests exceeding rate limit', async () => {
    // Arrange
    const app = await makeApp({ rateLimit: { max: 2, timeWindow: '1 minute' } });

    // Act – exhaust limit then check
    await app.inject({ method: 'GET', url: '/api/auth/me' });
    await app.inject({ method: 'GET', url: '/api/auth/me' });
    const res = await app.inject({ method: 'GET', url: '/api/auth/me' });

    // Assert
    expect(res.statusCode).toBe(429);
  });
});

describe('CSRF protection (Origin validation)', () => {
  it('should allow POST from configured allowed origin', async () => {
    // Arrange
    const app = await makeApp({ allowedOrigins: ['http://localhost:3000'] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/auth/login',
      headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
      payload: { username: 'admin', password: 'wrongpass' }
    });

    // Assert – 401 (wrong credentials) not 403 (CSRF blocked)
    expect(res.statusCode).toBe(401);
  });

  it('should return 403 for POST from disallowed origin', async () => {
    // Arrange
    const app = await makeApp({ allowedOrigins: ['http://localhost:3000'] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/auth/login',
      headers: { origin: 'http://evil.example.com', 'content-type': 'application/json' },
      payload: { username: 'admin', password: 'pass' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should allow POST without Origin header (server-to-server / same-origin)', async () => {
    // Arrange
    const app = await makeApp({ allowedOrigins: ['http://localhost:3000'] });

    // Act – app.inject does not set Origin (simulates same-origin or server call)
    const res = await app.inject({
      method: 'POST', url: '/api/auth/login',
      headers: { 'content-type': 'application/json' },
      payload: { username: 'admin', password: 'wrongpass' }
    });

    // Assert – 401 not 403
    expect(res.statusCode).toBe(401);
  });

  it('should allow GET requests regardless of origin', async () => {
    // Arrange
    const app = await makeApp({ allowedOrigins: ['http://localhost:3000'] });

    // Act
    const res = await app.inject({
      method: 'GET', url: '/api/auth/me',
      headers: { origin: 'http://evil.example.com' }
    });

    // Assert – GET is not a state-changing request, CSRF check is skipped
    expect(res.statusCode).not.toBe(403);
  });

  it('should not enforce CSRF when allowedOrigins is not configured', async () => {
    // Arrange
    const app = await makeApp(); // no allowedOrigins

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/auth/login',
      headers: { origin: 'http://any-origin.example.com', 'content-type': 'application/json' },
      payload: { username: 'admin', password: 'wrongpass' }
    });

    // Assert – 401 not 403 (CSRF not active)
    expect(res.statusCode).toBe(401);
  });
});
