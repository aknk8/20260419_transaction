import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleOrder = { code: 'ORD-00001', title: 'テスト受注', status: '受注済み', details: [] };

const makeNotificationServiceMock = () => ({
  notifyApprovalRequest: vi.fn().mockResolvedValue(undefined),
  notifyApprovalComplete: vi.fn().mockResolvedValue(undefined),
  notifyRejection: vi.fn().mockResolvedValue(undefined),
  getNotificationsForUser: vi.fn().mockResolvedValue([]),
  markAsRead: vi.fn().mockResolvedValue(null)
});

const makeApp = async (serviceOverrides = {}, { notificationService, approvalRouteRepository } = {}) => {
  const mockOrderService = {
    listOrders: vi.fn().mockResolvedValue([sampleOrder]),
    getOrderByCode: vi.fn().mockResolvedValue(sampleOrder),
    registerOrder: vi.fn().mockResolvedValue(sampleOrder),
    updateOrder: vi.fn().mockResolvedValue(sampleOrder),
    submitOrderApproval: vi.fn().mockResolvedValue({ ...sampleOrder, status: '承認依頼中' }),
    approveOrder: vi.fn().mockResolvedValue({ ...sampleOrder, status: '承認済み' }),
    rejectOrder: vi.fn().mockResolvedValue({ ...sampleOrder, status: '却下' }),
    ...serviceOverrides
  };
  const mockNotificationService = notificationService ?? makeNotificationServiceMock();
  const mockApprovalRouteRepository = approvalRouteRepository ?? { findByDocumentType: vi.fn().mockResolvedValue([]) };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({
    userRepository: mockUserRepository,
    orderService: mockOrderService,
    notificationService: mockNotificationService,
    approvalRouteRepository: mockApprovalRouteRepository
  });
  return { app, mockOrderService, mockNotificationService, mockApprovalRouteRepository };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });
const makeApplyToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '一般ユーザ', permissions: ['approval:apply'] });
const makeActToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: 'システム管理者', permissions: ['approval:act'] });

describe('GET /api/orders', () => {
  it('should return 200 with order list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/orders', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleOrder]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/orders' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/orders/:code', () => {
  it('should return 200 with order when code exists', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/orders/ORD-00001', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('ORD-00001');
  });

  it('should return 404 when code does not exist', async () => {
    // Arrange
    const err = Object.assign(new Error('Not found'), { statusCode: 404 });
    const { app } = await makeApp({ getOrderByCode: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/orders/ORD-99999', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/orders', () => {
  it('should return 201 with created order', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/orders',
      cookies: { token: makeToken(app) },
      payload: { quotationCode: 'QUO-00001', orderDate: '2026-05-05' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('ORD-00001');
  });

  it('should return 400 when quotation is not approved', async () => {
    // Arrange
    const err = Object.assign(new Error('承認済みの見積のみ受注できます'), { statusCode: 400 });
    const { app } = await makeApp({ registerOrder: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/orders',
      cookies: { token: makeToken(app) },
      payload: { quotationCode: 'QUO-00001', orderDate: '2026-05-05' }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/orders', payload: {} });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/orders/:code', () => {
  it('should return 200 with updated order', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PATCH', url: '/api/orders/ORD-00001',
      cookies: { token: makeToken(app) },
      payload: { deliveryDate: '2026-06-30' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /api/orders/:code/submit-approval', () => {
  it('should return 200 with status 承認依頼中', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/orders/ORD-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認依頼中');
  });

  it('should return 400 when status transition is invalid', async () => {
    // Arrange
    const err = Object.assign(new Error('受注済み状態のみ'), { statusCode: 400 });
    const { app } = await makeApp({ submitOrderApproval: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/orders/ORD-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/orders/:code/approve', () => {
  it('should return 200 with status 承認済み', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/orders/ORD-00001/approve',
      cookies: { token: makeActToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認済み');
  });
});

describe('POST /api/orders/:code/reject', () => {
  it('should return 200 with status 却下', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/orders/ORD-00001/reject',
      cookies: { token: makeActToken(app) },
      payload: { reason: '要再見積' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('却下');
  });
});

describe('POST /api/orders/:code/submit-approval (N-01通知)', () => {
  it('should call notifyApprovalRequest with approver IDs when submit succeeds', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const mockApprovalRouteRepository = {
      findByDocumentType: vi.fn().mockResolvedValue([{ approverUserId: 'approver01' }])
    };
    const { app } = await makeApp({}, { notificationService: mockNotificationService, approvalRouteRepository: mockApprovalRouteRepository });

    // Act
    await app.inject({
      method: 'POST', url: '/api/orders/ORD-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(mockApprovalRouteRepository.findByDocumentType).toHaveBeenCalledWith('order');
    expect(mockNotificationService.notifyApprovalRequest).toHaveBeenCalledWith(
      'order', 'ORD-00001', ['approver01'], expect.any(Object)
    );
  });
});

describe('POST /api/orders/:code/approve (N-02通知)', () => {
  it('should call notifyApprovalComplete with submittedBy when approved', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const { app } = await makeApp(
      { approveOrder: vi.fn().mockResolvedValue({ ...sampleOrder, status: '承認済み', submittedBy: 'user01' }) },
      { notificationService: mockNotificationService }
    );

    // Act
    await app.inject({
      method: 'POST', url: '/api/orders/ORD-00001/approve',
      cookies: { token: makeActToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(mockNotificationService.notifyApprovalComplete).toHaveBeenCalledWith(
      'order', 'ORD-00001', 'user01', expect.any(Object)
    );
  });
});

describe('POST /api/orders/:code/reject (N-03通知)', () => {
  it('should call notifyRejection with submittedBy when rejected', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const { app } = await makeApp(
      { rejectOrder: vi.fn().mockResolvedValue({ ...sampleOrder, status: '却下', submittedBy: 'user01' }) },
      { notificationService: mockNotificationService }
    );

    // Act
    await app.inject({
      method: 'POST', url: '/api/orders/ORD-00001/reject',
      cookies: { token: makeActToken(app) },
      payload: { reason: '要再見積' }
    });

    // Assert
    expect(mockNotificationService.notifyRejection).toHaveBeenCalledWith(
      'order', 'ORD-00001', 'user01', '要再見積', expect.any(Object)
    );
  });
});
