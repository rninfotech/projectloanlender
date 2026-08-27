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
  Calendar,
  CreditCard,
  MessageSquare,
  Phone,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";

export default function CustomerLoansPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  // Sample Customer Portal Data
  const customer = {
    name: "K. Annadurai",
    customerNumber: "CUS-0001",
    phone: "+91 98401 55678",
    lenderName: "Sri Krishna Finance",
    lenderPhone: "+91 98401 23456",
  };

  const activeLoan = {
    loanNumber: "LN-2026-0001",
    loanType: "Daily Collection",
    principal: 20000,
    totalPayable: 22000,
    totalPaid: 7480,
    outstanding: 14520,
    installmentAmount: 220,
    paidInstallments: 34,
    totalInstallments: 100,
    nextDueDate: "2026-08-28",
    disbursedDate: "2026-01-15",
    maturityDate: "2026-04-25",
    assignedOfficer: "Karthik Rajan",
  };

  const upcomingInstallments = [
    { num: 35, date: "2026-08-28", amount: 220, status: "Due Tomorrow" },
    { num: 36, date: "2026-08-29", amount: 220, status: "Upcoming" },
    { num: 37, date: "2026-08-30", amount: 220, status: "Upcoming" },
    { num: 38, date: "2026-08-31", amount: 220, status: "Upcoming" },
  ];

  return (
    <div className="space-y-6">
      {/* Borrower Welcome Banner */}
      <div className="p-6 rounded-3xl gradient-primary text-white shadow-xl relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-white/20 text-white border-0 backdrop-blur-md">
            Customer ID: {customer.customerNumber}
          </Badge>
          <span className="text-xs text-white/80 font-medium">
            {customer.phone}
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {customer.name}
          </h1>
          <p className="text-xs text-white/80 mt-0.5">
            Your active loan account and repayment schedule
          </p>
        </div>

        {/* Highlight Next Due Card */}
        <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-[11px] text-white/70 block font-medium">Next Due Payment</span>
            <span className="text-xl font-black">{formatCurrency(activeLoan.installmentAmount)}</span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-white/70 block font-medium">Due Date</span>
            <span className="text-xs font-bold">{formatDate(activeLoan.nextDueDate)}</span>
          </div>
        </div>
      </div>

      {/* Active Loan Details Card */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-sm space-y-4 p-5 rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-foreground">
                {activeLoan.loanNumber}
              </span>
              <Badge variant="success" className="text-[10px]">Active</Badge>
              <Badge variant="default" className="text-[10px]">{activeLoan.loanType}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assigned Field Officer: <strong>{activeLoan.assignedOfficer}</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-muted-foreground">Remaining:</span>
            <p className="font-bold text-lg text-amber-600 dark:text-amber-400">
              {formatCurrency(activeLoan.outstanding)}
            </p>
          </div>
        </div>

        {/* Repayment Progress Meter */}
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-muted/30 border border-border/50">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">
              Total Repaid: <strong className="text-foreground">{formatCurrency(activeLoan.totalPaid)}</strong> ({activeLoan.paidInstallments}/{activeLoan.totalInstallments} inst.)
            </span>
            <span className="text-primary font-bold">
              {Math.round((activeLoan.totalPaid / activeLoan.totalPayable) * 100)}% Cleared
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(activeLoan.totalPaid / activeLoan.totalPayable) * 100}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
          <a
            href={getWhatsAppShareUrl(
              customer.lenderPhone,
              `வணக்கம், நான் ${customer.name} (கடன் எண்: ${activeLoan.loanNumber}). எனது தவணை ₹${activeLoan.installmentAmount} செலுத்துவதற்கான UPI QR குறியீடு அல்லது விவரங்களை அனுப்பவும்.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="outline" size="sm" className="w-full gap-2 text-emerald-600 border-emerald-500/30 text-xs h-10">
              <MessageSquare className="w-4 h-4" />
              Pay via WhatsApp
            </Button>
          </a>

          <Link href={`/${locale}/my-payments`} className="w-full">
            <Button size="sm" className="w-full gap-2 text-xs h-10">
              <CreditCard className="w-4 h-4" />
              View Receipts
            </Button>
          </Link>
        </div>
      </Card>

      {/* Upcoming Installments Schedule */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Upcoming Installment Schedule
          </CardTitle>
          <CardDescription>
            Your next upcoming daily payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/60">
            {upcomingInstallments.map((inst) => (
              <div
                key={inst.num}
                className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                    #{inst.num}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{formatDate(inst.date)}</p>
                    <p className="text-[10px] text-muted-foreground">{inst.status}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-foreground">
                    {formatCurrency(inst.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
