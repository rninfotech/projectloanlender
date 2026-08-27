/**
 * Loan Lender — Loan Calculator Engine
 * Supports all interest calculation methods for Indian micro-finance
 */

export interface LoanCalculationInput {
  principalAmount: number;
  interestRate: number; // Annual percentage
  loanType: LoanType;
  interestMethod: InterestMethod;
  numInstallments: number;
  tenureMonths?: number;
  customFrequencyDays?: number;
}

export interface LoanCalculationResult {
  totalInterest: number;
  totalPayable: number;
  installmentAmount: number;
  installments: InstallmentDetail[];
  maturityDate: Date;
}

export interface InstallmentDetail {
  installmentNo: number;
  dueDate: Date;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  outstandingAfter: number;
}

export type LoanType =
  | "daily"
  | "weekly"
  | "monthly_emi"
  | "monthly_interest"
  | "gold"
  | "auto"
  | "enterprise"
  | "custom"
  | "bullet";

export type InterestMethod = "flat" | "reducing" | "simple";

/**
 * Main calculator function — routes to the correct method
 */
export function calculateLoan(input: LoanCalculationInput): LoanCalculationResult {
  const { interestMethod } = input;

  switch (interestMethod) {
    case "flat":
      return calculateFlatRate(input);
    case "reducing":
      return calculateReducingBalance(input);
    case "simple":
      return calculateSimpleInterest(input);
    default:
      throw new Error(`Unknown interest method: ${interestMethod}`);
  }
}

/**
 * Flat Rate Calculation
 * Total Interest = Principal × Rate% × Tenure / 12
 * EMI = (Principal + Total Interest) / Installments
 * Used for: Daily, Weekly, Monthly EMI, Auto, Enterprise
 */
function calculateFlatRate(input: LoanCalculationInput): LoanCalculationResult {
  const { principalAmount, interestRate, numInstallments, loanType } = input;

  // Calculate total interest based on loan type
  let totalInterest: number;
  
  if (loanType === "daily" || loanType === "weekly") {
    // For daily/weekly: simple percentage of principal
    totalInterest = principalAmount * (interestRate / 100);
  } else {
    // For monthly: annualized
    const tenureMonths = input.tenureMonths || numInstallments;
    totalInterest = principalAmount * (interestRate / 100) * (tenureMonths / 12);
  }

  const totalPayable = principalAmount + totalInterest;
  const installmentAmount = Math.round((totalPayable / numInstallments) * 100) / 100;

  // Generate installment schedule
  const principalPerInstallment = Math.round((principalAmount / numInstallments) * 100) / 100;
  const interestPerInstallment = Math.round((totalInterest / numInstallments) * 100) / 100;

  const installments: InstallmentDetail[] = [];
  let outstanding = principalAmount;
  const startDate = new Date();

  for (let i = 1; i <= numInstallments; i++) {
    const dueDate = getInstallmentDueDate(startDate, i, loanType, input.customFrequencyDays);
    
    // Last installment adjusts for rounding
    const isLast = i === numInstallments;
    const pDue = isLast
      ? outstanding
      : principalPerInstallment;
    const iDue = isLast
      ? totalInterest - interestPerInstallment * (numInstallments - 1)
      : interestPerInstallment;

    outstanding = Math.max(0, outstanding - pDue);

    installments.push({
      installmentNo: i,
      dueDate,
      principalDue: round2(pDue),
      interestDue: round2(iDue),
      totalDue: round2(pDue + iDue),
      outstandingAfter: round2(outstanding),
    });
  }

  const maturityDate = installments[installments.length - 1].dueDate;

  return {
    totalInterest: round2(totalInterest),
    totalPayable: round2(totalPayable),
    installmentAmount: round2(installmentAmount),
    installments,
    maturityDate,
  };
}

/**
 * Reducing Balance EMI Calculation
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 * Used for: Monthly EMI, Auto, Enterprise
 */
