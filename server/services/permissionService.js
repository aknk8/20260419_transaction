const PERMISSIONS_BY_USER_TYPE = {
  'システム管理者': [
    'dashboard:view', 'master:view', 'master:edit',
    'project:view', 'project:edit',
    'quotation:view', 'quotation:edit',
    'sales-order:view', 'sales-order:edit',
    'purchase-order:view', 'purchase-order:edit',
    'delivery:view', 'delivery:edit',
    'invoice:view', 'invoice:edit',
    'receipt:view', 'receipt:edit',
    'payment:view', 'payment:edit',
    'approval:view', 'approval:act', 'approval:apply',
    'report:view', 'notification:view',
    'user-permission:edit',
    'settings:view', 'settings:edit'
  ]
};

const DEFAULT_PERMISSIONS = [
  'dashboard:view', 'master:view',
  'project:view', 'project:edit',
  'quotation:view', 'quotation:edit',
  'sales-order:view', 'sales-order:edit',
  'purchase-order:view', 'purchase-order:edit',
  'delivery:view', 'delivery:edit',
  'invoice:view',
  'receipt:view',
  'payment:view',
  'approval:view', 'approval:apply',
  'notification:view'
];

export function getPermissionsForUserType(userType) {
  return PERMISSIONS_BY_USER_TYPE[userType] ?? DEFAULT_PERMISSIONS;
}
