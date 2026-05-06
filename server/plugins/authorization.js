import fp from 'fastify-plugin';

export const authorizationPlugin = fp(async (fastify) => {
  fastify.decorate('requirePermission', function requirePermission(permission) {
    return async function checkPermission(request, reply) {
      const userPermissions = request.user?.permissions ?? [];
      if (!userPermissions.includes(permission)) {
        reply.code(403).send({ error: { message: '権限がありません' } });
      }
    };
  });
});
