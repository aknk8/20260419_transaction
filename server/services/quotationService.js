import { generateQuotationCode, createQuotation } from '../../src/quotation.js';

function notFound(code) {
  const err = new Error(`見積コード ${code} は存在しません`);
  err.statusCode = 404;
  return err;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

export async function listQuotations({ repository }) {
  return repository.findAll();
}

export async function getQuotationByCode(code, { repository }) {
  const quotation = await repository.findByCode(code);
  if (!quotation) throw notFound(code);
  return quotation;
}

export async function registerQuotation(formData, { repository }) {
  if (!formData.title || !formData.title.trim()) {
    throw validationError('件名は必須です');
  }
  const existingCodes = await repository.findAllCodes();
  const code = generateQuotationCode(existingCodes);
  const quotation = createQuotation({ ...formData, code });
  return repository.save(quotation);
}

export async function updateQuotation(code, data, { repository }) {
  const existing = await repository.findByCode(code);
  if (!existing) throw notFound(code);
  return repository.update(code, data);
}

export async function submitQuotationApproval(code, { repository, submittedBy }) {
  const quotation = await repository.findByCode(code);
  if (!quotation) throw notFound(code);
  if (quotation.status !== '下書き') {
    throw validationError('下書き状態の見積のみ承認依頼できます');
  }
  const updateData = { status: '承認依頼中' };
  if (submittedBy) updateData.submittedBy = submittedBy;
  return repository.update(code, updateData);
}

export async function approveQuotation(code, comment, { repository }) {
  const quotation = await repository.findByCode(code);
  if (!quotation) throw notFound(code);
  if (quotation.status !== '承認依頼中') {
    throw validationError('承認依頼中の見積のみ承認できます');
  }
  return repository.update(code, { status: '承認済み', approvalComment: comment ?? '' });
}

export async function rejectQuotation(code, reason, { repository }) {
  const quotation = await repository.findByCode(code);
  if (!quotation) throw notFound(code);
  if (quotation.status !== '承認依頼中') {
    throw validationError('承認依頼中の見積のみ却下できます');
  }
  return repository.update(code, { status: '却下', rejectReason: reason });
}
