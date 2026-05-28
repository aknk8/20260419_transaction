const DEFAULTS = {
  name: '株式会社サンプル商事',
  address: '',
  phone: '',
  fiscalEndMonth: 12,
  presidentApprovalProfitRateThreshold: 30,
  presidentApprovalAmountThreshold: 10000000,
  approvalStaleDays: 3
};

export function createSettingsRepository(initialSettings = {}) {
  let current = { ...DEFAULTS, ...initialSettings };

  return {
    reset() { current = { ...DEFAULTS, ...initialSettings }; },
    async findOne() {
      return { ...current };
    },

    async update(data) {
      current = { ...current, ...data };
      return { ...current };
    }
  };
}
