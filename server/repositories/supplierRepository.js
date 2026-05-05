import { eq } from 'drizzle-orm';
import { suppliers } from '../db/schema.js';

export function createSupplierRepository(db) {
  return {
    async findAll() {
      return db.query.suppliers.findMany();
    },

    async findByCode(code) {
      const row = await db.query.suppliers.findFirst({
        where: (s, { eq }) => eq(s.code, code)
      });
      return row ?? null;
    },

    async findAllCodes() {
      const rows = await db.query.suppliers.findMany();
      return rows.map((r) => r.code);
    },

    async save(supplier) {
      const [row] = await db.insert(suppliers).values(supplier).returning();
      return row;
    },

    async update(code, data) {
      const [row] = await db
        .update(suppliers)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(suppliers.code, code))
        .returning();
      return row;
    }
  };
}
