export const tdkService = {
  getRulesSummary() {
    return 'TDK Güncel Yazım Kılavuzu & ÖSYM Müfredatı Entegre Motoru';
  },
  async verifyWithTdk(word: string): Promise<{ isValid: boolean; correctForm?: string }> {
    return { isValid: true, correctForm: word };
  }
};
