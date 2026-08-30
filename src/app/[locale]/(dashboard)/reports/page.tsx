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
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  HandCoins,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate } from "@/lib/utils";
import { fetchAllCustomers, CustomerData } from "@/lib/services/customerService";
import { fetchAllLoans, LoanData } from "@/lib/services/loanService";

export default function ReportsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [activeReportTab, setActiveReportTab] = useState<"daily" | "area" | "aging">("daily");
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cList, lList] = await Promise.all([
          fetchAllCustomers(),
          fetchAllLoans(),
        ]);
        setCustomers(cList);
        setLoans(lList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalDisbursed = loans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalRepaid = loans.reduce((acc, l) => acc + l.totalPaid, 0);
  const totalOutstanding = loans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const totalInterestExpected = loans.reduce((acc, l) => acc + l.totalInterest, 0);

  // Area statistics computed dynamically from customer & loan data
  const areaMap = new Map<string, { borrowers: number; activeLoans: number; totalDisbursed: number; totalOutstanding: number }>();
  customers.forEach((c) => {
    const area = c.area || "General Route";
    const existing = areaMap.get(area) || { borrowers: 0, activeLoans: 0, totalDisbursed: 0, totalOutstanding: 0 };
    existing.borrowers += 1;
    areaMap.set(area, existing);
  });

  loans.forEach((l) => {
    const area = l.area || "General Route";
    const existing = areaMap.get(area) || { borrowers: 1, activeLoans: 0, totalDisbursed: 0, totalOutstanding: 0 };
    if (l.status === "active" || l.status === "overdue") {
      existing.activeLoans += 1;
    }
    existing.totalDisbursed += l.principalAmount;
    existing.totalOutstanding += l.remainingBalance;
    areaMap.set(area, existing);
  });

  const areaList = Array.from(areaMap.entries()).map(([area, data]) => ({
    area,
    ...data,
  }));

  const overdueLoans = loans.filter((l) => l.status === "overdue");

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeReportTab === "daily") {
      csvContent += "Loan Number,Borrower,Phone,Area,Type,Principal,Repaid,Outstanding,Status\n";
      loans.forEach((l) => {
        csvContent += `"${l.loanNumber}","${l.customerName}","${l.phone}","${l.area}","${l.loanType}",${l.principalAmount},${l.totalPaid},${l.remainingBalance},"${l.status}"\n`;
      });
    } else if (activeReportTab === "area") {
      csvContent += "Area Route,Registered Borrowers,Active Loans,Total Disbursed,Total Outstanding\n";
      areaList.forEach((a) => {
        csvContent += `"${a.area}",${a.borrowers},${a.activeLoans},${a.totalDisbursed},${a.totalOutstanding}\n`;
      });
    } else {
      csvContent += "Loan Number,Borrower,Phone,Outstanding Due,Overdue Installments,Status\n";
      overdueLoans.forEach((l) => {
        csvContent += `"${l.loanNumber}","${l.customerName}","${l.phone}",${l.remainingBalance},${l.overdueInstallments},"${l.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `loan_lender_report_${activeReportTab}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-primary" />
            {t("reports.title")} & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit-ready export reports, area breakdown, delinquency metrics, and collection summaries
          </p>
        </div>

        <Button onClick={handleExportCSV} size="lg" className="w-full sm:w-auto gap-2">
          <Download className="w-4 h-4" />
          {t("reports.exportCSV")}
        </Button>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-muted-foreground">{t("loans.totalDisbursed")}</span>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{formatCurrencyShort(totalDisbursed)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{loans.length} total loans issued</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Recovered</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrencyShort(totalRepaid)}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            {totalDisbursed > 0 ? `${Math.round((totalRepaid / totalDisbursed) * 100)}% recovery rate` : "0% recovery"}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-muted-foreground">{t("dashboard.outstandingAmount")}</span>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrencyShort(totalOutstanding)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Active portfolio balance</p>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-muted-foreground">Projected Interest</span>
          <p className="text-xl sm:text-2xl font-bold text-primary mt-1">{formatCurrencyShort(totalInterestExpected)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Total yield profit</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveReportTab("daily")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReportTab === "daily" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          Loans Portfolio Summary ({loans.length})
        </button>
        <button
          onClick={() => setActiveReportTab("area")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReportTab === "area" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          Area Route Breakdown ({areaList.length})
        </button>
        <button
          onClick={() => setActiveReportTab("aging")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeReportTab === "aging" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          Overdue Delinquency ({overdueLoans.length})
        </button>
      </div>

      {/* Tab 1: Loans Portfolio Table */}
      {activeReportTab === "daily" && (
        <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
          {loans.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground text-sm">No loan data to report</p>
              <p className="text-xs mt-1">When loans are disbursed, portfolio summary reports will generate automatically.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-4">Loan Account</th>
                    <th className="p-4">Borrower</th>
                    <th className="p-4">Route</th>
                    <th className="p-4">Principal</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4">Balance</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {loans.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-foreground">{l.loanNumber}</td>
                      <td className="p-4">
                        <p className="font-bold text-foreground">{l.customerName}</p>
                        <p className="text-[11px] text-muted-foreground">{l.phone}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">{l.area}</td>
                      <td className="p-4 font-bold text-foreground">{formatCurrency(l.principalAmount)}</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(l.totalPaid)}</td>
                      <td className="p-4 font-bold text-amber-600 dark:text-amber-400">{formatCurrency(l.remainingBalance)}</td>
                      <td className="p-4">
                        <Badge variant={l.status === "active" ? "success" : l.status === "overdue" ? "destructive" : "secondary"}>
                          {l.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Area Breakdown */}
      {activeReportTab === "area" && (
        <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
          {areaList.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-foreground text-sm">No area routes recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-4">Territory / Route</th>
                    <th className="p-4">Borrowers</th>
                    <th className="p-4">Active Loans</th>
                    <th className="p-4">Disbursed Amount</th>
                    <th className="p-4">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {areaList.map((a, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-foreground flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {a.area}
                      </td>
                      <td className="p-4 text-foreground">{a.borrowers}</td>
                      <td className="p-4 text-foreground font-semibold">{a.activeLoans}</td>
                      <td className="p-4 font-bold text-foreground">{formatCurrency(a.totalDisbursed)}</td>
                      <td className="p-4 font-bold text-amber-600 dark:text-amber-400">{formatCurrency(a.totalOutstanding)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Overdue */}
      {activeReportTab === "aging" && (
        <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
          {overdueLoans.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-70" />
              <p className="font-semibold text-foreground text-sm">No overdue accounts!</p>
              <p className="text-xs mt-1">All loan installments are up to date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-4">Account</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Overdue Installments</th>
                    <th className="p-4">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {overdueLoans.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-foreground">{l.loanNumber}</td>
                      <td className="p-4">
                        <p className="font-bold text-foreground">{l.customerName}</p>
                        <p className="text-[11px] text-muted-foreground">{l.phone}</p>
                      </td>
                      <td className="p-4 font-bold text-destructive">{l.overdueInstallments} unpaid</td>
                      <td className="p-4 font-bold text-destructive">{formatCurrency(l.remainingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}