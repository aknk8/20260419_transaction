import { generateProductCode, createProduct } from '../../src/product.js';

function notFound(code) {
  const err = new Error(`商品コード ${code} は存在しません`);
  err.statusCode = 404;
  return err;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

export async function listProducts({ repository }) {
  return repository.findAll();
}

export async function getProductByCode(code, { repository }) {
  const product = await repository.findByCode(code);
  if (!product) throw notFound(code);
  return product;
}

export async function registerProduct(formData, { repository }) {
  if (!formData.name || !formData.name.trim()) {
    throw validationError('商品名は必須です');
  }
  const existingCodes = await repository.findAllCodes();
  const code = generateProductCode(existingCodes);
  const product = createProduct({ ...formData, code });
  return repository.save(product);
}

export async function updateProduct(code, data, { repository }) {
  const existing = await repository.findByCode(code);
  if (!existing) throw notFound(code);
  return repository.update(code, data);
}
