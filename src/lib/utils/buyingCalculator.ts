import {
  BuyingInputs,
  GeneralInputs,
  InvestmentInputs,
  MonthlyBuyingDataPoint,
  YearlyBuyingResult,
} from "../types";
import { getAppreciationRate } from "./propertyUtils";
import {
  calculateMortgageAmortizationForMonth,
} from "./mortgageUtils";
import {
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts,
} from "./propertyCostUtils";
import { calculateInvestmentReturnForMonth, calculateCapitalGainsTax } from "./investmentUtils";

interface BuyingCalculationInputs {
  general: GeneralInputs;
  buying: BuyingInputs;
  investment: InvestmentInputs;
}

interface BuyingCalculationResult {
  buyingResults: YearlyBuyingResult[];
  finalInvestmentValueAfterTax: number;
  finalHomeEquity: number;
}

export const calculateBuyingYearlyData = ({
  general,
  buying,
  investment,
}: BuyingCalculationInputs): BuyingCalculationResult => {
  const timeHorizonYears = general.timeHorizon;
  const appreciationRate = getAppreciationRate(buying) / 100;

  // Initial values
  const downPaymentAmount = buying.housePrice * (buying.downPaymentPercent / 100);
  const loanAmount = buying.housePrice - downPaymentAmount;
  const initialHomeValue = buying.housePrice;

  const buyingResults: YearlyBuyingResult[] = [];
  const monthlyBuyingData: Record<number, MonthlyBuyingDataPoint[]> = {};

  // Initialize tracking variables
  let currentHomeValue = initialHomeValue;
  let loanBalance = loanAmount;
  let initialInvestment = Math.max(0, general.currentSavings - downPaymentAmount);
  let currentYearlyIncome = general.annualIncome;

  // --- Year 0 Setup ---
  monthlyBuyingData[0] = [];
  for (let month = 1; month <= 12; month++) {
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
      amountInvested: initialInvestment,
      investmentEarnings: 0,
      yearlySavings: 0,
      investmentsWithEarnings: initialInvestment, 
      totalWealthBuying: downPaymentAmount + initialInvestment
    });
  }

  buyingResults.push({
    year: 0,
    mortgagePayment: 0,
    principalPaid: downPaymentAmount,
    interestPaid: 0,
    loanBalance,
    propertyTaxes: 0,
    homeInsurance: 0,
    maintenanceCosts: 0,
    homeValue: initialHomeValue,
    homeEquity: downPaymentAmount,
    totalWealthBuying: downPaymentAmount + initialInvestment,
    yearlyIncome: currentYearlyIncome,
    yearlySavings: 0,
    investmentsWithEarnings: initialInvestment,
    initialInvestment,
    amountInvested: initialInvestment,
    investmentEarnings: 0,
    monthlyData: monthlyBuyingData[0],
    capitalGainsTaxPaid: 0,
  });
  // --- End Year 0 Setup ---

  // Calculate for each year
  for (let year = 1; year <= timeHorizonYears; year++) {
    monthlyBuyingData[year] = [];
    let yearlyMortgagePayment = 0;
    let yearlyPrincipalPaid = 0;
    let yearlyInterestPaid = 0;
    let yearlyPropertyTaxes = 0;
    let yearlyHomeInsurance = 0;
    let yearlyMaintenanceCosts = 0;
    let yearlyLeftoverIncome = 0;
    let yearlyInvestmentEarnings = 0;

    // Get previous year's data
    const previousYear = buyingResults[year - 1];
    let currentHomeEquity = previousYear.homeEquity;
    let amountInvested = previousYear.investmentsWithEarnings; // Start with previous month's total investment value
    let investmentsWithEarnings = previousYear.investmentsWithEarnings; // Track total investment value

    for (let month = 1; month <= 12; month++) {
      const globalMonthNumber = (year - 1) * 12 + month;
      const monthlyIncome = currentYearlyIncome / 12;

      const { principalPayment, interestPayment, remainingBalance } =
        calculateMortgageAmortizationForMonth(
          loanAmount,
          buying.interestRate,
          buying.loanTerm,
          globalMonthNumber
        );

      const monthlyPropertyTaxes = calculateMonthlyPropertyTaxes(
        currentHomeValue,
        buying.propertyTaxRate
      );
      const monthlyHomeInsurance = calculateMonthlyHomeInsurance(
        currentHomeValue,
        buying.homeInsuranceRate
      );
      const monthlyMaintenanceCosts = calculateMonthlyMaintenanceCosts(
        currentHomeValue,
        buying.maintenanceCosts,
        buying.usePercentageForMaintenance
      );

      // Calculate monthly mortgage payment (principal + interest)
      const mortgagePayment = principalPayment + interestPayment;

      const monthlyExpenses = 
        mortgagePayment + 
        monthlyPropertyTaxes +
        monthlyHomeInsurance +
        monthlyMaintenanceCosts;

      // Track yearly totals
      yearlyMortgagePayment += mortgagePayment;
      yearlyPrincipalPaid += principalPayment;
      yearlyInterestPaid += interestPayment;
      yearlyPropertyTaxes += monthlyPropertyTaxes;
      yearlyHomeInsurance += monthlyHomeInsurance;
      yearlyMaintenanceCosts += monthlyMaintenanceCosts;

      const leftoverMonthlyIncome = monthlyIncome - monthlyExpenses;
      yearlyLeftoverIncome += leftoverMonthlyIncome;

      // Add new investment contributions to the total amount invested
      if (leftoverMonthlyIncome > 0) {
        amountInvested += leftoverMonthlyIncome;
      }

      // Calculate monthly investment return on current amount invested
      const monthlyReturn = calculateInvestmentReturnForMonth(
        amountInvested,
        investment.annualReturn
      );

      yearlyInvestmentEarnings += monthlyReturn;
      
      // Update total investment value (amount invested + this month's returns)
      investmentsWithEarnings = amountInvested + monthlyReturn;
      
   

      // Apply monthly home appreciation
      const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1 / 12) - 1;
      currentHomeValue *= 1 + monthlyAppreciationRate;

      // Update loan balance and home equity
      loanBalance = remainingBalance;
      currentHomeEquity = currentHomeValue - loanBalance;

      // Store monthly data point 
      monthlyBuyingData[year].push({
        month,
        homeValue: currentHomeValue,
        homeEquity: currentHomeEquity,
        loanBalance,
        monthlyIncome,
        mortgagePayment,
        principalPayment,
        interestPayment,
        propertyTaxes: monthlyPropertyTaxes,
        homeInsurance: monthlyHomeInsurance,
        maintenanceCosts: monthlyMaintenanceCosts,
        amountInvested,
        investmentEarnings: monthlyReturn,
        investmentsWithEarnings,
        yearlySavings: leftoverMonthlyIncome,
        totalWealthBuying: currentHomeEquity + investmentsWithEarnings,
      });

        // For next month, amount invested includes this month's returns (reinvestment)
        amountInvested = investmentsWithEarnings;
    } // End monthly loop

    const totalWealth = currentHomeEquity + investmentsWithEarnings;

    // Add year results
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
      homeEquity: currentHomeEquity,
      totalWealthBuying: totalWealth,
      yearlyIncome: currentYearlyIncome,
      yearlySavings: yearlyLeftoverIncome,
      investmentsWithEarnings,
      initialInvestment,
      amountInvested,
      investmentEarnings: yearlyInvestmentEarnings,
      monthlyData: monthlyBuyingData[year],
      capitalGainsTaxPaid: 0,
    });

    // Update yearly income if applicable
    if (general.incomeIncrease) {
      currentYearlyIncome *= 1 + general.annualIncomeGrowthRate / 100;
    }
  } // End yearly loop

  const finalResult = buyingResults[buyingResults.length - 1];
  
  // Calculate capital gains tax on investment earnings only
  let totalInterestPaid = 0;
  let totalMoneyInvested = 0;
  for (let i = 0; i < buyingResults.length; i++) {
    const result = buyingResults[i];
    totalInterestPaid += result.investmentEarnings;
    totalMoneyInvested += result.amountInvested;

  }

  // Calculate capital gains tax on investment earnings only
  let totalInvestmentEarnings = 0;

  for (let i = 0; i < buyingResults.length; i++) {
    const result = buyingResults[i];
    totalInvestmentEarnings += result.investmentEarnings;

  }
  const taxOwed = calculateCapitalGainsTax(
    totalInvestmentEarnings,
    investment.capitalGainsTaxRate
  );
  // Apply tax to final year results
  buyingResults[timeHorizonYears].capitalGainsTaxPaid = taxOwed;
  buyingResults[timeHorizonYears].totalWealthBuying = buyingResults[timeHorizonYears].homeEquity + buyingResults[timeHorizonYears].investmentsWithEarnings - taxOwed;
  
  const finalInvestmentValueAfterTax = buyingResults[timeHorizonYears].investmentsWithEarnings;

  return {
    buyingResults,
    finalInvestmentValueAfterTax,
    finalHomeEquity: finalResult.homeEquity
  };
};