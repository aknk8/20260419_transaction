export function getPendingApprovals(quotations, purchaseOrders, payments) {
  var pending = [];

  quotations.forEach(function(q) {
    if (q.status === '承認依頼中') {
      pending.push({
        type: '見積',
        code: q.code,
        title: q.title,
        amount: q.total,
        submittedAt: q.issueDate,
        submittedBy: q.submittedBy || ''
      });
    }
  });

  purchaseOrders.forEach(function(po) {
    if (po.status === '承認依頼中') {
      pending.push({
        type: '発注',
        code: po.code,
        title: po.title,
        amount: po.total,
        submittedAt: po.orderDate,
        submittedBy: po.submittedBy || ''
      });
    }
  });

  payments.forEach(function(p) {
    if (p.status === '承認待ち') {
      pending.push({
        type: '支払依頼',
        code: p.code,
        title: p.title,
        amount: p.amount,
        submittedAt: p.paymentDate,
        submittedBy: p.submittedBy || ''
      });
    }
  });

  return pending;
}
