import { eq } from 'drizzle-orm';
import { orders, orderDetails } from '../db/schema.js';

export function createOrderRepository(db) {
  return {
    async findAll() {
      return db.query.orders.findMany();
    },

    async findByCode(code) {
      const header = await db.query.orders.findFirst({
        where: (o, { eq }) => eq(o.code, code)
      });
      if (!header) return null;
      const details = await db.query.orderDetails.findMany({
        where: (d, { eq }) => eq(d.orderCode, code)
      });
      return { ...header, details };
    },

    async findAllCodes() {
      const rows = await db.query.orders.findMany();
      return rows.map((r) => r.code);
    },

    async save(order) {
      const { details, attachments, ...header } = order;
      const [savedHeader] = await db.insert(orders).values(header).returning();
      let savedDetails = [];
      if (details && details.length > 0) {
        savedDetails = await db
          .insert(orderDetails)
          .values(details.map((d) => ({ ...d, orderCode: savedHeader.code })))
          .returning();
      }
      return { ...savedHeader, details: savedDetails };
    },

    async update(code, data) {
      const [row] = await db
        .update(orders)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(orders.code, code))
        .returning();
      return row;
    }
  };
}
