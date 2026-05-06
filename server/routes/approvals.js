import * as approvalService from '../services/approvalService.js';
import { paginateArray } from '../db/paginate.js';

export default async function approvalRoutes(fastify, { quotationService, orderService, purchaseOrderService, invoiceService, paymentService }) {
  const services = () => ({ quotationService, orderService, purchaseOrderService, invoiceService, paymentService });

  fastify.get('/api/approvals', { preHandler: [fastify.authenticate] }, async (req) => {
    const docTypeFilter = req.query.docType ?? null;
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '20', 10);
    const all = await approvalService.listPendingApprovals(docTypeFilter, services());
    return paginateArray(all, { page, limit });
  });

  fastify.post('/api/approvals/:code/approve', { preHandler: [fastify.authenticate] }, async (req) => {
    const comment = req.body?.comment ?? '';
    return await approvalService.approveDocument(req.params.code, comment, services());
  });

  fastify.post('/api/approvals/:code/reject', { preHandler: [fastify.authenticate] }, async (req) => {
    const reason = req.body?.reason ?? '';
    return await approvalService.rejectDocument(req.params.code, reason, services());
  });
}
