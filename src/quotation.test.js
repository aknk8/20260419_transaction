import { describe, it, expect } from 'vitest';
import { generateQuotationCode, createQuotation, findQuotationByCode, addDetailLine, removeDetailLine, updateDetailLine, createRevision, rejectQuotation, buildQuotationPrintHtml } from './quotation.js';

describe('generateQuotationCode', () => {
  it('should return QUO-00001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];

    // Act
    const result = generateQuotationCode(existingCodes);

    // Assert
    expect(result).toBe('QUO-00001');
  });

  it('should return QUO-00006 when codes QUO-00001 to QUO-00005 exist', () => {
    // Arrange
    const existingCodes = ['QUO-00001', 'QUO-00002', 'QUO-00003', 'QUO-00004', 'QUO-00005'];

    // Act
    const result = generateQuotationCode(existingCodes);

    // Assert
    expect(result).toBe('QUO-00006');
  });

  it('should return QUO-00010 when max code is QUO-00009', () => {
    // Arrange
    const existingCodes = ['QUO-00009', 'QUO-00003'];

    // Act
    const result = generateQuotationCode(existingCodes);

    // Assert
    expect(result).toBe('QUO-00010');
  });

  it('should pad to 5 digits', () => {
    // Arrange
    const existingCodes = ['QUO-00099'];

    // Act
    const result = generateQuotationCode(existingCodes);

    // Assert
    expect(result).toBe('QUO-00100');
  });
});

describe('createQuotation', () => {
  it('should create quotation with all required fields', () => {
    // Arrange
    const formData = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '新規保守案件 初回見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      details: []
    };

    // Act
    const result = createQuotation(formData);

    // Assert
    expect(result.code).toBe('QUO-00001');
    expect(result.projectCode).toBe('PJ-00001');
    expect(result.customerId).toBe('CUS-001');
    expect(result.title).toBe('新規保守案件 初回見積');
    expect(result.issueDate).toBe('2026-01-10');
    expect(result.validityDate).toBe('2026-02-10');
    expect(result.version).toBe(1);
    expect(result.details).toEqual([]);
  });

  it('should set status to 下書き by default', () => {
    // Arrange
    const formData = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      details: []
    };

    // Act
    const result = createQuotation(formData);

    // Assert
    expect(result.status).toBe('下書き');
  });

  it('should use provided status when given', () => {
    // Arrange
    const formData = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      status: '承認済み',
      details: []
    };

    // Act
    const result = createQuotation(formData);

    // Assert
    expect(result.status).toBe('承認済み');
  });

  it('should set notes to empty string by default', () => {
    // Arrange
    const formData = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      details: []
    };

    // Act
    const result = createQuotation(formData);

    // Assert
    expect(result.notes).toBe('');
  });

  it('should calculate subtotal, taxAmount, and total from details', () => {
    // Arrange
    const formData = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      details: [
        { lineNo: 1, productCode: 'PRD-001', productName: 'システム開発', quantity: 1, unit: '式', unitPrice: 500000, discount: 0, taxRate: 0.10 },
        { lineNo: 2, productCode: 'PRD-002', productName: '保守費用', quantity: 12, unit: '月', unitPrice: 50000, discount: 0, taxRate: 0.10 }
      ]
    };

    // Act
    const result = createQuotation(formData);

    // Assert
    expect(result.subtotal).toBe(1100000);
    expect(result.taxAmount).toBe(110000);
    expect(result.total).toBe(1210000);
  });

  it('should calculate amount reflecting discount in detail lines', () => {
    // Arrange
    const formData = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      details: [
        { lineNo: 1, productCode: 'PRD-001', productName: '商品A', quantity: 2, unit: '個', unitPrice: 100000, discount: 10000, taxRate: 0.10 }
      ]
    };

    // Act
    const result = createQuotation(formData);

    // Assert
    expect(result.subtotal).toBe(190000);
    expect(result.taxAmount).toBe(19000);
    expect(result.total).toBe(209000);
  });
});

describe('findQuotationByCode', () => {
  it('should return quotation when code matches', () => {
    // Arrange
    const quotations = [
      { code: 'QUO-00001', title: '見積A' },
      { code: 'QUO-00002', title: '見積B' }
    ];

    // Act
    const result = findQuotationByCode(quotations, 'QUO-00001');

    // Assert
    expect(result).toEqual({ code: 'QUO-00001', title: '見積A' });
  });

  it('should return null when code does not match', () => {
    // Arrange
    const quotations = [{ code: 'QUO-00001', title: '見積A' }];

    // Act
    const result = findQuotationByCode(quotations, 'QUO-00099');

    // Assert
    expect(result).toBeNull();
  });
});

