export function validatePassword(password) {
  if (password.length < 8) {
    throw new Error('パスワードは8文字以上で入力してください');
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('パスワードは小文字を1文字以上含めてください');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('パスワードは大文字を1文字以上含めてください');
  }
  if (!/\d/.test(password)) {
    throw new Error('パスワードは数字を1文字以上含めてください');
  }
}
