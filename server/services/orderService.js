import { createOrderFromQuotation } from '../../src/order.js';
import { generateCode } from './sequenceService.js';

function notFound(code) {
  const err = new Error(`受注コード ${code} は存在しません`);
  err.statusCode = 404;
  return err;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

export async function listOrders({ repository }) {
  return repository.findAll();
}

export async function getOrderByCode(code, { repository }) {
  const order = await repository.findByCode(code);
  if (!order) throw notFound(code);
  return order;
}

export async function registerOrder(formData, { repository, quotationRepository, sequenceRepository }) {
  const quotation = await quotationRepository.findByCode(formData.quotationCode);
  if (!quotation) throw validationError('指定された見積が見つかりません');
  if (quotation.status !== '承認済み') throw validationError('承認済みの見積のみ受注できます');

  const code = await generateCode('order', { sequenceRepository });
  const order = createOrderFromQuotation(quotation, code, formData.orderDate);
  return repository.save(order);
}

export async function updateOrder(code, data, { repository }) {
  const existing = await repository.findByCode(code);
  if (!existing) throw notFound(code);
  return repository.update(code, data);
}

export async function submitOrderApproval(code, { repository, quotationRepository, submittedBy }) {
  const order = await repository.findByCode(code);
  if (!order) throw notFound(code);
  if (order.status !== '受注済み') {
    throw validationError('受注済み状態の受注のみ承認依頼できます');
  }

  // BL-04: 見積紐付けチェック
  if (!order.quotationCode) {
    throw validationError('承認依頼には見積の紐付けが必要です');
  }
  // BL-04: 金額一致チェック
  if (quotationRepository) {
    const quotation = await quotationRepository.findByCode(order.quotationCode);
    if (!quotation || Number(order.total) !== Number(quotation.total)) {
      throw validationError('受注合計金額と見積合計金額が一致しません');
    }
  }
  // BL-04: 添付ファイルチェック
  if (!order.attachments || order.attachments.length === 0) {
    throw validationError('承認依頼には1件以上の添付ファイルが必要です');
  }

  const updateData = { status: '承認依頼中' };
  if (submittedBy) updateData.submittedBy = submittedBy;
  return repository.update(code, updateData);
}

export async function approveOrder(code, comment, { repository }) {
  const order = await repository.findByCode(code);
  if (!order) throw notFound(code);
  if (order.status !== '承認依頼中') {
    throw validationError('承認依頼中の受注のみ承認できます');
  }
  return repository.update(code, { status: '承認済み', approvalComment: comment ?? '' });
}

export async function rejectOrder(code, reason, { repository }) {
  const order = await repository.findByCode(code);
  if (!order) throw notFound(code);
  if (order.status !== '承認依頼中') {
    throw validationError('承認依頼中の受注のみ却下できます');
  }
  return repository.update(code, { status: '却下', rejectReason: reason });
}
