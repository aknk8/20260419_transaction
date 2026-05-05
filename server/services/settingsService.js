export async function getSettings({ repository }) {
  return repository.findOne();
}

export async function updateSettings(data, { repository }) {
  return repository.update(data);
}
