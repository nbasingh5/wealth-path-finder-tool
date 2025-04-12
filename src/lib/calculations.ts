
import { 
  BuyingInputs, 
  ComparisonResults, 
  FormData, 
  GeneralInputs,
  InvestmentInputs, 
  RentingInputs, 
  YearlyBuyingResult, 
  YearlyComparison, 
  YearlyRentingResult 
} from "./types";

// Get the actual appreciation rate based on the scenario
export const getAppreciationRate = (buying: BuyingInputs): number => {
  switch (buying.appreciationScenario) {
    case "low":
      return 2;
    case "medium":
      return 4;
    case "high":
      return 6;
    case "custom":
      return buying.customAppreciationRate;
    default:
      return 3;
  }
};

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

// Calculate monthly home maintenance costs
export const calculateMonthlyMaintenanceCosts = (
  homeValue: number,
  maintenanceCosts: number,
  usePercentage: boolean
): number => {
  if (usePercentage) {
    return (homeValue * maintenanceCosts) / (12 * 100);
  } else {
    return maintenanceCosts / 12;
  }
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
  const monthlyPayment = calculateMonthlyMortgagePayment(
    loanAmount,
    interestRate,
    loanTermYears
  );
  
  let balance = loanAmount;
  
  // Calculate to the current month
  for (let i = 1; i <= monthNumber; i++) {
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    balance -= principalPayment;
    
    if (i === monthNumber) {
      return {
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(0, balance), // No negative balances
      };
    }
  }
  
  // Default return if month not reached
  return {
    principalPayment: 0,
    interestPayment: 0,
    remainingBalance: loanAmount,
  };
};

// Calculate investment return for a specific month
export const calculateInvestmentReturnForMonth = (
  initialAmount: number,
  monthlyContribution: number,
  annualReturnRate: number,
  months: number
): number => {
  const monthlyRate = Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1;
  let balance = initialAmount;
  
  for (let i = 0; i < months; i++) {
    // Add monthly contribution
    balance += monthlyContribution;
    // Apply monthly return
    balance *= (1 + monthlyRate);
  }
  
  return balance;
};

