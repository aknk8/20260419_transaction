export function generateOrderCode(existingCodes) {
  const re = /^ORD-(\d{5})$/;
  const nums = existingCodes.map(function(code) {
    const match = code.match(re);
    return match ? parseInt(match[1], 10) : 0;
  }).filter(function(n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return 'ORD-' + String(max + 1).padStart(5, '0');
}

export function createOrderFromQuotation(quotation, newCode, orderDate) {
  return {
    code: newCode,
    quotationCode: quotation.code,
    projectCode: quotation.projectCode,
    customerId: quotation.customerId,
    title: quotation.title,
    orderDate: orderDate,
    deliveryDate: '',
    status: '受注済み',
    subtotal: quotation.subtotal || 0,
    taxAmount: quotation.taxAmount || 0,
    total: quotation.total || 0,
    notes: quotation.notes || '',
    details: (quotation.details || []).map(function(d) { return Object.assign({}, d); }),
    attachments: []
  };
}

export function addAttachment(order, attachment) {
  return Object.assign({}, order, {
    attachments: (order.attachments || []).concat([attachment])
  });
}

export function removeAttachment(order, index) {
  return Object.assign({}, order, {
    attachments: (order.attachments || []).filter(function(_, i) { return i !== index; })
  });
}

export function findOrderByCode(orders, code) {
  return orders.find(function(o) { return o.code === code; });
}

export function updateOrderStatus(order, status) {
  return Object.assign({}, order, { status: status });
}

export function markAsBillingTarget(order) {
  return Object.assign({}, order, { billingTarget: true });
}

export function applyPayment(order, amount) {
  const newPaid = (order.paidAmount || 0) + amount;
  const isComplete = newPaid >= order.total;
  return Object.assign({}, order, {
    paidAmount: newPaid,
    status: isComplete ? '完了' : order.status
  });
}
