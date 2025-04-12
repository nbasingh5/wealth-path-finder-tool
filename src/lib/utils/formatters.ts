
// Formatting utility functions

// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format percentages
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
