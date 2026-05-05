import { eq } from 'drizzle-orm';
import { products } from '../db/schema.js';

export function createProductRepository(db) {
  return {
    async findAll() {
      return db.query.products.findMany();
    },

    async findByCode(code) {
      const row = await db.query.products.findFirst({
        where: (p, { eq }) => eq(p.code, code)
      });
      return row ?? null;
    },

    async findAllCodes() {
      const rows = await db.query.products.findMany();
      return rows.map((r) => r.code);
    },

    async save(product) {
      const [row] = await db.insert(products).values(product).returning();
      return row;
    },

    async update(code, data) {
      const [row] = await db
        .update(products)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(products.code, code))
        .returning();
      return row;
    }
  };
}
