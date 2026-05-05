import { describe, it, expect } from 'vitest';
import { getSalesSummary, getSalesCostReport, getUncollectedInvoices, getUnpaidPayments, filterReportByYear, getReportTotals, getSalesCostByCustomer, getSalesCostByProject } from './report.js';

describe('getSalesSummary', () => {
  it('should return empty array when invoices is empty', () => {
    // Arrange / Act
    const result = getSalesSummary([]);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return one row for single confirmed invoice', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result.length).toBe(1);
  });

  it('should return yearMonth in YYYY-MM format from invoiceDate', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result[0].yearMonth).toBe('2026-01');
  });

  it('should return sales as total of confirmed invoice', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result[0].sales).toBe(528000);
  });

  it('should not include 下書き invoices', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '下書き', total: 528000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result).toEqual([]);
  });

  it('should not include キャンセル invoices', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: 'キャンセル', total: 528000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result).toEqual([]);
  });

  it('should include 送付済 invoices', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result.length).toBe(1);
  });

  it('should include 入金済 invoices', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-03-31', status: '入金済', total: 2200000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result.length).toBe(1);
  });

  it('should include 一部入金 invoices', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-03-31', status: '一部入金', total: 500000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result.length).toBe(1);
  });

  it('should group multiple invoices in same month', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-10', status: '送付済', total: 100000 },
      { code: 'INV-00002', invoiceDate: '2026-01-31', status: '入金済', total: 200000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result.length).toBe(1);
    expect(result[0].yearMonth).toBe('2026-01');
    expect(result[0].sales).toBe(300000);
  });

  it('should return separate rows for different months', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 },
      { code: 'INV-00002', invoiceDate: '2026-03-31', status: '入金済', total: 2200000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result.length).toBe(2);
  });

  it('should return rows sorted by yearMonth ascending', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00002', invoiceDate: '2026-03-31', status: '入金済', total: 2200000 },
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result[0].yearMonth).toBe('2026-01');
    expect(result[1].yearMonth).toBe('2026-03');
  });

  it('should include 確定 invoices', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '確定', total: 300000 }
    ];

    // Act
    const result = getSalesSummary(invoices);

    // Assert
    expect(result.length).toBe(1);
  });
});

describe('getSalesCostReport', () => {
  it('should return empty array when both inputs are empty', () => {
    // Arrange / Act
    const result = getSalesCostReport([], []);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return sales from confirmed invoice', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 }
    ];

    // Act
    const result = getSalesCostReport(invoices, []);

    // Assert
    expect(result[0].sales).toBe(528000);
  });

  it('should return cost from 支払済 payment', () => {
    // Arrange
    const payments = [
      { code: 'PMT-00001', paymentDate: '2026-04-30', status: '支払済', amount: 110000 }
    ];

    // Act
    const result = getSalesCostReport([], payments);

    // Assert
    expect(result[0].cost).toBe(110000);
  });

  it('should not include 承認済 payments in cost', () => {
    // Arrange
    const payments = [
      { code: 'PMT-00001', paymentDate: '2026-05-31', status: '承認済', amount: 1100000 }
    ];

    // Act
    const result = getSalesCostReport([], payments);

    // Assert
    expect(result).toEqual([]);
  });

  it('should not include 下書き invoices in sales', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-04-30', status: '下書き', total: 385000 }
    ];

    // Act
    const result = getSalesCostReport(invoices, []);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return grossProfit as sales minus cost', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 600000 }
    ];
    const payments = [
      { code: 'PMT-00001', paymentDate: '2026-01-31', status: '支払済', amount: 400000 }
    ];

    // Act
    const result = getSalesCostReport(invoices, payments);

    // Assert
    expect(result[0].grossProfit).toBe(200000);
  });

  it('should return zero cost when no payments in that month', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 }
    ];

    // Act
    const result = getSalesCostReport(invoices, []);

    // Assert
    expect(result[0].cost).toBe(0);
  });

  it('should return zero sales when no invoices in that month', () => {
    // Arrange
    const payments = [
      { code: 'PMT-00001', paymentDate: '2026-04-30', status: '支払済', amount: 110000 }
    ];

    // Act
    const result = getSalesCostReport([], payments);

    // Assert
    expect(result[0].sales).toBe(0);
  });

  it('should combine sales and cost for same month', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-01-31', status: '送付済', total: 528000 }
    ];
    const payments = [
      { code: 'PMT-00001', paymentDate: '2026-01-15', status: '支払済', amount: 100000 }
    ];

    // Act
    const result = getSalesCostReport(invoices, payments);

    // Assert
    expect(result.length).toBe(1);
    expect(result[0].yearMonth).toBe('2026-01');
    expect(result[0].sales).toBe(528000);
    expect(result[0].cost).toBe(100000);
    expect(result[0].grossProfit).toBe(428000);
  });

  it('should return rows sorted by yearMonth ascending', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', invoiceDate: '2026-03-31', status: '入金済', total: 2200000 }
    ];
    const payments = [
      { code: 'PMT-00001', paymentDate: '2026-01-15', status: '支払済', amount: 110000 }
    ];

    // Act
    const result = getSalesCostReport(invoices, payments);

    // Assert
    expect(result[0].yearMonth).toBe('2026-01');
    expect(result[1].yearMonth).toBe('2026-03');
  });
});

