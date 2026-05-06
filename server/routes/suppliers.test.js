import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleSupplier = {
  code: 'SUP-001',
  name: '株式会社テスト仕入先',
  contact: '山田 次郎',
  paymentSite: '翌月末',
  status: '有効'
};

const makeApp = async (serviceOverrides = {}) => {
  const mockSupplierService = {
    listSuppliers: vi.fn().mockResolvedValue([sampleSupplier]),
    getSupplierByCode: vi.fn().mockResolvedValue(sampleSupplier),
    registerSupplier: vi.fn().mockResolvedValue(sampleSupplier),
    updateSupplier: vi.fn().mockResolvedValue(sampleSupplier),
    ...serviceOverrides
  };
  const mockUserRepository = {
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null)
  };
  const app = await buildApp({ userRepository: mockUserRepository, supplierService: mockSupplierService });
  return { app, mockSupplierService };
};

const makeMasterEditToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: 'システム管理者', permissions: ['master:edit'] });

describe('GET /api/suppliers', () => {
  it('should return 200 with supplier list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/suppliers',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleSupplier]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/suppliers' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/suppliers/:code', () => {
  it('should return 200 with supplier when code exists', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/suppliers/SUP-001',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('SUP-001');
  });

  it('should return 404 when supplier does not exist', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({ getSupplierByCode: vi.fn().mockRejectedValue(notFoundErr) });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/suppliers/SUP-999',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/suppliers', () => {
  it('should return 201 with created supplier', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = makeMasterEditToken(app);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/suppliers',
      cookies: { token },
      payload: { name: '株式会社テスト仕入先', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('SUP-001');
  });

  it('should return 400 when name is missing', async () => {
    // Arrange
    const validationErr = new Error('仕入先名は必須です');
    validationErr.statusCode = 400;
    const { app } = await makeApp({ registerSupplier: vi.fn().mockRejectedValue(validationErr) });
    const token = makeMasterEditToken(app);

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/suppliers',
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
      url: '/api/suppliers',
      payload: { name: '株式会社テスト仕入先', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/suppliers/:code', () => {
  it('should return 200 with updated supplier', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = makeMasterEditToken(app);

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/suppliers/SUP-001',
      cookies: { token },
      payload: { name: '変更後仕入先' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 when updating non-existent supplier', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({ updateSupplier: vi.fn().mockRejectedValue(notFoundErr) });
    const token = makeMasterEditToken(app);

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/suppliers/SUP-999',
      cookies: { token },
      payload: { name: 'X' }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});
