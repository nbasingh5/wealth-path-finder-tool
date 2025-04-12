
import { 
  BuyingInputs, 
  ComparisonResults, 
  FormData, 
  YearlyBuyingResult, 
  YearlyComparison, 
  YearlyRentingResult 
} from "../types";

import { getAppreciationRate, calculateMonthlyPropertyTaxes, calculateMonthlyHomeInsurance, calculateMonthlyMaintenanceCosts } from "./propertyUtils";
import { calculateMonthlyMortgagePayment, calculateMortgageAmortizationForMonth } from "./mortgageUtils";
import { calculateInvestmentReturnForMonth, calculateCapitalGainsTax } from "./investmentUtils";

// Main calculation function
export const calculateComparison = (formData: FormData): ComparisonResults => {
  const { general, buying, renting, investment } = formData;
  const timeHorizonYears = general.timeHorizon;
  const appreciationRate = getAppreciationRate(buying) / 100;
  
  // Initial values
  const downPaymentAmount = buying.housePrice * (buying.downPaymentPercent / 100);
  const loanAmount = buying.housePrice - downPaymentAmount;
  const initialHomeValue = buying.housePrice;

  // Calculate monthly costs for buying
  const monthlyMortgagePayment = calculateMonthlyMortgagePayment(
    loanAmount,
    buying.interestRate,
    buying.loanTerm
  );
  
  let initialMonthlyPropertyTaxes = calculateMonthlyPropertyTaxes(
    initialHomeValue,
    buying.propertyTaxRate
  );
  
  let initialMonthlyHomeInsurance = calculateMonthlyHomeInsurance(
    initialHomeValue,
    buying.homeInsuranceRate
  );
  
  let initialMonthlyMaintenanceCosts = calculateMonthlyMaintenanceCosts(
    initialHomeValue,
    buying.maintenanceCosts,
    buying.usePercentageForMaintenance
  );
  
  // Array to store yearly results
  const buyingResults: YearlyBuyingResult[] = [];
  const rentingResults: YearlyRentingResult[] = [];
  const yearlyComparisons: YearlyComparison[] = [];
  
  let currentHomeValue = initialHomeValue;
  let loanBalance = loanAmount;
  let totalPrincipalPaid = 0;
  let totalInterestPaid = 0;
  
  let monthlyRent = renting.monthlyRent;
  let totalInvestment = 0;
  let rentingInvestmentValue = 0;
  let buyingInvestmentValue = 0;
  let totalCapitalGainsTaxPaid = 0;
  
  let cumulativeBuyingCosts = 0;
  let cumulativeRentingCosts = 0;
  let currentYearlyIncome = general.annualIncome;
  let monthlyIncome = currentYearlyIncome / 12;
  
  // In buying scenario, downpayment is immediately spent
  let buyingAvailableFunds = general.currentSavings - downPaymentAmount;
  let rentingAvailableFunds = general.currentSavings;
  
  // Start with year 0 (initial state)
  // Year 0 represents the starting point before any payments are made
  buyingResults.push({
    year: 0,
    mortgagePayment: 0,
    principalPaid: 0,
    interestPaid: 0,
    loanBalance: loanAmount,
    propertyTaxes: 0,
    homeInsurance: 0,
    maintenanceCosts: 0,
    homeValue: initialHomeValue,
    homeEquity: downPaymentAmount,
    totalWealth: downPaymentAmount + buyingAvailableFunds, // Home equity + available funds
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: 0, // No income spent yet in year 0
    leftoverInvestmentValue: buyingAvailableFunds
  });
  
  rentingResults.push({
    year: 0,
    totalRent: 0,
    monthlySavings: 0,
    amountInvested: 0,
    investmentValueBeforeTax: rentingAvailableFunds,
    capitalGainsTaxPaid: 0,
    investmentValueAfterTax: rentingAvailableFunds,
    totalWealth: rentingAvailableFunds,
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: 0, // No income spent yet in year 0
    leftoverInvestmentValue: rentingAvailableFunds
  });
  
  yearlyComparisons.push({
    year: 0,
    buyingWealth: downPaymentAmount + buyingAvailableFunds,
    rentingWealth: rentingAvailableFunds,
    difference: (downPaymentAmount + buyingAvailableFunds) - rentingAvailableFunds,
    cumulativeBuyingCosts: 0,
    cumulativeRentingCosts: 0,
    yearlyIncome: currentYearlyIncome,
    buyingLeftoverIncome: 0, // No income spent yet in year 0
    rentingLeftoverIncome: 0, // No income spent yet in year 0
    buyingLeftoverInvestmentValue: buyingAvailableFunds,
    rentingLeftoverInvestmentValue: rentingAvailableFunds
  });

  // Calculate for each year
  for (let year = 1; year <= timeHorizonYears; year++) {
    // Buying scenario calculations for this year
    let yearlyMortgagePayment = 0;
    let yearlyPrincipalPaid = 0;
    let yearlyInterestPaid = 0;
    let yearlyPropertyTaxes = 0;
    let yearlyHomeInsurance = 0;
    let yearlyMaintenanceCosts = 0;
    
    // Renting scenario calculations for this year
    let yearlyRent = 0;
    
    // Calculate monthly property taxes, insurance, and maintenance
    const monthlyPropertyTaxes = calculateMonthlyPropertyTaxes(currentHomeValue, buying.propertyTaxRate);
    const monthlyHomeInsurance = calculateMonthlyHomeInsurance(currentHomeValue, buying.homeInsuranceRate);
    const monthlyMaintenanceCosts = calculateMonthlyMaintenanceCosts(
      currentHomeValue, 
      buying.maintenanceCosts,
      buying.usePercentageForMaintenance
    );
    
    // Calculate the monthly housing costs for buying
    const monthlyBuyingCost = 
      monthlyMortgagePayment + 
      monthlyPropertyTaxes + 
      monthlyHomeInsurance + 
      monthlyMaintenanceCosts;
    
    // Track leftover income after housing costs
    let totalBuyingLeftoverIncome = 0;
    let totalRentingLeftoverIncome = 0;
    
    // Calculate for each month in this year
    for (let month = 1; month <= 12; month++) {
      const globalMonthNumber = (year - 1) * 12 + month;
      
      // Update monthly income for this period
      const currentMonthlyIncome = currentYearlyIncome / 12;
      
      // Mortgage amortization
      if (loanBalance > 0) {
        const { principalPayment, interestPayment, remainingBalance } = 
          calculateMortgageAmortizationForMonth(loanAmount, buying.interestRate, buying.loanTerm, globalMonthNumber);
        
        yearlyPrincipalPaid += principalPayment;
        yearlyInterestPaid += interestPayment;
        yearlyMortgagePayment += principalPayment + interestPayment;
        loanBalance = remainingBalance;
      }
      
      // Update yearly property costs
      yearlyPropertyTaxes += monthlyPropertyTaxes;
      yearlyHomeInsurance += monthlyHomeInsurance;
      yearlyMaintenanceCosts += monthlyMaintenanceCosts;
      
      // Calculate monthly leftover income for each scenario
      const buyingLeftoverMonthlyIncome = currentMonthlyIncome - monthlyBuyingCost;
      const rentingLeftoverMonthlyIncome = currentMonthlyIncome - monthlyRent;
      
      // Update cumulative costs
      cumulativeBuyingCosts += monthlyBuyingCost;
      cumulativeRentingCosts += monthlyRent;
      
      // Track rent paid
      yearlyRent += monthlyRent;
      
      // Track leftover monthly income
      totalBuyingLeftoverIncome += buyingLeftoverMonthlyIncome;
      totalRentingLeftoverIncome += rentingLeftoverMonthlyIncome;
      
      // Invest leftover income for buying scenario
      buyingInvestmentValue = calculateInvestmentReturnForMonth(
        buyingInvestmentValue, 
        Math.max(0, buyingLeftoverMonthlyIncome),
        investment.annualReturn,
        1
      );
      
      // Invest leftover income for renting scenario
      rentingInvestmentValue = calculateInvestmentReturnForMonth(
        rentingInvestmentValue,
        Math.max(0, rentingLeftoverMonthlyIncome),
        investment.annualReturn,
        1
      );
    }
    
    // Update home value based on appreciation
    currentHomeValue *= (1 + appreciationRate);
    
    // Calculate home equity
    const homeEquity = currentHomeValue - loanBalance;
    
    // Calculate capital gains tax for renting scenario
    const yearlyCapitalGainsTax = calculateCapitalGainsTax(
      general.currentSavings + totalRentingLeftoverIncome,
      rentingInvestmentValue,
      investment.capitalGainsTaxRate
    );
    
    totalCapitalGainsTaxPaid += yearlyCapitalGainsTax;
    
    // Calculate total wealth for each scenario
    const buyingWealth = homeEquity + buyingInvestmentValue;
    const rentingWealth = rentingInvestmentValue - yearlyCapitalGainsTax;
    
    // Add yearly buying result
    buyingResults.push({
      year,
      mortgagePayment: yearlyMortgagePayment,
      principalPaid: yearlyPrincipalPaid,
      interestPaid: yearlyInterestPaid,
      loanBalance,
      propertyTaxes: yearlyPropertyTaxes,
      homeInsurance: yearlyHomeInsurance,
      maintenanceCosts: yearlyMaintenanceCosts,
      homeValue: currentHomeValue,
      homeEquity,
      totalWealth: buyingWealth,
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: totalBuyingLeftoverIncome,
      leftoverInvestmentValue: buyingInvestmentValue
    });
    
    // Add yearly renting result
    rentingResults.push({
      year,
      totalRent: yearlyRent,
      monthlySavings: 0, // We're directly investing leftover income
      amountInvested: totalRentingLeftoverIncome,
      investmentValueBeforeTax: rentingInvestmentValue + yearlyCapitalGainsTax,
      capitalGainsTaxPaid: yearlyCapitalGainsTax,
      investmentValueAfterTax: rentingInvestmentValue,
      totalWealth: rentingWealth,
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: totalRentingLeftoverIncome,
      leftoverInvestmentValue: rentingInvestmentValue
    });
    
    // Add yearly comparison
    yearlyComparisons.push({
      year,
      buyingWealth,
      rentingWealth,
      difference: buyingWealth - rentingWealth,
      cumulativeBuyingCosts,
      cumulativeRentingCosts,
      yearlyIncome: currentYearlyIncome,
      buyingLeftoverIncome: totalBuyingLeftoverIncome,
      rentingLeftoverIncome: totalRentingLeftoverIncome,
      buyingLeftoverInvestmentValue: buyingInvestmentValue,
      rentingLeftoverInvestmentValue: rentingInvestmentValue
    });
    
    // Update rent for next year based on annual increase
    monthlyRent *= (1 + renting.annualRentIncrease / 100);

    // Update income for next year if income increase is enabled
    if (general.incomeIncrease) {
      currentYearlyIncome *= (1 + general.annualIncomeGrowthRate / 100);
    }
  }
  
  // Determine the better option
  const finalBuyingWealth = buyingResults[buyingResults.length - 1].totalWealth;
  const finalRentingWealth = rentingResults[rentingResults.length - 1].totalWealth;
  const difference = finalBuyingWealth - finalRentingWealth;
  let betterOption: "buying" | "renting" | "equal" = "equal";
  
  if (difference > 0) {
    betterOption = "buying";
  } else if (difference < 0) {
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
