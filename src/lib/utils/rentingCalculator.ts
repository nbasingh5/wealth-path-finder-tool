// src/lib/utils/rentingCalculator.ts
import {
  RentingInputs,
  GeneralInputs,
  InvestmentInputs,
  MonthlyRentingDataPoint,
  YearlyRentingResult,
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
      yearlySavings: 0,
      amountInvested: rentingInvestmentValue,
      investmentEarnings: 0,
      investmentValueBeforeTax: rentingInvestmentValue,
      capitalGainsTax: 0,
  
      totalWealthRenting: rentingInvestmentValue,
      initialInvestment: general.currentSavings,
      additionalContributions: 0,
    });
  }

  rentingResults.push({
    year: 0,
    totalRent: 0,
    yearlySavings: 0,
    amountInvested: general.currentSavings,
    investmentValueBeforeTax: rentingInvestmentValue,
    capitalGainsTaxPaid: 0,
    totalWealthRenting: rentingInvestmentValue,
    yearlyIncome: currentYearlyIncome,
    investmentsWithEarnings: rentingInvestmentValue,
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
    const startOfYearBalance = previousYear.investmentValueBeforeTax;
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
        yearlySavings: leftover,
        amountInvested: amountInvested,
        investmentEarnings: earnings,
        investmentValueBeforeTax: endBeforeTax,
        capitalGainsTax: 0,
        totalWealthRenting: endAfterTax,
        initialInvestment: previousYear.initialInvestment,
        additionalContributions: rentingTotalContributions,
      });

      previousMonthInvestmentValue = endAfterTax;
      rentingInvestmentValue = endBeforeTax;
    }

    rentingResults.push({
      year,
      totalRent: yearlyRent,
      amountInvested: yearlyInvested,
      investmentValueBeforeTax: rentingInvestmentValue,
      capitalGainsTaxPaid: 0,
      totalWealthRenting: rentingInvestmentValue,
      yearlyIncome: currentYearlyIncome,
      yearlySavings: yearlyLeftoverIncome,
      investmentsWithEarnings: rentingInvestmentValue,
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

    // Calculate capital gains tax on investment earnings only
    let totalInvestmentEarnings = 0;

    for (let i = 0; i < rentingResults.length; i++) {
      const result = rentingResults[i];
      totalInvestmentEarnings += result.investmentEarnings;

    }
    const taxOwed = calculateCapitalGainsTax(
      totalInvestmentEarnings,
      investment.capitalGainsTaxRate
    );


  rentingResults[timeHorizonYears].capitalGainsTaxPaid = taxOwed;
  rentingResults[timeHorizonYears].totalWealthRenting =  rentingResults[timeHorizonYears].totalWealthRenting - taxOwed
  return {
    rentingResults,
  };
};
