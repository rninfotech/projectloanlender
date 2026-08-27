"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  ArrowLeft,
  Phone,
  MapPin,
  HandCoins,
  CreditCard,
  MessageSquare,
  Plus,
  Receipt,
  FileText,
  Smartphone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";

import { useState, useEffect } from "react";
import { fetchAllCustomers, CustomerData } from "@/lib/services/customerService";
import { fetchAllLoans, LoanData } from "@/lib/services/loanService";

export default function CustomerDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const customerId = params.id as string;

  const [activeTab, setActiveTab] = useState<"loans" | "payments" | "kyc">("loans");
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [customerLoans, setCustomerLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cList, lList] = await Promise.all([
          fetchAllCustomers(),
          fetchAllLoans(),
        ]);
        const found = cList.find((c) => c.id === customerId || c.customerNumber === customerId) || cList[0];
        setCustomerData(found);

        if (found) {
          const userLoans = lList
            .filter((l) => l.customerId === found.id || l.phone === found.phone || l.customerName === found.fullName)
            .map((l) => ({
              id: l.id,
              loanNumber: l.loanNumber,
              loanType: l.loanType === "daily" ? "Daily Collection" : l.loanType === "weekly" ? "Weekly Collection" : "Monthly EMI",
              principal: l.principalAmount,
              totalPayable: l.totalPayable,
              totalPaid: l.totalPaid,
              outstanding: l.remainingBalance,
              installmentAmount: l.installmentAmount,
              totalInstallments: l.totalInstallments,
              paidInstallments: l.paidInstallments,
              disbursedDate: l.disbursedDate,
              maturityDate: l.maturityDate,
              status: l.status,
            }));
          setCustomerLoans(userLoans.length > 0 ? userLoans : []);
        }
      } catch (err) {
        console.error("Error loading customer details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customerId]);

  const customer: CustomerData = customerData || {
    id: customerId,
    customerNumber: "CUS-0001",
    fullName: "Borrower Profile",
    phone: "+91 98401 55678",
    altPhone: "",
    email: "",
    address: "Madurai",
    area: "Main Market Route",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625001",
    idType: "Aadhaar Card",
    idNumber: "5432 9876 1234",
    portalEnabled: true,
    preferredLang: "ta" as const,
    totalOutstanding: 0,
    totalBorrowed: 0,
    totalRepaid: 0,
    outstandingBalance: 0,
    activeLoansCount: 0,
    status: "active" as const,
    notes: "",
  };

  const loans = customerLoans;

  // Sample Payment Receipts
  const payments = [
    {
      id: "pay-1",
      receiptNumber: "RCP-2026-0089",
      date: "2026-08-27",
      amount: 1500,
      mode: "Cash",
      loanNumber: "LN-2026-0001",
      collectedBy: "Karthik Rajan",
    },
    {
      id: "pay-2",
      receiptNumber: "RCP-2026-0074",
      date: "2026-08-20",
      amount: 2000,
      mode: "UPI",
      loanNumber: "LN-2026-0001",
      collectedBy: "Karthik Rajan",
    },
    {
      id: "pay-3",
      receiptNumber: "RCP-2026-0061",
      date: "2026-08-13",
      amount: 2000,
      mode: "Cash",
      loanNumber: "LN-2026-0001",
      collectedBy: "Karthik Rajan",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/customers`}>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {customer.fullName}
              </h1>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {customer.customerNumber}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>📍 {customer.area}, {customer.city}</span>
              <span>•</span>
              <span>📞 {customer.phone}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp Reminder Button */}
          <a
            href={getWhatsAppShareUrl(
              customer.phone,
              `வணக்கம் ${customer.fullName}, ஸ்ரீ கிருஷ்ணா பைனான்ஸ். உங்கள் கடன் நிலுவைத் தொகை ₹${customer.outstandingBalance || customer.totalOutstanding || 0}. விவரங்களுக்கு அழைக்கவும்.`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10">
              <MessageSquare className="w-4 h-4" />
              WhatsApp Alert
            </Button>
          </a>

          <Link href={`/${locale}/loans/new`}>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Loan
            </Button>
          </Link>
        </div>
      </div>

      {/* Customer 360 Overview Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium">Lifetime Borrowed</span>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {formatCurrencyShort(customer.totalBorrowed || 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium">Total Repaid</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrencyShort(customer.totalRepaid || 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium">Current Balance Due</span>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrencyShort(customer.outstandingBalance || customer.totalOutstanding || 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <span className="text-xs text-muted-foreground font-medium">Borrower Portal App</span>
          <div className="mt-1">
            {customer.portalEnabled ? (
              <Badge variant="success" className="gap-1 text-xs">
                <Smartphone className="w-3.5 h-3.5" />
                Enabled (Active)
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Disabled</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-muted/60 rounded-2xl w-fit border border-border/60">
        <button
          onClick={() => setActiveTab("loans")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "loans"
              ? "bg-card text-foreground shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <HandCoins className="w-4 h-4 text-primary" />
          Loans ({loans.length})
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "payments"
              ? "bg-card text-foreground shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Receipt className="w-4 h-4 text-primary" />
          Payment History ({payments.length})
        </button>

        <button
          onClick={() => setActiveTab("kyc")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "kyc"
              ? "bg-card text-foreground shadow-sm border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4 text-primary" />
          KYC & Contact Info
        </button>
      </div>

      {/* TAB 1: Loans */}
      {activeTab === "loans" && (
        <div className="space-y-4 animate-fade-in">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <HandCoins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">{loan.loanNumber}</h3>
                      <Badge variant={loan.status === "active" ? "default" : "secondary"}>
                        {loan.status === "active" ? "Active" : "Closed"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {loan.loanType} • ₹{loan.installmentAmount} / day
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Disbursed:</span>
                    <p className="font-semibold text-foreground">{formatDate(loan.disbursedDate)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Maturity:</span>
                    <p className="font-semibold text-foreground">{formatDate(loan.maturityDate)}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Repaid: <strong className="text-foreground">{formatCurrency(loan.totalPaid)}</strong> ({loan.paidInstallments}/{loan.totalInstallments} inst.)
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    Remaining: {formatCurrency(loan.outstanding)}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (loan.totalPaid / loan.totalPayable) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Payment Receipts */}
      {activeTab === "payments" && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              Collections & Receipts History
            </CardTitle>
            <CardDescription>
              All recorded payments with receipt numbers and collection agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {payments.map((pay) => (
                <div
                  key={pay.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold">
                      ₹
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground text-sm">
                          {pay.receiptNumber}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {pay.mode}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {formatDate(pay.date)} • Collected by {pay.collectedBy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="font-bold text-base text-foreground">
                      +{formatCurrency(pay.amount)}
                    </span>
                    <a
                      href={getWhatsAppShareUrl(
                        customer.phone,
                        `ரசீது: ${pay.receiptNumber}\nதொகை: ₹${pay.amount}\nதேதி: ${pay.date}\nநன்றி - ஸ்ரீ கிருஷ்ணா பைனான்ஸ்.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="h-8 px-2.5 text-[11px] gap-1 text-emerald-600 border-emerald-500/30">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Share
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: KYC Details */}
      {activeTab === "kyc" && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Identity & Residential Records</CardTitle>
            <CardDescription>
              Verified proof of identity and guarantor details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
                <span className="text-muted-foreground text-xs">ID Proof Type</span>
                <p className="font-semibold text-foreground text-sm mt-1">{customer.idType}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
                <span className="text-muted-foreground text-xs">Document Number</span>
                <p className="font-mono font-semibold text-foreground text-sm mt-1">{customer.idNumber}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
              <span className="text-muted-foreground text-xs">Permanent / Business Address</span>
              <p className="font-semibold text-foreground text-sm mt-1">
                {customer.address}, {customer.area}, {customer.city} - {customer.pincode}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60">
              <span className="text-muted-foreground text-xs">Underwriter Remarks</span>
              <p className="text-muted-foreground text-xs mt-1">{customer.notes || "No remarks noted."}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
