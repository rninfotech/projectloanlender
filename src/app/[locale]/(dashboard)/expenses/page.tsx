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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  Calendar,
  CreditCard,
  TrendingDown,
  Building,
  Fuel,
  Users,
  CheckCircle2,
  X,
} from "lucide-react";
import { formatCurrency, formatCurrencyShort, formatDate } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

interface ExpenseItem {
  id: string;
  category: "salary" | "rent" | "travel" | "office" | "other";
  description: string;
  amount: number;
  date: string;
  paymentMode: string;
  recordedBy: string;
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    category: "salary",
    description: "Field Collection Staff Monthly Salary (Karthik Rajan)",
    amount: 18000,
    date: "2026-08-01",
    paymentMode: "Bank Transfer",
    recordedBy: "Owner",
  },
  {
    id: "exp-2",
    category: "rent",
    description: "Main Branch Office Rent for August 2026",
    amount: 8500,
    date: "2026-08-05",
    paymentMode: "UPI",
    recordedBy: "Owner",
  },
  {
    id: "exp-3",
    category: "travel",
    description: "Bike Fuel Allowance for North Ward daily collections",
    amount: 2500,
    date: "2026-08-15",
    paymentMode: "Cash",
    recordedBy: "Karthik Rajan",
  },
  {
    id: "exp-4",
    category: "office",
    description: "Receipt books printing & stationary supplies",
    amount: 1200,
    date: "2026-08-20",
    paymentMode: "Cash",
    recordedBy: "Owner",
  },
  {
    id: "exp-5",
    category: "travel",
    description: "Fuel allowance for South Town collection route",
    amount: 1500,
    date: "2026-08-25",
    paymentMode: "Cash",
    recordedBy: "Suresh Kumar",
  },
];

export default function ExpensesPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState<ExpenseItem["category"]>("travel");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newMode, setNewMode] = useState("Cash");

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "all" || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);

  const getCategoryBadge = (cat: ExpenseItem["category"]) => {
    switch (cat) {
      case "salary":
        return <Badge variant="purple" className="text-[10px]">Staff Salary</Badge>;
      case "rent":
        return <Badge variant="default" className="text-[10px]">Office Rent</Badge>;
      case "travel":
        return <Badge variant="warning" className="text-[10px]">Fuel & Travel</Badge>;
      case "office":
        return <Badge variant="secondary" className="text-[10px]">Office Supplies</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Other</Badge>;
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount) return;

    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      category: newCategory,
      description: newDesc.trim(),
      amount: parseFloat(newAmount) || 0,
      date: newDate,
      paymentMode: newMode,
      recordedBy: "Owner",
    };

    setExpenses([newItem, ...expenses]);
    setModalOpen(false);
    setNewDesc("");
    setNewAmount("");
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-primary" />
            {t("expenses.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track branch operating costs, staff salaries, travel fuel, and stationary
          </p>
        </div>

        <Button size="lg" onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("expenses.addExpense")}
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Total Monthly Expenses</p>
          <p className="text-xl sm:text-2xl font-bold text-destructive mt-1">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Salaries Paid</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {formatCurrency(expenses.filter((e) => e.category === "salary").reduce((acc, e) => acc + e.amount, 0))}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Rent & Branch</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {formatCurrency(expenses.filter((e) => e.category === "rent").reduce((acc, e) => acc + e.amount, 0))}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">Fuel & Travel</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {formatCurrency(expenses.filter((e) => e.category === "travel").reduce((acc, e) => acc + e.amount, 0))}
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search expense description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-48"
        >
          <option value="all">All Categories</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expense List Card */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold shrink-0">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">
                        {exp.description}
                      </h3>
                      {getCategoryBadge(exp.category)}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatDate(exp.date)} • Mode: <strong className="text-foreground">{exp.paymentMode}</strong> • Recorded by {exp.recordedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-base font-bold text-destructive">
                    -{formatCurrency(exp.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-border/60 flex items-center justify-between">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Record New Expense
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expCat" required>Expense Category</Label>
                <select
                  id="expCat"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expDesc" required>Description</Label>
                <Input
                  id="expDesc"
                  placeholder="e.g. Field agent petrol allowance"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expAmount" required>Amount (₹)</Label>
                  <Input
                    id="expAmount"
                    type="number"
                    placeholder="1500"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expDate" required>Date</Label>
                  <Input
                    id="expDate"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Cash", "UPI", "Bank Transfer"] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setNewMode(mode)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        newMode === mode
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/40 border-border/80 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Save Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
