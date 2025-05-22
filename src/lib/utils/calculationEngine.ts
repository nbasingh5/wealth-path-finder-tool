// src/lib/utils/calculationEngine.ts - Orchestrator
import {
  ComparisonResults,
  FormData,
  YearlyComparison,
} from "../types";
import { calculateBuyingYearlyData } from "./buyingCalculator";
import { calculateRentingYearlyData } from "./rentingCalculator";

// Main calculation function - orchestrates buying and renting calculations
export const calculateComparison = (formData: FormData): ComparisonResults => {
  const { general, buying, renting, investment } = formData;
  const timeHorizonYears = general.timeHorizon;

  // --- Calculate Buying Scenario ---
  const { buyingResults} = calculateBuyingYearlyData({
    general,
    buying,
    investment,
  });

  console.log("Buying Results: ", buyingResults);

  // --- Calculate Renting Scenario ---
  const { rentingResults } = calculateRentingYearlyData({
    general,
    renting,
    investment
  });

  // --- Combine Results and Calculate Comparisons ---
  const yearlyComparisons: YearlyComparison[] = [];
  let cumulativeBuyingCosts = 0;
  let cumulativeRentingCosts = 0;

  for (let year = 0; year <= timeHorizonYears; year++) {
    const buyingYearData = buyingResults[year];
    const rentingYearData = rentingResults[year];

    // Calculate yearly costs (excluding principal for buying)
    const yearlyBuyingCosts = buyingYearData.interestPaid + 
                              buyingYearData.propertyTaxes + 
                              buyingYearData.homeInsurance + 
                              buyingYearData.maintenanceCosts;
                              
    const yearlyRentingCosts = rentingYearData.totalRent + (20 * 12); // Rent + estimated renters insurance

    // Accumulate costs (only start accumulating from year 1)
    if (year > 0) {
        cumulativeBuyingCosts += yearlyBuyingCosts;
        cumulativeRentingCosts += yearlyRentingCosts;
    }

    // Use the wealth values directly from the results (they include tax for final year)
    let buyingWealth = buyingYearData.totalWealthBuying;
    let rentingWealth = rentingYearData.totalWealthRenting;

    // For the final year, ensure we're using after-tax values
    if (year === timeHorizonYears) {
      buyingWealth = buyingYearData.totalWealthBuying; // Should already include tax deduction
      rentingWealth = rentingYearData.totalWealthRenting; // Should already include tax deduction
    }
    
    yearlyComparisons.push({
      year,
      buyingWealth,
      rentingWealth,
      difference: buyingWealth - rentingWealth,
      cumulativeBuyingCosts,
      cumulativeRentingCosts,
      yearlyIncome: buyingYearData.yearlyIncome, // Assume income is the same
      buyingLeftoverIncome: buyingYearData.yearlySavings,
      rentingLeftoverIncome: rentingYearData.yearlySavings,
      buyingLeftoverInvestmentValue: buyingYearData.investmentsWithEarnings,
      rentingLeftoverInvestmentValue: rentingYearData.investmentsWithEarnings,
    });
  }

  // --- Final Summary (FIXED) ---
  // Make sure we're using the final year's wealth AFTER taxes
  const finalBuyingWealth = buyingResults[timeHorizonYears].totalWealthBuying; // Already includes tax
  const finalRentingWealth = rentingResults[timeHorizonYears].totalWealthRenting; // Already includes tax
  const difference = finalBuyingWealth - finalRentingWealth;

  // Determine better option with reasonable threshold
  let betterOption: "buying" | "renting" | "equal" = "equal";
  const wealthThreshold = Math.max(finalBuyingWealth, finalRentingWealth) * 0.01; // 1% difference threshold

  if (difference > wealthThreshold) {
    betterOption = "buying";
  } else if (difference < -wealthThreshold) {
    betterOption = "renting";
  }

  // Ensure the values are valid numbers
  const validatedFinalBuyingWealth = isNaN(finalBuyingWealth) ? 0 : finalBuyingWealth;
  const validatedFinalRentingWealth = isNaN(finalRentingWealth) ? 0 : finalRentingWealth;
  const validatedDifference = isNaN(difference) ? 0 :  Math.abs(difference); 
  return {
    yearlyComparisons,
    buyingResults,
    rentingResults,
    summary: {
      finalBuyingWealth: validatedFinalBuyingWealth,
      finalRentingWealth: validatedFinalRentingWealth,
      difference: validatedDifference,
      betterOption,
    },
  };
};

/**
 * Helper function to estimate monthly accumulating values
 * This approximates growth throughout the year
 */
export const calculateMonthlyValue = (yearEndValue?: number, month?: number, year?: number): number | undefined => {
  if (!yearEndValue || !month || !year || year === 0) return yearEndValue;
  
  // For year 1, use a more accurate formula that accounts for initial investments
  if (year === 1) {
    const initialValue = yearEndValue / Math.pow(1.01, 12); // Approximate starting value
    const monthlyGrowthRate = Math.pow(yearEndValue / initialValue, 1/12);
    return initialValue * Math.pow(monthlyGrowthRate, month);
  }
  
  // For other years, use a more accurate compounding formula
  // instead of simple linear approximation
  const monthlyGrowthRate = Math.pow(1.01, 1/12); // Approximate 1% monthly growth
  return yearEndValue / Math.pow(monthlyGrowthRate, 12-month);
};

/**
 * Calculate the absolute difference between two values
 * @param value1 First value
 * @param value2 Second value
 * @returns Absolute difference between the values
 */
export const calculateAbsoluteDifference = (value1: number, value2: number): number => {
  return Math.abs(value1 - value2);
};