function calculateReducingBalance(input: LoanCalculationInput): LoanCalculationResult {
  const { principalAmount, interestRate, numInstallments, loanType } = input;

  // Monthly interest rate
  const monthlyRate = interestRate / 12 / 100;

  // EMI formula
  const emi =
    (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, numInstallments)) /
    (Math.pow(1 + monthlyRate, numInstallments) - 1);

  const installments: InstallmentDetail[] = [];
  let outstanding = principalAmount;
  let totalInterest = 0;
  const startDate = new Date();

  for (let i = 1; i <= numInstallments; i++) {
    const dueDate = getInstallmentDueDate(startDate, i, loanType, input.customFrequencyDays);
    const interestDue = outstanding * monthlyRate;
    const principalDue = emi - interestDue;

    outstanding = Math.max(0, outstanding - principalDue);
    totalInterest += interestDue;

    installments.push({
      installmentNo: i,
      dueDate,
      principalDue: round2(principalDue),
      interestDue: round2(interestDue),
      totalDue: round2(emi),
      outstandingAfter: round2(outstanding),
    });
  }

  const totalPayable = principalAmount + totalInterest;
  const maturityDate = installments[installments.length - 1].dueDate;

  return {
    totalInterest: round2(totalInterest),
    totalPayable: round2(totalPayable),
    installmentAmount: round2(emi),
    installments,
    maturityDate,
  };
}

/**
 * Simple Interest Calculation
 * Monthly Interest = Principal × (Annual Rate / 12 / 100)
 * Principal due at end (or as specified)
 * Used for: Monthly Interest-Only, Gold Loan, Bullet
 */
function calculateSimpleInterest(input: LoanCalculationInput): LoanCalculationResult {
  const { principalAmount, interestRate, numInstallments, loanType } = input;

  const monthlyInterest = principalAmount * (interestRate / 12 / 100);

  const installments: InstallmentDetail[] = [];
  const startDate = new Date();

  if (loanType === "bullet") {
    // Single payment at the end
    const totalInterest = monthlyInterest * (input.tenureMonths || numInstallments);
    const dueDate = getInstallmentDueDate(startDate, 1, loanType, input.customFrequencyDays);
    
    // Set maturity to end of tenure
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + (input.tenureMonths || numInstallments));

    installments.push({
      installmentNo: 1,
      dueDate: maturityDate,
      principalDue: round2(principalAmount),
      interestDue: round2(totalInterest),
      totalDue: round2(principalAmount + totalInterest),
      outstandingAfter: 0,
    });

    return {
      totalInterest: round2(totalInterest),
      totalPayable: round2(principalAmount + totalInterest),
      installmentAmount: round2(principalAmount + totalInterest),
      installments,
      maturityDate,
    };
  }

  // Monthly interest-only: pay interest monthly, principal at end
  let totalInterest = 0;

  for (let i = 1; i <= numInstallments; i++) {
    const dueDate = getInstallmentDueDate(startDate, i, loanType, input.customFrequencyDays);
    const isLast = i === numInstallments;

    const principalDue = isLast ? principalAmount : 0;
    const interestDue = monthlyInterest;
    totalInterest += interestDue;

    installments.push({
      installmentNo: i,
      dueDate,
      principalDue: round2(principalDue),
      interestDue: round2(interestDue),
      totalDue: round2(principalDue + interestDue),
      outstandingAfter: isLast ? 0 : round2(principalAmount),
    });
  }

  const totalPayable = principalAmount + totalInterest;
  const maturityDate = installments[installments.length - 1].dueDate;

  return {
    totalInterest: round2(totalInterest),
    totalPayable: round2(totalPayable),
    installmentAmount: round2(monthlyInterest),
    installments,
    maturityDate,
  };
}

/**
 * Calculate penalty amount for an overdue installment
 */
export function calculatePenalty(
  overdueAmount: number,
  penaltyRate: number,
  daysOverdue: number,
  gracePeriodDays: number,
  penaltyCap?: number
): number {
  if (daysOverdue <= gracePeriodDays) return 0;

  const effectiveDays = daysOverdue - gracePeriodDays;
  let penalty = overdueAmount * (penaltyRate / 100) * (effectiveDays / 30);

  if (penaltyCap && penalty > penaltyCap) {
    penalty = penaltyCap;
  }

  return round2(penalty);
}

/**
 * Get the due date for a specific installment number
 */
function getInstallmentDueDate(
  startDate: Date,
  installmentNo: number,
  loanType: LoanType,
  customFrequencyDays?: number
): Date {
  const date = new Date(startDate);

  switch (loanType) {
    case "daily":
      date.setDate(date.getDate() + installmentNo);
      break;
    case "weekly":
      date.setDate(date.getDate() + installmentNo * 7);
      break;
    case "custom":
      date.setDate(date.getDate() + installmentNo * (customFrequencyDays || 1));
      break;
    default:
      // Monthly types: monthly_emi, monthly_interest, gold, auto, enterprise, bullet
      date.setMonth(date.getMonth() + installmentNo);
      break;
  }

  return date;
}

/**
 * Round to 2 decimal places
 */
function round2(num: number): number {
  return Math.round(num * 100) / 100;
}
