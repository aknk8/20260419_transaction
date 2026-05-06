import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const pendingQuotation = { code: 'QUO-00001', title: '見積テスト', status: '承認依頼中', docType: 'quotation' };
const pendingOrder = { code: 'ORD-00001', title: '受注テスト', status: '承認依頼中', docType: 'order' };

const makeDocService = (listResult = [], overrides = {}) => ({
  listQuotations: vi.fn().mockResolvedValue([]),
  listOrders: vi.fn().mockResolvedValue([]),
  listPurchaseOrders: vi.fn().mockResolvedValue([]),
  listInvoices: vi.fn().mockResolvedValue([]),
  listPayments: vi.fn().mockResolvedValue([]),
  approveQuotation: vi.fn().mockResolvedValue({ code: 'QUO-00001', status: '承認済み' }),
  approveOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '承認済み' }),
  approvePurchaseOrder: vi.fn().mockResolvedValue({ code: 'POD-00001', status: '承認済み' }),
  approveInvoice: vi.fn().mockResolvedValue({ code: 'INV-00001', status: '承認済み' }),
  approvePayment: vi.fn().mockResolvedValue({ code: 'PAY-00001', status: '承認済み' }),
  rejectQuotation: vi.fn().mockResolvedValue({ code: 'QUO-00001', status: '却下' }),
  rejectOrder: vi.fn().mockResolvedValue({ code: 'ORD-00001', status: '却下' }),
  rejectPurchaseOrder: vi.fn().mockResolvedValue({ code: 'POD-00001', status: '却下' }),
  rejectInvoice: vi.fn().mockResolvedValue({ code: 'INV-00001', status: '却下' }),
  rejectPayment: vi.fn().mockResolvedValue({ code: 'PAY-00001', status: '却下' }),
  ...overrides
});

const makeApp = async (serviceOverrides = {}) => {
  const svc = makeDocService([], serviceOverrides);
  const mockUserRepository = { findByUsername: vi.fn().mockResolvedValue(null), findById: vi.fn().mockResolvedValue(null) };
  const app = await buildApp({
    userRepository: mockUserRepository,
    quotationService: svc,
    orderService: svc,
    purchaseOrderService: svc,
    invoiceService: svc,
    paymentService: svc
  });
  return { app, svc };
};

const makeToken = (app) => app.jwt.sign({ id: 'user01', name: '田中 太郎', userType: '営業' });

