"use client";

import { useState } from "react";
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
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";

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

const INITIAL_DUES: DueItem[] = [
  {
    id: "due-1",
    loanId: "ln-1",
    loanNumber: "LN-2026-0001",
    customerName: "K. Annadurai",
    customerPhone: "+91 98401 55678",
    customerArea: "Main Market Route",
    installmentNo: 35,
    totalInstallments: 100,
    dueAmount: 220,
    overdueDays: 0,
    loanType: "Daily Collection",
    assignedStaff: "Karthik Rajan",
    isCollected: false,
  },
  {
    id: "due-2",
    loanId: "ln-2",
    loanNumber: "LN-2026-0002",
    customerName: "S. Meenakshi",
    customerPhone: "+91 97109 88765",
    customerArea: "North Ward",
    installmentNo: 3,
    totalInstallments: 10,
    dueAmount: 5600,
    overdueDays: 4,
    loanType: "Monthly EMI",
    assignedStaff: "Karthik Rajan",
    isCollected: false,
  },
  {
    id: "due-3",
    loanId: "ln-3",
    loanNumber: "LN-2026-0003",
    customerName: "V. Thangaraj",
    customerPhone: "+91 94441 22334",
    customerArea: "Main Market Route",
    installmentNo: 6,
    totalInstallments: 10,
    dueAmount: 1650,
    overdueDays: 0,
    loanType: "Weekly Collection",
    assignedStaff: "Karthik Rajan",
    isCollected: true,
    collectedAmount: 1650,
    paymentMode: "Cash",
    receiptNumber: "RCP-2026-0091",
  },
  {
    id: "due-4",
    loanId: "ln-4",
    loanNumber: "LN-2026-0004",
    customerName: "R. Balamurugan",
    customerPhone: "+91 98840 99887",
    customerArea: "South Town",
    installmentNo: 9,
    totalInstallments: 12,
    dueAmount: 1000,
    overdueDays: 0,
    loanType: "Gold Loan",
    assignedStaff: "Suresh Kumar",
    isCollected: true,
    collectedAmount: 1000,
    paymentMode: "UPI",
    receiptNumber: "RCP-2026-0092",
  },
  {
    id: "due-5",
    loanId: "ln-5",
    loanNumber: "LN-2026-0005",
    customerName: "M. Selvaraj",
    customerPhone: "+91 97890 11223",
    customerArea: "Main Market Route",
    installmentNo: 12,
    totalInstallments: 100,
    dueAmount: 300,
    overdueDays: 1,
    loanType: "Daily Collection",
    assignedStaff: "Karthik Rajan",
    isCollected: false,
  },
];

