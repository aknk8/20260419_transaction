import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleDelivery = { code: 'DLV-00001', purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01', status: '検収待ち' };

const makeApp = async (serviceOverrides = {}) => {
  const mockDeliveryService = {
    listDeliveries: vi.fn().mockResolvedValue([sampleDelivery]),
    registerDelivery: vi.fn().mockResolvedValue(sampleDelivery),
    updateDelivery: vi.fn().mockResolvedValue({ ...sampleDelivery, status: '検収済' }),
    ...serviceOverrides
  };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({ userRepository: mockUserRepository, deliveryService: mockDeliveryService });
  return { app, mockDeliveryService };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

describe('GET /api/deliveries', () => {
  it('should return 200 with delivery list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/deliveries', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleDelivery]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/deliveries' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/deliveries', () => {
  it('should return 201 with created delivery', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/deliveries',
      cookies: { token: makeToken(app) },
      payload: { purchaseOrderCode: 'POD-00001', deliveryDate: '2026-05-01', notes: '' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('DLV-00001');
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/deliveries', payload: {} });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/deliveries/:code', () => {
  it('should return 200 with updated delivery', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PATCH', url: '/api/deliveries/DLV-00001',
      cookies: { token: makeToken(app) },
      payload: { status: '検収済' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('検収済');
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'PATCH', url: '/api/deliveries/DLV-00001', payload: {} });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});
