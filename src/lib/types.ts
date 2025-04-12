
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
}

export interface YearlyComparison {
  year: number;
  buyingWealth: number;
  rentingWealth: number;
  difference: number;
  cumulativeBuyingCosts: number;
  cumulativeRentingCosts: number;
  yearlyIncome: number;
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
