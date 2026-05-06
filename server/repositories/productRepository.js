import { eq } from 'drizzle-orm';
import { products } from '../db/schema.js';

export function createInMemoryProductRepository(initialData = []) {
  const store = initialData.map(r => ({ ...r }));

  return {
    async findAll() { return [...store]; },
    async findByCode(code) { return store.find(r => r.code === code) ?? null; },
    async findAllCodes() { return store.map(r => r.code); },
    async save(product) {
      const record = { ...product };
      store.push(record);
      return record;
    },
    async update(code, data) {
      const idx = store.findIndex(r => r.code === code);
      if (idx === -1) return null;
      store[idx] = { ...store[idx], ...data, updatedAt: new Date() };
      return { ...store[idx] };
    }
  };
}

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
