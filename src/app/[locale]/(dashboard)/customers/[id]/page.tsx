"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";
import { fetchAllCustomers, CustomerData } from "@/lib/services/customerService";
import { fetchAllLoans, LoanData } from "@/lib/services/loanService";

export default function CustomerDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const customerId = params.id as string;

  const [activeTab, setActiveTab] = useState<"loans" | "payments" | "kyc">("loans");
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [customerLoans, setCustomerLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [cList, lList] = await Promise.all([
          fetchAllCustomers(),
          fetchAllLoans(),
        ]);
        const found = cList.find((c) => c.id === customerId || c.customerNumber === customerId);
        setCustomer(found || null);

        if (found) {
          const userLoans = lList.filter(
            (l) => l.customerId === found.id || l.phone === found.phone || l.customerName === found.fullName
          );
          setCustomerLoans(userLoans);
        }
      } catch (err) {
        console.error("Error loading customer details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customerId]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-sm text-muted-foreground">Loading borrower profile...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-md mx-auto p-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
        <Users className="w-12 h-12 text-muted-foreground opacity-40 mx-auto mb-3" />
        <h2 className="font-bold text-lg text-foreground">Customer Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-5">
          The requested borrower record does not exist or has been removed.
        </p>
        <Link href={`/${locale}/customers`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  const totalOutstanding = customerLoans.reduce((acc, l) => acc + l.remainingBalance, 0);
  const totalBorrowed = customerLoans.reduce((acc, l) => acc + l.principalAmount, 0);
  const totalRepaid = customerLoans.reduce((acc, l) => acc + l.totalPaid, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/customers`}>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{customer.fullName}</h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                {customer.customerNumber}
              </span>
              <Badge variant={customer.status === "active" ? "success" : "secondary"}>
                {customer.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              📞 {customer.phone} • 📍 {customer.area || "General Area"}, {customer.city}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppShareUrl(
              customer.phone,
              `Hello ${customer.fullName}, here is your account summary. Total outstanding balance: ₹${totalOutstanding}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Notice
            </Button>
          </a>
          <Link href={`/${locale}/loans/new`}>
            <Button size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Disburse Loan
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Disbursed</span>
          <p className="text-2xl font-bold text-foreground mt-1.5">{formatCurrency(totalBorrowed)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{customerLoans.length} total loans issued</p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Total Repaid</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatCurrency(totalRepaid)}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            {totalBorrowed > 0 ? `${Math.round((totalRepaid / totalBorrowed) * 100)}% recovery rate` : "0% recovery"}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Current Outstanding Balance</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{formatCurrency(totalOutstanding)}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {customerLoans.filter((l) => l.status === "active" || l.status === "overdue").length} active loan accounts
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/80 pb-2">
        <button
          onClick={() => setActiveTab("loans")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "loans" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Loans ({customerLoans.length})
        </button>
        <button
          onClick={() => setActiveTab("kyc")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "kyc" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          KYC & Personal Info
        </button>
      </div>

      {/* Tab: Loans */}
      {activeTab === "loans" && (
        <div className="space-y-4">
          {customerLoans.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-border rounded-2xl bg-muted/20">
              <HandCoins className="w-10 h-10 text-muted-foreground opacity-40 mx-auto mb-2" />
              <p className="font-semibold text-sm text-foreground">No loans active for this customer</p>
              <p className="text-xs text-muted-foreground mt-1">Disburse a daily or weekly loan to start tracking installments.</p>
              <Link href={`/${locale}/loans/new`} className="inline-block mt-4">
                <Button size="sm" className="gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Issue Loan
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerLoans.map((loan) => (
                <div key={loan.id} className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-sm text-foreground">{loan.loanNumber}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{loan.loanType.toUpperCase()}</p>
                    </div>
                    <Badge variant={loan.status === "active" ? "success" : loan.status === "overdue" ? "destructive" : "secondary"}>
                      {loan.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-3 rounded-xl">
                    <div>
                      <span className="text-muted-foreground">Principal:</span>
                      <p className="font-bold text-foreground">{formatCurrency(loan.principalAmount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Outstanding:</span>
                      <p className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(loan.remainingBalance)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs">
                    <span className="text-muted-foreground">EMI: ₹{loan.installmentAmount}</span>
                    <Link href={`/${locale}/loans/${loan.id}`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        View Schedule
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: KYC */}
      {activeTab === "kyc" && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm p-6">
          <h3 className="font-bold text-sm text-foreground mb-4">Customer KYC & Contact Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">Full Legal Name:</span>
              <p className="font-semibold text-foreground text-sm">{customer.fullName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Primary Mobile:</span>
              <p className="font-semibold text-foreground text-sm">{customer.phone}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Alternate Phone:</span>
              <p className="font-semibold text-foreground text-sm">{customer.altPhone || "None"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Email:</span>
              <p className="font-semibold text-foreground text-sm">{customer.email || "None"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Area Route:</span>
              <p className="font-semibold text-foreground text-sm">{customer.area || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">City & State:</span>
              <p className="font-semibold text-foreground text-sm">{customer.city}, {customer.state || "Tamil Nadu"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">ID Proof:</span>
              <p className="font-semibold text-foreground text-sm">{customer.idType || "N/A"} - {customer.idNumber || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Address:</span>
              <p className="font-semibold text-foreground text-sm">{customer.address || "None"}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}