import { describe, it, expect, vi } from 'vitest';
import {
  listInvoices,
  getInvoiceByCode,
  registerInvoice,
  updateInvoice,
  submitInvoiceApproval,
  approveInvoice,
  rejectInvoice,
  listInvoiceCandidates,
  getMonthlySummary
} from './invoiceService.js';

const sampleInvoice = { code: 'INV-00001', title: 'テスト請求', status: '下書き', details: [] };

const makeRepo = (overrides = {}) => ({
  findAll: vi.fn().mockResolvedValue([sampleInvoice]),
  findByCode: vi.fn().mockResolvedValue(sampleInvoice),
  save: vi.fn().mockResolvedValue(sampleInvoice),
  update: vi.fn().mockResolvedValue(sampleInvoice),
  ...overrides
});

const makeSequenceRepo = (nextVal = 1) => ({
  nextVal: vi.fn().mockResolvedValue(nextVal)
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
  it('should create invoice with sequenced code', async () => {
    // Arrange
    const repository = makeRepo();
    const sequenceRepository = makeSequenceRepo(1);

    // Act
    const result = await registerInvoice(
      { orderCode: 'ORD-00001', customerId: 'CUS-00001', title: 'テスト請求', invoiceDate: '2026-05-05', dueDate: '2026-05-31' },
      { repository, sequenceRepository }
    );

    // Assert
    expect(result.code).toBe('INV-00001');
    expect(repository.save).toHaveBeenCalledOnce();
    expect(sequenceRepository.nextVal).toHaveBeenCalledWith('invoice');
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
  it('should change status to 承認依頼中 when current status is 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' })
    });

    // Act
    const result = await submitInvoiceApproval('INV-00001', { repository });

    // Assert
    expect(result.status).toBe('承認依頼中');
  });

  it('should throw 400 when status is not 下書き', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' })
    });

    // Act & Assert
    await expect(submitInvoiceApproval('INV-00001', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw 404 when invoice does not exist', async () => {
    // Arrange
    const repository = makeRepo({ findByCode: vi.fn().mockResolvedValue(null) });

    // Act & Assert
    await expect(submitInvoiceApproval('INV-99999', { repository }))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('approveInvoice', () => {
  it('should change status to 確定 with comment', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '確定', approvalComment: 'OK' })
    });

    // Act
    const result = await approveInvoice('INV-00001', 'OK', { repository });

    // Assert
    expect(result.status).toBe('確定');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '下書き' })
    });

    // Act & Assert
    await expect(approveInvoice('INV-00001', '', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should save audit log when auditLogRepository is provided', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '確定' })
    });
    const auditLogRepository = { save: vi.fn().mockResolvedValue({ id: 1 }) };

    // Act
    await approveInvoice('INV-00001', 'OK', { repository, auditLogRepository, actor: { userId: 'u01', userName: '承認者' } });

    // Assert
    expect(auditLogRepository.save).toHaveBeenCalledOnce();
    expect(auditLogRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      action: 'INVOICE_APPROVE',
      entityType: 'invoice',
      entityId: 'INV-00001'
    }));
  });

  it('should not save audit log when auditLogRepository is not provided', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '確定' })
    });

    // Act — no auditLogRepository passed, should not throw
    const result = await approveInvoice('INV-00001', 'OK', { repository });

    // Assert
    expect(result.status).toBe('確定');
  });
});

describe('rejectInvoice', () => {
  it('should change status to 却下', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '却下' })
    });

    // Act
    const result = await rejectInvoice('INV-00001', '明細誤り', { repository });

    // Assert
    expect(result.status).toBe('却下');
  });

  it('should throw 400 when status is not 承認依頼中', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '下書き' })
    });

    // Act & Assert
    await expect(rejectInvoice('INV-00001', '理由', { repository }))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('registerInvoice - transaction rollback', () => {
  it('should rollback all changes when sequence numbering fails', async () => {
    // Arrange
    const repository = makeRepo({ save: vi.fn() });
    const sequenceRepository = {
      nextVal: vi.fn().mockRejectedValue(new Error('sequence counter failed'))
    };
    const db = {
      transaction: vi.fn().mockImplementation((fn) => fn({ isTransaction: true }))
    };

    // Act & Assert
    await expect(registerInvoice(
      { orderCode: 'ORD-00001', customerId: 'CUS-001', title: '請求', invoiceDate: '2026-05-05', dueDate: '2026-05-31' },
      { repository, sequenceRepository, db }
    )).rejects.toThrow('sequence counter failed');
    expect(repository.save).not.toHaveBeenCalled();
    expect(db.transaction).toHaveBeenCalledOnce();
  });
});

