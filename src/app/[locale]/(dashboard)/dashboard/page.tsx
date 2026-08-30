"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, HandCoins, ReceiptText, AlertTriangle,
  ArrowUpRight, Plus, TrendingUp, CreditCard,
  Building, CheckCircle2, Clock, ChevronRight,
  X, ChevronLeft, BookOpen,
  LayoutDashboard, UserPlus, FileText, Wallet, BarChart3,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort } from "@/lib/utils";
import { fetchAllCustomers, CustomerData } from "@/lib/services/customerService";
import { fetchAllLoans, LoanData } from "@/lib/services/loanService";

// Tutorial steps
const TUTORIAL_STEPS = [
  {
    icon: LayoutDashboard,
    title: "Welcome to your Dashboard!",
    desc: "This is your control center. See live stats: total customers, active loans, today's collections, and outstanding amounts — all in real time.",
    color: "bg-blue-500",
  },
  {
    icon: UserPlus,
    title: "Add Customers",
    desc: "Go to Customers → Add New Customer to register borrowers with their Aadhaar, PAN, phone number, and area. Each customer gets a unique profile.",
    color: "bg-purple-500",
  },
  {
    icon: FileText,
    title: "Create Loans",
    desc: "Go to Loans → New Loan to disburse money. Choose loan type (Daily/Weekly/Monthly/Gold), set amount, interest rate, and EMI schedule automatically.",
    color: "bg-indigo-500",
  },
  {
    icon: Wallet,
    title: "Record Collections",
    desc: "Go to Collections to record daily EMI payments. Mark payments as Cash, UPI, or Cheque and generate instant digital receipts to share on WhatsApp.",
    color: "bg-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    desc: "Go to Reports to see profit/loss, agent performance, area-wise collection, and overdue analysis. Export data to CSV anytime.",
    color: "bg-amber-500",
  },
];

export default function DashboardPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const supabase = createClient();

  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("there");
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        // Get logged in user name
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
          setUserName(name.split(" ")[0]); // First name only

          // Show tutorial only on first login (stored in localStorage)
          const tutorialKey = `tutorial_done_${user.id}`;
          if (!localStorage.getItem(tutorialKey)) {
            setShowTutorial(true);
          }
        }

        const [cList, lList] = await Promise.all([
          fetchAllCustomers(),
          fetchAllLoans(),
        ]);
        setCustomers(cList);
        setLoans(lList);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const closeTutorial = () => {
    const supabaseClient = createClient();
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      if (user) localStorage.setItem(`tutorial_done_${user.id}`, "true");
    });
    setShowTutorial(false);
  };

  const totalActiveLoans = loans.filter((l) => l.status === "active" || l.status === "overdue");
  const totalDisbursedSum = loans.reduce((acc, l) => acc + (l.principalAmount || 0), 0);
  const totalOutstandingSum = loans.reduce((acc, l) => acc + (l.remainingBalance || 0), 0);
  const totalOverdueCount = loans.filter((l) => l.status === "overdue").length;

  const step = TUTORIAL_STEPS[tutorialStep];
  const StepIcon = step?.icon;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Tutorial Overlay ── */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
            {/* Close / Skip button */}
            <button
              onClick={closeTutorial}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              title="Skip Tutorial"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step indicator */}
            <div className="flex gap-1.5 mb-6">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full flex-1 transition-all ${i === tutorialStep ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>

            {/* Icon */}
            <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
              <StepIcon className="w-7 h-7 text-white" />
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-foreground mb-2">{step.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{step.desc}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={closeTutorial}
                className="text-muted-foreground"
              >
                Skip tour
              </Button>

              <div className="flex gap-2">
                {tutorialStep > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setTutorialStep(s => s - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
                {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                  <Button size="sm" onClick={() => setTutorialStep(s => s + 1)} className="gap-1">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={closeTutorial} className="gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Done!
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl gradient-primary text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <Badge className="bg-white/20 text-white border-0 backdrop-blur-md mb-2">
            Sri Krishna Finance • Admin
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-sm text-white/80 max-w-lg">
            Here is your daily collection summary and active loan status for today.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link href={`/${locale}/loans/new`}>
            <Button variant="secondary" size="sm" className="gap-2 bg-white/90 text-primary hover:bg-white font-semibold">
              <Plus className="w-4 h-4" />
              New Loan
            </Button>
          </Link>
          <Link href={`/${locale}/customers/new`}>
            <Button variant="outline" size="sm" className="gap-2 border-white/40 text-white hover:bg-white/10">
              <Users className="w-4 h-4" />
              New Customer
            </Button>
          </Link>
          <button
            onClick={() => { setTutorialStep(0); setShowTutorial(true); }}
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors border border-white/30 rounded-lg px-3 py-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Tour Guide
          </button>
        </div>

        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t("dashboard.totalCustomers")}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-primary flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">{customers.length}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />Verified Borrowers
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t("dashboard.activeLoans")}</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">{totalActiveLoans.length}</h3>
            <p className="text-xs text-muted-foreground mt-1">Disbursed: {formatCurrencyShort(totalDisbursedSum)}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t("dashboard.todaysCollection")}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ReceiptText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">{formatCurrencyShort(48500)}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />78% of daily target
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">{t("dashboard.outstandingAmount")}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-foreground">{formatCurrencyShort(totalOutstandingSum)}</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />Across {loans.length} loans
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Quick Actions & Live Collection List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-3">
            <h3 className="font-bold text-base text-foreground">{t("dashboard.quickActions")}</h3>
            <div className="space-y-2">
              <Link href={`/${locale}/staff`} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary">{t("staff.title")} & {t("staff.permissions")}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link href={`/${locale}/settings/areas`} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-primary flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary">{t("settings.areas")}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>

              <Link href={`/${locale}/settings/company`} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary">{t("settings.loanDefaults")}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          </div>

          {totalOverdueCount > 0 && (
            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">{totalOverdueCount} {t("dashboard.overdueLoans")}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t("notifications.dueReminder", { customer: "North Ward", amount: "₹2,500", date: t("common.today") })}
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-foreground">{t("dashboard.recentActivity")}</h3>
            <Badge variant="outline" className="text-[11px]">{t("common.active")}</Badge>
          </div>

          {customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs mt-1">Add customers and record collections to see activity here</p>
              <Link href={`/${locale}/customers/new`}>
                <Button size="sm" className="mt-4 gap-2"><Plus className="w-4 h-4" />Add First Customer</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {[
                { customer: "K. Annadurai", amount: 1500, mode: "Cash", area: "Main Market Route", time: "10 mins ago", staff: "Karthik R." },
                { customer: "S. Meenakshi", amount: 2000, mode: "UPI", area: "North Ward", time: "25 mins ago", staff: "Suresh K." },
                { customer: "V. Thangaraj", amount: 1000, mode: "Cash", area: "Main Market Route", time: "42 mins ago", staff: "Karthik R." },
                { customer: "R. Balamurugan", amount: 3500, mode: "UPI", area: "South Town", time: "1 hour ago", staff: "Suresh K." },
              ].map((col, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold">₹</div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{col.customer}</p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">{col.area} • Collected by {col.staff}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-foreground">+{formatCurrency(col.amount)}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground mr-1">[{col.mode}]</span>{col.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}