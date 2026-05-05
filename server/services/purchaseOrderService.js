import { generatePurchaseOrderCode, createPurchaseOrder } from '../../src/purchaseOrder.js';

function notFound(msg) { return Object.assign(new Error(msg), { statusCode: 404 }); }
function validationError(msg) { return Object.assign(new Error(msg), { statusCode: 400 }); }

export async function listPurchaseOrders({ repository }) {
  return repository.findAll();
}

export async function getPurchaseOrderByCode(code, { repository }) {
  const po = await repository.findByCode(code);
  if (!po) throw notFound('発注が見つかりません');
  return po;
}

export async function registerPurchaseOrder(formData, { repository }) {
  const existingCodes = await repository.findAllCodes();
  const code = generatePurchaseOrderCode(existingCodes);
  const po = createPurchaseOrder(code, formData.supplierId, formData.title, formData.orderDate);
  return repository.save({ ...po, ...formData, code, details: formData.details ?? [] });
}

export async function updatePurchaseOrder(code, data, { repository }) {
  return repository.update(code, data);
}

export async function submitPurchaseOrderApproval(code, { repository, submittedBy }) {
  const po = await repository.findByCode(code);
  if (!po) throw notFound('発注が見つかりません');
  if (po.status !== '下書き') throw validationError('下書き状態のみ承認依頼できます');
  const updateData = { status: '承認依頼中' };
  if (submittedBy) updateData.submittedBy = submittedBy;
  return repository.update(code, updateData);
}

export async function approvePurchaseOrder(code, comment, { repository }) {
  const po = await repository.findByCode(code);
  if (!po) throw notFound('発注が見つかりません');
  if (po.status !== '承認依頼中') throw validationError('承認依頼中状態のみ承認できます');
  return repository.update(code, { status: '承認済み', approvalComment: comment ?? null });
}

export async function rejectPurchaseOrder(code, reason, { repository }) {
  const po = await repository.findByCode(code);
  if (!po) throw notFound('発注が見つかりません');
  if (po.status !== '承認依頼中') throw validationError('承認依頼中状態のみ却下できます');
  return repository.update(code, { status: '却下', rejectReason: reason ?? null });
}
