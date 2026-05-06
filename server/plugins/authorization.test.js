import { describe, it, expect, vi } from 'vitest';
import { buildApp } from '../app.js';

const makeApp = async (opts = {}) => {
  const mockUserRepository = { findByUsername: async () => null, findById: async () => null };
  const mockCustomerService = {
    listCustomers: vi.fn().mockResolvedValue([]),
    getCustomerByCode: vi.fn().mockResolvedValue({ code: 'C001' }),
    registerCustomer: vi.fn().mockResolvedValue({ code: 'C001', name: 'Test' }),
    updateCustomer: vi.fn().mockResolvedValue({ code: 'C001' })
  };
  const mockUserService = {
    listUsers: vi.fn().mockResolvedValue([]),
    getUserById: vi.fn().mockResolvedValue({ id: 'u01' }),
    registerUser: vi.fn().mockResolvedValue({ id: 'u01' }),
    updateUser: vi.fn().mockResolvedValue({ id: 'u01' })
  };
  const mockApprovalRouteRepository = {
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    findByDocumentType: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({ id: 1 }),
    remove: vi.fn().mockResolvedValue()
  };
  const mockQuotationService = {
    listQuotations: vi.fn().mockResolvedValue([]),
    getQuotationByCode: vi.fn().mockResolvedValue({ code: 'Q001' }),
    registerQuotation: vi.fn().mockResolvedValue({ code: 'Q001' }),
    updateQuotation: vi.fn().mockResolvedValue({ code: 'Q001' }),
    submitQuotationApproval: vi.fn().mockResolvedValue({ code: 'Q001', status: '承認依頼中' }),
    approveQuotation: vi.fn().mockResolvedValue({ code: 'Q001', status: '承認済み' }),
    rejectQuotation: vi.fn().mockResolvedValue({ code: 'Q001', status: '却下' })
  };
  const mockPaymentService = {
    listPayments: vi.fn().mockResolvedValue([]),
    getPaymentByCode: vi.fn().mockResolvedValue({ code: 'P001' }),
    registerPayment: vi.fn().mockResolvedValue({ code: 'P001' }),
    submitPaymentApproval: vi.fn().mockResolvedValue({ code: 'P001', status: '承認依頼中' }),
    approvePayment: vi.fn().mockResolvedValue({ code: 'P001', status: '承認済み' }),
    rejectPayment: vi.fn().mockResolvedValue({ code: 'P001', status: '却下' }),
    cancelPayment: vi.fn().mockResolvedValue({ code: 'P001' }),
    registerPaymentResult: vi.fn().mockResolvedValue({ code: 'P001', status: '支払済' })
  };
  const mockNotificationService = {
    notifyApprovalRequest: vi.fn().mockResolvedValue(undefined),
    notifyApprovalComplete: vi.fn().mockResolvedValue(undefined),
    notifyRejection: vi.fn().mockResolvedValue(undefined)
  };
  return buildApp({
    userRepository: mockUserRepository,
    customerService: mockCustomerService,
    userService: mockUserService,
    approvalRouteRepository: mockApprovalRouteRepository,
    quotationService: mockQuotationService,
    paymentService: mockPaymentService,
    notificationService: mockNotificationService,
    ...opts
  });
};

describe('requirePermission - master:edit', () => {
  it('should return 403 when user has no master:edit permission for POST /api/customers', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/customers',
      cookies: { token }, payload: { name: 'Test', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 201 when user has master:edit permission for POST /api/customers', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: 'システム管理者', permissions: ['master:edit'] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/customers',
      cookies: { token }, payload: { name: 'Test', status: '有効' }
    });

    // Assert
    expect(res.statusCode).toBe(201);
  });

  it('should return 403 when user has no master:edit permission for PATCH /api/customers/:code', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({
      method: 'PATCH', url: '/api/customers/C001',
      cookies: { token }, payload: { name: '変更' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });
});

describe('requirePermission - user-permission:edit', () => {
  it('should return 403 when user lacks user-permission:edit for POST /api/users', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/users',
      cookies: { token }, payload: { id: 'u02', name: 'New', userType: '一般ユーザ', password: 'Pass1word!' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 403 when user lacks user-permission:edit for GET /api/users', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({ method: 'GET', url: '/api/users', cookies: { token } });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 403 when user lacks user-permission:edit for POST /api/approval-routes', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/approval-routes',
      cookies: { token }, payload: { documentType: 'quotation', stepNumber: 1 }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 403 when user lacks user-permission:edit for DELETE /api/approval-routes/:id', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({ method: 'DELETE', url: '/api/approval-routes/1', cookies: { token } });

    // Assert
    expect(res.statusCode).toBe(403);
  });
});

describe('requirePermission - approval:apply', () => {
  it('should return 403 when user lacks approval:apply for POST /api/quotations/:code/submit-approval', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/Q001/submit-approval', cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 200 when user has approval:apply for POST /api/quotations/:code/submit-approval', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: ['approval:apply'] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/Q001/submit-approval', cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });
});

describe('requirePermission - approval:act', () => {
  it('should return 403 when user lacks approval:act for POST /api/quotations/:code/approve', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/Q001/approve', cookies: { token }, payload: {}
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 200 when user has approval:act for POST /api/quotations/:code/approve', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: 'システム管理者', permissions: ['approval:act'] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/Q001/approve', cookies: { token }, payload: {}
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });

  it('should return 403 when user lacks approval:act for POST /api/quotations/:code/reject', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/quotations/Q001/reject', cookies: { token }, payload: { reason: '却下' }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });
});

describe('requirePermission - payment:edit', () => {
  it('should return 403 when user lacks payment:edit for POST /api/payments/:code/register', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: '一般ユーザ', permissions: [] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/P001/register', cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(403);
  });

  it('should return 200 when user has payment:edit for POST /api/payments/:code/register', async () => {
    // Arrange
    const app = await makeApp();
    const token = app.jwt.sign({ id: 'u01', name: 'テスト', userType: 'システム管理者', permissions: ['payment:edit'] });

    // Act
    const res = await app.inject({
      method: 'POST', url: '/api/payments/P001/register', cookies: { token }
    });

    // Assert
    expect(res.statusCode).toBe(200);
  });
});
