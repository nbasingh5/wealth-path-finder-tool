import { TableCell, TableRow } from "../ui/table";
import { formatCurrency } from "@/lib/calculations";
import { ChevronDown, ChevronUp } from "lucide-react";
import MonthlyBreakdownTable from "./MonthlyBreakdownTable";

interface ExpandableRowProps {
  rowData: any;
  isExpanded: boolean;
  onToggle: () => void;
  columns: { key: string; label: string }[];
}

const ExpandableRow = ({ rowData, isExpanded, onToggle, columns }: ExpandableRowProps) => {
  const year = rowData.year;
  
  // For debugging: log the row data to see what fields are available
  if (process.env.NODE_ENV === 'development') {
    console.debug(`Row data for year ${year}:`, 
      Object.keys(rowData).filter(key => ['initialInvestment', 'additionalContributions', 'monthlySavings'].includes(key))
        .reduce((obj, key) => {
          obj[key] = rowData[key];
          return obj;
        }, {})
    );
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
              col.key === 'betterOption' 
                ? rowData[col.key]
                : typeof rowData[col.key] === 'number'
                  ? formatCurrency(rowData[col.key]) 
                  : rowData[col.key] !== undefined
                    ? rowData[col.key]
                    : '-'
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