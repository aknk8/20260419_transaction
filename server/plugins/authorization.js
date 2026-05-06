import fp from 'fastify-plugin';

export const authorizationPlugin = fp(async (fastify) => {
  fastify.decorate('requirePermission', function requirePermission(permission) {
    return async function checkPermission(request, reply) {
      const userPermissions = request.user?.permissions ?? [];
      if (!userPermissions.includes(permission)) {
        const err = new Error('権限がありません');
        err.statusCode = 403;
        throw err;
      }
    };
  });
});
