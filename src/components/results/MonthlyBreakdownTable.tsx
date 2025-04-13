
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
      
      case 'investmentValue':
        return "Value of investments at this point.";
      
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
  
  // Get monthly data from the rowData if it exists
  const monthlyData = rowData.monthlyData || [];
  
  // If we don't have monthly data, display a message
  if (monthlyData.length === 0) {
    return (
      <div className="py-2">
        <h4 className="text-sm font-medium mb-2">Monthly Breakdown for Year {year}</h4>
        <p className="text-sm text-muted-foreground">No monthly data available for this year.</p>
      </div>
    );
  }

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
            {monthlyData.map((monthData: any) => (
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
                              : monthData[col.key] !== undefined
                                ? monthData[col.key]
                                : '-'}
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
