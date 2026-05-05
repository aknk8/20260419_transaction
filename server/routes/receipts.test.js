import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleReceipt = { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: '5500.00', status: '未消込' };

const makeApp = async (serviceOverrides = {}) => {
  const mockReceiptService = {
    listReceipts: vi.fn().mockResolvedValue([sampleReceipt]),
    registerReceipt: vi.fn().mockResolvedValue(sampleReceipt),
    ...serviceOverrides
  };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({ userRepository: mockUserRepository, receiptService: mockReceiptService });
  return { app, mockReceiptService };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

describe('GET /api/receipts', () => {
  it('should return 200 with receipt list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/receipts', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleReceipt]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/receipts' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/receipts', () => {
  it('should return 201 with created receipt', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/receipts',
      cookies: { token: makeToken(app) },
      payload: { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 5500 }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('RCP-00001');
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/receipts', payload: {} });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});
