import { describe, it, expect, vi } from 'vitest';
import {
  listPurchaseOrders,
  getPurchaseOrderByCode,
  registerPurchaseOrder,
  updatePurchaseOrder,
  submitPurchaseOrderApproval,
  approvePurchaseOrder,
  rejectPurchaseOrder
} from './purchaseOrderService.js';

const samplePO = { code: 'POD-00001', title: 'テスト発注', status: '下書き', details: [] };

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([samplePO]),
  findByCode: vi.fn().mockResolvedValue(samplePO),
  save: vi.fn().mockResolvedValue(samplePO),
  update: vi.fn().mockResolvedValue(samplePO),
  ...overrides
});

const makeSequenceRepo = (nextVal = 1) => ({
  nextVal: vi.fn().mockResolvedValue(nextVal)
});

describe('listPurchaseOrders', () => {
  it('should return all purchase orders', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listPurchaseOrders({ repository });

    // Assert
    expect(result).toEqual([samplePO]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('getPurchaseOrderByCode', () => {
  it('should return purchase order when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getPurchaseOrderByCode('POD-00001', { repository });

    // Assert
    expect(result.code).toBe('POD-00001');
  });

  it('should throw 404 when code does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getPurchaseOrderByCode('POD-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerPurchaseOrder', () => {
  it('should create purchase order with sequenced code', async () => {
    // Arrange
    const repository = makeRepo();
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await registerPurchaseOrder(
      { supplierId: 'SUP-00001', title: 'テスト発注', orderDate: '2026-05-05' },
      { repository, sequenceRepository }
    );

    // Assert
    expect(result.code).toBe('POD-00001');
    expect(repository.save).toHaveBeenCalledOnce();
    expect(sequenceRepository.nextVal).toHaveBeenCalledWith('purchaseOrder');
  });
});

describe('updatePurchaseOrder', () => {
  it('should update and return purchase order', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await updatePurchaseOrder('POD-00001', { status: '承認依頼中' }, { repository });

    // Assert
    expect(repository.update).toHaveBeenCalledOnce();
  });
});

describe('submitPurchaseOrderApproval', () => {
  it('should change status to 承認依頼中 when current status is 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockResolvedValue({ ...samplePO, status: '承認依頼中' })
    });

    // Act
    const result = await submitPurchaseOrderApproval('POD-00001', { repository });

    // Assert
    expect(result.status).toBe('承認依頼中');
  });

  it('should throw 400 when status is not 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePO, status: '承認依頼中' })
    });

    // Act & Assert
    await expect(submitPurchaseOrderApproval('POD-00001', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 404 when purchase order does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(submitPurchaseOrderApproval('POD-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('approvePurchaseOrder', () => {
  it('should change status to 承認済み with comment', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePO, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...samplePO, status: '承認済み', approvalComment: 'OK' })
    });

    // Act
    const result = await approvePurchaseOrder('POD-00001', 'OK', { repository });

    // Assert
    expect(result.status).toBe('承認済み');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePO, status: '下書き' })
    });

    // Act & Assert
    await expect(approvePurchaseOrder('POD-00001', '', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('rejectPurchaseOrder', () => {
  it('should change status to 却下 with reason', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePO, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...samplePO, status: '却下' })
    });

    // Act
    const result = await rejectPurchaseOrder('POD-00001', '価格超過', { repository });

    // Assert
    expect(result.status).toBe('却下');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...samplePO, status: '下書き' })
    });

    // Act & Assert
    await expect(rejectPurchaseOrder('POD-00001', '理由', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});
