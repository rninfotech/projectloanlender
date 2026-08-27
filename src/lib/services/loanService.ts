import { createClient } from "@/lib/supabase/client";
import { getLocalCustomers, saveLocalCustomer, CustomerData } from "./customerService";

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

const STORAGE_KEY = "loan_lender_loans_v1";

const INITIAL_LOANS: LoanData[] = [
  {
    id: "ln-1",
    loanNumber: "LN-2026-0001",
    customerId: "cus-1",
    customerName: "K. Annadurai",
    phone: "+91 98401 55678",
    area: "Main Market Route",
    loanType: "daily",
    principalAmount: 20000,
    totalInterest: 2000,
    totalPayable: 22000,
    totalPaid: 7480,
    remainingBalance: 14520,
    installmentAmount: 220,
    totalInstallments: 100,
    paidInstallments: 34,
    overdueInstallments: 0,
    status: "active",
    disbursedDate: "2026-01-15",
    maturityDate: "2026-04-25",
    assignedStaff: "Karthik Rajan",
  },
  {
    id: "ln-2",
    loanNumber: "LN-2026-0002",
    customerId: "cus-2",
    customerName: "S. Meenakshi",
    phone: "+91 97109 88765",
    area: "North Ward",
    loanType: "weekly",
    principalAmount: 30000,
    totalInterest: 3000,
    totalPayable: 33000,
    totalPaid: 16500,
    remainingBalance: 16500,
    installmentAmount: 3300,
    totalInstallments: 10,
    paidInstallments: 5,
    overdueInstallments: 1,
    status: "overdue",
    disbursedDate: "2026-06-01",
    maturityDate: "2026-08-10",
    assignedStaff: "Karthik Rajan",
  },
  {
    id: "ln-3",
    loanNumber: "LN-2026-0003",
    customerId: "cus-3",
    customerName: "V. Thangaraj",
    phone: "+91 94441 22334",
    area: "Main Market Route",
    loanType: "weekly",
    principalAmount: 15000,
    totalInterest: 1500,
    totalPayable: 16500,
    totalPaid: 8250,
    remainingBalance: 8250,
    installmentAmount: 1650,
    totalInstallments: 10,
    paidInstallments: 5,
    overdueInstallments: 0,
    status: "active",
    disbursedDate: "2026-07-01",
    maturityDate: "2026-09-10",
    assignedStaff: "Suresh Kumar",
  },
  {
    id: "ln-4",
    loanNumber: "LN-2026-0004",
    customerId: "cus-4",
    customerName: "R. Balamurugan",
    phone: "+91 98840 99887",
    area: "South Town",
    loanType: "gold",
    principalAmount: 50000,
    totalInterest: 6000,
    totalPayable: 56000,
    totalPaid: 56000,
    remainingBalance: 0,
    installmentAmount: 500,
    totalInstallments: 12,
    paidInstallments: 12,
    overdueInstallments: 0,
    status: "completed",
    disbursedDate: "2025-08-01",
    maturityDate: "2026-08-01",
    assignedStaff: "Murugan Selvam",
  },
];

export function getLocalLoans(): LoanData[] {
  if (typeof window === "undefined") return INITIAL_LOANS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOANS));
      return INITIAL_LOANS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading loans from localStorage:", e);
    return INITIAL_LOANS;
  }
}

