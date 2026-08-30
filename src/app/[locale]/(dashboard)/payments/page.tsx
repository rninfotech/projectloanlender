"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate, getWhatsAppShareUrl } from "@/lib/utils";
import { fetchAllLoans } from "@/lib/services/loanService";

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

export default function PaymentsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const loans = await fetchAllLoans();
        const generatedRecords: PaymentRecord[] = [];

        loans.forEach((l) => {
          if (l.totalPaid > 0) {
            generatedRecords.push({
              id: `pay-${l.id}`,
              receiptNumber: `RCP-${l.loanNumber.replace("LN-", "")}`,
              customerName: l.customerName,
              customerPhone: l.phone,
              loanNumber: l.loanNumber,
              amount: l.totalPaid,
              paymentMode: "Cash",
              paymentDate: l.disbursedDate || new Date().toISOString().split("T")[0],
              collectedBy: l.assignedStaff || "Admin",
              installmentNo: l.paidInstallments || 1,
            });
          }
        });

        setPayments(generatedRecords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-primary" />
            {t("payments.title")} (Receipts Log)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Audit trail of collections, transaction receipts, payment mode logs, and cashier records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs px-3 py-1 font-mono">
            Total Collections: {formatCurrency(totalAmount)}
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by receipt #, customer name, loan #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Receipts Table / List */}
      {loading ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading receipts log...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <CreditCard className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="font-bold text-lg text-foreground">No payments received yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            When you record daily or installment collections, official receipts will be automatically logged here.
          </p>
          <Link href={`/${locale}/collections`} className="mt-5">
            <Button size="lg" className="gap-2">
              Go to Daily Collections
            </Button>
          </Link>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
          <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-semibold text-base text-foreground">No matching receipts found</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Receipt #</th>
                  <th className="p-4">Borrower</th>
                  <th className="p-4">Loan Account</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Collected By</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-foreground">{p.receiptNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-foreground">{p.customerName}</p>
                      <p className="text-[11px] text-muted-foreground">{p.customerPhone}</p>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{p.loanNumber}</td>
                    <td className="p-4">
                      <Badge variant="outline">{p.paymentMode}</Badge>
                    </td>
                    <td className="p-4 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount)}
                    </td>
                    <td className="p-4 text-muted-foreground">{p.collectedBy}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(p.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}