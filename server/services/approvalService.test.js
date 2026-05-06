import { describe, it, expect, vi } from 'vitest';
import { listPendingApprovals, approveDocument, rejectDocument } from './approvalService.js';

const PENDING = '承認依頼中';

const makeServices = (overrides = {}) => ({
  quotationService: {
    listQuotations: vi.fn().mockResolvedValue([]),
    approveQuotation: vi.fn().mockResolvedValue({ code: 'QUO-00001', status: '承認済み' }),
    rejectQuotation: vi.fn().mockResolvedValue({ code: 'QUO-00001', status: '却下' })
  },
  orderService: {
    listOrders: vi.fn().mockResolvedValue([]),
    approveOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '承認済み' }),
    rejectOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '却下' })
  },
  purchaseOrderService: {
    listPurchaseOrders: vi.fn().mockResolvedValue([]),
    approvePurchaseOrder: vi.fn().mockResolvedValue({ code: 'POD-00001', status: '承認済み' }),
    rejectPurchaseOrder: vi.fn().mockResolvedValue({ code: 'POD-00001', status: '却下' })
  },
  invoiceService: {
    listInvoices: vi.fn().mockResolvedValue([]),
    approveInvoice: vi.fn().mockResolvedValue({ code: 'INV-00001', status: '承認済み' }),
    rejectInvoice: vi.fn().mockResolvedValue({ code: 'INV-00001', status: '却下' })
  },
  paymentService: {
    listPayments: vi.fn().mockResolvedValue([]),
    approvePayment: vi.fn().mockResolvedValue({ code: 'PAY-00001', status: '承認済み' }),
    rejectPayment: vi.fn().mockResolvedValue({ code: 'PAY-00001', status: '却下' })
  },
  ...overrides
});

describe('listPendingApprovals', () => {
  it('should return pending quotations tagged with docType quotation', async () => {
    // Arrange
    const svcs = makeServices({
      quotationService: {
        listQuotations: vi.fn().mockResolvedValue([
          { code: 'QUO-00001', title: 'テスト', status: PENDING }
        ]),
        approveQuotation: vi.fn(),
        rejectQuotation: vi.fn()
      }
    });

    // Act
    const result = await listPendingApprovals(null, svcs);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ code: 'QUO-00001', docType: 'quotation' });
  });

  it('should return pending orders tagged with docType order', async () => {
    // Arrange
    const svcs = makeServices({
      orderService: {
        listOrders: vi.fn().mockResolvedValue([
          { code: 'ORD-00001', title: 'テスト', status: PENDING }
        ]),
        approveOrder: vi.fn(),
        rejectOrder: vi.fn()
      }
    });

    // Act
    const result = await listPendingApprovals(null, svcs);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ code: 'ORD-00001', docType: 'order' });
  });

  it('should return pending purchaseOrders tagged with docType purchaseOrder', async () => {
    // Arrange
    const svcs = makeServices({
      purchaseOrderService: {
        listPurchaseOrders: vi.fn().mockResolvedValue([
          { code: 'POD-00001', title: 'テスト', status: PENDING }
        ]),
        approvePurchaseOrder: vi.fn(),
        rejectPurchaseOrder: vi.fn()
      }
    });

    // Act
    const result = await listPendingApprovals(null, svcs);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ code: 'POD-00001', docType: 'purchaseOrder' });
  });

  it('should return pending invoices tagged with docType invoice', async () => {
    // Arrange
    const svcs = makeServices({
      invoiceService: {
        listInvoices: vi.fn().mockResolvedValue([
          { code: 'INV-00001', title: 'テスト', status: PENDING }
        ]),
        approveInvoice: vi.fn(),
        rejectInvoice: vi.fn()
      }
    });

    // Act
    const result = await listPendingApprovals(null, svcs);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ code: 'INV-00001', docType: 'invoice' });
  });

  it('should return pending payments tagged with docType payment', async () => {
    // Arrange
    const svcs = makeServices({
      paymentService: {
        listPayments: vi.fn().mockResolvedValue([
          { code: 'PAY-00001', title: 'テスト', status: PENDING }
        ]),
        approvePayment: vi.fn(),
        rejectPayment: vi.fn()
      }
    });

    // Act
    const result = await listPendingApprovals(null, svcs);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ code: 'PAY-00001', docType: 'payment' });
  });

  it('should exclude documents not in pending status', async () => {
    // Arrange
    const svcs = makeServices({
      quotationService: {
        listQuotations: vi.fn().mockResolvedValue([
          { code: 'QUO-00001', status: '承認済み' },
          { code: 'QUO-00002', status: '下書き' }
        ]),
        approveQuotation: vi.fn(),
        rejectQuotation: vi.fn()
      }
    });

    // Act
    const result = await listPendingApprovals(null, svcs);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should filter results by docType when filter is provided', async () => {
    // Arrange
    const svcs = makeServices({
      quotationService: {
        listQuotations: vi.fn().mockResolvedValue([
          { code: 'QUO-00001', status: PENDING }
        ]),
        approveQuotation: vi.fn(),
        rejectQuotation: vi.fn()
      },
      orderService: {
        listOrders: vi.fn().mockResolvedValue([
          { code: 'ORD-00001', status: PENDING }
        ]),
        approveOrder: vi.fn(),
        rejectOrder: vi.fn()
      }
    });

    // Act
    const result = await listPendingApprovals('quotation', svcs);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].docType).toBe('quotation');
  });

  it('should return empty array when no pending approvals exist', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    const result = await listPendingApprovals(null, svcs);

    // Assert
    expect(result).toHaveLength(0);
  });
});

