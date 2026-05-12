import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

export async function getMigrationFiles(dir) {
  const files = await readdir(dir);
  return files.filter(f => f.endsWith('.sql')).sort();
}

export async function runMigrations(sql, migrationsDir = MIGRATIONS_DIR) {
  const files = await getMigrationFiles(migrationsDir);
  for (const file of files) {
    const content = await readFile(join(migrationsDir, file), 'utf8');
    process.stdout.write(`Applying migration: ${file} ... `);
    await sql.unsafe(content);
    process.stdout.write('✓\n');
  }
}
