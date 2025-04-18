// src/lib/utils/buyingCalculator.ts
import {
  BuyingInputs,
  GeneralInputs,
  InvestmentInputs,
  MonthlyBuyingDataPoint,
  YearlyBuyingResult,
} from "../types";
import { getAppreciationRate } from "./propertyUtils";
import {
  calculateMonthlyMortgagePayment,
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
  finalBuyingInvestmentValueAfterTax: number;
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
  let buyingInvestmentValue = Math.max(0, general.currentSavings - downPaymentAmount);
  let buyingInitialInvestment = buyingInvestmentValue;
  let buyingTotalContributions = 0;
  let currentYearlyIncome = general.annualIncome;
  let buyingCostBasis = buyingInvestmentValue;
  let buyingCumulativeTaxesPaid = 0; // Not strictly needed for buying results but helps consistency

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
      leftoverIncome: 0,
      investmentValue: buyingInvestmentValue,
      initialInvestment: buyingInitialInvestment,
      additionalContributions: 0,
      monthlySavings: 0,
    });
  }

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
    totalWealth: downPaymentAmount + buyingInvestmentValue, // Initial wealth
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: 0,
    leftoverInvestmentValue: buyingInvestmentValue,
    initialInvestment: buyingInitialInvestment,
    additionalContributions: 0,
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
    let yearlyBuyingLeftoverIncome = 0;
    let monthlyBuyingSavings: number[] = [];

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

      yearlyMortgagePayment += principalPayment + interestPayment;
      yearlyPrincipalPaid += principalPayment;
      yearlyInterestPaid += interestPayment;
      yearlyPropertyTaxes += monthlyPropertyTaxes;
      yearlyHomeInsurance += monthlyHomeInsurance;
      yearlyMaintenanceCosts += monthlyMaintenanceCosts;

      const monthlyBuyingExpenses =
        interestPayment +
        monthlyPropertyTaxes +
        monthlyHomeInsurance +
        monthlyMaintenanceCosts;

      const buyingLeftoverMonthlyIncome =
        monthlyIncome - monthlyBuyingExpenses - principalPayment;

      monthlyBuyingSavings.push(buyingLeftoverMonthlyIncome);
      yearlyBuyingLeftoverIncome += buyingLeftoverMonthlyIncome;

      if (buyingLeftoverMonthlyIncome > 0) {
        buyingTotalContributions += buyingLeftoverMonthlyIncome;
      }

      buyingInvestmentValue = calculateInvestmentReturnForMonth(
        buyingInvestmentValue,
        Math.max(0, buyingLeftoverMonthlyIncome),
        investment.annualReturn
      );

      loanBalance = remainingBalance;
      const monthlyHomeEquity = currentHomeValue - Math.max(0, loanBalance);

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
        initialInvestment: buyingInitialInvestment,
        additionalContributions: buyingTotalContributions,
        monthlySavings: buyingLeftoverMonthlyIncome,
      });

      // Apply monthly home appreciation (compound monthly)
      const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1 / 12) - 1;
      currentHomeValue *= 1 + monthlyAppreciationRate;
    } // End monthly loop

    const homeEquity = currentHomeValue - Math.max(0, loanBalance);
    const buyingInvestmentGain = Math.max(0, buyingInvestmentValue - buyingCostBasis);
    const buyingCapitalGainsTax = calculateCapitalGainsTax(
        buyingCostBasis, buyingInvestmentValue, investment.capitalGainsTaxRate
    );

    buyingCumulativeTaxesPaid += buyingCapitalGainsTax; // Track cumulative tax (optional here)
    buyingCostBasis = buyingInvestmentValue - buyingInvestmentGain + buyingCapitalGainsTax; // Update cost basis for next year

    const buyingInvestmentValueAfterTax = buyingInvestmentValue - buyingCapitalGainsTax;
    const totalBuyingWealthAfterTax = homeEquity + buyingInvestmentValueAfterTax;

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
      totalWealth: totalBuyingWealthAfterTax, // Use wealth after tax
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: yearlyBuyingLeftoverIncome,
      leftoverInvestmentValue: buyingInvestmentValueAfterTax,
      initialInvestment: buyingInitialInvestment,
      additionalContributions: buyingTotalContributions,
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
      finalBuyingInvestmentValueAfterTax: finalResult.leftoverInvestmentValue,
      finalHomeEquity: finalResult.homeEquity
  };
};

