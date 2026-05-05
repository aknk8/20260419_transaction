import { eq } from 'drizzle-orm';
import { approvalRoutes } from '../db/schema.js';

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
