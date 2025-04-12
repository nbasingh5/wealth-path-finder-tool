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
    
    // For years > 0, we'll calculate estimated monthly values
    for (let month = 1; month <= 12; month++) {
      // We'll use the investment data directly from rowData when available
      let amountInvested = rowData.amountInvested || 0;
      let investmentEarnings = 0;
      
      // For monthly investment earnings, we distribute the annual earnings over months
      if (rowData.investmentEarnings !== undefined) {
        // Scale earnings by month (simulate gradual growth)
        investmentEarnings = rowData.investmentEarnings * (month / 12);
      }
      
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
        
        amountInvested: amountInvested / 12 * month, // Scale by month
        investmentEarnings: calculateMonthlyValue(investmentEarnings, month, year),
        
        monthlySavings: rowData.monthlySavings || 0,
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
    
    // Simple linear approximation (month/12 of the yearly change)
    return yearEndValue * (month / 12);
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
        return "Estimated capital gains tax for this month.";
      
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
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            {typeof monthData[col.key] === 'number'
                              ? formatCurrency(monthData[col.key])
                              : monthData[col.key] || '-'}
                            <HelpCircle className="h-3 w-3 text-muted-foreground inline-block hover:text-primary" />
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