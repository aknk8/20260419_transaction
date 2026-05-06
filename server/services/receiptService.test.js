import { describe, it, expect, vi } from 'vitest';
import { listReceipts, registerReceipt } from './receiptService.js';

const sampleReceipt = { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: '5500.00', status: '未消込' };

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleReceipt]),
  save: vi.fn().mockResolvedValue(sampleReceipt),
  update: vi.fn().mockResolvedValue(sampleReceipt),
  ...overrides
});

const makeSequenceRepo = (nextVal = 1) => ({
  nextVal: vi.fn().mockResolvedValue(nextVal)
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
  it('should create receipt with sequenced code', async () => {
    // Arrange
    const repository = makeRepo();
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await registerReceipt(
      { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 5500 },
      { repository, sequenceRepository }
    );

    // Assert
    expect(result.code).toBe('RCP-00001');
    expect(repository.save).toHaveBeenCalledOnce();
    expect(sequenceRepository.nextVal).toHaveBeenCalledWith('receipt');
  });

  it('should update invoice status to 消込済み when receipt amount equals invoice total', async () => {
    // Arrange
    const invoice = { code: 'INV-00001', total: '5500.00', status: '承認依頼中' };
    const repository = makeRepo();
    const sequenceRepository = makeSequenceRepo(1);
    const invoiceRepository = {
      findByCode: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockResolvedValue({ ...invoice, status: '消込済み' }),
      findAll: vi.fn().mockResolvedValue([])
    };
    const receiptRepository = {
      ...makeRepo(),
      findByInvoiceCode: vi.fn().mockResolvedValue([])
    };

    // Act
    await registerReceipt(
      { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 5500, fee: 0 },
      { repository: receiptRepository, invoiceRepository, sequenceRepository }
    );

    // Assert
    expect(invoiceRepository.update).toHaveBeenCalledWith('INV-00001', expect.objectContaining({ status: '消込済み' }));
  });

  it('should update invoice status to 一部消込 when receipt amount is less than invoice total', async () => {
    // Arrange
    const invoice = { code: 'INV-00001', total: '10000.00', status: '承認依頼中' };
    const repository = makeRepo();
    const sequenceRepository = makeSequenceRepo(1);
    const invoiceRepository = {
      findByCode: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockResolvedValue({ ...invoice, status: '一部消込' }),
      findAll: vi.fn().mockResolvedValue([])
    };
    const receiptRepository = {
      ...makeRepo(),
      findByInvoiceCode: vi.fn().mockResolvedValue([])
    };

    // Act
    await registerReceipt(
      { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 6000, fee: 0 },
      { repository: receiptRepository, invoiceRepository, sequenceRepository }
    );

    // Assert
    expect(invoiceRepository.update).toHaveBeenCalledWith('INV-00001', expect.objectContaining({ status: '一部消込' }));
  });

  it('should account for fee when computing net paid amount', async () => {
    // Arrange: invoice total 5500, receipt amount 5600, fee 100 → net 5500 → 消込済み
    const invoice = { code: 'INV-00001', total: '5500.00', status: '承認依頼中' };
    const invoiceRepository = {
      findByCode: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockResolvedValue({ ...invoice, status: '消込済み' })
    };
    const receiptRepository = {
      ...makeRepo(),
      findByInvoiceCode: vi.fn().mockResolvedValue([])
    };

    // Act
    await registerReceipt(
      { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 5600, fee: 100 },
      { repository: receiptRepository, invoiceRepository, sequenceRepository: makeSequenceRepo(1) }
    );

    // Assert
    expect(invoiceRepository.update).toHaveBeenCalledWith('INV-00001', expect.objectContaining({ status: '消込済み' }));
  });

  it('should accumulate previously paid amounts from existing receipts', async () => {
    // Arrange: invoice total 10000, prior receipt 4000, new receipt 6000 → total 10000 → 消込済み
    const invoice = { code: 'INV-00001', total: '10000.00', status: '一部消込' };
    const priorReceipt = { code: 'RCP-00000', invoiceCode: 'INV-00001', amount: '4000.00', fee: '0.00' };
    const invoiceRepository = {
      findByCode: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockResolvedValue({ ...invoice, status: '消込済み' })
    };
    const receiptRepository = {
      save: vi.fn().mockResolvedValue(sampleReceipt),
      findByInvoiceCode: vi.fn().mockResolvedValue([priorReceipt])
    };

    // Act
    await registerReceipt(
      { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 6000, fee: 0 },
      { repository: receiptRepository, invoiceRepository, sequenceRepository: makeSequenceRepo(2) }
    );

    // Assert
    expect(invoiceRepository.update).toHaveBeenCalledWith('INV-00001', expect.objectContaining({ status: '消込済み' }));
  });

  it('should rollback all changes when payment status update fails', async () => {
    // Arrange
    const invoice = { code: 'INV-00001', total: '5500.00', status: '承認依頼中' };
    const invoiceRepository = {
      findByCode: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockRejectedValue(new Error('invoice status update failed'))
    };
    const receiptRepository = {
      save: vi.fn().mockResolvedValue(sampleReceipt),
      findByInvoiceCode: vi.fn().mockResolvedValue([])
    };
    const db = {
      transaction: vi.fn().mockImplementation((fn) => fn({ isTransaction: true }))
    };

    // Act & Assert
    await expect(registerReceipt(
      { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 5500, fee: 0 },
      { repository: receiptRepository, invoiceRepository, sequenceRepository: makeSequenceRepo(1), db }
    )).rejects.toThrow('invoice status update failed');
    expect(db.transaction).toHaveBeenCalledOnce();
  });

  it('should not update invoice status when invoiceRepository is not provided', async () => {
    // Arrange
    const repository = makeRepo();
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await registerReceipt(
      { invoiceCode: 'INV-00001', receiptDate: '2026-05-10', amount: 5500 },
      { repository, sequenceRepository }
    );

    // Assert — no invoice update, just receipt saved
    expect(result.code).toBe('RCP-00001');
  });
});
