import 'dotenv/config';
import { assertProductionSecrets } from './startupGuards.js';
assertProductionSecrets();
import { buildApp } from './app.js';
import { createAuditLogRepository } from './repositories/auditLogRepository.js';
import { createSessionRepository } from './repositories/sessionRepository.js';
import { createInMemoryRefreshTokenRepository } from './repositories/refreshTokenRepository.js';

// --- In-memory repositories (P1〜P4実装済み・本番ではDB接続リポジトリに差し替え) ---
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
import { createSettingsRepository } from './repositories/settingsRepository.js';

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
import { createNotificationRepository } from './repositories/notificationRepository.js';
import { createStaleApprovalJob } from './jobs/staleApprovalJob.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10);
const ALLOWED_ORIGINS = CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);

const userRepo           = createUserRepository([]);
const customerRepo       = createCustomerRepository([]);
const supplierRepo       = createSupplierRepository([]);
const productRepo        = createProductRepository([]);
const projectRepo        = createProjectRepository([]);
const quotationRepo      = createQuotationRepository([]);
const orderRepo          = createOrderRepository([]);
const purchaseOrderRepo  = createPurchaseOrderRepository([]);
const invoiceRepo        = createInvoiceRepository([]);
const receiptRepo        = createReceiptRepository([]);
const paymentRepo        = createPaymentRepository([]);
const approvalRouteRepo  = createApprovalRouteRepository([]);
const deliveryRepo       = createDeliveryRepository([]);
const settingsRepo       = createSettingsRepository();
const auditLogRepo       = createAuditLogRepository([]);
const notificationRepo   = createNotificationRepository([]);
const notificationSvc       = createNotificationService();
const sessionRepo           = createSessionRepository();
const refreshTokenRepo      = createInMemoryRefreshTokenRepository();

const bindRepo = (svc, repo) =>
  Object.fromEntries(
    Object.entries(svc).map(([k, fn]) => [
      k,
      (...args) => fn(...args, { repository: repo })
    ])
  );

const app = await buildApp({
  sessionRepository:      sessionRepo,
  refreshTokenRepository: refreshTokenRepo,
  userRepository:        userRepo,
  customerService:       bindRepo(customerService, customerRepo),
  supplierService:       bindRepo(supplierService, supplierRepo),
  productService:        bindRepo(productService, productRepo),
  userService:           bindRepo(userService, userRepo),
  projectService:        bindRepo(projectService, projectRepo),
  quotationService:      bindRepo(quotationService, quotationRepo),
  orderService:          bindRepo(orderService, orderRepo),
  approvalRouteRepository: approvalRouteRepo,
  purchaseOrderService:  bindRepo(purchaseOrderService, purchaseOrderRepo),
  invoiceService:        bindRepo(invoiceService, invoiceRepo),
  receiptService:        bindRepo(receiptService, receiptRepo),
  paymentService:        bindRepo(paymentService, paymentRepo),
  deliveryService:       bindRepo(deliveryService, deliveryRepo),
  settingsService:       bindRepo(settingsService, settingsRepo),
  notificationService:   notificationSvc,
  auditLogRepository:    auditLogRepo,
  corsOrigin:            CORS_ORIGIN,
  rateLimit:             { max: RATE_LIMIT_MAX, timeWindow: '1 minute' },
  allowedOrigins:        ALLOWED_ORIGINS
});

const STALE_DAYS = parseInt(process.env.APPROVAL_STALE_DAYS ?? '3', 10);

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`Server running at http://0.0.0.0:${PORT}`);

  const staleApprovalJob = createStaleApprovalJob({
    quotationRepository: quotationRepo,
    orderRepository: orderRepo,
    purchaseOrderRepository: purchaseOrderRepo,
    invoiceRepository: invoiceRepo,
    notificationRepository: notificationRepo,
    staleDays: STALE_DAYS
  });
  staleApprovalJob.start();
  console.log(`[staleApprovalJob] started (staleDays=${STALE_DAYS})`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
