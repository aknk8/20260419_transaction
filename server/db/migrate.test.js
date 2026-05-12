import { describe, it, expect, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getMigrationFiles, runMigrations, MIGRATIONS_DIR } from './migrate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = join(__dirname, 'migrations-test-temp');

afterEach(async () => {
  await rm(TEMP_DIR, { recursive: true, force: true });
});

describe('getMigrationFiles', () => {
  it('should return only SQL files', async () => {
    // Arrange & Act
    const files = await getMigrationFiles(MIGRATIONS_DIR);

    // Assert
    expect(files.length).toBeGreaterThan(0);
    expect(files.every(f => f.endsWith('.sql'))).toBe(true);
  });

  it('should return files sorted alphabetically', async () => {
    // Arrange & Act
    const files = await getMigrationFiles(MIGRATIONS_DIR);

    // Assert
    expect(files).toEqual([...files].sort());
  });

  it('should include the initial schema migration', async () => {
    // Arrange & Act
    const files = await getMigrationFiles(MIGRATIONS_DIR);

    // Assert
    expect(files).toContain('000_initial_schema.sql');
  });

  it('should return empty array when directory has no SQL files', async () => {
    // Arrange
    await mkdir(TEMP_DIR, { recursive: true });
    await writeFile(join(TEMP_DIR, 'readme.md'), '# test');
    await writeFile(join(TEMP_DIR, 'setup.sh'), 'echo hi');

    // Act
    const files = await getMigrationFiles(TEMP_DIR);

    // Assert
    expect(files).toEqual([]);
  });

  it('should exclude test files from results', async () => {
    // Arrange & Act
    const files = await getMigrationFiles(MIGRATIONS_DIR);

    // Assert
    expect(files.every(f => !f.includes('.test.'))).toBe(true);
  });
});

describe('runMigrations', () => {
  it('should execute each SQL file via sql.unsafe', async () => {
    // Arrange
    await mkdir(TEMP_DIR, { recursive: true });
    await writeFile(join(TEMP_DIR, '001_a.sql'), 'SELECT 1');
    await writeFile(join(TEMP_DIR, '002_b.sql'), 'SELECT 2');
    const executed = [];
    const sql = { unsafe: async (content) => executed.push(content) };

    // Act
    await runMigrations(sql, TEMP_DIR);

    // Assert
    expect(executed).toHaveLength(2);
  });

  it('should execute migrations in alphabetical file order', async () => {
    // Arrange
    await mkdir(TEMP_DIR, { recursive: true });
    await writeFile(join(TEMP_DIR, 'b_second.sql'), 'SELECT 2');
    await writeFile(join(TEMP_DIR, 'a_first.sql'), 'SELECT 1');
    const executed = [];
    const sql = { unsafe: async (content) => executed.push(content.trim()) };

    // Act
    await runMigrations(sql, TEMP_DIR);

    // Assert
    expect(executed[0]).toBe('SELECT 1');
    expect(executed[1]).toBe('SELECT 2');
  });

  it('should throw when a migration fails', async () => {
    // Arrange
    await mkdir(TEMP_DIR, { recursive: true });
    await writeFile(join(TEMP_DIR, '001_fail.sql'), 'INVALID SQL');
    const sql = { unsafe: async () => { throw new Error('syntax error near INVALID'); } };

    // Act & Assert
    await expect(runMigrations(sql, TEMP_DIR)).rejects.toThrow('syntax error near INVALID');
  });

  it('should do nothing when directory has no SQL files', async () => {
    // Arrange
    await mkdir(TEMP_DIR, { recursive: true });
    let callCount = 0;
    const sql = { unsafe: async () => { callCount++; } };

    // Act
    await runMigrations(sql, TEMP_DIR);

    // Assert
    expect(callCount).toBe(0);
  });
});

describe('MIGRATIONS_DIR', () => {
  it('should point to the existing migrations directory', async () => {
    // Arrange & Act
    const files = await getMigrationFiles(MIGRATIONS_DIR);

    // Assert
    expect(files.length).toBeGreaterThan(0);
  });
});
