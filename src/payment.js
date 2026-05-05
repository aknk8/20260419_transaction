export function generatePaymentCode(existingCodes) {
  const re = /^PMT-(\d{5})$/;
  const nums = existingCodes.map(function(code) {
    const match = code.match(re);
    return match ? parseInt(match[1], 10) : 0;
  }).filter(function(n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return 'PMT-' + String(max + 1).padStart(5, '0');
}

export function createPaymentRequest(code, purchaseOrderCode, supplierId, title, paymentDate, amount, notes) {
  return {
    code: code,
    purchaseOrderCode: purchaseOrderCode,
    supplierId: supplierId,
    title: title,
    paymentDate: paymentDate,
    amount: amount,
    status: '下書き',
    notes: notes
  };
}

export function findPayablePurchaseOrders(purchaseOrders, payments) {
  return purchaseOrders.filter(function(po) {
    if (po.status !== '納品済') return false;
    return !payments.some(function(p) {
      return p.purchaseOrderCode === po.code && p.status !== 'キャンセル';
    });
  });
}

export function submitPaymentApproval(payment) {
  return Object.assign({}, payment, { status: '承認待ち' });
}

export function approvePayment(payment) {
  return Object.assign({}, payment, { status: '承認済' });
}

export function rejectPayment(payment, reason) {
  return Object.assign({}, payment, { status: '却下', rejectReason: reason || '' });
}

export function cancelPayment(payment) {
  return Object.assign({}, payment, { status: 'キャンセル' });
}

export function registerPayment(payment) {
  return Object.assign({}, payment, { status: '支払済' });
}
