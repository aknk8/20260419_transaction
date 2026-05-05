import { eq } from 'drizzle-orm';
import { projects } from '../db/schema.js';

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
