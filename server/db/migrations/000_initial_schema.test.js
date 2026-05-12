import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '000_initial_schema.sql'), 'utf-8');

describe('000_initial_schema.sql', () => {
  it('should wrap all statements in a transaction', () => {
    // Arrange
    // Act & Assert
    expect(sql).toMatch(/BEGIN/);
    expect(sql).toMatch(/COMMIT/);
  });

  it('should use IF NOT EXISTS for all CREATE TABLE to ensure idempotent execution', () => {
    // Arrange
    const createTableStatements = sql.match(/CREATE TABLE/gi) || [];
    const createTableIfNotExists = sql.match(/CREATE TABLE IF NOT EXISTS/gi) || [];

    // Act & Assert
    expect(createTableStatements.length).toBeGreaterThan(0);
    expect(createTableStatements.length).toBe(createTableIfNotExists.length);
  });

  it('should create table users', () => {
    // Arrange
    // Act & Assert
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS users/);
  });

  it('should create table refresh_tokens', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS refresh_tokens/);
  });

  it('should create table customers', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS customers/);
  });

  it('should create table suppliers', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS suppliers/);
  });

  it('should create table products', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS products/);
  });

  it('should create table projects', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS projects/);
  });

  it('should create table quotations', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS quotations/);
  });

  it('should create table quotation_details', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS quotation_details/);
  });

  it('should create table orders', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS orders/);
  });

  it('should create table order_details', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS order_details/);
  });

  it('should create table order_attachments', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS order_attachments/);
  });

  it('should create table purchase_orders', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS purchase_orders/);
  });

  it('should create table purchase_order_details', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS purchase_order_details/);
  });

  it('should create table invoices', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS invoices/);
  });

  it('should create table invoice_details', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS invoice_details/);
  });

  it('should create table receipts', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS receipts/);
  });

  it('should create table payments', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS payments/);
  });

  it('should create table approval_routes', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS approval_routes/);
  });

  it('should create table approval_history', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS approval_history/);
  });

  it('should create table notifications', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS notifications/);
  });

  it('should create table audit_logs', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS audit_logs/);
  });

  it('should create table deliveries', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS deliveries/);
  });

  it('should create table sequence_counters', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS sequence_counters/);
  });

  it('should define required columns for users table when checking schema', () => {
    // Arrange
    // Extract the users table block from the SQL
    const usersTableMatch = sql.match(/CREATE TABLE IF NOT EXISTS users\s*\([\s\S]*?\);/);

    // Act
    expect(usersTableMatch).not.toBeNull();
    const usersTable = usersTableMatch[0];

    // Assert - all required columns must be present
    expect(usersTable).toMatch(/\bid\b/);
    expect(usersTable).toMatch(/\bname\b/);
    expect(usersTable).toMatch(/password_hash/);
    expect(usersTable).toMatch(/\bstatus\b/);
    expect(usersTable).toMatch(/failed_login_count/);
    expect(usersTable).toMatch(/locked_until/);
  });

  it('should contain at least one foreign key constraint when referencing related tables', () => {
    // Arrange
    // Act
    const references = sql.match(/REFERENCES/gi) || [];

    // Assert
    expect(references.length).toBeGreaterThanOrEqual(1);
  });
});
