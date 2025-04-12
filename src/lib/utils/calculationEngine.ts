// src/lib/utils/calculationEngine.ts - With added monthly data tracking
import { 
  BuyingInputs, 
  ComparisonResults, 
  FormData, 
  YearlyBuyingResult, 
  YearlyComparison, 
  YearlyRentingResult,
  MonthlyBuyingDataPoint,
  MonthlyRentingDataPoint
} from "../types";

import { getAppreciationRate } from "./propertyUtils";

// Calculate monthly mortgage payment
export const calculateMonthlyMortgagePayment = (
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): number => {
  const monthlyInterestRate = interestRate / (12 * 100);
  const numberOfPayments = loanTermYears * 12;

  if (monthlyInterestRate === 0) {
    return loanAmount / numberOfPayments;
  }

  const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
  return (loanAmount * x * monthlyInterestRate) / (x - 1);
};

// Calculate mortgage amortization for a specific month
export const calculateMortgageAmortizationForMonth = (
  loanAmount: number,
  interestRate: number,
  loanTermYears: number,
  monthNumber: number
): { 
  principalPayment: number; 
  interestPayment: number; 
  remainingBalance: number;
} => {
  const monthlyInterestRate = interestRate / (12 * 100);
  const numberOfPayments = loanTermYears * 12;
  
  if (monthNumber > numberOfPayments) {
    return {
      principalPayment: 0,
      interestPayment: 0,
      remainingBalance: 0
    };
  }
  
  const monthlyPayment = calculateMonthlyMortgagePayment(
    loanAmount,
    interestRate,
    loanTermYears
  );

  // Special case for 0% interest
  if (monthlyInterestRate === 0) {
    const principalPayment = loanAmount / numberOfPayments;
    const remainingBalance = loanAmount - (principalPayment * (monthNumber - 1));
    return {
      principalPayment,
      interestPayment: 0,
      remainingBalance: Math.max(0, remainingBalance - principalPayment)
    };
  }
  
  // Calculate remaining balance before current payment
  const balanceBeforePayment = loanAmount * 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 
     Math.pow(1 + monthlyInterestRate, monthNumber - 1)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
  // Calculate interest for current payment
  const interestPayment = balanceBeforePayment * monthlyInterestRate;
  
  // Calculate principal for current payment
  const principalPayment = monthlyPayment - interestPayment;
  
  // Calculate remaining balance after payment
  const remainingBalance = balanceBeforePayment - principalPayment;
  
  return {
    principalPayment,
    interestPayment,
    remainingBalance: Math.max(0, remainingBalance)
  };
};

// Calculate monthly property taxes
export const calculateMonthlyPropertyTaxes = (
  homeValue: number,
  propertyTaxRate: number
): number => {
  return (homeValue * propertyTaxRate) / (12 * 100);
};

// Calculate monthly home insurance
export const calculateMonthlyHomeInsurance = (
  homeValue: number,
  homeInsuranceRate: number
): number => {
  return (homeValue * homeInsuranceRate) / (12 * 100);
};

// Calculate monthly maintenance costs
export const calculateMonthlyMaintenanceCosts = (
  homeValue: number,
  maintenanceCosts: number,
  usePercentageForMaintenance: boolean
): number => {
  if (usePercentageForMaintenance) {
    return (homeValue * maintenanceCosts) / (12 * 100);
  } else {
    return maintenanceCosts / 12;
  }
};

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

