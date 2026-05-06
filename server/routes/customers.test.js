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

const makeMasterEditToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: 'システム管理者', permissions: ['master:edit'] });

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
    expect(res.json().data).toEqual([sampleCustomer]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/customers' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return paginated response with data and meta fields', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/customers', cookies: { token } });

    // Assert
    const body = res.json();
    expect(body.data).toEqual([sampleCustomer]);
    expect(body.meta).toMatchObject({ total: 1, page: 1, pageSize: 20, totalPages: 1 });
  });

  it('should return empty data when page exceeds total pages', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/customers?page=2', cookies: { token } });

    // Assert
    const body = res.json();
    expect(body.data).toEqual([]);
    expect(body.meta.page).toBe(2);
    expect(body.meta.total).toBe(1);
  });

  it('should respect limit query parameter', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/customers?limit=1', cookies: { token } });

    // Assert
    const body = res.json();
    expect(body.meta.pageSize).toBe(1);
    expect(body.data).toHaveLength(1);
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
    const token = makeMasterEditToken(app);

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

  it('should pass closingDay, paymentSite and billingTo to registerCustomer when provided', async () => {
    // Arrange
    const { app, mockCustomerService } = await makeApp();
    const token = makeMasterEditToken(app);
    const payload = { name: '株式会社テスト', status: '有効', closingDay: '月末', paymentSite: '翌月末', billingTo: '本社' };

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/customers',
      cookies: { token },
      payload
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(mockCustomerService.registerCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ closingDay: '月末', paymentSite: '翌月末', billingTo: '本社' }),
      expect.anything()
    );
  });

  it('should return 400 when name is missing', async () => {
    // Arrange
    const validationErr = new Error('顧客名は必須です');
    validationErr.statusCode = 400;
    const { app } = await makeApp({
      registerCustomer: vi.fn().mockRejectedValue(validationErr)
    });
    const token = makeMasterEditToken(app);

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
    const token = makeMasterEditToken(app);

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

  it('should pass closingDay, paymentSite and billingTo to updateCustomer when provided', async () => {
    // Arrange
    const { app, mockCustomerService } = await makeApp();
    const token = makeMasterEditToken(app);
    const patch = { closingDay: '15日', paymentSite: '翌々月末', billingTo: '東京支社' };

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/customers/CUS-001',
      cookies: { token },
      payload: patch
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(mockCustomerService.updateCustomer).toHaveBeenCalledWith(
      'CUS-001',
      expect.objectContaining({ closingDay: '15日', paymentSite: '翌々月末', billingTo: '東京支社' }),
      expect.anything()
    );
  });

  it('should return 404 when updating non-existent customer', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({
      updateCustomer: vi.fn().mockRejectedValue(notFoundErr)
    });
    const token = makeMasterEditToken(app);

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