describe('getUncollectedInvoices', () => {
  it('should return empty array when invoices is empty', () => {
    // Arrange / Act
    const result = getUncollectedInvoices([]);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return invoice with status 送付済', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', status: '送付済', total: 528000 }
    ];

    // Act
    const result = getUncollectedInvoices(invoices);

    // Assert
    expect(result.length).toBe(1);
  });

  it('should return invoice with status 一部入金', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', status: '一部入金', total: 528000 }
    ];

    // Act
    const result = getUncollectedInvoices(invoices);

    // Assert
    expect(result.length).toBe(1);
  });

  it('should not return invoice with status 入金済', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', status: '入金済', total: 2200000 }
    ];

    // Act
    const result = getUncollectedInvoices(invoices);

    // Assert
    expect(result).toEqual([]);
  });

  it('should not return invoice with status 下書き', () => {
    // Arrange
    const invoices = [
      { code: 'INV-00001', status: '下書き', total: 385000 }
    ];

    // Act
    const result = getUncollectedInvoices(invoices);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return original invoice object', () => {
    // Arrange
    const inv = { code: 'INV-00001', status: '送付済', total: 528000, dueDate: '2026-02-28' };

    // Act
    const result = getUncollectedInvoices([inv]);

    // Assert
    expect(result[0]).toBe(inv);
  });
});

describe('getUnpaidPayments', () => {
  it('should return empty array when payments is empty', () => {
    // Arrange / Act
    const result = getUnpaidPayments([]);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return payment with status 承認済', () => {
    // Arrange
    const payments = [
      { code: 'PMT-00001', status: '承認済', amount: 1100000 }
    ];

    // Act
    const result = getUnpaidPayments(payments);

    // Assert
    expect(result.length).toBe(1);
  });

  it('should not return payment with status 支払済', () => {
    // Arrange
    const payments = [
      { code: 'PMT-00001', status: '支払済', amount: 110000 }
    ];

    // Act
    const result = getUnpaidPayments(payments);

    // Assert
    expect(result).toEqual([]);
  });

  it('should not return payment with status 承認待ち', () => {
    // Arrange
    const payments = [
      { code: 'PMT-00001', status: '承認待ち', amount: 110000 }
    ];

    // Act
    const result = getUnpaidPayments(payments);

    // Assert
    expect(result).toEqual([]);
  });

  it('should return original payment object', () => {
    // Arrange
    const pmt = { code: 'PMT-00001', status: '承認済', amount: 1100000, paymentDate: '2026-05-31' };

    // Act
    const result = getUnpaidPayments([pmt]);

    // Assert
    expect(result[0]).toBe(pmt);
  });
});

