// src/lib/utils/rentingCalculator.ts
import {
  RentingInputs,
  GeneralInputs,
  InvestmentInputs,
  MonthlyRentingDataPoint,
  YearlyRentingResult,
} from "../types";
import { calculateInvestmentReturnForMonth, calculateCapitalGainsTax } from "./investmentUtils";

interface RentingCalculationInputs {
  general: GeneralInputs;
  renting: RentingInputs;
  investment: InvestmentInputs;
}

interface RentingCalculationResult {
  rentingResults: YearlyRentingResult[];
  finalRentingInvestmentValueAfterTax: number;
}

export const calculateRentingYearlyData = ({
  general,
  renting,
  investment,
}: RentingCalculationInputs): RentingCalculationResult => {
  const timeHorizonYears = general.timeHorizon;

  // Initial values
  const rentingResults: YearlyRentingResult[] = [];
  const monthlyRentingData: Record<number, MonthlyRentingDataPoint[]> = {};

  // Initialize tracking variables
  let monthlyRent = renting.monthlyRent;
  let rentingInvestmentValue = general.currentSavings; // Start with full savings
  let rentingInitialInvestment = rentingInvestmentValue;
  let rentingTotalContributions = 0;
  let currentYearlyIncome = general.annualIncome;
  let rentingCostBasis = rentingInvestmentValue;
  let rentingCumulativeTaxesPaid = 0; // Not strictly needed for renting results but helps consistency
  const monthlyRentersInsurance = 20; // $20/month estimate

  // --- Year 0 Setup ---
  monthlyRentingData[0] = [];
  for (let month = 1; month <= 12; month++) {
    monthlyRentingData[0].push({
      month,
      monthlyIncome: currentYearlyIncome / 12,
      rent: 0,
      rentersInsurance: 0,
      leftoverIncome: 0,
      investmentValue: rentingInvestmentValue,
      initialInvestment: rentingInitialInvestment,
      additionalContributions: 0,
      monthlySavings: 0,
    });
  }

  rentingResults.push({
    year: 0,
    totalRent: 0,
    monthlySavings: 0,
    amountInvested: rentingInitialInvestment,
    investmentValueBeforeTax: rentingInvestmentValue,
    capitalGainsTaxPaid: 0,
    investmentValueAfterTax: rentingInvestmentValue,
    totalWealth: rentingInvestmentValue, // Initial wealth
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: 0,
    leftoverInvestmentValue: rentingInvestmentValue,
    initialInvestment: rentingInitialInvestment,
    additionalContributions: 0,
    monthlyData: monthlyRentingData[0],
  });
  // --- End Year 0 Setup ---

  // Calculate for each year
  for (let year = 1; year <= timeHorizonYears; year++) {
    monthlyRentingData[year] = [];
    let yearlyRent = 0;
    let yearlyRentersInsurance = 0;
    let yearlyRentingLeftoverIncome = 0;
    let monthlyRentingSavings: number[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthlyIncome = currentYearlyIncome / 12;

      yearlyRent += monthlyRent;
      yearlyRentersInsurance += monthlyRentersInsurance;

      const monthlyRentingExpenses = monthlyRent + monthlyRentersInsurance;
      const rentingLeftoverMonthlyIncome = monthlyIncome - monthlyRentingExpenses;

      monthlyRentingSavings.push(rentingLeftoverMonthlyIncome);
      yearlyRentingLeftoverIncome += rentingLeftoverMonthlyIncome;

      if (rentingLeftoverMonthlyIncome > 0) {
        rentingTotalContributions += rentingLeftoverMonthlyIncome;
      }

      rentingInvestmentValue = calculateInvestmentReturnForMonth(
        rentingInvestmentValue,
        Math.max(0, rentingLeftoverMonthlyIncome),
        investment.annualReturn
      );

      monthlyRentingData[year].push({
        month,
        monthlyIncome,
        rent: monthlyRent,
        rentersInsurance: monthlyRentersInsurance,
        leftoverIncome: rentingLeftoverMonthlyIncome,
        investmentValue: rentingInvestmentValue,
        initialInvestment: rentingInitialInvestment,
        additionalContributions: rentingTotalContributions,
        monthlySavings: rentingLeftoverMonthlyIncome,
      });

    } // End monthly loop

    const rentingInvestmentGain = Math.max(0, rentingInvestmentValue - rentingCostBasis);
    const rentingCapitalGainsTax = calculateCapitalGainsTax(
        rentingCostBasis, rentingInvestmentValue, investment.capitalGainsTaxRate
    );

    rentingCumulativeTaxesPaid += rentingCapitalGainsTax; // Track cumulative tax (optional here)
    rentingCostBasis = rentingInvestmentValue - rentingInvestmentGain + rentingCapitalGainsTax; // Update cost basis for next year

    const rentingInvestmentValueAfterTax = rentingInvestmentValue - rentingCapitalGainsTax;
    const totalRentingWealthAfterTax = rentingInvestmentValueAfterTax;
    const avgMonthlyRentingSavings = monthlyRentingSavings.reduce((sum, val) => sum + val, 0) / 12;


    rentingResults.push({
      year,
      totalRent: yearlyRent,
      monthlySavings: avgMonthlyRentingSavings,
      amountInvested: rentingTotalContributions, // Reflects only additional contributions during the simulation years
      investmentValueBeforeTax: rentingInvestmentValue,
      capitalGainsTaxPaid: rentingCapitalGainsTax,
      investmentValueAfterTax: rentingInvestmentValueAfterTax,
      totalWealth: totalRentingWealthAfterTax, // Use wealth after tax
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: yearlyRentingLeftoverIncome,
      leftoverInvestmentValue: rentingInvestmentValueAfterTax,
      initialInvestment: rentingInitialInvestment,
      additionalContributions: rentingTotalContributions,
      monthlyData: monthlyRentingData[year],
    });

    // Update rent and income for next year
    monthlyRent *= 1 + renting.annualRentIncrease / 100;
    if (general.incomeIncrease) {
      currentYearlyIncome *= 1 + general.annualIncomeGrowthRate / 100;
    }
  } // End yearly loop

  const finalResult = rentingResults[rentingResults.length - 1];

  return {
      rentingResults,
      finalRentingInvestmentValueAfterTax: finalResult.leftoverInvestmentValue
  };
};
