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
  Receipt,
  Search,
  Printer,
  MessageSquare,
  CheckCircle2,
  Calendar,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { formatCurrency, formatDate, getWhatsAppShareUrl } from "@/lib/utils";

export default function CustomerPaymentsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [search, setSearch] = useState("");

  const receipts = [
    {
      id: "RCP-2026-0089",
      date: "2026-08-26",
      amount: 1500,
      mode: "Cash",
      loanNumber: "LN-2026-0001",
      installmentNo: 34,
      collectedBy: "Karthik Rajan",
      remainingBalance: 14520,
    },
    {
      id: "RCP-2026-0074",
      date: "2026-08-20",
      amount: 2000,
      mode: "UPI",
      loanNumber: "LN-2026-0001",
      installmentNo: 33,
      collectedBy: "Karthik Rajan",
      remainingBalance: 16020,
    },
    {
      id: "RCP-2026-0061",
      date: "2026-08-13",
      amount: 2000,
      mode: "Cash",
      loanNumber: "LN-2026-0001",
      installmentNo: 32,
      collectedBy: "Karthik Rajan",
      remainingBalance: 18020,
    },
  ];

  const filteredReceipts = receipts.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.loanNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = receipts.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-primary" />
            My Payment Receipts
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified history of all installment collections and official receipts
          </p>
        </div>
      </div>

      {/* Summary Counter */}
      <div className="p-5 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground font-medium">Total Paid Recorded</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <Badge variant="success" className="text-xs">
          {receipts.length} Receipts Issued
        </Badge>
      </div>

      {/* Receipts List */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {filteredReceipts.map((r) => (
              <div
                key={r.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-foreground">
                        {r.id}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {r.mode}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(r.date)} • Loan: <strong>{r.loanNumber}</strong> (Inst #{r.installmentNo})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-lg font-bold text-foreground">
                    +{formatCurrency(r.amount)}
                  </span>

                  <Link href={`/${locale}/payments/${r.id}/receipt`}>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5">
                      <Printer className="w-3.5 h-3.5" />
                      View Receipt
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