describe('filterReportByYear', () => {
  it('should return all rows when year is all', () => {
    // Arrange
    const rows = [
      { yearMonth: '2026-01', sales: 100 },
      { yearMonth: '2027-01', sales: 200 }
    ];

    // Act
    const result = filterReportByYear(rows, 'all');

    // Assert
    expect(result.length).toBe(2);
  });

  it('should return all rows when year is empty string', () => {
    // Arrange
    const rows = [
      { yearMonth: '2026-01', sales: 100 },
      { yearMonth: '2026-03', sales: 300 }
    ];

    // Act
    const result = filterReportByYear(rows, '');

    // Assert
    expect(result.length).toBe(2);
  });

  it('should return only rows matching the specified year', () => {
    // Arrange
    const rows = [
      { yearMonth: '2026-01', sales: 100 },
      { yearMonth: '2026-03', sales: 300 },
      { yearMonth: '2027-01', sales: 200 }
    ];

    // Act
    const result = filterReportByYear(rows, '2026');

    // Assert
    expect(result.length).toBe(2);
    expect(result[0].yearMonth).toBe('2026-01');
    expect(result[1].yearMonth).toBe('2026-03');
  });

  it('should return empty array when no rows match the year', () => {
    // Arrange
    const rows = [
      { yearMonth: '2026-01', sales: 100 }
    ];

    // Act
    const result = filterReportByYear(rows, '2025');

    // Assert
    expect(result).toEqual([]);
  });

  it('should return empty array when rows is empty', () => {
    // Arrange / Act
    const result = filterReportByYear([], '2026');

    // Assert
    expect(result).toEqual([]);
  });
});

describe('getReportTotals', () => {
  it('should return zeros when rows is empty', () => {
    // Arrange / Act
    const result = getReportTotals([]);

    // Assert
    expect(result).toEqual({ sales: 0, cost: 0, grossProfit: 0 });
  });

  it('should return sales total from single row', () => {
    // Arrange
    const rows = [{ yearMonth: '2026-01', sales: 528000, cost: 0, grossProfit: 528000 }];

    // Act
    const result = getReportTotals(rows);

    // Assert
    expect(result.sales).toBe(528000);
  });

  it('should return cost total from single row', () => {
    // Arrange
    const rows = [{ yearMonth: '2026-04', sales: 0, cost: 110000, grossProfit: -110000 }];

    // Act
    const result = getReportTotals(rows);

    // Assert
    expect(result.cost).toBe(110000);
  });

  it('should return grossProfit total from single row', () => {
    // Arrange
    const rows = [{ yearMonth: '2026-01', sales: 528000, cost: 0, grossProfit: 528000 }];

    // Act
    const result = getReportTotals(rows);

    // Assert
    expect(result.grossProfit).toBe(528000);
  });

  it('should sum sales across multiple rows', () => {
    // Arrange
    const rows = [
      { yearMonth: '2026-01', sales: 528000, cost: 0, grossProfit: 528000 },
      { yearMonth: '2026-03', sales: 2200000, cost: 0, grossProfit: 2200000 }
    ];

    // Act
    const result = getReportTotals(rows);

    // Assert
    expect(result.sales).toBe(2728000);
  });

  it('should sum cost across multiple rows', () => {
    // Arrange
    const rows = [
      { yearMonth: '2026-01', sales: 528000, cost: 100000, grossProfit: 428000 },
      { yearMonth: '2026-03', sales: 2200000, cost: 50000, grossProfit: 2150000 }
    ];

    // Act
    const result = getReportTotals(rows);

    // Assert
    expect(result.cost).toBe(150000);
  });

  it('should sum grossProfit including negative values', () => {
    // Arrange
    const rows = [
      { yearMonth: '2026-01', sales: 528000, cost: 0, grossProfit: 528000 },
      { yearMonth: '2026-04', sales: 55000, cost: 110000, grossProfit: -55000 }
    ];

    // Act
    const result = getReportTotals(rows);

    // Assert
    expect(result.grossProfit).toBe(473000);
  });
});

