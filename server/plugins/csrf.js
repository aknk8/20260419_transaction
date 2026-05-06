import fp from 'fastify-plugin';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const csrfPlugin = fp(async (fastify, { allowedOrigins }) => {
  fastify.addHook('preHandler', async (request, reply) => {
    if (!MUTATING_METHODS.has(request.method)) return;

    const origin = request.headers['origin'];
    if (!origin) return; // same-origin or server-to-server: no Origin header

    if (!allowedOrigins.includes(origin)) {
      const err = new Error('CSRF: リクエスト元が許可されていません');
      err.statusCode = 403;
      throw err;
    }
  });
});
