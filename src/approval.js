export function getPendingApprovals(quotations, purchaseOrders, payments, orders, invoices) {
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

  (orders || []).forEach(function(o) {
    if (o.status === '承認依頼中') {
      pending.push({
        type: '受注',
        code: o.code,
        title: o.title,
        amount: o.total,
        submittedAt: o.orderDate,
        submittedBy: o.submittedBy || ''
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

  (invoices || []).forEach(function(inv) {
    if (inv.status === '承認依頼中') {
      pending.push({
        type: '請求',
        code: inv.code,
        title: inv.title,
        amount: inv.total,
        submittedAt: inv.invoiceDate,
        submittedBy: inv.submittedBy || ''
      });
    }
  });

  return pending;
}

var APPROVAL_SCREEN_MAP = {
  '見積': 'quotation',
  '受注': 'order',
  '発注': 'purchaseOrder',
  '支払依頼': 'payment',
  '請求': 'invoice'
};

export function getApprovalDetailRoute(item) {
  var screen = APPROVAL_SCREEN_MAP[item.type] || null;
  if (!screen) return null;
  return { screen: screen, code: item.code };
}

export function buildApprovalHistoryEntry(action, operatorName, comment, timestamp) {
  return { action: action, operatorName: operatorName, comment: comment, timestamp: timestamp };
}

export function addApprovalHistoryEntry(doc, entry) {
  var history = (doc.approvalHistory || []).concat([entry]);
  return Object.assign({}, doc, { approvalHistory: history });
}
