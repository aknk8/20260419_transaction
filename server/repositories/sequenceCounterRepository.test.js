import { describe, it, expect, vi } from 'vitest';
import { createSequenceCounterRepository } from './sequenceCounterRepository.js';

const makeReturning = (currentVal) =>
  vi.fn().mockResolvedValue([{ currentVal }]);

const makeMockDb = (currentVal = 1) => {
  const returning = makeReturning(currentVal);
  const onConflictDoUpdate = vi.fn().mockReturnValue({ returning });
  const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
  const insert = vi.fn().mockReturnValue({ values });
  return { insert, _mocks: { values, onConflictDoUpdate, returning } };
};

describe('createSequenceCounterRepository', () => {
  describe('nextVal', () => {
    it('should return 1 when entity_type is inserted for the first time', async () => {
      // Arrange
      const db = makeMockDb(1);
      const repo = createSequenceCounterRepository(db);

      // Act
      const result = await repo.nextVal('quotation');

      // Assert
      expect(result).toBe(1);
    });

    it('should return incremented value when entity_type already exists', async () => {
      // Arrange
      const db = makeMockDb(5);
      const repo = createSequenceCounterRepository(db);

      // Act
      const result = await repo.nextVal('order');

      // Assert
      expect(result).toBe(5);
    });

    it('should call insert with correct entity_type and initial currentVal of 1', async () => {
      // Arrange
      const db = makeMockDb(1);
      const repo = createSequenceCounterRepository(db);

      // Act
      await repo.nextVal('invoice');

      // Assert
      expect(db.insert).toHaveBeenCalledOnce();
      expect(db._mocks.values).toHaveBeenCalledWith({ entityType: 'invoice', currentVal: 1 });
    });

    it('should use onConflictDoUpdate to atomically increment existing value', async () => {
      // Arrange
      const db = makeMockDb(3);
      const repo = createSequenceCounterRepository(db);

      // Act
      await repo.nextVal('payment');

      // Assert
      expect(db._mocks.onConflictDoUpdate).toHaveBeenCalledOnce();
      const callArg = db._mocks.onConflictDoUpdate.mock.calls[0][0];
      expect(callArg).toHaveProperty('target');
      expect(callArg).toHaveProperty('set');
    });

    it('should call returning to get the new current_val', async () => {
      // Arrange
      const db = makeMockDb(7);
      const repo = createSequenceCounterRepository(db);

      // Act
      await repo.nextVal('delivery');

      // Assert
      expect(db._mocks.returning).toHaveBeenCalledOnce();
    });
  });
});
