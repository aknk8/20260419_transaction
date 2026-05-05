import { eq } from 'drizzle-orm';
import { invoices, invoiceDetails } from '../db/schema.js';

export function createInvoiceRepository(db) {
  return {
    async findAll() {
      return db.query.invoices.findMany();
    },

    async findByCode(code) {
      const header = await db.query.invoices.findFirst({
        where: (i, { eq }) => eq(i.code, code)
      });
      if (!header) return null;
      const details = await db.query.invoiceDetails.findMany({
        where: (d, { eq }) => eq(d.invoiceCode, code)
      });
      return { ...header, details };
    },

    async findAllCodes() {
      const rows = await db.query.invoices.findMany();
      return rows.map((r) => r.code);
    },

    async save(invoice) {
      const { details, ...header } = invoice;
      const [savedHeader] = await db.insert(invoices).values(header).returning();
      let savedDetails = [];
      if (details && details.length > 0) {
        savedDetails = await db
          .insert(invoiceDetails)
          .values(details.map((d) => ({ ...d, invoiceCode: savedHeader.code })))
          .returning();
      }
      return { ...savedHeader, details: savedDetails };
    },

    async update(code, data) {
      const [row] = await db
        .update(invoices)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(invoices.code, code))
        .returning();
      return row;
    }
  };
}
