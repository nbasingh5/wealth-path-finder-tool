
import { useState } from "react";
import { BuyingInputs, ComparisonResults, FormData, GeneralInputs, InvestmentInputs, RentingInputs } from "@/lib/types";
import { calculateComparison } from "@/lib/calculations";

// Default form values
const defaultGeneral: GeneralInputs = {
  timeHorizon: 30,
  annualIncome: 100000,
  incomeIncrease: false,
  annualIncomeGrowthRate: 3,
  currentSavings: 50000,
};

const defaultBuying: BuyingInputs = {
  housePrice: 400000,
  downPaymentPercent: 20,
  interestRate: 6,
  loanTerm: 30,
  loanType: "fixed",
  propertyTaxRate: 1.2,
  homeInsuranceRate: 0.5,
  maintenanceCosts: 1,
  usePercentageForMaintenance: true,
  appreciationScenario: "medium",
  customAppreciationRate: 4,
};

const defaultRenting: RentingInputs = {
  monthlyRent: 2000,
  annualRentIncrease: 3,
};

const defaultInvestment: InvestmentInputs = {
  annualReturn: 10,
  capitalGainsTaxRate: 15,
};

export const useRentBuyCalculator = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    general: defaultGeneral,
    buying: defaultBuying,
    renting: defaultRenting,
    investment: defaultInvestment,
  });

  // Results state
  const [results, setResults] = useState<ComparisonResults | null>(null);
  
  // Form update handlers
  const handleGeneralChange = (general: GeneralInputs) => {
    setFormData({ ...formData, general });
  };
  
  const handleBuyingChange = (buying: BuyingInputs) => {
    setFormData({ ...formData, buying });
  };
  
  const handleRentingChange = (renting: RentingInputs) => {
    setFormData({ ...formData, renting });
  };
  
  const handleInvestmentChange = (investment: InvestmentInputs) => {
    setFormData({ ...formData, investment });
  };
  
  // Reset form to defaults
  const handleReset = () => {
    setFormData({
      general: defaultGeneral,
      buying: defaultBuying,
      renting: defaultRenting,
      investment: defaultInvestment,
    });
    setResults(null);
  };
  
  // Calculate results
  const handleCalculate = () => {
    const calculationResults = calculateComparison(formData);
    setResults(calculationResults);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return {
    formData,
    results,
    handleGeneralChange,
    handleBuyingChange,
    handleRentingChange,
    handleInvestmentChange,
    handleReset,
    handleCalculate
  };
};
