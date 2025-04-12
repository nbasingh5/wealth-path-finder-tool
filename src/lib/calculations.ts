
// This file now serves as a simple re-export from the modular utilities

export {
  // formatters
  formatCurrency,
  formatPercentage,
  
  // propertyUtils
  getAppreciationRate,
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts,
  
  // mortgageUtils
  calculateMonthlyMortgagePayment,
  calculateMortgageAmortizationForMonth,
  
  // investmentUtils
  calculateInvestmentReturnForMonth,
  calculateCapitalGainsTax,
  
  // calculationEngine
  calculateComparison
} from './utils/index';

