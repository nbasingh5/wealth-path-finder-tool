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
  let investmentValue = Math.max(0, general.currentSavings - downPaymentAmount);
  let initialInvestment = investmentValue;
  let totalContributions = 0;
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
      principalPayment: 0, // Changed from downPaymentAmount to 0 since downPayment is not a monthly payment
      interestPayment: 0,
      propertyTaxes: 0,
      homeInsurance: 0,
      maintenanceCosts: 0,
      leftoverIncome: 0,
      investmentValue: 0,
      initialInvestment: 0,
      additionalContributions: 0,
      monthlySavings: 0,
      investementsWithEarnings: 0,
    });
  }

  buyingResults.push({
    year: 0,
    mortgagePayment: 0,
    principalPaid: downPaymentAmount, // This is correct for year 0 total principal
    interestPaid: 0,
    loanBalance,
    propertyTaxes: 0,
    homeInsurance: 0,
    maintenanceCosts: 0,
    homeValue: initialHomeValue,
    homeEquity: downPaymentAmount,
    totalWealthBuying: downPaymentAmount + investmentValue, // Initial wealth
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: 0,
    investementsWithEarnings: investmentValue,
    initialInvestment,
    additionalContributions: 0,
    amountInvested: investmentValue, // Initial investment
    investmentEarnings: 0,
    monthlyData: monthlyBuyingData[0],

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

    // Determine amount invested from the previous year
    const previousYear = buyingResults[year - 1];
    const amountInvested = previousYear.investementsWithEarnings;
    

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

      // Calculate monthly expenses
      const monthlyExpenses =
        interestPayment +
        monthlyPropertyTaxes +
        monthlyHomeInsurance +
        monthlyMaintenanceCosts;

      // Track yearly totals
      yearlyMortgagePayment += principalPayment + interestPayment;
      yearlyPrincipalPaid += principalPayment;
      yearlyInterestPaid += interestPayment;
      yearlyPropertyTaxes += monthlyPropertyTaxes;
      yearlyHomeInsurance += monthlyHomeInsurance;
      yearlyMaintenanceCosts += monthlyMaintenanceCosts;

      // Only subtract expenses (not principal payment) for investment calculation
      const leftoverMonthlyIncome = monthlyIncome - monthlyExpenses;
      yearlyLeftoverIncome += leftoverMonthlyIncome;

      // Track investment contributions
      if (leftoverMonthlyIncome > 0) {
        investmentValue += leftoverMonthlyIncome;
        totalContributions += leftoverMonthlyIncome;
      }

      // Calculate monthly investment return
      const monthlyReturn = calculateInvestmentReturnForMonth(
        investmentValue,
        investment.annualReturn
      );
      const investementsWithEarnings = investmentValue + monthlyReturn;
      investmentValue += monthlyReturn;
      yearlyInvestmentEarnings += monthlyReturn;

      // Update loan balance and home equity
      loanBalance = remainingBalance;
      const currentHomeEquity = currentHomeValue - Math.max(0, loanBalance);

      // Store monthly data point
      monthlyBuyingData[year].push({
        month,
        homeValue: currentHomeValue,
        homeEquity: currentHomeEquity,
        loanBalance,
        monthlyIncome,
        mortgagePayment: principalPayment + interestPayment,
        principalPayment,
        interestPayment,
        propertyTaxes: monthlyPropertyTaxes,
        homeInsurance: monthlyHomeInsurance,
        maintenanceCosts: monthlyMaintenanceCosts,
        leftoverIncome: leftoverMonthlyIncome,
        investmentValue,
        investementsWithEarnings,
        initialInvestment,
        additionalContributions: totalContributions,
        monthlySavings: leftoverMonthlyIncome,
      });

      // Apply monthly home appreciation
      const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1 / 12) - 1;
      currentHomeValue *= 1 + monthlyAppreciationRate;
    } // End monthly loop

    // Calculate home equity and investment values at year end
    const homeEquity = currentHomeValue - Math.max(0, loanBalance);
    const investmentGain = Math.max(0, investmentValue);
    
    const investementsWithEarnings = investmentValue + investmentGain;
    const totalWealth = homeEquity + investementsWithEarnings;

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
      homeEquity,
      totalWealthBuying: totalWealth,
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: yearlyLeftoverIncome,
      investementsWithEarnings,
      initialInvestment,
      additionalContributions: totalContributions,
      amountInvested: amountInvested,
      investmentEarnings: yearlyInvestmentEarnings,
      monthlyData: monthlyBuyingData[year],
    });

    // Update yearly income if applicable
    if (general.incomeIncrease) {
      currentYearlyIncome *= 1 + general.annualIncomeGrowthRate / 100;
    }
  } // End yearly loop

  const finalResult = buyingResults[buyingResults.length - 1];

  return {
      buyingResults,
      finalInvestmentValueAfterTax: finalResult.investementsWithEarnings,
      finalHomeEquity: finalResult.homeEquity
  };
};