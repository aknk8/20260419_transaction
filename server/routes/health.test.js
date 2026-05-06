import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import healthRoutes from './health.js';

async function buildTestApp(db) {
  const app = Fastify({ logger: false });
  await app.register(healthRoutes, { db });
  await app.ready();
  return app;
}

describe('GET /api/health', () => {
  it('should return 200 with status ok when no db is configured', async () => {
    // Arrange
    const app = await buildTestApp(undefined);

    // Act
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
  });

  it('should return timestamp in ISO 8601 format', async () => {
    // Arrange
    const app = await buildTestApp(undefined);

    // Act
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    // Assert
    const { timestamp } = response.json();
    expect(typeof timestamp).toBe('string');
    expect(() => new Date(timestamp)).not.toThrow();
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('should return 200 when db check succeeds', async () => {
    // Arrange
    const db = { query: async () => [{ '?column?': 1 }] };
    const app = await buildTestApp(db);

    // Act
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
  });

  it('should return 503 when db check fails', async () => {
    // Arrange
    const db = { query: async () => { throw new Error('connection refused'); } };
    const app = await buildTestApp(db);

    // Act
    const response = await app.inject({ method: 'GET', url: '/api/health' });

    // Assert
    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ status: 'error' });
  });
});
