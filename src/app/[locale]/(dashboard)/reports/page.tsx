"use client";

import { useState } from "react";
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
  TrendingDown,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [activeReportTab, setActiveReportTab] = useState<"daily" | "staff" | "area" | "aging">("daily");
  const [dateRange, setDateRange] = useState("thisMonth");

  // Sample Daily Collection Data
  const dailyData = [
    { date: "2026-08-27", totalDues: 48500, collected: 38000, cash: 24000, upi: 14000, count: 28 },
    { date: "2026-08-26", totalDues: 46000, collected: 42500, cash: 28000, upi: 14500, count: 31 },
    { date: "2026-08-25", totalDues: 52000, collected: 49000, cash: 32000, upi: 17000, count: 35 },
    { date: "2026-08-24", totalDues: 39000, collected: 36500, cash: 25000, upi: 11500, count: 24 },
    { date: "2026-08-23", totalDues: 44000, collected: 41000, cash: 29000, upi: 12000, count: 29 },
  ];

  // Sample Staff Performance Data
  const staffData = [
    { name: "Karthik Rajan", role: "Manager", route: "Main Market Route, North Ward", target: 350000, collected: 320000, efficiency: 91, borrowers: 45 },
    { name: "Suresh Kumar", role: "Field Agent", route: "South Town", target: 200000, collected: 185000, efficiency: 92, borrowers: 28 },
    { name: "Murugan Selvam", role: "Owner", route: "All Routes (Direct)", target: 100000, collected: 95000, efficiency: 95, borrowers: 14 },
  ];

  // Sample Area Performance Data
  const areaData = [
    { area: "Main Market Route", borrowers: 45, activeLoans: 34, totalDisbursed: 680000, collectedThisMonth: 245000, recoveryRate: 94 },
    { area: "North Ward", borrowers: 32, activeLoans: 24, totalDisbursed: 480000, collectedThisMonth: 168000, recoveryRate: 88 },
    { area: "South Town", borrowers: 28, activeLoans: 20, totalDisbursed: 420000, collectedThisMonth: 145000, recoveryRate: 92 },
    { area: "East Bazaar", borrowers: 23, activeLoans: 16, totalDisbursed: 270000, collectedThisMonth: 52000, recoveryRate: 85 },
  ];

  // Sample Aging Overdue Data
  const agingData = [
    { bracket: "1 - 7 Days Overdue", accounts: 5, amount: 18500, risk: "Low" },
    { bracket: "8 - 15 Days Overdue", accounts: 3, amount: 14000, risk: "Medium" },
    { bracket: "16 - 30 Days Overdue", accounts: 2, amount: 9800, risk: "Moderate" },
    { bracket: "30+ Days Overdue (Critical)", accounts: 1, amount: 6200, risk: "High" },
  ];

  // Instant CSV Download Function
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeReportTab === "daily") {
      csvContent += "Date,Total Dues,Collected Amount,Cash Amount,UPI Amount,Collections Count\n";
      dailyData.forEach((row) => {
        csvContent += `${row.date},${row.totalDues},${row.collected},${row.cash},${row.upi},${row.count}\n`;
      });
    } else if (activeReportTab === "staff") {
      csvContent += "Staff Name,Role,Assigned Route,Target,Collected,Efficiency %,Borrowers\n";
      staffData.forEach((row) => {
        csvContent += `"${row.name}","${row.role}","${row.route}",${row.target},${row.collected},${row.efficiency}%,${row.borrowers}\n`;
      });
    } else if (activeReportTab === "area") {
      csvContent += "Area Name,Borrowers,Active Loans,Total Disbursed,Collected This Month,Recovery Rate %\n";
      areaData.forEach((row) => {
        csvContent += `"${row.area}",${row.borrowers},${row.activeLoans},${row.totalDisbursed},${row.collectedThisMonth},${row.recoveryRate}%\n`;
      });
    } else {
      csvContent += "Overdue Bracket,Account Count,Overdue Amount,Risk Level\n";
      agingData.forEach((row) => {
        csvContent += `"${row.bracket}",${row.accounts},${row.amount},"${row.risk}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LoanLender_${activeReportTab}_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-primary" />
            {t("reports.title")} & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            P&L overview, agent efficiency, route recovery rates, and overdue aging
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 py-1 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month (August 2026)</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Financial Year</option>
          </select>

          <Button size="sm" onClick={handleExportCSV} className="gap-2 shadow-md shadow-primary/20">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* 4 Financial P&L Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Collections</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {formatCurrency(610000)}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +14% vs last month
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Loans Disbursed</p>
          <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
            {formatCurrencyShort(1850000)}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5">Across 94 active loans</span>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Operating Expenses</p>
          <p className="text-xl sm:text-2xl font-bold text-destructive mt-1">
            {formatCurrency(31700)}
          </p>
          <span className="text-[11px] text-muted-foreground mt-0.5">Salaries, Rent & Fuel</span>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Net Profit / Margin</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            +{formatCurrency(578300)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">94.8% Operational Margin</span>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/60 overflow-x-auto scrollbar-none w-fit">
        {[
          { id: "daily", label: "Daily Collections" },
          { id: "staff", label: "Agent Performance" },
          { id: "area", label: "Route Breakdown" },
          { id: "aging", label: "Overdue Aging Analysis" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeReportTab === tab.id
                ? "bg-card text-foreground shadow-sm border border-border/80 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Daily Collections Summary */}
      {activeReportTab === "daily" && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Daily Collection Log</CardTitle>
            <CardDescription>
              Day-by-day collections with Cash vs UPI splits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/60">
              <div className="grid grid-cols-5 p-3 bg-muted/40 text-xs font-bold text-muted-foreground">
                <span>Date</span>
                <span>Due Target</span>
                <span>Collected</span>
                <span>Cash vs UPI</span>
                <span className="text-right">Rate</span>
              </div>
              {dailyData.map((d, idx) => (
                <div key={idx} className="grid grid-cols-5 p-3.5 text-xs items-center hover:bg-muted/30">
                  <span className="font-semibold text-foreground">{formatDate(d.date)}</span>
                  <span className="text-muted-foreground">{formatCurrency(d.totalDues)}</span>
                  <span className="font-bold text-foreground">{formatCurrency(d.collected)}</span>
                  <span className="text-muted-foreground text-[11px]">
                    💵 ₹{d.cash} • 📱 ₹{d.upi}
                  </span>
                  <div className="text-right">
                    <Badge variant="success">
                      {Math.round((d.collected / d.totalDues) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Agent Performance */}
      {activeReportTab === "staff" && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Staff & Agent Recovery Performance</CardTitle>
            <CardDescription>
              Target vs actual collections per field officer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/60">
              <div className="grid grid-cols-5 p-3 bg-muted/40 text-xs font-bold text-muted-foreground">
                <span>Officer</span>
                <span>Assigned Route</span>
                <span>Target</span>
                <span>Collected</span>
                <span className="text-right">Efficiency</span>
              </div>
              {staffData.map((s, idx) => (
                <div key={idx} className="grid grid-cols-5 p-3.5 text-xs items-center hover:bg-muted/30">
                  <div>
                    <p className="font-bold text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.role}</p>
                  </div>
                  <span className="text-muted-foreground">{s.route}</span>
                  <span className="text-muted-foreground">{formatCurrency(s.target)}</span>
                  <span className="font-bold text-foreground">{formatCurrency(s.collected)}</span>
                  <div className="text-right">
                    <Badge variant={s.efficiency >= 90 ? "success" : "warning"}>
                      {s.efficiency}% Recovery
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Route Breakdown */}
      {activeReportTab === "area" && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Collection Route Breakdown</CardTitle>
            <CardDescription>
              Volume and recovery rate comparison by area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/60">
              <div className="grid grid-cols-5 p-3 bg-muted/40 text-xs font-bold text-muted-foreground">
                <span>Route / Area</span>
                <span>Borrowers</span>
                <span>Disbursed</span>
                <span>Collected</span>
                <span className="text-right">Recovery Rate</span>
              </div>
              {areaData.map((a, idx) => (
                <div key={idx} className="grid grid-cols-5 p-3.5 text-xs items-center hover:bg-muted/30">
                  <span className="font-bold text-foreground">{a.area}</span>
                  <span className="text-muted-foreground">{a.borrowers} Borrowers ({a.activeLoans} loans)</span>
                  <span className="text-muted-foreground">{formatCurrency(a.totalDisbursed)}</span>
                  <span className="font-bold text-foreground">{formatCurrency(a.collectedThisMonth)}</span>
                  <div className="text-right">
                    <Badge variant={a.recoveryRate >= 90 ? "success" : "warning"}>
                      {a.recoveryRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Aging Analysis */}
      {activeReportTab === "aging" && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Loan Overdue Aging Analysis</CardTitle>
            <CardDescription>
              Risk distribution of delayed borrower installments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/60">
              <div className="grid grid-cols-4 p-3 bg-muted/40 text-xs font-bold text-muted-foreground">
                <span>Overdue Bracket</span>
                <span>Account Count</span>
                <span>Overdue Balance</span>
                <span className="text-right">Risk Level</span>
              </div>
              {agingData.map((g, idx) => (
                <div key={idx} className="grid grid-cols-4 p-3.5 text-xs items-center hover:bg-muted/30">
                  <span className="font-semibold text-foreground">{g.bracket}</span>
                  <span className="text-muted-foreground">{g.accounts} Borrowers</span>
                  <span className="font-bold text-destructive">{formatCurrency(g.amount)}</span>
                  <div className="text-right">
                    <Badge variant={g.risk === "Low" ? "default" : g.risk === "Medium" ? "warning" : "destructive"}>
                      {g.risk} Risk
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
