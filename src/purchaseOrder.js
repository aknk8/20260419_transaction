export function generatePurchaseOrderCode(existingCodes) {
  const re = /^POD-(\d{5})$/;
  const nums = existingCodes.map(function(code) {
    const match = code.match(re);
    return match ? parseInt(match[1], 10) : 0;
  }).filter(function(n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return 'POD-' + String(max + 1).padStart(5, '0');
}

export function createPurchaseOrderFromOrder(order, newCode, supplierId, orderDate) {
  return {
    code: newCode,
    orderCode: order.code,
    supplierId: supplierId,
    title: order.title,
    orderDate: orderDate,
    deliveryDate: '',
    status: '下書き',
    subtotal: order.subtotal || 0,
    taxAmount: order.taxAmount || 0,
    total: order.total || 0,
    notes: order.notes || '',
    details: (order.details || []).map(function(d) { return Object.assign({}, d); }),
    attachments: []
  };
}

export function calcTotalsFromDetails(details) {
  var subtotal = 0;
  var taxAmount = 0;
  details.forEach(function(d) {
    var lineSubtotal = (d.quantity || 1) * (d.unitPrice || 0) * (1 - (d.discount || 0));
    subtotal += lineSubtotal;
    taxAmount += Math.floor(lineSubtotal * (d.taxRate || 0));
  });
  return { subtotal: subtotal, taxAmount: taxAmount, total: subtotal + taxAmount };
}

export function findPurchaseOrderByCode(purchaseOrders, code) {
  return purchaseOrders.find(function(p) { return p.code === code; });
}

export function updatePurchaseOrderStatus(purchaseOrder, status) {
  return Object.assign({}, purchaseOrder, { status: status });
}

export function submitPurchaseOrderApproval(purchaseOrder) {
  return Object.assign({}, purchaseOrder, { status: '承認依頼中' });
}

export function approvePurchaseOrder(purchaseOrder, comment) {
  return Object.assign({}, purchaseOrder, {
    status: '承認済・発注待ち',
    approvalComment: comment || ''
  });
}

export function rejectPurchaseOrder(purchaseOrder, reason) {
  return Object.assign({}, purchaseOrder, {
    status: '却下',
    rejectReason: reason
  });
}

export function returnPurchaseOrderToDraft(purchaseOrder) {
  return Object.assign({}, purchaseOrder, { status: '下書き' });
}


export function buildPurchaseOrderPrintHtml(purchaseOrder, supplier) {
  var esc = function(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
  var fmt = function(n) { return Number(n || 0).toLocaleString(); };
  var supplierName = supplier ? supplier.name : '';

  var detailRows = (purchaseOrder.details || []).map(function(d) {
    return '<tr>' +
      '<td>' + esc(d.productName) + '</td>' +
      '<td style="text-align:right">' + esc(d.quantity) + '</td>' +
      '<td>' + esc(d.unit || '') + '</td>' +
      '<td style="text-align:right">' + fmt(d.unitPrice) + '</td>' +
      '<td style="text-align:right">' + (d.taxRate === 0.10 ? '10%' : d.taxRate === 0.08 ? '8%' : '非課税') + '</td>' +
      '<td style="text-align:right">' + fmt(d.amount || 0) + '</td>' +
      '</tr>';
  }).join('');

  return '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">' +
    '<title>発注書 ' + esc(purchaseOrder.code) + '</title>' +
    '<style>' +
      'body{font-family:"Noto Sans JP",sans-serif;margin:40px;font-size:12px;color:#111;}' +
      'h1{font-size:20px;text-align:center;margin-bottom:24px;}' +
      '.meta{display:flex;justify-content:space-between;margin-bottom:16px;}' +
      '.supplier{font-size:16px;font-weight:bold;border-bottom:2px solid #111;padding-bottom:4px;margin-bottom:16px;}' +
      'table{width:100%;border-collapse:collapse;margin-bottom:16px;}' +
      'th,td{border:1px solid #ccc;padding:6px 8px;}' +
      'th{background:#f0f0f0;}' +
      '.totals{text-align:right;margin-bottom:16px;}' +
      '.totals table{width:280px;margin-left:auto;}' +
      '.total-row td{font-weight:bold;}' +
      '.notes{font-size:11px;margin-top:16px;border-top:1px solid #ccc;padding-top:8px;}' +
      '@media print{body{margin:0;}}' +
    '</style></head><body>' +
    '<h1>発 注 書</h1>' +
    '<div class="meta">' +
      '<div>' +
        '<div>発注番号：' + esc(purchaseOrder.code) + '</div>' +
        '<div>発注日：' + esc(purchaseOrder.orderDate || '') + '</div>' +
        '<div>納期：' + esc(purchaseOrder.deliveryDate || '') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="supplier">' + esc(supplierName) + ' 御中</div>' +
    '<p>件名：' + esc(purchaseOrder.title) + '</p>' +
    '<table>' +
      '<thead><tr><th>品名</th><th>数量</th><th>単位</th><th>単価</th><th>税率</th><th>金額</th></tr></thead>' +
      '<tbody>' + (detailRows || '<tr><td colspan="6">明細なし</td></tr>') + '</tbody>' +
    '</table>' +
    '<div class="totals"><table>' +
      '<tr><td>小計</td><td style="text-align:right">' + fmt(purchaseOrder.subtotal) + ' 円</td></tr>' +
      '<tr><td>消費税</td><td style="text-align:right">' + fmt(purchaseOrder.taxAmount) + ' 円</td></tr>' +
      '<tr class="total-row"><td>合計</td><td style="text-align:right">' + fmt(purchaseOrder.total) + ' 円</td></tr>' +
    '</table></div>' +
    (purchaseOrder.notes ? '<div class="notes">備考：' + esc(purchaseOrder.notes) + '</div>' : '') +
    '</body></html>';
}

export function createPurchaseOrder(newCode, supplierId, title, orderDate) {
  return {
    code: newCode,
    orderCode: '',
    supplierId: supplierId,
    title: title,
    orderDate: orderDate,
    deliveryDate: '',
    status: '下書き',
    subtotal: 0,
    taxAmount: 0,
    total: 0,
    notes: '',
    details: [],
    attachments: []
  };
}
