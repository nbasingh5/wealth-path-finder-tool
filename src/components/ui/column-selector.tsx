import { TableColumn } from "@/lib/types/tableTypes";
import { Button } from "./button";
import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ColumnSelectorProps<T> {
  columns: TableColumn<T>[];
  onChange: (updatedColumns: TableColumn<T>[]) => void;
}

export function ColumnSelector<T>({ columns, onChange }: ColumnSelectorProps<T>) {
  const [open, setOpen] = useState(false);

  const handleColumnToggle = (columnKey: string) => {
    const updatedColumns = columns.map((col) => {
      if (col.key === columnKey && !col.isImportant) {
        return { ...col, isVisible: !col.isVisible };
      }
      return col;
    });
    
    onChange(updatedColumns);
  };

  // Prevent menu from closing when selecting items
  const handleSelect = (e: Event) => {
    e.preventDefault();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]" onCloseAutoFocus={(e) => e.preventDefault()}>
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.key as string}
            checked={column.isVisible !== false}
            onCheckedChange={() => handleColumnToggle(column.key as string)}
            disabled={column.isImportant}
            className={cn(column.isImportant ? "opacity-50" : "")}
            onSelect={handleSelect}
          >
            {column.label}
            {column.isImportant && (
              <span className="ml-2 text-xs text-muted-foreground">(required)</span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
