
import { ComparisonResults } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import ComparisonTableTab from "./ComparisonTableTab";
import { calculateInvestmentEarnings } from "@/lib/utils/investmentUtils";

interface ComparisonTableProps {
  results: ComparisonResults | null;
}

const ComparisonTable = ({ results }: ComparisonTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  if (!results) return null;

  // Defensive check for data integrity
  if (!results.yearlyComparisons || !results.buyingResults || !results.rentingResults) {
    console.error("Missing required data in comparison results:", results);
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Year-by-Year Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Error loading comparison data. Please try recalculating.</p>
        </CardContent>
      </Card>
    );
  }

  const { yearlyComparisons, buyingResults, rentingResults } = results;

  const toggleRow = (tabKey: string, rowId: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [`${tabKey}-${rowId}`]: !prev[`${tabKey}-${rowId}`]
    }));
  };

  const summaryColumns = [
    { key: "year", label: "Year" },
    { key: "yearlyIncome", label: "Annual Income" },
    { key: "buyingLeftoverIncome", label: "Buying Leftover Income" },
    { key: "rentingLeftoverIncome", label: "Renting Leftover Income" },
    { key: "buyingLeftoverInvestmentValue", label: "Buying Investments" },
    { key: "rentingLeftoverInvestmentValue", label: "Renting Investments" },
    { key: "buyingWealth", label: "Buying Wealth" },
    { key: "rentingWealth", label: "Renting Wealth" },
    { key: "difference", label: "Difference" },
    { key: "betterOption", label: "Better Option" }
  ];

  // Updated buying columns with investment earnings
  const buyingColumns = [
    { key: "year", label: "Year" },
    { key: "yearlyIncome", label: "Annual Income" },
    { key: "mortgagePayment", label: "Mortgage Payment" },
    { key: "principalPaid", label: "Principal Paid" },
    { key: "interestPaid", label: "Interest Paid" },
    { key: "propertyTaxes", label: "Property Taxes" },
    { key: "homeInsurance", label: "Insurance" },
    { key: "maintenanceCosts", label: "Maintenance" },
    { key: "leftoverIncome", label: "Leftover Income" },
    { key: "amountInvested", label: "Amount Invested" },
    { key: "investmentEarnings", label: "Investment Earnings" },
    { key: "leftoverInvestmentValue", label: "Total Investments" },
    { key: "loanBalance", label: "Loan Balance" },
    { key: "homeValue", label: "Home Value" },
    { key: "homeEquity", label: "Home Equity" },
    { key: "totalWealth", label: "Total Wealth" }
  ];

  // Updated renting columns with investment earnings
  const rentingColumns = [
    { key: "year", label: "Year" },
    { key: "yearlyIncome", label: "Annual Income" },
    { key: "totalRent", label: "Total Rent" },
    { key: "leftoverIncome", label: "Leftover Income" },
    { key: "monthlySavings", label: "Monthly Savings" },
    { key: "amountInvested", label: "Amount Invested" },
    { key: "investmentEarnings", label: "Investment Earnings" },
    { key: "investmentValueBeforeTax", label: "Investment Value (Before Tax)" },
    { key: "capitalGainsTaxPaid", label: "Capital Gains Tax" },
    { key: "investmentValueAfterTax", label: "Investment Value (After Tax)" },
    { key: "totalWealth", label: "Total Wealth" }
  ];

  // Process the data to add missing values
  const enhancedYearlyComparisons = yearlyComparisons.map(year => {
    let betterOption: React.ReactNode;
    
    if (year.difference > 0) {
      betterOption = (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-buy/10 text-buy-dark">
          Buying
        </span>
      );
    } else if (year.difference < 0) {
      betterOption = (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-rent/10 text-rent-dark">
          Renting
        </span>
      );
    } else {
      betterOption = (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          Equal
        </span>
      );
    }
    
    return {
      ...year,
      betterOption
    };
  });

  // Process buying data to add investment earnings
  const enhancedBuyingResults = buyingResults.map((year, index) => {
    // Calculate investment earnings
    let investmentEarnings = 0;
    
    if (index === 0) {
      // For Year 0, there are no earnings yet
      investmentEarnings = 0;
    } else {
      // For subsequent years, calculate earnings as the difference between investment value
      // and (previous investment value + new contributions)
      const prevYear = buyingResults[index - 1];
      const previousInvestmentValue = prevYear.leftoverInvestmentValue || 0;
      const contributionsThisYear = year.leftoverIncome || 0;
      
      // Earnings = current value - (previous value + new contributions)
      investmentEarnings = calculateInvestmentEarnings(
        previousInvestmentValue,
        year.leftoverInvestmentValue || 0,
        contributionsThisYear
      );
    }
    
    // Make sure amountInvested is always at least the value of the initial investment
    const amountInvested = year.initialInvestment || 0;
    
    return {
      ...year,
      amountInvested,
      investmentEarnings
    };
  });
  
  // Process renting data to add investment earnings
  const enhancedRentingResults = rentingResults.map((year, index) => {
    // Calculate investment earnings
    let investmentEarnings = 0;
    
    if (index === 0) {
      // For Year 0, there are no earnings yet
      investmentEarnings = 0;
    } else {
      // For subsequent years, calculate earnings as the difference between investment value
      // and (previous investment value + new contributions)
      const prevYear = rentingResults[index - 1];
      const previousInvestmentValue = prevYear.investmentValueBeforeTax || prevYear.leftoverInvestmentValue || 0;
      const contributionsThisYear = year.leftoverIncome || 0;
      
      // Earnings = current value before tax - (previous value + new contributions)
      const currentValue = year.investmentValueBeforeTax || year.leftoverInvestmentValue || 0;
      investmentEarnings = calculateInvestmentEarnings(
        previousInvestmentValue,
        currentValue,
        contributionsThisYear
      );
    }
    
    // Make sure amountInvested is always at least the value of the initial investment
    const amountInvested = year.initialInvestment || 0;
    
    // Ensure all investment fields have values
    return {
      ...year,
      amountInvested,
      investmentEarnings,
      investmentValueBeforeTax: year.investmentValueBeforeTax || year.leftoverInvestmentValue || 0,
      investmentValueAfterTax: year.investmentValueAfterTax || year.leftoverInvestmentValue || 0,
      capitalGainsTaxPaid: year.capitalGainsTaxPaid || 0
    };
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Year-by-Year Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="buying">Buying Details</TabsTrigger>
            <TabsTrigger value="renting">Renting Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <ComparisonTableTab
              data={enhancedYearlyComparisons}
              columns={summaryColumns}
              tabId="summary"
              expandedRows={expandedRows}
              onToggleRow={toggleRow}
            />
          </TabsContent>
          
          <TabsContent value="buying">
            <ComparisonTableTab
              data={enhancedBuyingResults}
              columns={buyingColumns}
              tabId="buying"
              expandedRows={expandedRows}
              onToggleRow={toggleRow}
            />
          </TabsContent>
          
          <TabsContent value="renting">
            <ComparisonTableTab
              data={enhancedRentingResults}
              columns={rentingColumns}
              tabId="renting"
              expandedRows={expandedRows}
              onToggleRow={toggleRow}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;
