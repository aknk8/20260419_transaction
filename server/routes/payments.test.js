import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const samplePayment = { code: 'PMT-00001', title: 'テスト支払', status: '下書き' };

const makeApp = async (serviceOverrides = {}) => {
  const mockPaymentService = {
    listPayments: vi.fn().mockResolvedValue([samplePayment]),
    registerPayment: vi.fn().mockResolvedValue(samplePayment),
    getPaymentByCode: vi.fn().mockResolvedValue(samplePayment),
    submitPaymentApproval: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認依頼中' }),
    approvePayment: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認済み' }),
    rejectPayment: vi.fn().mockResolvedValue({ ...samplePayment, status: '却下' }),
    cancelPayment: vi.fn().mockResolvedValue({ ...samplePayment, status: 'キャンセル' }),
    registerPaymentResult: vi.fn().mockResolvedValue({ ...samplePayment, status: '支払済み' }),
    ...serviceOverrides
  };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({ userRepository: mockUserRepository, paymentService: mockPaymentService });
  return { app, mockPaymentService };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });
const makeApplyToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '一般ユーザ', permissions: ['approval:apply'] });
const makeActToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: 'システム管理者', permissions: ['approval:act'] });
const makePaymentEditToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: 'システム管理者', permissions: ['payment:edit'] });

describe('GET /api/payments/:code', () => {
  it('should return 200 with payment when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/payments/PMT-00001', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('PMT-00001');
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/payments/PMT-00001' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 404 when payment not found', async () => {
    // Arrange
    const err = Object.assign(new Error('支払依頼が見つかりません'), { statusCode: 404 });
    const { app } = await makeApp({ getPaymentByCode: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/payments/PMT-99999', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/payments/:code/submit-approval', () => {
  it('should return 200 with status 承認依頼中', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認依頼中');
  });

  it('should return 400 when status transition is invalid', async () => {
    // Arrange
    const err = Object.assign(new Error('下書き状態のみ'), { statusCode: 400 });
    const { app } = await makeApp({ submitPaymentApproval: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/payments/:code/reject', () => {
  it('should return 200 with status 却下', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/reject',
      cookies: { token: makeActToken(app) },
      payload: { reason: '予算超過' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('却下');
  });

  it('should return 400 when status transition is invalid', async () => {
    // Arrange
    const err = Object.assign(new Error('承認依頼中状態のみ'), { statusCode: 400 });
    const { app } = await makeApp({ rejectPayment: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/reject',
      cookies: { token: makeActToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/payments', () => {
  it('should return 200 with payment list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/payments', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([samplePayment]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/payments' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/payments', () => {
  it('should return 201 with created payment', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments',
      cookies: { token: makeToken(app) },
      payload: { supplierId: 'SUP-00001', title: 'テスト支払', paymentDate: '2026-05-31', amount: 5500 }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('PMT-00001');
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/payments', payload: {} });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/payments/:code/approve', () => {
  it('should return 200 with status 承認済み', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/approve',
      cookies: { token: makeActToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認済み');
  });

  it('should return 400 when status transition is invalid', async () => {
    // Arrange
    const err = Object.assign(new Error('承認依頼中状態のみ'), { statusCode: 400 });
    const { app } = await makeApp({ approvePayment: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/approve',
      cookies: { token: makeActToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/payments/:code/cancel', () => {
  it('should return 200 with status キャンセル', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/cancel',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('キャンセル');
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/payments/PMT-00001/cancel' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 400 when status transition is invalid', async () => {
    // Arrange
    const err = Object.assign(new Error('キャンセルできません'), { statusCode: 400 });
    const { app } = await makeApp({ cancelPayment: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/cancel',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/payments/:code/register', () => {
  it('should return 200 with status 支払済み', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/PMT-00001/register',
      cookies: { token: makePaymentEditToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('支払済み');
  });
});
