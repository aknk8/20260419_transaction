export function getFiscalYear(yearMonth, fiscalEndMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  return month <= fiscalEndMonth ? year : year + 1;
}

export function filterReportByFiscalYear(rows, fiscalYear, fiscalEndMonth) {
  if (!fiscalYear || fiscalYear === 'all') return rows;
  const fy = Number(fiscalYear);
  return rows.filter(row => getFiscalYear(row.yearMonth, fiscalEndMonth) === fy);
}

export function getAvailableFiscalYears(rows, fiscalEndMonth) {
  const years = rows.map(row => getFiscalYear(row.yearMonth, fiscalEndMonth));
  return [...new Set(years)].sort((a, b) => a - b);
}
