
import { BuyingInputs } from "../types";

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
