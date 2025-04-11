
import { ComparisonResults } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatCurrency } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ComparisonTableProps {
  results: ComparisonResults | null;
}

const ComparisonTable = ({ results }: ComparisonTableProps) => {
  if (!results) return null;

  const { yearlyComparisons, buyingResults, rentingResults } = results;

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
                    <TableHead>Year</TableHead>
                    <TableHead>Buying Wealth</TableHead>
                    <TableHead>Renting Wealth</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>Better Option</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearlyComparisons.map((comparison) => (
                    <TableRow key={comparison.year}>
                      <TableCell>{comparison.year}</TableCell>
                      <TableCell>{formatCurrency(comparison.buyingWealth)}</TableCell>
                      <TableCell>{formatCurrency(comparison.rentingWealth)}</TableCell>
                      <TableCell>{formatCurrency(Math.abs(comparison.difference))}</TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
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
                    <TableHead>Year</TableHead>
                    <TableHead>Mortgage Payment</TableHead>
                    <TableHead>Principal Paid</TableHead>
                    <TableHead>Interest Paid</TableHead>
                    <TableHead>Loan Balance</TableHead>
                    <TableHead>Property Taxes</TableHead>
                    <TableHead>Insurance</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead>Home Value</TableHead>
                    <TableHead>Home Equity</TableHead>
                    <TableHead>Total Wealth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buyingResults.map((result) => (
                    <TableRow key={result.year}>
                      <TableCell>{result.year}</TableCell>
                      <TableCell>{formatCurrency(result.mortgagePayment)}</TableCell>
                      <TableCell>{formatCurrency(result.principalPaid)}</TableCell>
                      <TableCell>{formatCurrency(result.interestPaid)}</TableCell>
                      <TableCell>{formatCurrency(result.loanBalance)}</TableCell>
                      <TableCell>{formatCurrency(result.propertyTaxes)}</TableCell>
                      <TableCell>{formatCurrency(result.homeInsurance)}</TableCell>
                      <TableCell>{formatCurrency(result.maintenanceCosts)}</TableCell>
                      <TableCell>{formatCurrency(result.homeValue)}</TableCell>
                      <TableCell>{formatCurrency(result.homeEquity)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(result.totalWealth)}</TableCell>
                    </TableRow>
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
                    <TableHead>Year</TableHead>
                    <TableHead>Total Rent</TableHead>
                    <TableHead>Monthly Savings</TableHead>
                    <TableHead>Amount Invested</TableHead>
                    <TableHead>Investment Value (Before Tax)</TableHead>
                    <TableHead>Capital Gains Tax</TableHead>
                    <TableHead>Investment Value (After Tax)</TableHead>
                    <TableHead>Total Wealth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentingResults.map((result) => (
                    <TableRow key={result.year}>
                      <TableCell>{result.year}</TableCell>
                      <TableCell>{formatCurrency(result.totalRent)}</TableCell>
                      <TableCell>{formatCurrency(result.monthlySavings)}</TableCell>
                      <TableCell>{formatCurrency(result.amountInvested)}</TableCell>
                      <TableCell>{formatCurrency(result.investmentValueBeforeTax)}</TableCell>
                      <TableCell>{formatCurrency(result.capitalGainsTaxPaid)}</TableCell>
                      <TableCell>{formatCurrency(result.investmentValueAfterTax)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(result.totalWealth)}</TableCell>
                    </TableRow>
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
