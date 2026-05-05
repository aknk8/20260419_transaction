import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleProduct = {
  code: 'PRD-001',
  name: 'テスト商品A',
  unit: '個',
  unitPrice: 1000,
  tax: 10,
  status: '有効'
};

const makeApp = async (serviceOverrides = {}) => {
  const mockProductService = {
    listProducts: vi.fn().mockResolvedValue([sampleProduct]),
    getProductByCode: vi.fn().mockResolvedValue(sampleProduct),
    registerProduct: vi.fn().mockResolvedValue(sampleProduct),
    updateProduct: vi.fn().mockResolvedValue(sampleProduct),
    ...serviceOverrides
  };
  const mockUserRepository = {
    findByUsername: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null)
  };
  const app = await buildApp({ userRepository: mockUserRepository, productService: mockProductService });
  return { app, mockProductService };
};

describe('GET /api/products', () => {
  it('should return 200 with product list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/products',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleProduct]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/products' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/products/:code', () => {
  it('should return 200 with product when code exists', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/products/PRD-001',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('PRD-001');
  });

  it('should return 404 when product does not exist', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({ getProductByCode: vi.fn().mockRejectedValue(notFoundErr) });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/products/PRD-999',
      cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/products', () => {
  it('should return 201 with created product', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
      cookies: { token },
      payload: { name: 'テスト商品A', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('PRD-001');
  });

  it('should return 400 when name is missing', async () => {
    // Arrange
    const validationErr = new Error('商品名は必須です');
    validationErr.statusCode = 400;
    const { app } = await makeApp({ registerProduct: vi.fn().mockRejectedValue(validationErr) });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'POST',
      url: '/api/products',
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
      url: '/api/products',
      payload: { name: 'テスト商品A', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/products/:code', () => {
  it('should return 200 with updated product', async () => {
    // Arrange
    const { app } = await makeApp();
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/products/PRD-001',
      cookies: { token },
      payload: { name: '変更後商品' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 404 when updating non-existent product', async () => {
    // Arrange
    const notFoundErr = new Error('Not found');
    notFoundErr.statusCode = 404;
    const { app } = await makeApp({ updateProduct: vi.fn().mockRejectedValue(notFoundErr) });
    const token = app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

    // Act
    const res = await app.inject({
      method: 'PATCH',
      url: '/api/products/PRD-999',
      cookies: { token },
      payload: { name: 'X' }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});
