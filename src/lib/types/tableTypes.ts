// Table-specific type definitions

// Generic column definition type
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
}

// Monthly data types for tables
export interface MonthlyTableData {
  month: number;
  yearlyIncome: number;
  leftoverIncome: number;
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
  investementsWithEarnings?: number;
  amountInvested: number;
  investmentEarnings: number;
  monthlySavings: number;
  investmentValueBeforeTax?: number;
  capitalGainsTaxPaid?: number;
  investmentValueAfterTax?: number;
  totalWealthBuying: number;
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
  leftoverIncome: number;
  amountInvested: number;
  investmentEarnings: number;
  investementsWithEarnings?: number;
  loanBalance?: number;
  homeValue?: number;
  homeEquity?: number;
  totalWealthBuying: number;
  initialInvestment?: number;
  additionalContributions?: number;
  monthlySavings?: number;
  investmentValueBeforeTax?: number;
  capitalGainsTaxPaid?: number;
  investmentValueAfterTax?: number;
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
