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
    
    // Complete month-by-month calculation for all values
    
    // Initialize starting values
    const yearlyIncome = rowData.yearlyIncome || 100000; // Annual income
    const monthlyIncome = yearlyIncome / 12; // Monthly income
    const monthlyRent = rowData.totalRent ? rowData.totalRent / 12 : 2000; // Monthly rent
    const initialSavings = year === 1 ? 50000 : 0; // Initial savings for year 1
    const monthlySavingsAmount = rowData.leftoverIncome / 12; // Monthly amount saved
    
    // Get annual return rate (default to 10% if not available)
    const annualReturnRate = 10; // Should match investment rate in the form
    const monthlyReturnRate = Math.pow(1 + annualReturnRate / 100, 1/12) - 1;
    
    // Initialize tracking variables
    let currentInvestmentValue = initialSavings; // Start with initial savings
    let totalInvested = initialSavings; // Track total invested amount
    let totalContributions = 0; // Track total contributions from income
    let cumulativeEarnings = 0; // Track cumulative investment earnings
    
    // Process month by month
    for (let month = 1; month <= 12; month++) {
      // Calculate investment earnings for this month
      let investmentEarnings = 0;
      if (month === 1 && year === 1) {
        // First month of year 1 - earnings on initial savings only
        investmentEarnings = initialSavings * monthlyReturnRate;
      } else {
        // All other months - earnings on previous month's total value
        const previousValue = month === 1 
          ? (year === 1 ? initialSavings : 0) // If first month of year > 1
          : monthlyData[month - 2].leftoverInvestmentValue; // Previous month's value
        investmentEarnings = previousValue * monthlyReturnRate;
      }
      
      // Add this month's savings contribution
      totalContributions += monthlySavingsAmount;
      
      // Update investment value: previous value + new contribution + earnings
      currentInvestmentValue = (month === 1 ? initialSavings : monthlyData[month - 2].leftoverInvestmentValue) + 
                               monthlySavingsAmount + 
                               investmentEarnings;
      
      // Track cumulative earnings
      cumulativeEarnings += investmentEarnings;
      
      // Calculate total invested amount (initial + contributions)
      totalInvested = initialSavings + totalContributions;
      
      // Calculate capital gains tax for this month (if applicable)
      // Assuming 15% capital gains tax rate
      const capitalGainsTaxRate = 0.15;
      const monthlyCapitalGainsTax = investmentEarnings * capitalGainsTaxRate;
      
      // Calculate after-tax investment value
      const afterTaxInvestmentValue = currentInvestmentValue - monthlyCapitalGainsTax;
      
      // Add data for this month
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
        amountInvested: totalInvested, // Total invested so far
        investmentEarnings: investmentEarnings, // This month's earnings
        leftoverInvestmentValue: currentInvestmentValue, // Current total value
        monthlySavings: monthlySavingsAmount, // This month's contribution
        investmentValueBeforeTax: currentInvestmentValue,
        capitalGainsTaxPaid: monthlyCapitalGainsTax,
        investmentValueAfterTax: afterTaxInvestmentValue,
        totalWealth: afterTaxInvestmentValue // Total wealth is the after-tax investment value
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