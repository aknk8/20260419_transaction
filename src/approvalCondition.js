export function validateApprovalConditionSettings(profitRate, amount, staleDays) {
  var errors = {};
  if (typeof profitRate !== 'number' || isNaN(profitRate) || !Number.isInteger(profitRate) || profitRate < 0 || profitRate > 100) {
    errors.profitRate = '利益率は0〜100の整数で入力してください';
  }
  if (typeof amount !== 'number' || isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
    errors.amount = '金額は1以上の整数で入力してください';
  }
  if (typeof staleDays !== 'number' || isNaN(staleDays) || !Number.isInteger(staleDays) || staleDays <= 0) {
    errors.staleDays = '滞留判定日数は1以上の整数で入力してください';
  }
  return errors;
}

export function buildApprovalConditionSettings(profitRate, amount, staleDays) {
  return {
    presidentApprovalProfitRateThreshold: profitRate,
    presidentApprovalAmountThreshold: amount,
    approvalStaleDays: staleDays
  };
}
