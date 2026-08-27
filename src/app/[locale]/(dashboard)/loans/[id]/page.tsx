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
  HandCoins,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  CreditCard,
  Printer,
  Shield,
  MapPin,
  Phone,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";

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

  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settled, setSettled] = useState(false);

  // Sample Loan Data
  const loan = {
    id: loanId,
    loanNumber: "LN-2026-0001",
    customerName: "K. Annadurai",
    customerPhone: "+91 98401 55678",
    customerArea: "Main Market Route",
    loanType: "Daily Collection",
    interestMethod: "Flat Rate",
    principal: 20000,
    interestRate: 10,
    totalInterest: 2000,
    totalPayable: 22000,
    totalPaid: 7480,
    outstanding: 14520,
    installmentAmount: 220,
    numInstallments: 100,
    paidInstallments: 34,
    disbursedDate: "2026-01-15",
    maturityDate: "2026-04-25",
    assignedStaff: "Karthik Rajan",
    collateral: "Personal Guarantee & Shop Lease Agreement",
    status: settled ? "closed" : "active",
  };

  // Generate 100 Installments for the schedule
  const installments: InstallmentRow[] = Array.from({ length: 20 }).map((_, i) => {
    const num = i + 1;
    const isPaid = num <= 34;
    const isOverdue = num === 35;
    return {
      installmentNo: num,
      dueDate: `2026-02-${String(num).padStart(2, "0")}`,
      principalDue: 200,
      interestDue: 20,
      totalDue: 220,
      paidAmount: isPaid ? 220 : 0,
      status: isPaid ? "paid" : isOverdue ? "overdue" : "pending",
      paidDate: isPaid ? `2026-02-${String(num).padStart(2, "0")}` : undefined,
    };
  });

  const getInstBadge = (status: InstallmentRow["status"]) => {
    switch (status) {
      case "paid":
        return <Badge variant="success" className="text-[10px]">Paid</Badge>;
      case "overdue":
        return <Badge variant="destructive" className="text-[10px]">Overdue</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/loans`}>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {loan.loanNumber}
              </h1>
              <Badge variant={loan.status === "active" ? "success" : "secondary"}>
                {loan.status === "active" ? "Active Loan" : "Settled / Closed"}
              </Badge>
              <Badge variant="default" className="text-xs">{loan.loanType}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Borrower: <strong className="text-foreground">{loan.customerName}</strong> (📞 {loan.customerPhone}) • 📍 {loan.customerArea}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={getWhatsAppShareUrl(
              loan.customerPhone,
              `வணக்கம் ${loan.customerName}, கடன் எண்: ${loan.loanNumber}.\nஅசல்: ₹${loan.principal}\nசெலுத்தியது: ₹${loan.totalPaid} (${loan.paidInstallments}/${loan.numInstallments} தவணைகள்)\nநிலுவை: ₹${loan.outstanding}.\n- ஸ்ரீ கிருஷ்ணா பைனான்ஸ்.`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
              <MessageSquare className="w-4 h-4" />
              WhatsApp Statement
            </Button>
          </a>

          <Link href={`/${locale}/collections`}>
            <Button size="sm" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Collect Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Overview Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium">Disbursed Principal</span>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {formatCurrency(loan.principal)}
          </p>
          <span className="text-[11px] text-muted-foreground">+ ₹{loan.totalInterest} Interest ({loan.interestRate}%)</span>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium">Total Repaid</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(loan.totalPaid)}
          </p>
          <span className="text-[11px] text-muted-foreground">{loan.paidInstallments} of {loan.numInstallments} paid</span>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium">Balance Remaining</span>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(loan.outstanding)}
          </p>
          <span className="text-[11px] text-muted-foreground">₹{loan.installmentAmount} / day</span>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium">Officer Assigned</span>
          <p className="text-sm font-bold text-foreground mt-1">
            {loan.assignedStaff}
          </p>
          <span className="text-[11px] text-muted-foreground">Maturity: {formatDate(loan.maturityDate)}</span>
        </div>
      </div>

      {/* Repayment Progress Meter */}
      <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-muted-foreground">
            Repayment Status: <strong className="text-foreground">{Math.round((loan.totalPaid / loan.totalPayable) * 100)}% Completed</strong>
          </span>
          <span className="text-primary font-bold">
            {loan.paidInstallments} / {loan.numInstallments} Installments Cleared
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(loan.totalPaid / loan.totalPayable) * 100}%` }}
          />
        </div>
      </div>

      {/* Installment Schedule Table */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              Complete Installment Schedule
            </CardTitle>
            <CardDescription>
              Due date calendar, breakdown, and collection verification
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { setSettled(true); }}
            className="text-xs gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            Early Settle Loan
          </Button>
        </CardHeader>

        <CardContent>
          <div className="border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/60">
            {/* Table Header */}
            <div className="grid grid-cols-5 p-3 bg-muted/40 text-xs font-bold text-muted-foreground">
              <span>#</span>
              <span>Due Date</span>
              <span>Amount</span>
              <span>Paid</span>
              <span className="text-right">Status</span>
            </div>

            {/* Installments Rows */}
            <div className="max-h-96 overflow-y-auto divide-y divide-border/60">
              {installments.map((inst) => (
                <div
                  key={inst.installmentNo}
                  className="grid grid-cols-5 p-3 text-xs items-center hover:bg-muted/30 transition-colors"
                >
                  <span className="font-bold text-foreground">
                    #{inst.installmentNo}
                  </span>
                  <span className="text-muted-foreground">
                    {formatDate(inst.dueDate)}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(inst.totalDue)}
                  </span>
                  <span className={inst.paidAmount > 0 ? "font-bold text-emerald-600" : "text-muted-foreground"}>
                    {inst.paidAmount > 0 ? formatCurrency(inst.paidAmount) : "—"}
                  </span>
                  <div className="text-right">
                    {getInstBadge(inst.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
