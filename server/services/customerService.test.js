import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listCustomers,
  getCustomerByCode,
  registerCustomer,
  updateCustomer
} from './customerService.js';

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

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleCustomer]),
  findByCode: vi.fn().mockResolvedValue(sampleCustomer),
  findAllCodes: vi.fn().mockResolvedValue(['CUS-001']),
  save: vi.fn().mockResolvedValue(sampleCustomer),
  update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleCustomer, ...data })),
  ...overrides
});

describe('listCustomers', () => {
  it('should return all customers from repository', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listCustomers({ repository });

    // Assert
    expect(result).toEqual([sampleCustomer]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('getCustomerByCode', () => {
  it('should return customer when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getCustomerByCode('CUS-001', { repository });

    // Assert
    expect(result).toEqual(sampleCustomer);
    expect(repository.findByCode).toHaveBeenCalledWith('CUS-001');
  });

  it('should throw 404 error when code does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getCustomerByCode('CUS-999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerCustomer', () => {
  it('should generate code from existing codes and save customer', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue(['CUS-001']),
      save: vi.fn().mockImplementation(async (c) => c)
    });
    const formData = {
      name: '新規株式会社',
      department: '営業部',
      contact: '鈴木 花子',
      closingDay: '15日',
      paymentSite: '翌々月末',
      billingTo: '東京支社',
      status: '有効'
    };

    // Act
    const result = await registerCustomer(formData, { repository });

    // Assert
    expect(result.code).toBe('CUS-002');
    expect(result.name).toBe('新規株式会社');
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('should assign CUS-001 when no customers exist', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockImplementation(async (c) => c)
    });

    // Act
    const result = await registerCustomer({ name: 'テスト株式会社', status: '有効' }, { repository });

    // Assert
    expect(result.code).toBe('CUS-001');
  });

  it('should throw validation error when name is missing', async () => {
    // Arrange
    const repository = makeRepo();

    // Act & Assert
    await expect(registerCustomer({ status: '有効' }, { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('updateCustomer', () => {
  it('should update and return the modified customer', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleCustomer, ...data }))
    });
    const patch = { name: '変更後株式会社' };

    // Act
    const result = await updateCustomer('CUS-001', patch, { repository });

    // Assert
    expect(result.name).toBe('変更後株式会社');
    expect(repository.findByCode).toHaveBeenCalledWith('CUS-001');
    expect(repository.update).toHaveBeenCalledWith('CUS-001', patch);
  });

  it('should throw 404 error when updating non-existent customer', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(updateCustomer('CUS-999', { name: 'X' }, { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
