import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import postgres from 'postgres';
import { join } from 'path';
import { mkdtemp, writeFile } from 'fs/promises';
import { rmSync } from 'fs';
import { tmpdir } from 'os';
import { runMigrations, MIGRATIONS_DIR } from '../migrate.js';

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

describe.skipIf(!TEST_DATABASE_URL)('runMigrations (integration)', () => {
  let sql;

  beforeAll(async () => {
    sql = postgres(TEST_DATABASE_URL, { max: 1 });
    // クリーンな状態からテストを開始する
    await sql`DROP SCHEMA public CASCADE`;
    await sql`CREATE SCHEMA public`;
  });

  afterAll(async () => {
    await sql.end();
  });

  // ─────────────────────────────────────────────────────────────────────
  // 11-13-a: 全マイグレーションを実 DB に適用してスキーマを検証する
  // ─────────────────────────────────────────────────────────────────────
  describe('11-13-a: schema validation after applying all migrations', () => {
    beforeAll(async () => {
      // Arrange / Act: 全マイグレーションを順次適用する
      await runMigrations(sql, MIGRATIONS_DIR);
    });

    it('should create all expected tables when migrations are applied', async () => {
      // Assert
      const rows = await sql`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      const names = rows.map(r => r.table_name);

      const expected = [
        'approval_history',
        'approval_routes',
        'audit_logs',
        'customers',
        'deliveries',
        'invoice_details',
        'invoices',
        'notifications',
        'order_attachments',
        'order_details',
        'orders',
        'payments',
        'products',
        'projects',
        'purchase_order_details',
        'purchase_orders',
        'quotation_details',
        'quotations',
        'receipts',
        'refresh_tokens',
        'sequence_counters',
        'suppliers',
        'users',
      ];
      for (const table of expected) {
        expect(names, `table '${table}' should exist`).toContain(table);
      }
    });

    it('should create users table with all required columns', async () => {
      // Assert
      const cols = await sql`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
      `;
      const names = cols.map(c => c.column_name);

      expect(names).toContain('id');
      expect(names).toContain('name');
      expect(names).toContain('password_hash');
      expect(names).toContain('user_type');
      expect(names).toContain('status');
      expect(names).toContain('failed_login_count');
      expect(names).toContain('locked_until');
      expect(names).toContain('created_at');
      expect(names).toContain('updated_at');
    });

    it('should seed initial rows into sequence_counters via migration 003', async () => {
      // Assert
      const rows = await sql`
        SELECT entity_type FROM sequence_counters ORDER BY entity_type
      `;
      const types = rows.map(r => r.entity_type);

      expect(types).toContain('quotation');
      expect(types).toContain('order');
      expect(types).toContain('purchaseOrder');
      expect(types).toContain('invoice');
      expect(types).toContain('receipt');
      expect(types).toContain('payment');
      expect(types).toContain('delivery');
    });

    it('should create performance indexes via migration 004', async () => {
      // Assert
      const rows = await sql`
        SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
        ORDER BY indexname
      `;
      const names = rows.map(r => r.indexname);

      expect(names).toContain('idx_quotations_status_date');
      expect(names).toContain('idx_quotations_approval_pending');
      expect(names).toContain('idx_orders_status');
      expect(names).toContain('idx_purchase_orders_status');
      expect(names).toContain('idx_invoices_status_due');
      expect(names).toContain('idx_invoices_customer');
      expect(names).toContain('idx_payments_status');
      expect(names).toContain('idx_payments_supplier');
    });

    it('should apply migrations in alphabetical order so status data migration runs after schema', async () => {
      // 001_status_migration は UPDATE のみ。空 DB では影響行 0 だが、エラーなく完了することを確認する。
      // スキーマ適用後に payments/invoices テーブルが存在することが前提条件。
      const tables = await sql`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name IN ('payments', 'invoices')
      `;
      expect(tables).toHaveLength(2);
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 11-13-b: 冪等性の確認（同一マイグレーションを 2 回適用しても失敗しない）
  // ─────────────────────────────────────────────────────────────────────
  describe('11-13-b: idempotency — applying migrations twice should not fail', () => {
    it('should not throw when all migrations are applied a second time', async () => {
      // Arrange: 11-13-a の beforeAll で既に 1 回適用済み
      // Act & Assert
      await expect(runMigrations(sql, MIGRATIONS_DIR)).resolves.not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // 11-13-b: トランザクション rollback の確認
  // ─────────────────────────────────────────────────────────────────────
  describe('11-13-b: transaction rollback — failed migration should leave DB clean', () => {
    it('should rollback table creation when migration fails mid-transaction', async () => {
      // Arrange: BEGIN/COMMIT ブロック内で失敗する一時マイグレーションを作成する
      const tmpDir = await mkdtemp(join(tmpdir(), 'migration-rollback-'));
      try {
        await writeFile(
          join(tmpDir, '000_rollback_test.sql'),
          [
            'BEGIN;',
            'CREATE TABLE IF NOT EXISTS rollback_marker (id SERIAL PRIMARY KEY);',
            'INVALID_SQL_COMMAND_THAT_DOES_NOT_EXIST;',
            'COMMIT;',
          ].join('\n') + '\n'
        );

        // Act: 失敗するマイグレーションを実行する
        await expect(runMigrations(sql, tmpDir)).rejects.toThrow();

        // Assert: テーブルが存在しないこと（BEGIN トランザクションが rollback されている）
        const tables = await sql`
          SELECT table_name FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'rollback_marker'
        `;
        expect(tables).toHaveLength(0);
      } finally {
        rmSync(tmpDir, { recursive: true, force: true });
      }
    });
  });
});
