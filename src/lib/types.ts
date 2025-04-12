// src/lib/types.ts - Updated with monthly data tracking
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
  rentersInsurance: number;
  leftoverIncome: number;
  investmentValue: number;
  securityDeposit: number;
  initialInvestment: number; // Added field
  additionalContributions: number; // Added field
  monthlySavings: number; // Added field
}

// For simplicity in the interface, use specific types rather than a union type
// (removed MonthlyDataPoint union type that was causing the type error)

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
  leftoverIncome: number;
  leftoverInvestmentValue: number;
  initialInvestment?: number; // Added to show initial investment
  additionalContributions?: number; // Added to show new contributions
  monthlyData?: MonthlyBuyingDataPoint[]; // Optional for backward compatibility
}

export interface YearlyRentingResult {
  year: number;
  totalRent: number;
  monthlySavings: number;
  amountInvested: number;
  investmentValueBeforeTax: number;
  capitalGainsTaxPaid: number;
  investmentValueAfterTax: number;
  totalWealth: number;
  yearlyIncome: number;
  leftoverIncome: number;
  leftoverInvestmentValue: number;
  securityDeposit?: number; // Optional for backward compatibility
  initialInvestment?: number; // Added to show initial investment
  additionalContributions?: number; // Added to show new contributions
  monthlyData?: MonthlyRentingDataPoint[]; // Optional for backward compatibility
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