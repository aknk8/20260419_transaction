import { describe, it, expect, vi } from 'vitest';
import {
  listSuppliers,
  getSupplierByCode,
  registerSupplier,
  updateSupplier
} from './supplierService.js';

const sampleSupplier = {
  code: 'SUP-001',
  name: '株式会社テスト仕入先',
  contact: '山田 次郎',
  paymentSite: '翌月末',
  status: '有効'
};

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleSupplier]),
  findByCode: vi.fn().mockResolvedValue(sampleSupplier),
  findAllCodes: vi.fn().mockResolvedValue(['SUP-001']),
  save: vi.fn().mockResolvedValue(sampleSupplier),
  update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleSupplier, ...data })),
  ...overrides
});

describe('listSuppliers', () => {
  it('should return all suppliers from repository', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listSuppliers({ repository });

    // Assert
    expect(result).toEqual([sampleSupplier]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('getSupplierByCode', () => {
  it('should return supplier when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getSupplierByCode('SUP-001', { repository });

    // Assert
    expect(result).toEqual(sampleSupplier);
    expect(repository.findByCode).toHaveBeenCalledWith('SUP-001');
  });

  it('should throw 404 error when code does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getSupplierByCode('SUP-999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerSupplier', () => {
  it('should generate code from existing codes and save supplier', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue(['SUP-001']),
      save: vi.fn().mockImplementation(async (s) => s)
    });
    const formData = { name: '新規仕入先株式会社', contact: '佐藤 三郎', paymentSite: '翌々月末', status: '有効' };

    // Act
    const result = await registerSupplier(formData, { repository });

    // Assert
    expect(result.code).toBe('SUP-002');
    expect(result.name).toBe('新規仕入先株式会社');
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('should assign SUP-001 when no suppliers exist', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockImplementation(async (s) => s)
    });

    // Act
    const result = await registerSupplier({ name: 'テスト仕入先', status: '有効' }, { repository });

    // Assert
    expect(result.code).toBe('SUP-001');
  });

  it('should throw validation error when name is missing', async () => {
    // Arrange
    const repository = makeRepo();

    // Act & Assert
    await expect(registerSupplier({ status: '有効' }, { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('updateSupplier', () => {
  it('should update and return the modified supplier', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleSupplier, ...data }))
    });

    // Act
    const result = await updateSupplier('SUP-001', { name: '変更後仕入先' }, { repository });

    // Assert
    expect(result.name).toBe('変更後仕入先');
    expect(repository.findByCode).toHaveBeenCalledWith('SUP-001');
    expect(repository.update).toHaveBeenCalledWith('SUP-001', { name: '変更後仕入先' });
  });

  it('should throw 404 error when updating non-existent supplier', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(updateSupplier('SUP-999', { name: 'X' }, { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
