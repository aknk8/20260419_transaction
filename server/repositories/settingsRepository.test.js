import { describe, it, expect } from 'vitest';
import { createSettingsRepository } from './settingsRepository.js';

const defaults = {
  name: 'テスト会社',
  address: '',
  phone: '',
  fiscalEndMonth: 3,
  presidentApprovalProfitRateThreshold: 30,
  presidentApprovalAmountThreshold: 10000000,
  approvalStaleDays: 3
};

describe('createSettingsRepository', () => {
  describe('findOne', () => {
    it('should return default settings when no initial state provided', async () => {
      // Arrange
      const repo = createSettingsRepository();

      // Act
      const result = await repo.findOne();

      // Assert
      expect(result.name).toBe('株式会社サンプル商事');
      expect(result.fiscalEndMonth).toBe(12);
      expect(result.approvalStaleDays).toBe(3);
    });

    it('should return merged settings with provided initial state', async () => {
      // Arrange
      const repo = createSettingsRepository({ name: 'カスタム会社', fiscalEndMonth: 12 });

      // Act
      const result = await repo.findOne();

      // Assert
      expect(result.name).toBe('カスタム会社');
      expect(result.fiscalEndMonth).toBe(12);
    });
  });

  describe('update', () => {
    it('should update and return merged settings', async () => {
      // Arrange
      const repo = createSettingsRepository(defaults);

      // Act
      const result = await repo.update({ name: '新会社名' });

      // Assert
      expect(result.name).toBe('新会社名');
      expect(result.fiscalEndMonth).toBe(3);
    });

    it('should persist updated value across subsequent findOne calls', async () => {
      // Arrange
      const repo = createSettingsRepository(defaults);

      // Act
      await repo.update({ approvalStaleDays: 7 });
      const result = await repo.findOne();

      // Assert
      expect(result.approvalStaleDays).toBe(7);
    });

    it('should allow partial updates without overwriting other fields', async () => {
      // Arrange
      const repo = createSettingsRepository(defaults);

      // Act
      await repo.update({ fiscalEndMonth: 9 });
      const result = await repo.findOne();

      // Assert
      expect(result.fiscalEndMonth).toBe(9);
      expect(result.name).toBe(defaults.name);
      expect(result.approvalStaleDays).toBe(defaults.approvalStaleDays);
    });
  });
});
