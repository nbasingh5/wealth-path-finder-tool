import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatCurrency } from "@/lib/calculations";
import { HelpCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface MonthlyBreakdownTableProps {
  year: number;
  columns: { key: string; label: string }[];
  rowData: any;
}

const MonthlyBreakdownTable = ({ year, columns, rowData }: MonthlyBreakdownTableProps) => {
  console.log({ year, columns, rowData })
  // Generate monthly data based on yearly data
  const generateMonthlyData = () => {
    const monthlyData = [];
    
    // For Year 0, we'll show the initial values for all 12 months
    if (year === 0) {
      for (let month = 1; month <= 12; month++) {
        // For Year 0, amount invested is just the initial investment
        let amountInvested = rowData.initialInvestment || 0;
        
        const investmentEarnings = rowData.leftoverInvestmentValue 
          ? Math.max(0, rowData.leftoverInvestmentValue - amountInvested)
          : 0;
          
        monthlyData.push({
          month,
          yearlyIncome: rowData.monthlyData.monthlyIncome, // Monthly income
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
          amountInvested: amountInvested,
          investmentEarnings: investmentEarnings,
          monthlySavings: 0,
          investmentValueBeforeTax: rowData.investmentValueBeforeTax ? rowData.investmentValueBeforeTax / 12 : 0,
          capitalGainsTaxPaid: 0,
          investmentValueAfterTax: rowData.investmentValueAfterTax ? rowData.investmentValueAfterTax / 12 : 0,
          totalWealth: rowData.totalWealth
        });
      }
      return monthlyData;
    }
    
    // Initialize starting values
    const initialSavings = year === 1 ? rowData.initialInvestment : 0; // Initial savings for year 1
    
    // Get annual return rate (default to 10% if not available)
    const annualReturnRate = rowData.annualReturnRate; // Should match investment rate in the form
    const monthlyReturnRate = Math.pow(1 + annualReturnRate / 100, 1/12) - 1;
    
    // Process month by month
    for (let month = 1; month <= 12; month++) {
      const monthlyIncome = rowData.monthlyData[month-1].monthlyIncome; // Monthly income
      const monthlyRent = rowData.monthlyData[month-1].rent; // Monthly rent
      const monthlySavingsAmount = rowData.monthlyData[month-1].monthlySavings; // Monthly amount saved

      monthlyData.push({
        month,
        yearlyIncome: monthlyIncome,
        totalRent: monthlyRent,
        leftoverIncome: monthlySavingsAmount,
        mortgagePayment: rowData.mortgagePayment ? rowData.mortgagePayment / 12 : 0,
        principalPaid: rowData.principalPaid ? rowData.principalPaid / 12 : 0,
        interestPaid: rowData.interestPaid ? rowData.interestPaid / 12 : 0,
        propertyTaxes: rowData.propertyTaxes ? rowData.propertyTaxes / 12 : 0,
        homeInsurance: rowData.homeInsurance ? rowData.homeInsurance / 12 : 0,
        maintenanceCosts: rowData.maintenanceCosts ? rowData.maintenanceCosts / 12 : 0,
        homeValue: calculateMonthlyValue(rowData.homeValue, month, year),
        homeEquity: calculateMonthlyValue(rowData.homeEquity, month, year),
        loanBalance: calculateMonthlyValue(rowData.loanBalance, month, year),
        amountInvested: rowData.monthlyData[month-1].amountInvested,
        investmentEarnings: rowData.monthlyData[month-1].investmentEarnings, // This month's earnings
        // leftoverInvestmentValue: currentInvestmentValue, 
        monthlySavings: monthlySavingsAmount,
        investmentValueBeforeTax: rowData.monthlyData[month-1].investmentValueBeforeTax,
        capitalGainsTaxPaid: rowData.monthlyData[month-1].capitalGainsTax,
        investmentValueAfterTax: rowData.monthlyData[month-1].investmentValueAfterTax,
        totalWealth: rowData.monthlyData[month-1].totalWealth,
      });
    }
    
    return monthlyData;
  };
  
  // Helper function to estimate monthly accumulating values
  // This approximates growth throughout the year
  const calculateMonthlyValue = (yearEndValue: number, month: number, year: number) => {
    if (!yearEndValue || year === 0) return yearEndValue;
    
    // For year 1, use a more accurate formula that accounts for initial investments
    if (year === 1) {
      const initialValue = yearEndValue / Math.pow(1.01, 12); // Approximate starting value
      const monthlyGrowthRate = Math.pow(yearEndValue / initialValue, 1/12);
      return initialValue * Math.pow(monthlyGrowthRate, month);
    }
    
    // For other years, use a more accurate compounding formula
    // instead of simple linear approximation
    const monthlyGrowthRate = Math.pow(1.01, 1/12); // Approximate 1% monthly growth
    return yearEndValue / Math.pow(monthlyGrowthRate, 12-month);
  };
  
  // Get tooltip explanation for a column
  const getTooltipContent = (key: string) => {
    switch(key) {
      case 'yearlyIncome':
        return "Annual income divided by 12.";
      
      case 'mortgagePayment':
        return "Monthly mortgage payment (principal + interest).";
      
      case 'principalPaid':
        return "Amount paid toward reducing the loan principal this month.";
      
      case 'interestPaid':
        return "Interest portion of the mortgage payment this month.";
      
      case 'propertyTaxes':
        return "Monthly property tax payment.";
      
      case 'homeInsurance':
        return "Monthly home insurance payment.";
      
      case 'maintenanceCosts':
        return "Monthly home maintenance costs.";
      
      case 'homeValue':
        return "Estimated home value for this month.";
      
      case 'homeEquity':
        return "Home value minus remaining loan balance.";
      
      case 'loanBalance':
        return "Remaining mortgage balance.";
      
      case 'leftoverIncome':
        return "Monthly income minus housing expenses.";
      
      case 'monthlySavings':
        return "Amount available for investment this month.";
      
      case 'amountInvested':
        return "Cumulative contributions to investments.";
      
      case 'investmentEarnings':
        return "Investment returns for this month.";
      
      case 'leftoverInvestmentValue':
        return "Value of investments at this point in the year.";
      
      case 'investmentValueBeforeTax':
        return "Value of investments before capital gains tax.";
      
      case 'capitalGainsTaxPaid':
        return "Capital gains tax paid. This is only applied at the end of the year (month 12).";
      
      case 'investmentValueAfterTax':
        return "Investment value after capital gains tax.";
      
      case 'totalWealth':
        return "Total wealth including home equity and investments.";
      
      default:
        return "Value for month " + key;
    }
  };
  
  const monthlyData = generateMonthlyData();

  return (
    <div className="py-2 w-full">
      <h4 className="text-sm font-medium mb-2">Monthly Breakdown for Year {year}</h4>
      <div className="overflow-x-auto w-full max-w-12xl">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Month</TableHead>
              {columns.slice(1).map(col => (
                <TableHead key={col.key} className="whitespace-nowrap px-1 text-xs">{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyData.map((monthData) => (
              <TableRow key={monthData.month} className={monthData.month === 12 ? "bg-muted/20" : ""}>
                <TableCell className="whitespace-nowrap px-1 w-16 text-xs">{monthData.month}</TableCell>
                {columns.slice(1).map(col => (
                  <TableCell key={col.key} className={`whitespace-nowrap px-1 text-xs ${col.key === 'capitalGainsTaxPaid' && monthData.month === 12 ? "font-medium" : ""}`}>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-0.5">
                            {typeof monthData[col.key] === 'number'
                              ? formatCurrency(monthData[col.key])
                              : monthData[col.key] || '-'}
                            <HelpCircle className="h-2.5 w-2.5 text-muted-foreground inline-block hover:text-primary" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {getTooltipContent(col.key)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
