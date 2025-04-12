
// Mortgage related calculations

// Calculate monthly mortgage payment
export const calculateMonthlyMortgagePayment = (
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): number => {
  const monthlyInterestRate = interestRate / (12 * 100);
  const numberOfPayments = loanTermYears * 12;

  if (monthlyInterestRate === 0) {
    return loanAmount / numberOfPayments;
  }

  const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
  return (loanAmount * x * monthlyInterestRate) / (x - 1);
};

// Calculate mortgage amortization for a specific month
export const calculateMortgageAmortizationForMonth = (
  loanAmount: number,
  interestRate: number,
  loanTermYears: number,
  monthNumber: number
): { 
  principalPayment: number; 
  interestPayment: number; 
  remainingBalance: number;
} => {
  const monthlyInterestRate = interestRate / (12 * 100);
  const numberOfPayments = loanTermYears * 12;
  const monthlyPayment = calculateMonthlyMortgagePayment(
    loanAmount,
    interestRate,
    loanTermYears
  );
  
  let balance = loanAmount;
  
  // Calculate to the current month
  for (let i = 1; i <= monthNumber; i++) {
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    balance -= principalPayment;
    
    if (i === monthNumber) {
      return {
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(0, balance), // No negative balances
      };
    }
  }
  
  // Default return if month not reached
  return {
    principalPayment: 0,
    interestPayment: 0,
    remainingBalance: loanAmount,
  };
};
