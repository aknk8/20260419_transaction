import { describe, it, expect } from 'vitest';
import { generateDeliveryCode, createDelivery, acceptDelivery, rejectDelivery, isFullyDelivered, getAcceptedQuantity, getRemainingQuantity } from './delivery.js';

describe('generateDeliveryCode', () => {
  it('should return DLV-00001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];

    // Act
    const result = generateDeliveryCode(existingCodes);

    // Assert
    expect(result).toBe('DLV-00001');
  });

  it('should return DLV-00006 when codes DLV-00001 to DLV-00005 exist', () => {
    // Arrange
    const existingCodes = ['DLV-00001', 'DLV-00002', 'DLV-00003', 'DLV-00004', 'DLV-00005'];

    // Act
    const result = generateDeliveryCode(existingCodes);

    // Assert
    expect(result).toBe('DLV-00006');
  });

  it('should return DLV-00010 when max code is DLV-00009', () => {
    // Arrange
    const existingCodes = ['DLV-00009', 'DLV-00003'];

    // Act
    const result = generateDeliveryCode(existingCodes);

    // Assert
    expect(result).toBe('DLV-00010');
  });
});

describe('createDelivery', () => {
  it('should set code from parameter', () => {
    // Arrange & Act
    const result = createDelivery('DLV-00001', 'POD-00001', '2026-05-10', '');

    // Assert
    expect(result.code).toBe('DLV-00001');
  });

  it('should set purchaseOrderCode from parameter', () => {
    // Arrange & Act
    const result = createDelivery('DLV-00001', 'POD-00001', '2026-05-10', '');

    // Assert
    expect(result.purchaseOrderCode).toBe('POD-00001');
  });

  it('should set deliveryDate from parameter', () => {
    // Arrange & Act
    const result = createDelivery('DLV-00001', 'POD-00001', '2026-05-10', '');

    // Assert
    expect(result.deliveryDate).toBe('2026-05-10');
  });

  it('should set notes from parameter', () => {
    // Arrange & Act
    const result = createDelivery('DLV-00001', 'POD-00001', '2026-05-10', '検収依頼');

    // Assert
    expect(result.notes).toBe('検収依頼');
  });

  it('should set status to 検収待ち', () => {
    // Arrange & Act
    const result = createDelivery('DLV-00001', 'POD-00001', '2026-05-10', '');

    // Assert
    expect(result.status).toBe('検収待ち');
  });

  it('should initialize empty details array', () => {
    // Arrange & Act
    const result = createDelivery('DLV-00001', 'POD-00001', '2026-05-10', '');

    // Assert
    expect(result.details).toEqual([]);
  });
});

describe('acceptDelivery', () => {
  const delivery = { code: 'DLV-00001', purchaseOrderCode: 'POD-00001', status: '検収待ち', notes: '' };

  it('should return new object with status 検収済', () => {
    // Arrange & Act
    const result = acceptDelivery(delivery);

    // Assert
    expect(result.status).toBe('検収済');
  });

  it('should not mutate original delivery', () => {
    // Arrange & Act
    acceptDelivery(delivery);

    // Assert
    expect(delivery.status).toBe('検収待ち');
  });

  it('should preserve other fields when accepting delivery', () => {
    // Arrange & Act
    const result = acceptDelivery(delivery);

    // Assert
    expect(result.code).toBe('DLV-00001');
    expect(result.purchaseOrderCode).toBe('POD-00001');
  });
});

describe('rejectDelivery', () => {
  const delivery = { code: 'DLV-00001', purchaseOrderCode: 'POD-00001', status: '検収待ち', notes: '' };

  it('should return new object with status 検収NG', () => {
    // Arrange & Act
    const result = rejectDelivery(delivery);

    // Assert
    expect(result.status).toBe('検収NG');
  });

  it('should not mutate original delivery', () => {
    // Arrange & Act
    rejectDelivery(delivery);

    // Assert
    expect(delivery.status).toBe('検収待ち');
  });

  it('should preserve other fields when rejecting delivery', () => {
    // Arrange & Act
    const result = rejectDelivery(delivery);

    // Assert
    expect(result.code).toBe('DLV-00001');
    expect(result.purchaseOrderCode).toBe('POD-00001');
  });
});

