"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  CreditCard,
  Search,
  Printer,
  MessageSquare,
  Filter,
  Calendar,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";

interface PaymentRecord {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  loanNumber: string;
  amount: number;
  paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Cheque";
  paymentDate: string;
  collectedBy: string;
  installmentNo: number;
}

const SAMPLE_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay-1",
    receiptNumber: "RCP-2026-0091",
    customerName: "V. Thangaraj",
    customerPhone: "+91 94441 22334",
    loanNumber: "LN-2026-0003",
    amount: 1650,
    paymentMode: "Cash",
    paymentDate: "2026-08-27",
    collectedBy: "Karthik Rajan",
    installmentNo: 6,
  },
  {
    id: "pay-2",
    receiptNumber: "RCP-2026-0092",
    customerName: "R. Balamurugan",
    customerPhone: "+91 98840 99887",
    loanNumber: "LN-2026-0004",
    amount: 1000,
    paymentMode: "UPI",
    paymentDate: "2026-08-27",
    collectedBy: "Suresh Kumar",
    installmentNo: 9,
  },
  {
    id: "pay-3",
    receiptNumber: "RCP-2026-0089",
    customerName: "K. Annadurai",
    customerPhone: "+91 98401 55678",
    loanNumber: "LN-2026-0001",
    amount: 1500,
    paymentMode: "Cash",
    paymentDate: "2026-08-26",
    collectedBy: "Karthik Rajan",
    installmentNo: 34,
  },
  {
    id: "pay-4",
    receiptNumber: "RCP-2026-0074",
    customerName: "S. Meenakshi",
    customerPhone: "+91 97109 88765",
    loanNumber: "LN-2026-0002",
    amount: 5600,
    paymentMode: "UPI",
    paymentDate: "2026-08-20",
    collectedBy: "Karthik Rajan",
    installmentNo: 2,
  },
];

export default function PaymentsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [payments, setPayments] = useState<PaymentRecord[]>(SAMPLE_PAYMENTS);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.loanNumber.toLowerCase().includes(search.toLowerCase());
    const matchesMode = modeFilter === "all" || p.paymentMode === modeFilter;
    return matchesSearch && matchesMode;
  });

  const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-primary" />
            {t("payments.title")} (Receipts Log)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All recorded collection receipts with payment modes and WhatsApp sharing
          </p>
        </div>

        <Link href={`/${locale}/collections`}>
          <Button size="lg" className="w-full sm:w-auto gap-2">
            <CreditCard className="w-4 h-4" />
            Collect Today&apos;s Dues
          </Button>
        </Link>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Receipts Issued</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">{payments.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Collections</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Cash Collections</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {formatCurrency(
              payments.filter((p) => p.paymentMode === "Cash").reduce((acc, p) => acc + p.amount, 0)
            )}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Digital / UPI</p>
          <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
            {formatCurrency(
              payments.filter((p) => p.paymentMode === "UPI").reduce((acc, p) => acc + p.amount, 0)
            )}
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by receipt # (e.g. RCP-2026-0091) or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-48"
        >
          <option value="all">All Modes</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>

      {/* Payments List / Table */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold shrink-0">
                    ₹
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-foreground">
                        {p.receiptNumber}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {p.paymentMode}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">
                        ({p.loanNumber} • Inst #{p.installmentNo})
                      </span>
                    </div>

                    <p className="text-xs text-foreground font-semibold mt-1">
                      {p.customerName} (📞 {p.customerPhone})
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDate(p.paymentDate)} • Collected by {p.collectedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-lg font-bold text-foreground">
                    +{formatCurrency(p.amount)}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={getWhatsAppShareUrl(
                        p.customerPhone,
                        `ரசீது: ${p.receiptNumber}\nவாடிக்கையாளர்: ${p.customerName}\nகடன் எண்: ${p.loanNumber}\nதொகை: ₹${p.amount}\nசெலுத்திய முறை: ${p.paymentMode}\nதேதி: ${p.paymentDate}\nநன்றி - ஸ்ரீ கிருஷ்ணா பைனான்ஸ்.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1.5 text-emerald-600 border-emerald-500/30">
                        <MessageSquare className="w-3.5 h-3.5" />
                        WhatsApp
                      </Button>
                    </a>

                    <Link href={`/${locale}/payments/${p.receiptNumber}/receipt`}>
                      <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1.5">
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