// Main calculation function - with enhanced monthly data tracking
export const calculateComparison = (formData: FormData): ComparisonResults => {
  const { general, buying, renting, investment } = formData;
  const timeHorizonYears = general.timeHorizon;
  const appreciationRate = getAppreciationRate(buying) / 100;
  
  // Initial values
  const downPaymentAmount = buying.housePrice * (buying.downPaymentPercent / 100);
  const loanAmount = buying.housePrice - downPaymentAmount;
  const initialHomeValue = buying.housePrice;

  // Calculate monthly mortgage payment
  const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
    loanAmount,
    buying.interestRate,
    buying.loanTerm
  );
  
  // Arrays to store results
  const buyingResults: YearlyBuyingResult[] = [];
  const rentingResults: YearlyRentingResult[] = [];
  const yearlyComparisons: YearlyComparison[] = [];
  
  // NEW: Track monthly data points for detailed breakdown
  const monthlyBuyingData: Record<number, MonthlyBuyingDataPoint[]> = {};
  const monthlyRentingData: Record<number, MonthlyRentingDataPoint[]> = {};
  
  // Initialize tracking variables
  let currentHomeValue = initialHomeValue;
  let loanBalance = loanAmount;
  
  let monthlyRent = renting.monthlyRent;
  
  // Initialize investment values and cost basis correctly
  let buyingInvestmentValue = Math.max(0, general.currentSavings - downPaymentAmount);
  let rentingInvestmentValue = general.currentSavings;
  
  // Track initial investment and additional contributions separately
  let buyingInitialInvestment = buyingInvestmentValue;
  let rentingInitialInvestment = rentingInvestmentValue;
  
  let buyingTotalContributions = 0;
  let rentingTotalContributions = 0;
  
  let currentYearlyIncome = general.annualIncome;
  
  let cumulativeBuyingCosts = 0;
  let cumulativeRentingCosts = 0;
  
  // Initialize cost basis properly
  let buyingCostBasis = buyingInvestmentValue;
  let rentingCostBasis = rentingInvestmentValue;
  
  // Track cumulative taxes paid
  let buyingCumulativeTaxesPaid = 0;
  let rentingCumulativeTaxesPaid = 0;
  
  // Add security deposit (typically 1-2 months' rent)
  const securityDeposit = monthlyRent * 1; // 1 month's rent as deposit
  
  // Adjust initial rental investment to account for security deposit
  rentingInvestmentValue -= securityDeposit;
  rentingInitialInvestment = rentingInvestmentValue;
  
  // Add renter's insurance
  const monthlyRentersInsurance = 20; // $20/month estimate
  
  // Create Year 0 monthly data (initial state)
  monthlyBuyingData[0] = [];
  monthlyRentingData[0] = [];
  
  for (let month = 1; month <= 12; month++) {
    // Year 0 is identical for all months - initial state
    monthlyBuyingData[0].push({
      month,
      homeValue: initialHomeValue,
      homeEquity: downPaymentAmount,
      loanBalance,
      monthlyIncome: currentYearlyIncome / 12,
      mortgagePayment: 0,
      principalPayment: 0,
      interestPayment: 0,
      propertyTaxes: 0,
      homeInsurance: 0,
      maintenanceCosts: 0,
      leftoverIncome: 0,
      investmentValue: buyingInvestmentValue,
      // Add these fields to monthly data
      initialInvestment: buyingInitialInvestment,
      additionalContributions: 0,
      monthlySavings: 0
    });
    
    monthlyRentingData[0].push({
      month,
      monthlyIncome: currentYearlyIncome / 12,
      rent: 0,
      rentersInsurance: 0,
      leftoverIncome: 0,
      investmentValue: rentingInvestmentValue,
      securityDeposit,
      // Add these fields to monthly data
      initialInvestment: rentingInitialInvestment,
      additionalContributions: 0,
      monthlySavings: 0
    });
  }
  
  // Start with year 0 (initial state)
  buyingResults.push({
    year: 0,
    mortgagePayment: 0,
    principalPaid: 0,
    interestPaid: 0,
    loanBalance,
    propertyTaxes: 0,
    homeInsurance: 0,
    maintenanceCosts: 0,
    homeValue: initialHomeValue,
    homeEquity: downPaymentAmount,
    totalWealth: downPaymentAmount + buyingInvestmentValue,
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: 0,
    leftoverInvestmentValue: buyingInvestmentValue,
    initialInvestment: buyingInitialInvestment, // ADDED: Show initial investment separately
    additionalContributions: 0, // ADDED: No additional contributions in year 0
    monthlyData: monthlyBuyingData[0]
  });
  
  rentingResults.push({
    year: 0,
    totalRent: 0,
    monthlySavings: 0,
    amountInvested: rentingInitialInvestment, // FIXED: Show initial investment in year 0
    investmentValueBeforeTax: rentingInvestmentValue + securityDeposit,
    capitalGainsTaxPaid: 0,
    investmentValueAfterTax: rentingInvestmentValue + securityDeposit,
    totalWealth: rentingInvestmentValue + securityDeposit,
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: 0,
    leftoverInvestmentValue: rentingInvestmentValue,
    securityDeposit,
    initialInvestment: rentingInitialInvestment, // ADDED: Show initial investment separately
    additionalContributions: 0, // ADDED: No additional contributions in year 0
    monthlyData: monthlyRentingData[0]
  });
  
  yearlyComparisons.push({
    year: 0,
    buyingWealth: downPaymentAmount + buyingInvestmentValue,
    rentingWealth: rentingInvestmentValue + securityDeposit,
    difference: (downPaymentAmount + buyingInvestmentValue) - (rentingInvestmentValue + securityDeposit),
    cumulativeBuyingCosts: 0,
    cumulativeRentingCosts: 0,
    yearlyIncome: currentYearlyIncome,
    buyingLeftoverIncome: 0,
    rentingLeftoverIncome: 0,
    buyingLeftoverInvestmentValue: buyingInvestmentValue,
    rentingLeftoverInvestmentValue: rentingInvestmentValue
  });

  // Calculate for each year
  for (let year = 1; year <= timeHorizonYears; year++) {
    // Initialize monthly data arrays for this year
    monthlyBuyingData[year] = [];
    monthlyRentingData[year] = [];
    
    // Yearly tracking variables
    let yearlyMortgagePayment = 0;
    let yearlyPrincipalPaid = 0;
    let yearlyInterestPaid = 0;
    let yearlyPropertyTaxes = 0;
    let yearlyHomeInsurance = 0;
    let yearlyMaintenanceCosts = 0;
    let yearlyRent = 0;
    let yearlyRentersInsurance = 0;
    let yearlyBuyingLeftoverIncome = 0;
    let yearlyRentingLeftoverIncome = 0;
    
    // Track actual monthly savings for more accurate reporting
    let monthlyBuyingSavings = [];
    let monthlyRentingSavings = [];
    
    // Monthly calculations
    for (let month = 1; month <= 12; month++) {
      const globalMonthNumber = (year - 1) * 12 + month;
      const monthlyIncome = currentYearlyIncome / 12;
      
      // Calculate monthly housing expenses for buying
      const { principalPayment, interestPayment, remainingBalance } = 
        calculateMortgageAmortizationForMonth(loanAmount, buying.interestRate, buying.loanTerm, globalMonthNumber);
      
      const monthlyPropertyTaxes = calculateMonthlyPropertyTaxes(currentHomeValue, buying.propertyTaxRate);
      const monthlyHomeInsurance = calculateMonthlyHomeInsurance(currentHomeValue, buying.homeInsuranceRate);
      const monthlyMaintenanceCosts = calculateMonthlyMaintenanceCosts(
        currentHomeValue, 
        buying.maintenanceCosts,
        buying.usePercentageForMaintenance
      );
      
      // Track all monthly costs
      yearlyMortgagePayment += principalPayment + interestPayment;
      yearlyPrincipalPaid += principalPayment;
      yearlyInterestPaid += interestPayment;
      yearlyPropertyTaxes += monthlyPropertyTaxes;
      yearlyHomeInsurance += monthlyHomeInsurance;
      yearlyMaintenanceCosts += monthlyMaintenanceCosts;
      yearlyRent += monthlyRent;
      yearlyRentersInsurance += monthlyRentersInsurance;
      
      // Calculate true housing expenses (excluding principal payments which are savings)
      const monthlyBuyingExpenses = 
        interestPayment + 
        monthlyPropertyTaxes + 
        monthlyHomeInsurance + 
        monthlyMaintenanceCosts;
      
      // Calculate renting expenses including renter's insurance
      const monthlyRentingExpenses = monthlyRent + monthlyRentersInsurance;
      
      // Calculate leftover income for both scenarios
      const buyingLeftoverMonthlyIncome = monthlyIncome - monthlyBuyingExpenses - principalPayment;
      const rentingLeftoverMonthlyIncome = monthlyIncome - monthlyRentingExpenses;
      
      // Store monthly savings for accurate reporting
      monthlyBuyingSavings.push(buyingLeftoverMonthlyIncome);
      monthlyRentingSavings.push(rentingLeftoverMonthlyIncome);
      
      yearlyBuyingLeftoverIncome += buyingLeftoverMonthlyIncome;
      yearlyRentingLeftoverIncome += rentingLeftoverMonthlyIncome;
      
      // Track cumulative costs (true expenses, not including principal)
      cumulativeBuyingCosts += monthlyBuyingExpenses;
      cumulativeRentingCosts += monthlyRentingExpenses;
      
      // Track contributions separately
      if (buyingLeftoverMonthlyIncome > 0) {
        buyingTotalContributions += buyingLeftoverMonthlyIncome;
      }
      
      if (rentingLeftoverMonthlyIncome > 0) {
        rentingTotalContributions += rentingLeftoverMonthlyIncome;
      }
      
      // Apply investment returns
      buyingInvestmentValue = calculateInvestmentReturnForMonth(
        buyingInvestmentValue,
        Math.max(0, buyingLeftoverMonthlyIncome),
        investment.annualReturn
      );
      
      rentingInvestmentValue = calculateInvestmentReturnForMonth(
        rentingInvestmentValue,
        Math.max(0, rentingLeftoverMonthlyIncome),
        investment.annualReturn
      );
      
      // Update loan balance
      loanBalance = remainingBalance;
      
      // Calculate home equity for this month
      const monthlyHomeEquity = currentHomeValue - Math.max(0, loanBalance);
      
      // Store monthly data points for detailed breakdown
      monthlyBuyingData[year].push({
        month,
        homeValue: currentHomeValue,
        homeEquity: monthlyHomeEquity,
        loanBalance,
        monthlyIncome,
        mortgagePayment: principalPayment + interestPayment,
        principalPayment,
        interestPayment,
        propertyTaxes: monthlyPropertyTaxes,
        homeInsurance: monthlyHomeInsurance,
        maintenanceCosts: monthlyMaintenanceCosts,
        leftoverIncome: buyingLeftoverMonthlyIncome,
        investmentValue: buyingInvestmentValue,
        // Add these fields to monthly data
        initialInvestment: buyingInitialInvestment,
        additionalContributions: buyingTotalContributions,
        monthlySavings: buyingLeftoverMonthlyIncome
      });
      
      monthlyRentingData[year].push({
        month,
        monthlyIncome,
        rent: monthlyRent,
        rentersInsurance: monthlyRentersInsurance,
        leftoverIncome: rentingLeftoverMonthlyIncome,
        investmentValue: rentingInvestmentValue,
        securityDeposit,
        // Add these fields to monthly data
        initialInvestment: rentingInitialInvestment,
        additionalContributions: rentingTotalContributions,
        monthlySavings: rentingLeftoverMonthlyIncome
      });
      
      // Apply monthly home appreciation (compound monthly)
      const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1/12) - 1;
      currentHomeValue *= (1 + monthlyAppreciationRate);
    }
    
    // Calculate home equity (home value minus remaining loan)
    const homeEquity = currentHomeValue - Math.max(0, loanBalance);
    
    // Calculate capital gains taxes more accurately
    const buyingInvestmentGain = Math.max(0, buyingInvestmentValue - buyingCostBasis);
    const rentingInvestmentGain = Math.max(0, rentingInvestmentValue - rentingCostBasis);
    
    const buyingCapitalGainsTax = buyingInvestmentGain * (investment.capitalGainsTaxRate / 100);
    const rentingCapitalGainsTax = rentingInvestmentGain * (investment.capitalGainsTaxRate / 100);
    
    // Track cumulative taxes
    buyingCumulativeTaxesPaid += buyingCapitalGainsTax;
    rentingCumulativeTaxesPaid += rentingCapitalGainsTax;
    
    // Update cost basis for next year
    buyingCostBasis = buyingInvestmentValue - buyingInvestmentGain + buyingCapitalGainsTax;
    rentingCostBasis = rentingInvestmentValue - rentingInvestmentGain + rentingCapitalGainsTax;
    
    // Calculate wealth values with and without tax implications
    const buyingWealthBeforeTax = homeEquity + buyingInvestmentValue;
    const buyingWealthAfterTax = homeEquity + (buyingInvestmentValue - buyingCapitalGainsTax);
    
    const rentingWealthBeforeTax = rentingInvestmentValue + securityDeposit;
    const rentingWealthAfterTax = rentingInvestmentValue - rentingCapitalGainsTax + securityDeposit;
    
    // Calculate true average monthly savings
    const avgMonthlyBuyingSavings = monthlyBuyingSavings.reduce((sum, val) => sum + val, 0) / 12;
    const avgMonthlyRentingSavings = monthlyRentingSavings.reduce((sum, val) => sum + val, 0) / 12;
    
    // Add yearly buying result
    buyingResults.push({
      year,
      mortgagePayment: yearlyMortgagePayment,
      principalPaid: yearlyPrincipalPaid,
      interestPaid: yearlyInterestPaid,
      loanBalance: Math.max(0, loanBalance),
      propertyTaxes: yearlyPropertyTaxes,
      homeInsurance: yearlyHomeInsurance,
      maintenanceCosts: yearlyMaintenanceCosts,
      homeValue: currentHomeValue,
      homeEquity,
      totalWealth: buyingWealthAfterTax,
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: yearlyBuyingLeftoverIncome,
      leftoverInvestmentValue: buyingInvestmentValue - buyingCapitalGainsTax,
      initialInvestment: buyingInitialInvestment, // ADDED: Show initial investment separately
      additionalContributions: buyingTotalContributions, // ADDED: Show additional contributions separately
      monthlyData: monthlyBuyingData[year]
    });
    
    // Add yearly renting result
    rentingResults.push({
      year,
      totalRent: yearlyRent,
      monthlySavings: avgMonthlyRentingSavings,
      amountInvested: rentingTotalContributions,
      investmentValueBeforeTax: rentingWealthBeforeTax,
      capitalGainsTaxPaid: rentingCapitalGainsTax,
      investmentValueAfterTax: rentingWealthAfterTax,
      totalWealth: rentingWealthAfterTax,
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: yearlyRentingLeftoverIncome,
      leftoverInvestmentValue: rentingInvestmentValue - rentingCapitalGainsTax,
      securityDeposit,
      monthlyData: monthlyRentingData[year]
    });
    
    // Add yearly comparison
    yearlyComparisons.push({
      year,
      buyingWealth: buyingWealthAfterTax,
      rentingWealth: rentingWealthAfterTax,
      difference: buyingWealthAfterTax - rentingWealthAfterTax,
      cumulativeBuyingCosts,
      cumulativeRentingCosts,
      yearlyIncome: currentYearlyIncome,
      buyingLeftoverIncome: yearlyBuyingLeftoverIncome,
      rentingLeftoverIncome: yearlyRentingLeftoverIncome,
      buyingLeftoverInvestmentValue: buyingInvestmentValue - buyingCapitalGainsTax,
      rentingLeftoverInvestmentValue: rentingInvestmentValue - rentingCapitalGainsTax
    });
    
    // Update values for next year
    monthlyRent *= (1 + renting.annualRentIncrease / 100);
    
    if (general.incomeIncrease) {
      currentYearlyIncome *= (1 + general.annualIncomeGrowthRate / 100);
    }
  }
  
  // Get final results
  const finalBuyingWealth = buyingResults[buyingResults.length - 1].totalWealth;
  const finalRentingWealth = rentingResults[rentingResults.length - 1].totalWealth;
  const difference = finalBuyingWealth - finalRentingWealth;
  
  // Determine better option with reasonable threshold
  let betterOption: "buying" | "renting" | "equal" = "equal";
  
  // Use a percentage-based threshold for large numbers
  const wealthThreshold = Math.max(finalBuyingWealth, finalRentingWealth) * 0.01; // 1% difference threshold
  
  if (difference > wealthThreshold) {
    betterOption = "buying";
  } else if (difference < -wealthThreshold) {
    betterOption = "renting";
  }
  
  // Ensure the values are valid numbers to prevent display issues
  const validatedFinalBuyingWealth = isNaN(finalBuyingWealth) ? 0 : finalBuyingWealth;
  const validatedFinalRentingWealth = isNaN(finalRentingWealth) ? 0 : finalRentingWealth;
  const validatedDifference = isNaN(difference) ? 0 : Math.abs(difference);
  
  // Return the final results with validated values
  return {
    yearlyComparisons,
    buyingResults,
    rentingResults,
    summary: {
      finalBuyingWealth: validatedFinalBuyingWealth,
      finalRentingWealth: validatedFinalRentingWealth,
      difference: validatedDifference,
      betterOption
    }
  };
};