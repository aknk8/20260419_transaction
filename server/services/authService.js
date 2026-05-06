const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

const ADMIN_PERMISSIONS = [
  'dashboard:view', 'master:view', 'master:edit',
  'project:view', 'project:edit',
  'quotation:view', 'quotation:edit',
  'sales-order:view', 'sales-order:edit',
  'purchase-order:view', 'purchase-order:edit',
  'delivery:view', 'delivery:edit',
  'invoice:view', 'invoice:edit',
  'receipt:view', 'receipt:edit',
  'payment:view', 'payment:edit',
  'approval:view', 'approval:apply', 'approval:act',
  'report:view', 'notification:view',
  'user-permission:edit', 'settings:view', 'settings:edit'
];

const DEFAULT_PERMISSIONS = [
  'dashboard:view', 'master:view',
  'project:view', 'quotation:view', 'sales-order:view',
  'purchase-order:view', 'delivery:view', 'invoice:view',
  'receipt:view', 'payment:view',
  'approval:view', 'approval:apply', 'notification:view'
];

export function getPermissionsForUserType(userType) {
  if (userType === 'システム管理者') return ADMIN_PERMISSIONS;
  return DEFAULT_PERMISSIONS;
}

/**
 * @param {string} username
 * @param {string} password
 * @param {{ findUser, comparePassword, updateLoginState? }} deps
 */
export async function authenticate(username, password, { findUser, comparePassword, updateLoginState }) {
  const user = await findUser(username);
  if (!user) throw new Error('ユーザ名またはパスワードが正しくありません');

  if (user.status && user.status !== '有効') {
    throw new Error('ユーザ名またはパスワードが正しくありません');
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    throw new Error('ユーザ名またはパスワードが正しくありません');
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    if (updateLoginState) {
      const newCount = (user.failedLoginCount ?? 0) + 1;
      const lockedUntil = newCount >= LOCK_THRESHOLD
        ? new Date(Date.now() + LOCK_DURATION_MS)
        : null;
      await updateLoginState(user.id, { failedLoginCount: newCount, lockedUntil });
    }
    throw new Error('ユーザ名またはパスワードが正しくありません');
  }

  if (updateLoginState && (user.failedLoginCount > 0 || user.lockedUntil)) {
    await updateLoginState(user.id, { failedLoginCount: 0, lockedUntil: null });
  }

  return {
    id: user.id,
    name: user.name,
    userType: user.userType,
    permissions: getPermissionsForUserType(user.userType)
  };
}
