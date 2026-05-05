import { describe, it, expect } from 'vitest';
import {
  validateApprovalConditionSettings,
  buildApprovalConditionSettings
} from './approvalCondition.js';

describe('validateApprovalConditionSettings', () => {
  it('should return no errors when all values are valid positive integers', () => {
    const result = validateApprovalConditionSettings(20, 10000000, 3);
    expect(result).toEqual({});
  });

  it('should return error for profitRate when value is not a number', () => {
    const result = validateApprovalConditionSettings('abc', 10000000, 3);
    expect(result.profitRate).toBeDefined();
  });

  it('should return error for profitRate when value is negative', () => {
    const result = validateApprovalConditionSettings(-1, 10000000, 3);
    expect(result.profitRate).toBeDefined();
  });

  it('should return error for profitRate when value exceeds 100', () => {
    const result = validateApprovalConditionSettings(101, 10000000, 3);
    expect(result.profitRate).toBeDefined();
  });

  it('should return no error for profitRate when value is 0', () => {
    const result = validateApprovalConditionSettings(0, 10000000, 3);
    expect(result.profitRate).toBeUndefined();
  });

  it('should return no error for profitRate when value is 100', () => {
    const result = validateApprovalConditionSettings(100, 10000000, 3);
    expect(result.profitRate).toBeUndefined();
  });

  it('should return error for amount when value is not a number', () => {
    const result = validateApprovalConditionSettings(20, 'abc', 3);
    expect(result.amount).toBeDefined();
  });

  it('should return error for amount when value is zero', () => {
    const result = validateApprovalConditionSettings(20, 0, 3);
    expect(result.amount).toBeDefined();
  });

  it('should return error for amount when value is negative', () => {
    const result = validateApprovalConditionSettings(20, -1, 3);
    expect(result.amount).toBeDefined();
  });

  it('should return no error for amount when value is a positive integer', () => {
    const result = validateApprovalConditionSettings(20, 1, 3);
    expect(result.amount).toBeUndefined();
  });

  it('should return error for staleDays when value is not a number', () => {
    const result = validateApprovalConditionSettings(20, 10000000, 'abc');
    expect(result.staleDays).toBeDefined();
  });

  it('should return error for staleDays when value is zero', () => {
    const result = validateApprovalConditionSettings(20, 10000000, 0);
    expect(result.staleDays).toBeDefined();
  });

  it('should return error for staleDays when value is negative', () => {
    const result = validateApprovalConditionSettings(20, 10000000, -1);
    expect(result.staleDays).toBeDefined();
  });

  it('should return no error for staleDays when value is 1', () => {
    const result = validateApprovalConditionSettings(20, 10000000, 1);
    expect(result.staleDays).toBeUndefined();
  });

  it('should return multiple errors when multiple values are invalid', () => {
    const result = validateApprovalConditionSettings(-1, 0, 0);
    expect(result.profitRate).toBeDefined();
    expect(result.amount).toBeDefined();
    expect(result.staleDays).toBeDefined();
  });

  it('should return error for profitRate when value is not an integer', () => {
    const result = validateApprovalConditionSettings(20.5, 10000000, 3);
    expect(result.profitRate).toBeDefined();
  });

  it('should return error for staleDays when value is not an integer', () => {
    const result = validateApprovalConditionSettings(20, 10000000, 1.5);
    expect(result.staleDays).toBeDefined();
  });
});

describe('buildApprovalConditionSettings', () => {
  it('should return object with presidentApprovalProfitRateThreshold when provided', () => {
    const result = buildApprovalConditionSettings(20, 10000000, 3);
    expect(result.presidentApprovalProfitRateThreshold).toBe(20);
  });

  it('should return object with presidentApprovalAmountThreshold when provided', () => {
    const result = buildApprovalConditionSettings(20, 10000000, 3);
    expect(result.presidentApprovalAmountThreshold).toBe(10000000);
  });

  it('should return object with approvalStaleDays when provided', () => {
    const result = buildApprovalConditionSettings(20, 10000000, 3);
    expect(result.approvalStaleDays).toBe(3);
  });
});
