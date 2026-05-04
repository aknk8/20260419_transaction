export function generateInvoiceCode(existingCodes) {
  const re = /^INV-(\d{5})$/;
  const nums = existingCodes.map(function(code) {
    const match = code.match(re);
    return match ? parseInt(match[1], 10) : 0;
  }).filter(function(n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return 'INV-' + String(max + 1).padStart(5, '0');
}

export function createInvoice(code, orderCode, customerId, title, invoiceDate, dueDate) {
  return {
    code: code,
    orderCode: orderCode,
    customerId: customerId,
    title: title,
    invoiceDate: invoiceDate,
    dueDate: dueDate,
    status: '下書き',
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    notes: '',
    details: []
  };
}

export function findBillableOrders(orders, invoices) {
  const invoicedOrderCodes = invoices.map(function(inv) { return inv.orderCode; });
  return orders.filter(function(order) {
    return order.billingTarget && invoicedOrderCodes.indexOf(order.code) < 0;
  });
}

export function getDefaultDueDate(dateString) {
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const lastDay = new Date(year, month, 0).getDate();
  return year + '-' + String(month).padStart(2, '0') + '-' + String(lastDay).padStart(2, '0');
}

export function confirmInvoice(invoice) {
  return Object.assign({}, invoice, { status: '確定' });
}

export function markInvoiceAsSent(invoice) {
  return Object.assign({}, invoice, { status: '送付済' });
}

export function cancelInvoice(invoice) {
  return Object.assign({}, invoice, { status: 'キャンセル' });
}

export function createInvoiceFromOrder(order, newCode, invoiceDate, dueDate) {
  return {
    code: newCode,
    orderCode: order.code,
    customerId: order.customerId,
    title: order.title,
    invoiceDate: invoiceDate,
    dueDate: dueDate,
    status: '下書き',
    subtotal: order.subtotal || 0,
    taxAmount: order.taxAmount || 0,
    total: order.total || 0,
    notes: order.notes || '',
    details: (order.details || []).map(function(d) { return Object.assign({}, d); })
  };
}
