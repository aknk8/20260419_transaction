import { eq } from 'drizzle-orm';
import { projects } from '../db/schema.js';

export function createInMemoryProjectRepository(initialData = []) {
  let store = initialData.map(r => ({ ...r }));

  return {
    reset() { store = initialData.map(r => ({ ...r })); },
    async findAll() { return [...store]; },
    async findByCode(code) { return store.find(r => r.code === code) ?? null; },
    async findAllCodes() { return store.map(r => r.code); },
    async save(project) {
      const record = { ...project };
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

export function createProjectRepository(db) {
  return {
    async findAll() {
      return db.query.projects.findMany();
    },

    async findByCode(code) {
      const row = await db.query.projects.findFirst({
        where: (p, { eq }) => eq(p.code, code)
      });
      return row ?? null;
    },

    async findAllCodes() {
      const rows = await db.query.projects.findMany();
      return rows.map((r) => r.code);
    },

    async save(project) {
      const [row] = await db.insert(projects).values(project).returning();
      return row;
    },

    async update(code, data) {
      const [row] = await db
        .update(projects)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(projects.code, code))
        .returning();
      return row;
    }
  };
}
