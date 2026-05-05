import { generateProjectCode, createProject } from '../../src/project.js';

function notFound(code) {
  const err = new Error(`案件コード ${code} は存在しません`);
  err.statusCode = 404;
  return err;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

export async function listProjects({ repository }) {
  return repository.findAll();
}

export async function getProjectByCode(code, { repository }) {
  const project = await repository.findByCode(code);
  if (!project) throw notFound(code);
  return project;
}

export async function registerProject(formData, { repository }) {
  if (!formData.name || !formData.name.trim()) {
    throw validationError('案件名は必須です');
  }
  const existingCodes = await repository.findAllCodes();
  const code = generateProjectCode(existingCodes);
  const project = createProject({ ...formData, code });
  return repository.save(project);
}

export async function updateProject(code, data, { repository }) {
  const existing = await repository.findByCode(code);
  if (!existing) throw notFound(code);
  return repository.update(code, data);
}
