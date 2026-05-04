import { describe, it, expect } from 'vitest';
import {
  generateCode,
  generateCustomerCode,
  generateSupplierCode,
  createCustomer,
  createSupplier,
  findCustomerByCode,
  findSupplierByCode,
  filterCustomersByName
} from './customer.js';

describe('generateCustomerCode', () => {
  it('should return CUS-001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];
    // Act
    const result = generateCustomerCode(existingCodes);
    // Assert
    expect(result).toBe('CUS-001');
  });

  it('should return next sequential code after consecutive existing codes', () => {
    // Arrange
    const existingCodes = ['CUS-001', 'CUS-002', 'CUS-003'];
    // Act
    const result = generateCustomerCode(existingCodes);
    // Assert
    expect(result).toBe('CUS-004');
  });

  it('should return next code after the highest existing code when there are gaps', () => {
    // Arrange
    const existingCodes = ['CUS-001', 'CUS-005'];
    // Act
    const result = generateCustomerCode(existingCodes);
    // Assert
    expect(result).toBe('CUS-006');
  });

  it('should pad the number to at least 3 digits', () => {
    // Arrange
    const existingCodes = ['CUS-009'];
    // Act
    const result = generateCustomerCode(existingCodes);
    // Assert
    expect(result).toBe('CUS-010');
  });

  it('should ignore codes with non-matching format', () => {
    // Arrange
    const existingCodes = ['INVALID', 'CUS-003'];
    // Act
    const result = generateCustomerCode(existingCodes);
    // Assert
    expect(result).toBe('CUS-004');
  });
});

describe('createCustomer', () => {
  it('should return customer object with all fields from formData', () => {
    // Arrange
    const formData = {
      code: 'CUS-010',
      name: 'テスト株式会社',
      department: '営業部門',
      contact: '山田 太郎',
      closingDay: '末日',
      paymentSite: '翌月末',
      billingTo: '本社',
      status: '有効'
    };
    // Act
    const result = createCustomer(formData);
    // Assert
    expect(result).toEqual({
      code: 'CUS-010',
      name: 'テスト株式会社',
      department: '営業部門',
      contact: '山田 太郎',
      closingDay: '末日',
      paymentSite: '翌月末',
      billingTo: '本社',
      status: '有効'
    });
  });

  it('should allow empty optional fields', () => {
    // Arrange
    const formData = {
      code: 'CUS-011',
      name: '株式会社サンプル',
      department: '営業部門',
      contact: '',
      closingDay: '末日',
      paymentSite: '翌月末',
      billingTo: '',
      status: '有効'
    };
    // Act
    const result = createCustomer(formData);
    // Assert
    expect(result.contact).toBe('');
    expect(result.billingTo).toBe('');
  });
});

describe('findCustomerByCode', () => {
  it('should return customer when code exists in customers', () => {
    // Arrange
    const customers = [
      { code: 'CUS-001', name: '株式会社テスト' },
      { code: 'CUS-002', name: 'サンプル株式会社' }
    ];
    // Act
    const result = findCustomerByCode(customers, 'CUS-001');
    // Assert
    expect(result).toEqual({ code: 'CUS-001', name: '株式会社テスト' });
  });

  it('should return null when code does not exist in customers', () => {
    // Arrange
    const customers = [{ code: 'CUS-001', name: '株式会社テスト' }];
    // Act
    const result = findCustomerByCode(customers, 'CUS-999');
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when customers array is empty', () => {
    // Arrange
    const customers = [];
    // Act
    const result = findCustomerByCode(customers, 'CUS-001');
    // Assert
    expect(result).toBeNull();
  });
});

describe('generateCode', () => {
  it('should return prefix-001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];
    // Act
    const result = generateCode('SUP', existingCodes);
    // Assert
    expect(result).toBe('SUP-001');
  });

  it('should return next sequential code after consecutive existing codes', () => {
    // Arrange
    const existingCodes = ['SUP-001', 'SUP-002', 'SUP-003'];
    // Act
    const result = generateCode('SUP', existingCodes);
    // Assert
    expect(result).toBe('SUP-004');
  });

  it('should return next code after the highest existing code when there are gaps', () => {
    // Arrange
    const existingCodes = ['SUP-001', 'SUP-005'];
    // Act
    const result = generateCode('SUP', existingCodes);
    // Assert
    expect(result).toBe('SUP-006');
  });

  it('should work with CUS prefix as well', () => {
    // Arrange
    const existingCodes = ['CUS-007'];
    // Act
    const result = generateCode('CUS', existingCodes);
    // Assert
    expect(result).toBe('CUS-008');
  });

  it('should ignore codes with non-matching prefix', () => {
    // Arrange
    const existingCodes = ['CUS-003', 'SUP-002'];
    // Act
    const result = generateCode('SUP', existingCodes);
    // Assert
    expect(result).toBe('SUP-003');
  });
});

