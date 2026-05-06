import { eq } from 'drizzle-orm';
import { payments } from '../db/schema.js';

export function createInMemoryPaymentRepository(initialData = []) {
  const store = initialData.map(r => ({ ...r }));

  return {
    async findAll() { return [...store]; },
    async findByCode(code) { return store.find(r => r.code === code) ?? null; },
    async findAllCodes() { return store.map(r => r.code); },
    async save(data) {
      const record = { ...data };
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
