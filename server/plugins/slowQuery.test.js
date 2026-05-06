import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import { slowQueryPlugin } from './slowQuery.js';

async function buildTestApp(thresholdMs) {
  const app = Fastify({ logger: false });
  await app.register(slowQueryPlugin, { thresholdMs });
  app.get('/test', async () => ({ ok: true }));
  await app.ready();
  return app;
}

describe('slowQueryPlugin', () => {
  it('should log warn when response time exceeds threshold', async () => {
    // Arrange: threshold=0 なのでどんなリクエストも「遅い」と判定される
    const app = await buildTestApp(0);
    const warnSpy = vi.spyOn(app.log, 'warn');

    // Act
    await app.inject({ method: 'GET', url: '/test' });

    // Assert
    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      'slow request detected'
    );
  });

  it('should not log warn when response time is within threshold', async () => {
    // Arrange: threshold=Infinity なのでどんなリクエストも「速い」と判定される
    const app = await buildTestApp(Infinity);
    const warnSpy = vi.spyOn(app.log, 'warn');

    // Act
    await app.inject({ method: 'GET', url: '/test' });

    // Assert
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should include method, url, and responseTime in warn log', async () => {
    // Arrange
    const app = await buildTestApp(0);
    const warnSpy = vi.spyOn(app.log, 'warn');

    // Act
    await app.inject({ method: 'GET', url: '/test' });

    // Assert
    const logArg = warnSpy.mock.calls[0][0];
    expect(logArg).toHaveProperty('method', 'GET');
    expect(logArg).toHaveProperty('url', '/test');
    expect(logArg).toHaveProperty('responseTime');
    expect(typeof logArg.responseTime).toBe('number');
  });
});
