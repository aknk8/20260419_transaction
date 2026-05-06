import { describe, it, expect, vi } from 'vitest';
import { withTransaction } from './transaction.js';

describe('withTransaction', () => {
  it('should call fn with tx when db has transaction method', async () => {
    // Arrange
    const tx = { isTransaction: true };
    const db = { transaction: vi.fn().mockImplementation((fn) => fn(tx)) };
    const fn = vi.fn().mockResolvedValue('result');

    // Act
    const result = await withTransaction(db, fn);

    // Assert
    expect(db.transaction).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(tx);
    expect(result).toBe('result');
  });

  it('should call fn with db directly when db has no transaction method', async () => {
    // Arrange
    const db = { someMethod: vi.fn() };
    const fn = vi.fn().mockResolvedValue('result');

    // Act
    const result = await withTransaction(db, fn);

    // Assert
    expect(fn).toHaveBeenCalledWith(db);
    expect(result).toBe('result');
  });

  it('should call fn with null when db is null', async () => {
    // Arrange
    const fn = vi.fn().mockResolvedValue('result');

    // Act
    const result = await withTransaction(null, fn);

    // Assert
    expect(fn).toHaveBeenCalledWith(null);
    expect(result).toBe('result');
  });

  it('should propagate errors thrown inside fn', async () => {
    // Arrange
    const db = { someMethod: vi.fn() };
    const fn = vi.fn().mockRejectedValue(new Error('db error'));

    // Act & Assert
    await expect(withTransaction(db, fn)).rejects.toThrow('db error');
  });

  it('should propagate errors from transaction rollback', async () => {
    // Arrange
    const db = {
      transaction: vi.fn().mockImplementation(async (fn) => {
        await fn({ isTransaction: true });
      })
    };
    const fn = vi.fn().mockRejectedValue(new Error('rollback'));

    // Act & Assert
    await expect(withTransaction(db, fn)).rejects.toThrow('rollback');
  });
});