describe('getSalesCostByCustomer', () => {
  const invoices = [
    { customerId: 'CUS-001', projectCode: 'PJ-001', status: '送付済', total: 100000, invoiceDate: '2026-01-31' },
    { customerId: 'CUS-001', projectCode: 'PJ-002', status: '入金済', total: 200000, invoiceDate: '2026-02-28' },
    { customerId: 'CUS-002', projectCode: 'PJ-003', status: '送付済', total: 50000, invoiceDate: '2026-03-31' },
    { customerId: 'CUS-001', projectCode: 'PJ-001', status: '下書き', total: 300000, invoiceDate: '2026-04-30' }
  ];
  const payments = [
    { purchaseOrderCode: 'POD-001', status: '支払済', amount: 30000, paymentDate: '2026-04-30' },
    { purchaseOrderCode: 'POD-002', status: '承認済', amount: 20000, paymentDate: '2026-05-31' }
  ];
  const purchaseOrders = [
    { code: 'POD-001', orderCode: 'ORD-001' },
    { code: 'POD-002', orderCode: 'ORD-002' }
  ];
  const orders = [
    { code: 'ORD-001', customerId: 'CUS-001', projectCode: 'PJ-001' },
    { code: 'ORD-002', customerId: 'CUS-002', projectCode: 'PJ-003' }
  ];

  it('should return empty array when invoices is empty', () => {
    // Act
    const result = getSalesCostByCustomer([], [], [], []);

    // Assert
    expect(result).toEqual([]);
  });

  it('should group confirmed invoices by customerId', () => {
    // Act
    const result = getSalesCostByCustomer(invoices, payments, purchaseOrders, orders);

    // Assert
    expect(result.length).toBe(2);
  });

  it('should sum sales for CUS-001 from confirmed invoices', () => {
    // Act
    const result = getSalesCostByCustomer(invoices, payments, purchaseOrders, orders);
    const cus001 = result.find(function(r) { return r.customerId === 'CUS-001'; });

    // Assert
    expect(cus001.sales).toBe(300000);
  });

  it('should exclude 下書き invoices from sales', () => {
    // Act
    const result = getSalesCostByCustomer(invoices, payments, purchaseOrders, orders);
    const cus001 = result.find(function(r) { return r.customerId === 'CUS-001'; });

    // Assert
    expect(cus001.sales).toBe(300000); // not 600000
  });

  it('should compute cost from paid payments via purchaseOrder to order', () => {
    // Act
    const result = getSalesCostByCustomer(invoices, payments, purchaseOrders, orders);
    const cus001 = result.find(function(r) { return r.customerId === 'CUS-001'; });

    // Assert
    expect(cus001.cost).toBe(30000);
  });

  it('should exclude 承認済 payments from cost', () => {
    // Act
    const result = getSalesCostByCustomer(invoices, payments, purchaseOrders, orders);
    const cus002 = result.find(function(r) { return r.customerId === 'CUS-002'; });

    // Assert
    expect(cus002.cost).toBe(0); // PMT-002 is 承認済, not 支払済
  });

  it('should compute grossProfit as sales minus cost', () => {
    // Act
    const result = getSalesCostByCustomer(invoices, payments, purchaseOrders, orders);
    const cus001 = result.find(function(r) { return r.customerId === 'CUS-001'; });

    // Assert
    expect(cus001.grossProfit).toBe(270000);
  });

  it('should sort by sales descending', () => {
    // Act
    const result = getSalesCostByCustomer(invoices, payments, purchaseOrders, orders);

    // Assert
    expect(result[0].customerId).toBe('CUS-001');
    expect(result[1].customerId).toBe('CUS-002');
  });
});