describe('approveInvoice - transaction rollback', () => {
  it('should rollback all changes when audit log insert fails', async () => {
    // Arrange
    const repository = makeRepo({
      findByCode: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }),
      update: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '確定' })
    });
    const auditLogRepository = {
      save: vi.fn().mockRejectedValue(new Error('audit log insert failed'))
    };
    const db = {
      transaction: vi.fn().mockImplementation((fn) => fn({ isTransaction: true }))
    };

    // Act & Assert
    await expect(approveInvoice('INV-00001', 'OK', { repository, auditLogRepository, db }))
      .rejects.toThrow('audit log insert failed');
    expect(db.transaction).toHaveBeenCalledOnce();
  });
});

describe('registerInvoice - BL-02 multi-order invoice', () => {
  const makeOrderRepo = (ordersMap = {}) => ({
    findByCode: vi.fn().mockImplementation(async (code) => ordersMap[code] ?? null)
  });

  it('should create invoice merging multiple orders', async () => {
    // Arrange
    const order1 = {
      code: 'ORD-00001', customerId: 'CUS-001', subtotal: 1000,
      details: [{ lineNo: 1, productName: '商品A', quantity: 1, unitPrice: 1000, taxRate: 0.10, amount: 1000 }]
    };
    const order2 = {
      code: 'ORD-00002', customerId: 'CUS-001', subtotal: 2000,
      details: [{ lineNo: 1, productName: '商品B', quantity: 2, unitPrice: 1000, taxRate: 0.10, amount: 2000 }]
    };
    const repository = makeRepo({ save: vi.fn().mockImplementation(async (inv) => inv) });
    const orderRepository = makeOrderRepo({ 'ORD-00001': order1, 'ORD-00002': order2 });

    // Act
    const result = await registerInvoice(
      { orderCodes: ['ORD-00001', 'ORD-00002'], customerId: 'CUS-001', title: '合算請求', invoiceDate: '2026-05-31', dueDate: '2026-06-30' },
      { repository, orderRepository, sequenceRepository: makeSequenceRepo(1) }
    );

    // Assert
    expect(result.details).toHaveLength(2);
    expect(result.subtotal).toBe(3000);
  });

  it('should calculate tax on total subtotal not per-line sum', async () => {
    // 3 items × ¥105 each = ¥315 subtotal
    // per-line: floor(105*0.10)=10 × 3 lines = ¥30
    // one-shot: floor(315*0.10) = floor(31.5) = ¥31  ← BL-02 correct result
    const order = {
      code: 'ORD-00001', customerId: 'CUS-001', subtotal: 315,
      details: [
        { lineNo: 1, productName: '商品A', quantity: 1, unitPrice: 105, taxRate: 0.10, amount: 105 },
        { lineNo: 2, productName: '商品B', quantity: 1, unitPrice: 105, taxRate: 0.10, amount: 105 },
        { lineNo: 3, productName: '商品C', quantity: 1, unitPrice: 105, taxRate: 0.10, amount: 105 }
      ]
    };
    const repository = makeRepo({ save: vi.fn().mockImplementation(async (inv) => inv) });
    const orderRepository = makeOrderRepo({ 'ORD-00001': order });

    // Act
    const result = await registerInvoice(
      { orderCodes: ['ORD-00001'], customerId: 'CUS-001', title: '請求', invoiceDate: '2026-05-31', dueDate: '2026-06-30' },
      { repository, orderRepository, sequenceRepository: makeSequenceRepo(1) }
    );

    // Assert
    expect(result.subtotal).toBe(315);
    expect(result.taxAmount).toBe(31);
    expect(result.total).toBe(346);
  });

  it('should allow partial invoice for a single order', async () => {
    // Arrange — explicit details provided for partial invoice (no orderRepository needed)
    const repository = makeRepo({ save: vi.fn().mockImplementation(async (inv) => inv) });
    const partialDetails = [{ lineNo: 1, productName: '商品A', quantity: 1, unitPrice: 500, taxRate: 0.10, amount: 500 }];

    // Act
    const result = await registerInvoice(
      {
        orderCodes: ['ORD-00001'],
        customerId: 'CUS-001', title: '部分請求',
        invoiceDate: '2026-05-31', dueDate: '2026-06-30',
        subtotal: 500, taxAmount: 50, total: 550,
        details: partialDetails
      },
      { repository, sequenceRepository: makeSequenceRepo(1) }
    );

    // Assert
    expect(result.details).toHaveLength(1);
    expect(result.subtotal).toBe(500);
    expect(result.taxAmount).toBe(50);
  });
});

