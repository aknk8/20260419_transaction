import { describe, it, expect, vi } from 'vitest';
import {
  listQuotations,
  getQuotationByCode,
  registerQuotation,
  updateQuotation,
  submitQuotationApproval,
  approveQuotation,
  rejectQuotation
} from './quotationService.js';

const sampleDetail = {
  lineNo: 1,
  productCode: 'PRD-001',
  productName: 'テスト商品',
  quantity: 2,
  unit: '個',
  unitPrice: 1000,
  discount: 0,
  taxRate: 0.10,
  amount: 2200
};

const sampleQuotation = {
  code: 'QUO-00001',
  projectCode: 'PJ-00001',
  customerId: 'CUS-001',
  title: 'テスト見積',
  issueDate: '2026-05-01',
  validityDate: '2026-05-31',
  version: 1,
  status: '下書き',
  notes: '',
  subtotal: 2000,
  taxAmount: 200,
  total: 2200,
  details: [sampleDetail]
};

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleQuotation]),
  findByCode: vi.fn().mockResolvedValue(sampleQuotation),
  save: vi.fn().mockResolvedValue(sampleQuotation),
  update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleQuotation, ...data })),
  ...overrides
});

const makeSequenceRepo = (nextVal = 1) => ({
  nextVal: vi.fn().mockResolvedValue(nextVal)
});

describe('listQuotations', () => {
  it('should return all quotations from repository', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listQuotations({ repository });

    // Assert
    expect(result).toEqual([sampleQuotation]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('getQuotationByCode', () => {
  it('should return quotation with details when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getQuotationByCode('QUO-00001', { repository });

    // Assert
    expect(result.code).toBe('QUO-00001');
    expect(result.details).toHaveLength(1);
  });

  it('should throw 404 error when code does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getQuotationByCode('QUO-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerQuotation', () => {
  it('should generate code, calculate totals, and save', async () => {
    // Arrange
    const repository = makeRepo({ save: vi.fn().mockImplementation(async (q) => q) });
    const sequenceRepository = makeSequenceRepo(2);
    const formData = {
      title: '新規見積',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      issueDate: '2026-05-01',
      validityDate: '2026-05-31',
      version: 1,
      details: [{ lineNo: 1, productName: '商品A', quantity: 1, unitPrice: 1000, discount: 0, taxRate: 0.10 }]
    };

    // Act
    const result = await registerQuotation(formData, { repository, sequenceRepository });

    // Assert
    expect(result.code).toBe('QUO-00002');
    expect(result.total).toBeGreaterThan(0);
    expect(repository.save).toHaveBeenCalledOnce();
    expect(sequenceRepository.nextVal).toHaveBeenCalledWith('quotation');
  });

  it('should assign QUO-00001 when sequenceRepository returns 1', async () => {
    // Arrange
    const repository = makeRepo({ save: vi.fn().mockImplementation(async (q) => q) });
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await registerQuotation(
      { title: 'テスト見積', details: [] },
      { repository, sequenceRepository }
    );

    // Assert
    expect(result.code).toBe('QUO-00001');
  });

  it('should throw validation error when title is missing', async () => {
    // Arrange
    const repository = makeRepo();

    // Act & Assert
    await expect(registerQuotation({ details: [] }, { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('updateQuotation', () => {
  it('should update and return modified quotation', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleQuotation, ...data }))
    });

    // Act
    const result = await updateQuotation('QUO-00001', { title: '変更後見積' }, { repository });

    // Assert
    expect(result.title).toBe('変更後見積');
    expect(repository.update).toHaveBeenCalledWith('QUO-00001', { title: '変更後見積' });
  });

  it('should throw 404 when updating non-existent quotation', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(updateQuotation('QUO-99999', { title: 'X' }, { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('submitQuotationApproval', () => {
  it('should change status to 承認依頼中 when current status is 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '下書き' }),
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleQuotation, ...data }))
    });

    // Act
    const result = await submitQuotationApproval('QUO-00001', { repository });

    // Assert
    expect(result.status).toBe('承認依頼中');
    expect(repository.update).toHaveBeenCalledWith('QUO-00001', expect.objectContaining({ status: '承認依頼中' }));
  });

  it('should store submittedBy when provided', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '下書き' }),
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleQuotation, ...data }))
    });

    // Act
    const result = await submitQuotationApproval('QUO-00001', { repository, submittedBy: 'user01' });

    // Assert
    expect(result.submittedBy).toBe('user01');
    expect(repository.update).toHaveBeenCalledWith('QUO-00001', expect.objectContaining({ submittedBy: 'user01' }));
  });

  it('should throw 400 when status is not 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '承認済み' })
    });

    // Act & Assert
    await expect(submitQuotationApproval('QUO-00001', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 404 when quotation does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(submitQuotationApproval('QUO-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('approveQuotation', () => {
  it('should change status to 承認済み with comment', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '承認依頼中' }),
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleQuotation, ...data }))
    });

    // Act
    const result = await approveQuotation('QUO-00001', 'LGTM', { repository });

    // Assert
    expect(result.status).toBe('承認済み');
    expect(result.approvalComment).toBe('LGTM');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '下書き' })
    });

    // Act & Assert
    await expect(approveQuotation('QUO-00001', '', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('rejectQuotation', () => {
  it('should change status to 却下 with reason', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '承認依頼中' }),
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleQuotation, ...data }))
    });

    // Act
    const result = await rejectQuotation('QUO-00001', '金額が高すぎる', { repository });

    // Assert
    expect(result.status).toBe('却下');
    expect(result.rejectReason).toBe('金額が高すぎる');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '下書き' })
    });

    // Act & Assert
    await expect(rejectQuotation('QUO-00001', '理由', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});