describe('GET /api/approvals', () => {
  it('should return 200 with pending approvals list when authenticated', async () => {
    // Arrange
    const { app, svc } = await makeApp({
      listQuotations: vi.fn().mockResolvedValue([{ code: 'QUO-00001', title: 'テスト', status: '承認依頼中' }])
    });

    // Act
    const res = await app.inject({
      method: 'GET', url: '/api/approvals',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.data[0]).toMatchObject({ code: 'QUO-00001', docType: 'quotation' });
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/approvals' });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should return only pending documents from all doc types', async () => {
    // Arrange
    const { app } = await makeApp({
      listQuotations: vi.fn().mockResolvedValue([
        { code: 'QUO-00001', status: '承認依頼中' },
        { code: 'QUO-00002', status: '承認済み' }
      ]),
      listOrders: vi.fn().mockResolvedValue([
        { code: 'ORD-00001', status: '承認依頼中' }
      ])
    });

    // Act
    const res = await app.inject({
      method: 'GET', url: '/api/approvals',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.json().data).toHaveLength(2);
  });

  it('should filter by docType query parameter', async () => {
    // Arrange
    const { app } = await makeApp({
      listQuotations: vi.fn().mockResolvedValue([{ code: 'QUO-00001', status: '承認依頼中' }]),
      listOrders: vi.fn().mockResolvedValue([{ code: 'ORD-00001', status: '承認依頼中' }])
    });

    // Act
    const res = await app.inject({
      method: 'GET', url: '/api/approvals?docType=quotation',
      cookies: { token: makeToken(app) }
    });

    // Assert
    const body = res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].docType).toBe('quotation');
  });

  it('should return empty array when no pending approvals exist', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'GET', url: '/api/approvals',
      cookies: { token: makeToken(app) }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().data).toHaveLength(0);
  });

  it('should return paginated response with data and meta fields', async () => {
    // Arrange
    const { app } = await makeApp({
      listQuotations: vi.fn().mockResolvedValue([{ code: 'QUO-00001', status: '承認依頼中' }])
    });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/approvals', cookies: { token: makeToken(app) } });

    // Assert
    const body = res.json();
    expect(body.data).toBeInstanceOf(Array);
    expect(body.meta).toMatchObject({ total: 1, page: 1, pageSize: 20, totalPages: 1 });
  });

  it('should return empty data when page exceeds total pages', async () => {
    // Arrange
    const { app } = await makeApp({
      listQuotations: vi.fn().mockResolvedValue([{ code: 'QUO-00001', status: '承認依頼中' }])
    });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/approvals?page=2', cookies: { token: makeToken(app) } });

    // Assert
    const body = res.json();
    expect(body.data).toEqual([]);
    expect(body.meta.page).toBe(2);
    expect(body.meta.total).toBe(1);
  });

  it('should respect limit query parameter', async () => {
    // Arrange
    const { app } = await makeApp({
      listQuotations: vi.fn().mockResolvedValue([{ code: 'QUO-00001', status: '承認依頼中' }])
    });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/approvals?limit=1', cookies: { token: makeToken(app) } });

    // Assert
    const body = res.json();
    expect(body.meta.pageSize).toBe(1);
    expect(body.data).toHaveLength(1);
  });
});

describe('POST /api/approvals/:code/approve', () => {
  it('should return 200 when approving a quotation', async () => {
    // Arrange
    const { app } = await makeApp({
      approveQuotation: vi.fn().mockResolvedValue({ code: 'QUO-00001', status: '承認済み' })
    });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/QUO-00001/approve',
      cookies: { token: makeToken(app) },
      payload: { comment: 'LGTM' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('承認済み');
  });

  it('should return 200 when approving a purchase order', async () => {
    // Arrange
    const { app } = await makeApp({
      approvePurchaseOrder: vi.fn().mockResolvedValue({ code: 'POD-00001', status: '承認済み' })
    });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/POD-00001/approve',
      cookies: { token: makeToken(app) },
      payload: {}
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 400 for unknown code prefix', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/UNKNOWN-001/approve',
      cookies: { token: makeToken(app) },
      payload: {}
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/QUO-00001/approve',
      payload: {}
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });

  it('should propagate 404 from underlying service', async () => {
    // Arrange
    const err = Object.assign(new Error('見つかりません'), { statusCode: 404 });
    const { app } = await makeApp({
      approveQuotation: vi.fn().mockRejectedValue(err)
    });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/QUO-99999/approve',
      cookies: { token: makeToken(app) },
      payload: {}
    });

    // Assert
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/approvals/:code/reject', () => {
  it('should return 200 when rejecting a quotation with reason', async () => {
    // Arrange
    const { app } = await makeApp({
      rejectQuotation: vi.fn().mockResolvedValue({ code: 'QUO-00001', status: '却下' })
    });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/QUO-00001/reject',
      cookies: { token: makeToken(app) },
      payload: { reason: '金額超過のため' }
    });

    // Assert
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('却下');
  });

  it('should return 400 when reason is missing', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/QUO-00001/reject',
      cookies: { token: makeToken(app) },
      payload: {}
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 400 for unknown code prefix', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/UNKNOWN-001/reject',
      cookies: { token: makeToken(app) },
      payload: { reason: '理由' }
    });

    // Assert
    expect(res.statusCode).toBe(400);
  });

  it('should return 401 when not authenticated', async () => {
    // Arrange
    const { app } = await makeApp();

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approvals/QUO-00001/reject',
      payload: { reason: '理由' }
    });

    // Assert
    expect(res.statusCode).toBe(401);
  });
});
