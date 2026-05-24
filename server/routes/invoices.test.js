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
    listInvoiceCandidates: vi.fn().mockResolvedValue([]),
    getMonthlySummary: vi.fn().mockResolvedValue([]),
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
const makeApplyToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '一般ユーザ', permissions: ['approval:apply'] });
const makeActToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: 'システム管理者', permissions: ['approval:act'] });

describe('GET /api/invoices', () => {
  it('should return 200 with invoice list when authenticated', async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: 'GET', url: '/api/invoices', cookies: { token: makeToken(app) } });
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toEqual([sampleInvoice]);
  });

  it('should return 401 when not authenticated', async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: 'GET', url: '/api/invoices' });
    expect(res.statusCode).toBe(401);
  });

  it('should return paginated response with data and meta fields', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/invoices', cookies: { token: makeToken(app) } });

    // Assert
    const body = res.json();
    expect(body.data).toEqual([sampleInvoice]);
    expect(body.meta).toMatchObject({ total: 1, page: 1, pageSize: 20, totalPages: 1 });
  });

  it('should return empty data when page exceeds total pages', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/invoices?page=2', cookies: { token: makeToken(app) } });

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
    const res = await app.inject({ method: 'GET', url: '/api/invoices?limit=1', cookies: { token: makeToken(app) } });

    // Assert
    const body = res.json();
    expect(body.meta.pageSize).toBe(1);
    expect(body.data).toHaveLength(1);
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
      cookies: { token: makeApplyToken(app) }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認依頼中');
  });

  it('should return 400 when status transition is invalid', async () => {
    const err = Object.assign(new Error('下書き状態のみ'), { statusCode: 400 });
    const { app } = await makeApp({ submitInvoiceApproval: vi.fn().mockRejectedValue(err) });
    const res = await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/invoices/:code/approve', () => {
  it('should return 200 with status 確定', async () => {
    const { app } = await makeApp();
    const res = await app.inject({
      method: 'POST', url: '/api/invoices/INV-00001/approve',
      cookies: { token: makeActToken(app) },
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
      cookies: { token: makeActToken(app) },
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
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(mockApprovalRouteRepository.findByDocumentType).toHaveBeenCalledWith('invoice');
    expect(mockNotificationService.notifyApprovalRequest).toHaveBeenCalledWith(
      'invoice', 'INV-00001', ['approver01']
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
      cookies: { token: makeActToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(mockNotificationService.notifyApprovalComplete).toHaveBeenCalledWith(
      'invoice', 'INV-00001', 'user01'
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
      cookies: { token: makeActToken(app) },
      payload: { reason: '要再確認' }
    });

    // Assert
    expect(mockNotificationService.notifyRejection).toHaveBeenCalledWith(
      'invoice', 'INV-00001', 'user01', '要再確認'
    );
  });
});

describe('GET /api/invoices/candidates - month boundary validation', () => {
  it('should return 400 when month is 0 (below minimum 1)', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/invoices/candidates?year=2026&month=0',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 when month is 13 (above maximum 12)', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/invoices/candidates?year=2026&month=13',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/invoices/candidates', () => {
  it('should return 200 with candidate orders when authenticated', async () => {
    // Arrange
    const sampleOrder = { code: 'ORD-001', customerId: 'CUS-001', status: '承認済み' };
    const { app } = await makeApp({ listInvoiceCandidates: vi.fn().mockResolvedValue([sampleOrder]) });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/invoices/candidates?year=2026&month=5',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(1);
  });

  it('should return 400 when month is missing', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/invoices/candidates?year=2026',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/invoices/candidates?year=2026&month=5' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/reports/monthly-summary - month boundary validation', () => {
  it('should return 400 when month is 0 (below minimum 1)', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/reports/monthly-summary?year=2026&month=0',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 when month is 13 (above maximum 12)', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/reports/monthly-summary?year=2026&month=13',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/reports/monthly-summary', () => {
  it('should return 200 with monthly summary when authenticated', async () => {
    // Arrange
    const summary = [{ projectCode: 'PRJ-001', sales: 1000000, cost: 700000, profit: 300000 }];
    const { app } = await makeApp({ getMonthlySummary: vi.fn().mockResolvedValue(summary) });

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/reports/monthly-summary?year=2026&month=5',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()[0].projectCode).toBe('PRJ-001');
    expect(res.json()[0].profit).toBe(300000);
  });

  it('should return 400 when year is missing', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET',
      url: '/api/reports/monthly-summary?month=5',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/reports/monthly-summary?year=2026&month=5' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});
