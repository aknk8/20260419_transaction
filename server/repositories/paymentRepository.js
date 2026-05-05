import { eq } from 'drizzle-orm';
import { payments } from '../db/schema.js';

export function createPaymentRepository(db) {
  return {
    async findAll() {
      return db.query.payments.findMany();
    },

    async findByCode(code) {
      const row = await db.query.payments.findFirst({
        where: (p, { eq }) => eq(p.code, code)
      });
      return row ?? null;
    },

    async findAllCodes() {
      const rows = await db.query.payments.findMany();
      return rows.map((r) => r.code);
    },

    async save(data) {
      const [row] = await db.insert(payments).values(data).returning();
      return row;
    },

    async update(code, data) {
      const [row] = await db
        .update(payments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(payments.code, code))
        .returning();
      return row;
    }
  };
}
