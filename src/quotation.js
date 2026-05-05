export function generateQuotationCode(existingCodes) {
  const re = /^QUO-(\d{5})$/;
  const nums = existingCodes.map(function(code) {
    const match = code.match(re);
    return match ? parseInt(match[1], 10) : 0;
  }).filter(function(n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return 'QUO-' + String(max + 1).padStart(5, '0');
}

function calcDetails(details) {
  var subtotal = 0;
  var taxAmount = 0;
  var enriched = details.map(function(d) {
    var lineSubtotal = d.unitPrice * d.quantity - (d.discount || 0);
    var lineTax = Math.floor(lineSubtotal * d.taxRate);
    subtotal += lineSubtotal;
    taxAmount += lineTax;
    return Object.assign({}, d, { amount: lineSubtotal + lineTax });
  });
  return { details: enriched, subtotal: subtotal, taxAmount: taxAmount, total: subtotal + taxAmount };
}

export function createQuotation(formData) {
  var calc = calcDetails(formData.details || []);
  return {
    code: formData.code,
    projectCode: formData.projectCode,
    customerId: formData.customerId,
    title: formData.title,
    issueDate: formData.issueDate,
    validityDate: formData.validityDate,
    version: formData.version,
    status: formData.status || '下書き',
    notes: formData.notes || '',
    details: calc.details,
    subtotal: calc.subtotal,
    taxAmount: calc.taxAmount,
    total: calc.total
  };
}

export function findQuotationByCode(quotations, code) {
  return quotations.find(function(q) { return q.code === code; }) || null;
}

export function addDetailLine(details) {
  const maxNo = details.reduce(function(max, d) { return d.lineNo > max ? d.lineNo : max; }, 0);
  return details.concat([{
    lineNo: maxNo + 1,
    productCode: '',
    productName: '',
    quantity: 1,
    unit: '',
    unitPrice: 0,
    discount: 0,
    taxRate: 0.10
  }]);
}

export function removeDetailLine(details, lineNo) {
  return details.filter(function(d) { return d.lineNo !== lineNo; });
}

export function updateDetailLine(details, lineNo, field, value) {
  return details.map(function(d) {
    if (d.lineNo !== lineNo) return d;
    return Object.assign({}, d, { [field]: value });
  });
}

export function createRevision(original, newCode) {
  return Object.assign({}, original, {
    code: newCode,
    version: original.version + 1,
    status: '下書き',
    details: (original.details || []).map(function(d) { return Object.assign({}, d); })
  });
}

export function rejectQuotation(quotation, reason) {
  return Object.assign({}, quotation, {
    status: '取消',
    rejectReason: reason
  });
}

export function buildQuotationPrintHtml(quotation, project, customer, company) {
  var esc = function(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
  var fmt = function(n) { return Number(n || 0).toLocaleString(); };
  var projectName = project ? project.name : (quotation.projectCode || '');
  var customerName = customer ? customer.name : (quotation.customerId || '');
  var companyBlock = company
    ? '<div>' + esc(company.name) + '</div>' +
      (company.address ? '<div>' + esc(company.address) + '</div>' : '') +
      (company.phone ? '<div>' + esc(company.phone) + '</div>' : '')
    : '';

  var detailRows = (quotation.details || []).map(function(d) {
    return '<tr>' +
      '<td>' + esc(d.productName) + '</td>' +
      '<td style="text-align:right">' + esc(d.quantity) + '</td>' +
      '<td>' + esc(d.unit) + '</td>' +
      '<td style="text-align:right">' + fmt(d.unitPrice) + '</td>' +
      '<td style="text-align:right">' + fmt(d.discount || 0) + '</td>' +
      '<td style="text-align:right">' + (d.taxRate === 0.10 ? '10%' : d.taxRate === 0.08 ? '8%' : '非課税') + '</td>' +
      '<td style="text-align:right">' + fmt(d.amount || 0) + '</td>' +
      '</tr>';
  }).join('');

  return '<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">' +
    '<title>見積書 ' + esc(quotation.code) + '</title>' +
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
      '<h1>見 積 書</h1>' +
      '<div class="company-info">' + companyBlock + '</div>' +
    '</div>' +
    '<div class="meta">' +
      '<div>' +
        '<div>見積番号：' + esc(quotation.code) + '</div>' +
        '<div>版数：第 ' + esc(quotation.version) + ' 版</div>' +
        '<div>案件：' + esc(projectName) + '</div>' +
      '</div>' +
      '<div>' +
        '<div>発行日：' + esc(quotation.issueDate || '') + '</div>' +
        '<div>有効期限：' + esc(quotation.validityDate || '') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="customer">' + esc(customerName) + ' 御中</div>' +
    '<p>件名：' + esc(quotation.title) + '</p>' +
    '<table>' +
      '<thead><tr><th>品名</th><th>数量</th><th>単位</th><th>単価</th><th>値引</th><th>税率</th><th>金額</th></tr></thead>' +
      '<tbody>' + (detailRows || '<tr><td colspan="7">明細なし</td></tr>') + '</tbody>' +
    '</table>' +
    '<div class="totals"><table>' +
      '<tr><td>小計</td><td style="text-align:right">' + fmt(quotation.subtotal) + ' 円</td></tr>' +
      '<tr><td>消費税</td><td style="text-align:right">' + fmt(quotation.taxAmount) + ' 円</td></tr>' +
      '<tr class="total-row"><td>合計</td><td style="text-align:right">' + fmt(quotation.total) + ' 円</td></tr>' +
    '</table></div>' +
    (quotation.notes ? '<div class="notes">備考：' + esc(quotation.notes) + '</div>' : '') +
    '</body></html>';
}
