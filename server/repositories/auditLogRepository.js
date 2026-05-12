import { auditLogs } from '../db/schema.js';

export function createDbAuditLogRepository(db) {
  return {
    async save(entry) {
      const [row] = await db.insert(auditLogs).values({
        userId:      entry.userId      ?? null,
        userName:    entry.userName    ?? null,
        action:      entry.action,
        entityType:  entry.entityType  ?? null,
        entityId:    entry.entityId    ?? null,
        beforeData:  entry.beforeData  != null ? JSON.stringify(entry.beforeData) : null,
        afterData:   entry.afterData   != null ? JSON.stringify(entry.afterData)  : null,
        ipAddress:   entry.ipAddress   ?? null,
        userAgent:   entry.userAgent   ?? null,
        result:      entry.result      ?? 'SUCCESS',
        errorDetail: entry.errorDetail ?? null
      }).returning();
      return row;
    },

    async findAll() {
      return db.query.auditLogs.findMany({
        orderBy: (t, { desc }) => [desc(t.createdAt)]
      });
    }
  };
}

export function createAuditLogRepository(store = []) {
  let nextId = 1;

  return {
    async save(entry) {
      const record = {
        id: nextId++,
        userId: entry.userId ?? null,
        userName: entry.userName ?? null,
        action: entry.action,
        entityType: entry.entityType ?? null,
        entityId: entry.entityId ?? null,
        beforeData: entry.beforeData ?? null,
        afterData: entry.afterData ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        result: entry.result ?? 'SUCCESS',
        errorDetail: entry.errorDetail ?? null,
        createdAt: new Date()
      };
      store.push(record);
      return record;
    },

    async findAll() {
      return [...store];
    }
  };
}