describe('approveDocument', () => {
  it('should call approveQuotation for QUO- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await approveDocument('QUO-00001', 'LGTM', svcs);

    // Assert
    expect(svcs.quotationService.approveQuotation).toHaveBeenCalledWith('QUO-00001', 'LGTM');
  });

  it('should save approval history when approvalHistoryRepository is provided', async () => {
    // Arrange
    const approvalHistoryRepository = { save: vi.fn().mockResolvedValue({ id: 'h01' }) };
    const svcs = makeServices({ approvalHistoryRepository });

    // Act
    await approveDocument('ORD-00001', 'OK', svcs);

    // Assert
    expect(approvalHistoryRepository.save).toHaveBeenCalledOnce();
    expect(approvalHistoryRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      documentType: 'order',
      documentId: 'ORD-00001',
      action: '承認'
    }));
  });

  it('should save notification when notificationRepository and submittedBy are present', async () => {
    // Arrange
    const notificationRepository = { save: vi.fn().mockResolvedValue({ id: 'n01' }) };
    const svcs = makeServices({
      notificationRepository,
      orderService: {
        listOrders: vi.fn().mockResolvedValue([]),
        approveOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '承認済み', submittedBy: 'user01' }),
        rejectOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '却下' })
      }
    });

    // Act
    await approveDocument('ORD-00001', 'OK', svcs);

    // Assert
    expect(notificationRepository.save).toHaveBeenCalledOnce();
    expect(notificationRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      recipientId: 'user01',
      docCode: 'ORD-00001'
    }));
  });

  it('should not save notification when submittedBy is absent', async () => {
    // Arrange
    const notificationRepository = { save: vi.fn().mockResolvedValue({ id: 'n01' }) };
    const svcs = makeServices({
      notificationRepository,
      orderService: {
        listOrders: vi.fn().mockResolvedValue([]),
        approveOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '承認済み', submittedBy: null }),
        rejectOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '却下' })
      }
    });

    // Act
    await approveDocument('ORD-00001', 'OK', svcs);

    // Assert
    expect(notificationRepository.save).not.toHaveBeenCalled();
  });

  it('should call approveOrder for ORD- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await approveDocument('ORD-00001', 'OK', svcs);

    // Assert
    expect(svcs.orderService.approveOrder).toHaveBeenCalledWith('ORD-00001', 'OK');
  });

  it('should call approvePurchaseOrder for POD- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await approveDocument('POD-00001', '', svcs);

    // Assert
    expect(svcs.purchaseOrderService.approvePurchaseOrder).toHaveBeenCalledWith('POD-00001', '');
  });

  it('should call approveInvoice for INV- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await approveDocument('INV-00001', '', svcs);

    // Assert
    expect(svcs.invoiceService.approveInvoice).toHaveBeenCalledWith('INV-00001', '');
  });

  it('should call approvePayment for PAY- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await approveDocument('PAY-00001', '', svcs);

    // Assert
    expect(svcs.paymentService.approvePayment).toHaveBeenCalledWith('PAY-00001', '');
  });

  it('should throw 400 for unknown code prefix', async () => {
    // Arrange
    const svcs = makeServices();

    // Act & Assert
    await expect(approveDocument('UNKNOWN-001', '', svcs))
      .rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('approveDocument - transaction rollback', () => {
  it('should rollback all changes when approval history insert fails', async () => {
    // Arrange
    const approvalHistoryRepository = {
      save: vi.fn().mockRejectedValue(new Error('history insert failed'))
    };
    const db = {
      transaction: vi.fn().mockImplementation((fn) => fn({ isTransaction: true }))
    };
    const svcs = makeServices({ approvalHistoryRepository, db });

    // Act & Assert
    await expect(approveDocument('ORD-00001', 'OK', svcs))
      .rejects.toThrow('history insert failed');
    expect(db.transaction).toHaveBeenCalledOnce();
  });

  it('should rollback all changes when notification insert fails', async () => {
    // Arrange
    const notificationRepository = {
      save: vi.fn().mockRejectedValue(new Error('notification insert failed'))
    };
    const db = {
      transaction: vi.fn().mockImplementation((fn) => fn({ isTransaction: true }))
    };
    const svcs = makeServices({
      notificationRepository,
      db,
      orderService: {
        listOrders: vi.fn().mockResolvedValue([]),
        approveOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '承認済み', submittedBy: 'user01' }),
        rejectOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '却下' })
      }
    });

    // Act & Assert
    await expect(approveDocument('ORD-00001', 'OK', svcs))
      .rejects.toThrow('notification insert failed');
    expect(db.transaction).toHaveBeenCalledOnce();
  });
});

