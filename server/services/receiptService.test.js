import { describe, it, expect, vi } from 'vitest';
import { listReceipts, registerReceipt } from './receiptService.js';

const sampleReceipt = { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: '5500.00', status: '未消込' };

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleReceipt]),
  findAllCodes: vi.fn().mockResolvedValue(['RCP-00001']),
  save: vi.fn().mockResolvedValue(sampleReceipt),
  update: vi.fn().mockResolvedValue(sampleReceipt),
  ...overrides
});

describe('listReceipts', () => {
  it('should return all receipts', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listReceipts({ repository });

    // Assert
    expect(result).toEqual([sampleReceipt]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('registerReceipt', () => {
  it('should create receipt with generated code', async () => {
    // Arrange
    const repository = makeRepo({ findAllCodes: vi.fn().mockResolvedValue([]) });

    // Act
    const result = await registerReceipt(
      { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 5500 },
      { repository }
    );

    // Assert
    expect(result.code).toBe('RCP-00001');
    expect(repository.save).toHaveBeenCalledOnce();
  });
});
