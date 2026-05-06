import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const sampleQuotation = { code: 'QUO-00001', title: 'テスト見積', status: '下書き', details: [] };

const makeNotificationServiceMock = () => ({
  notifyApprovalRequest: vi.fn().mockResolvedValue(undefined),
  notifyApprovalComplete: vi.fn().mockResolvedValue(undefined),
  notifyRejection: vi.fn().mockResolvedValue(undefined),
  getNotificationsForUser: vi.fn().mockResolvedValue([]),
  markAsRead: vi.fn().mockResolvedValue(null)
});

const makeApp = async (serviceOverrides = {}, { notificationService, approvalRouteRepository } = {}) => {
  const mockQuotationService = {
    listQuotations: vi.fn().mockResolvedValue([sampleQuotation]),
    getQuotationByCode: vi.fn().mockResolvedValue(sampleQuotation),
    registerQuotation: vi.fn().mockResolvedValue(sampleQuotation),
    updateQuotation: vi.fn().mockResolvedValue(sampleQuotation),
    submitQuotationApproval: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '承認依頼中' }),
    approveQuotation: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '承認済み' }),
    rejectQuotation: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '却下' }),
    ...serviceOverrides
  };
  const mockNotificationService = notificationService ?? makeNotificationServiceMock();
  const mockApprovalRouteRepository = approvalRouteRepository ?? { findByDocumentType: vi.fn().mockResolvedValue([]) };
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({
    userRepository: mockUserRepository,
    quotationService: mockQuotationService,
    notificationService: mockNotificationService,
    approvalRouteRepository: mockApprovalRouteRepository
  });
  return { app, mockQuotationService, mockNotificationService, mockApprovalRouteRepository };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });
const makeApplyToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '一般ユーザ', permissions: ['approval:apply'] });
const makeActToken = (app) =>
  app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: 'システム管理者', permissions: ['approval:act'] });

describe('GET /api/quotations', () => {
  it('should return 200 with list when authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/quotations', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([sampleQuotation]);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/quotations' });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/quotations/:code', () => {
  it('should return 200 when code exists', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/quotations/QUO-00001', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().code).toBe('QUO-00001');
  });

  it('should return 404 when code does not exist', async () => {
    // Arrange
    const err = Object.assign(new Error('Not found'), { statusCode: 404 });
    const { app } = await makeApp({ getQuotationByCode: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/quotations/QUO-99999', cookies: { token: makeToken(app) } });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/quotations', () => {
  it('should return 201 with created quotation', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations',
      cookies: { token: makeToken(app) },
      payload: { title: 'テスト見積', details: [] }
    });

    // Assert
    expect(res.statusCode).toBe(201);
  });

  it('should return 400 when validation fails', async () => {
    // Arrange
    const err = Object.assign(new Error('件名は必須です'), { statusCode: 400 });
    const { app } = await makeApp({ registerQuotation: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations',
      cookies: { token: makeToken(app) },
      payload: { details: [] }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'POST', url: '/api/quotations', payload: {} });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});

describe('PATCH /api/quotations/:code', () => {
  it('should return 200 with updated quotation', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'PATCH', url: '/api/quotations/QUO-00001',
      cookies: { token: makeToken(app) },
      payload: { title: '変更後見積' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /api/quotations/:code/submit-approval', () => {
  it('should return 200 with status 承認依頼中', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/QUO-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認依頼中');
  });

  it('should return 400 when status transition is invalid', async () => {
    // Arrange
    const err = Object.assign(new Error('下書き状態のみ'), { statusCode: 400 });
    const { app } = await makeApp({ submitQuotationApproval: vi.fn().mockRejectedValue(err) });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/QUO-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/quotations/:code/approve', () => {
  it('should return 200 with status 承認済み', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/QUO-00001/approve',
      cookies: { token: makeActToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認済み');
  });
});

describe('POST /api/quotations/:code/reject', () => {
  it('should return 200 with status 却下', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/QUO-00001/reject',
      cookies: { token: makeActToken(app) },
      payload: { reason: '金額が高すぎる' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('却下');
  });
});

describe('POST /api/quotations/:code/submit-approval (N-01通知)', () => {
  it('should call notifyApprovalRequest with approver IDs when submit succeeds', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const mockApprovalRouteRepository = {
      findByDocumentType: vi.fn().mockResolvedValue([
        { approverUserId: 'approver01' },
        { approverUserId: 'approver02' }
      ])
    };
    const { app } = await makeApp({}, { notificationService: mockNotificationService, approvalRouteRepository: mockApprovalRouteRepository });

    // Act
    await app.inject({
      method: 'POST', url: '/api/quotations/QUO-00001/submit-approval',
      cookies: { token: makeApplyToken(app) }
    });

    // Assert
    expect(mockApprovalRouteRepository.findByDocumentType).toHaveBeenCalledWith('quotation');
    expect(mockNotificationService.notifyApprovalRequest).toHaveBeenCalledWith(
      'quotation', 'QUO-00001', ['approver01', 'approver02'], expect.any(Object)
    );
  });
});

describe('POST /api/quotations/:code/approve (N-02通知)', () => {
  it('should call notifyApprovalComplete with submittedBy when approved', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const { app } = await makeApp(
      { approveQuotation: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '承認済み', submittedBy: 'user01' }) },
      { notificationService: mockNotificationService }
    );

    // Act
    await app.inject({
      method: 'POST', url: '/api/quotations/QUO-00001/approve',
      cookies: { token: makeActToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(mockNotificationService.notifyApprovalComplete).toHaveBeenCalledWith(
      'quotation', 'QUO-00001', 'user01', expect.any(Object)
    );
  });
});

describe('POST /api/quotations/:code/reject (N-03通知)', () => {
  it('should call notifyRejection with submittedBy when rejected', async () => {
    // Arrange
    const mockNotificationService = makeNotificationServiceMock();
    const { app } = await makeApp(
      { rejectQuotation: vi.fn().mockResolvedValue({ ...sampleQuotation, status: '却下', submittedBy: 'user01' }) },
      { notificationService: mockNotificationService }
    );

    // Act
    await app.inject({
      method: 'POST', url: '/api/quotations/QUO-00001/reject',
      cookies: { token: makeActToken(app) },
      payload: { reason: '金額が高すぎる' }
    });

    // Assert
    expect(mockNotificationService.notifyRejection).toHaveBeenCalledWith(
      'quotation', 'QUO-00001', 'user01', '金額が高すぎる', expect.any(Object)
    );
  });
});
