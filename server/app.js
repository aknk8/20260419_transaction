import Fastify from 'fastify';
import fjwt from '@fastify/jwt';
import fcookie from '@fastify/cookie';
import fhelmet from '@fastify/helmet';
import fcors from '@fastify/cors';
import frateLimit from '@fastify/rate-limit';
import fstatic from '@fastify/static';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { auditLogPlugin } from './plugins/auditLog.js';
import { authorizationPlugin } from './plugins/authorization.js';
import { csrfPlugin } from './plugins/csrf.js';
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
import approvalRoutes from './routes/approvals.js';
import deliveryRoutes from './routes/deliveries.js';
import settingsRoutes from './routes/settings.js';
import healthRoutes from './routes/health.js';

const distPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

export async function buildApp({ userRepository, customerService, supplierService, productService, userService, projectService, quotationService, orderService, approvalRouteRepository, purchaseOrderService, invoiceService, receiptService, paymentService, notificationService, deliveryService, settingsService, auditLogRepository, sessionRepository, refreshTokenRepository, corsOrigin, rateLimit, allowedOrigins } = {}) {
  const app = Fastify({
    logger: false,
    ajv: { customOptions: { removeAdditional: false } }
  });

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    reply.code(statusCode);
    return { error: { message: error.message } };
  });

  await app.register(fhelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"]
      }
    }
  });

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
      if (sessionRepository) {
        const jti = request.user?.jti;
        if (jti) {
          const session = sessionRepository.findByJti(jti);
          if (!session || session.revoked) {
            const err = new Error('認証が必要です');
            err.statusCode = 401;
            throw err;
          }
        }
      }
    } catch (e) {
      if (e.statusCode) throw e;
      const err = new Error('認証が必要です');
      err.statusCode = 401;
      throw err;
    }
  });

  await app.register(authorizationPlugin);

  if (allowedOrigins && allowedOrigins.length > 0) {
    await app.register(csrfPlugin, { allowedOrigins });
  }

  if (auditLogRepository) {
    await app.register(auditLogPlugin, { auditLogRepository });
  }

  await app.register(healthRoutes);
  await app.register(authRoutes, { userRepository, sessionRepository, refreshTokenRepository });

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
  if (quotationService && orderService && purchaseOrderService && invoiceService && paymentService) {
    await app.register(approvalRoutes, { quotationService, orderService, purchaseOrderService, invoiceService, paymentService });
  }
  if (deliveryService) await app.register(deliveryRoutes, { deliveryService });
  if (settingsService) await app.register(settingsRoutes, { settingsService });

  if (existsSync(distPath)) {
    await app.register(fstatic, { root: distPath, wildcard: false });
    app.get('/*', (request, reply) => {
      const urlPath = request.params['*'] || '';
      const filePath = path.join(distPath, urlPath);
      if (urlPath && existsSync(filePath)) {
        return reply.sendFile(urlPath);
      }
      return reply.sendFile('index.html');
    });
  }

  return app;
}
