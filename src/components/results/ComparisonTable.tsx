import { ComparisonResults } from "@/lib/types";
import { TableColumn, ComparisonTableData, YearlyTableData } from "@/lib/types/tableTypes";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import ComparisonTableTab from "./ComparisonTableTab";
import { ReactNode } from "react";

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
  console.log({buyingResults})

  const toggleRow = (tabKey: string, rowId: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [`${tabKey}-${rowId}`]: !prev[`${tabKey}-${rowId}`]
    }));
  };

  const summaryColumns: TableColumn<ComparisonTableData>[] = [
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

  const buyingColumns: TableColumn<YearlyTableData>[] = [
    { key: "year", label: "Year" },
    { key: "yearlyIncome", label: "Annual Income" },
    { key: "mortgagePayment", label: "Mortgage Payment" },
    { key: "principalPaid", label: "Principal Paid" },
    { key: "interestPaid", label: "Interest Paid" },
    { key: "propertyTaxes", label: "Property Taxes" },
    { key: "homeInsurance", label: "Insurance" },
    { key: "maintenanceCosts", label: "Maintenance" },
    { key: "yearlySavings", label: "Yearly Savings" },
    { key: "amountInvested", label: "Amount Invested" },
    { key: "investmentEarnings", label: "Investment Earnings" },
    { key: "investmentsWithEarnings", label: "Investments with Earnings" },
    { key: "loanBalance", label: "Loan Balance" },
    { key: "homeValue", label: "Home Value" },
    { key: "homeEquity", label: "Home Equity" },
    { key: "totalWealthBuying", label: "Total Wealth" }
  ];

  const rentingColumns: TableColumn<YearlyTableData>[] = [
    { key: "year", label: "Year" },
    { key: "yearlyIncome", label: "Annual Income" },
    { key: "totalRent", label: "Total Rent" },
    { key: "yearlySavings", label: "Yearly Savings" },
    { key: "amountInvested", label: "Amount Invested" },
    { key: "investmentEarnings", label: "Investment Earnings" },
    { key: "investmentValueBeforeTax", label: "Investment Value (Before Tax)" },
    { key: "capitalGainsTaxPaid", label: "Capital Gains Tax" },
    { key: "investmentValueAfterTax", label: "Investment Value (After Tax)" },
    { key: "totalWealthRenting", label: "Total Wealth" }
  ];

  //  Enhance yearly comparisons with better option
  const enhancedYearlyComparisons = yearlyComparisons.map(year => {
    let betterOption: ReactNode;

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
              data={buyingResults}
              columns={buyingColumns}
              tabId="buying"
              expandedRows={expandedRows}
              onToggleRow={toggleRow}
            />
          </TabsContent>

          <TabsContent value="renting">
            <ComparisonTableTab
              data={rentingResults}
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
