// src/lib/utils/investmentUtils.ts

// Calculate investment return for a month
export const calculateInvestmentReturnForMonth = (
  initialAmount: number,
  monthlyContribution: number,
  annualReturnRate: number
): number => {
  const monthlyRate = Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1;
  
  // First add the contribution, then apply growth
  return (initialAmount + monthlyContribution) * (1 + monthlyRate);
};

// Calculate capital gains tax
export const calculateCapitalGainsTax = (
  costBasis: number,
  currentValue: number,
  taxRate: number
): number => {
  const gain = Math.max(0, currentValue - costBasis);
  return gain * (taxRate / 100);
};
