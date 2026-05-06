import { describe, it, expect } from 'vitest';
import { buildApp } from '../app.js';

const ALLOWED_ORIGIN = 'http://localhost:3000';

const makeApp = async () => buildApp({ allowedOrigins: [ALLOWED_ORIGIN] });

describe('csrfPlugin', () => {
  it('should return 403 when POST with disallowed origin', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { origin: 'http://evil.example.com' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
    expect(res.json().error.message).toBe('CSRF: リクエスト元が許可されていません');
  });

  it('should allow POST when origin matches allowed origins', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { origin: ALLOWED_ORIGIN }
    });

    // Assert
    expect(res.statusCode).not.toBe(403);
  });

  it('should allow POST without origin header (same-origin request)', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout'
    });

    // Assert
    expect(res.statusCode).not.toBe(403);
  });

  it('should not block GET requests regardless of origin', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { origin: 'http://evil.example.com' }
    });

    // Assert — GET is not a mutating method
    expect(res.statusCode).not.toBe(403);
  });

  it('should return 403 when PUT with disallowed origin', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PUT',
      url: '/api/notifications/some-id/read',
      headers: { origin: 'http://evil.example.com' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 403 when PATCH with disallowed origin', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/deliveries/some-code',
      headers: { origin: 'http://evil.example.com' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 403 when DELETE with disallowed origin', async () => {
    // Arrange
    const app = await makeApp();

    // Act
    const res = await app.inject({
      method: 'DELETE',
      url: '/api/approval-routes/some-id',
      headers: { origin: 'http://evil.example.com' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should not apply CSRF check when allowedOrigins is not configured', async () => {
    // Arrange — no allowedOrigins → csrfPlugin not registered
    const app = await buildApp({});

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      headers: { origin: 'http://evil.example.com' }
    });

    // Assert — request proceeds normally (no CSRF block)
    expect(res.statusCode).not.toBe(403);
  });
});
