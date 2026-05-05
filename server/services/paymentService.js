import { generatePaymentCode, createPaymentRequest } from '../../src/payment.js';

function notFound(msg) { return Object.assign(new Error(msg), { statusCode: 404 }); }
function validationError(msg) { return Object.assign(new Error(msg), { statusCode: 400 }); }

export async function listPayments({ repository }) {
  return repository.findAll();
}

export async function getPaymentByCode(code, { repository }) {
  const payment = await repository.findByCode(code);
  if (!payment) throw notFound('支払依頼が見つかりません');
  return payment;
}

export async function submitPaymentApproval(code, { repository }) {
  const payment = await repository.findByCode(code);
  if (!payment) throw notFound('支払依頼が見つかりません');
  if (payment.status !== '下書き') throw validationError('下書き状態のみ承認依頼できます');
  return repository.update(code, { status: '承認依頼中' });
}

export async function rejectPayment(code, reason, { repository }) {
  const payment = await repository.findByCode(code);
  if (!payment) throw notFound('支払依頼が見つかりません');
  if (payment.status !== '承認依頼中') throw validationError('承認依頼中状態のみ却下できます');
  return repository.update(code, { status: '却下', rejectReason: reason ?? null });
}

export async function registerPayment(formData, { repository }) {
  const existingCodes = await repository.findAllCodes();
  const code = generatePaymentCode(existingCodes);
  const payment = createPaymentRequest(code, formData.purchaseOrderCode ?? '', formData.supplierId, formData.title, formData.paymentDate, formData.amount, formData.notes ?? '');
  return repository.save({ ...payment, ...formData, code });
}

export async function approvePayment(code, comment, { repository }) {
  const payment = await repository.findByCode(code);
  if (!payment) throw notFound('支払依頼が見つかりません');
  if (payment.status !== '承認依頼中') throw validationError('承認依頼中状態のみ承認できます');
  return repository.update(code, { status: '承認済み', approvalComment: comment ?? null });
}

export async function cancelPayment(code, { repository }) {
  const payment = await repository.findByCode(code);
  if (!payment) throw notFound('支払依頼が見つかりません');
  const cancellable = ['下書き', '承認依頼中'];
  if (!cancellable.includes(payment.status)) throw validationError('下書き・承認依頼中状態のみキャンセルできます');
  return repository.update(code, { status: 'キャンセル' });
}

export async function registerPaymentResult(code, { repository }) {
  const payment = await repository.findByCode(code);
  if (!payment) throw notFound('支払依頼が見つかりません');
  if (payment.status !== '承認済み') throw validationError('承認済み状態のみ支払実績登録できます');
  return repository.update(code, { status: '支払済み' });
}