export function saveLocalLoan(loan: LoanData): LoanData[] {
  if (typeof window === "undefined") return [loan];
  try {
    const list = getLocalLoans();
    const updated = [loan, ...list.filter((l) => l.id !== loan.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error saving loan to localStorage:", e);
    return [loan];
  }
}

export async function fetchAllLoans(): Promise<LoanData[]> {
  const localList = getLocalLoans();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("loans")
      .select("*, customers(full_name, phone, area_route)")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return localList;
    }

    const remoteList: LoanData[] = data.map((item: any) => ({
      id: item.id,
      loanNumber: item.loan_number,
      customerId: item.customer_id,
      customerName: item.customers?.full_name || "Borrower",
      phone: item.customers?.phone || "",
      area: item.customers?.area_route || "Main Market Route",
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
      assignedStaff: "Karthik Rajan",
      collateralType: item.collateral_type,
      collateralValue: item.collateral_estimated_value ? Number(item.collateral_estimated_value) : undefined,
      collateralDetails: item.collateral_description,
      createdAt: item.created_at,
    }));

    const merged = [...remoteList];
    for (const localItem of localList) {
      if (!merged.some((m) => m.id === localItem.id || m.loanNumber === localItem.loanNumber)) {
        merged.push(localItem);
      }
    }

    return merged;
  } catch (e) {
    return localList;
  }
}

export async function createLoan(data: {
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
  const localLoans = getLocalLoans();
  const nextNum = (localLoans.length + 1).toString().padStart(4, "0");
  const loanNumber = `LN-2026-${nextNum}`;
  const generatedId = `ln-${Date.now()}`;

  // Find customer
  const customers = getLocalCustomers();
  const customer = customers.find((c) => c.id === data.customerId) || {
    id: data.customerId,
    fullName: "Registered Customer",
    phone: "+91 98401 55678",
    area: "Main Market Route",
  };

  const newLoan: LoanData = {
    id: generatedId,
    loanNumber,
    customerId: data.customerId,
    customerName: customer.fullName,
    phone: customer.phone,
    area: (customer as any).area || "Main Market Route",
    loanType: data.loanType,
    principalAmount: data.principalAmount,
    totalInterest: data.totalInterest,
    totalPayable: data.totalPayable,
    totalPaid: 0,
    remainingBalance: data.totalPayable,
    installmentAmount: data.installmentAmount,
    totalInstallments: data.numInstallments,
    paidInstallments: 0,
    overdueInstallments: 0,
    status: "active",
    disbursedDate: data.disbursedDate,
    maturityDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    assignedStaff: data.assignedStaff,
    collateralType: data.collateralType,
    collateralValue: data.collateralValue ? parseFloat(data.collateralValue) : undefined,
    collateralDetails: data.collateralDetails,
    createdAt: new Date().toISOString(),
  };

  // 1. Save loan locally
  saveLocalLoan(newLoan);

  // 2. Update customer outstanding balance and active loans count
  const updatedCustomers = customers.map((c) => {
    if (c.id === data.customerId) {
      return {
        ...c,
        activeLoansCount: (c.activeLoansCount || 0) + 1,
        totalOutstanding: (c.totalOutstanding || 0) + data.totalPayable,
      };
    }
    return c;
  });
  if (typeof window !== "undefined") {
    localStorage.setItem("loan_lender_customers_v1", JSON.stringify(updatedCustomers));
  }

  // 3. Try saving to Supabase
  try {
    const supabase = createClient();
    await supabase.from("loans").insert({
      loan_number: loanNumber,
      customer_id: data.customerId.startsWith("cus-") ? null : data.customerId,
      loan_type: data.loanType,
      interest_method: data.interestMethod,
      principal_amount: data.principalAmount,
      interest_rate_annual: data.interestRate,
      num_installments: data.numInstallments,
      installment_amount: data.installmentAmount,
      total_interest: data.totalInterest,
      total_payable: data.totalPayable,
      processing_fee: data.processingFee,
      remaining_balance: data.totalPayable,
      total_paid: 0,
      paid_installments: 0,
      overdue_installments: 0,
      status: "active",
      disbursed_at: new Date(data.disbursedDate).toISOString(),
      collateral_type: data.collateralType,
      collateral_description: data.collateralDetails,
      collateral_estimated_value: data.collateralValue ? parseFloat(data.collateralValue) : null,
    });
  } catch (err) {
    console.warn("Could not insert to Supabase, local cache saved:", err);
  }

  return newLoan;
}
