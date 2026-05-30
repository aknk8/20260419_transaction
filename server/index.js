import 'dotenv/config';
import { assertProductionSecrets } from './startupGuards.js';
assertProductionSecrets();
import { buildApp } from './app.js';
import { createDbClient } from './db/client.js';

// --- DB repositories (DATABASE_URL が設定されている場合に使用) ---
import { createUserRepository } from './repositories/userRepository.js';
import { createCustomerRepository } from './repositories/customerRepository.js';
import { createSupplierRepository } from './repositories/supplierRepository.js';
import { createProductRepository } from './repositories/productRepository.js';
import { createProjectRepository } from './repositories/projectRepository.js';
import { createQuotationRepository } from './repositories/quotationRepository.js';
import { createOrderRepository } from './repositories/orderRepository.js';
import { createPurchaseOrderRepository } from './repositories/purchaseOrderRepository.js';
import { createInvoiceRepository } from './repositories/invoiceRepository.js';
import { createReceiptRepository } from './repositories/receiptRepository.js';
import { createPaymentRepository } from './repositories/paymentRepository.js';
import { createApprovalRouteRepository } from './repositories/approvalRouteRepository.js';
import { createDeliveryRepository } from './repositories/deliveryRepository.js';
import { createNotificationRepository } from './repositories/notificationRepository.js';
import { createSequenceCounterRepository } from './repositories/sequenceCounterRepository.js';
import { createRefreshTokenRepository } from './repositories/refreshTokenRepository.js';
import { createDbAuditLogRepository } from './repositories/auditLogRepository.js';

// --- In-memory repositories (DATABASE_URL 未設定の場合に使用) ---
import { createInMemoryUserRepository } from './repositories/userRepository.js';
import { createInMemoryCustomerRepository } from './repositories/customerRepository.js';
import { createInMemorySupplierRepository } from './repositories/supplierRepository.js';
import { createInMemoryProductRepository } from './repositories/productRepository.js';
import { createInMemoryProjectRepository } from './repositories/projectRepository.js';
import { createInMemoryQuotationRepository } from './repositories/quotationRepository.js';
import { createInMemoryOrderRepository } from './repositories/orderRepository.js';
import { createInMemoryPurchaseOrderRepository } from './repositories/purchaseOrderRepository.js';
import { createInMemoryInvoiceRepository } from './repositories/invoiceRepository.js';
import { createInMemoryReceiptRepository } from './repositories/receiptRepository.js';
import { createInMemoryPaymentRepository } from './repositories/paymentRepository.js';
import { createInMemoryApprovalRouteRepository } from './repositories/approvalRouteRepository.js';
import { createInMemoryDeliveryRepository } from './repositories/deliveryRepository.js';
import { createInMemoryNotificationRepository } from './repositories/notificationRepository.js';
import { createInMemorySequenceCounterRepository } from './repositories/sequenceCounterRepository.js';
import { createInMemoryRefreshTokenRepository } from './repositories/refreshTokenRepository.js';
import { createAuditLogRepository } from './repositories/auditLogRepository.js';

// --- 常にインメモリで運用するリポジトリ ---
import { createSessionRepository } from './repositories/sessionRepository.js';
import { createSettingsRepository } from './repositories/settingsRepository.js';

import {
  seedUsers, seedCustomers, seedSuppliers, seedProducts, seedProjects,
  seedQuotations, seedOrders, seedPurchaseOrders, seedInvoices,
  seedReceipts, seedPayments, seedNotifications, seedDeliveries
} from './db/seedData.js';
import { resetDb } from './db/resetDb.js';

import * as customerService from './services/customerService.js';
import * as supplierService from './services/supplierService.js';
import * as productService from './services/productService.js';
import * as userService from './services/userService.js';
import * as projectService from './services/projectService.js';
import * as quotationService from './services/quotationService.js';
import * as orderService from './services/orderService.js';
import * as purchaseOrderService from './services/purchaseOrderService.js';
import * as invoiceService from './services/invoiceService.js';
import * as receiptService from './services/receiptService.js';
import * as paymentService from './services/paymentService.js';
import * as deliveryService from './services/deliveryService.js';
import * as settingsService from './services/settingsService.js';
import { createNotificationService } from './services/notificationService.js';
import { createStaleApprovalJob } from './jobs/staleApprovalJob.js';