// Calculate capital gains tax
export const calculateCapitalGainsTax = (
  initialInvestment: number,
  currentValue: number,
  taxRate: number
): number => {
  const gain = currentValue - initialInvestment;
  return Math.max(0, gain * (taxRate / 100));
};

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
  let currentInvestmentValue = 0; // Will add current savings in year 0
  let totalRentingInvestmentValue = 0; // Will add current savings in year 0
  let totalCapitalGainsTaxPaid = 0;
  
  let cumulativeBuyingCosts = 0;
  let cumulativeRentingCosts = 0;
  let currentYearlyIncome = general.annualIncome;
  
  // In buying scenario, downpayment is immediately spent
  let buyingAvailableFunds = general.currentSavings - downPaymentAmount;
  
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
    totalWealth: downPaymentAmount + buyingAvailableFunds,
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: currentYearlyIncome,
    leftoverInvestmentValue: buyingAvailableFunds
  });
  
  rentingResults.push({
    year: 0,
    totalRent: 0,
    monthlySavings: 0,
    amountInvested: 0,
    investmentValueBeforeTax: general.currentSavings,
    capitalGainsTaxPaid: 0,
    investmentValueAfterTax: general.currentSavings,
    totalWealth: general.currentSavings,
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: currentYearlyIncome,
    leftoverInvestmentValue: general.currentSavings
  });
  
  yearlyComparisons.push({
    year: 0,
    buyingWealth: downPaymentAmount + buyingAvailableFunds,
    rentingWealth: general.currentSavings,
    difference: (downPaymentAmount + buyingAvailableFunds) - general.currentSavings,
    cumulativeBuyingCosts: 0,
    cumulativeRentingCosts: 0,
    yearlyIncome: currentYearlyIncome,
    buyingLeftoverIncome: currentYearlyIncome,
    rentingLeftoverIncome: currentYearlyIncome,
    buyingLeftoverInvestmentValue: buyingAvailableFunds,
    rentingLeftoverInvestmentValue: general.currentSavings
  });

  // Track leftover investments separately
  let buyingLeftoverInvestmentValue = buyingAvailableFunds;
  let rentingLeftoverInvestmentValue = general.currentSavings;
  
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
    let yearlyInvestment = 0;
    
    // Calculate monthly property taxes, insurance, and maintenance
    const monthlyPropertyTaxes = calculateMonthlyPropertyTaxes(currentHomeValue, buying.propertyTaxRate);
    const monthlyHomeInsurance = calculateMonthlyHomeInsurance(currentHomeValue, buying.homeInsuranceRate);
    const monthlyMaintenanceCosts = calculateMonthlyMaintenanceCosts(
      currentHomeValue, 
      buying.maintenanceCosts,
      buying.usePercentageForMaintenance
    );
    
    // Calculate the monthly difference between buying and renting costs
    const monthlyBuyingCost = 
      monthlyMortgagePayment + 
      monthlyPropertyTaxes + 
      monthlyHomeInsurance + 
      monthlyMaintenanceCosts;
    
    const monthlySavings = monthlyBuyingCost - monthlyRent;
    const monthlyIncome = currentYearlyIncome / 12;
    
    // Track leftover income after housing costs
    let buyingLeftoverMonthlyIncome = monthlyIncome - monthlyBuyingCost;
    let rentingLeftoverMonthlyIncome = monthlyIncome - monthlyRent;
    let totalBuyingLeftoverIncome = 0;
    let totalRentingLeftoverIncome = 0;
    
    // Calculate for each month in this year
    for (let month = 1; month <= 12; month++) {
      const globalMonthNumber = (year - 1) * 12 + month;
      
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
      
      // Update cumulative buying costs
      cumulativeBuyingCosts += monthlyMortgagePayment + 
        monthlyPropertyTaxes + monthlyHomeInsurance + monthlyMaintenanceCosts;
      
      // Track rent paid
      yearlyRent += monthlyRent;
      cumulativeRentingCosts += monthlyRent;
      
      // For renting scenario, invest the savings
      if (monthlySavings > 0) {
        yearlyInvestment += monthlySavings;
        totalInvestment += monthlySavings;
      }
      
      // Track leftover monthly income
      totalBuyingLeftoverIncome += buyingLeftoverMonthlyIncome;
      totalRentingLeftoverIncome += rentingLeftoverMonthlyIncome;
      
      // Invest leftover income
      buyingLeftoverInvestmentValue = calculateInvestmentReturnForMonth(
        buyingLeftoverInvestmentValue,
        Math.max(0, buyingLeftoverMonthlyIncome), // Don't allow negative investments
        investment.annualReturn,
        1
      );
      
      rentingLeftoverInvestmentValue = calculateInvestmentReturnForMonth(
        rentingLeftoverInvestmentValue,
        Math.max(0, rentingLeftoverMonthlyIncome), // Don't allow negative investments
        investment.annualReturn,
        1
      );
      
      // Update investment value for renting scenario
      totalRentingInvestmentValue = calculateInvestmentReturnForMonth(
        totalRentingInvestmentValue,
        monthlySavings,
        investment.annualReturn,
        1
      );
      
      // Update investment value for buying scenario (with any remaining funds)
      buyingAvailableFunds = calculateInvestmentReturnForMonth(
        buyingAvailableFunds,
        0, // No monthly contribution for buying scenario
        investment.annualReturn,
        1
      );
    }
    
    // Update home value based on appreciation
    currentHomeValue *= (1 + appreciationRate);
    
    // Calculate home equity
    const homeEquity = currentHomeValue - loanBalance;
    
    // Calculate total wealth for buying (home equity + available funds + leftover investment)
    const buyingWealth = homeEquity + buyingAvailableFunds;
    
    // Calculate capital gains tax for renting scenario
    const yearlyCapitalGainsTax = calculateCapitalGainsTax(
      general.currentSavings + totalInvestment,
      totalRentingInvestmentValue + rentingLeftoverInvestmentValue,
      investment.capitalGainsTaxRate
    );
    
    totalCapitalGainsTaxPaid += yearlyCapitalGainsTax;
    
    // Calculate total wealth for renting (investment value after tax)
    const investmentValueAfterTax = totalRentingInvestmentValue + rentingLeftoverInvestmentValue - yearlyCapitalGainsTax;
    const rentingWealth = investmentValueAfterTax;
    
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
      totalWealth: buyingWealth + buyingLeftoverInvestmentValue,
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: totalBuyingLeftoverIncome,
      leftoverInvestmentValue: buyingLeftoverInvestmentValue
    });
    
    // Add yearly renting result
    rentingResults.push({
      year,
      totalRent: yearlyRent,
      monthlySavings,
      amountInvested: yearlyInvestment,
      investmentValueBeforeTax: totalRentingInvestmentValue,
      capitalGainsTaxPaid: yearlyCapitalGainsTax,
      investmentValueAfterTax: totalRentingInvestmentValue - yearlyCapitalGainsTax,
      totalWealth: rentingWealth,
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: totalRentingLeftoverIncome,
      leftoverInvestmentValue: rentingLeftoverInvestmentValue
    });
    
    // Add yearly comparison
    yearlyComparisons.push({
      year,
      buyingWealth: buyingWealth + buyingLeftoverInvestmentValue,
      rentingWealth,
      difference: (buyingWealth + buyingLeftoverInvestmentValue) - rentingWealth,
      cumulativeBuyingCosts,
      cumulativeRentingCosts,
      yearlyIncome: currentYearlyIncome,
      buyingLeftoverIncome: totalBuyingLeftoverIncome,
      rentingLeftoverIncome: totalRentingLeftoverIncome,
      buyingLeftoverInvestmentValue: buyingLeftoverInvestmentValue,
      rentingLeftoverInvestmentValue: rentingLeftoverInvestmentValue
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

// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format percentages
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
