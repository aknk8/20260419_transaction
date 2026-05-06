import { eq } from 'drizzle-orm';
import { orders, orderDetails, orderAttachments } from '../db/schema.js';

export function createInMemoryOrderRepository(initialData = []) {
  const store = initialData.map(({ details, attachments, ...h }) => ({
    header: { ...h },
    details: (details ?? []).map(d => ({ ...d })),
    attachments: (attachments ?? []).map(a => ({ ...a }))
  }));

  return {
    async findAll() { return store.map(({ header }) => ({ ...header })); },
    async findByCode(code) {
      const entry = store.find(e => e.header.code === code);
      if (!entry) return null;
      return { ...entry.header, details: entry.details.map(d => ({ ...d })), attachments: entry.attachments.map(a => ({ ...a })) };
    },
    async findAllCodes() { return store.map(e => e.header.code); },
    async save(order) {
      const { details, attachments, ...header } = order;
      const savedDetails = (details ?? []).map(d => ({ ...d }));
      const savedAttachments = (attachments ?? []).map(a => ({ ...a }));
      store.push({ header: { ...header }, details: savedDetails, attachments: savedAttachments });
      return { ...header, details: savedDetails, attachments: savedAttachments };
    },
    async update(code, data) {
      const entry = store.find(e => e.header.code === code);
      if (!entry) return null;
      const { attachments, ...updateFields } = data;
      entry.header = { ...entry.header, ...updateFields, updatedAt: new Date() };
      return { ...entry.header };
    }
  };
}

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
      const attachments = await db.query.orderAttachments.findMany({
        where: (a, { eq }) => eq(a.orderCode, code)
      });
      return { ...header, details, attachments };
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
      let savedAttachments = [];
      if (attachments && attachments.length > 0) {
        savedAttachments = await db
          .insert(orderAttachments)
          .values(attachments.map((a) => ({ ...a, orderCode: savedHeader.code })))
          .returning();
      }
      return { ...savedHeader, details: savedDetails, attachments: savedAttachments };
    },

    async update(code, data) {
      const { attachments, ...updateFields } = data;
      const [row] = await db
        .update(orders)
        .set({ ...updateFields, updatedAt: new Date() })
        .where(eq(orders.code, code))
        .returning();
      return row;
    }
  };
}
