import { eq } from 'drizzle-orm';
import { receipts } from '../db/schema.js';

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
