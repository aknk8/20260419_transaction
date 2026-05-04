import { describe, it, expect } from 'vitest';
import { validateRequired, validateMaxLength, validateUnique, validateForm } from './validation.js';

describe('validateRequired', () => {
  it('should return error message when value is empty string', () => {
    // Arrange
    const value = '';
    const fieldName = '顧客名';
    // Act
    const result = validateRequired(value, fieldName);
    // Assert
    expect(result).toBe('顧客名は必須です。');
  });

  it('should return error message when value is whitespace only', () => {
    // Arrange
    const value = '   ';
    const fieldName = '顧客名';
    // Act
    const result = validateRequired(value, fieldName);
    // Assert
    expect(result).toBe('顧客名は必須です。');
  });

  it('should return error message when value is null', () => {
    // Arrange
    const value = null;
    const fieldName = '顧客名';
    // Act
    const result = validateRequired(value, fieldName);
    // Assert
    expect(result).toBe('顧客名は必須です。');
  });

  it('should return null when value is non-empty string', () => {
    // Arrange
    const value = 'テスト株式会社';
    const fieldName = '顧客名';
    // Act
    const result = validateRequired(value, fieldName);
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when value contains only non-whitespace characters', () => {
    // Arrange
    const value = 'a';
    const fieldName = '顧客コード';
    // Act
    const result = validateRequired(value, fieldName);
    // Assert
    expect(result).toBeNull();
  });
});

describe('validateMaxLength', () => {
  it('should return error message when value exceeds max length', () => {
    // Arrange
    const value = 'a'.repeat(101);
    const max = 100;
    const fieldName = '顧客名';
    // Act
    const result = validateMaxLength(value, max, fieldName);
    // Assert
    expect(result).toBe('顧客名は100文字以内で入力してください。');
  });

  it('should return null when value equals max length', () => {
    // Arrange
    const value = 'a'.repeat(100);
    const max = 100;
    const fieldName = '顧客名';
    // Act
    const result = validateMaxLength(value, max, fieldName);
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when value is shorter than max length', () => {
    // Arrange
    const value = 'テスト';
    const max = 100;
    const fieldName = '顧客名';
    // Act
    const result = validateMaxLength(value, max, fieldName);
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when value is empty string', () => {
    // Arrange
    const value = '';
    const max = 100;
    const fieldName = '顧客名';
    // Act
    const result = validateMaxLength(value, max, fieldName);
    // Assert
    expect(result).toBeNull();
  });
});

describe('validateUnique', () => {
  it('should return error message when value exists in existingValues', () => {
    // Arrange
    const value = 'CUS-001';
    const existingValues = ['CUS-001', 'CUS-002'];
    const fieldName = '顧客コード';
    // Act
    const result = validateUnique(value, existingValues, fieldName);
    // Assert
    expect(result).toBe('顧客コードはすでに使用されています。');
  });

  it('should return null when value does not exist in existingValues', () => {
    // Arrange
    const value = 'CUS-003';
    const existingValues = ['CUS-001', 'CUS-002'];
    const fieldName = '顧客コード';
    // Act
    const result = validateUnique(value, existingValues, fieldName);
    // Assert
    expect(result).toBeNull();
  });

  it('should return null when existingValues is empty', () => {
    // Arrange
    const value = 'CUS-001';
    const existingValues = [];
    const fieldName = '顧客コード';
    // Act
    const result = validateUnique(value, existingValues, fieldName);
    // Assert
    expect(result).toBeNull();
  });
});

describe('validateForm', () => {
  it('should return error for required field when empty', () => {
    // Arrange
    const formData = { name: '' };
    const rules = { name: [{ type: 'required', fieldName: '顧客名' }] };
    // Act
    const result = validateForm(formData, rules);
    // Assert
    expect(result.name).toBe('顧客名は必須です。');
  });

  it('should return null error for valid required field', () => {
    // Arrange
    const formData = { name: 'テスト株式会社' };
    const rules = { name: [{ type: 'required', fieldName: '顧客名' }] };
    // Act
    const result = validateForm(formData, rules);
    // Assert
    expect(result.name).toBeNull();
  });

  it('should stop at first error per field when multiple rules apply', () => {
    // Arrange
    const formData = { name: '' };
    const rules = {
      name: [
        { type: 'required', fieldName: '顧客名' },
        { type: 'maxLength', max: 100, fieldName: '顧客名' }
      ]
    };
    // Act
    const result = validateForm(formData, rules);
    // Assert
    expect(result.name).toBe('顧客名は必須です。');
  });

  it('should return errors for all invalid fields simultaneously', () => {
    // Arrange
    const formData = { name: '', code: '' };
    const rules = {
      name: [{ type: 'required', fieldName: '顧客名' }],
      code: [{ type: 'required', fieldName: '顧客コード' }]
    };
    // Act
    const result = validateForm(formData, rules);
    // Assert
    expect(result.name).toBe('顧客名は必須です。');
    expect(result.code).toBe('顧客コードは必須です。');
  });

  it('should support unique validation rule', () => {
    // Arrange
    const formData = { code: 'CUS-001' };
    const rules = {
      code: [{ type: 'unique', existingValues: ['CUS-001', 'CUS-002'], fieldName: '顧客コード' }]
    };
    // Act
    const result = validateForm(formData, rules);
    // Assert
    expect(result.code).toBe('顧客コードはすでに使用されています。');
  });

  it('should return null for all fields when all are valid', () => {
    // Arrange
    const formData = { name: 'テスト株式会社', code: 'CUS-010' };
    const rules = {
      name: [{ type: 'required', fieldName: '顧客名' }],
      code: [
        { type: 'required', fieldName: '顧客コード' },
        { type: 'unique', existingValues: ['CUS-001'], fieldName: '顧客コード' }
      ]
    };
    // Act
    const result = validateForm(formData, rules);
    // Assert
    expect(result.name).toBeNull();
    expect(result.code).toBeNull();
  });
});
