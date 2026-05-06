export default async function projectRoutes(fastify, { projectService }) {
  fastify.get('/api/projects', {
    preHandler: [fastify.authenticate]
  }, async () => {
    return projectService.listProjects();
  });

  fastify.get('/api/projects/:code', {
    preHandler: [fastify.authenticate]
  }, async (request) => {
    return await projectService.getProjectByCode(request.params.code);
  });

  fastify.post('/api/projects', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const project = await projectService.registerProject(request.body);
    reply.code(201);
    return project;
  });

  fastify.patch('/api/projects/:code', {
    preHandler: [fastify.authenticate]
  }, async (request) => {
    return await projectService.updateProject(request.params.code, request.body);
  });
}
