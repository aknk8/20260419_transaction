const DEFAULTS = {
  name: '',
  address: '',
  phone: '',
  fiscalEndMonth: 3,
  presidentApprovalProfitRateThreshold: 30,
  presidentApprovalAmountThreshold: 10000000,
  approvalStaleDays: 3
};

export function createSettingsRepository(initialSettings = {}) {
  let current = { ...DEFAULTS, ...initialSettings };

  return {
    async findOne() {
      return { ...current };
    },

    async update(data) {
      current = { ...current, ...data };
      return { ...current };
    }
  };
}
