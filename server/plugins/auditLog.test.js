import { describe, it, expect, vi } from 'vitest';
import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import fcookie from '@fastify/cookie';
import { auditLogPlugin } from './auditLog.js';
import { createAuditLogRepository } from '../repositories/auditLogRepository.js';

async function buildTestApp(auditLogRepo) {
  const app = Fastify({ logger: false });
  await app.register(fcookie);
  await app.register(fjwt, {
    secret: 'test-secret',
    cookie: { cookieName: 'token', signed: false }
  });
  app.decorate('authenticate', async (req, reply) => {
    try { await req.jwtVerify({ onlyCookie: true }); }
    catch { reply.code(401).send({ error: { message: '認証が必要です' } }); }
  });

  await app.register(auditLogPlugin, { auditLogRepository: auditLogRepo });

  app.post('/api/test-entity', {
    config: { entityType: 'testEntity' },
    preHandler: [app.authenticate]
  }, async (req, reply) => {
    reply.header('x-entity-id', 'ENT-001');
    return { id: 'ENT-001', created: true };
  });

  app.post('/api/test-fail', {
    config: { entityType: 'testEntity' },
    preHandler: [app.authenticate]
  }, async (req, reply) => {
    return reply.code(400).send({ error: { message: '検証エラー' } });
  });

  app.post('/api/auth/login-test', {
    config: { entityType: 'auth', action: 'LOGIN', actionOnFailure: 'LOGIN_FAILED' }
  }, async (req, reply) => {
    if (req.body?.valid) return { ok: true };
    return reply.code(401).send({ error: { message: '認証失敗' } });
  });

  app.post('/api/auth/logout-test', {
    config: { entityType: 'auth', action: 'LOGOUT' }
  }, async () => ({ message: 'ログアウト' }));

  app.patch('/api/test-entity/:id', {
    config: { entityType: 'testEntity' },
    preHandler: [app.authenticate]
  }, async (req, reply) => {
    reply.header('x-entity-id', req.params.id);
    return { id: req.params.id, updated: true };
  });

  app.delete('/api/test-entity/:id', {
    config: { entityType: 'testEntity' },
    preHandler: [app.authenticate]
  }, async (req, reply) => {
    reply.header('x-entity-id', req.params.id);
    return reply.code(204).send();
  });

  return app;
}

const makeToken = (app) => app.jwt.sign({ id: 'user-001', name: '田中 太郎', userType: '営業' });

describe('auditLogPlugin', () => {
  it('should record CREATE action when POST succeeds', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);
    const token = makeToken(app);

    // Act
    await app.inject({
      method: 'POST', url: '/api/test-entity',
      cookies: { token },
      payload: { name: 'テスト' }
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('CREATE');
    expect(logs[0].entityType).toBe('testEntity');
    expect(logs[0].userId).toBe('user-001');
    expect(logs[0].result).toBe('SUCCESS');
  });

  it('should record entityId from x-entity-id response header', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);

    // Act
    await app.inject({
      method: 'POST', url: '/api/test-entity',
      cookies: { token: makeToken(app) },
      payload: {}
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs[0].entityId).toBe('ENT-001');
  });

  it('should record FAILURE result when handler returns 4xx', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);

    // Act
    await app.inject({
      method: 'POST', url: '/api/test-fail',
      cookies: { token: makeToken(app) },
      payload: {}
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs).toHaveLength(1);
    expect(logs[0].result).toBe('FAILURE');
  });

  it('should not record audit log for GET requests', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);
    app.get('/api/test-get', { preHandler: [app.authenticate] }, async () => ({ ok: true }));

    // Act
    await app.inject({
      method: 'GET', url: '/api/test-get',
      cookies: { token: makeToken(app) }
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs).toHaveLength(0);
  });

  it('should record LOGIN action on successful login when config.action is set', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);

    // Act
    await app.inject({
      method: 'POST', url: '/api/auth/login-test',
      payload: { valid: true }
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('LOGIN');
    expect(logs[0].result).toBe('SUCCESS');
  });

  it('should record LOGIN_FAILED action when login fails', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);

    // Act
    await app.inject({
      method: 'POST', url: '/api/auth/login-test',
      payload: { valid: false }
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('LOGIN_FAILED');
    expect(logs[0].result).toBe('FAILURE');
  });

  it('should record LOGOUT action when config.action is LOGOUT', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);

    // Act
    await app.inject({ method: 'POST', url: '/api/auth/logout-test', payload: {} });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs[0].action).toBe('LOGOUT');
  });

  it('should record user info from JWT when authenticated', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);
    const token = app.jwt.sign({ id: 'user-002', name: '鈴木 花子', userType: '管理' });

    // Act
    await app.inject({
      method: 'POST', url: '/api/test-entity',
      cookies: { token },
      payload: {}
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs[0].userId).toBe('user-002');
    expect(logs[0].userName).toBe('鈴木 花子');
  });

  it('should record UPDATE action when PATCH request succeeds', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);
    const token = makeToken(app);

    // Act
    await app.inject({
      method: 'PATCH', url: '/api/test-entity/ENT-001',
      cookies: { token },
      payload: { name: '更新後' }
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('UPDATE');
    expect(logs[0].result).toBe('SUCCESS');
  });

  it('should record DELETE action when DELETE request succeeds', async () => {
    // Arrange
    const auditLogRepo = createAuditLogRepository([]);
    const app = await buildTestApp(auditLogRepo);
    const token = makeToken(app);

    // Act
    await app.inject({
      method: 'DELETE', url: '/api/test-entity/ENT-001',
      cookies: { token }
    });

    // Assert
    const logs = await auditLogRepo.findAll();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('DELETE');
  });

  it('should return 500 when auditLogRepository.save throws (ログ保存失敗の業務整合性確認)', async () => {
    // Arrange
    // onSendフックでawaitしているため、saveが失敗するとFastifyがエラーハンドリングに移り500を返す
    // 業務処理は実行済みだがHTTPレスポンスが変わる（整合性崩壊リスクの文書化）
    const failingRepo = { save: vi.fn().mockRejectedValue(new Error('DB write failed')) };
    const app = await buildTestApp(failingRepo);
    const token = makeToken(app);

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/test-entity',
      cookies: { token },
      payload: { name: 'テスト' }
    });

    // Assert
    expect(res.statusCode).toBe(500);
  });
});
