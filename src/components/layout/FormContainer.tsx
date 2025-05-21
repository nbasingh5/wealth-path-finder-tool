
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BuyingInputs, FormData, GeneralInputs, InvestmentInputs, RentingInputs } from "@/lib/types";
import GeneralInputsForm from "@/components/forms/GeneralInputsForm";
import BuyingInputsForm from "@/components/forms/BuyingInputsForm";
import RentingInputsForm from "@/components/forms/RentingInputsForm";
import InvestmentInputsForm from "@/components/forms/InvestmentInputsForm";

interface FormContainerProps {
  formData: FormData;
  validationError: string | null;
  onGeneralChange: (general: GeneralInputs) => void;
  onBuyingChange: (buying: BuyingInputs) => void;
  onRentingChange: (renting: RentingInputs) => void;
  onInvestmentChange: (investment: InvestmentInputs) => void;
  onCalculate: () => void;
  onReset: () => void;
}

const FormContainer: React.FC<FormContainerProps> = ({
  formData,
  validationError,
  onGeneralChange,
  onBuyingChange,
  onRentingChange,
  onInvestmentChange,
  onCalculate,
  onReset,
}) => {
  const [showSections, setShowSections] = useState({
    buying: true,
    renting: true,
    investment: true,
  });

  // Toggle section visibility
  const toggleSection = (section: 'buying' | 'renting' | 'investment') => {
    setShowSections({
      ...showSections,
      [section]: !showSections[section],
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <div className="sticky top-4 space-y-4">
          <GeneralInputsForm 
            values={formData.general} 
            onChange={onGeneralChange}
            formData={formData}
            validationError={validationError}
          />
          
          <div className="space-y-4">
            {validationError && (
              <div className="p-3 text-sm border border-red-300 bg-red-50 text-red-800 rounded-md">
                <p className="font-medium">Validation Error:</p>
                <p>{validationError}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={onCalculate}
                disabled={!!validationError}
                className={`flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 rounded-md px-8 ${
                  validationError 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
                title={validationError || "Calculate results"}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Results
              </button>
              
              <button
                onClick={onReset}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 rounded-md px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2 space-y-6">
        {/* Buying Section */}
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md" 
            onClick={() => toggleSection('buying')}
          >
            <h2 className="text-xl font-semibold text-buy-dark">Buying Scenario</h2>
            {showSections.buying ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {showSections.buying && (
            <BuyingInputsForm 
              values={formData.buying} 
              onChange={onBuyingChange}
            />
          )}
        </div>
        
        {/* Renting Section */}
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md" 
            onClick={() => toggleSection('renting')}
          >
            <h2 className="text-xl font-semibold text-rent-dark">Renting Scenario</h2>
            {showSections.renting ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {showSections.renting && (
            <RentingInputsForm 
              values={formData.renting} 
              onChange={onRentingChange}
            />
          )}
        </div>
        
        {/* Investment Section */}
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-50 rounded-md" 
            onClick={() => toggleSection('investment')}
          >
            <h2 className="text-xl font-semibold">Investment Settings</h2>
            {showSections.investment ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {showSections.investment && (
            <InvestmentInputsForm 
              values={formData.investment} 
              onChange={onInvestmentChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FormContainer;

import { Calculator, RefreshCw } from "lucide-react";
