
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InfoCardSection from "@/components/layout/InfoCardSection";
import FormContainer from "@/components/layout/FormContainer";
import ResultsContainer from "@/components/results/ResultsContainer";
import { useRentBuyCalculator } from "@/hooks/useRentBuyCalculator";

const Index = () => {
  const {
    formData,
    results,
    validationError,
    handleGeneralChange,
    handleBuyingChange,
    handleRentingChange,
    handleInvestmentChange,
    handleReset,
    handleCalculate
  } = useRentBuyCalculator();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 px-4 md:px-8 max-w-120rem mx-auto w-full">
        <InfoCardSection />
        
        <FormContainer 
          formData={formData}
          validationError={validationError}
          onGeneralChange={handleGeneralChange}
          onBuyingChange={handleBuyingChange}
          onRentingChange={handleRentingChange}
          onInvestmentChange={handleInvestmentChange}
          onCalculate={handleCalculate}
          onReset={handleReset}
        />
        
        <ResultsContainer results={results} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
