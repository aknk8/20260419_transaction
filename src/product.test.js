import { describe, it, expect } from 'vitest';
import {
  generateProductCode,
  createProduct,
  findProductByCode
} from './product.js';

describe('generateProductCode', () => {
  it('should return PRD-001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];
    // Act
    const result = generateProductCode(existingCodes);
    // Assert
    expect(result).toBe('PRD-001');
  });

  it('should return next sequential code after consecutive existing codes', () => {
    // Arrange
    const existingCodes = ['PRD-001', 'PRD-002', 'PRD-003'];
    // Act
    const result = generateProductCode(existingCodes);
    // Assert
    expect(result).toBe('PRD-004');
  });

  it('should return next code after the highest existing code when there are gaps', () => {
    // Arrange
    const existingCodes = ['PRD-001', 'PRD-005'];
    // Act
    const result = generateProductCode(existingCodes);
    // Assert
    expect(result).toBe('PRD-006');
  });

  it('should ignore codes with non-matching format', () => {
    // Arrange
    const existingCodes = ['INVALID', 'PRD-003'];
    // Act
    const result = generateProductCode(existingCodes);
    // Assert
    expect(result).toBe('PRD-004');
  });
});

describe('createProduct', () => {
  it('should return product object with all fields from formData', () => {
    // Arrange
    const formData = {
      code: 'PRD-001',
      name: 'サーバー保守サービス',
      unit: '月',
      unitPrice: '50000',
      tax: '課税',
      status: '有効'
    };
    // Act
    const result = createProduct(formData);
    // Assert
    expect(result).toEqual({
      code: 'PRD-001',
      name: 'サーバー保守サービス',
      unit: '月',
      unitPrice: '50000',
      tax: '課税',
      status: '有効'
    });
  });

  it('should preserve unitPrice as string from formData', () => {
    // Arrange
    const formData = {
      code: 'PRD-002',
      name: 'テスト商品',
      unit: '個',
      unitPrice: '1200',
      tax: '課税',
      status: '有効'
    };
    // Act
    const result = createProduct(formData);
    // Assert
    expect(result.unitPrice).toBe('1200');
  });
});

describe('findProductByCode', () => {
  it('should return product when code exists in products', () => {
    // Arrange
    const products = [
      { code: 'PRD-001', name: 'サーバー保守サービス' },
      { code: 'PRD-002', name: 'ネットワーク機器' }
    ];
    // Act
    const result = findProductByCode(products, 'PRD-001');
    // Assert
    expect(result).toEqual({ code: 'PRD-001', name: 'サーバー保守サービス' });
  });

  it('should return null when code does not exist in products', () => {
    // Arrange
    const products = [{ code: 'PRD-001', name: 'サーバー保守サービス' }];
    // Act
    const result = findProductByCode(products, 'PRD-999');
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when products array is empty', () => {
    // Arrange
    const products = [];
    // Act
    const result = findProductByCode(products, 'PRD-001');
    // Assert
    expect(result).toBeNull();
  });
});
