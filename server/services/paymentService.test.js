import { describe, it, expect, vi } from 'vitest';
import {
  listPayments,
  registerPayment,
  getPaymentByCode,
  submitPaymentApproval,
  approvePayment,
  rejectPayment,
  cancelPayment,
  registerPaymentResult
} from './paymentService.js';

const samplePayment = { code: 'PMT-00001', title: 'テスト支払', status: '下書き' };

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([samplePayment]),
  findByCode: vi.fn().mockResolvedValue(samplePayment),
  save: vi.fn().mockResolvedValue(samplePayment),
  update: vi.fn().mockResolvedValue(samplePayment),
  ...overrides
});

const makeSequenceRepo = (nextVal = 1) => ({
  nextVal: vi.fn().mockResolvedValue(nextVal)
});

describe('getPaymentByCode', () => {
  it('should return payment when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getPaymentByCode('PMT-00001', { repository });

    // Assert
    expect(result).toEqual(samplePayment);
  });

  it('should throw 404 when payment not found', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getPaymentByCode('PMT-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('submitPaymentApproval', () => {
  it('should update status to 承認依頼中 when current status is 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '下書き' }),
      update: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認依頼中' })
    });

    // Act
    const result = await submitPaymentApproval('PMT-00001', { repository });

    // Assert
    expect(result.status).toBe('承認依頼中');
  });

  it('should throw 400 when status is not 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認依頼中' })
    });

    // Act & Assert
    await expect(submitPaymentApproval('PMT-00001', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 404 when payment not found', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(submitPaymentApproval('PMT-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('rejectPayment', () => {
  it('should update status to 却下 when current status is 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...samplePayment, status: '却下' })
    });

    // Act
    const result = await rejectPayment('PMT-00001', '予算超過', { repository });

    // Assert
    expect(result.status).toBe('却下');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '下書き' })
    });

    // Act & Assert
    await expect(rejectPayment('PMT-00001', '理由', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 404 when payment not found', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(rejectPayment('PMT-99999', '理由', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('listPayments', () => {
  it('should return all payments', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listPayments({ repository });

    // Assert
    expect(result).toEqual([samplePayment]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('registerPayment', () => {
  it('should create payment with sequenced code', async () => {
    // Arrange
    const repository = makeRepo();
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await registerPayment(
      { supplierId: 'SUP-00001', title: 'テスト支払', paymentDate: '2026-05-31', amount: 5500 },
      { repository, sequenceRepository }
    );

    // Assert
    expect(result.code).toBe('PMT-00001');
    expect(repository.save).toHaveBeenCalledOnce();
    expect(sequenceRepository.nextVal).toHaveBeenCalledWith('payment');
  });
});

describe('approvePayment', () => {
  it('should update status to 承認済み when current status is 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認済み' })
    });

    // Act
    const result = await approvePayment('PMT-00001', 'LGTM', { repository });

    // Assert
    expect(result.status).toBe('承認済み');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '下書き' }) });

    // Act & Assert
    await expect(approvePayment('PMT-00001', '', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('cancelPayment', () => {
  it('should cancel payment when status is 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockResolvedValue({ ...samplePayment, status: 'キャンセル' })
    });

    // Act
    const result = await cancelPayment('PMT-00001', { repository });

    // Assert
    expect(result.status).toBe('キャンセル');
  });

  it('should throw 400 when payment cannot be cancelled', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認済み' })
    });

    // Act & Assert
    await expect(cancelPayment('PMT-00001', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('registerPaymentResult', () => {
  it('should update status to 支払済み when current status is 承認済み', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '承認済み' }),
      update: vi.fn().mockResolvedValue({ ...samplePayment, status: '支払済み' })
    });

    // Act
    const result = await registerPaymentResult('PMT-00001', { repository });

    // Assert
    expect(result.status).toBe('支払済み');
  });

  it('should throw 400 when status is not 承認済み', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePayment, status: '下書き' })
    });

    // Act & Assert
    await expect(registerPaymentResult('PMT-00001', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});
