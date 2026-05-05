import { describe, it, expect, vi } from 'vitest';
import {
  listInvoices,
  getInvoiceByCode,
  registerInvoice,
  updateInvoice,
  submitInvoiceApproval,
  approveInvoice,
  rejectInvoice
} from './invoiceService.js';

const sampleInvoice = { code: 'INV-00001', title: 'テスト請求', status: '下書き', details: [] };

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleInvoice]),
  findByCode: vi.fn().mockResolvedValue(sampleInvoice),
  findAllCodes: vi.fn().mockResolvedValue(['INV-00001']),
  save: vi.fn().mockResolvedValue(sampleInvoice),
  update: vi.fn().mockResolvedValue(sampleInvoice),
  ...overrides
});

describe('listInvoices', () => {
  it('should return all invoices', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listInvoices({ repository });

    // Assert
    expect(result).toEqual([sampleInvoice]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('getInvoiceByCode', () => {
  it('should return invoice when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getInvoiceByCode('INV-00001', { repository });

    // Assert
    expect(result.code).toBe('INV-00001');
  });

  it('should throw 404 when code does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getInvoiceByCode('INV-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerInvoice', () => {
  it('should create invoice with generated code', async () => {
    // Arrange
    const repository = makeRepo({ findAllCodes: vi.fn().mockResolvedValue([]) });

    // Act
    const result = await registerInvoice(
      { orderCode: 'ORD-00001', customerId: 'CUS-00001', title: 'テスト請求', invoiceDate: '2026-05-05', dueDate: '2026-05-31' },
      { repository }
    );

    // Assert
    expect(result.code).toBe('INV-00001');
    expect(repository.save).toHaveBeenCalledOnce();
  });
});

describe('updateInvoice', () => {
  it('should update and return invoice', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await updateInvoice('INV-00001', { dueDate: '2026-06-30' }, { repository });

    // Assert
    expect(result.code).toBe('INV-00001');
    expect(repository.update).toHaveBeenCalledOnce();
  });
});

describe('submitInvoiceApproval', () => {
  it('should update status to 承認依頼中 when current status is 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' })
    });

    // Act
    const result = await submitInvoiceApproval('INV-00001', { repository });

    // Assert
    expect(result.status).toBe('承認依頼中');
  });

  it('should store submittedBy when provided', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleInvoice, ...data }))
    });

    // Act
    const result = await submitInvoiceApproval('INV-00001', { repository, submittedBy: 'user01' });

    // Assert
    expect(result.submittedBy).toBe('user01');
    expect(repository.update).toHaveBeenCalledWith('INV-00001', expect.objectContaining({ submittedBy: 'user01' }));
  });

  it('should throw 400 when status is not 下書き', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }) });

    // Act & Assert
    await expect(submitInvoiceApproval('INV-00001', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('approveInvoice', () => {
  it('should update status to 確定 when current status is 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '確定' })
    });

    // Act
    const result = await approveInvoice('INV-00001', 'LGTM', { repository });

    // Assert
    expect(result.status).toBe('確定');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '下書き' }) });

    // Act & Assert
    await expect(approveInvoice('INV-00001', '', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('rejectInvoice', () => {
  it('should update status to 却下 when current status is 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '却下' })
    });

    // Act
    const result = await rejectInvoice('INV-00001', '要再確認', { repository });

    // Assert
    expect(result.status).toBe('却下');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '下書き' }) });

    // Act & Assert
    await expect(rejectInvoice('INV-00001', '理由', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});
