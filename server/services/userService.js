function notFound(id) {
  const err = new Error(`ユーザ ID ${id} は存在しません`);
  err.statusCode = 404;
  return err;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function stripHash({ passwordHash, ...rest }) {
  return rest;
}

export async function listUsers({ repository }) {
  const users = await repository.findAll();
  return users.map(stripHash);
}

export async function getUserById(id, { repository }) {
  const user = await repository.findById(id);
  if (!user) throw notFound(id);
  return stripHash(user);
}

export async function registerUser(formData, { repository, hashPassword }) {
  if (!formData.id || !formData.id.trim()) throw validationError('ユーザIDは必須です');
  if (!formData.name || !formData.name.trim()) throw validationError('ユーザ名は必須です');
  if (!formData.password || !formData.password.trim()) throw validationError('パスワードは必須です');

  const passwordHash = await hashPassword(formData.password);
  const { password, ...rest } = formData;
  const user = { ...rest, passwordHash };
  const saved = await repository.save(user);
  return stripHash(saved);
}

export async function updateUser(id, data, { repository, hashPassword }) {
  const existing = await repository.findById(id);
  if (!existing) throw notFound(id);

  const updateData = { ...data };
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
    delete updateData.password;
  }
  const updated = await repository.update(id, updateData);
  return stripHash(updated);
}
