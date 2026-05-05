export function generateDeliveryCode(existingCodes) {
  const re = /^DLV-(\d{5})$/;
  const nums = existingCodes.map(function(code) {
    const match = code.match(re);
    return match ? parseInt(match[1], 10) : 0;
  }).filter(function(n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return 'DLV-' + String(max + 1).padStart(5, '0');
}

export function createDelivery(code, purchaseOrderCode, deliveryDate, notes) {
  return {
    code: code,
    purchaseOrderCode: purchaseOrderCode,
    deliveryDate: deliveryDate,
    notes: notes,
    status: '検収待ち',
    details: []
  };
}

export function acceptDelivery(delivery) {
  return Object.assign({}, delivery, { status: '検収済' });
}

export function rejectDelivery(delivery) {
  return Object.assign({}, delivery, { status: '検収NG' });
}

export function getAcceptedQuantity(lineNo, deliveries) {
  return deliveries
    .filter(function(d) { return d.status === '検収済'; })
    .reduce(function(sum, dlv) {
      var line = (dlv.details || []).find(function(d) { return d.lineNo === lineNo; });
      return sum + (line ? line.deliveredQuantity || 0 : 0);
    }, 0);
}

export function getRemainingQuantity(lineNo, orderedQuantity, deliveries) {
  return orderedQuantity - getAcceptedQuantity(lineNo, deliveries);
}

export function isFullyDelivered(purchaseOrder, deliveries) {
  const lines = purchaseOrder.details || [];
  if (lines.length === 0) return true;
  const podDeliveries = deliveries.filter(function(d) {
    return d.purchaseOrderCode === purchaseOrder.code;
  });
  return lines.every(function(line) {
    return getAcceptedQuantity(line.lineNo, podDeliveries) >= line.quantity;
  });
}
