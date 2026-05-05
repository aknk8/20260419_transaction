import { generateReceiptCode, createReceipt } from '../../src/receipt.js';

export async function listReceipts({ repository }) {
  return repository.findAll();
}

export async function registerReceipt(formData, { repository }) {
  const existingCodes = await repository.findAllCodes();
  const code = generateReceiptCode(existingCodes);
  const receipt = createReceipt(code, formData.invoiceCode, formData.receiptDate, formData.amount, formData.fee ?? 0, formData.notes ?? '');
  return repository.save({ ...receipt, ...formData, code });
}
