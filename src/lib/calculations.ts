// src/lib/calculations.ts
// This file serves as a central export point for all calculation utilities

// Export the formatters
export { formatCurrency, formatPercentage } from "./utils/formatters";

// Export the fixed calculation utilities from our new implementation
export {
  calculateMonthlyMortgagePayment,
  calculateMortgageAmortizationForMonth,
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts,
  calculateInvestmentReturnForMonth,
  calculateCapitalGainsTax,
  calculateComparison
} from "./utils/calculationEngine";

// Re-export property utilities for backward compatibility
export { getAppreciationRate } from "./utils/propertyUtils";