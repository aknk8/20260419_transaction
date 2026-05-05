import { eq } from 'drizzle-orm';
import { quotations, quotationDetails } from '../db/schema.js';

export function createQuotationRepository(db) {
  return {
    async findAll() {
      return db.query.quotations.findMany();
    },

    async findByCode(code) {
      const header = await db.query.quotations.findFirst({
        where: (q, { eq }) => eq(q.code, code)
      });
      if (!header) return null;
      const details = await db.query.quotationDetails.findMany({
        where: (d, { eq }) => eq(d.quotationCode, code)
      });
      return { ...header, details };
    },

    async findAllCodes() {
      const rows = await db.query.quotations.findMany();
      return rows.map((r) => r.code);
    },

    async save(quotation) {
      const { details, ...header } = quotation;
      const [savedHeader] = await db.insert(quotations).values(header).returning();
      let savedDetails = [];
      if (details && details.length > 0) {
        savedDetails = await db
          .insert(quotationDetails)
          .values(details.map((d) => ({ ...d, quotationCode: savedHeader.code })))
          .returning();
      }
      return { ...savedHeader, details: savedDetails };
    },

    async update(code, data) {
      const [row] = await db
        .update(quotations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(quotations.code, code))
        .returning();
      return row;
    }
  };
}
