export default async function projectRoutes(fastify, { projectService }) {
  fastify.get('/api/projects', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return projectService.listProjects({ repository: request.projectRepository });
  });

  fastify.get('/api/projects/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      return await projectService.getProjectByCode(request.params.code, {
        repository: request.projectRepository
      });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.post('/api/projects', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const project = await projectService.registerProject(request.body, {
        repository: request.projectRepository
      });
      reply.code(201).send(project);
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });

  fastify.patch('/api/projects/:code', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      return await projectService.updateProject(request.params.code, request.body, {
        repository: request.projectRepository
      });
    } catch (err) {
      reply.code(err.statusCode ?? 500).send({ error: { message: err.message } });
    }
  });
}
