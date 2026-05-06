export async function withTransaction(db, fn) {
  if (db && typeof db.transaction === 'function') {
    return db.transaction(fn);
  }
  return fn(db);
}
