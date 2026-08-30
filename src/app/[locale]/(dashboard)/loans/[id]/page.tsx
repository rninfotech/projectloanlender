"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HandCoins,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  CreditCard,
  Shield,
  MapPin,
  Phone,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";
import { fetchAllLoans, LoanData } from "@/lib/services/loanService";

interface InstallmentRow {
  installmentNo: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  paidAmount: number;
  status: "paid" | "pending" | "overdue";
  paidDate?: string;
}

export default function LoanDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const loanId = params.id as string;

  const [loan, setLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await fetchAllLoans();
        const found = list.find((l) => l.id === loanId || l.loanNumber === loanId);
        setLoan(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [loanId]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-sm text-muted-foreground">Loading loan details...</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="max-w-md mx-auto p-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
        <HandCoins className="w-12 h-12 text-muted-foreground opacity-40 mx-auto mb-3" />
        <h2 className="font-bold text-lg text-foreground">Loan Account Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-5">
          The requested loan account does not exist or has been removed.
        </p>
        <Link href={`/${locale}/loans`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Loans
          </Button>
        </Link>
      </div>
    );
  }

  const numInst = loan.totalInstallments || 1;
  const paidInst = loan.paidInstallments || 0;
  const emi = loan.installmentAmount || 0;

  const installments: InstallmentRow[] = Array.from({ length: Math.min(numInst, 50) }).map((_, i) => {
    const num = i + 1;
    const isPaid = num <= paidInst;
    const isOverdue = !isPaid && loan.status === "overdue" && num === paidInst + 1;
    return {
      installmentNo: num,
      dueDate: loan.maturityDate,
      principalDue: Math.round(loan.principalAmount / numInst),
      interestDue: Math.round(loan.totalInterest / numInst),
      totalDue: emi,
      paidAmount: isPaid ? emi : 0,
      status: isPaid ? "paid" : isOverdue ? "overdue" : "pending",
    };
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/loans`}>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{loan.loanNumber}</h1>
              <Badge variant={loan.status === "active" ? "success" : loan.status === "overdue" ? "destructive" : "secondary"}>
                {loan.status}
              </Badge>
              <Badge variant="outline">{loan.loanType.toUpperCase()}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Borrower: <strong className="text-foreground">{loan.customerName}</strong> (📞 {loan.phone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppShareUrl(
              loan.phone,
              `Hello ${loan.customerName}, your loan account ${loan.loanNumber} has a current outstanding balance of ₹${loan.remainingBalance}. Installment: ₹${loan.installmentAmount}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Reminder
            </Button>
          </a>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-muted-foreground">Principal Disbursed</span>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(loan.principalAmount)}</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Repayable</span>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{formatCurrency(loan.totalPayable)}</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Recovered</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(loan.totalPaid)}</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-muted-foreground">Remaining Balance</span>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(loan.remainingBalance)}</p>
        </div>
      </div>

      {/* Schedule & Collateral Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Installment Repayment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Installment Due</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {installments.map((inst) => (
                      <tr key={inst.installmentNo} className="hover:bg-muted/30">
                        <td className="p-3 font-bold text-foreground">#{inst.installmentNo}</td>
                        <td className="p-3 font-semibold text-foreground">{formatCurrency(inst.totalDue)}</td>
                        <td className="p-3 text-muted-foreground">{formatCurrency(inst.paidAmount)}</td>
                        <td className="p-3">
                          <Badge variant={inst.status === "paid" ? "success" : inst.status === "overdue" ? "destructive" : "outline"} className="text-[10px]">
                            {inst.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security & Assignment Side Card */}
        <div className="space-y-4">
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm p-5 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Collateral & Officer Info
            </h3>
            <div className="space-y-2 text-xs divide-y divide-border/60">
              <div className="pt-2">
                <span className="text-muted-foreground">Assigned Officer:</span>
                <p className="font-semibold text-foreground mt-0.5">{loan.assignedStaff || "Admin (Self)"}</p>
              </div>
              <div className="pt-2">
                <span className="text-muted-foreground">Collateral Type:</span>
                <p className="font-semibold text-foreground mt-0.5">{loan.collateralType || "Unsecured / Personal Guarantee"}</p>
              </div>
              {loan.collateralDetails && (
                <div className="pt-2">
                  <span className="text-muted-foreground">Collateral Notes:</span>
                  <p className="font-semibold text-foreground mt-0.5">{loan.collateralDetails}</p>
                </div>
              )}
              <div className="pt-2">
                <span className="text-muted-foreground">Disbursement Date:</span>
                <p className="font-semibold text-foreground mt-0.5">{formatDate(loan.disbursedDate)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}