import { describe, it, expect, vi } from 'vitest';
import {
  listProducts,
  getProductByCode,
  registerProduct,
  updateProduct
} from './productService.js';

const sampleProduct = {
  code: 'PRD-001',
  name: 'テスト商品A',
  unit: '個',
  unitPrice: 1000,
  tax: 10,
  status: '有効'
};

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleProduct]),
  findByCode: vi.fn().mockResolvedValue(sampleProduct),
  findAllCodes: vi.fn().mockResolvedValue(['PRD-001']),
  save: vi.fn().mockResolvedValue(sampleProduct),
  update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleProduct, ...data })),
  ...overrides
});

describe('listProducts', () => {
  it('should return all products from repository', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listProducts({ repository });

    // Assert
    expect(result).toEqual([sampleProduct]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('getProductByCode', () => {
  it('should return product when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getProductByCode('PRD-001', { repository });

    // Assert
    expect(result).toEqual(sampleProduct);
    expect(repository.findByCode).toHaveBeenCalledWith('PRD-001');
  });

  it('should throw 404 error when code does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getProductByCode('PRD-999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerProduct', () => {
  it('should generate code from existing codes and save product', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue(['PRD-001']),
      save: vi.fn().mockImplementation(async (p) => p)
    });
    const formData = { name: '新規商品B', unit: '箱', unitPrice: 5000, tax: 10, status: '有効' };

    // Act
    const result = await registerProduct(formData, { repository });

    // Assert
    expect(result.code).toBe('PRD-002');
    expect(result.name).toBe('新規商品B');
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('should assign PRD-001 when no products exist', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockImplementation(async (p) => p)
    });

    // Act
    const result = await registerProduct({ name: 'テスト商品', status: '有効' }, { repository });

    // Assert
    expect(result.code).toBe('PRD-001');
  });

  it('should throw validation error when name is missing', async () => {
    // Arrange
    const repository = makeRepo();

    // Act & Assert
    await expect(registerProduct({ status: '有効' }, { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('updateProduct', () => {
  it('should update and return the modified product', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleProduct, ...data }))
    });

    // Act
    const result = await updateProduct('PRD-001', { name: '変更後商品' }, { repository });

    // Assert
    expect(result.name).toBe('変更後商品');
    expect(repository.findByCode).toHaveBeenCalledWith('PRD-001');
    expect(repository.update).toHaveBeenCalledWith('PRD-001', { name: '変更後商品' });
  });

  it('should throw 404 error when updating non-existent product', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(updateProduct('PRD-999', { name: 'X' }, { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
