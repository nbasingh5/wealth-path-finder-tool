// src/lib/utils/rentingCalculator.ts
import {
  RentingInputs,
  GeneralInputs,
  InvestmentInputs,
  MonthlyRentingDataPoint,
  YearlyRentingResult,
  BuyingInputs,
} from "../types";
import {
  calculateInvestmentReturnForMonth,
  calculateCapitalGainsTax,
} from "./investmentUtils";

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
  investment
}: RentingCalculationInputs): RentingCalculationResult => {
  const timeHorizonYears = general.timeHorizon;
  const rentingResults: YearlyRentingResult[] = [];
  const monthlyRentingData: Record<number, MonthlyRentingDataPoint[]> = {};
  let currentYearlyIncome = general.annualIncome;
  const monthlyIncome = currentYearlyIncome / 12;
  let monthlyRent = renting.monthlyRent;
  let rentingInvestmentValue = general.currentSavings;
  let basis = general.currentSavings;
  let rentingTotalContributions = 0;
  let rentingCumulativeTaxesPaid = 0;

  monthlyRentingData[0] = [];
  for (let month = 1; month <= 12; month++) {
    monthlyRentingData[0].push({
      month,
      monthlyIncome,
      rent: 0,
      leftoverIncome: 0,
      monthlySavings: 0,
      amountInvested: rentingInvestmentValue,
      investmentEarnings: 0,
      investmentValueBeforeTax: rentingInvestmentValue,
      capitalGainsTax: 0,
      investmentValueAfterTax: rentingInvestmentValue,
      totalWealthRenting: rentingInvestmentValue,
      initialInvestment: general.currentSavings,
      additionalContributions: 0,
    });
  }

  rentingResults.push({
    year: 0,
    totalRent: 0,
    monthlySavings: 0,
    amountInvested: general.currentSavings,
    investmentValueBeforeTax: rentingInvestmentValue,
    capitalGainsTaxPaid: 0,
    investmentValueAfterTax: rentingInvestmentValue,
    totalWealthRenting: rentingInvestmentValue,
    yearlyIncome: currentYearlyIncome,
    leftoverIncome: 0,
    leftoverInvestmentValue: rentingInvestmentValue,
    initialInvestment: general.currentSavings,
    additionalContributions: 0,
    investmentEarnings: 0,
    monthlyData: monthlyRentingData[0],
    annualReturnRate: investment.annualReturn,
    capitalGainsTaxRate: investment.capitalGainsTaxRate,
  });

  for (let year = 1; year <= timeHorizonYears; year++) {
    let totalGains = 0;
    let contributionsThisYear = 0;
    let yearlyRent = 0;
    let yearlyLeftoverIncome = 0;
    let yearlyInvested = 0 

    monthlyRentingData[year] = [];

    const previousYear = rentingResults[year - 1];
    const startOfYearBalance = previousYear.investmentValueAfterTax;
    let previousMonthInvestmentValue = startOfYearBalance;

    for (let month = 1; month <= 12; month++) {
      yearlyRent += monthlyRent;
      const leftover = monthlyIncome - monthlyRent;
      yearlyLeftoverIncome += leftover;

      if (leftover > 0) {
        rentingTotalContributions += leftover;
        contributionsThisYear += leftover;
        basis += leftover;
      }

      const amountInvested = previousMonthInvestmentValue + leftover;
      yearlyInvested = amountInvested;
      const earnings = calculateInvestmentReturnForMonth(
        amountInvested,
        investment.annualReturn
      );
      totalGains += earnings;

      const endBeforeTax =
        previousMonthInvestmentValue + earnings + Math.max(0, leftover);
      const endAfterTax = endBeforeTax;

      monthlyRentingData[year].push({
        month,
        monthlyIncome,
        rent: monthlyRent,
        leftoverIncome: leftover,
        monthlySavings: leftover,
        amountInvested: amountInvested,
        investmentEarnings: earnings,
        investmentValueBeforeTax: endBeforeTax,
        capitalGainsTax: 0,
        investmentValueAfterTax: endAfterTax,
        totalWealthRenting: endAfterTax,
        initialInvestment: previousYear.initialInvestment,
        additionalContributions: rentingTotalContributions,
      });

      previousMonthInvestmentValue = endAfterTax;
      rentingInvestmentValue = endBeforeTax;
    }

    const annualTax = 0;

    rentingCumulativeTaxesPaid += annualTax;

    const investmentValueAfterTax = rentingInvestmentValue - annualTax;
    const avgMonthlySavings = contributionsThisYear / 12;

    rentingResults.push({
      year,
      totalRent: yearlyRent,
      monthlySavings: avgMonthlySavings,
      amountInvested: yearlyInvested,
      investmentValueBeforeTax: investmentValueAfterTax,
      capitalGainsTaxPaid: annualTax,
      investmentValueAfterTax,
      totalWealthRenting: investmentValueAfterTax,
      yearlyIncome: currentYearlyIncome,
      leftoverIncome: yearlyLeftoverIncome,
      leftoverInvestmentValue: investmentValueAfterTax,
      initialInvestment: general.currentSavings,
      additionalContributions: rentingTotalContributions,
      investmentEarnings: totalGains,
      monthlyData: monthlyRentingData[year],
      annualReturnRate: investment.annualReturn,
      capitalGainsTaxRate: investment.capitalGainsTaxRate,
    });

    monthlyRent *= 1 + renting.annualRentIncrease / 100;
    if (general.incomeIncrease) {
      currentYearlyIncome *= 1 + general.annualIncomeGrowthRate / 100;
    }
  }

      const taxOwed = calculateCapitalGainsTax(
        rentingResults[timeHorizonYears].investmentEarnings,
      investment.capitalGainsTaxRate
    );
  rentingResults[timeHorizonYears].capitalGainsTaxPaid = taxOwed;
  rentingResults[timeHorizonYears].investmentValueAfterTax = rentingResults[timeHorizonYears].totalWealthRenting - taxOwed
  rentingResults[timeHorizonYears].totalWealthRenting = rentingResults[timeHorizonYears].investmentValueAfterTax
  const finalResult = rentingResults[rentingResults.length - 1];
  console.log(rentingResults

  )
  return {
    rentingResults,
    finalRentingInvestmentValueAfterTax:
      finalResult.leftoverInvestmentValue,
  };
};
