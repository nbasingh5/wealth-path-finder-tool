
// Investment related calculations

// Calculate investment return for a specific month
export const calculateInvestmentReturnForMonth = (
  initialAmount: number,
  monthlyContribution: number,
  annualReturnRate: number
): number => {
  const monthlyRate = Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1;
  
  // First add the contribution, then apply growth
  return (initialAmount + monthlyContribution) * (1 + monthlyRate);
};

// Calculate investment return for multiple months
export const calculateInvestmentReturnForPeriod = (
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
  const gain = Math.max(0, currentValue - initialInvestment);
  return gain * (taxRate / 100);
};

// Calculate investment earnings (returns only, not including contributions)
// This ensures we never return negative values which wouldn't make sense for earnings
export const calculateInvestmentEarnings = (
  previousValue: number,
  currentValue: number,
  contributionAmount: number
): number => {
  return Math.max(0, currentValue - (previousValue + contributionAmount));
};
