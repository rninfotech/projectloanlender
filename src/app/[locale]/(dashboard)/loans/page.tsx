"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  HandCoins,
  Plus,
  Search,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Eye,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";
import { fetchAllLoans } from "@/lib/services/loanService";

interface LoanItem {
  id: string;
  loanNumber: string;
  customerName: string;
  customerPhone: string;
  customerArea: string;
  loanType: "daily" | "weekly" | "monthly_emi" | "monthly_interest" | "gold" | "auto" | "enterprise";
  principal: number;
  totalPayable: number;
  totalPaid: number;
  outstanding: number;
  installmentAmount: number;
  installmentFrequency: string;
  paidInstallments: number;
  totalInstallments: number;
  disbursedDate: string;
  maturityDate: string;
  status: "active" | "overdue" | "completed" | "defaulted";
  overdueDays?: number;
  overdueAmount?: number;
}

export default function LoansPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "overdue" | "completed">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loans, setLoans] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await fetchAllLoans();
        setLoans(
          list.map((l) => ({
            id: l.id,
            loanNumber: l.loanNumber,
            customerName: l.customerName,
            customerPhone: l.phone,
            customerArea: l.area,
            loanType: (l.loanType as any) || "daily",
            principal: l.principalAmount,
            totalPayable: l.totalPayable,
            totalPaid: l.totalPaid,
            outstanding: l.remainingBalance,
            installmentAmount: l.installmentAmount,
            installmentFrequency: l.loanType === "daily" ? "Daily" : l.loanType === "weekly" ? "Weekly" : "Monthly",
            paidInstallments: l.paidInstallments,
            totalInstallments: l.totalInstallments,
            disbursedDate: l.disbursedDate,
            maturityDate: l.maturityDate,
            status: (l.status as any) || "active",
            overdueDays: l.overdueInstallments > 0 ? l.overdueInstallments * 7 : 0,
            overdueAmount: l.overdueInstallments * l.installmentAmount,
          }))
        );
      } catch (err) {
        console.error("Error loading loans:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLoans = loans.filter((loan) => {
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter;
    const matchesType = typeFilter === "all" || loan.loanType === typeFilter;
    const matchesSearch =
      loan.loanNumber.toLowerCase().includes(search.toLowerCase()) ||
      loan.customerName.toLowerCase().includes(search.toLowerCase()) ||
      loan.customerPhone.includes(search);
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalDisbursed = loans.reduce((acc, l) => acc + l.principal, 0);
  const totalOutstanding = loans.reduce((acc, l) => acc + l.outstanding, 0);
  const totalOverdue = loans
    .filter((l) => l.status === "overdue")
    .reduce((acc, l) => acc + (l.overdueAmount || l.outstanding), 0);

  const getLoanTypeBadge = (type: string) => {
    switch (type) {
      case "daily":
        return <Badge variant="default">Daily</Badge>;
      case "weekly":
        return <Badge variant="purple">Weekly</Badge>;
      case "monthly_emi":
        return <Badge variant="purple">Monthly EMI</Badge>;
      case "monthly_interest":
        return <Badge variant="purple">Monthly Interest</Badge>;
      case "gold":
        return <Badge variant="warning">Gold Loan</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "defaulted":
        return <Badge variant="destructive">Defaulted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <HandCoins className="w-7 h-7 text-primary" />
            {t("loans.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track disbursements, interest schedules, active repayments, and collateral records
          </p>
        </div>

        <Link href={`/${locale}/loans/new`}>
          <Button size="lg" className="w-full sm:w-auto gap-2">
            <Plus className="w-4 h-4" />
            {t("loans.newLoan")}
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("loans.allLoans")}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{loans.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("loans.totalDisbursed")}</p>
          <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
            {formatCurrencyShort(totalDisbursed)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("dashboard.outstandingAmount")}</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrencyShort(totalOutstanding)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("dashboard.overdueLoans")}</p>
          <p className="text-xl sm:text-2xl font-bold text-destructive mt-1">
            {formatCurrencyShort(totalOverdue)}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("loans.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Products</option>
              <option value="daily">Daily Collection</option>
              <option value="weekly">Weekly Loan</option>
              <option value="monthly_emi">Monthly EMI</option>
              <option value="monthly_interest">Monthly Interest</option>
              <option value="gold">Gold Loan</option>
            </select>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "active", "overdue", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {status.toUpperCase()} ({status === "all" ? loans.length : loans.filter((l) => l.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Loan Cards */}
      {loading ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading your loans...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <HandCoins className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="font-bold text-lg text-foreground">No loans created yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Disburse your first loan to start tracking daily/weekly installments and balances.
          </p>
          <Link href={`/${locale}/loans/new`} className="mt-5">
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Disburse New Loan
            </Button>
          </Link>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
          <HandCoins className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-semibold text-base text-foreground">No loans found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or status filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className={`rounded-2xl border bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 ${
                loan.status === "overdue" ? "border-destructive/40 bg-destructive/5" : "border-border/80"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-foreground">
                      {loan.loanNumber}
                    </span>
                    {getLoanTypeBadge(loan.loanType)}
                    {getStatusBadge(loan.status)}
                  </div>

                  <div className="mt-1">
                    <h3 className="font-bold text-sm text-foreground">
                      {loan.customerName}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {loan.customerArea} • 📞 {loan.customerPhone}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground">Principal:</span>
                  <p className="font-bold text-base text-foreground">
                    {formatCurrency(loan.principal)}
                  </p>
                </div>
              </div>

              {/* Overdue Banner if applicable */}
              {loan.status === "overdue" && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Overdue by {loan.overdueDays} days
                  </span>
                  <span>Amount: {formatCurrency(loan.overdueAmount || 0)}</span>
                </div>
              )}

              {/* Middle: Progress Bar */}
              <div className="space-y-1.5 bg-muted/30 p-3 rounded-xl border border-border/50">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Repaid: <strong className="text-foreground">{formatCurrency(loan.totalPaid)}</strong> ({loan.paidInstallments}/{loan.totalInstallments} inst.)
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    Remaining: {formatCurrency(loan.outstanding)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      loan.status === "overdue" ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{
                      width: `${Math.min(100, (loan.totalPaid / (loan.totalPayable || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                  <span>₹{loan.installmentAmount} / {loan.installmentFrequency}</span>
                  <span>Maturity: {formatDate(loan.maturityDate)}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <a
                  href={getWhatsAppShareUrl(
                    loan.customerPhone,
                    `Hello ${loan.customerName}, Loan No: ${loan.loanNumber}. Installment: ₹${loan.installmentAmount}. Outstanding: ₹${loan.outstanding}. - Finance Office.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp Reminder
                </a>

                <Link href={`/${locale}/loans/${loan.id}`}>
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}