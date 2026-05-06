import { paginateArray } from '../db/paginate.js';

export default async function paymentRoutes(fastify, { paymentService }) {
  const svc = paymentService;

  fastify.post('/api/payments/:code/cancel', { preHandler: [fastify.authenticate], config: { entityType: 'payment', action: 'CANCEL' } }, async (req) => {
    return await svc.cancelPayment(req.params.code);
  });

  fastify.get('/api/payments', { preHandler: [fastify.authenticate] }, async (req) => {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await svc.listPayments();
    return paginateArray(all, { page, limit });
  });

  fastify.get('/api/payments/:code', { preHandler: [fastify.authenticate] }, async (req) => {
    return await svc.getPaymentByCode(req.params.code);
  });

  fastify.post('/api/payments', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const payment = await svc.registerPayment(req.body);
    reply.code(201);
    return payment;
  });

  fastify.post('/api/payments/:code/submit-approval', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:apply')], config: { entityType: 'payment', action: 'SUBMIT_APPROVAL' } }, async (req) => {
    return await svc.submitPaymentApproval(req.params.code);
  });

  fastify.post('/api/payments/:code/approve', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'payment', action: 'APPROVE' } }, async (req) => {
    return await svc.approvePayment(req.params.code, req.body?.comment);
  });

  fastify.post('/api/payments/:code/reject', { preHandler: [fastify.authenticate, fastify.requirePermission('approval:act')], config: { entityType: 'payment', action: 'REJECT' } }, async (req) => {
    return await svc.rejectPayment(req.params.code, req.body?.reason);
  });

  fastify.post('/api/payments/:code/register', { preHandler: [fastify.authenticate, fastify.requirePermission('payment:edit')], config: { entityType: 'payment', action: 'REGISTER' } }, async (req) => {
    return await svc.registerPaymentResult(req.params.code);
  });
}
