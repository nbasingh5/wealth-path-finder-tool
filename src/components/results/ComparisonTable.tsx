
import { ComparisonResults } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatCurrency } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ComparisonTableProps {
  results: ComparisonResults | null;
}

interface ExpandableRowProps {
  rowData: any;
  isExpanded: boolean;
  onToggle: () => void;
  columns: { key: string; label: string }[];
}

const ExpandableRow = ({ rowData, isExpanded, onToggle, columns }: ExpandableRowProps) => {
  const year = rowData.year;
  
  const generateMonthlyData = (yearlyValue: number) => {
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const monthlyValue = yearlyValue / 12;
      monthlyData.push({
        month,
        value: monthlyValue
      });
    }
    return monthlyData;
  };

  return (
    <>
      <TableRow 
        className="cursor-pointer hover:bg-muted/60" 
        onClick={onToggle}
      >
        {columns.map((col, index) => (
          <TableCell key={col.key}>
            {index === 0 ? (
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {rowData[col.key]}
              </div>
            ) : (
              rowData[col.key] instanceof Number || typeof rowData[col.key] === 'number' 
                ? formatCurrency(rowData[col.key]) 
                : rowData[col.key]
            )}
          </TableCell>
        ))}
      </TableRow>
      
      {isExpanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={columns.length}>
            <div className="py-2">
              <h4 className="text-sm font-medium mb-2">Monthly Breakdown for Year {year}</h4>
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      {columns.slice(1).map(col => (
                        <TableHead key={col.key}>{col.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {year > 0 ? (
                      [...Array(12)].map((_, i) => {
                        const month = i + 1;
                        return (
                          <TableRow key={month}>
                            <TableCell>{month}</TableCell>
                            {columns.slice(1).map(col => (
                              <TableCell key={col.key}>
                                {typeof rowData[col.key] === 'number'
                                  ? col.key === 'yearlyIncome' || col.key === 'leftoverIncome'
                                    ? formatCurrency(rowData[col.key] / 12)
                                    : formatCurrency(rowData[col.key] / 12)
                                  : '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center py-4">
                          Year 0 represents initial values before any payments
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

const ComparisonTable = ({ results }: ComparisonTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  if (!results) return null;

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
    { key: "buyingLeftoverInvestmentValue", label: "Buying Leftover Investments" },
    { key: "rentingLeftoverInvestmentValue", label: "Renting Leftover Investments" },
    { key: "buyingWealth", label: "Buying Wealth" },
    { key: "rentingWealth", label: "Renting Wealth" },
    { key: "difference", label: "Difference" },
    { key: "betterOption", label: "Better Option" }
  ];

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
    { key: "leftoverInvestmentValue", label: "Leftover Investments" },
    { key: "loanBalance", label: "Loan Balance" },
    { key: "homeValue", label: "Home Value" },
    { key: "homeEquity", label: "Home Equity" },
    { key: "totalWealth", label: "Total Wealth" }
  ];

  const rentingColumns = [
    { key: "year", label: "Year" },
    { key: "yearlyIncome", label: "Annual Income" },
    { key: "totalRent", label: "Total Rent" },
    { key: "leftoverIncome", label: "Leftover Income" },
    { key: "monthlySavings", label: "Monthly Savings" },
    { key: "amountInvested", label: "Amount Invested" },
    { key: "leftoverInvestmentValue", label: "Leftover Investments" },
    { key: "investmentValueBeforeTax", label: "Investment Value (Before Tax)" },
    { key: "capitalGainsTaxPaid", label: "Capital Gains Tax" },
    { key: "investmentValueAfterTax", label: "Investment Value (After Tax)" },
    { key: "totalWealth", label: "Total Wealth" }
  ];

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
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {summaryColumns.map(col => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearlyComparisons.map((comparison) => (
                    <ExpandableRow 
                      key={comparison.year}
                      rowData={{
                        ...comparison,
                        betterOption: (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            comparison.difference > 0
                              ? "bg-buy/10 text-buy-dark"
                              : comparison.difference < 0
                              ? "bg-rent/10 text-rent-dark"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {comparison.difference > 0
                              ? "Buying"
                              : comparison.difference < 0
                              ? "Renting"
                              : "Equal"}
                          </span>
                        )
                      }}
                      isExpanded={!!expandedRows[`summary-${comparison.year}`]}
                      onToggle={() => toggleRow('summary', comparison.year)}
                      columns={summaryColumns}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="buying">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {buyingColumns.map(col => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyingResults.map((result) => (
                    <ExpandableRow 
                      key={result.year}
                      rowData={result}
                      isExpanded={!!expandedRows[`buying-${result.year}`]}
                      onToggle={() => toggleRow('buying', result.year)}
                      columns={buyingColumns}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="renting">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {rentingColumns.map(col => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentingResults.map((result) => (
                    <ExpandableRow 
                      key={result.year}
                      rowData={result}
                      isExpanded={!!expandedRows[`renting-${result.year}`]}
                      onToggle={() => toggleRow('renting', result.year)}
                      columns={rentingColumns}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;
