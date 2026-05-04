export function generateCode(prefix, existingCodes) {
  const re = new RegExp('^' + prefix + '-(\\d+)$');
  const nums = existingCodes
    .map(function (code) {
      const match = code.match(re);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(function (n) { return n > 0; });
  const max = nums.length > 0 ? Math.max.apply(null, nums) : 0;
  return prefix + '-' + String(max + 1).padStart(3, '0');
}

export function generateCustomerCode(existingCodes) {
  return generateCode('CUS', existingCodes);
}

export function generateSupplierCode(existingCodes) {
  return generateCode('SUP', existingCodes);
}

export function findCustomerByCode(customers, code) {
  return customers.find(function (c) { return c.code === code; }) || null;
}

export function findSupplierByCode(suppliers, code) {
  return suppliers.find(function (s) { return s.code === code; }) || null;
}

export function createCustomer(formData) {
  return {
    code: formData.code,
    name: formData.name,
    department: formData.department,
    contact: formData.contact,
    closingDay: formData.closingDay,
    paymentSite: formData.paymentSite,
    billingTo: formData.billingTo,
    status: formData.status
  };
}

export function filterCustomersByName(customers, keyword) {
  if (!keyword || !keyword.trim()) return customers;
  const lower = keyword.toLowerCase();
  return customers.filter(function (c) {
    return c.name.toLowerCase().indexOf(lower) >= 0 ||
           c.code.toLowerCase().indexOf(lower) >= 0;
  });
}

export function createSupplier(formData) {
  return {
    code: formData.code,
    name: formData.name,
    contact: formData.contact,
    paymentSite: formData.paymentSite,
    status: formData.status
  };
}
