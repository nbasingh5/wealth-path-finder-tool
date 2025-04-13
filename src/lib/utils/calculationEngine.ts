
// src/lib/utils/calculationEngine.ts - With monthly calculation approach
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

// Main calculation function with monthly approach
export const calculateComparison = (formData: FormData): ComparisonResults => {
  const { general, buying, renting, investment } = formData;
  const timeHorizonYears = general.timeHorizon;
  const totalMonths = timeHorizonYears * 12;
  const appreciationRate = getAppreciationRate(buying) / 100;
  
  // Initial values
  const downPaymentAmount = buying.housePrice * (buying.downPaymentPercent / 100);
  const loanAmount = buying.housePrice - downPaymentAmount;
  const initialHomeValue = buying.housePrice;
  const monthlyIncome = general.annualIncome / 12;

  // Arrays to store results
  const buyingResults: YearlyBuyingResult[] = [];
  const rentingResults: YearlyRentingResult[] = [];
  const yearlyComparisons: YearlyComparison[] = [];
  
  // Track monthly data points
  const monthlyBuyingData: Record<number, MonthlyBuyingDataPoint[]> = {};
  const monthlyRentingData: Record<number, MonthlyRentingDataPoint[]> = {};
  
  // Initialize tracking variables
  let currentHomeValue = initialHomeValue;
  let loanBalance = loanAmount;
  let currentMonthlyIncome = monthlyIncome;
  let currentMonthlyRent = renting.monthlyRent;
  
  // Initialize investment values
  let buyingInvestmentValue = Math.max(0, general.currentSavings - downPaymentAmount);
  let rentingInvestmentValue = general.currentSavings;
  
  // Track initial investment separately
  let buyingInitialInvestment = buyingInvestmentValue;
  let rentingInitialInvestment = rentingInvestmentValue;
  
  // Track contributions 
  let buyingTotalContributions = 0;
  let rentingTotalContributions = 0;

  // Create Year 0 state (Initial state before any payments)
  // This represents the starting point
  buyingResults.push({
    year: 0,
    mortgagePayment: 0,
    principalPaid: 0,
    interestPaid: 0,
    loanBalance: loanBalance,
    propertyTaxes: 0,
    homeInsurance: 0,
    maintenanceCosts: 0,
    homeValue: initialHomeValue,
    homeEquity: downPaymentAmount,
    totalWealth: downPaymentAmount + buyingInvestmentValue,
    yearlyIncome: general.annualIncome,
    leftoverIncome: 0,
    leftoverInvestmentValue: buyingInvestmentValue,
    initialInvestment: buyingInitialInvestment,
    additionalContributions: 0,
    monthlyData: []
  });
  
  rentingResults.push({
    year: 0,
    totalRent: 0,
    monthlySavings: 0,
    amountInvested: rentingInitialInvestment,
    investmentValueBeforeTax: rentingInvestmentValue,
    capitalGainsTaxPaid: 0,
    investmentValueAfterTax: rentingInvestmentValue,
    totalWealth: rentingInvestmentValue,
    yearlyIncome: general.annualIncome,
    leftoverIncome: 0,
    leftoverInvestmentValue: rentingInvestmentValue,
    initialInvestment: rentingInitialInvestment,
    additionalContributions: 0,
    monthlyData: []
  });
  
  yearlyComparisons.push({
    year: 0,
    buyingWealth: downPaymentAmount + buyingInvestmentValue,
    rentingWealth: rentingInvestmentValue,
    difference: (downPaymentAmount + buyingInvestmentValue) - rentingInvestmentValue,
    cumulativeBuyingCosts: 0,
    cumulativeRentingCosts: 0,
    yearlyIncome: general.annualIncome,
    buyingLeftoverIncome: 0,
    rentingLeftoverIncome: 0,
    buyingLeftoverInvestmentValue: buyingInvestmentValue,
    rentingLeftoverInvestmentValue: rentingInvestmentValue
  });
  
  // Monthly expenses trackers
  let cumulativeBuyingCosts = 0;
  let cumulativeRentingCosts = 0;
  
  // Initialize cost basis for tax calculations
  let buyingCostBasis = buyingInvestmentValue;
  let rentingCostBasis = rentingInvestmentValue;
  
  // Monthly renter's insurance
  const monthlyRentersInsurance = 20; // $20/month estimate

  // Start simulation month by month
  for (let currentMonth = 1; currentMonth <= totalMonths; currentMonth++) {
    // Calculate what year we're in (0-indexed)
    const currentYear = Math.floor((currentMonth - 1) / 12) + 1;
    // Calculate month within the current year (1-12)
    const monthInYear = ((currentMonth - 1) % 12) + 1;
    
    // Initialize monthly data arrays if it's the first month of a year
    if (monthInYear === 1) {
      monthlyBuyingData[currentYear] = [];
      monthlyRentingData[currentYear] = [];
      
      // Add yearly trackers if we're starting a new year
      if (currentYear > 1) {
        const previousYearBuying = buyingResults[currentYear - 1];
        const previousYearRenting = rentingResults[currentYear - 1];
        
        // Add new year entries with previous year's end values
        buyingResults.push({
          year: currentYear,
          mortgagePayment: 0,
          principalPaid: 0,
          interestPaid: 0,
          loanBalance,
          propertyTaxes: 0,
          homeInsurance: 0,
          maintenanceCosts: 0,
          homeValue: currentHomeValue,
          homeEquity: currentHomeValue - loanBalance,
          totalWealth: (currentHomeValue - loanBalance) + buyingInvestmentValue,
          yearlyIncome: currentMonthlyIncome * 12,
          leftoverIncome: 0,
          leftoverInvestmentValue: buyingInvestmentValue,
          initialInvestment: buyingInitialInvestment,
          additionalContributions: buyingTotalContributions,
          monthlyData: []
        });
        
        rentingResults.push({
          year: currentYear,
          totalRent: 0,
          monthlySavings: 0,
          amountInvested: rentingTotalContributions + rentingInitialInvestment,
          investmentValueBeforeTax: rentingInvestmentValue,
          capitalGainsTaxPaid: 0,
          investmentValueAfterTax: rentingInvestmentValue,
          totalWealth: rentingInvestmentValue,
          yearlyIncome: currentMonthlyIncome * 12,
          leftoverIncome: 0,
          leftoverInvestmentValue: rentingInvestmentValue,
          initialInvestment: rentingInitialInvestment,
          additionalContributions: rentingTotalContributions,
          monthlyData: []
        });
        
        yearlyComparisons.push({
          year: currentYear,
          buyingWealth: (currentHomeValue - loanBalance) + buyingInvestmentValue,
          rentingWealth: rentingInvestmentValue,
          difference: ((currentHomeValue - loanBalance) + buyingInvestmentValue) - rentingInvestmentValue,
          cumulativeBuyingCosts,
          cumulativeRentingCosts,
          yearlyIncome: currentMonthlyIncome * 12,
          buyingLeftoverIncome: 0,
          rentingLeftoverIncome: 0,
          buyingLeftoverInvestmentValue: buyingInvestmentValue,
          rentingLeftoverInvestmentValue: rentingInvestmentValue
        });
      }
    }
    
    // Calculate mortgage payment for this month
    const { principalPayment, interestPayment, remainingBalance } = 
      calculateMortgageAmortizationForMonth(
        loanAmount, 
        buying.interestRate, 
        buying.loanTerm, 
        currentMonth
      );
    
    // Calculate monthly expenses for buying
    const monthlyPropertyTaxes = calculateMonthlyPropertyTaxes(currentHomeValue, buying.propertyTaxRate);
    const monthlyHomeInsurance = calculateMonthlyHomeInsurance(currentHomeValue, buying.homeInsuranceRate);
    const monthlyMaintenanceCosts = calculateMonthlyMaintenanceCosts(
      currentHomeValue,
      buying.maintenanceCosts,
      buying.usePercentageForMaintenance
    );
    
    // Calculate monthly housing expenses (excluding principal payments)
    const monthlyBuyingExpenses = 
      interestPayment + 
      monthlyPropertyTaxes + 
      monthlyHomeInsurance + 
      monthlyMaintenanceCosts;
    
    const monthlyRentingExpenses = currentMonthlyRent + monthlyRentersInsurance;
    
    // Calculate leftover income for both scenarios
    const buyingLeftoverMonthlyIncome = Math.max(0, currentMonthlyIncome - (monthlyBuyingExpenses + principalPayment));
    const rentingLeftoverMonthlyIncome = Math.max(0, currentMonthlyIncome - monthlyRentingExpenses);
    
    // Track contributions
    buyingTotalContributions += buyingLeftoverMonthlyIncome;
    rentingTotalContributions += rentingLeftoverMonthlyIncome;
    
    // Track expenses (true expenses, not including principal)
    cumulativeBuyingCosts += monthlyBuyingExpenses;
    cumulativeRentingCosts += monthlyRentingExpenses;
    
    // Apply investment returns
    buyingInvestmentValue = calculateInvestmentReturnForMonth(
      buyingInvestmentValue,
      buyingLeftoverMonthlyIncome,
      investment.annualReturn
    );
    
    rentingInvestmentValue = calculateInvestmentReturnForMonth(
      rentingInvestmentValue,
      rentingLeftoverMonthlyIncome,
      investment.annualReturn
    );
    
    // Update loan balance
    loanBalance = remainingBalance;
    
    // Calculate home equity
    const monthlyHomeEquity = currentHomeValue - Math.max(0, loanBalance);
    
    // Store monthly data points for detailed breakdown
    monthlyBuyingData[currentYear].push({
      month: monthInYear,
      homeValue: currentHomeValue,
      homeEquity: monthlyHomeEquity,
      loanBalance,
      monthlyIncome: currentMonthlyIncome,
      mortgagePayment: principalPayment + interestPayment,
      principalPayment,
      interestPayment,
      propertyTaxes: monthlyPropertyTaxes,
      homeInsurance: monthlyHomeInsurance,
      maintenanceCosts: monthlyMaintenanceCosts,
      leftoverIncome: buyingLeftoverMonthlyIncome,
      investmentValue: buyingInvestmentValue,
      initialInvestment: buyingInitialInvestment,
      additionalContributions: buyingTotalContributions,
      monthlySavings: buyingLeftoverMonthlyIncome
    });
    
    monthlyRentingData[currentYear].push({
      month: monthInYear,
      monthlyIncome: currentMonthlyIncome,
      rent: currentMonthlyRent,
      rentersInsurance: monthlyRentersInsurance,
      leftoverIncome: rentingLeftoverMonthlyIncome,
      investmentValue: rentingInvestmentValue,
      initialInvestment: rentingInitialInvestment,
      additionalContributions: rentingTotalContributions,
      monthlySavings: rentingLeftoverMonthlyIncome
    });
    
    // Update current year results with monthly data
    buyingResults[currentYear].monthlyData = monthlyBuyingData[currentYear];
    rentingResults[currentYear].monthlyData = monthlyRentingData[currentYear];
    
    // Update yearly tracking totals
    buyingResults[currentYear].mortgagePayment += (principalPayment + interestPayment);
    buyingResults[currentYear].principalPaid += principalPayment;
    buyingResults[currentYear].interestPaid += interestPayment;
    buyingResults[currentYear].propertyTaxes += monthlyPropertyTaxes;
    buyingResults[currentYear].homeInsurance += monthlyHomeInsurance;
    buyingResults[currentYear].maintenanceCosts += monthlyMaintenanceCosts;
    buyingResults[currentYear].leftoverIncome += buyingLeftoverMonthlyIncome;
    
    rentingResults[currentYear].totalRent += currentMonthlyRent;
    rentingResults[currentYear].leftoverIncome += rentingLeftoverMonthlyIncome;
    rentingResults[currentYear].monthlySavings = 
      (rentingResults[currentYear].monthlySavings * (monthInYear - 1) + rentingLeftoverMonthlyIncome) / monthInYear;
    
    // Update wealth totals at the end of each month
    buyingResults[currentYear].homeValue = currentHomeValue;
    buyingResults[currentYear].homeEquity = monthlyHomeEquity;
    buyingResults[currentYear].loanBalance = loanBalance;
    buyingResults[currentYear].leftoverInvestmentValue = buyingInvestmentValue;
    buyingResults[currentYear].totalWealth = monthlyHomeEquity + buyingInvestmentValue;
    
    rentingResults[currentYear].leftoverInvestmentValue = rentingInvestmentValue;
    rentingResults[currentYear].investmentValueBeforeTax = rentingInvestmentValue;
    rentingResults[currentYear].investmentValueAfterTax = rentingInvestmentValue;
    rentingResults[currentYear].totalWealth = rentingInvestmentValue;
    
    // Update comparison values
    yearlyComparisons[currentYear].buyingWealth = monthlyHomeEquity + buyingInvestmentValue;
    yearlyComparisons[currentYear].rentingWealth = rentingInvestmentValue;
    yearlyComparisons[currentYear].difference = (monthlyHomeEquity + buyingInvestmentValue) - rentingInvestmentValue;
    yearlyComparisons[currentYear].buyingLeftoverIncome += buyingLeftoverMonthlyIncome;
    yearlyComparisons[currentYear].rentingLeftoverIncome += rentingLeftoverMonthlyIncome;
    yearlyComparisons[currentYear].buyingLeftoverInvestmentValue = buyingInvestmentValue;
    yearlyComparisons[currentYear].rentingLeftoverInvestmentValue = rentingInvestmentValue;
    
    // Apply monthly home appreciation
    const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1/12) - 1;
    currentHomeValue *= (1 + monthlyAppreciationRate);
    
    // Increase monthly rent if it's the first month of a new year (after year 1)
    if (monthInYear === 1 && currentYear > 1) {
      currentMonthlyRent *= (1 + renting.annualRentIncrease / 100);
      
      // Update income if income increases are enabled
      if (general.incomeIncrease) {
        const annualIncomeGrowthRate = general.annualIncomeGrowthRate / 100;
        currentMonthlyIncome *= (1 + annualIncomeGrowthRate);
      }
    }
  }
  
  // Final tax calculations for final year
  // This would be for liquidation to get true after-tax wealth
  const finalYear = timeHorizonYears;
  
  // Calculate capital gains taxes for final values
  const buyingInvestmentGain = Math.max(0, buyingInvestmentValue - buyingCostBasis);
  const rentingInvestmentGain = Math.max(0, rentingInvestmentValue - rentingCostBasis);
  
  const buyingCapitalGainsTax = buyingInvestmentGain * (investment.capitalGainsTaxRate / 100);
  const rentingCapitalGainsTax = rentingInvestmentGain * (investment.capitalGainsTaxRate / 100);
  
  // Apply tax to final values
  const buyingAfterTaxInvestmentValue = buyingInvestmentValue - buyingCapitalGainsTax;
  const rentingAfterTaxInvestmentValue = rentingInvestmentValue - rentingCapitalGainsTax;
  
  // Update final year with tax results
  buyingResults[finalYear].leftoverInvestmentValue = buyingAfterTaxInvestmentValue;
  buyingResults[finalYear].totalWealth = buyingResults[finalYear].homeEquity + buyingAfterTaxInvestmentValue;
  buyingResults[finalYear].additionalContributions = buyingTotalContributions;
  
  rentingResults[finalYear].capitalGainsTaxPaid = rentingCapitalGainsTax;
  rentingResults[finalYear].investmentValueAfterTax = rentingAfterTaxInvestmentValue;
  rentingResults[finalYear].totalWealth = rentingAfterTaxInvestmentValue;
  rentingResults[finalYear].additionalContributions = rentingTotalContributions;
  
  // Update final comparison
  yearlyComparisons[finalYear].buyingWealth = buyingResults[finalYear].totalWealth;
  yearlyComparisons[finalYear].rentingWealth = rentingResults[finalYear].totalWealth;
  yearlyComparisons[finalYear].difference = buyingResults[finalYear].totalWealth - rentingResults[finalYear].totalWealth;
  
  // Determine better option with threshold
  const finalBuyingWealth = buyingResults[finalYear].totalWealth;
  const finalRentingWealth = rentingResults[finalYear].totalWealth;
  const difference = finalBuyingWealth - finalRentingWealth;
  
  // Use a percentage-based threshold for large numbers (1% of higher value)
  const wealthThreshold = Math.max(finalBuyingWealth, finalRentingWealth) * 0.01;
  let betterOption: "buying" | "renting" | "equal" = "equal";
  
  if (difference > wealthThreshold) {
    betterOption = "buying";
  } else if (difference < -wealthThreshold) {
    betterOption = "renting";
  }
  
  return {
    yearlyComparisons,
    buyingResults,
    rentingResults,
    summary: {
      finalBuyingWealth,
      finalRentingWealth,
      difference: Math.abs(difference),
      betterOption
    }
  };
};
