import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import fcookie from '@fastify/cookie';
import fhelmet from '@fastify/helmet';
import fcors from '@fastify/cors';
import frateLimit from '@fastify/rate-limit';
import { auditLogPlugin } from './plugins/auditLog.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import supplierRoutes from './routes/suppliers.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import quotationRoutes from './routes/quotations.js';
import orderRoutes from './routes/orders.js';
import approvalRouteRoutes from './routes/approvalRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrders.js';
import invoiceRoutes from './routes/invoices.js';
import receiptRoutes from './routes/receipts.js';
import paymentRoutes from './routes/payments.js';
import notificationRoutes from './routes/notifications.js';
import deliveryRoutes from './routes/deliveries.js';
import settingsRoutes from './routes/settings.js';

export async function buildApp({ userRepository, customerService, supplierService, productService, userService, projectService, quotationService, orderService, approvalRouteRepository, purchaseOrderService, invoiceService, receiptService, paymentService, notificationService, deliveryService, settingsService, auditLogRepository, corsOrigin, rateLimit } = {}) {
  const app = Fastify({ logger: false });

  await app.register(fhelmet);

  if (corsOrigin) {
    const allowedOrigins = Array.isArray(corsOrigin) ? corsOrigin : [corsOrigin];
    await app.register(fcors, {
      origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      credentials: true
    });
  }

  if (rateLimit) {
    await app.register(frateLimit, rateLimit);
  }

  await app.register(fcookie);

  await app.register(fjwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    cookie: { cookieName: 'token', signed: false }
  });

  app.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify({ onlyCookie: true });
    } catch {
      reply.code(401).send({ error: { message: '認証が必要です' } });
    }
  });

  if (auditLogRepository) {
    await app.register(auditLogPlugin, { auditLogRepository });
  }

  await app.register(authRoutes, { userRepository });

  await app.register(customerRoutes, { customerService });
  await app.register(supplierRoutes, { supplierService });
  await app.register(productRoutes, { productService });
  await app.register(userRoutes, { userService });
  await app.register(projectRoutes, { projectService });
  await app.register(quotationRoutes, { quotationService, notificationService, approvalRouteRepository });
  await app.register(orderRoutes, { orderService, notificationService, approvalRouteRepository });
  await app.register(approvalRouteRoutes, { approvalRouteRepository });
  await app.register(purchaseOrderRoutes, { purchaseOrderService, notificationService, approvalRouteRepository });
  await app.register(invoiceRoutes, { invoiceService, notificationService, approvalRouteRepository });
  await app.register(receiptRoutes, { receiptService });
  await app.register(paymentRoutes, { paymentService });
  await app.register(notificationRoutes, { notificationService });
  if (deliveryService) await app.register(deliveryRoutes, { deliveryService });
  if (settingsService) await app.register(settingsRoutes, { settingsService });

  return app;
}