describe('addDetailLine', () => {
  it('should append a new blank line with next lineNo when details are empty', () => {
    // Arrange
    const details = [];

    // Act
    const result = addDetailLine(details);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].lineNo).toBe(1);
    expect(result[0].productCode).toBe('');
    expect(result[0].quantity).toBe(1);
    expect(result[0].discount).toBe(0);
  });

  it('should append a line with lineNo incremented from max existing lineNo', () => {
    // Arrange
    const details = [
      { lineNo: 1, productCode: 'PRD-001', productName: '商品A', quantity: 1, unit: '式', unitPrice: 100000, discount: 0, taxRate: 0.10 },
      { lineNo: 2, productCode: 'PRD-002', productName: '商品B', quantity: 2, unit: '個', unitPrice: 5000, discount: 0, taxRate: 0.10 }
    ];

    // Act
    const result = addDetailLine(details);

    // Assert
    expect(result).toHaveLength(3);
    expect(result[2].lineNo).toBe(3);
  });

  it('should not mutate the original details array', () => {
    // Arrange
    const details = [{ lineNo: 1, productCode: 'PRD-001', productName: '商品A', quantity: 1, unit: '式', unitPrice: 100000, discount: 0, taxRate: 0.10 }];

    // Act
    addDetailLine(details);

    // Assert
    expect(details).toHaveLength(1);
  });
});

describe('removeDetailLine', () => {
  it('should remove the line with the given lineNo', () => {
    // Arrange
    const details = [
      { lineNo: 1, productCode: 'PRD-001', productName: '商品A', quantity: 1, unit: '式', unitPrice: 100000, discount: 0, taxRate: 0.10 },
      { lineNo: 2, productCode: 'PRD-002', productName: '商品B', quantity: 2, unit: '個', unitPrice: 5000, discount: 0, taxRate: 0.10 }
    ];

    // Act
    const result = removeDetailLine(details, 1);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].lineNo).toBe(2);
  });

  it('should return unchanged array when lineNo does not exist', () => {
    // Arrange
    const details = [{ lineNo: 1, productCode: 'PRD-001', productName: '商品A', quantity: 1, unit: '式', unitPrice: 100000, discount: 0, taxRate: 0.10 }];

    // Act
    const result = removeDetailLine(details, 99);

    // Assert
    expect(result).toHaveLength(1);
  });

  it('should not mutate the original details array', () => {
    // Arrange
    const details = [{ lineNo: 1, productCode: 'PRD-001', productName: '商品A', quantity: 1, unit: '式', unitPrice: 100000, discount: 0, taxRate: 0.10 }];

    // Act
    removeDetailLine(details, 1);

    // Assert
    expect(details).toHaveLength(1);
  });
});

describe('updateDetailLine', () => {
  it('should update the field of the line with the given lineNo', () => {
    // Arrange
    const details = [
      { lineNo: 1, productCode: '', productName: '', quantity: 1, unit: '', unitPrice: 0, discount: 0, taxRate: 0.10 }
    ];

    // Act
    const result = updateDetailLine(details, 1, 'unitPrice', 50000);

    // Assert
    expect(result[0].unitPrice).toBe(50000);
    expect(result[0].lineNo).toBe(1);
  });

  it('should not affect other lines when updating one line', () => {
    // Arrange
    const details = [
      { lineNo: 1, productCode: 'PRD-001', productName: '商品A', quantity: 1, unit: '式', unitPrice: 100000, discount: 0, taxRate: 0.10 },
      { lineNo: 2, productCode: 'PRD-002', productName: '商品B', quantity: 2, unit: '個', unitPrice: 5000, discount: 0, taxRate: 0.10 }
    ];

    // Act
    const result = updateDetailLine(details, 1, 'quantity', 3);

    // Assert
    expect(result[0].quantity).toBe(3);
    expect(result[1].quantity).toBe(2);
  });

  it('should not mutate the original details array', () => {
    // Arrange
    const details = [{ lineNo: 1, productCode: '', productName: '', quantity: 1, unit: '', unitPrice: 0, discount: 0, taxRate: 0.10 }];

    // Act
    updateDetailLine(details, 1, 'unitPrice', 50000);

    // Assert
    expect(details[0].unitPrice).toBe(0);
  });
});

