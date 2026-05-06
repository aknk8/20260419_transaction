import { eq } from 'drizzle-orm';
import { approvalRoutes } from '../db/schema.js';

export function createInMemoryApprovalRouteRepository(initialData = []) {
  let nextId = 1;
  const store = initialData.map(r => ({ ...r, id: r.id ?? nextId++ }));

  return {
    async findAll() { return [...store]; },
    async findByDocumentType(documentType) {
      return store
        .filter(r => r.documentType === documentType)
        .sort((a, b) => (a.stepNumber ?? 0) - (b.stepNumber ?? 0))
        .map(r => ({ ...r }));
    },
    async findById(id) { return store.find(r => r.id === id) ?? null; },
    async save(data) {
      const record = { ...data, id: data.id ?? nextId++ };
      store.push(record);
      return record;
    },
    async update(id, data) {
      const idx = store.findIndex(r => r.id === id);
      if (idx === -1) return null;
      store[idx] = { ...store[idx], ...data };
      return { ...store[idx] };
    },
    async remove(id) {
      const idx = store.findIndex(r => r.id === id);
      if (idx !== -1) store.splice(idx, 1);
    }
  };
}

export function createApprovalRouteRepository(db) {
  return {
    async findAll() {
      return db.query.approvalRoutes.findMany();
    },

    async findByDocumentType(documentType) {
      return db.query.approvalRoutes.findMany({
        where: (r, { eq }) => eq(r.documentType, documentType),
        orderBy: (r, { asc }) => [asc(r.stepNumber)]
      });
    },

    async findById(id) {
      const row = await db.query.approvalRoutes.findFirst({
        where: (r, { eq }) => eq(r.id, id)
      });
      return row ?? null;
    },

    async save(data) {
      const [row] = await db.insert(approvalRoutes).values(data).returning();
      return row;
    },

    async update(id, data) {
      const [row] = await db
        .update(approvalRoutes)
        .set(data)
        .where(eq(approvalRoutes.id, id))
        .returning();
      return row ?? null;
    },

    async remove(id) {
      await db.delete(approvalRoutes).where(eq(approvalRoutes.id, id));
    }
  };
}
