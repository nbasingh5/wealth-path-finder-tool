// src/lib/utils/mortgageUtils.ts

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
  
  if (monthNumber > numberOfPayments) {
    return {
      principalPayment: 0,
      interestPayment: 0,
      remainingBalance: 0
    };
  }
  
  const monthlyPayment = calculateMonthlyMortgagePayment(
    loanAmount,
    interestRate,
    loanTermYears
  );

  // Special case for 0% interest
  if (monthlyInterestRate === 0) {
    const principalPayment = loanAmount / numberOfPayments;
    const remainingBalance = loanAmount - (principalPayment * (monthNumber - 1));
    return {
      principalPayment,
      interestPayment: 0,
      remainingBalance: Math.max(0, remainingBalance - principalPayment)
    };
  }
  
  // Calculate remaining balance before current payment
  const balanceBeforePayment = loanAmount * 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 
     Math.pow(1 + monthlyInterestRate, monthNumber - 1)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    
  // Calculate interest for current payment
  const interestPayment = balanceBeforePayment * monthlyInterestRate;
  
  // Calculate principal for current payment
  const principalPayment = monthlyPayment - interestPayment;
  
  // Calculate remaining balance after payment
  const remainingBalance = balanceBeforePayment - principalPayment;
  
  return {
    principalPayment,
    interestPayment,
    remainingBalance: Math.max(0, remainingBalance)
  };
};
