import { eq } from 'drizzle-orm';
import { purchaseOrders, purchaseOrderDetails } from '../db/schema.js';

export function createInMemoryPurchaseOrderRepository(initialData = []) {
  const toStore = () => initialData.map(({ details, attachments, ...h }) => ({
    header: { ...h },
    details: (details ?? []).map(d => ({ ...d }))
  }));
  let store = toStore();

  return {
    reset() { store = toStore(); },
    async findAll() { return store.map(({ header }) => ({ ...header })); },
    async findByCode(code) {
      const entry = store.find(e => e.header.code === code);
      if (!entry) return null;
      return { ...entry.header, details: entry.details.map(d => ({ ...d })) };
    },
    async findAllCodes() { return store.map(e => e.header.code); },
    async save(purchaseOrder) {
      const { details, attachments, ...header } = purchaseOrder;
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

export function createPurchaseOrderRepository(db) {
  return {
    async findAll() {
      return db.query.purchaseOrders.findMany();
    },

    async findByCode(code) {
      const header = await db.query.purchaseOrders.findFirst({
        where: (po, { eq }) => eq(po.code, code)
      });
      if (!header) return null;
      const details = await db.query.purchaseOrderDetails.findMany({
        where: (d, { eq }) => eq(d.purchaseOrderCode, code)
      });
      return { ...header, details };
    },

    async findAllCodes() {
      const rows = await db.query.purchaseOrders.findMany();
      return rows.map((r) => r.code);
    },

    async save(purchaseOrder) {
      const { details, attachments, ...header } = purchaseOrder;
      const [savedHeader] = await db.insert(purchaseOrders).values(header).returning();
      let savedDetails = [];
      if (details && details.length > 0) {
        savedDetails = await db
          .insert(purchaseOrderDetails)
          .values(details.map((d) => ({ ...d, purchaseOrderCode: savedHeader.code })))
          .returning();
      }
      return { ...savedHeader, details: savedDetails };
    },

    async update(code, data) {
      const [row] = await db
        .update(purchaseOrders)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(purchaseOrders.code, code))
        .returning();
      return row;
    }
  };
}
