import { generateInvoiceCode, createInvoice } from '../../src/invoice.js';

function notFound(msg) { return Object.assign(new Error(msg), { statusCode: 404 }); }
function validationError(msg) { return Object.assign(new Error(msg), { statusCode: 400 }); }

export async function listInvoices({ repository }) {
  return repository.findAll();
}

export async function getInvoiceByCode(code, { repository }) {
  const invoice = await repository.findByCode(code);
  if (!invoice) throw notFound('請求が見つかりません');
  return invoice;
}

export async function registerInvoice(formData, { repository }) {
  const existingCodes = await repository.findAllCodes();
  const code = generateInvoiceCode(existingCodes);
  const invoice = createInvoice(code, formData.orderCode, formData.customerId, formData.title, formData.invoiceDate, formData.dueDate);
  return repository.save({ ...invoice, ...formData, code, details: formData.details ?? [] });
}

export async function updateInvoice(code, data, { repository }) {
  return repository.update(code, data);
}

export async function submitInvoiceApproval(code, { repository, submittedBy }) {
  const invoice = await repository.findByCode(code);
  if (!invoice) throw notFound('請求が見つかりません');
  if (invoice.status !== '下書き') throw validationError('下書き状態のみ承認依頼できます');
  const updateData = { status: '承認依頼中' };
  if (submittedBy) updateData.submittedBy = submittedBy;
  return repository.update(code, updateData);
}

export async function approveInvoice(code, comment, { repository }) {
  const invoice = await repository.findByCode(code);
  if (!invoice) throw notFound('請求が見つかりません');
  if (invoice.status !== '承認依頼中') throw validationError('承認依頼中状態のみ承認できます');
  return repository.update(code, { status: '確定', approvalComment: comment ?? null });
}

export async function rejectInvoice(code, reason, { repository }) {
  const invoice = await repository.findByCode(code);
  if (!invoice) throw notFound('請求が見つかりません');
  if (invoice.status !== '承認依頼中') throw validationError('承認依頼中状態のみ却下できます');
  return repository.update(code, { status: '却下', rejectReason: reason ?? null });
}
