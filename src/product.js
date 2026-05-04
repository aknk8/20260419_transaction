import { generateCode } from './customer.js';

export function generateProductCode(existingCodes) {
  return generateCode('PRD', existingCodes);
}

export function findProductByCode(products, code) {
  return products.find(function (p) { return p.code === code; }) || null;
}

export function createProduct(formData) {
  return {
    code: formData.code,
    name: formData.name,
    unit: formData.unit,
    unitPrice: formData.unitPrice,
    tax: formData.tax,
    status: formData.status
  };
}
