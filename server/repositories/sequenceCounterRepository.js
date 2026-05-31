import { sql } from 'drizzle-orm';
import { sequenceCounters } from '../db/schema.js';

export function createInMemorySequenceCounterRepository(initial = {}) {
  const counters = new Map(Object.entries(initial));
  return {
    reset() { counters.clear(); for (const [k, v] of Object.entries(initial)) counters.set(k, v); },
    async nextVal(entityType) {
      const current = counters.get(entityType) ?? 0;
      const next = current + 1;
      counters.set(entityType, next);
      return next;
    }
  };
}

export function createSequenceCounterRepository(db) {
  return {
    /**
     * 指定エンティティの採番値をアトミックにインクリメントして返す。
     * INSERT ... ON CONFLICT DO UPDATE によりレース条件を排除する。
     */
    async nextVal(entityType) {
      const [row] = await db
        .insert(sequenceCounters)
        .values({ entityType, currentVal: 1 })
        .onConflictDoUpdate({
          target: sequenceCounters.entityType,
          set: { currentVal: sql`sequence_counters.current_val + 1` }
        })
        .returning({ currentVal: sequenceCounters.currentVal });
      return row.currentVal;
    }
  };
}
