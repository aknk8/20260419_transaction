export function getDashboardMetrics(quotations, purchaseOrders, payments, orders, invoices) {
  var pendingByQuotations = quotations.filter(function(q) { return q.status === '承認依頼中'; }).length;
  var pendingByOrders = (orders || []).filter(function(o) { return o.status === '承認依頼中'; }).length;
  var pendingByPurchaseOrders = purchaseOrders.filter(function(po) { return po.status === '承認依頼中'; }).length;
  var pendingByInvoices = (invoices || []).filter(function(inv) { return inv.status === '承認依頼中'; }).length;
  var pendingByPayments = payments.filter(function(p) { return p.status === '承認待ち'; }).length;
  var pendingApprovals = pendingByQuotations + pendingByOrders + pendingByPurchaseOrders + pendingByInvoices + pendingByPayments;

  var unbilled = orders.filter(function(o) {
    if (!o.billingTarget) return false;
    var hasConfirmedInvoice = invoices.some(function(inv) {
      return inv.orderCode === o.code && inv.status !== '下書き' && inv.status !== 'キャンセル';
    });
    return !hasConfirmedInvoice;
  }).length;

  var uncollected = invoices.filter(function(inv) {
    return inv.status === '送付済' || inv.status === '一部入金';
  }).length;

  var unpaid = payments.filter(function(p) {
    return p.status === '承認済';
  }).length;

  return {
    pendingApprovals: pendingApprovals,
    pendingApprovalsByType: {
      quotations: pendingByQuotations,
      orders: pendingByOrders,
      purchaseOrders: pendingByPurchaseOrders,
      invoices: pendingByInvoices,
      payments: pendingByPayments
    },
    unbilled: unbilled,
    uncollected: uncollected,
    unpaid: unpaid
  };
}
