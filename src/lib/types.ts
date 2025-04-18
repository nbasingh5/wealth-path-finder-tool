// src/lib/types.ts - Updated with monthly data tracking and investment details
// Form Input Types
export interface GeneralInputs {
  timeHorizon: number;
  annualIncome: number;
  incomeIncrease: boolean;
  annualIncomeGrowthRate: number;
  currentSavings: number;
}

export interface BuyingInputs {
  housePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  loanType: "fixed" | "adjustable";
  propertyTaxRate: number;
  homeInsuranceRate: number;
  maintenanceCosts: number;
  usePercentageForMaintenance: boolean;
  appreciationScenario: "low" | "medium" | "high" | "custom";
  customAppreciationRate: number;
}

export interface RentingInputs {
  monthlyRent: number;
  annualRentIncrease: number;
}

export interface InvestmentInputs {
  annualReturn: number;
  capitalGainsTaxRate: number;
}

export interface FormData {
  general: GeneralInputs;
  buying: BuyingInputs;
  renting: RentingInputs;
  investment: InvestmentInputs;
}

// Monthly Data Types
export interface MonthlyBuyingDataPoint {
  month: number;
  homeValue: number;
  homeEquity: number;
  loanBalance: number;
  monthlyIncome: number;
  mortgagePayment: number;
  principalPayment: number;
  interestPayment: number;
  propertyTaxes: number;
  homeInsurance: number;
  maintenanceCosts: number;
  leftoverIncome: number;
  investmentValue: number;
  initialInvestment: number; // Added field
  additionalContributions: number; // Added field
  monthlySavings: number; // Added field
}

export interface MonthlyRentingDataPoint {
  month: number;
  monthlyIncome: number;
  rent: number;
  leftoverIncome: number;
  monthlySavings: number;
  // Investment tracking
  amountInvested: number;
  investmentEarnings: number;
  investmentValueBeforeTax: number;
  capitalGainsTax: number;
  investmentValueAfterTax: number;
  totalWealth: number;
  // Legacy fields (keeping for compatibility)
  initialInvestment: number;
  additionalContributions: number;
}

// Calculation Result Types
export interface YearlyBuyingResult {
  year: number;
  mortgagePayment: number;
  principalPaid: number;
  interestPaid: number;
  loanBalance: number;
  propertyTaxes: number;
  homeInsurance: number;
  maintenanceCosts: number;
  homeValue: number;
  homeEquity: number;
  totalWealth: number;
  yearlyIncome: number;
  leftoverIncome: number;        // Total leftover income during the year
  amountInvested: number;         // Total amount put into investments (initial + contributions)
  investmentEarnings: number;     // Earnings from investments during the year (after-tax)
  leftoverInvestmentValue: number; // End-of-year investment value (after-tax)
  initialInvestment?: number; // Added to show initial investment
  additionalContributions?: number; // Cumulative additional contributions up to this year
  monthlyData?: MonthlyBuyingDataPoint[]; // Optional for backward compatibility
}

export interface YearlyRentingResult {
  year: number;
  totalRent: number;
  monthlySavings: number; // Average monthly savings during the year
  amountInvested: number; // Total amount put into investments (initial + contributions)
  investmentValueBeforeTax: number;
  capitalGainsTaxPaid: number;
  investmentEarnings: number;     // Earnings from investments during the year (after-tax)
  investmentValueAfterTax: number; // End-of-year investment value (after-tax)
  totalWealth: number;
  yearlyIncome: number;
  leftoverIncome: number;        // Total leftover income during the year
  leftoverInvestmentValue: number; // Same as investmentValueAfterTax for consistency
  initialInvestment?: number; // Added to show initial investment
  additionalContributions?: number; // Cumulative additional contributions up to this year
  monthlyData?: MonthlyRentingDataPoint[]; // Optional for backward compatibility
  annualReturnRate: number;
  capitalGainsTaxRate: number;
}

export interface YearlyComparison {
  year: number;
  buyingWealth: number;
  rentingWealth: number;
  difference: number;
  cumulativeBuyingCosts: number;
  cumulativeRentingCosts: number;
  yearlyIncome: number;
  buyingLeftoverIncome: number;
  rentingLeftoverIncome: number;
  buyingLeftoverInvestmentValue: number;
  rentingLeftoverInvestmentValue: number;
}

export interface ComparisonResults {
  yearlyComparisons: YearlyComparison[];
  buyingResults: YearlyBuyingResult[];
  rentingResults: YearlyRentingResult[];
  summary: {
    finalBuyingWealth: number;
    finalRentingWealth: number;
    difference: number;
    betterOption: "buying" | "renting" | "equal";
  };
}