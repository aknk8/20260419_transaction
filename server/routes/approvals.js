import * as approvalService from '../services/approvalService.js';

export default async function approvalRoutes(fastify, { quotationService, orderService, purchaseOrderService, invoiceService, paymentService }) {
  const services = () => ({ quotationService, orderService, purchaseOrderService, invoiceService, paymentService });

  fastify.get('/api/approvals', { preHandler: [fastify.authenticate] }, async (req) => {
    const docTypeFilter = req.query.docType ?? null;
    return approvalService.listPendingApprovals(docTypeFilter, services());
  });

  fastify.post('/api/approvals/:code/approve', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const comment = req.body?.comment ?? '';
      return await approvalService.approveDocument(req.params.code, comment, services());
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/approvals/:code/reject', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    try {
      const reason = req.body?.reason ?? '';
      return await approvalService.rejectDocument(req.params.code, reason, services());
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
