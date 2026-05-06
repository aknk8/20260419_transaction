import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleNotification = {
  id: 'uuid-001',
  type: 'N-01',
  recipientId: 'user01',
  docType: '見積',
  docCode: 'QUO-00001',
  message: '見積 QUO-00001 の承認依頼があります',
  isRead: false,
  createdAt: new Date().toISOString()
};

const makeApp = async (serviceOverrides = {}) => {
  const mockNotificationService = {
    getNotificationsForUser: vi.fn().mockResolvedValue([sampleNotification]),
    markAsRead: vi.fn().mockResolvedValue({ ...sampleNotification, isRead: true }),
    markAllAsRead: vi.fn().mockResolvedValue(undefined),
    notifyApprovalRequest: vi.fn().mockResolvedValue(undefined),
    notifyApprovalComplete: vi.fn().mockResolvedValue(undefined),
    notifyRejection: vi.fn().mockResolvedValue(undefined),
    ...serviceOverrides
  };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({ userRepository: mockUserRepository, notificationService: mockNotificationService });
  return { app, mockNotificationService };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

describe('GET /api/notifications', () => {
  it('should return 200 with notification list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET', url: '/api/notifications',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([sampleNotification]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/notifications' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return paginated response with data and meta fields', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/notifications', cookies: { token: makeToken(app) } });

    // Assert
    const body = res.json();
    expect(body.data).toEqual([sampleNotification]);
    expect(body.meta).toMatchObject({ total: 1, page: 1, pageSize: 20, totalPages: 1 });
  });

  it('should return empty data when page exceeds total pages', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/notifications?page=2', cookies: { token: makeToken(app) } });

    // Assert
    const body = res.json();
    expect(body.data).toEqual([]);
    expect(body.meta.page).toBe(2);
    expect(body.meta.total).toBe(1);
  });

  it('should respect limit query parameter', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/notifications?limit=1', cookies: { token: makeToken(app) } });

    // Assert
    const body = res.json();
    expect(body.meta.pageSize).toBe(1);
    expect(body.data).toHaveLength(1);
  });

  it('should call getNotificationsForUser with current user id', async () => {
    // Arrange
    const { app, mockNotificationService } = await makeApp();

    // Act
    await app.inject({
      method: 'GET', url: '/api/notifications',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(mockNotificationService.getNotificationsForUser).toHaveBeenCalledWith('user01', expect.anything());
  });
});

describe('PUT /api/notifications/:id/read', () => {
  it('should return 200 with isRead true', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PUT', url: '/api/notifications/uuid-001/read',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().isRead).toBe(true);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'PUT', url: '/api/notifications/uuid-001/read' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return 404 when notification does not exist', async () => {
    // Arrange
    const err = Object.assign(new Error('Not found'), { statusCode: 404 });
    const { app } = await makeApp({ markAsRead: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'PUT', url: '/api/notifications/no-such-id/read',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it('should return 404 when notification belongs to another user', async () => {
    // Arrange
    const err = Object.assign(new Error('通知が見つかりません'), { statusCode: 404 });
    const { app } = await makeApp({ markAsRead: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'PUT', url: '/api/notifications/uuid-001/read',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });

  it('should pass requesting user id to markAsRead', async () => {
    // Arrange
    const { app, mockNotificationService } = await makeApp();

    // Act
    await app.inject({
      method: 'PUT', url: '/api/notifications/uuid-001/read',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(mockNotificationService.markAsRead).toHaveBeenCalledWith('uuid-001', 'user01', expect.anything());
  });
});

describe('POST /api/notifications/read-all', () => {
  it('should return 200 when all notifications marked as read', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/notifications/read-all',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/notifications/read-all' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should call markAllAsRead with current user id', async () => {
    // Arrange
    const { app, mockNotificationService } = await makeApp();

    // Act
    await app.inject({
      method: 'POST', url: '/api/notifications/read-all',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith('user01', expect.anything());
  });
});
