import { generateSupplierCode, createSupplier } from '../../src/customer.js';

function notFound(code) {
  const err = new Error(`仕入先コード ${code} は存在しません`);
  err.statusCode = 404;
  return err;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

export async function listSuppliers({ repository }) {
  return repository.findAll();
}

export async function getSupplierByCode(code, { repository }) {
  const supplier = await repository.findByCode(code);
  if (!supplier) throw notFound(code);
  return supplier;
}

export async function registerSupplier(formData, { repository }) {
  if (!formData.name || !formData.name.trim()) {
    throw validationError('仕入先名は必須です');
  }
  const existingCodes = await repository.findAllCodes();
  const code = generateSupplierCode(existingCodes);
  const supplier = createSupplier({ ...formData, code });
  return repository.save(supplier);
}

export async function updateSupplier(code, data, { repository }) {
  const existing = await repository.findByCode(code);
  if (!existing) throw notFound(code);
  return repository.update(code, data);
}
