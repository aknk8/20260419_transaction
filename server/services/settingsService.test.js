import { describe, it, expect, vi } from 'vitest';
import { getSettings, updateSettings } from './settingsService.js';

const sampleSettings = {
  name: 'テスト会社',
  fiscalEndMonth: 3,
  presidentApprovalProfitRateThreshold: 30,
  presidentApprovalAmountThreshold: 10000000,
  approvalStaleDays: 3
};

const makeRepo = (overrides = {}) => ({
  findOne: vi.fn().mockResolvedValue(sampleSettings),
  update: vi.fn().mockResolvedValue({ ...sampleSettings, name: '更新会社' }),
  ...overrides
});

describe('getSettings', () => {
  it('should return current settings from repository', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await getSettings({ repository });

    // Assert
    expect(result).toEqual(sampleSettings);
    expect(repository.findOne).toHaveBeenCalledOnce();
  });
});

describe('updateSettings', () => {
  it('should call repository update and return updated settings', async () => {
    // Arrange
    const repository = makeRepo();

    // Act
    const result = await updateSettings({ name: '更新会社' }, { repository });

    // Assert
    expect(result.name).toBe('更新会社');
    expect(repository.update).toHaveBeenCalledWith({ name: '更新会社' });
  });

  it('should pass all provided fields to repository', async () => {
    // Arrange
    const repository = makeRepo();
    const patch = { fiscalEndMonth: 12, approvalStaleDays: 7 };

    // Act
    await updateSettings(patch, { repository });

    // Assert
    expect(repository.update).toHaveBeenCalledWith(patch);
  });
});
