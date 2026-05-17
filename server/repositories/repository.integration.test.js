import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema.js';
import { runMigrations, MIGRATIONS_DIR } from '../db/migrate.js';
import { createCustomerRepository } from './customerRepository.js';
import { createInvoiceRepository } from './invoiceRepository.js';
import { createSequenceCounterRepository } from './sequenceCounterRepository.js';
import { withTransaction } from '../db/transaction.js';

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

describe.skipIf(!TEST_DATABASE_URL)('PostgreSQL repository integration tests', () => {
  let sql;
  let db;
  let migrationSql; // BEGIN/COMMIT を含む migration は max:1 接続で実行する必要がある

  beforeAll(async () => {
    migrationSql = postgres(TEST_DATABASE_URL, { max: 1, onnotice: () => {} });
    sql = postgres(TEST_DATABASE_URL, { max: 10, onnotice: () => {} });
    db = drizzle(sql, { schema });
    await migrationSql`DROP SCHEMA public CASCADE`;
    await migrationSql`CREATE SCHEMA public`;
    await runMigrations(migrationSql, MIGRATIONS_DIR);
  });

  afterAll(async () => {
    await migrationSql.end();
    await sql.end();
  });

  // ─────────────────────────────────────────────────────────────────────
  // customerRepository: CRUD
  // ─────────────────────────────────────────────────────────────────────
  describe('createCustomerRepository', () => {
    describe('save / findByCode', () => {
      it('should persist a customer and retrieve it by code', async () => {
        // Arrange
        const repo = createCustomerRepository(db);
        const code = `C-${Date.now()}`;
        const customer = { code, name: 'テスト得意先', status: '有効' };

        // Act
        const saved = await repo.save(customer);
        const found = await repo.findByCode(code);

        // Assert
        expect(saved.code).toBe(code);
        expect(found).not.toBeNull();
        expect(found.name).toBe('テスト得意先');
      });

      it('should return null when code does not exist', async () => {
        // Arrange
        const repo = createCustomerRepository(db);

        // Act
        const found = await repo.findByCode('NONEXISTENT-CODE');

        // Assert
        expect(found).toBeNull();
      });
    });

    describe('findAll', () => {
      it('should return all saved customers', async () => {
        // Arrange
        const repo = createCustomerRepository(db);
        const ts = Date.now();
        await repo.save({ code: `FA-${ts}-1`, name: '得意先A', status: '有効' });
        await repo.save({ code: `FA-${ts}-2`, name: '得意先B', status: '有効' });

        // Act
        const all = await repo.findAll();

        // Assert
        const codes = all.map(c => c.code);
        expect(codes).toContain(`FA-${ts}-1`);
        expect(codes).toContain(`FA-${ts}-2`);
      });
    });

    describe('update', () => {
      it('should update an existing customer and return updated record', async () => {
        // Arrange
        const repo = createCustomerRepository(db);
        const code = `U-${Date.now()}`;
        await repo.save({ code, name: '変更前', status: '有効' });

        // Act
        const updated = await repo.update(code, { name: '変更後' });

        // Assert
        expect(updated.name).toBe('変更後');
        const found = await repo.findByCode(code);
        expect(found.name).toBe('変更後');
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // invoiceRepository: header-detail relationship
  // ─────────────────────────────────────────────────────────────────────
  describe('createInvoiceRepository', () => {
    describe('save / findByCode with details', () => {
      it('should persist invoice with details and retrieve them together', async () => {
        // Arrange
        const repo = createInvoiceRepository(db);
        const code = `INV-${Date.now()}`;
        const invoice = {
          code,
          title: 'テスト請求',
          status: '下書き',
          subtotal: '10000',
          taxAmount: '1000',
          total: '11000',
          details: [
            { lineNo: 1, productName: '商品A', quantity: '2', unitPrice: '5000', amount: '10000', taxRate: '0.1000', discount: '0' },
          ],
        };

        // Act
        const saved = await repo.save(invoice);
        const found = await repo.findByCode(code);

        // Assert
        expect(saved.code).toBe(code);
        expect(found).not.toBeNull();
        expect(found.title).toBe('テスト請求');
        expect(found.details).toHaveLength(1);
        expect(found.details[0].productName).toBe('商品A');
      });

      it('should save invoice without details', async () => {
        // Arrange
        const repo = createInvoiceRepository(db);
        const code = `INV-ND-${Date.now()}`;

        // Act
        const saved = await repo.save({ code, title: '明細なし請求', status: '下書き' });
        const found = await repo.findByCode(code);

        // Assert
        expect(saved.code).toBe(code);
        expect(found.details).toHaveLength(0);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // sequenceCounterRepository: nextVal atomic increment
  // ─────────────────────────────────────────────────────────────────────
  describe('createSequenceCounterRepository', () => {
    describe('nextVal', () => {
      it('should return 1 on first call for a new entity type', async () => {
        // Arrange
        const repo = createSequenceCounterRepository(db);
        const entityType = `seq_first_${Date.now()}`;

        // Act
        const val = await repo.nextVal(entityType);

        // Assert
        expect(val).toBe(1);
      });

      it('should return monotonically increasing values on sequential calls', async () => {
        // Arrange
        const repo = createSequenceCounterRepository(db);
        const entityType = `seq_mono_${Date.now()}`;

        // Act
        const v1 = await repo.nextVal(entityType);
        const v2 = await repo.nextVal(entityType);
        const v3 = await repo.nextVal(entityType);

        // Assert
        expect(v1).toBe(1);
        expect(v2).toBe(2);
        expect(v3).toBe(3);
      });

      it('should return unique values when called concurrently', async () => {
        // Arrange
        const repo = createSequenceCounterRepository(db);
        const entityType = `seq_concurrent_${Date.now()}`;

        // Act: 10 concurrent calls
        const results = await Promise.all(
          Array.from({ length: 10 }, () => repo.nextVal(entityType))
        );

        // Assert: all values are unique and span 1-10
        const sorted = [...results].sort((a, b) => a - b);
        expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      });
    });
  });

  // ─────────────────────────────────────────────────────────────────────
  // withTransaction: rollback on error
  // ─────────────────────────────────────────────────────────────────────
  describe('withTransaction', () => {
    it('should rollback all writes when an error is thrown inside the transaction', async () => {
      // Arrange
      const repo = createCustomerRepository(db);
      const code = `TX-${Date.now()}`;

      // Act: save inside a transaction that then throws
      await expect(
        withTransaction(db, async (tx) => {
          const txRepo = createCustomerRepository(tx);
          await txRepo.save({ code, name: 'トランザクションテスト', status: '有効' });
          throw new Error('simulated transaction failure');
        })
      ).rejects.toThrow('simulated transaction failure');

      // Assert: the customer must NOT have been persisted
      const found = await repo.findByCode(code);
      expect(found).toBeNull();
    });

    it('should commit all writes when the callback completes without error', async () => {
      // Arrange
      const repo = createCustomerRepository(db);
      const code = `TX-OK-${Date.now()}`;

      // Act
      await withTransaction(db, async (tx) => {
        const txRepo = createCustomerRepository(tx);
        await txRepo.save({ code, name: 'コミット確認', status: '有効' });
      });

      // Assert
      const found = await repo.findByCode(code);
      expect(found).not.toBeNull();
      expect(found.name).toBe('コミット確認');
    });
  });
});
