import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '004_indexes.sql'), 'utf-8');

describe('004_indexes.sql', () => {
  it('should wrap changes in a transaction', () => {
    expect(sql).toMatch(/BEGIN/);
    expect(sql).toMatch(/COMMIT/);
  });

  it('should use IF NOT EXISTS for idempotent execution', () => {
    const matches = sql.match(/CREATE INDEX IF NOT EXISTS/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBeGreaterThanOrEqual(8);
  });

  it('should contain composite index for quotations status and issue_date', () => {
    // should return quotations in status order filtered by date range
    expect(sql).toMatch(/idx_quotations_status_date/);
    expect(sql).toMatch(/ON quotations\(status,\s*issue_date\)/);
  });

  it('should contain index for orders status', () => {
    expect(sql).toMatch(/idx_orders_status/);
    expect(sql).toMatch(/ON orders\(status\)/);
  });

  it('should contain index for purchase_orders status', () => {
    expect(sql).toMatch(/idx_purchase_orders_status/);
    expect(sql).toMatch(/ON purchase_orders\(status\)/);
  });

  it('should contain composite index for invoices status and due_date', () => {
    // should support 期限切れ請求の一覧 queries
    expect(sql).toMatch(/idx_invoices_status_due/);
    expect(sql).toMatch(/ON invoices\(status,\s*due_date\)/);
  });

  it('should contain index for payments status', () => {
    expect(sql).toMatch(/idx_payments_status/);
    expect(sql).toMatch(/ON payments\(status\)/);
  });

  it('should contain partial index for pending approval quotations', () => {
    // Partial index avoids full scan when listing 承認依頼中 documents
    expect(sql).toMatch(/idx_quotations_approval_pending/);
    expect(sql).toMatch(/WHERE status\s*=\s*'承認依頼中'/);
  });

  it('should contain composite index for invoices by customer and status', () => {
    // supports listInvoiceCandidates filtering by customerId + status
    expect(sql).toMatch(/idx_invoices_customer/);
    expect(sql).toMatch(/ON invoices\(customer_id,\s*status\)/);
  });

  it('should contain composite index for payments by supplier and status', () => {
    // supports payment listing filtered by supplierId
    expect(sql).toMatch(/idx_payments_supplier/);
    expect(sql).toMatch(/ON payments\(supplier_id,\s*status\)/);
  });
});
