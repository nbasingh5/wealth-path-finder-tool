
import { Table, TableBody, TableHeader, TableRow, TableHead } from "../ui/table";
import ExpandableRow from "./ExpandableRow";

interface ComparisonTableTabProps {
  data: any[];
  columns: { key: string; label: string }[];
  tabId: string;
  expandedRows: Record<string, boolean>;
  onToggleRow: (tabId: string, rowId: number) => void;
}

const ComparisonTableTab = ({ 
  data, 
  columns, 
  tabId, 
  expandedRows, 
  onToggleRow 
}: ComparisonTableTabProps) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={col.key}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <ExpandableRow 
              key={row.year}
              rowData={tabId === 'summary' ? {
                ...row,
                betterOption: (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.difference > 0
                      ? "bg-buy/10 text-buy-dark"
                      : row.difference < 0
                      ? "bg-rent/10 text-rent-dark"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {row.difference > 0
                      ? "Buying"
                      : row.difference < 0
                      ? "Renting"
                      : "Equal"}
                  </span>
                )
              } : row}
              isExpanded={!!expandedRows[`${tabId}-${row.year}`]}
              onToggle={() => onToggleRow(tabId, row.year)}
              columns={columns}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComparisonTableTab;
