import { TableCell, TableRow } from "../ui/table";
import { formatCurrency } from "@/lib/calculations";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import MonthlyBreakdownTable from "./MonthlyBreakdownTable";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface ExpandableRowProps {
  rowData: any;
  isExpanded: boolean;
  onToggle: () => void;
  columns: { key: string; label: string }[];
}

const ExpandableRow = ({ rowData, isExpanded, onToggle, columns }: ExpandableRowProps) => {
  const year = rowData.year;
  
  // Calculate tooltip explanations for each cell based on column key
  const getTooltipContent = (key: string) => {
    switch(key) {
      case 'yearlyIncome':
        return "Annual income, potentially with yearly increases applied.";
      
      case 'mortgagePayment':
        return "Total of principal and interest payments for the year.";
      
      case 'principalPaid':
        return "Amount paid toward reducing the loan principal this year.";
      
      case 'interestPaid':
        return "Interest portion of mortgage payments this year.";
      
      case 'loanBalance':
        return "Remaining mortgage balance at the end of this year.";
      
      case 'propertyTaxes':
        return "Annual property taxes based on home value.";
      
      case 'homeInsurance':
        return "Annual home insurance cost based on home value.";
      
      case 'maintenanceCosts':
        return "Annual home maintenance costs.";
      
      case 'homeValue':
        return "Current home value after appreciation.";
      
      case 'homeEquity':
        return "Home value minus remaining loan balance.";
      
      case 'totalRent':
        return "Annual rent payments.";
      
      case 'leftoverIncome':
        return "Annual income minus housing expenses.";
      
      case 'monthlySavings':
        return "Average monthly amount available for investment.";
      
      case 'amountInvested':
        return year === 0 
          ? "Initial investment amount."
          : "Cumulative amount contributed to investments.";
      
      case 'investmentEarnings':
        return "Growth from investments this year (excluding new contributions).";
      
      case 'leftoverInvestmentValue':
        return "Total market value of investments.";
      
      case 'investmentValueBeforeTax':
        return "Market value of investments before capital gains tax.";
      
      case 'investmentValueAfterTax':
        return "Market value of investments after capital gains tax.";
      
      case 'capitalGainsTaxPaid':
        return "Capital gains tax on investment earnings.";
      
      case 'totalWealth':
        return "Total wealth including home equity, investments, and security deposit.";
      
      case 'difference':
        return "Difference between buying and renting wealth (positive means buying is better).";
      
      case 'betterOption':
        return "Which option provides better financial outcome at this point.";
            
      default:
        return "Value for year " + year;
    }
    }
  
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
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      {col.key === 'betterOption' 
                        ? rowData[col.key]
                        : typeof rowData[col.key] === 'number'
                          ? formatCurrency(rowData[col.key]) 
                          : rowData[col.key] !== undefined
                            ? rowData[col.key]
                            : '-'}
                      <HelpCircle className="h-3 w-3 text-muted-foreground inline-block hover:text-primary" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    {getTooltipContent(col.key)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </TableCell>
        ))}
      </TableRow>
      
      {isExpanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={columns.length}>
            <MonthlyBreakdownTable 
              year={year}
              columns={columns}
              rowData={rowData}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ExpandableRow;