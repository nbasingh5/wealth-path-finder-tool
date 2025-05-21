import { TableCell, TableRow } from "../ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import MonthlyBreakdownTable from "./MonthlyBreakdownTable";
import { TableCellWithTooltip } from "../ui/table-cell-with-tooltip";
import { ExpandableRowProps, MonthlyTableData, TableColumn, YearlyTableData } from "@/lib/types/tableTypes";
import { getTooltipContent } from "@/lib/utils/tableUtils";

const ExpandableRow = ({ rowData, isExpanded, onToggle, columns }: ExpandableRowProps) => {
  const year = rowData.year;
  return (
    <>
      <TableRow 
        className="cursor-pointer hover:bg-muted/60" 
        onClick={onToggle}
      >
        {columns.map((col, index) => {
          const colKey = col.key as string;
          
          if (index === 0) {
            return (
              <TableCell key={colKey}>
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {rowData[colKey]}
                </div>
              </TableCell>
            );
          }
          
          // Special handling for betterOption which is already a React node
          if (colKey === 'betterOption' && typeof rowData[colKey] === 'object') {
            return (
              <TableCell key={colKey}>
                {rowData[colKey]}
              </TableCell>
            );
          }
          
          return (
            <TableCell key={colKey}>
              <TableCellWithTooltip
                value={rowData[colKey]}
                tooltipContent={getTooltipContent(colKey)}
              />
            </TableCell>
          );
        })}
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
