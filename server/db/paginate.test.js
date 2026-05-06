import { describe, it, expect } from 'vitest';
import { buildPaginatedQuery, paginateArray } from './paginate.js';

describe('buildPaginatedQuery', () => {
  it('should return dataQuery with LIMIT and OFFSET for page=1 limit=20', () => {
    // Arrange
    const base = 'SELECT * FROM quotations WHERE status = $1';

    // Act
    const result = buildPaginatedQuery(base, { page: 1, limit: 20 });

    // Assert
    expect(result.dataQuery).toContain('LIMIT $2 OFFSET $3');
    expect(result.params).toEqual([20, 0]);
  });

  it('should calculate correct offset for page=3 limit=20', () => {
    // Arrange
    const base = 'SELECT * FROM orders';

    // Act
    const result = buildPaginatedQuery(base, { page: 3, limit: 20 });

    // Assert
    expect(result.params).toEqual([20, 40]);
  });

  it('should include countQuery wrapping the baseQuery', () => {
    // Arrange
    const base = 'SELECT * FROM invoices';

    // Act
    const result = buildPaginatedQuery(base, { page: 1, limit: 20 });

    // Assert
    expect(result.countQuery).toContain('SELECT COUNT(*)');
    expect(result.countQuery).toContain(base);
  });

  it('should default to page=1 and limit=20 when params omitted', () => {
    // Arrange
    const base = 'SELECT * FROM payments';

    // Act
    const result = buildPaginatedQuery(base, {});

    // Assert
    expect(result.params).toEqual([20, 0]);
  });
});

describe('paginateArray', () => {
  const makeItems = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));

  it('should return data and meta when page=1 and limit=20', () => {
    // Arrange
    const items = makeItems(50);

    // Act
    const result = paginateArray(items, { page: 1, limit: 20 });

    // Assert
    expect(result.data).toHaveLength(20);
    expect(result.data[0]).toEqual({ id: 1 });
    expect(result.meta).toEqual({ total: 50, page: 1, pageSize: 20, totalPages: 3 });
  });

  it('should return empty data array when page exceeds total pages', () => {
    // Arrange
    const items = makeItems(15);

    // Act
    const result = paginateArray(items, { page: 5, limit: 20 });

    // Assert
    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(15);
    expect(result.meta.totalPages).toBe(1);
  });

  it('should default to page=1 and limit=20 when params omitted', () => {
    // Arrange
    const items = makeItems(100);

    // Act
    const result = paginateArray(items, {});

    // Assert
    expect(result.data).toHaveLength(20);
    expect(result.meta.page).toBe(1);
    expect(result.meta.pageSize).toBe(20);
  });

  it('should return last page with remaining items', () => {
    // Arrange
    const items = makeItems(25);

    // Act
    const result = paginateArray(items, { page: 2, limit: 20 });

    // Assert
    expect(result.data).toHaveLength(5);
    expect(result.data[0]).toEqual({ id: 21 });
    expect(result.meta.totalPages).toBe(2);
  });

  it('should handle empty array with totalPages=0', () => {
    // Arrange & Act
    const result = paginateArray([], { page: 1, limit: 20 });

    // Assert
    expect(result.data).toHaveLength(0);
    expect(result.meta).toEqual({ total: 0, page: 1, pageSize: 20, totalPages: 0 });
  });
});
