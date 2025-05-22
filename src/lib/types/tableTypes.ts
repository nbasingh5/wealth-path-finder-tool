// Table-specific type definitions

// Generic column definition type
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  isVisible?: boolean;
  isImportant?: boolean; // Important columns are visible by default and can't be hidden
}

// Monthly data types for tables
export interface MonthlyTableData {
  month: number;
  yearlyIncome: number;
  mortgagePayment?: number;
  principalPaid?: number;
  interestPaid?: number;
  propertyTaxes?: number;
  homeInsurance?: number;
  maintenanceCosts?: number;
  totalRent?: number;
  homeValue?: number;
  homeEquity?: number;
  loanBalance?: number;
  investmentsWithEarnings?: number;
  amountInvested: number;
  investmentEarnings: number;
  yearlySavings: number;
  investmentValueBeforeTax?: number;
  capitalGainsTaxPaid?: number;
  totalWealthBuying: number;
  totalWealthRenting: number;
}

// Yearly data types for tables
export interface YearlyTableData {
  year: number;
  yearlyIncome: number;
  mortgagePayment?: number;
  principalPaid?: number;
  interestPaid?: number;
  propertyTaxes?: number;
  homeInsurance?: number;
  maintenanceCosts?: number;
  totalRent?: number;
  yearlySavings: number;
  amountInvested: number;
  investmentEarnings: number;
  investmentsWithEarnings?: number;
  loanBalance?: number;
  homeValue?: number;
  homeEquity?: number;
  totalWealthBuying: number;
  initialInvestment?: number;
  additionalContributions?: number;
  investmentValueBeforeTax?: number;
  capitalGainsTaxPaid?: number;
  annualReturnRate?: number;
  capitalGainsTaxRate?: number;
  monthlyData?: any[]; // Will be typed more specifically in components
}

// Comparison data for tables
export interface ComparisonTableData extends YearlyTableData {
  buyingWealth: number;
  rentingWealth: number;
  difference: number;
  cumulativeBuyingCosts: number;
  cumulativeRentingCosts: number;
  buyingLeftoverIncome: number;
  rentingLeftoverIncome: number;
  buyingLeftoverInvestmentValue: number;
  rentingLeftoverInvestmentValue: number;
  betterOption?: React.ReactNode;
}

// Props for table components
export interface MonthlyBreakdownTableProps {
  year: number;
  columns: TableColumn<MonthlyTableData>[];
  rowData: YearlyTableData;
}

export interface ComparisonTableTabProps {
  data: YearlyTableData[] | ComparisonTableData[];
  columns: TableColumn<YearlyTableData | ComparisonTableData>[];
  tabId: string;
  expandedRows: Record<string, boolean>;
  onToggleRow: (tabId: string, rowId: number) => void;
}

export interface ExpandableRowProps {
  rowData: any;
  isExpanded: boolean;
  onToggle: () => void;
  columns: TableColumn<any>[];
}
