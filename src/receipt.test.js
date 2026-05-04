import { describe, it, expect } from 'vitest';
import { generateReceiptCode, createReceipt, calcRemainingBalance, isFullyPaid } from './receipt.js';

describe('generateReceiptCode', () => {
  it('should return RCP-00001 when no existing codes', () => {
    // Arrange
    const existingCodes = [];

    // Act
    const result = generateReceiptCode(existingCodes);

    // Assert
    expect(result).toBe('RCP-00001');
  });

  it('should return RCP-00006 when codes RCP-00001 to RCP-00005 exist', () => {
    // Arrange
    const existingCodes = ['RCP-00001', 'RCP-00002', 'RCP-00003', 'RCP-00004', 'RCP-00005'];

    // Act
    const result = generateReceiptCode(existingCodes);

    // Assert
    expect(result).toBe('RCP-00006');
  });

  it('should return RCP-00010 when max code is RCP-00009', () => {
    // Arrange
    const existingCodes = ['RCP-00009', 'RCP-00003'];

    // Act
    const result = generateReceiptCode(existingCodes);

    // Assert
    expect(result).toBe('RCP-00010');
  });
});

describe('createReceipt', () => {
  it('should set code from parameter', () => {
    // Arrange & Act
    const result = createReceipt('RCP-00001', 'INV-00001', '2026-05-31', 100000, 0, '');

    // Assert
    expect(result.code).toBe('RCP-00001');
  });

  it('should set invoiceCode from parameter', () => {
    // Arrange & Act
    const result = createReceipt('RCP-00001', 'INV-00001', '2026-05-31', 100000, 0, '');

    // Assert
    expect(result.invoiceCode).toBe('INV-00001');
  });

  it('should set receiptDate from parameter', () => {
    // Arrange & Act
    const result = createReceipt('RCP-00001', 'INV-00001', '2026-05-31', 100000, 0, '');

    // Assert
    expect(result.receiptDate).toBe('2026-05-31');
  });

  it('should set amount from parameter', () => {
    // Arrange & Act
    const result = createReceipt('RCP-00001', 'INV-00001', '2026-05-31', 100000, 0, '');

    // Assert
    expect(result.amount).toBe(100000);
  });

  it('should set fee from parameter', () => {
    // Arrange & Act
    const result = createReceipt('RCP-00001', 'INV-00001', '2026-05-31', 100000, 500, '手数料差引');

    // Assert
    expect(result.fee).toBe(500);
  });

  it('should set notes from parameter', () => {
    // Arrange & Act
    const result = createReceipt('RCP-00001', 'INV-00001', '2026-05-31', 100000, 500, '手数料差引');

    // Assert
    expect(result.notes).toBe('手数料差引');
  });
});

describe('calcRemainingBalance', () => {
  const invoice = { code: 'INV-00001', total: 528000 };

  it('should return invoice total when no receipts', () => {
    // Arrange
    const receipts = [];

    // Act
    const result = calcRemainingBalance(invoice, receipts);

    // Assert
    expect(result).toBe(528000);
  });

  it('should return remaining amount after partial payment', () => {
    // Arrange
    const receipts = [
      { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: 200000, fee: 0 }
    ];

    // Act
    const result = calcRemainingBalance(invoice, receipts);

    // Assert
    expect(result).toBe(328000);
  });

  it('should return 0 when fully paid', () => {
    // Arrange
    const receipts = [
      { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: 528000, fee: 0 }
    ];

    // Act
    const result = calcRemainingBalance(invoice, receipts);

    // Assert
    expect(result).toBe(0);
  });

  it('should ignore receipts for other invoices', () => {
    // Arrange
    const receipts = [
      { code: 'RCP-00001', invoiceCode: 'INV-00002', amount: 528000, fee: 0 }
    ];

    // Act
    const result = calcRemainingBalance(invoice, receipts);

    // Assert
    expect(result).toBe(528000);
  });

  it('should accumulate multiple receipts', () => {
    // Arrange
    const receipts = [
      { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: 200000, fee: 0 },
      { code: 'RCP-00002', invoiceCode: 'INV-00001', amount: 328000, fee: 0 }
    ];

    // Act
    const result = calcRemainingBalance(invoice, receipts);

    // Assert
    expect(result).toBe(0);
  });
});

describe('isFullyPaid', () => {
  const invoice = { code: 'INV-00001', total: 528000 };

  it('should return false when no receipts', () => {
    // Arrange & Act
    const result = isFullyPaid(invoice, []);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when partially paid', () => {
    // Arrange
    const receipts = [
      { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: 200000, fee: 0 }
    ];

    // Act
    const result = isFullyPaid(invoice, receipts);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true when fully paid', () => {
    // Arrange
    const receipts = [
      { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: 528000, fee: 0 }
    ];

    // Act
    const result = isFullyPaid(invoice, receipts);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true when overpaid', () => {
    // Arrange
    const receipts = [
      { code: 'RCP-00001', invoiceCode: 'INV-00001', amount: 600000, fee: 0 }
    ];

    // Act
    const result = isFullyPaid(invoice, receipts);

    // Assert
    expect(result).toBe(true);
  });
});