describe('createRevision', () => {
  it('should create new quotation with incremented version and new code', () => {
    // Arrange
    const original = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '初回見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      status: '承認済み',
      notes: '',
      details: []
    };

    // Act
    const result = createRevision(original, 'QUO-00006');

    // Assert
    expect(result.code).toBe('QUO-00006');
    expect(result.version).toBe(2);
    expect(result.status).toBe('下書き');
  });

  it('should copy header fields from original quotation', () => {
    // Arrange
    const original = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '初回見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 2,
      status: '承認済み',
      notes: '備考あり',
      details: []
    };

    // Act
    const result = createRevision(original, 'QUO-00007');

    // Assert
    expect(result.projectCode).toBe('PJ-00001');
    expect(result.customerId).toBe('CUS-001');
    expect(result.title).toBe('初回見積');
    expect(result.issueDate).toBe('2026-01-10');
    expect(result.validityDate).toBe('2026-02-10');
    expect(result.notes).toBe('備考あり');
  });

  it('should copy detail lines from original quotation', () => {
    // Arrange
    const original = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '初回見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      status: '承認済み',
      notes: '',
      details: [
        { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守', quantity: 1, unit: '式', unitPrice: 500000, discount: 0, taxRate: 0.10 }
      ]
    };

    // Act
    const result = createRevision(original, 'QUO-00006');

    // Assert
    expect(result.details).toHaveLength(1);
    expect(result.details[0].productCode).toBe('PRD-001');
    expect(result.details[0].unitPrice).toBe(500000);
  });

  it('should not mutate original quotation', () => {
    // Arrange
    const original = {
      code: 'QUO-00001',
      projectCode: 'PJ-00001',
      customerId: 'CUS-001',
      title: '初回見積',
      issueDate: '2026-01-10',
      validityDate: '2026-02-10',
      version: 1,
      status: '承認済み',
      notes: '',
      details: [{ lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守', quantity: 1, unit: '式', unitPrice: 500000, discount: 0, taxRate: 0.10 }]
    };

    // Act
    createRevision(original, 'QUO-00006');

    // Assert
    expect(original.code).toBe('QUO-00001');
    expect(original.version).toBe(1);
    expect(original.status).toBe('承認済み');
    expect(original.details).toHaveLength(1);
  });
});

describe('rejectQuotation', () => {
  it('should set status to 却下', () => {
    // Arrange
    const quotation = { code: 'QUO-00003', status: '承認依頼中', title: '見積' };

    // Act
    const result = rejectQuotation(quotation, '金額が予算を超過しています。');

    // Assert
    expect(result.status).toBe('却下');
  });

  it('should save reject reason', () => {
    // Arrange
    const quotation = { code: 'QUO-00003', status: '承認依頼中', title: '見積' };

    // Act
    const result = rejectQuotation(quotation, '金額が予算を超過しています。');

    // Assert
    expect(result.rejectReason).toBe('金額が予算を超過しています。');
  });

  it('should not mutate original quotation', () => {
    // Arrange
    const quotation = { code: 'QUO-00003', status: '承認依頼中', title: '見積' };

    // Act
    rejectQuotation(quotation, '理由');

    // Assert
    expect(quotation.status).toBe('承認依頼中');
    expect(quotation.rejectReason).toBeUndefined();
  });
});

describe('buildQuotationPrintHtml', () => {
  const baseQuotation = {
    code: 'QUO-00001',
    title: '新規保守案件 初回見積',
    version: 1,
    issueDate: '2026-01-10',
    validityDate: '2026-02-10',
    notes: '別途交通費実費',
    subtotal: 600000,
    taxAmount: 60000,
    total: 660000,
    details: [
      { lineNo: 1, productCode: 'PRD-001', productName: 'サーバー保守サービス', quantity: 12, unit: '月', unitPrice: 50000, discount: 0, taxRate: 0.10, amount: 660000 }
    ]
  };

  it('should include quotation title in output', () => {
    // Arrange & Act
    const result = buildQuotationPrintHtml(baseQuotation, null, null);

    // Assert
    expect(result).toContain('新規保守案件 初回見積');
  });

  it('should include quotation code in output', () => {
    // Arrange & Act
    const result = buildQuotationPrintHtml(baseQuotation, null, null);

    // Assert
    expect(result).toContain('QUO-00001');
  });

  it('should include customer name when customer is provided', () => {
    // Arrange
    const customer = { name: '株式会社青葉システム' };

    // Act
    const result = buildQuotationPrintHtml(baseQuotation, null, customer);

    // Assert
    expect(result).toContain('株式会社青葉システム');
  });

  it('should include total amount formatted with comma', () => {
    // Arrange & Act
    const result = buildQuotationPrintHtml(baseQuotation, null, null);

    // Assert
    expect(result).toContain('660,000');
  });

  it('should include detail line product name', () => {
    // Arrange & Act
    const result = buildQuotationPrintHtml(baseQuotation, null, null);

    // Assert
    expect(result).toContain('サーバー保守サービス');
  });

  it('should include issue date in output', () => {
    // Arrange & Act
    const result = buildQuotationPrintHtml(baseQuotation, null, null);

    // Assert
    expect(result).toContain('2026-01-10');
  });

  it('should include notes in output when notes are present', () => {
    // Arrange & Act
    const result = buildQuotationPrintHtml(baseQuotation, null, null);

    // Assert
    expect(result).toContain('別途交通費実費');
  });
});