export default function CollectionsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [dues, setDues] = useState<DueItem[]>(INITIAL_DUES);
  const [selectedArea, setSelectedArea] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "collected" | "overdue">("all");
  const [search, setSearch] = useState("");

  // Payment Modal State
  const [collectingItem, setCollectingItem] = useState<DueItem | null>(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "UPI" | "Bank Transfer">("Cash");
  const [collectSuccess, setCollectSuccess] = useState<string | null>(null);

  const areas = ["all", "Main Market Route", "North Ward", "South Town", "East Bazaar"];

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
    setCollectAmount(String(item.dueAmount));
    setPaymentMode("Cash");
  };

  const handleConfirmCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingItem) return;

    const receiptNo = `RCP-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}`;

    setDues((prev) =>
      prev.map((d) =>
        d.id === collectingItem.id
          ? {
              ...d,
              isCollected: true,
              collectedAmount: parseFloat(collectAmount) || d.dueAmount,
              paymentMode,
              receiptNumber: receiptNo,
            }
          : d
      )
    );

    setCollectSuccess(receiptNo);
    setTimeout(() => {
      setCollectingItem(null);
      setCollectSuccess(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ReceiptText className="w-7 h-7 text-primary" />
            {t("collections.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("collections.todaysDue")}
          </p>
        </div>

        <Link href={`/${locale}/payments`}>
          <Button variant="outline" size="lg" className="gap-2">
            <CreditCard className="w-4 h-4" />
            {t("payments.title")}
          </Button>
        </Link>
      </div>

      {/* 4 Summary Stat Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("collections.totalDueToday")}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {formatCurrency(totalTargetToday)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("collections.collectedToday")}</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(collectedTodaySum)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("collections.pendingToday")}</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(pendingTodaySum)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">{t("collections.collected")}</p>
          <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
            {dues.filter((d) => d.isCollected).length} / {dues.length}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Route Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/60 overflow-x-auto scrollbar-none">
          {[
            { id: "all", label: `${t("common.all")} (${dues.length})` },
            { id: "pending", label: `${t("installments.statuses.pending")} (${dues.filter((d) => !d.isCollected).length})` },
            { id: "overdue", label: `${t("installments.statuses.overdue")} ⚠️ (${dues.filter((d) => d.overdueDays > 0 && !d.isCollected).length})` },
            { id: "collected", label: `${t("collections.collected")} (${dues.filter((d) => d.isCollected).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Route Area Selector (Vasool Drive feature) & Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search borrower or loan #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">📍 All Routes</option>
            {areas
              .filter((a) => a !== "all")
              .map((area) => (
                <option key={area} value={area}>
                  📍 {area}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Collection Dues Cards / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDues.length === 0 ? (
          <div className="col-span-2 p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
            <h3 className="font-semibold text-base text-foreground">No pending collections in this filter</h3>
            <p className="text-xs text-muted-foreground mt-1">
              All collections cleared or none match the selected route
            </p>
          </div>
        ) : (
          filteredDues.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 ${
                item.isCollected
                  ? "border-success/40 bg-success/5"
                  : item.overdueDays > 0
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border/80"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{item.customerName}</h3>
                    <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {item.loanNumber}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {item.customerArea} • 📞 {item.customerPhone}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground">Due Amount:</span>
                  <p className="font-bold text-xl text-foreground">
                    {formatCurrency(item.dueAmount)}
                  </p>
                </div>
              </div>

              {/* Installment Badge & Overdue Warning */}
              <div className="flex items-center justify-between text-xs bg-muted/30 p-2.5 rounded-xl border border-border/50">
                <span className="font-medium text-foreground">
                  Installment #{item.installmentNo} of {item.totalInstallments} ({item.loanType})
                </span>

                {item.isCollected ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Paid ({item.paymentMode})
                  </Badge>
                ) : item.overdueDays > 0 ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {item.overdueDays} Days Overdue
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">
                    Due Today
                  </Badge>
                )}
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                {item.isCollected ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Receipt: <strong className="text-foreground font-mono">{item.receiptNumber}</strong></span>
                    <Link href={`/${locale}/payments/${item.receiptNumber}/receipt`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                        <Printer className="w-3 h-3" />
                        Receipt
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <a
                    href={getWhatsAppShareUrl(
                      item.customerPhone,
                      `வணக்கம் ${item.customerName}, இன்று உங்கள் கடன் தவணை ₹${item.dueAmount} செலுத்த வேண்டிய நாள். - ஸ்ரீ கிருஷ்ணா பைனான்ஸ்.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp Due Alert
                  </a>
                )}

                {!item.isCollected ? (
                  <Button
                    size="sm"
                    onClick={() => handleOpenCollectModal(item)}
                    className="gap-1.5 bg-primary hover:bg-primary/90 text-xs shadow-md shadow-primary/20"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Collect ₹{item.dueAmount}
                  </Button>
                ) : (
                  <a
                    href={getWhatsAppShareUrl(
                      item.customerPhone,
                      `ரசீது: ${item.receiptNumber}\nவாடிக்கையாளர்: ${item.customerName}\nவசூலித்த தொகை: ₹${item.collectedAmount}\nசெலுத்திய முறை: ${item.paymentMode}\nநன்றி - ஸ்ரீ கிருஷ்ணா பைனான்ஸ்.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1.5 text-emerald-600 border-emerald-500/30">
                      <Send className="w-3.5 h-3.5" />
                      Send WhatsApp Receipt
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Collection Modal */}
      {collectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-border/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-foreground">Record Payment Collection</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {collectingItem.customerName} • {collectingItem.loanNumber}
                </p>
              </div>
              <button
                onClick={() => setCollectingItem(null)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {collectSuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg text-foreground">Payment Collected!</h4>
                <p className="text-xs text-muted-foreground">
                  Receipt Generated: <strong className="text-foreground font-mono">{collectSuccess}</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmCollection} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payAmt" required>Collection Amount (₹)</Label>
                  <Input
                    id="payAmt"
                    type="number"
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    className="text-lg font-bold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Cash", "UPI", "Bank Transfer"] as const).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          paymentMode === mode
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installment:</span>
                    <span className="font-semibold">#{collectingItem.installmentNo} ({collectingItem.loanType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Officer:</span>
                    <span className="font-semibold">{collectingItem.assignedStaff}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setCollectingItem(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="lg" className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Issue Receipt
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
