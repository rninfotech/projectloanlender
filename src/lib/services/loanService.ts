import { createClient } from "@/lib/supabase/client";

export interface LoanData {
  id: string;
  loanNumber: string;
  customerId: string;
  customerName: string;
  phone: string;
  area: string;
  loanType: string;
  principalAmount: number;
  totalInterest: number;
  totalPayable: number;
  totalPaid: number;
  remainingBalance: number;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  overdueInstallments: number;
  status: "active" | "completed" | "overdue" | "defaulted";
  disbursedDate: string;
  maturityDate: string;
  assignedStaff: string;
  collateralType?: string;
  collateralValue?: number;
  collateralDetails?: string;
  createdAt?: string;
}

/**
 * Fetch all loans belonging to the currently logged-in user ONLY.
 * Loans are joined with customers, scoped to customers.created_by = auth.uid() via RLS.
 */
export async function fetchAllLoans(): Promise<LoanData[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("loans")
    .select("*, customers!inner(full_name, phone, area, created_by)")
    .eq("customers.created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching loans:", error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  return data.map((item: any): LoanData => ({
    id: item.id,
    loanNumber: item.loan_number,
    customerId: item.customer_id,
    customerName: item.customers?.full_name || "Borrower",
    phone: item.customers?.phone || "",
    area: item.customers?.area || "N/A",
    loanType: item.loan_type,
    principalAmount: Number(item.principal_amount),
    totalInterest: Number(item.total_interest),
    totalPayable: Number(item.total_payable),
    totalPaid: Number(item.total_paid || 0),
    remainingBalance: Number(item.remaining_balance || item.total_payable),
    installmentAmount: Number(item.installment_amount),
    totalInstallments: Number(item.num_installments),
    paidInstallments: Number(item.paid_installments || 0),
    overdueInstallments: Number(item.overdue_installments || 0),
    status: item.status,
    disbursedDate: item.disbursed_at ? item.disbursed_at.split("T")[0] : new Date().toISOString().split("T")[0],
    maturityDate: item.maturity_date || new Date().toISOString().split("T")[0],
    assignedStaff: item.assigned_staff || "N/A",
    collateralType: item.collateral_type,
    collateralValue: item.collateral_estimated_value ? Number(item.collateral_estimated_value) : undefined,
    collateralDetails: item.collateral_description,
    createdAt: item.created_at,
  }));
}

/**
 * Create a new loan, linked to a customer owned by the logged-in user.
 */
export async function createLoan(input: {
  customerId: string;
  loanType: string;
  principalAmount: number;
  interestRate: number;
  interestMethod: string;
  totalInterest: number;
  totalPayable: number;
  installmentAmount: number;
  numInstallments: number;
  processingFee: number;
  disbursedDate: string;
  assignedStaff: string;
  collateralType?: string;
  collateralValue?: string;
  collateralDetails?: string;
}): Promise<LoanData> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Generate loan number
  const { count } = await supabase
    .from("loans")
    .select("*", { count: "exact", head: true });
  const nextNum = ((count ?? 0) + 1).toString().padStart(4, "0");
  const loanNumber = `LN-${new Date().getFullYear()}-${nextNum}`;

  // Fetch the customer to get their info
  const { data: customerRow } = await supabase
    .from("customers")
    .select("full_name, phone, area")
    .eq("id", input.customerId)
    .eq("created_by", user.id)
    .single();

  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + input.numInstallments);

  const { data, error } = await supabase
    .from("loans")
    .insert({
      loan_number: loanNumber,
      customer_id: input.customerId,
      loan_type: input.loanType,
      interest_method: input.interestMethod,
      principal_amount: input.principalAmount,
      interest_rate_annual: input.interestRate,
      num_installments: input.numInstallments,
      installment_amount: input.installmentAmount,
      total_interest: input.totalInterest,
      total_payable: input.totalPayable,
      processing_fee: input.processingFee,
      remaining_balance: input.totalPayable,
      total_paid: 0,
      paid_installments: 0,
      overdue_installments: 0,
      status: "active",
      disbursed_at: new Date(input.disbursedDate).toISOString(),
      maturity_date: maturityDate.toISOString().split("T")[0],
      assigned_staff: input.assignedStaff,
      collateral_type: input.collateralType || null,
      collateral_description: input.collateralDetails || null,
      collateral_estimated_value: input.collateralValue ? parseFloat(input.collateralValue) : null,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to create loan");

  return {
    id: data.id,
    loanNumber: data.loan_number,
    customerId: data.customer_id,
    customerName: customerRow?.full_name || "Borrower",
    phone: customerRow?.phone || "",
    area: customerRow?.area || "N/A",
    loanType: data.loan_type,
    principalAmount: Number(data.principal_amount),
    totalInterest: Number(data.total_interest),
    totalPayable: Number(data.total_payable),
    totalPaid: 0,
    remainingBalance: Number(data.remaining_balance),
    installmentAmount: Number(data.installment_amount),
    totalInstallments: Number(data.num_installments),
    paidInstallments: 0,
    overdueInstallments: 0,
    status: "active",
    disbursedDate: input.disbursedDate,
    maturityDate: maturityDate.toISOString().split("T")[0],
    assignedStaff: input.assignedStaff,
    collateralType: input.collateralType,
    collateralValue: input.collateralValue ? parseFloat(input.collateralValue) : undefined,
    collateralDetails: input.collateralDetails,
    createdAt: data.created_at,
  };
}

/**
 * @deprecated Use fetchAllLoans() instead. Kept for compatibility.
 */
export function getLocalLoans(): LoanData[] {
  return [];
}

/**
 * @deprecated No-op. Kept for compatibility.
 */
export function saveLocalLoan(loan: LoanData): LoanData[] {
  return [loan];
}