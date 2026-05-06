import { eq } from 'drizzle-orm';
import { customers } from '../db/schema.js';

export function createInMemoryCustomerRepository(initialData = []) {
  const store = initialData.map(r => ({ ...r }));

  return {
    async findAll() { return [...store]; },
    async findByCode(code) { return store.find(r => r.code === code) ?? null; },
    async findAllCodes() { return store.map(r => r.code); },
    async save(customer) {
      const record = { ...customer };
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

export function createCustomerRepository(db) {
  return {
    async findAll() {
      return db.query.customers.findMany();
    },

    async findByCode(code) {
      const row = await db.query.customers.findFirst({
        where: (c, { eq }) => eq(c.code, code)
      });
      return row ?? null;
    },

    async findAllCodes() {
      const rows = await db.query.customers.findMany();
      return rows.map((r) => r.code);
    },

    async save(customer) {
      const [row] = await db.insert(customers).values(customer).returning();
      return row;
    },

    async update(code, data) {
      const [row] = await db
        .update(customers)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(customers.code, code))
        .returning();
      return row;
    }
  };
}
