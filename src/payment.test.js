import { describe, it, expect } from 'vitest';
import { generatePaymentCode, createPaymentRequest, findPayablePurchaseOrders, submitPaymentApproval, approvePayment, rejectPayment, cancelPayment, registerPayment } from './payment.js';

describe('generatePaymentCode', () => {
  it('should return PMT-00001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];

    // Act
    const result = generatePaymentCode(existingCodes);

    // Assert
    expect(result).toBe('PMT-00001');
  });

  it('should return PMT-00006 when codes PMT-00001 to PMT-00005 exist', () => {
    // Arrange
    const existingCodes = ['PMT-00001', 'PMT-00002', 'PMT-00003', 'PMT-00004', 'PMT-00005'];

    // Act
    const result = generatePaymentCode(existingCodes);

    // Assert
    expect(result).toBe('PMT-00006');
  });

  it('should return PMT-00010 when max code is PMT-00009', () => {
    // Arrange
    const existingCodes = ['PMT-00009', 'PMT-00003'];

    // Act
    const result = generatePaymentCode(existingCodes);

    // Assert
    expect(result).toBe('PMT-00010');
  });
});

describe('createPaymentRequest', () => {
  it('should set code from parameter', () => {
    // Arrange & Act
    const result = createPaymentRequest('PMT-00001', 'POD-00001', 'SUP-001', 'テスト支払依頼', '2026-05-31', 110000, '');

    // Assert
    expect(result.code).toBe('PMT-00001');
  });

  it('should set purchaseOrderCode from parameter', () => {
    // Arrange & Act
    const result = createPaymentRequest('PMT-00001', 'POD-00001', 'SUP-001', 'テスト支払依頼', '2026-05-31', 110000, '');

    // Assert
    expect(result.purchaseOrderCode).toBe('POD-00001');
  });

  it('should set supplierId from parameter', () => {
    // Arrange & Act
    const result = createPaymentRequest('PMT-00001', 'POD-00001', 'SUP-001', 'テスト支払依頼', '2026-05-31', 110000, '');

    // Assert
    expect(result.supplierId).toBe('SUP-001');
  });

  it('should set title from parameter', () => {
    // Arrange & Act
    const result = createPaymentRequest('PMT-00001', 'POD-00001', 'SUP-001', 'テスト支払依頼', '2026-05-31', 110000, '');

    // Assert
    expect(result.title).toBe('テスト支払依頼');
  });

  it('should set paymentDate from parameter', () => {
    // Arrange & Act
    const result = createPaymentRequest('PMT-00001', 'POD-00001', 'SUP-001', 'テスト支払依頼', '2026-05-31', 110000, '');

    // Assert
    expect(result.paymentDate).toBe('2026-05-31');
  });

  it('should set amount from parameter', () => {
    // Arrange & Act
    const result = createPaymentRequest('PMT-00001', 'POD-00001', 'SUP-001', 'テスト支払依頼', '2026-05-31', 110000, '');

    // Assert
    expect(result.amount).toBe(110000);
  });

  it('should set status to 下書き by default', () => {
    // Arrange & Act
    const result = createPaymentRequest('PMT-00001', 'POD-00001', 'SUP-001', 'テスト支払依頼', '2026-05-31', 110000, '');

    // Assert
    expect(result.status).toBe('下書き');
  });

  it('should set notes from parameter', () => {
    // Arrange & Act
    const result = createPaymentRequest('PMT-00001', 'POD-00001', 'SUP-001', 'テスト支払依頼', '2026-05-31', 110000, '口座振込');

    // Assert
    expect(result.notes).toBe('口座振込');
  });
});

describe('findPayablePurchaseOrders', () => {
  it('should return purchase order with status 納品済 when no payments exist', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', status: '納品済' }
    ];
    const payments = [];

    // Act
    const result = findPayablePurchaseOrders(purchaseOrders, payments);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('POD-00001');
  });

  it('should not return purchase order with status 下書き', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', status: '下書き' }
    ];
    const payments = [];

    // Act
    const result = findPayablePurchaseOrders(purchaseOrders, payments);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should not return purchase order that already has a payment request', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', status: '納品済' }
    ];
    const payments = [
      { code: 'PMT-00001', purchaseOrderCode: 'POD-00001', status: '下書き' }
    ];

    // Act
    const result = findPayablePurchaseOrders(purchaseOrders, payments);

    // Assert
    expect(result).toHaveLength(0);
  });

  it('should return purchase order whose payment was cancelled', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', status: '納品済' }
    ];
    const payments = [
      { code: 'PMT-00001', purchaseOrderCode: 'POD-00001', status: 'キャンセル' }
    ];

    // Act
    const result = findPayablePurchaseOrders(purchaseOrders, payments);

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should return only payable purchase orders from mixed list', () => {
    // Arrange
    const purchaseOrders = [
      { code: 'POD-00001', status: '下書き' },
      { code: 'POD-00002', status: '納品済' },
      { code: 'POD-00003', status: '納品済' }
    ];
    const payments = [
      { code: 'PMT-00001', purchaseOrderCode: 'POD-00003', status: '支払済' }
    ];

    // Act
    const result = findPayablePurchaseOrders(purchaseOrders, payments);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('POD-00002');
  });
});

describe('submitPaymentApproval', () => {
  it('should return payment with status 承認待ち', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '下書き' };

    // Act
    const result = submitPaymentApproval(payment);

    // Assert
    expect(result.status).toBe('承認待ち');
  });

  it('should not mutate original payment', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '下書き' };

    // Act
    submitPaymentApproval(payment);

    // Assert
    expect(payment.status).toBe('下書き');
  });
});

describe('approvePayment', () => {
  it('should return payment with status 承認済', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '承認待ち' };

    // Act
    const result = approvePayment(payment);

    // Assert
    expect(result.status).toBe('承認済');
  });

  it('should not mutate original payment', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '承認待ち' };

    // Act
    approvePayment(payment);

    // Assert
    expect(payment.status).toBe('承認待ち');
  });
});

describe('rejectPayment', () => {
  it('should return payment with status 却下 when payment is rejected', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '承認待ち' };

    // Act
    const result = rejectPayment(payment, '');

    // Assert
    expect(result.status).toBe('却下');
  });

  it('should store rejectReason when reason provided', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '承認待ち' };

    // Act
    const result = rejectPayment(payment, '金額が予算超過');

    // Assert
    expect(result.rejectReason).toBe('金額が予算超過');
  });

  it('should not mutate original payment', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '承認待ち' };

    // Act
    rejectPayment(payment, '');

    // Assert
    expect(payment.status).toBe('承認待ち');
  });
});

describe('cancelPayment', () => {
  it('should return payment with status キャンセル', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '下書き' };

    // Act
    const result = cancelPayment(payment);

    // Assert
    expect(result.status).toBe('キャンセル');
  });

  it('should not mutate original payment', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '下書き' };

    // Act
    cancelPayment(payment);

    // Assert
    expect(payment.status).toBe('下書き');
  });
});

describe('registerPayment', () => {
  it('should return payment with status 支払済', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '承認済' };

    // Act
    const result = registerPayment(payment);

    // Assert
    expect(result.status).toBe('支払済');
  });

  it('should not mutate original payment', () => {
    // Arrange
    const payment = { code: 'PMT-00001', status: '承認済' };

    // Act
    registerPayment(payment);

    // Assert
    expect(payment.status).toBe('承認済');
  });
});
