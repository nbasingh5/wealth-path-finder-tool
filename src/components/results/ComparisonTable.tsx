import { ComparisonResults } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import ComparisonTableTab from "./ComparisonTableTab";

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

  // Updated buying columns with investment earnings instead of initial/additional investments
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

  // Add investment earnings calculations to the data
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
    // For amount invested, we'll use the cumulative contributions
    let amountInvested = 0;
    
    if (index === 0) {
      amountInvested = year.initialInvestment || 0;
      // No investment earnings in year 0
      return {
        ...year,
        amountInvested,
        investmentEarnings: 0
      };
    } else {
      // Calculate cumulative investment (previous investments + this year's contribution)
      const prevYear = buyingResults[index - 1];
      
      // This year's contribution is the leftover income
      const yearContribution = year.leftoverIncome || 0;
      
      // Previous year's investment value
      const prevInvestmentValue = prevYear.leftoverInvestmentValue || 0;
      
      // Current year's investment value
      const currentInvestmentValue = year.leftoverInvestmentValue || 0;
      
      // Investment earnings = Current value - Previous value - New contributions
      const investmentEarnings = Math.max(0, currentInvestmentValue - prevInvestmentValue - yearContribution);
      
      // Amount invested is the running total of all contributions
      if (index === 1) {
        // For year 1, start with initial investment + year 1's contribution
        amountInvested = (prevYear.initialInvestment || 0) + yearContribution;
      } else {
        // For later years, add to previous year's amount invested
        amountInvested = (prevYear.amountInvested || 0) + yearContribution;
      }
      
      return {
        ...year,
        amountInvested,
        investmentEarnings
      };
    }
  });
    }
  });
  
  // Process renting data to add investment earnings
  const enhancedRentingResults = rentingResults.map((year, index) => {
    if (index === 0) {
      // For Year 0, initialize values
      return {
        ...year,
        amountInvested: year.initialInvestment || 0,
        investmentEarnings: 0
      };
    } else {
      const prevYear = rentingResults[index - 1];
      
      // This year's contribution is the leftover income
      const yearContribution = year.leftoverIncome || 0;
      
      // Previous year's investment value (after tax)
      const prevInvestmentValue = prevYear.investmentValueAfterTax || 0;
      
      // Current year's investment value (before tax)
      const currentInvestmentValue = year.investmentValueBeforeTax || 0;
      
      // Investment earnings = Current value before tax - Previous value after tax - New contributions
      const investmentEarnings = Math.max(0, currentInvestmentValue - prevInvestmentValue - yearContribution);
      
      // Amount invested is the running total of all contributions
      let amountInvested = 0;
      if (index === 1) {
        // For year 1, start with initial investment + year 1's contribution
        amountInvested = (prevYear.initialInvestment || 0) + yearContribution;
      } else {
        // For later years, add to previous year's amount invested
        amountInvested = (prevYear.amountInvested || 0) + yearContribution;
      }
      
      return {
        ...year,
        amountInvested,
        investmentEarnings
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