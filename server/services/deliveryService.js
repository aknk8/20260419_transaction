import { createDelivery } from '../../src/delivery.js';
import { generateCode } from './sequenceService.js';

export async function listDeliveries({ repository }) {
  return repository.findAll();
}

export async function registerDelivery(formData, { repository, sequenceRepository }) {
  const code = await generateCode('delivery', { sequenceRepository });
  const delivery = createDelivery(code, formData.purchaseOrderCode, formData.deliveryDate, formData.notes ?? '');
  return repository.save({ ...delivery, code, details: formData.details || [] });
}

export async function updateDelivery(code, data, { repository }) {
  return repository.update(code, data);
}
