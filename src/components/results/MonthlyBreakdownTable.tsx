import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TableCellWithTooltip } from "../ui/table-cell-with-tooltip";
import { MonthlyTableData, TableColumn, YearlyTableData } from "@/lib/types/tableTypes";
import { generateMonthlyData, getMonthlyTooltipContent } from "@/lib/utils/tableUtils";

interface MonthlyBreakdownTableProps {
  year: number;
  columns: TableColumn<any>[];
  rowData: YearlyTableData;
}

const MonthlyBreakdownTable = ({ year, columns, rowData }: MonthlyBreakdownTableProps) => {
  
  // Generate monthly data using the utility function
  const monthlyData: MonthlyTableData[] = generateMonthlyData(year, rowData);
  // const monthlyData: MonthlyTableData[] = rowData.monthlyData || [];
  console.log("Monthly Data:", monthlyData);
  return (
    <div className="py-2 w-full">
      <h4 className="text-sm font-medium mb-2">Monthly Breakdown for Year {year}</h4>
      <div className="overflow-x-auto w-full max-w-12xl">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Month</TableHead>
              {columns.slice(1).map((col: TableColumn<MonthlyTableData>) => (
                <TableHead key={col.key as string} className="whitespace-nowrap px-1 text-xs">{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyData.map((monthData) => (
              <TableRow key={monthData.month} className={monthData.month === 12 ? "bg-muted/20" : ""}>
                <TableCell className="whitespace-nowrap px-1 w-16 text-xs">{monthData.month}</TableCell>
                {columns.slice(1).map((col: TableColumn<MonthlyTableData>) => {
                  const colKey = col.key as string;
                  const isHighlighted = colKey === 'capitalGainsTaxPaid' && monthData.month === 12;
                  
                  return (
                    <TableCell key={colKey} className="whitespace-nowrap px-1 text-xs">
                      <TableCellWithTooltip
                        value={monthData[colKey as keyof MonthlyTableData]}
                        tooltipContent={getMonthlyTooltipContent(colKey)}
                        className="gap-0.5"
                        isHighlighted={isHighlighted}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MonthlyBreakdownTable;
