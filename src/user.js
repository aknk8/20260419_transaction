const ADMIN_PERMISSIONS = [
  'dashboard:view',
  'master:view',
  'master:edit',
  'project:view',
  'project:edit',
  'quotation:view',
  'quotation:edit',
  'sales-order:view',
  'sales-order:edit',
  'purchase-order:view',
  'invoice:view',
  'receipt:view',
  'payment:view',
  'approval:view',
  'approval:act',
  'report:view',
  'notification:view',
  'user-permission:edit'
];

const GENERAL_PERMISSIONS = [
  'dashboard:view',
  'master:view',
  'project:view',
  'quotation:view',
  'sales-order:view',
  'purchase-order:view',
  'invoice:view',
  'approval:view',
  'notification:view'
];

function getDefaultPermissions(userType) {
  return userType === 'システム管理者'
    ? ADMIN_PERMISSIONS.slice()
    : GENERAL_PERMISSIONS.slice();
}

export function createUser(formData) {
  return {
    id: formData.id,
    password: formData.password,
    name: formData.name,
    userType: formData.userType,
    department: formData.department,
    position: formData.position,
    status: formData.status || '有効',
    permissions: getDefaultPermissions(formData.userType)
  };
}

export function findUserById(users, id) {
  return users.find(function (u) { return u.id === id; }) || null;
}
