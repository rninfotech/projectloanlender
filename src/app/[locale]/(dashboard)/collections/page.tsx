"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ReceiptText,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Printer,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  TrendingUp,
  X,
  Send,
  Plus,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";
import { fetchAllLoans, LoanData } from "@/lib/services/loanService";

interface DueItem {
  id: string;
  loanId: string;
  loanNumber: string;
  customerName: string;
  customerPhone: string;
  customerArea: string;
  installmentNo: number;
  totalInstallments: number;
  dueAmount: number;
  overdueDays: number;
  loanType: string;
  assignedStaff: string;
  isCollected: boolean;
  collectedAmount?: number;
  paymentMode?: string;
  receiptNumber?: string;
}

export default function CollectionsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [dues, setDues] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "collected" | "overdue">("all");
  const [search, setSearch] = useState("");

  // Payment Modal State
  const [collectingItem, setCollectingItem] = useState<DueItem | null>(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Bank Transfer">("Cash");
  const [collectSuccess, setCollectSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const loans = await fetchAllLoans();
        const activeLoans = loans.filter((l) => l.status === "active" || l.status === "overdue");

        const generatedDues: DueItem[] = activeLoans.map((loan, idx) => ({
          id: `due-${loan.id}`,
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          customerName: loan.customerName,
          customerPhone: loan.phone,
          customerArea: loan.area,
          installmentNo: (loan.paidInstallments || 0) + 1,
          totalInstallments: loan.totalInstallments,
          dueAmount: loan.installmentAmount,
          overdueDays: loan.overdueInstallments > 0 ? loan.overdueInstallments * 7 : 0,
          loanType: loan.loanType === "daily" ? "Daily Collection" : loan.loanType === "weekly" ? "Weekly Collection" : "Monthly EMI",
          assignedStaff: loan.assignedStaff || "Admin",
          isCollected: false,
        }));

        setDues(generatedDues);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueAreas = Array.from(new Set(dues.map((d) => d.customerArea).filter(Boolean)));
  const areas = ["all", ...uniqueAreas];

  const filteredDues = dues.filter((item) => {
    const matchesArea = selectedArea === "all" || item.customerArea === selectedArea;
    const matchesSearch =
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.loanNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.customerPhone.includes(search);

    let matchesTab = true;
    if (activeTab === "pending") matchesTab = !item.isCollected;
    if (activeTab === "collected") matchesTab = item.isCollected;
    if (activeTab === "overdue") matchesTab = item.overdueDays > 0 && !item.isCollected;

    return matchesArea && matchesSearch && matchesTab;
  });

  const totalTargetToday = dues.reduce((acc, d) => acc + d.dueAmount, 0);
  const collectedTodaySum = dues
    .filter((d) => d.isCollected)
    .reduce((acc, d) => acc + (d.collectedAmount || d.dueAmount), 0);
  const pendingTodaySum = totalTargetToday - collectedTodaySum;

  const handleOpenCollectModal = (item: DueItem) => {
    setCollectingItem(item);
    setCollectAmount(item.dueAmount.toString());
    setPaymentMode("Cash");
    setCollectSuccess(null);
  };

  const handleConfirmCollection = () => {
    if (!collectingItem) return;

    const receiptNo = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setDues((prev) =>
      prev.map((d) => {
        if (d.id === collectingItem.id) {
          return {
            ...d,
            isCollected: true,
            collectedAmount: parseFloat(collectAmount) || d.dueAmount,
            paymentMode,
            receiptNumber: receiptNo,
          };
        }
        return d;
      })
    );

    setCollectSuccess(receiptNo);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Title & Collection Drive Target */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ReceiptText className="w-7 h-7 text-primary" />
            {t("collections.title")} (Daily EMI Sheet)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Record cash & UPI collections, issue instant digital receipts, and route-wise Vasool tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs px-3 py-1 font-mono">
            🗓️ {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </Badge>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">{t("collections.todayTarget")}</span>
          <p className="text-2xl font-bold text-foreground mt-1.5">{formatCurrency(totalTargetToday)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {dues.length} total installment dues today
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">{t("collections.collected")}</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatCurrency(collectedTodaySum)}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {dues.filter((d) => d.isCollected).length} paid receipts generated
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">{t("collections.pending")}</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{formatCurrency(pendingTodaySum)}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
            {dues.filter((d) => !d.isCollected).length} dues remaining
          </p>
        </div>
      </div>

      {/* Filter Tabs & Area Selector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("collections.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {areas.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:inline" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-56"
              >
                <option value="all">📍 {t("collections.allAreas")}</option>
                {areas
                  .filter((a) => a !== "all")
                  .map((area) => (
                    <option key={area} value={area}>
                      📍 {area}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: `ALL DUES (${dues.length})` },
            { key: "pending", label: `PENDING (${dues.filter((d) => !d.isCollected).length})` },
            { key: "collected", label: `COLLECTED (${dues.filter((d) => d.isCollected).length})` },
            { key: "overdue", label: `OVERDUE (${dues.filter((d) => d.overdueDays > 0 && !d.isCollected).length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Due Collection Cards Grid */}
      {loading ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading collection sheet...</p>
        </div>
      ) : dues.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <ReceiptText className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="font-bold text-lg text-foreground">No dues scheduled</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            When you disburse daily or weekly loans, active installments will automatically appear here on your collection drive sheet.
          </p>
          <Link href={`/${locale}/loans/new`} className="mt-5">
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Disburse a Loan
            </Button>
          </Link>
        </div>
      ) : filteredDues.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
          <ReceiptText className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-semibold text-base text-foreground">No records match filter</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or route selection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDues.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-card/80 backdrop-blur-sm p-5 shadow-sm transition-all flex flex-col justify-between gap-4 ${
                item.isCollected
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : item.overdueDays > 0
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border/80"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{item.customerName}</span>
                    <span className="font-mono text-xs text-muted-foreground">({item.loanNumber})</span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3 text-primary" />
                    {item.customerPhone}
                    {item.customerArea && item.customerArea !== "N/A" && (
                      <>
                        <span className="text-border mx-1">•</span>
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {item.customerArea}
                      </>
                    )}
                  </p>
                </div>

                {item.isCollected ? (
                  <Badge variant="success" className="gap-1 text-xs">
                    <CheckCircle2 className="w-3 h-3" /> Paid
                  </Badge>
                ) : item.overdueDays > 0 ? (
                  <Badge variant="destructive" className="gap-1 text-xs">
                    <AlertTriangle className="w-3 h-3" /> {item.overdueDays}d Overdue
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                )}
              </div>

              {/* Installment Details */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground">Installment:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    #{item.installmentNo} of {item.totalInstallments} ({item.loanType})
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground">Amount Due:</span>
                  <p className="font-bold text-base text-foreground mt-0.5">
                    {formatCurrency(item.dueAmount)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <a
                  href={getWhatsAppShareUrl(
                    item.customerPhone,
                    `Hello ${item.customerName}, installment #${item.installmentNo} for loan ${item.loanNumber} of amount ₹${item.dueAmount} is due today. - Finance Office.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Remind
                </a>

                {item.isCollected ? (
                  <span className="text-xs text-muted-foreground font-mono">
                    {item.receiptNumber} ({item.paymentMode})
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleOpenCollectModal(item)}
                    className="h-8 px-3 text-xs gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Record Payment
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collect Modal */}
      {collectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="max-w-md w-full border-border bg-card shadow-2xl p-6 relative">
            <button
              onClick={() => setCollectingItem(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            {collectSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Collection Recorded!</h3>
                <p className="text-xs text-muted-foreground font-mono">Receipt No: {collectSuccess}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setCollectingItem(null)}>
                    Close
                  </Button>
                  <a
                    href={getWhatsAppShareUrl(
                      collectingItem.customerPhone,
                      `✅ Payment Received! Received ₹${collectAmount} for loan ${collectingItem.loanNumber}. Receipt: ${collectSuccess}. - Thank you.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="success" className="w-full gap-1.5 text-xs">
                      <Send className="w-3.5 h-3.5" /> WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-foreground">Record Collection</h3>
                  <p className="text-xs text-muted-foreground">
                    {collectingItem.customerName} • {collectingItem.loanNumber}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cAmount">Collected Amount (₹)</Label>
                  <Input
                    id="cAmount"
                    type="number"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Cash", "UPI", "Bank Transfer"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMode(mode)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                          paymentMode === mode
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCollectingItem(null)}>
                    Cancel
                  </Button>
                  <Button variant="success" onClick={handleConfirmCollection}>
                    Confirm & Generate Receipt
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}