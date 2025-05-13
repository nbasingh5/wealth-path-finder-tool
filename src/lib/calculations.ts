// src/lib/calculations.ts
// This file serves as a central export point for all calculation utilities

// Export the formatters
export { formatCurrency, formatPercentage } from "./utils/formatters";

// Export the mortgage utilities
export {
  calculateMonthlyMortgagePayment,
  calculateMortgageAmortizationForMonth,
} from "./utils/mortgageUtils";

// Export property cost utilities
export {
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts,
} from "./utils/propertyCostUtils";

// Export investment utilities
export {
  calculateInvestmentReturnForMonth,
  calculateCapitalGainsTax,
} from "./utils/investmentUtils";

// Export the main comparison engine and related calculations
export { 
  calculateComparison, 
  calculateMonthlyValue,
  calculateAbsoluteDifference
} from "./utils/calculationEngine";

// Re-export property utilities (like appreciation)
export { getAppreciationRate } from "./utils/propertyUtils";
