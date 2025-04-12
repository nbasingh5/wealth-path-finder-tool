import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatCurrency } from "@/lib/calculations";

interface MonthlyBreakdownTableProps {
  year: number;
  columns: { key: string; label: string }[];
  rowData: any;
}

const MonthlyBreakdownTable = ({ year, columns, rowData }: MonthlyBreakdownTableProps) => {
  // Generate monthly data based on yearly data
  const generateMonthlyData = () => {
    const monthlyData = [];
    
    // For Year 0, we'll show the initial values for all 12 months
    if (year === 0) {
      for (let month = 1; month <= 12; month++) {
        monthlyData.push({
          month,
          yearlyIncome: rowData.yearlyIncome / 12, // Monthly income
          leftoverIncome: 0, // No payments yet in Year 0
          mortgagePayment: 0,
          principalPaid: 0,
          interestPaid: 0,
          propertyTaxes: 0,
          homeInsurance: 0,
          maintenanceCosts: 0,
          totalRent: rowData.totalRent ? rowData.totalRent / 12 : 0,
          homeValue: rowData.homeValue,
          homeEquity: rowData.homeEquity,
          loanBalance: rowData.loanBalance,
          leftoverInvestmentValue: rowData.leftoverInvestmentValue,
          monthlySavings: 0,
          amountInvested: 0,
          investmentValueBeforeTax: rowData.investmentValueBeforeTax ? rowData.investmentValueBeforeTax / 12 : 0,
          capitalGainsTaxPaid: 0,
          investmentValueAfterTax: rowData.investmentValueAfterTax ? rowData.investmentValueAfterTax / 12 : 0,
          totalWealth: rowData.totalWealth
        });
      }
      return monthlyData;
    }
    
    // For years > 0, we'll calculate estimated monthly values
    for (let month = 1; month <= 12; month++) {
      // Create proportional monthly values based on yearly totals
      monthlyData.push({
        month,
        yearlyIncome: rowData.yearlyIncome / 12,
        leftoverIncome: rowData.leftoverIncome / 12,
        mortgagePayment: rowData.mortgagePayment ? rowData.mortgagePayment / 12 : 0,
        principalPaid: rowData.principalPaid ? rowData.principalPaid / 12 : 0,
        interestPaid: rowData.interestPaid ? rowData.interestPaid / 12 : 0,
        propertyTaxes: rowData.propertyTaxes ? rowData.propertyTaxes / 12 : 0,
        homeInsurance: rowData.homeInsurance ? rowData.homeInsurance / 12 : 0,
        maintenanceCosts: rowData.maintenanceCosts ? rowData.maintenanceCosts / 12 : 0,
        totalRent: rowData.totalRent ? rowData.totalRent / 12 : 0,
        
        // The following values are cumulative and would increase throughout the year
        // So we'll show the estimated value for that specific month
        homeValue: calculateMonthlyValue(rowData.homeValue, month, year),
        homeEquity: calculateMonthlyValue(rowData.homeEquity, month, year),
        loanBalance: calculateMonthlyValue(rowData.loanBalance, month, year),
        leftoverInvestmentValue: calculateMonthlyValue(rowData.leftoverInvestmentValue, month, year),
        
        monthlySavings: rowData.monthlySavings || 0,
        amountInvested: calculateMonthlyValue(rowData.amountInvested, month, year),
        investmentValueBeforeTax: calculateMonthlyValue(rowData.investmentValueBeforeTax, month, year),
        capitalGainsTaxPaid: rowData.capitalGainsTaxPaid ? rowData.capitalGainsTaxPaid / 12 : 0,
        investmentValueAfterTax: calculateMonthlyValue(rowData.investmentValueAfterTax, month, year),
        totalWealth: calculateMonthlyValue(rowData.totalWealth, month, year)
      });
    }
    
    return monthlyData;
  };
  
  // Helper function to estimate monthly accumulating values
  // This approximates growth throughout the year
  const calculateMonthlyValue = (yearEndValue: number, month: number, year: number) => {
    if (!yearEndValue || year === 0) return yearEndValue;
    
    // Find the previous year's value from rowData if available
    // This would require rowData to include the previous year's values
    // If not available, we'll just use a simple linear approximation
    
    // Simple linear approximation (month/12 of the yearly change)
    return yearEndValue * (month / 12);
  };
  
  const monthlyData = generateMonthlyData();

  return (
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
            {monthlyData.map((monthData) => (
              <TableRow key={monthData.month}>
                <TableCell>{monthData.month}</TableCell>
                {columns.slice(1).map(col => (
                  <TableCell key={col.key}>
                    {typeof monthData[col.key] === 'number'
                      ? formatCurrency(monthData[col.key])
                      : monthData[col.key] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MonthlyBreakdownTable;