describe('listInvoiceCandidates', () => {
  it('should return orders within billing period based on customer closing_day', async () => {
    // Arrange — Customer closingDay '末日': period is 2026-05-01 to 2026-05-31
    const customerRepository = {
      findAll: vi.fn().mockResolvedValue([{ code: 'CUS-001', closingDay: '末日' }])
    };
    const orderRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'ORD-001', customerId: 'CUS-001', orderDate: '2026-05-15', status: '承認済み' }
      ])
    };

    // Act
    const result = await listInvoiceCandidates(2026, 5, { orderRepository, customerRepository });

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('ORD-001');
  });

  it('should return empty array when no orders fall in billing period', async () => {
    // Arrange — Order date is in April, but requesting May '末日' period
    const customerRepository = {
      findAll: vi.fn().mockResolvedValue([{ code: 'CUS-001', closingDay: '末日' }])
    };
    const orderRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'ORD-001', customerId: 'CUS-001', orderDate: '2026-04-15', status: '承認済み' }
      ])
    };

    // Act
    const result = await listInvoiceCandidates(2026, 5, { orderRepository, customerRepository });

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should handle numeric closing day (15日) with cross-month period', async () => {
    // Arrange — closingDay '15日' for May: period is 2026-04-16 to 2026-05-15
    const customerRepository = {
      findAll: vi.fn().mockResolvedValue([{ code: 'CUS-002', closingDay: '15日' }])
    };
    const orderRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'ORD-002', customerId: 'CUS-002', orderDate: '2026-05-10', status: '承認済み' },
        { code: 'ORD-003', customerId: 'CUS-002', orderDate: '2026-05-20', status: '承認済み' }
      ])
    };

    // Act
    const result = await listInvoiceCandidates(2026, 5, { orderRepository, customerRepository });

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('ORD-002');
  });

  it('should only include orders with status 承認済み', async () => {
    // Arrange
    const customerRepository = {
      findAll: vi.fn().mockResolvedValue([{ code: 'CUS-001', closingDay: '末日' }])
    };
    const orderRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'ORD-001', customerId: 'CUS-001', orderDate: '2026-05-15', status: '下書き' }
      ])
    };

    // Act
    const result = await listInvoiceCandidates(2026, 5, { orderRepository, customerRepository });

    // Assert
    expect(result).toHaveLength(0);
  });
});

describe('getMonthlySummary', () => {
  it('should aggregate sales/cost/profit by project for the month', async () => {
    // Arrange
    const invoiceRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'INV-001', orderCode: 'ORD-001', invoiceDate: '2026-05-20', subtotal: 1000000 }
      ])
    };
    const orderRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'ORD-001', projectCode: 'PRJ-001' }
      ])
    };
    const purchaseOrderRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'POD-001', orderCode: 'ORD-001', subtotal: 700000 }
      ])
    };

    // Act
    const result = await getMonthlySummary(2026, 5, { invoiceRepository, orderRepository, purchaseOrderRepository });

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].projectCode).toBe('PRJ-001');
    expect(result[0].sales).toBe(1000000);
    expect(result[0].cost).toBe(700000);
    expect(result[0].profit).toBe(300000);
  });

  it('should return empty array when no invoices exist in the given month', async () => {
    // Arrange — Invoice is in April, not May
    const invoiceRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'INV-001', orderCode: 'ORD-001', invoiceDate: '2026-04-20', subtotal: 1000000 }
      ])
    };
    const orderRepository = { findAll: vi.fn().mockResolvedValue([]) };
    const purchaseOrderRepository = { findAll: vi.fn().mockResolvedValue([]) };

    // Act
    const result = await getMonthlySummary(2026, 5, { invoiceRepository, orderRepository, purchaseOrderRepository });

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should aggregate multiple invoices across same project', async () => {
    // Arrange — Two invoices for same project
    const invoiceRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'INV-001', orderCode: 'ORD-001', invoiceDate: '2026-05-10', subtotal: 500000 },
        { code: 'INV-002', orderCode: 'ORD-002', invoiceDate: '2026-05-20', subtotal: 300000 }
      ])
    };
    const orderRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'ORD-001', projectCode: 'PRJ-001' },
        { code: 'ORD-002', projectCode: 'PRJ-001' }
      ])
    };
    const purchaseOrderRepository = {
      findAll: vi.fn().mockResolvedValue([
        { code: 'POD-001', orderCode: 'ORD-001', subtotal: 350000 },
        { code: 'POD-002', orderCode: 'ORD-002', subtotal: 200000 }
      ])
    };

    // Act
    const result = await getMonthlySummary(2026, 5, { invoiceRepository, orderRepository, purchaseOrderRepository });

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].projectCode).toBe('PRJ-001');
    expect(result[0].sales).toBe(800000);
    expect(result[0].cost).toBe(550000);
    expect(result[0].profit).toBe(250000);
  });
});
