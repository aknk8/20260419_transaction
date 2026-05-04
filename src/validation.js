export function validateRequired(value, fieldName) {
  if (value === null || value === undefined) {
    return fieldName + 'は必須です。';
  }
  if (typeof value === 'string' && value.trim() === '') {
    return fieldName + 'は必須です。';
  }
  return null;
}

export function validateMaxLength(value, max, fieldName) {
  if (typeof value === 'string' && value.length > max) {
    return fieldName + 'は' + max + '文字以内で入力してください。';
  }
  return null;
}

export function validateUnique(value, existingValues, fieldName) {
  if (existingValues.indexOf(value) >= 0) {
    return fieldName + 'はすでに使用されています。';
  }
  return null;
}

export function validateForm(formData, rules) {
  const errors = {};
  const fields = Object.keys(rules);
  fields.forEach(function (field) {
    const fieldRules = rules[field];
    let error = null;
    for (let i = 0; i < fieldRules.length; i++) {
      const rule = fieldRules[i];
      if (rule.type === 'required') {
        error = validateRequired(formData[field], rule.fieldName);
      } else if (rule.type === 'maxLength') {
        error = validateMaxLength(formData[field], rule.max, rule.fieldName);
      } else if (rule.type === 'unique') {
        error = validateUnique(formData[field], rule.existingValues, rule.fieldName);
      }
      if (error !== null) break;
    }
    errors[field] = error;
  });
  return errors;
}
