import { describe, it, expect } from 'vitest';
import { getFiscalYear, filterReportByFiscalYear, getAvailableFiscalYears } from './settings.js';

describe('getFiscalYear', () => {
  it('should return calendar year when fiscalEndMonth is 12 and month is 3', () => {
    expect(getFiscalYear('2026-03', 12)).toBe(2026);
  });

  it('should return calendar year when fiscalEndMonth is 12 and month is 12', () => {
    expect(getFiscalYear('2026-12', 12)).toBe(2026);
  });

  it('should return same year when month is within fiscal year end (August)', () => {
    // 8月決算: 2026-03 は 2026年度（〜8月末）
    expect(getFiscalYear('2026-03', 8)).toBe(2026);
  });

  it('should return same year when month equals fiscal end month', () => {
    // 8月決算: 2026-08 は 2026年度の末月
    expect(getFiscalYear('2026-08', 8)).toBe(2026);
  });

  it('should return next year when month exceeds fiscal end month', () => {
    // 8月決算: 2026-09 は 2027年度の開始月
    expect(getFiscalYear('2026-09', 8)).toBe(2027);
  });

  it('should return next year when month is December with August fiscal end', () => {
    expect(getFiscalYear('2025-12', 8)).toBe(2026);
  });

  it('should return next year when month is January with March fiscal end', () => {
    // 3月決算: 2026-01 は 2026年度（4月〜3月）
    expect(getFiscalYear('2026-01', 3)).toBe(2026);
  });

  it('should return next year when month exceeds March fiscal end', () => {
    // 3月決算: 2026-04 は 2027年度の開始月
    expect(getFiscalYear('2026-04', 3)).toBe(2027);
  });
});

describe('filterReportByFiscalYear', () => {
  const rows = [
    { yearMonth: '2025-09', sales: 100 },
    { yearMonth: '2026-03', sales: 200 },
    { yearMonth: '2026-08', sales: 300 },
    { yearMonth: '2026-09', sales: 400 }
  ];

  it('should return all rows when fiscalYear is all', () => {
    expect(filterReportByFiscalYear(rows, 'all', 8).length).toBe(4);
  });

  it('should return all rows when fiscalYear is empty', () => {
    expect(filterReportByFiscalYear(rows, '', 8).length).toBe(4);
  });

  it('should return rows for fiscal year 2026 with August fiscal end', () => {
    // FY2026: 2025-09〜2026-08
    const result = filterReportByFiscalYear(rows, '2026', 8);
    expect(result.length).toBe(3);
    expect(result[0].yearMonth).toBe('2025-09');
    expect(result[1].yearMonth).toBe('2026-03');
    expect(result[2].yearMonth).toBe('2026-08');
  });

  it('should return rows for fiscal year 2027 with August fiscal end', () => {
    // FY2027: 2026-09〜2027-08
    const result = filterReportByFiscalYear(rows, '2027', 8);
    expect(result.length).toBe(1);
    expect(result[0].yearMonth).toBe('2026-09');
  });

  it('should return empty array when no rows match fiscal year', () => {
    const result = filterReportByFiscalYear(rows, '2025', 8);
    expect(result).toEqual([]);
  });

  it('should work with December fiscal end (calendar year)', () => {
    const calRows = [
      { yearMonth: '2026-01', sales: 100 },
      { yearMonth: '2026-12', sales: 200 }
    ];
    const result = filterReportByFiscalYear(calRows, '2026', 12);
    expect(result.length).toBe(2);
  });
});

describe('getAvailableFiscalYears', () => {
  it('should return empty array when rows is empty', () => {
    expect(getAvailableFiscalYears([], 12)).toEqual([]);
  });

  it('should return unique fiscal years sorted ascending', () => {
    const rows = [
      { yearMonth: '2026-03' },
      { yearMonth: '2026-09' },
      { yearMonth: '2026-01' }
    ];
    // FY end = 8: 2026-03→2026, 2026-09→2027, 2026-01→2026
    const result = getAvailableFiscalYears(rows, 8);
    expect(result).toEqual([2026, 2027]);
  });

  it('should return single year when all rows are in same fiscal year', () => {
    const rows = [
      { yearMonth: '2026-01' },
      { yearMonth: '2026-06' }
    ];
    expect(getAvailableFiscalYears(rows, 12)).toEqual([2026]);
  });
});
