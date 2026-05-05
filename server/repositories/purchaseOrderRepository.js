import { eq } from 'drizzle-orm';
import { purchaseOrders, purchaseOrderDetails } from '../db/schema.js';

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
