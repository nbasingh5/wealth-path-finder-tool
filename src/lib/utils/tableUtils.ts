// Table utility functions for data transformation and display logic

import { MonthlyTableData, YearlyTableData } from "../types/tableTypes";

/**
 * Generates monthly data based on yearly data
 * @param year The year number
 * @param rowData The yearly data
 * @returns Array of monthly data points
 */
export const generateMonthlyData = (year: number, rowData: YearlyTableData): MonthlyTableData[] => {
  const monthlyData: MonthlyTableData[] = [];
  
  // For Year 0, we'll show the initial values for all 12 months
  if (year === 0) {
    for (let month = 1; month <= 12; month++) {
      // For Year 0, amount invested is just the initial investment
      const amountInvested = rowData.initialInvestment || 0;
      
      const investmentEarnings = rowData.leftoverInvestmentValue 
        ? Math.max(0, rowData.leftoverInvestmentValue - amountInvested)
        : 0;
        
      monthlyData.push({
        month,
        yearlyIncome: rowData.monthlyData?.[0]?.monthlyIncome || 0,
        leftoverIncome: 0, // No payments yet in Year 0
        mortgagePayment: 0,
        principalPaid: 0,
        interestPaid: 0,
        propertyTaxes: 0,
        homeInsurance: 0,
        maintenanceCosts: 0,
        totalRent: rowData.totalRent ? rowData.totalRent / 12 : 0,
        homeValue: rowData.homeValue,
        homeEquity: rowData.homeEquity,
        loanBalance: rowData.loanBalance,
        leftoverInvestmentValue: rowData.leftoverInvestmentValue,
        amountInvested: amountInvested,
        investmentEarnings: investmentEarnings,
        monthlySavings: 0,
        investmentValueBeforeTax: rowData.investmentValueBeforeTax ? rowData.investmentValueBeforeTax / 12 : 0,
        capitalGainsTaxPaid: 0,
        investmentValueAfterTax: rowData.investmentValueAfterTax ? rowData.investmentValueAfterTax / 12 : 0,
        totalWealth: rowData.totalWealth
      });
    }
    return monthlyData;
  }
  
  // Process month by month for years > 0
  for (let month = 1; month <= 12; month++) {
    if (!rowData.monthlyData || !rowData.monthlyData[month-1]) {
      continue; // Skip if monthly data is not available
    }
    
    const monthlyDataPoint = rowData.monthlyData[month-1];
    const monthlyIncome = monthlyDataPoint.monthlyIncome || 0;
    const monthlyRent = monthlyDataPoint.rent || 0;
    const monthlySavingsAmount = monthlyDataPoint.monthlySavings || 0;

    monthlyData.push({
      month,
      yearlyIncome: monthlyIncome,
      totalRent: monthlyRent,
      leftoverIncome: monthlySavingsAmount,
      mortgagePayment: rowData.mortgagePayment ? rowData.mortgagePayment / 12 : 0,
      principalPaid: rowData.principalPaid ? rowData.principalPaid / 12 : 0,
      interestPaid: rowData.interestPaid ? rowData.interestPaid / 12 : 0,
      propertyTaxes: rowData.propertyTaxes ? rowData.propertyTaxes / 12 : 0,
      homeInsurance: rowData.homeInsurance ? rowData.homeInsurance / 12 : 0,
      maintenanceCosts: rowData.maintenanceCosts ? rowData.maintenanceCosts / 12 : 0,
      homeValue: calculateMonthlyValue(rowData.homeValue, month, year),
      homeEquity: calculateMonthlyValue(rowData.homeEquity, month, year),
      loanBalance: calculateMonthlyValue(rowData.loanBalance, month, year),
      amountInvested: monthlyDataPoint.amountInvested || 0,
      investmentEarnings: monthlyDataPoint.investmentEarnings || 0,
      monthlySavings: monthlySavingsAmount,
      investmentValueBeforeTax: monthlyDataPoint.investmentValueBeforeTax || 0,
      capitalGainsTaxPaid: monthlyDataPoint.capitalGainsTax || 0,
      investmentValueAfterTax: monthlyDataPoint.investmentValueAfterTax || 0,
      totalWealth: monthlyDataPoint.totalWealth || 0,
    });
  }
  
  return monthlyData;
};

/**
 * Helper function to estimate monthly accumulating values
 * This approximates growth throughout the year
 */
