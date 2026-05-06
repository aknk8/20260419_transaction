import { eq } from 'drizzle-orm';
import { suppliers } from '../db/schema.js';

export function createInMemorySupplierRepository(initialData = []) {
  const store = initialData.map(r => ({ ...r }));

  return {
    async findAll() { return [...store]; },
    async findByCode(code) { return store.find(r => r.code === code) ?? null; },
    async findAllCodes() { return store.map(r => r.code); },
    async save(supplier) {
      const record = { ...supplier };
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
