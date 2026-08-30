"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HandCoins,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate } from "@/lib/utils";

export default function CustomerLoansPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const supabase = createClient();

  const [customerName, setCustomerName] = useState("Borrower");
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCustomerName(user.user_metadata?.full_name || "Borrower");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      {/* Borrower Welcome Banner */}
      <div className="p-6 rounded-3xl gradient-primary text-white shadow-xl space-y-2">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20">
          Borrower Portal
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {customerName}</h1>
        <p className="text-xs text-white/80">
          View your active loans, installment receipts, and outstanding balances.
        </p>
      </div>

      {loans.length === 0 ? (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm p-8 text-center">
          <HandCoins className="w-12 h-12 text-muted-foreground opacity-40 mx-auto mb-3" />
          <h3 className="font-bold text-base text-foreground">No active loans found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            When a loan is disbursed to your mobile number, its installment schedule will show up here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <Card key={loan.id} className="border-border/80 bg-card/80 backdrop-blur-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-sm text-foreground">{loan.loan_number}</span>
                <Badge variant="success">Active</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}