describe('getSalesCostByProject', () => {
  const invoices = [
    { customerId: 'CUS-001', projectCode: 'PJ-001', status: '送付済', total: 100000, invoiceDate: '2026-01-31' },
    { customerId: 'CUS-001', projectCode: 'PJ-002', status: '入金済', total: 200000, invoiceDate: '2026-02-28' },
    { customerId: 'CUS-002', projectCode: 'PJ-003', status: '送付済', total: 50000, invoiceDate: '2026-03-31' },
    { customerId: 'CUS-001', projectCode: 'PJ-001', status: '下書き', total: 300000, invoiceDate: '2026-04-30' }
  ];
  const payments = [
    { purchaseOrderCode: 'POD-001', status: '支払済', amount: 30000, paymentDate: '2026-04-30' },
    { purchaseOrderCode: 'POD-002', status: '支払済', amount: 10000, paymentDate: '2026-05-31' }
  ];
  const purchaseOrders = [
    { code: 'POD-001', orderCode: 'ORD-001' },
    { code: 'POD-002', orderCode: 'ORD-002' }
  ];
  const orders = [
    { code: 'ORD-001', customerId: 'CUS-001', projectCode: 'PJ-001' },
    { code: 'ORD-002', customerId: 'CUS-002', projectCode: 'PJ-003' }
  ];

  it('should return empty array when no confirmed invoices for the customer', () => {
    // Act
    const result = getSalesCostByProject(invoices, payments, purchaseOrders, orders, 'CUS-999');

    // Assert
    expect(result).toEqual([]);
  });

  it('should group confirmed invoices by projectCode for the given customerId', () => {
    // Act
    const result = getSalesCostByProject(invoices, payments, purchaseOrders, orders, 'CUS-001');

    // Assert
    expect(result.length).toBe(2);
  });

  it('should sum sales for PJ-001 from confirmed invoices of CUS-001', () => {
    // Act
    const result = getSalesCostByProject(invoices, payments, purchaseOrders, orders, 'CUS-001');
    const pj001 = result.find(function(r) { return r.projectCode === 'PJ-001'; });

    // Assert
    expect(pj001.sales).toBe(100000);
  });

  it('should exclude invoices from other customers', () => {
    // Act
    const result = getSalesCostByProject(invoices, payments, purchaseOrders, orders, 'CUS-001');
    const pj003 = result.find(function(r) { return r.projectCode === 'PJ-003'; });

    // Assert
    expect(pj003).toBeUndefined();
  });

  it('should include cost from paid payments for projects of this customer', () => {
    // Act
    const result = getSalesCostByProject(invoices, payments, purchaseOrders, orders, 'CUS-001');
    const pj001 = result.find(function(r) { return r.projectCode === 'PJ-001'; });

    // Assert
    expect(pj001.cost).toBe(30000);
  });

  it('should not include cost from payments for other customers', () => {
    // Act
    const result = getSalesCostByProject(invoices, payments, purchaseOrders, orders, 'CUS-001');
    const pj002 = result.find(function(r) { return r.projectCode === 'PJ-002'; });

    // Assert
    expect(pj002.cost).toBe(0);
  });

  it('should compute grossProfit as sales minus cost', () => {
    // Act
    const result = getSalesCostByProject(invoices, payments, purchaseOrders, orders, 'CUS-001');
    const pj001 = result.find(function(r) { return r.projectCode === 'PJ-001'; });

    // Assert
    expect(pj001.grossProfit).toBe(70000);
  });

  it('should sort by sales descending', () => {
    // Act
    const result = getSalesCostByProject(invoices, payments, purchaseOrders, orders, 'CUS-001');

    // Assert
    expect(result[0].projectCode).toBe('PJ-002');
    expect(result[1].projectCode).toBe('PJ-001');
  });
});
