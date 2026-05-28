import { eq } from 'drizzle-orm';
import { receipts } from '../db/schema.js';

export function createInMemoryReceiptRepository(initialData = []) {
  let store = initialData.map(r => ({ ...r }));

  return {
    reset() { store = initialData.map(r => ({ ...r })); },
    async findAll() { return [...store]; },
    async findAllCodes() { return store.map(r => r.code); },
    async save(data) {
      const record = { ...data };
      store.push(record);
      return record;
    },
    async findByInvoiceCode(invoiceCode) {
      return store.filter(r => r.invoiceCode === invoiceCode).map(r => ({ ...r }));
    },
    async update(code, data) {
      const idx = store.findIndex(r => r.code === code);
      if (idx === -1) return null;
      store[idx] = { ...store[idx], ...data, updatedAt: new Date() };
      return { ...store[idx] };
    }
  };
}

export function createReceiptRepository(db) {
  return {
    async findAll() {
      return db.query.receipts.findMany();
    },

    async findAllCodes() {
      const rows = await db.query.receipts.findMany();
      return rows.map((r) => r.code);
    },

    async save(data) {
      const [row] = await db.insert(receipts).values(data).returning();
      return row;
    },

    async findByInvoiceCode(invoiceCode) {
      return db.query.receipts.findMany({
        where: (r, { eq }) => eq(r.invoiceCode, invoiceCode)
      });
    },

    async update(code, data) {
      const [row] = await db
        .update(receipts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(receipts.code, code))
        .returning();
      return row;
    }
  };
}