export const calculateMonthlyValue = (yearEndValue?: number, month?: number, year?: number): number | undefined => {
  if (!yearEndValue || !month || !year || year === 0) return yearEndValue;
  
  // For year 1, use a more accurate formula that accounts for initial investments
  if (year === 1) {
    const initialValue = yearEndValue / Math.pow(1.01, 12); // Approximate starting value
    const monthlyGrowthRate = Math.pow(yearEndValue / initialValue, 1/12);
    return initialValue * Math.pow(monthlyGrowthRate, month);
  }
  
  // For other years, use a more accurate compounding formula
  // instead of simple linear approximation
  const monthlyGrowthRate = Math.pow(1.01, 1/12); // Approximate 1% monthly growth
  return yearEndValue / Math.pow(monthlyGrowthRate, 12-month);
};

/**
 * Get tooltip explanation for a column
 */
export const getTooltipContent = (key: string): string => {
  switch(key) {
    // Income and expenses
    case 'yearlyIncome':
      return "Annual income, potentially with yearly increases applied.";
    case 'mortgagePayment':
      return "Total of principal and interest payments for the year.";
    case 'principalPaid':
      return "Amount paid toward reducing the loan principal this year.";
    case 'interestPaid':
      return "Interest portion of mortgage payments this year.";
    case 'propertyTaxes':
      return "Annual property taxes based on home value.";
    case 'homeInsurance':
      return "Annual home insurance cost based on home value.";
    case 'maintenanceCosts':
      return "Annual home maintenance costs.";
    case 'totalRent':
      return "Annual rent payments.";
    case 'leftoverIncome':
      return "Annual income minus housing expenses.";
    
    // Property values
    case 'homeValue':
      return "Current home value after appreciation.";
    case 'homeEquity':
      return "Home value minus remaining loan balance.";
    case 'loanBalance':
      return "Remaining mortgage balance at the end of this year.";
    
    // Investment values
    case 'monthlySavings':
      return "Amount available for investment each month.";
    case 'amountInvested':
      return "Cumulative contributions to investments.";
    case 'investmentEarnings':
      return "Investment returns for this period.";
    case 'leftoverInvestmentValue':
      return "Total market value of investments.";
    case 'investmentValueBeforeTax':
      return "Value of investments before capital gains tax.";
    case 'capitalGainsTaxPaid':
      return "Capital gains tax on investment earnings.";
    case 'investmentValueAfterTax':
      return "Investment value after capital gains tax.";
    
    // Wealth and comparison
    case 'totalWealth':
      return "Total wealth including home equity and investments.";
    case 'difference':
      return "Difference between buying and renting wealth (positive means buying is better).";
    case 'betterOption':
      return "Which option provides better financial outcome at this point.";
    
    // Monthly specific
    case 'month':
      return "Month number within the year.";
    
    // Default
    default:
      return `Value for ${key}`;
  }
};

/**
 * Get monthly-specific tooltip content
 */
export const getMonthlyTooltipContent = (key: string): string => {
  switch(key) {
    case 'yearlyIncome':
      return "Annual income divided by 12.";
    case 'mortgagePayment':
      return "Monthly mortgage payment (principal + interest).";
    case 'principalPaid':
      return "Amount paid toward reducing the loan principal this month.";
    case 'interestPaid':
      return "Interest portion of the mortgage payment this month.";
    case 'propertyTaxes':
      return "Monthly property tax payment.";
    case 'homeInsurance':
      return "Monthly home insurance payment.";
    case 'maintenanceCosts':
      return "Monthly home maintenance costs.";
    case 'homeValue':
      return "Estimated home value for this month.";
    case 'homeEquity':
      return "Home value minus remaining loan balance.";
    case 'loanBalance':
      return "Remaining mortgage balance.";
    case 'leftoverIncome':
      return "Monthly income minus housing expenses.";
    case 'monthlySavings':
      return "Amount available for investment this month.";
    case 'amountInvested':
      return "Cumulative contributions to investments.";
    case 'investmentEarnings':
      return "Investment returns for this month.";
    case 'leftoverInvestmentValue':
      return "Value of investments at this point in the year.";
    case 'investmentValueBeforeTax':
      return "Value of investments before capital gains tax.";
    case 'capitalGainsTaxPaid':
      return "Capital gains tax paid. This is only applied at the end of the year (month 12).";
    case 'investmentValueAfterTax':
      return "Investment value after capital gains tax.";
    case 'totalWealth':
      return "Total wealth including home equity and investments.";
    default:
      return "Value for month " + key;
  }
};
