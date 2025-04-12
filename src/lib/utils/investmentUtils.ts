
// Investment related calculations

// Calculate investment return for a specific month
export const calculateInvestmentReturnForMonth = (
  initialAmount: number,
  monthlyContribution: number,
  annualReturnRate: number,
  months: number
): number => {
  const monthlyRate = Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1;
  let balance = initialAmount;
  
  for (let i = 0; i < months; i++) {
    // Add monthly contribution
    balance += monthlyContribution;
    // Apply monthly return
    balance *= (1 + monthlyRate);
  }
  
  return balance;
};

// Calculate capital gains tax
export const calculateCapitalGainsTax = (
  initialInvestment: number,
  currentValue: number,
  taxRate: number
): number => {
  const gain = currentValue - initialInvestment;
  return Math.max(0, gain * (taxRate / 100));
};
