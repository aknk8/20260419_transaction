import { generateCustomerCode, createCustomer } from '../../src/customer.js';

function notFound(code) {
  const err = new Error(`顧客コード ${code} は存在しません`);
  err.statusCode = 404;
  return err;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

export async function listCustomers({ repository }) {
  return repository.findAll();
}

export async function getCustomerByCode(code, { repository }) {
  const customer = await repository.findByCode(code);
  if (!customer) throw notFound(code);
  return customer;
}

export async function registerCustomer(formData, { repository }) {
  if (!formData.name || !formData.name.trim()) {
    throw validationError('顧客名は必須です');
  }
  const existingCodes = await repository.findAllCodes();
  const code = generateCustomerCode(existingCodes);
  const customer = createCustomer({ ...formData, code });
  return repository.save(customer);
}

export async function updateCustomer(code, data, { repository }) {
  const existing = await repository.findByCode(code);
  if (!existing) throw notFound(code);
  return repository.update(code, data);
}
