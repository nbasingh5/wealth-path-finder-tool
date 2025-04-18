// src/lib/utils/propertyCostUtils.ts

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

// Calculate monthly maintenance costs
export const calculateMonthlyMaintenanceCosts = (
  homeValue: number,
  maintenanceCosts: number,
  usePercentageForMaintenance: boolean
): number => {
  if (usePercentageForMaintenance) {
    return (homeValue * maintenanceCosts) / (12 * 100);
  } else {
    return maintenanceCosts / 12;
  }
};
