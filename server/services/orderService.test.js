import { describe, it, expect, vi } from 'vitest';
import {
  listOrders,
  getOrderByCode,
  registerOrder,
  updateOrder,
  submitOrderApproval,
  approveOrder,
  rejectOrder
} from './orderService.js';

const sampleQuotation = {
  code: 'QUO-00001',
  title: 'テスト見積',
  projectCode: 'PJ-00001',
  customerId: 'CUS-001',
  status: '承認済み',
  subtotal: 2000,
  taxAmount: 200,
  total: 2200,
  notes: '',
  details: [{ lineNo: 1, productName: '商品A', quantity: 1, unitPrice: 2000, taxRate: 0.10, amount: 2200 }]
};

const sampleOrder = {
  code: 'ORD-00001',
  quotationCode: 'QUO-00001',
  projectCode: 'PJ-00001',
  customerId: 'CUS-001',
  title: 'テスト見積',
  orderDate: '2026-05-05',
  deliveryDate: '',
  status: '受注済み',
  subtotal: 2000,
  taxAmount: 200,
  total: 2200,
  notes: '',
  details: [{ lineNo: 1, productName: '商品A', quantity: 1, unitPrice: 2000, taxRate: 0.10, amount: 2200 }]
};

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleOrder]),
  findByCode: vi.fn().mockResolvedValue(sampleOrder),
  findAllCodes: vi.fn().mockResolvedValue(['ORD-00001']),
  save: vi.fn().mockResolvedValue(sampleOrder),
  update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleOrder, ...data })),
  ...overrides
});

const makeQuotationRepo = (overrides = {}) => ({
  findByCode: vi.fn().mockResolvedValue(sampleQuotation),
  ...overrides
});

describe('listOrders', () => {
  it('should return all orders from repository', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await listOrders({ repository });

    // Assert
    expect(result).toEqual([sampleOrder]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});

describe('getOrderByCode', () => {
  it('should return order with details when code exists', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getOrderByCode('ORD-00001', { repository });

    // Assert
    expect(result.code).toBe('ORD-00001');
    expect(result.details).toHaveLength(1);
  });

  it('should throw 404 when code does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(getOrderByCode('ORD-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('registerOrder', () => {
  it('should create order from approved quotation', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue(['ORD-00001']),
      save: vi.fn().mockImplementation(async (o) => o)
    });
    const quotationRepository = makeQuotationRepo();

    // Act
    const result = await registerOrder(
      { quotationCode: 'QUO-00001', orderDate: '2026-05-05' },
      { repository, quotationRepository }
    );

    // Assert
    expect(result.code).toBe('ORD-00002');
    expect(result.quotationCode).toBe('QUO-00001');
    expect(result.status).toBe('受注済み');
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('should assign ORD-00001 when no orders exist', async () => {
    // Arrange
    const repository = makeRepo({
      findAllCodes: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockImplementation(async (o) => o)
    });
    const quotationRepository = makeQuotationRepo();

    // Act
    const result = await registerOrder(
      { quotationCode: 'QUO-00001', orderDate: '2026-05-05' },
      { repository, quotationRepository }
    );

    // Assert
    expect(result.code).toBe('ORD-00001');
  });

  it('should throw 400 when quotation is not approved', async () => {
    // Arrange
    const repository = makeRepo();
    const quotationRepository = makeQuotationRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '下書き' })
    });

    // Act & Assert
    await expect(registerOrder(
      { quotationCode: 'QUO-00001', orderDate: '2026-05-05' },
      { repository, quotationRepository }
    )).rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 400 when quotation does not exist', async () => {
    // Arrange
    const repository = makeRepo();
    const quotationRepository = makeQuotationRepo({
      findByCode: vi.fn().mockResolvedValue(null)
    });

    // Act & Assert
    await expect(registerOrder(
      { quotationCode: 'QUO-99999', orderDate: '2026-05-05' },
      { repository, quotationRepository }
    )).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('updateOrder', () => {
  it('should update and return modified order', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleOrder, ...data }))
    });

    // Act
    const result = await updateOrder('ORD-00001', { deliveryDate: '2026-06-30' }, { repository });

    // Assert
    expect(result.deliveryDate).toBe('2026-06-30');
  });

  it('should throw 404 when updating non-existent order', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(updateOrder('ORD-99999', { deliveryDate: '2026-06-30' }, { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('submitOrderApproval', () => {
  it('should change status to 承認依頼中 when current status is 受注済み', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleOrder, status: '受注済み' }),
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleOrder, ...data }))
    });

    // Act
    const result = await submitOrderApproval('ORD-00001', { repository });

    // Assert
    expect(result.status).toBe('承認依頼中');
    expect(repository.update).toHaveBeenCalledWith('ORD-00001', expect.objectContaining({ status: '承認依頼中' }));
  });

  it('should store submittedBy when provided', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleOrder, status: '受注済み' }),
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleOrder, ...data }))
    });

    // Act
    const result = await submitOrderApproval('ORD-00001', { repository, submittedBy: 'user01' });

    // Assert
    expect(result.submittedBy).toBe('user01');
    expect(repository.update).toHaveBeenCalledWith('ORD-00001', expect.objectContaining({ submittedBy: 'user01' }));
  });

  it('should throw 400 when status is not 受注済み', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleOrder, status: '承認済み' })
    });

    // Act & Assert
    await expect(submitOrderApproval('ORD-00001', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 404 when order does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(submitOrderApproval('ORD-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('approveOrder', () => {
  it('should change status to 承認済み with comment', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleOrder, status: '承認依頼中' }),
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleOrder, ...data }))
    });

    // Act
    const result = await approveOrder('ORD-00001', 'LGTM', { repository });

    // Assert
    expect(result.status).toBe('承認済み');
    expect(result.approvalComment).toBe('LGTM');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleOrder, status: '受注済み' })
    });

    // Act & Assert
    await expect(approveOrder('ORD-00001', '', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('rejectOrder', () => {
  it('should change status to 却下 with reason', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleOrder, status: '承認依頼中' }),
      update: vi.fn().mockImplementation(async (code, data) => ({ ...sampleOrder, ...data }))
    });

    // Act
    const result = await rejectOrder('ORD-00001', '要再見積', { repository });

    // Assert
    expect(result.status).toBe('却下');
    expect(result.rejectReason).toBe('要再見積');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleOrder, status: '受注済み' })
    });

    // Act & Assert
    await expect(rejectOrder('ORD-00001', '理由', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});
