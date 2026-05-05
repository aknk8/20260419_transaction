import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';

const sampleCustomer = {
  code: 'CUS-001',
  name: '株式会社テスト',
  department: '購買部',
  contact: '田中 太郎',
  closingDay: '月末',
  paymentSite: '翌月末',
  billingTo: '本社',
  status: '有効'
};

const makeApp = async (serviceOverrides = {}) => {
  const mockCustomerService = {
    listCustomers: vi.fn().mockResolvedValue([sampleCustomer]),
    getCustomerByCode: vi.fn().mockResolvedValue(sampleCustomer),
    registerCustomer: vi.fn().mockResolvedValue(sampleCustomer),
    updateCustomer: vi.fn().mockResolvedValue(sampleCustomer),
    ...serviceOverrides
  };
  const mockUserRepository = {
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null)
  };
  const app = await buildApp({ userRepository: mockUserRepository, customerService: mockCustomerService });
  return { app, mockCustomerService };
};

const makeAuthToken = async () => {
  const { app } = await makeApp();
  return app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });
};

describe('GET /api/customers', () => {
  it('should return 200 with customer list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/customers',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleCustomer]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/customers' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/customers/:code', () => {
  it('should return 200 with customer when code exists', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/customers/CUS-001',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('CUS-001');
  });

  it('should return 404 when customer does not exist', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({
      getCustomerByCode: vi.fn().mockRejectedValue(notFoundErr)
    });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/customers/CUS-999',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/customers', () => {
  it('should return 201 with created customer', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/customers',
      cookies: { token },
      payload: { name: '株式会社テスト', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('CUS-001');
  });

  it('should return 400 when name is missing', async () => {
    // Arrange
    const validationErr = new Error('顧客名は必須です');
    validationErr.statusCode = 400;
    const { app } = await makeApp({
      registerCustomer: vi.fn().mockRejectedValue(validationErr)
    });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/customers',
      cookies: { token },
      payload: { status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/customers',
      payload: { name: '株式会社テスト', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/customers/:code', () => {
  it('should return 200 with updated customer', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/customers/CUS-001',
      cookies: { token },
      payload: { name: '変更後株式会社' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 when updating non-existent customer', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({
      updateCustomer: vi.fn().mockRejectedValue(notFoundErr)
    });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/customers/CUS-999',
      cookies: { token },
      payload: { name: 'X' }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});
