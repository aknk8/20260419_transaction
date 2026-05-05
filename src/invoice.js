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

export function buildInvoicePrintHtml(invoice, order, customer, company) {
  var esc = function(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
  var fmt = function(n) { return Number(n || 0).toLocaleString(); };
  var customerName = customer ? customer.name : (invoice.customerId || '');
  var companyBlock = company
    ? '<div>' + esc(company.name) + '</div>' +
      (company.address ? '<div>' + esc(company.address) + '</div>' : '') +
      (company.phone ? '<div>' + esc(company.phone) + '</div>' : '')
    : '';

  var detailRows = (invoice.details || []).map(function(d) {
    return '<tr>' +
      '<td>' + esc(d.productName) + '</td>' +
      '<td style="text-align:right">' + esc(d.quantity) + '</td>' +
      '<td>' + esc(d.unit) + '</td>' +
      '<td style="text-align:right">' + fmt(d.unitPrice) + '</td>' +
      '<td style="text-align:right">' + (d.taxRate === 0.10 ? '10%' : d.taxRate === 0.08 ? '8%' : '非課税') + '</td>' +
      '<td style="text-align:right">' + fmt(d.amount || 0) + '</td>' +
      '</tr>';
  }).join('');

  return '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">' +
    '<title>請求書 ' + esc(invoice.code) + '</title>' +
    '<style>' +
      'body{font-family:"Noto Sans JP",sans-serif;margin:40px;font-size:12px;color:#111;}' +
      '.print-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;}' +
      'h1{font-size:20px;text-align:center;margin:0;flex:1;}' +
      '.company-info{flex:1;text-align:right;font-size:11px;line-height:1.6;}' +
      '.meta{display:flex;justify-content:space-between;margin-bottom:16px;}' +
      '.customer{font-size:16px;font-weight:bold;border-bottom:2px solid #111;padding-bottom:4px;margin-bottom:16px;}' +
      'table{width:100%;border-collapse:collapse;margin-bottom:16px;}' +
      'th,td{border:1px solid #ccc;padding:6px 8px;}' +
      'th{background:#f0f0f0;}' +
      '.totals{text-align:right;margin-bottom:16px;}' +
      '.totals table{width:280px;margin-left:auto;}' +
      '.total-row td{font-weight:bold;}' +
      '.notes{font-size:11px;margin-top:16px;border-top:1px solid #ccc;padding-top:8px;}' +
      '@media print{body{margin:0;}}' +
    '</style></head><body>' +
    '<div class="print-top">' +
      '<div style="flex:1"></div>' +
      '<h1>請 求 書</h1>' +
      '<div class="company-info">' + companyBlock + '</div>' +
    '</div>' +
    '<div class="meta">' +
      '<div>' +
        '<div>請求番号：' + esc(invoice.code) + '</div>' +
        '<div>受注番号：' + esc(invoice.orderCode || '') + '</div>' +
      '</div>' +
      '<div>' +
        '<div>請求日：' + esc(invoice.invoiceDate || '') + '</div>' +
        '<div>支払期日：' + esc(invoice.dueDate || '') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="customer">' + esc(customerName) + ' 御中</div>' +
    '<p>件名：' + esc(invoice.title) + '</p>' +
    '<table>' +
      '<thead><tr><th>品名</th><th>数量</th><th>単位</th><th>単価</th><th>税率</th><th>金額</th></tr></thead>' +
      '<tbody>' + (detailRows || '<tr><td colspan="6">明細なし</td></tr>') + '</tbody>' +
    '</table>' +
    '<div class="totals"><table>' +
      '<tr><td>小計</td><td style="text-align:right">' + fmt(invoice.subtotal) + ' 円</td></tr>' +
      '<tr><td>消費税</td><td style="text-align:right">' + fmt(invoice.taxAmount) + ' 円</td></tr>' +
      '<tr class="total-row"><td>請求金額</td><td style="text-align:right">' + fmt(invoice.total) + ' 円</td></tr>' +
    '</table></div>' +
    (invoice.notes ? '<div class="notes">備考：' + esc(invoice.notes) + '</div>' : '') +
    '</body></html>';
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

export function submitInvoiceApproval(invoice) {
  return Object.assign({}, invoice, { status: '承認依頼中' });
}

export function approveInvoice(invoice, comment) {
  return Object.assign({}, invoice, {
    status: '承認済み',
    approvalComment: comment || ''
  });
}

export function rejectInvoice(invoice, reason) {
  return Object.assign({}, invoice, {
    status: '却下',
    rejectReason: reason
  });
}

export function returnInvoiceToDraft(invoice) {
  return Object.assign({}, invoice, { status: '下書き' });
}
