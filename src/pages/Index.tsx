import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { calculateComparison } from "@/lib/calculations";
import { BuyingInputs, ComparisonResults, FormData, GeneralInputs, InvestmentInputs, RentingInputs } from "@/lib/types";
import GeneralInputsForm from "@/components/forms/GeneralInputsForm";
import BuyingInputsForm from "@/components/forms/BuyingInputsForm";
import RentingInputsForm from "@/components/forms/RentingInputsForm";
import InvestmentInputsForm from "@/components/forms/InvestmentInputsForm";
import ResultsSummary from "@/components/results/ResultsSummary";
import ComparisonChart from "@/components/results/ComparisonChart";
import ComparisonTable from "@/components/results/ComparisonTable";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfoCard from "@/components/layout/InfoCard";
import CostsChart from "@/components/results/CostsChart";
import { ChevronDown, ChevronUp, Calculator, RefreshCw } from "lucide-react";

// Default form values
const defaultGeneral: GeneralInputs = {
  timeHorizon: 30,
  annualIncome: 100000,
  incomeIncrease: false,
  annualIncomeGrowth: 3,
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

const Index = () => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    general: defaultGeneral,
    buying: defaultBuying,
    renting: defaultRenting,
    investment: defaultInvestment,
  });

  // Results state
  const [results, setResults] = useState<ComparisonResults | null>(null);
  
  // UI state
  const [showSections, setShowSections] = useState({
    buying: true,
    renting: true,
    investment: true,
  });
  
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
  
  // Toggle section visibility
  const toggleSection = (section: 'buying' | 'renting' | 'investment') => {
    setShowSections({
      ...showSections,
      [section]: !showSections[section],
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <InfoCard title="About This Tool">
              <p>
                This tool helps you compare the financial outcomes of renting versus buying a home over your specified time period.
                By considering factors like property appreciation, investment returns, and various costs, you can make a more informed
                decision about whether renting or buying makes more financial sense for your situation.
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-1">
                <li>Enter your financial details</li>
                <li>Customize assumptions for both scenarios</li>
                <li>Get a detailed year-by-year breakdown</li>
                <li>See visualizations of wealth growth</li>
              </ul>
            </InfoCard>
            
            <div className="sticky top-4 space-y-4">
              <GeneralInputsForm 
                values={formData.general} 
                onChange={handleGeneralChange}
              />
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleCalculate}
                  className="flex-1"
                  size="lg"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Results
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
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
                  onChange={handleBuyingChange}
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
                  onChange={handleRentingChange}
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
                  onChange={handleInvestmentChange}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        {results && (
          <div id="results" className="mt-12">
            <Separator className="my-8" />
            <h2 className="text-2xl font-bold mb-6">Results</h2>
            
            <ResultsSummary results={results} />
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <ComparisonChart results={results} />
              <CostsChart results={results} />
            </div>
            
            <ComparisonTable results={results} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
