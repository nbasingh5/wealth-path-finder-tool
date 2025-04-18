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
  const { buyingResults, finalHomeEquity, finalBuyingInvestmentValueAfterTax } = calculateBuyingYearlyData({
    general,
    buying,
    investment,
  });

  // --- Calculate Renting Scenario ---
  const { rentingResults, finalRentingInvestmentValueAfterTax } = calculateRentingYearlyData({
    general,
    renting,
    investment,
  });

  // --- Combine Results and Calculate Comparisons ---
  const yearlyComparisons: YearlyComparison[] = [];
  let cumulativeBuyingCosts = 0; // Needs recalculation based on yearly results
  let cumulativeRentingCosts = 0; // Needs recalculation based on yearly results

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
    
    yearlyComparisons.push({
      year,
      buyingWealth: buyingYearData.totalWealth,
      rentingWealth: rentingYearData.totalWealth,
      difference: buyingYearData.totalWealth - rentingYearData.totalWealth,
      cumulativeBuyingCosts,
      cumulativeRentingCosts,
      yearlyIncome: buyingYearData.yearlyIncome, // Assume income is the same
      buyingLeftoverIncome: buyingYearData.leftoverIncome,
      rentingLeftoverIncome: rentingYearData.leftoverIncome,
      buyingLeftoverInvestmentValue: buyingYearData.leftoverInvestmentValue,
      rentingLeftoverInvestmentValue: rentingYearData.leftoverInvestmentValue,
    });
  }

  // --- Final Summary ---
  const finalBuyingWealth = buyingResults[timeHorizonYears].totalWealth;
  const finalRentingWealth = rentingResults[timeHorizonYears].totalWealth;
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
  const validatedDifference = isNaN(difference) ? 0 : Math.abs(difference);

  console.log({buyingResults})
  console.log({rentingResults})

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
