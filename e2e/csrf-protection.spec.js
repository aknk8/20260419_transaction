import { test, expect } from './fixtures.js';

const BACKEND_URL = 'http://localhost:3000';

test.describe('csrfPlugin (E2E)', () => {
  test('should return 403 when POST request has disallowed origin', async ({ request }) => {
    // Arrange
    // Act
    const res = await request.post(`${BACKEND_URL}/api/auth/logout`, {
      headers: { origin: 'http://evil.example.com' },
    });

    // Assert
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error.message).toBe('CSRF: リクエスト元が許可されていません');
  });

  test('should allow POST request when origin matches CORS_ORIGIN', async ({ request }) => {
    // Arrange — default CORS_ORIGIN is http://localhost:5173
    // Act
    const res = await request.post(`${BACKEND_URL}/api/auth/logout`, {
      headers: { origin: 'http://localhost:5173' },
    });

    // Assert — not 403 (may be 401 for unauthenticated, but not CSRF-blocked)
    expect(res.status()).not.toBe(403);
  });

  test('should allow POST request without origin header (same-origin flow)', async ({ request }) => {
    // Arrange — no Origin header simulates same-origin requests in production
    // Act
    const res = await request.post(`${BACKEND_URL}/api/auth/logout`);

    // Assert
    expect(res.status()).not.toBe(403);
  });

  test('should not block GET request even with disallowed origin', async ({ request }) => {
    // Arrange
    // Act
    const res = await request.get(`${BACKEND_URL}/api/auth/me`, {
      headers: { origin: 'http://evil.example.com' },
    });

    // Assert — GET is not a mutating method, CSRF does not apply
    expect(res.status()).not.toBe(403);
  });
});
