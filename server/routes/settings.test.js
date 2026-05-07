import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleSettings = {
  name: 'テスト会社',
  address: '',
  phone: '',
  fiscalEndMonth: 3,
  presidentApprovalProfitRateThreshold: 30,
  presidentApprovalAmountThreshold: 10000000,
  approvalStaleDays: 3
};

const makeApp = async (serviceOverrides = {}) => {
  const mockSettingsService = {
    getSettings: vi.fn().mockResolvedValue(sampleSettings),
    updateSettings: vi.fn().mockResolvedValue({ ...sampleSettings, name: '新会社名' }),
    ...serviceOverrides
  };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({ userRepository: mockUserRepository, settingsService: mockSettingsService });
  return { app, mockSettingsService };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '管理者' });

describe('GET /api/settings', () => {
  it('should return 200 with settings when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/settings', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(sampleSettings);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/settings' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should call getSettings on service', async () => {
    // Arrange
    const { app, mockSettingsService } = await makeApp();

    // Act
    await app.inject({ method: 'GET', url: '/api/settings', cookies: { token: makeToken(app) } });

    // Assert
    expect(mockSettingsService.getSettings).toHaveBeenCalledOnce();
  });
});

describe('PUT /api/settings', () => {
  it('should return 200 with updated settings', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PUT', url: '/api/settings',
      cookies: { token: makeToken(app) },
      payload: { name: '新会社名' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe('新会社名');
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'PUT', url: '/api/settings', payload: { name: '新会社名' } });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should call updateSettings with request body', async () => {
    // Arrange
    const { app, mockSettingsService } = await makeApp();

    // Act
    await app.inject({
      method: 'PUT', url: '/api/settings',
      cookies: { token: makeToken(app) },
      payload: { fiscalEndMonth: 12 }
    });

    // Assert
    expect(mockSettingsService.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ fiscalEndMonth: 12 })
    );
  });
});
