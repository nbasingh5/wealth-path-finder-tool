
import { useState, useEffect } from "react";
import { BuyingInputs, ComparisonResults, FormData, GeneralInputs, InvestmentInputs, RentingInputs } from "@/lib/types";
import { calculateComparison } from "@/lib/calculations";
import { toast } from "@/components/ui/use-toast";

// Default form values
const defaultGeneral: GeneralInputs = {
  timeHorizon: 30,
  annualIncome: 100000,
  incomeIncrease: false,
  annualIncomeGrowthRate: 3,
  currentSavings: 100000,
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
  
  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Run initial validation on mount
  useEffect(() => {
    validateSavingsForDownPayment(
      formData.general.currentSavings,
      formData.buying.housePrice,
      formData.buying.downPaymentPercent
    );
  }, []);
  
  // Validation function
  const validateSavingsForDownPayment = (
    currentSavings: number, 
    housePrice: number, 
    downPaymentPercent: number
  ) => {
    const downPaymentAmount = housePrice * (downPaymentPercent / 100);
    
    if (currentSavings < downPaymentAmount) {
      setValidationError(`Your current savings ($${currentSavings.toLocaleString()}) are less than the required down payment ($${downPaymentAmount.toLocaleString()})`);
    } else {
      setValidationError(null);
    }
  };
  
  // Form update handlers
  const handleGeneralChange = (general: GeneralInputs) => {
    setFormData({ ...formData, general });
    
    // Validate if current savings changed
    if (general.currentSavings !== formData.general.currentSavings) {
      validateSavingsForDownPayment(
        general.currentSavings,
        formData.buying.housePrice,
        formData.buying.downPaymentPercent
      );
    }
  };
  
  const handleBuyingChange = (buying: BuyingInputs) => {
    setFormData({ ...formData, buying });
    
    // Validate if house price or down payment percent changed
    if (buying.housePrice !== formData.buying.housePrice || 
        buying.downPaymentPercent !== formData.buying.downPaymentPercent) {
      validateSavingsForDownPayment(
        formData.general.currentSavings,
        buying.housePrice,
        buying.downPaymentPercent
      );
    }
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
    setValidationError(null);
  };
  
  // Calculate results
  const handleCalculate = () => {
    // Calculate down payment amount
    const downPaymentAmount = formData.buying.housePrice * (formData.buying.downPaymentPercent / 100);
    
    // Check if current savings are less than down payment
    if (formData.general.currentSavings < downPaymentAmount) {
      setValidationError(`Your current savings ($${formData.general.currentSavings.toLocaleString()}) are less than the required down payment ($${downPaymentAmount.toLocaleString()})`);
      
      // Show toast notification
      toast({
        title: "Insufficient Savings",
        description: `You need at least $${downPaymentAmount.toLocaleString()} for the down payment.`,
        variant: "destructive"
      });
      
      return;
    }
    
    // Clear any previous validation errors
    setValidationError(null);
    
    // Proceed with calculation
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
    validationError,
    handleGeneralChange,
    handleBuyingChange,
    handleRentingChange,
    handleInvestmentChange,
    handleReset,
    handleCalculate
  };
};
