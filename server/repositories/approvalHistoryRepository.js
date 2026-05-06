import { and, eq } from 'drizzle-orm';
import { approvalHistory } from '../db/schema.js';

export function createApprovalHistoryRepository(db) {
  return {
    async save(entry) {
      const [saved] = await db.insert(approvalHistory).values(entry).returning();
      return saved;
    },

    async findByDocument(documentType, documentId) {
      return db.query.approvalHistory.findMany({
        where: (h, { and, eq }) => and(eq(h.documentType, documentType), eq(h.documentId, documentId))
      });
    }
  };
}
