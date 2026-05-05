import { generateDeliveryCode, createDelivery } from '../../src/delivery.js';

export async function listDeliveries({ repository }) {
  return repository.findAll();
}

export async function registerDelivery(formData, { repository }) {
  const existingCodes = await repository.findAllCodes();
  const code = generateDeliveryCode(existingCodes);
  const delivery = createDelivery(code, formData.purchaseOrderCode, formData.deliveryDate, formData.notes ?? '');
  return repository.save({ ...delivery, code });
}

export async function updateDelivery(code, data, { repository }) {
  return repository.update(code, data);
}
