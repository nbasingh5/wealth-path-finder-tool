import { HelpCircle } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils/formatters";

interface TableCellWithTooltipProps {
  value: any;
  tooltipContent: string;
  className?: string;
  isCurrency?: boolean;
  isHighlighted?: boolean;
}

/**
 * A reusable table cell component with tooltip
 */
export const TableCellWithTooltip = ({
  value,
  tooltipContent,
  className = "",
  isCurrency = true,
  isHighlighted = false
}: TableCellWithTooltipProps) => {
  // Format the display value based on type
  const displayValue = (() => {
    if (value === undefined || value === null) return "-";
    if (typeof value === "object") return value; // For React nodes
    if (typeof value === "number" && isCurrency) return formatCurrency(value);
    return value.toString();
  })();

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 ${isHighlighted ? "font-medium" : ""} ${className}`}>
            {displayValue}
            <HelpCircle className="h-3 w-3 text-muted-foreground inline-block hover:text-primary" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
