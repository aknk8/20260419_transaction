export function generateReceiptCode(existingCodes) {
  const re = /^RCP-(\d{5})$/;
  const nums = existingCodes.map(function(code) {
    const match = code.match(re);
    return match ? parseInt(match[1], 10) : 0;
  }).filter(function(n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return 'RCP-' + String(max + 1).padStart(5, '0');
}

export function createReceipt(code, invoiceCode, receiptDate, amount, fee, notes) {
  return {
    code: code,
    invoiceCode: invoiceCode,
    receiptDate: receiptDate,
    amount: amount,
    fee: fee,
    notes: notes
  };
}

export function calcRemainingBalance(invoice, receipts) {
  const paid = receipts
    .filter(function(r) { return r.invoiceCode === invoice.code; })
    .reduce(function(sum, r) { return sum + (r.amount || 0); }, 0);
  return Math.max(0, (invoice.total || 0) - paid);
}

export function isFullyPaid(invoice, receipts) {
  return calcRemainingBalance(invoice, receipts) <= 0;
}
