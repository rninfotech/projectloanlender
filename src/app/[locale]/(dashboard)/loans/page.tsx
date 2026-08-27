"use client";

import { useState } from "react";
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
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  CreditCard,
  MessageSquare,
  Eye,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";

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
  status: "active" | "overdue" | "closed" | "defaulted";
  overdueDays?: number;
  overdueAmount?: number;
}

const SAMPLE_LOANS: LoanItem[] = [
  {
    id: "ln-1",
    loanNumber: "LN-2026-0001",
    customerName: "K. Annadurai",
    customerPhone: "+91 98401 55678",
    customerArea: "Main Market Route",
    loanType: "daily",
    principal: 20000,
    totalPayable: 22000,
    totalPaid: 7500,
    outstanding: 14500,
    installmentAmount: 220,
    installmentFrequency: "Daily",
    paidInstallments: 34,
    totalInstallments: 100,
    disbursedDate: "2026-01-15",
    maturityDate: "2026-04-25",
    status: "active",
  },
  {
    id: "ln-2",
    loanNumber: "LN-2026-0002",
    customerName: "S. Meenakshi",
    customerPhone: "+91 97109 88765",
    customerArea: "North Ward",
    loanType: "monthly_emi",
    principal: 50000,
    totalPayable: 56000,
    totalPaid: 14000,
    outstanding: 42000,
    installmentAmount: 5600,
    installmentFrequency: "Monthly",
    paidInstallments: 2,
    totalInstallments: 10,
    disbursedDate: "2025-12-01",
    maturityDate: "2026-09-01",
    status: "overdue",
    overdueDays: 4,
    overdueAmount: 5600,
  },
  {
    id: "ln-3",
    loanNumber: "LN-2026-0003",
    customerName: "V. Thangaraj",
    customerPhone: "+91 94441 22334",
    customerArea: "Main Market Route",
    loanType: "weekly",
    principal: 15000,
    totalPayable: 16500,
    totalPaid: 8500,
    outstanding: 8000,
    installmentAmount: 1650,
    installmentFrequency: "Weekly",
    paidInstallments: 5,
    totalInstallments: 10,
    disbursedDate: "2026-01-05",
    maturityDate: "2026-03-16",
    status: "active",
  },
  {
    id: "ln-4",
    loanNumber: "LN-2026-0004",
    customerName: "R. Balamurugan",
    customerPhone: "+91 98840 99887",
    customerArea: "South Town",
    loanType: "gold",
    principal: 100000,
    totalPayable: 112000,
    totalPaid: 87000,
    outstanding: 25000,
    installmentAmount: 1000,
    installmentFrequency: "Monthly Interest",
    paidInstallments: 8,
    totalInstallments: 12,
    disbursedDate: "2025-06-10",
    maturityDate: "2026-06-10",
    status: "active",
  },
  {
    id: "ln-old-1",
    loanNumber: "LN-2025-0842",
    customerName: "P. Rajesh Kumar",
    customerPhone: "+91 96001 44556",
    customerArea: "East Bazaar",
    loanType: "monthly_emi",
    principal: 40000,
    totalPayable: 44000,
    totalPaid: 44000,
    outstanding: 0,
    installmentAmount: 4400,
    installmentFrequency: "Monthly",
    paidInstallments: 10,
    totalInstallments: 10,
    disbursedDate: "2025-02-01",
    maturityDate: "2025-11-01",
    status: "closed",
  },
];

import { useEffect } from "react";
import { fetchAllLoans, LoanData } from "@/lib/services/loanService";

export default function LoansPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "overdue" | "closed">("all");
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
      loan.customerArea.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalDisbursed = loans.reduce((acc, l) => acc + l.principal, 0);
  const totalOutstanding = loans.reduce((acc, l) => acc + l.outstanding, 0);
  const overdueLoansCount = loans.filter((l) => l.status === "overdue").length;

  const getLoanTypeBadge = (type: LoanItem["loanType"]) => {
    switch (type) {
      case "daily":
        return <Badge variant="default" className="text-[10px]">{t("loans.types.daily")}</Badge>;
      case "weekly":
        return <Badge variant="secondary" className="text-[10px]">{t("loans.types.weekly")}</Badge>;
      case "monthly_emi":
        return <Badge variant="purple" className="text-[10px]">{t("loans.types.monthly_emi")}</Badge>;
      case "gold":
        return <Badge variant="warning" className="text-[10px]">{t("loans.types.gold")}</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: LoanItem["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success">{t("loans.statuses.active")}</Badge>;
      case "overdue":
        return <Badge variant="destructive">{t("installments.statuses.overdue")}</Badge>;
      case "closed":
        return <Badge variant="secondary">{t("loans.statuses.closed")}</Badge>;
      case "defaulted":
        return <Badge variant="destructive">{t("loans.statuses.defaulted")}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <HandCoins className="w-7 h-7 text-primary" />
            {t("loans.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("loans.loanDetail")}
          </p>
        </div>

        <Link href={`/${locale}/loans/new`}>
          <Button size="lg" className="w-full sm:w-auto gap-2">
            <Plus className="w-4 h-4" />
            {t("loans.createLoan")}
          </Button>
        </Link>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("dashboard.activeLoans")}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {loans.filter((l) => l.status === "active" || l.status === "overdue").length}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("reports.totalDisbursed")}</p>
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
          <p className="text-xl sm:text-2xl font-bold text-destructive mt-1 flex items-center gap-1.5">
            {overdueLoansCount}
            {overdueLoansCount > 0 && <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/60 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: `${t("common.all")} (${loans.length})` },
            { id: "active", label: `${t("loans.statuses.active")} (${loans.filter((l) => l.status === "active").length})` },
            { id: "overdue", label: `${t("installments.statuses.overdue")} ⚠️ (${overdueLoansCount})` },
            { id: "closed", label: `${t("loans.statuses.closed")} (${loans.filter((l) => l.status === "closed").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-card text-foreground shadow-sm border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Loan Type Dropdown */}
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by loan # or borrower..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Products</option>
            <option value="daily">Daily Collection</option>
            <option value="weekly">Weekly Collection</option>
            <option value="monthly_emi">Monthly EMI</option>
            <option value="gold">Gold Loan</option>
          </select>
        </div>
      </div>

      {/* Loans Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLoans.length === 0 ? (
          <div className="col-span-2 p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
            <HandCoins className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
            <h3 className="font-semibold text-base text-foreground">No loans found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your status or product filters
            </p>
          </div>
        ) : (
          filteredLoans.map((loan) => (
            <div
              key={loan.id}
              className={`rounded-2xl border bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 ${
                loan.status === "overdue" ? "border-destructive/40 bg-destructive/5" : "border-border/80"
              }`}
            >
              {/* Card Header: Loan Number, Customer, Badges */}
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
                      width: `${Math.min(100, (loan.totalPaid / loan.totalPayable) * 100)}%`,
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
                    `வணக்கம் ${loan.customerName}, கடன் எண்: ${loan.loanNumber}. உங்கள் தவணை ₹${loan.installmentAmount}. நிலுவை ₹${loan.outstanding}. - ஸ்ரீ கிருஷ்ணா பைனான்ஸ்.`
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
                    Schedule & Detail
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