describe('rejectDocument', () => {
  it('should call rejectQuotation for QUO- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await rejectDocument('QUO-00001', '金額超過', svcs);

    // Assert
    expect(svcs.quotationService.rejectQuotation).toHaveBeenCalledWith('QUO-00001', '金額超過');
  });

  it('should call rejectOrder for ORD- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await rejectDocument('ORD-00001', '理由', svcs);

    // Assert
    expect(svcs.orderService.rejectOrder).toHaveBeenCalledWith('ORD-00001', '理由');
  });

  it('should call rejectPurchaseOrder for POD- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await rejectDocument('POD-00001', '理由', svcs);

    // Assert
    expect(svcs.purchaseOrderService.rejectPurchaseOrder).toHaveBeenCalledWith('POD-00001', '理由');
  });

  it('should call rejectInvoice for INV- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await rejectDocument('INV-00001', '理由', svcs);

    // Assert
    expect(svcs.invoiceService.rejectInvoice).toHaveBeenCalledWith('INV-00001', '理由');
  });

  it('should call rejectPayment for PAY- prefix code', async () => {
    // Arrange
    const svcs = makeServices();

    // Act
    await rejectDocument('PAY-00001', '理由', svcs);

    // Assert
    expect(svcs.paymentService.rejectPayment).toHaveBeenCalledWith('PAY-00001', '理由');
  });

  it('should throw 400 for unknown code prefix', async () => {
    // Arrange
    const svcs = makeServices();

    // Act & Assert
    await expect(rejectDocument('UNKNOWN-001', '理由', svcs))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should require reason for rejection', async () => {
    // Arrange
    const svcs = makeServices();

    // Act & Assert
    await expect(rejectDocument('QUO-00001', '', svcs))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should save rejection history when approvalHistoryRepository is provided', async () => {
    // Arrange
    const approvalHistoryRepository = { save: vi.fn().mockResolvedValue({ id: 'h02' }) };
    const svcs = makeServices({ approvalHistoryRepository });

    // Act
    await rejectDocument('ORD-00001', '金額誤り', svcs);

    // Assert
    expect(approvalHistoryRepository.save).toHaveBeenCalledOnce();
    expect(approvalHistoryRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      documentType: 'order',
      documentId: 'ORD-00001',
      action: '却下'
    }));
  });

  it('should save rejection notification when notificationRepository and submittedBy are present', async () => {
    // Arrange
    const notificationRepository = { save: vi.fn().mockResolvedValue({ id: 'n02' }) };
    const svcs = makeServices({
      notificationRepository,
      orderService: {
        listOrders: vi.fn().mockResolvedValue([]),
        approveOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '承認済み' }),
        rejectOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '却下', submittedBy: 'user01' })
      }
    });

    // Act
    await rejectDocument('ORD-00001', '金額誤り', svcs);

    // Assert
    expect(notificationRepository.save).toHaveBeenCalledOnce();
    expect(notificationRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      recipientId: 'user01',
      docCode: 'ORD-00001'
    }));
  });
});
