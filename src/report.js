export function getSalesSummary(invoices) {
  var confirmed = invoices.filter(function(inv) {
    return inv.status !== '下書き' && inv.status !== 'キャンセル';
  });

  var byMonth = {};
  confirmed.forEach(function(inv) {
    var ym = inv.invoiceDate.slice(0, 7);
    byMonth[ym] = (byMonth[ym] || 0) + inv.total;
  });

  return Object.keys(byMonth).sort().map(function(ym) {
    return { yearMonth: ym, sales: byMonth[ym] };
  });
}

export function filterReportByYear(rows, year) {
  if (!year || year === 'all') return rows;
  return rows.filter(function(row) {
    return row.yearMonth.startsWith(year);
  });
}

export function getUncollectedInvoices(invoices) {
  return invoices.filter(function(inv) {
    return inv.status === '送付済' || inv.status === '一部入金';
  });
}

export function getUnpaidPayments(payments) {
  return payments.filter(function(p) {
    return p.status === '承認済';
  });
}

export function getReportTotals(rows) {
  return rows.reduce(function(acc, row) {
    return {
      sales: acc.sales + (row.sales || 0),
      cost: acc.cost + (row.cost || 0),
      grossProfit: acc.grossProfit + (row.grossProfit || 0)
    };
  }, { sales: 0, cost: 0, grossProfit: 0 });
}

export function getSalesCostByCustomer(invoices, payments, purchaseOrders, orders) {
  var confirmedInvoices = invoices.filter(function(inv) {
    return inv.status !== '下書き' && inv.status !== 'キャンセル';
  });
  var paidPayments = payments.filter(function(p) { return p.status === '支払済'; });

  var podMap = {};
  purchaseOrders.forEach(function(pod) { podMap[pod.code] = pod; });
  var orderMap = {};
  orders.forEach(function(o) { orderMap[o.code] = o; });

  var byCustomer = {};

  confirmedInvoices.forEach(function(inv) {
    var cid = inv.customerId;
    if (!byCustomer[cid]) byCustomer[cid] = { sales: 0, cost: 0 };
    byCustomer[cid].sales += inv.total;
  });

  paidPayments.forEach(function(p) {
    var pod = podMap[p.purchaseOrderCode];
    if (!pod) return;
    var order = orderMap[pod.orderCode];
    if (!order) return;
    var cid = order.customerId;
    if (!byCustomer[cid]) byCustomer[cid] = { sales: 0, cost: 0 };
    byCustomer[cid].cost += p.amount;
  });

  return Object.keys(byCustomer).map(function(cid) {
    var d = byCustomer[cid];
    return { customerId: cid, sales: d.sales, cost: d.cost, grossProfit: d.sales - d.cost };
  }).sort(function(a, b) { return b.sales - a.sales; });
}

export function getSalesCostByProject(invoices, payments, purchaseOrders, orders, targetCustomerId) {
  var confirmedInvoices = invoices.filter(function(inv) {
    return inv.status !== '下書き' && inv.status !== 'キャンセル' && inv.customerId === targetCustomerId;
  });
  var paidPayments = payments.filter(function(p) { return p.status === '支払済'; });

  var podMap = {};
  purchaseOrders.forEach(function(pod) { podMap[pod.code] = pod; });
  var orderMap = {};
  orders.forEach(function(o) { orderMap[o.code] = o; });

  var byProject = {};

  confirmedInvoices.forEach(function(inv) {
    var pjc = inv.projectCode || '__none__';
    if (!byProject[pjc]) byProject[pjc] = { sales: 0, cost: 0 };
    byProject[pjc].sales += inv.total;
  });

  paidPayments.forEach(function(p) {
    var pod = podMap[p.purchaseOrderCode];
    if (!pod) return;
    var order = orderMap[pod.orderCode];
    if (!order || order.customerId !== targetCustomerId) return;
    var pjc = order.projectCode || '__none__';
    if (!byProject[pjc]) byProject[pjc] = { sales: 0, cost: 0 };
    byProject[pjc].cost += p.amount;
  });

  return Object.keys(byProject).map(function(pjc) {
    var d = byProject[pjc];
    return { projectCode: pjc === '__none__' ? null : pjc, sales: d.sales, cost: d.cost, grossProfit: d.sales - d.cost };
  }).sort(function(a, b) { return b.sales - a.sales; });
}

export function getSalesCostReport(invoices, payments) {
  var confirmedInvoices = invoices.filter(function(inv) {
    return inv.status !== '下書き' && inv.status !== 'キャンセル';
  });
  var paidPayments = payments.filter(function(p) {
    return p.status === '支払済';
  });

  var byMonth = {};

  confirmedInvoices.forEach(function(inv) {
    var ym = inv.invoiceDate.slice(0, 7);
    if (!byMonth[ym]) byMonth[ym] = { sales: 0, cost: 0 };
    byMonth[ym].sales += inv.total;
  });

  paidPayments.forEach(function(p) {
    var ym = p.paymentDate.slice(0, 7);
    if (!byMonth[ym]) byMonth[ym] = { sales: 0, cost: 0 };
    byMonth[ym].cost += p.amount;
  });

  return Object.keys(byMonth).sort().map(function(ym) {
    var s = byMonth[ym].sales;
    var c = byMonth[ym].cost;
    return { yearMonth: ym, sales: s, cost: c, grossProfit: s - c };
  });
}
