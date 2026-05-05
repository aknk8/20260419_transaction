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
