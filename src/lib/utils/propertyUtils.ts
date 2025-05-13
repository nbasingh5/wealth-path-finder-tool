
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

// Import property cost calculations from the centralized location
import {
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts
} from "./propertyCostUtils";

// Re-export for backward compatibility
export {
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts
};
