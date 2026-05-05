/**
 * @param {string} username
 * @param {string} password
 * @param {{ findUser: (username: string) => Promise<object|null>, comparePassword: (plain: string, hash: string) => Promise<boolean> }} deps
 */
export async function authenticate(username, password, { findUser, comparePassword }) {
  const user = await findUser(username);
  if (!user) throw new Error('ユーザが見つかりません');

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) throw new Error('パスワードが正しくありません');

  return {
    id: user.id,
    name: user.name,
    userType: user.userType
  };
}
