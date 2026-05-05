import { eq } from 'drizzle-orm';
import { deliveries } from '../db/schema.js';

export function createDeliveryRepository(db) {
  return {
    async findAll() {
      return db.query.deliveries.findMany();
    },

    async findAllCodes() {
      const rows = await db.query.deliveries.findMany();
      return rows.map((r) => r.code);
    },

    async save(data) {
      const [row] = await db.insert(deliveries).values(data).returning();
      return row;
    },

    async update(code, data) {
      const [row] = await db
        .update(deliveries)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(deliveries.code, code))
        .returning();
      return row;
    }
  };
}
