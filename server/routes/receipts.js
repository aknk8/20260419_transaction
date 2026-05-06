export default async function receiptRoutes(fastify, { receiptService }) {
  fastify.get('/api/receipts', { preHandler: [fastify.authenticate] }, async () => {
    return receiptService.listReceipts();
  });

  fastify.post('/api/receipts', { preHandler: [fastify.authenticate] }, async (req, reply) => {
    const receipt = await receiptService.registerReceipt(req.body);
    reply.code(201);
    return receipt;
  });
}
