import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleInvoice = { code: 'INV-00001', title: 'テスト請求', status: '下書き', details: [] };

const makeNotificationServiceMock = () => ({
  notifyApprovalRequest: vi.fn().mockResolvedValue(undefined),
  notifyApprovalComplete: vi.fn().mockResolvedValue(undefined),
  notifyRejection: vi.fn().mockResolvedValue(undefined),
  getNotificationsForUser: vi.fn().mockResolvedValue([]),
  markAsRead: vi.fn().mockResolvedValue(null)
});

const makeApp = async (serviceOverrides = {}, { notificationService, approvalRouteRepository } = {}) => {
  const mockInvoiceService = {
    listInvoices: vi.fn().mockResolvedValue([sampleInvoice]),
    getInvoiceByCode: vi.fn().mockResolvedValue(sampleInvoice),
    registerInvoice: vi.fn().mockResolvedValue(sampleInvoice),
    updateInvoice: vi.fn().mockResolvedValue(sampleInvoice),
    submitInvoiceApproval: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '承認依頼中' }),
    approveInvoice: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '確定' }),
    rejectInvoice: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '却下' }),
    ...serviceOverrides
  };
  const mockNotificationService = notificationService ?? makeNotificationServiceMock();
  const mockApprovalRouteRepository = approvalRouteRepository ?? { findByDocumentType: vi.fn().mockResolvedValue([]) };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({
    userRepository: mockUserRepository,
    invoiceService: mockInvoiceService,
    notificationService: mockNotificationService,
    approvalRouteRepository: mockApprovalRouteRepository
  });
  return { app, mockInvoiceService, mockNotificationService, mockApprovalRouteRepository };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

describe('GET /api/invoices', () => {
  it('should return 200 with invoice list when authenticated', async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: 'GET', url: '/api/invoices', cookies: { token: makeToken(app) } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleInvoice]);
  });

  it('should return 401 when not authenticated', async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: 'GET', url: '/api/invoices' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/invoices/:code', () => {
  it('should return 200 with invoice when code exists', async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: 'GET', url: '/api/invoices/INV-00001', cookies: { token: makeToken(app) } });
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('INV-00001');
  });

  it('should return 404 when code does not exist', async () => {
    const err = Object.assign(new Error('Not found'), { statusCode: 404 });
    const { app } = await makeApp({ getInvoiceByCode: vi.fn().mockRejectedValue(err) });
    const res = await app.inject({ method: 'GET', url: '/api/invoices/INV-99999', cookies: { token: makeToken(app) } });
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/invoices', () => {
  it('should return 201 with created invoice', async () => {
    const { app } = await makeApp();
    const res = await app.inject({
      method: 'POST', url: '/api/invoices',
      cookies: { token: makeToken(app) },
      payload: { orderCode: 'ORD-00001', customerId: 'CUS-00001', title: 'テスト請求', invoiceDate: '2026-05-05', dueDate: '2026-05-31' }
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().code).toBe('INV-00001');
  });

  it('should return 401 when not authenticated', async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: 'POST', url: '/api/invoices', payload: {} });
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/invoices/:code', () => {
  it('should return 200 with updated invoice', async () => {
    const { app } = await makeApp();
    const res = await app.inject({
      method: 'PATCH', url: '/api/invoices/INV-00001',
      cookies: { token: makeToken(app) },
      payload: { dueDate: '2026-06-30' }
    });
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /api/invoices/:code/submit-approval', () => {
  it('should return 200 with status 承認依頼中', async () => {
    const { app } = await makeApp();
    const res = await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/submit-approval',
      cookies: { token: makeToken(app) }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認依頼中');
  });

  it('should return 400 when status transition is invalid', async () => {
    const err = Object.assign(new Error('下書き状態のみ'), { statusCode: 400 });
    const { app } = await makeApp({ submitInvoiceApproval: vi.fn().mockRejectedValue(err) });
    const res = await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/submit-approval',
      cookies: { token: makeToken(app) }
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/invoices/:code/approve', () => {
  it('should return 200 with status 確定', async () => {
    const { app } = await makeApp();
    const res = await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/approve',
      cookies: { token: makeToken(app) },
      payload: { comment: 'LGTM' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('確定');
  });
});

describe('POST /api/invoices/:code/reject', () => {
  it('should return 200 with status 却下', async () => {
    const { app } = await makeApp();
    const res = await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/reject',
      cookies: { token: makeToken(app) },
      payload: { reason: '要再確認' }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('却下');
  });
});

describe('POST /api/invoices/:code/submit-approval (N-01通知)', () => {
  it('should call notifyApprovalRequest with approver IDs when submit succeeds', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const mockApprovalRouteRepository = {
      findByDocumentType: vi.fn().mockResolvedValue([{ approverUserId: 'approver01' }])
    };
    const { app } = await makeApp({}, { notificationService: mockNotificationService, approvalRouteRepository: mockApprovalRouteRepository });

    // Act
    await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/submit-approval',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(mockApprovalRouteRepository.findByDocumentType).toHaveBeenCalledWith('invoice');
    expect(mockNotificationService.notifyApprovalRequest).toHaveBeenCalledWith(
      'invoice', 'INV-00001', ['approver01'], expect.any(Object)
    );
  });
});

describe('POST /api/invoices/:code/approve (N-02通知)', () => {
  it('should call notifyApprovalComplete with submittedBy when approved', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const { app } = await makeApp(
      { approveInvoice: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '確定', submittedBy: 'user01' }) },
      { notificationService: mockNotificationService }
    );

    // Act
    await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/approve',
      cookies: { token: makeToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(mockNotificationService.notifyApprovalComplete).toHaveBeenCalledWith(
      'invoice', 'INV-00001', 'user01', expect.any(Object)
    );
  });
});

describe('POST /api/invoices/:code/reject (N-03通知)', () => {
  it('should call notifyRejection with submittedBy when rejected', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const { app } = await makeApp(
      { rejectInvoice: vi.fn().mockResolvedValue({ ...sampleInvoice, status: '却下', submittedBy: 'user01' }) },
      { notificationService: mockNotificationService }
    );

    // Act
    await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/reject',
      cookies: { token: makeToken(app) },
      payload: { reason: '要再確認' }
    });

    // Assert
    expect(mockNotificationService.notifyRejection).toHaveBeenCalledWith(
      'invoice', 'INV-00001', 'user01', '要再確認', expect.any(Object)
    );
  });
});
