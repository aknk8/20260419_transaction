import { eq } from 'drizzle-orm';
import { deliveries } from '../db/schema.js';

export function createInMemoryDeliveryRepository(initialData = []) {
  let store = initialData.map(r => ({ ...r }));

  return {
    reset() { store = initialData.map(r => ({ ...r })); },
    async findAll() { return [...store]; },
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
