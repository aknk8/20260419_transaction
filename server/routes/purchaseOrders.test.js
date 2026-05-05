import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const samplePO = { code: 'POD-00001', title: 'テスト発注', status: '下書き', details: [] };

const makeNotificationServiceMock = () => ({
  notifyApprovalRequest: vi.fn().mockResolvedValue(undefined),
  notifyApprovalComplete: vi.fn().mockResolvedValue(undefined),
  notifyRejection: vi.fn().mockResolvedValue(undefined),
  getNotificationsForUser: vi.fn().mockResolvedValue([]),
  markAsRead: vi.fn().mockResolvedValue(null)
});

const makeApp = async (serviceOverrides = {}, { notificationService, approvalRouteRepository } = {}) => {
  const mockPurchaseOrderService = {
    listPurchaseOrders: vi.fn().mockResolvedValue([samplePO]),
    getPurchaseOrderByCode: vi.fn().mockResolvedValue(samplePO),
    registerPurchaseOrder: vi.fn().mockResolvedValue(samplePO),
    updatePurchaseOrder: vi.fn().mockResolvedValue(samplePO),
    submitPurchaseOrderApproval: vi.fn().mockResolvedValue({ ...samplePO, status: '承認依頼中' }),
    approvePurchaseOrder: vi.fn().mockResolvedValue({ ...samplePO, status: '承認済み' }),
    rejectPurchaseOrder: vi.fn().mockResolvedValue({ ...samplePO, status: '却下' }),
    ...serviceOverrides
  };
  const mockNotificationService = notificationService ?? makeNotificationServiceMock();
  const mockApprovalRouteRepository = approvalRouteRepository ?? { findByDocumentType: vi.fn().mockResolvedValue([]) };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({
    userRepository: mockUserRepository,
    purchaseOrderService: mockPurchaseOrderService,
    notificationService: mockNotificationService,
    approvalRouteRepository: mockApprovalRouteRepository
  });
  return { app, mockPurchaseOrderService, mockNotificationService, mockApprovalRouteRepository };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

describe('GET /api/purchase-orders', () => {
  it('should return 200 with purchase order list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/purchase-orders', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([samplePO]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/purchase-orders' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/purchase-orders/:code', () => {
  it('should return 200 with purchase order when code exists', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/purchase-orders/POD-00001', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('POD-00001');
  });

  it('should return 404 when code does not exist', async () => {
    // Arrange
    const err = Object.assign(new Error('Not found'), { statusCode: 404 });
    const { app } = await makeApp({ getPurchaseOrderByCode: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/purchase-orders/POD-99999', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/purchase-orders', () => {
  it('should return 201 with created purchase order', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/purchase-orders',
      cookies: { token: makeToken(app) },
      payload: { supplierId: 'SUP-00001', title: 'テスト発注', orderDate: '2026-05-05' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('POD-00001');
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/purchase-orders', payload: {} });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/purchase-orders/:code', () => {
  it('should return 200 with updated purchase order', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PATCH', url: '/api/purchase-orders/POD-00001',
      cookies: { token: makeToken(app) },
      payload: { deliveryDate: '2026-06-30' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /api/purchase-orders/:code/submit-approval', () => {
  it('should return 200 with status 承認依頼中', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/purchase-orders/POD-00001/submit-approval',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認依頼中');
  });

  it('should return 400 when status transition is invalid', async () => {
    // Arrange
    const err = Object.assign(new Error('下書き状態のみ'), { statusCode: 400 });
    const { app } = await makeApp({ submitPurchaseOrderApproval: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/purchase-orders/POD-00001/submit-approval',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/purchase-orders/:code/approve', () => {
  it('should return 200 with status 承認済み', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/purchase-orders/POD-00001/approve',
      cookies: { token: makeToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認済み');
  });
});

describe('POST /api/purchase-orders/:code/reject', () => {
  it('should return 200 with status 却下', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/purchase-orders/POD-00001/reject',
      cookies: { token: makeToken(app) },
      payload: { reason: '要再検討' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('却下');
  });
});

describe('POST /api/purchase-orders/:code/submit-approval (N-01通知)', () => {
  it('should call notifyApprovalRequest with approver IDs when submit succeeds', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const mockApprovalRouteRepository = {
      findByDocumentType: vi.fn().mockResolvedValue([{ approverUserId: 'approver01' }])
    };
    const { app } = await makeApp({}, { notificationService: mockNotificationService, approvalRouteRepository: mockApprovalRouteRepository });

    // Act
    await app.inject({
      method: 'POST', url: '/api/purchase-orders/POD-00001/submit-approval',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(mockApprovalRouteRepository.findByDocumentType).toHaveBeenCalledWith('purchaseOrder');
    expect(mockNotificationService.notifyApprovalRequest).toHaveBeenCalledWith(
      'purchaseOrder', 'POD-00001', ['approver01'], expect.any(Object)
    );
  });
});

describe('POST /api/purchase-orders/:code/approve (N-02通知)', () => {
  it('should call notifyApprovalComplete with submittedBy when approved', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const { app } = await makeApp(
      { approvePurchaseOrder: vi.fn().mockResolvedValue({ ...samplePO, status: '承認済み', submittedBy: 'user01' }) },
      { notificationService: mockNotificationService }
    );

    // Act
    await app.inject({
      method: 'POST', url: '/api/purchase-orders/POD-00001/approve',
      cookies: { token: makeToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(mockNotificationService.notifyApprovalComplete).toHaveBeenCalledWith(
      'purchaseOrder', 'POD-00001', 'user01', expect.any(Object)
    );
  });
});

describe('POST /api/purchase-orders/:code/reject (N-03通知)', () => {
  it('should call notifyRejection with submittedBy when rejected', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const { app } = await makeApp(
      { rejectPurchaseOrder: vi.fn().mockResolvedValue({ ...samplePO, status: '却下', submittedBy: 'user01' }) },
      { notificationService: mockNotificationService }
    );

    // Act
    await app.inject({
      method: 'POST', url: '/api/purchase-orders/POD-00001/reject',
      cookies: { token: makeToken(app) },
      payload: { reason: '要再検討' }
    });

    // Assert
    expect(mockNotificationService.notifyRejection).toHaveBeenCalledWith(
      'purchaseOrder', 'POD-00001', 'user01', '要再検討', expect.any(Object)
    );
  });
});