describe('isFullyDelivered', () => {
  const purchaseOrder = {
    code: 'POD-00001',
    details: [
      { lineNo: 1, quantity: 10 },
      { lineNo: 2, quantity: 5 }
    ]
  };

  it('should return true when all lines are fully delivered in one delivery', () => {
    // Arrange
    const deliveries = [
      {
        purchaseOrderCode: 'POD-00001',
        status: '検収済',
        details: [
          { lineNo: 1, deliveredQuantity: 10 },
          { lineNo: 2, deliveredQuantity: 5 }
        ]
      }
    ];

    // Act
    const result = isFullyDelivered(purchaseOrder, deliveries);

    // Assert
    expect(result).toBe(true);
  });

  it('should return false when some lines are partially delivered', () => {
    // Arrange
    const deliveries = [
      {
        purchaseOrderCode: 'POD-00001',
        status: '検収済',
        details: [
          { lineNo: 1, deliveredQuantity: 5 },
          { lineNo: 2, deliveredQuantity: 5 }
        ]
      }
    ];

    // Act
    const result = isFullyDelivered(purchaseOrder, deliveries);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when no deliveries exist', () => {
    // Arrange & Act
    const result = isFullyDelivered(purchaseOrder, []);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true when multiple deliveries together cover all lines', () => {
    // Arrange
    const deliveries = [
      {
        purchaseOrderCode: 'POD-00001',
        status: '検収済',
        details: [{ lineNo: 1, deliveredQuantity: 6 }]
      },
      {
        purchaseOrderCode: 'POD-00001',
        status: '検収済',
        details: [
          { lineNo: 1, deliveredQuantity: 4 },
          { lineNo: 2, deliveredQuantity: 5 }
        ]
      }
    ];

    // Act
    const result = isFullyDelivered(purchaseOrder, deliveries);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true when purchase order has no detail lines', () => {
    // Arrange
    const emptyPO = { code: 'POD-00002', details: [] };

    // Act
    const result = isFullyDelivered(emptyPO, []);

    // Assert
    expect(result).toBe(true);
  });

  it('should ignore deliveries for other purchase orders', () => {
    // Arrange
    const deliveries = [
      {
        purchaseOrderCode: 'POD-00099',
        details: [
          { lineNo: 1, deliveredQuantity: 10 },
          { lineNo: 2, deliveredQuantity: 5 }
        ]
      }
    ];

    // Act
    const result = isFullyDelivered(purchaseOrder, deliveries);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when deliveries cover quantity but are 検収NG', () => {
    // Arrange — 検収NGの納品は発注残として継続計上するため未完了扱い
    const deliveries = [
      {
        purchaseOrderCode: 'POD-00001',
        status: '検収NG',
        details: [
          { lineNo: 1, deliveredQuantity: 10 },
          { lineNo: 2, deliveredQuantity: 5 }
        ]
      }
    ];

    // Act
    const result = isFullyDelivered(purchaseOrder, deliveries);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true only when all lines are covered by 検収済 deliveries', () => {
    // Arrange
    const deliveries = [
      {
        purchaseOrderCode: 'POD-00001',
        status: '検収NG',
        details: [{ lineNo: 1, deliveredQuantity: 10 }, { lineNo: 2, deliveredQuantity: 5 }]
      },
      {
        purchaseOrderCode: 'POD-00001',
        status: '検収済',
        details: [{ lineNo: 1, deliveredQuantity: 10 }, { lineNo: 2, deliveredQuantity: 5 }]
      }
    ];

    // Act
    const result = isFullyDelivered(purchaseOrder, deliveries);

    // Assert
    expect(result).toBe(true);
  });
});

describe('getAcceptedQuantity', () => {
  const deliveries = [
    {
      purchaseOrderCode: 'POD-00001',
      status: '検収済',
      details: [{ lineNo: 1, deliveredQuantity: 6 }]
    },
    {
      purchaseOrderCode: 'POD-00001',
      status: '検収NG',
      details: [{ lineNo: 1, deliveredQuantity: 4 }]
    },
    {
      purchaseOrderCode: 'POD-00001',
      status: '検収待ち',
      details: [{ lineNo: 2, deliveredQuantity: 3 }]
    }
  ];

  it('should return only quantity from 検収済 deliveries for the given line', () => {
    // Arrange & Act
    const result = getAcceptedQuantity(1, deliveries);

    // Assert
    expect(result).toBe(6);
  });

  it('should not count 検収NG deliveries', () => {
    // Arrange
    const ngOnly = [
      { purchaseOrderCode: 'POD-00001', status: '検収NG', details: [{ lineNo: 1, deliveredQuantity: 10 }] }
    ];

    // Act
    const result = getAcceptedQuantity(1, ngOnly);

    // Assert
    expect(result).toBe(0);
  });

  it('should not count 検収待ち deliveries', () => {
    // Arrange & Act
    const result = getAcceptedQuantity(2, deliveries);

    // Assert
    expect(result).toBe(0);
  });

  it('should return 0 when no deliveries have the given lineNo', () => {
    // Arrange & Act
    const result = getAcceptedQuantity(99, deliveries);

    // Assert
    expect(result).toBe(0);
  });

  it('should sum quantities across multiple 検収済 deliveries for the same line', () => {
    // Arrange
    const multipleAccepted = [
      { purchaseOrderCode: 'POD-00001', status: '検収済', details: [{ lineNo: 1, deliveredQuantity: 3 }] },
      { purchaseOrderCode: 'POD-00001', status: '検収済', details: [{ lineNo: 1, deliveredQuantity: 7 }] }
    ];

    // Act
    const result = getAcceptedQuantity(1, multipleAccepted);

    // Assert
    expect(result).toBe(10);
  });
});

describe('getRemainingQuantity', () => {
  it('should return full ordered quantity when no deliveries exist', () => {
    // Arrange & Act
    const result = getRemainingQuantity(1, 10, []);

    // Assert
    expect(result).toBe(10);
  });

  it('should return remaining quantity after accepted deliveries', () => {
    // Arrange
    const deliveries = [
      { status: '検収済', details: [{ lineNo: 1, deliveredQuantity: 6 }] }
    ];

    // Act
    const result = getRemainingQuantity(1, 10, deliveries);

    // Assert
    expect(result).toBe(4);
  });

  it('should count 検収NG delivery as remaining', () => {
    // Arrange — 検収NG分は再納品が必要なため発注残として継続計上する
    const deliveries = [
      { status: '検収NG', details: [{ lineNo: 1, deliveredQuantity: 10 }] }
    ];

    // Act
    const result = getRemainingQuantity(1, 10, deliveries);

    // Assert
    expect(result).toBe(10);
  });

  it('should return 0 when all ordered quantity is accepted', () => {
    // Arrange
    const deliveries = [
      { status: '検収済', details: [{ lineNo: 1, deliveredQuantity: 10 }] }
    ];

    // Act
    const result = getRemainingQuantity(1, 10, deliveries);

    // Assert
    expect(result).toBe(0);
  });
});