const PORT         = parseInt(process.env.PORT         ?? '3000', 10);
const CORS_ORIGIN  = process.env.CORS_ORIGIN           ?? 'http://localhost:5173';
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10);
const ALLOWED_ORIGINS = CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);

// --- 接続レイヤーの選択 ---
const client = createDbClient(process.env.DATABASE_URL);
const db     = client?.db ?? null;

const useDb = db !== null;
if (useDb) {
  console.log('[startup] PostgreSQL モードで起動します');
} else {
  console.log('[startup] In-memory モードで起動します（DATABASE_URL 未設定）');
}

// --- リポジトリ生成（環境別） ---
const userRepo           = useDb ? createUserRepository(db)                      : createInMemoryUserRepository(seedUsers);
const customerRepo       = useDb ? createCustomerRepository(db)                  : createInMemoryCustomerRepository(seedCustomers);
const supplierRepo       = useDb ? createSupplierRepository(db)                  : createInMemorySupplierRepository(seedSuppliers);
const productRepo        = useDb ? createProductRepository(db)                   : createInMemoryProductRepository(seedProducts);
const projectRepo        = useDb ? createProjectRepository(db)                   : createInMemoryProjectRepository(seedProjects);
const quotationRepo      = useDb ? createQuotationRepository(db)                 : createInMemoryQuotationRepository(seedQuotations);
const orderRepo          = useDb ? createOrderRepository(db)                     : createInMemoryOrderRepository(seedOrders);
const purchaseOrderRepo  = useDb ? createPurchaseOrderRepository(db)             : createInMemoryPurchaseOrderRepository(seedPurchaseOrders);
const invoiceRepo        = useDb ? createInvoiceRepository(db)                   : createInMemoryInvoiceRepository(seedInvoices);
const receiptRepo        = useDb ? createReceiptRepository(db)                   : createInMemoryReceiptRepository(seedReceipts);
const paymentRepo        = useDb ? createPaymentRepository(db)                   : createInMemoryPaymentRepository(seedPayments);
const approvalRouteRepo  = useDb ? createApprovalRouteRepository(db)             : createInMemoryApprovalRouteRepository([]);
const deliveryRepo       = useDb ? createDeliveryRepository(db)                  : createInMemoryDeliveryRepository(seedDeliveries);
const notificationRepo   = useDb ? createNotificationRepository(db)              : createInMemoryNotificationRepository(seedNotifications);
const seqRepo            = useDb ? createSequenceCounterRepository(db)           : createInMemorySequenceCounterRepository({
  quotation:     11,
  order:         7,
  purchaseOrder: 6,
  invoice:       7,
  receipt:       1,
  payment:       2,
  delivery:      1
});
const auditLogRepo       = useDb ? createDbAuditLogRepository(db)                : createAuditLogRepository([]);
const refreshTokenRepo   = useDb ? createRefreshTokenRepository(db)              : createInMemoryRefreshTokenRepository();

// 常にインメモリ
const settingsRepo       = createSettingsRepository();
const sessionRepo        = createSessionRepository();

const notificationSvc    = createNotificationService();

async function resetAll() {
  if (useDb) {
    await resetDb(db);
    // セッション・設定はインメモリのため個別にリセット
    sessionRepo.reset?.();
    settingsRepo.reset?.();
    return;
  }
  const repos = [
    userRepo, customerRepo, supplierRepo, productRepo, projectRepo,
    quotationRepo, orderRepo, purchaseOrderRepo, invoiceRepo, receiptRepo,
    paymentRepo, approvalRouteRepo, deliveryRepo, notificationRepo,
    seqRepo, auditLogRepo, refreshTokenRepo, sessionRepo, settingsRepo
  ];
  for (const repo of repos) {
    if (typeof repo.reset === 'function') repo.reset();
  }
}

const bindRepo = (svc, repo) =>
  Object.fromEntries(
    Object.entries(svc).map(([k, fn]) => [
      k,
      (...args) => fn(...args, { repository: repo })
    ])
  );

