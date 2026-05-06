import { eq } from 'drizzle-orm';
import { invoices, invoiceDetails } from '../db/schema.js';

export function createInMemoryInvoiceRepository(initialData = []) {
  const store = initialData.map(({ details, ...h }) => ({
    header: { ...h },
    details: (details ?? []).map(d => ({ ...d }))
  }));

  return {
    async findAll() { return store.map(({ header }) => ({ ...header })); },
    async findByCode(code) {
      const entry = store.find(e => e.header.code === code);
      if (!entry) return null;
      return { ...entry.header, details: entry.details.map(d => ({ ...d })) };
    },
    async findAllCodes() { return store.map(e => e.header.code); },
    async save(invoice) {
      const { details, ...header } = invoice;
      const savedDetails = (details ?? []).map(d => ({ ...d }));
      store.push({ header: { ...header }, details: savedDetails });
      return { ...header, details: savedDetails };
    },
    async update(code, data) {
      const entry = store.find(e => e.header.code === code);
      if (!entry) return null;
      entry.header = { ...entry.header, ...data, updatedAt: new Date() };
      return { ...entry.header };
    }
  };
}

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
