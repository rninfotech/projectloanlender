"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
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
  HandCoins,
  ArrowLeft,
  ArrowRight,
  User,
  Calculator,
  Calendar,
  CheckCircle2,
  Percent,
  Shield,
  FileSpreadsheet,
  Coins,
  Eye,
  Check,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { calculateLoan, type LoanType, type InterestMethod } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { fetchAllCustomers } from "@/lib/services/customerService";
import { createLoan } from "@/lib/services/loanService";

export default function NewLoanPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [borrowersLoading, setBorrowersLoading] = useState(true);
  const [borrowers, setBorrowers] = useState<{ id: string; name: string; phone: string; area: string }[]>([]);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState("");
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Step 2: Loan Financials
  const [loanType, setLoanType] = useState<LoanType>("daily");
  const [interestMethod, setInterestMethod] = useState<InterestMethod>("flat");
  const [principalAmount, setPrincipalAmount] = useState("20000");
  const [interestRate, setInterestRate] = useState("10"); // %
  const [numInstallments, setNumInstallments] = useState("100");
  const [tenureMonths, setTenureMonths] = useState("3");
  const [processingFee, setProcessingFee] = useState("200");
  const [disbursedDate, setDisbursedDate] = useState(new Date().toISOString().split("T")[0]);

  // Step 3: Collateral & Staff Assignment
  const [assignedStaff, setAssignedStaff] = useState("Admin (Self)");
  const [collateralType, setCollateralType] = useState("None");
  const [collateralDetails, setCollateralDetails] = useState("");
  const [collateralValue, setCollateralValue] = useState("");

  useEffect(() => {
    async function loadData() {
      setBorrowersLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin";
          setAssignedStaff(`${name} (Owner)`);
        }

        const list = await fetchAllCustomers();
        const mapped = list.map((c) => ({
          id: c.id,
          name: c.fullName,
          phone: c.phone,
          area: c.area,
        }));
        setBorrowers(mapped);
        if (mapped.length > 0) {
          setSelectedBorrowerId(mapped[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setBorrowersLoading(false);
      }
    }
    loadData();
  }, []);

  const calculationResult = useMemo(() => {
    try {
      const p = parseFloat(principalAmount) || 0;
      const r = parseFloat(interestRate) || 0;
      const n = parseInt(numInstallments) || 1;
      const tm = parseInt(tenureMonths) || 1;

      return calculateLoan({
        principalAmount: p,
        interestRate: r,
        loanType,
        interestMethod,
        numInstallments: n,
        tenureMonths: tm,
      });
    } catch {
      return null;
    }
  }, [principalAmount, interestRate, loanType, interestMethod, numInstallments, tenureMonths]);

  const filteredBorrowers = borrowers.filter(
    (b) =>
      b.name.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
      b.phone.includes(borrowerSearch) ||
      b.area.toLowerCase().includes(borrowerSearch.toLowerCase())
  );

  const handleProductSelect = (type: LoanType) => {
    setLoanType(type);
    if (type === "daily") {
      setNumInstallments("100");
      setInterestRate("10");
      setInterestMethod("flat");
    } else if (type === "weekly") {
      setNumInstallments("10");
      setInterestRate("10");
      setInterestMethod("flat");
    } else if (type === "monthly_emi") {
      setNumInstallments("10");
      setTenureMonths("10");
      setInterestRate("12");
      setInterestMethod("flat");
    } else if (type === "monthly_interest") {
      setNumInstallments("12");
      setTenureMonths("12");
      setInterestRate("24");
      setInterestMethod("simple");
    } else if (type === "auto") {
      setNumInstallments("12");
      setTenureMonths("12");
      setInterestRate("14");
      setInterestMethod("reducing");
    } else if (type === "gold") {
      setNumInstallments("12");
      setInterestRate("12");
      setInterestMethod("simple");
      setCollateralType("Gold Ornaments (22K)");
    }
  };

  const handleSaveLoan = async () => {
    if (!calculationResult || !selectedBorrowerId) {
      setErrorMsg("Please select a borrower first.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      await createLoan({
        customerId: selectedBorrowerId,
        loanType,
        interestMethod,
        principalAmount: parseFloat(principalAmount) || 0,
        interestRate: parseFloat(interestRate) || 0,
        totalInterest: calculationResult.totalInterest,
        totalPayable: calculationResult.totalPayable,
        installmentAmount: calculationResult.installmentAmount,
        numInstallments: parseInt(numInstallments) || 1,
        processingFee: parseFloat(processingFee) || 0,
        disbursedDate,
        assignedStaff,
        collateralType,
        collateralValue,
        collateralDetails,
      });

      router.push(`/${locale}/loans`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to create loan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/loans`}>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HandCoins className="w-6 h-6 text-primary" />
            {t("loans.createLoan")}
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure loan product, interest method, live EMI preview, and installment schedule
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3-Step Wizard Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[
          { num: 1, label: "Select Borrower", icon: User },
          { num: 2, label: "Loan & Calculation", icon: Calculator },
          { num: 3, label: "Collateral & Assign", icon: Shield },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === s.num
                  ? "bg-primary text-primary-foreground shadow-md"
                  : step > s.num
                  ? "bg-success/15 text-success border border-success/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <s.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.num}</span>
            </div>
            {idx < 2 && (
              <div
                className={`w-6 sm:w-12 h-[2px] mx-1 transition-colors ${
                  step > s.num ? "bg-success" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Select Borrower */}
      {step === 1 && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Step 1: Choose Borrower
            </CardTitle>
            <CardDescription>
              Select an existing borrower or register a new customer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search borrower by name, area, or phone..."
                value={borrowerSearch}
                onChange={(e) => setBorrowerSearch(e.target.value)}
              />
              <Link href={`/${locale}/customers/new`}>
                <Button variant="outline" className="shrink-0 gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  + Add New
                </Button>
              </Link>
            </div>

            {borrowersLoading ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                <p className="text-xs text-muted-foreground">Loading your borrowers...</p>
              </div>
            ) : borrowers.length === 0 ? (
              <div className="p-10 text-center border border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground opacity-40 mb-2" />
                <p className="font-semibold text-sm text-foreground">No customers found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  You need to create at least one customer before you can disburse a loan.
                </p>
                <Link href={`/${locale}/customers/new`} className="mt-4">
                  <Button size="sm" className="gap-1.5">
                    <UserPlus className="w-4 h-4" /> Create Customer First
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="border border-border/80 rounded-2xl divide-y divide-border/60 bg-muted/20 max-h-72 overflow-y-auto">
                {filteredBorrowers.map((borrower) => {
                  const isSelected = selectedBorrowerId === borrower.id;
                  return (
                    <div
                      key={borrower.id}
                      onClick={() => setSelectedBorrowerId(borrower.id)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{borrower.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            📞 {borrower.phone} • 📍 {borrower.area}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="text-xs">Selected</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              size="lg"
              onClick={() => setStep(2)}
              disabled={!selectedBorrowerId}
              className="gap-2"
            >
              Continue to Loan Details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Loan Product & Calculation */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Select Loan Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { type: "daily" as const, title: "Daily Collection", badge: "100-Day", desc: "Flat rate, daily EMI" },
                  { type: "weekly" as const, title: "Weekly Loan", badge: "10-Week", desc: "Market vendors & traders" },
                  { type: "monthly_emi" as const, title: "Monthly EMI", badge: "Standard", desc: "Fixed monthly installment" },
                  { type: "monthly_interest" as const, title: "Monthly Interest", badge: "Interest Only", desc: "Principal at maturity" },
                  { type: "gold" as const, title: "Gold Loan", badge: "Collateral", desc: "Jewelry / Asset backed" },
                  { type: "auto" as const, title: "Vehicle / Auto", badge: "Reducing", desc: "RC & Vehicle backed" },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleProductSelect(item.type)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      loanType === item.type
                        ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                        : "border-border/80 bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{item.title}</span>
                      <Badge variant="outline" className="text-[10px]">{item.badge}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/80 bg-card/80 backdrop-blur-sm space-y-4 p-6">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" /> Loan Amount & Parameters
              </h3>

              <div className="space-y-2">
                <Label htmlFor="pAmount" required>Principal Loan Amount (₹)</Label>
                <Input
                  id="pAmount"
                  type="number"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  placeholder="20000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="iRate" required>Interest Rate (%)</Label>
                  <Input
                    id="iRate"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nInst" required>No. of Installments</Label>
                  <Input
                    id="nInst"
                    type="number"
                    value={numInstallments}
                    onChange={(e) => setNumInstallments(e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="dDate" required>Disbursement Date</Label>
                  <Input
                    id="dDate"
                    type="date"
                    value={disbursedDate}
                    onChange={(e) => setDisbursedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pFee">Processing Fee (₹)</Label>
                  <Input
                    id="pFee"
                    type="number"
                    value={processingFee}
                    onChange={(e) => setProcessingFee(e.target.value)}
                    placeholder="200"
                  />
                </div>
              </div>
            </Card>

            {/* Live Calculation Preview */}
            <Card className="border-border/80 bg-card/80 backdrop-blur-sm p-6 space-y-4">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" /> EMI & Repayment Calculation
              </h3>

              {calculationResult ? (
                <div className="space-y-3 bg-muted/40 p-4 rounded-2xl border border-border/60 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Principal Disbursed:</span>
                    <span className="font-bold text-foreground">{formatCurrency(parseFloat(principalAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Total Interest:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(calculationResult.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Total Repayable:</span>
                    <span className="font-bold text-foreground text-sm">{formatCurrency(calculationResult.totalPayable)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground font-semibold">Installment Amount:</span>
                    <span className="font-bold text-primary text-base">
                      {formatCurrency(calculationResult.installmentAmount)} / {loanType === "daily" ? "day" : loanType === "weekly" ? "week" : "month"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Enter valid numbers to preview EMI calculation.</p>
              )}
            </Card>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button size="lg" onClick={() => setStep(3)} className="gap-2">
              Next: Collateral & Assignment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Collateral & Assignment */}
      {step === 3 && (
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Step 3: Security & Staff Assignment
            </CardTitle>
            <CardDescription>
              Assign collection officer and enter collateral records if applicable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignStaff" required>Assigned Collection Officer</Label>
              <Input
                id="assignStaff"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                placeholder="Staff name / Self"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collatType">Collateral Type</Label>
                <Input
                  id="collatType"
                  value={collateralType}
                  onChange={(e) => setCollateralType(e.target.value)}
                  placeholder="e.g. Gold 22K (12 Grams) / Vehicle RC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collatVal">Estimated Collateral Value (₹)</Label>
                <Input
                  id="collatVal"
                  type="number"
                  placeholder="e.g. 75000"
                  value={collateralValue}
                  onChange={(e) => setCollateralValue(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="collatNotes">Collateral Description & Vault Packet #</Label>
              <Input
                id="collatNotes"
                placeholder="e.g. Packet #G-881, 1 Gold Chain (22K) deposited in locker"
                value={collateralDetails}
                onChange={(e) => setCollateralDetails(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              size="lg"
              variant="success"
              onClick={handleSaveLoan}
              loading={loading}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Disburse & Activate Loan
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}