const app = await buildApp({
  db:                     client?.health ?? null,
  sessionRepository:      sessionRepo,
  refreshTokenRepository: refreshTokenRepo,
  userRepository:         userRepo,
  testResetFn:            process.env.NODE_ENV !== 'production' ? resetAll : undefined,
  customerService:        bindRepo(customerService, customerRepo),
  supplierService:        bindRepo(supplierService, supplierRepo),
  productService:         bindRepo(productService, productRepo),
  userService: {
    ...bindRepo(userService, userRepo),
    registerUser: (data, opts = {}) => userService.registerUser(data, { repository: userRepo, ...opts }),
    updateUser: (id, data, opts = {}) => userService.updateUser(id, data, { repository: userRepo, ...opts })
  },
  projectService:         bindRepo(projectService, projectRepo),
  quotationService: {
    ...bindRepo(quotationService, quotationRepo),
    registerQuotation: (formData) =>
      quotationService.registerQuotation(formData, { repository: quotationRepo, sequenceRepository: seqRepo }),
    submitQuotationApproval: (code, opts = {}) =>
      quotationService.submitQuotationApproval(code, { repository: quotationRepo, ...opts })
  },
  orderService: {
    ...bindRepo(orderService, orderRepo),
    registerOrder: (formData) =>
      orderService.registerOrder(formData, { repository: orderRepo, quotationRepository: quotationRepo, sequenceRepository: seqRepo }),
    submitOrderApproval: (code, opts = {}) =>
      orderService.submitOrderApproval(code, { repository: orderRepo, quotationRepository: quotationRepo, ...opts })
  },
  approvalRouteRepository: approvalRouteRepo,
  purchaseOrderService: {
    ...bindRepo(purchaseOrderService, purchaseOrderRepo),
    registerPurchaseOrder: (formData) =>
      purchaseOrderService.registerPurchaseOrder(formData, { repository: purchaseOrderRepo, sequenceRepository: seqRepo })
  },
  invoiceService: {
    ...bindRepo(invoiceService, invoiceRepo),
    registerInvoice: (formData) =>
      invoiceService.registerInvoice(formData, { repository: invoiceRepo, sequenceRepository: seqRepo, orderRepository: orderRepo }),
    submitInvoiceApproval: (code, opts = {}) =>
      invoiceService.submitInvoiceApproval(code, { repository: invoiceRepo, ...opts }),
    listInvoiceCandidates: (year, month) =>
      invoiceService.listInvoiceCandidates(year, month, { orderRepository: orderRepo, customerRepository: customerRepo }),
    getMonthlySummary: (year, month) =>
      invoiceService.getMonthlySummary(year, month, { invoiceRepository: invoiceRepo, orderRepository: orderRepo, purchaseOrderRepository: purchaseOrderRepo })
  },
  receiptService: {
    ...bindRepo(receiptService, receiptRepo),
    registerReceipt: (formData) =>
      receiptService.registerReceipt(formData, { repository: receiptRepo, invoiceRepository: invoiceRepo, sequenceRepository: seqRepo })
  },
  paymentService: {
    ...bindRepo(paymentService, paymentRepo),
    registerPayment: (formData) =>
      paymentService.registerPayment(formData, { repository: paymentRepo, sequenceRepository: seqRepo })
  },
  deliveryService: {
    ...bindRepo(deliveryService, deliveryRepo),
    registerDelivery: (formData) =>
      deliveryService.registerDelivery(formData, { repository: deliveryRepo, sequenceRepository: seqRepo })
  },
  settingsService:        bindRepo(settingsService, settingsRepo),
  notificationService:    bindRepo(notificationSvc, notificationRepo),
  auditLogRepository:     auditLogRepo,
  corsOrigin:             CORS_ORIGIN,
  rateLimit:              { max: RATE_LIMIT_MAX, timeWindow: '1 minute' },
  allowedOrigins:         ALLOWED_ORIGINS
});

const STALE_DAYS = parseInt(process.env.APPROVAL_STALE_DAYS ?? '3', 10);

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server running at http://0.0.0.0:${PORT}`);

  const staleApprovalJob = createStaleApprovalJob({
    quotationRepository:     quotationRepo,
    orderRepository:         orderRepo,
    purchaseOrderRepository: purchaseOrderRepo,
    invoiceRepository:       invoiceRepo,
    notificationRepository:  notificationRepo,
    staleDays:               STALE_DAYS
  });
  staleApprovalJob.start();
  console.log(`[staleApprovalJob] started (staleDays=${STALE_DAYS})`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
