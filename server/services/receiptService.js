import { createReceipt } from '../../src/receipt.js';
import { generateCode } from './sequenceService.js';
import { withTransaction } from '../db/transaction.js';

export async function listReceipts({ repository }) {
  return repository.findAll();
}

export async function registerReceipt(formData, { repository, invoiceRepository, sequenceRepository, db }) {
  // INF-10: wrap receipt save + invoice status update in single transaction
  return withTransaction(db ?? null, async () => {
    const code = await generateCode('receipt', { sequenceRepository });
    const receipt = createReceipt(code, formData.invoiceCode, formData.receiptDate, formData.amount, formData.fee ?? 0, formData.notes ?? '');
    const saved = await repository.save({ ...receipt, ...formData, code });

    if (invoiceRepository && formData.invoiceCode) {
      const invoice = await invoiceRepository.findByCode(formData.invoiceCode);
      if (invoice) {
        // Sum all prior receipts plus this one to determine payment status
        const priorReceipts = repository.findByInvoiceCode
          ? await repository.findByInvoiceCode(formData.invoiceCode)
          : [];
        const priorPaid = priorReceipts.reduce(
          (sum, r) => sum + Number(r.amount ?? 0) - Number(r.fee ?? 0),
          0
        );
        const netNew = Number(formData.amount) - Number(formData.fee ?? 0);
        const totalPaid = priorPaid + netNew;
        const invoiceTotal = Number(invoice.total ?? 0);
        const newStatus = totalPaid >= invoiceTotal ? '消込済み' : '一部消込';
        await invoiceRepository.update(formData.invoiceCode, { status: newStatus });
      }
    }

    return saved;
  });
}
