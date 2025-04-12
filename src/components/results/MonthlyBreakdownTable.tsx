
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatCurrency } from "@/lib/calculations";

interface MonthlyBreakdownTableProps {
  year: number;
  columns: { key: string; label: string }[];
  rowData: any;
}

const MonthlyBreakdownTable = ({ year, columns, rowData }: MonthlyBreakdownTableProps) => {
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
            {year > 0 ? (
              [...Array(12)].map((_, i) => {
                const month = i + 1;
                return (
                  <TableRow key={month}>
                    <TableCell>{month}</TableCell>
                    {columns.slice(1).map(col => (
                      <TableCell key={col.key}>
                        {typeof rowData[col.key] === 'number'
                          ? col.key === 'yearlyIncome' || col.key === 'leftoverIncome'
                            ? formatCurrency(rowData[col.key] / 12)
                            : formatCurrency(rowData[col.key] / 12)
                          : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  Year 0 represents initial values before any payments
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MonthlyBreakdownTable;