describe('generateSupplierCode', () => {
  it('should return SUP-001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];
    // Act
    const result = generateSupplierCode(existingCodes);
    // Assert
    expect(result).toBe('SUP-001');
  });

  it('should return next sequential code after consecutive existing codes', () => {
    // Arrange
    const existingCodes = ['SUP-001', 'SUP-002'];
    // Act
    const result = generateSupplierCode(existingCodes);
    // Assert
    expect(result).toBe('SUP-003');
  });
});

describe('createSupplier', () => {
  it('should return supplier object with all fields from formData', () => {
    // Arrange
    const formData = {
      code: 'SUP-001',
      name: 'テスト仕入先株式会社',
      contact: '鈴木 一郎',
      paymentSite: '翌月末',
      status: '有効'
    };
    // Act
    const result = createSupplier(formData);
    // Assert
    expect(result).toEqual({
      code: 'SUP-001',
      name: 'テスト仕入先株式会社',
      contact: '鈴木 一郎',
      paymentSite: '翌月末',
      status: '有効'
    });
  });

  it('should allow empty optional fields', () => {
    // Arrange
    const formData = {
      code: 'SUP-002',
      name: '株式会社サンプル仕入先',
      contact: '',
      paymentSite: '翌月末',
      status: '有効'
    };
    // Act
    const result = createSupplier(formData);
    // Assert
    expect(result.contact).toBe('');
  });
});

describe('findSupplierByCode', () => {
  it('should return supplier when code exists in suppliers', () => {
    // Arrange
    const suppliers = [
      { code: 'SUP-001', name: '株式会社テスト仕入先' },
      { code: 'SUP-002', name: 'サンプル仕入先株式会社' }
    ];
    // Act
    const result = findSupplierByCode(suppliers, 'SUP-001');
    // Assert
    expect(result).toEqual({ code: 'SUP-001', name: '株式会社テスト仕入先' });
  });

  it('should return null when code does not exist in suppliers', () => {
    // Arrange
    const suppliers = [{ code: 'SUP-001', name: '株式会社テスト仕入先' }];
    // Act
    const result = findSupplierByCode(suppliers, 'SUP-999');
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when suppliers array is empty', () => {
    // Arrange
    const suppliers = [];
    // Act
    const result = findSupplierByCode(suppliers, 'SUP-001');
    // Assert
    expect(result).toBeNull();
  });
});

describe('filterCustomersByName', () => {
  const sampleCustomers = [
    { code: 'CUS-001', name: '株式会社青葉システム' },
    { code: 'CUS-002', name: '東都ネットワーク株式会社' },
    { code: 'CUS-003', name: 'みなと物流サービス株式会社' }
  ];

  it('should return all customers when keyword is empty string', () => {
    // Arrange
    const keyword = '';
    // Act
    const result = filterCustomersByName(sampleCustomers, keyword);
    // Assert
    expect(result).toHaveLength(3);
  });

  it('should return all customers when keyword is whitespace only', () => {
    // Arrange
    const keyword = '   ';
    // Act
    const result = filterCustomersByName(sampleCustomers, keyword);
    // Assert
    expect(result).toHaveLength(3);
  });

  it('should filter customers by partial name match case-insensitively', () => {
    // Arrange
    const keyword = '青葉';
    // Act
    const result = filterCustomersByName(sampleCustomers, keyword);
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('CUS-001');
  });

  it('should match multiple customers when keyword appears in multiple names', () => {
    // Arrange
    const keyword = '株式会社';
    // Act
    const result = filterCustomersByName(sampleCustomers, keyword);
    // Assert
    expect(result).toHaveLength(3);
  });

  it('should also match by customer code', () => {
    // Arrange
    const keyword = 'CUS-002';
    // Act
    const result = filterCustomersByName(sampleCustomers, keyword);
    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('東都ネットワーク株式会社');
  });

  it('should return empty array when no customers match keyword', () => {
    // Arrange
    const keyword = 'XYZ存在しない';
    // Act
    const result = filterCustomersByName(sampleCustomers, keyword);
    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return all customers when keyword is null', () => {
    // Arrange
    const keyword = null;
    // Act
    const result = filterCustomersByName(sampleCustomers, keyword);
    // Assert
    expect(result).toHaveLength(3);
  });
});
