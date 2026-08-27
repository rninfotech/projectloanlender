"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
} from "lucide-react";
import { calculateLoan, type LoanType, type InterestMethod } from "@/lib/calculations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { fetchAllCustomers, CustomerData } from "@/lib/services/customerService";
import { createLoan } from "@/lib/services/loanService";

export default function NewLoanPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [borrowers, setBorrowers] = useState<{ id: string; name: string; phone: string; area: string }[]>([]);

  useEffect(() => {
    async function loadBorrowers() {
      try {
        const list = await fetchAllCustomers();
        setBorrowers(list.map((c) => ({
          id: c.id,
          name: c.fullName,
          phone: c.phone,
          area: c.area,
        })));
        if (list.length > 0) {
          setSelectedBorrowerId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadBorrowers();
  }, []);

  // Step 1: Borrower Selection
  const [selectedBorrowerId, setSelectedBorrowerId] = useState("cus-1");
  const [borrowerSearch, setBorrowerSearch] = useState("");

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
  const [assignedStaff, setAssignedStaff] = useState("Karthik Rajan");
  const [collateralType, setCollateralType] = useState("None");
  const [collateralDetails, setCollateralDetails] = useState("");
  const [collateralValue, setCollateralValue] = useState("");

  // Live Calculator Result using our math engine
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
  }, [principalAmount, interestRate, numInstallments, tenureMonths, loanType, interestMethod]);

  const filteredBorrowers = borrowers.filter(
    (b) =>
      b.name.toLowerCase().includes(borrowerSearch.toLowerCase()) ||
      b.phone.includes(borrowerSearch)
  );

  const selectedBorrower = borrowers.find((b) => b.id === selectedBorrowerId);

  const handleLoanTypeSelect = (type: LoanType) => {
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
    if (!calculationResult) return;
    setLoading(true);

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
    } catch (err) {
      console.error(err);
      router.push(`/${locale}/loans`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                placeholder="Search borrower by name or phone..."
                value={borrowerSearch}
                onChange={(e) => setBorrowerSearch(e.target.value)}
              />
              <Link href={`/${locale}/customers/new`}>
                <Button variant="outline" className="shrink-0">
                  + Add New
                </Button>
              </Link>
            </div>

            <div className="border border-border/80 rounded-2xl divide-y divide-border/60 bg-muted/20">
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
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="lg" onClick={() => setStep(2)} className="gap-2">
              Continue to Loan Details
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Loan Product & Calculation */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          {/* Pick Product Cards */}
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                Select Loan Product
              </CardTitle>
              <CardDescription>
                Choose lending model (Vasool Drive collection style)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "daily", name: "Daily Collection", desc: "e.g. ₹100/day for 100 days" },
                  { id: "weekly", name: "Weekly Collection", desc: "Weekly fixed installments" },
                  { id: "monthly_emi", name: "Monthly EMI", desc: "Standard reducing balance EMI" },
                  { id: "gold", name: "Gold Loan", desc: "Collateralized interest loan" },
                ].map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleLoanTypeSelect(prod.id as LoanType)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      loanType === prod.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/80 hover:border-border"
                    }`}
                  >
                    <p className="font-bold text-xs sm:text-sm text-foreground">{prod.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{prod.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Inputs & Live Calculation Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 2 Cols: Form Inputs */}
            <Card className="lg:col-span-2 border-border/80 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Loan Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="princAmt" required>Principal Amount (₹)</Label>
                    <Input
                      id="princAmt"
                      type="number"
                      placeholder="20000"
                      value={principalAmount}
                      onChange={(e) => setPrincipalAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intRate" required>Interest Rate (%)</Label>
                    <Input
                      id="intRate"
                      type="number"
                      placeholder="10"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numInst" required>Number of Installments</Label>
                    <Input
                      id="numInst"
                      type="number"
                      placeholder="100"
                      value={numInstallments}
                      onChange={(e) => setNumInstallments(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="intMeth">Interest Method</Label>
                    <select
                      id="intMeth"
                      value={interestMethod}
                      onChange={(e) => setInterestMethod(e.target.value as any)}
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="flat">Flat Rate (Standard)</option>
                      <option value="reducing">Reducing Balance EMI</option>
                      <option value="simple">Simple Interest</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="procFee">Processing Fee (₹)</Label>
                    <Input
                      id="procFee"
                      type="number"
                      placeholder="200"
                      value={processingFee}
                      onChange={(e) => setProcessingFee(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="disbDate" required>Disbursement Date</Label>
                    <Input
                      id="disbDate"
                      type="date"
                      value={disbursedDate}
                      onChange={(e) => setDisbursedDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1 Col: Real-Time Calculation Card */}
            <div className="space-y-4">
              <div className="p-5 rounded-3xl gradient-primary text-white shadow-xl space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  Live Loan Summary
                </span>

                <div className="space-y-1">
                  <span className="text-xs text-white/70">Installment Amount:</span>
                  <h3 className="text-3xl font-black text-white">
                    {calculationResult ? formatCurrency(calculationResult.installmentAmount) : "₹0"}
                    <span className="text-xs font-normal text-white/80 ml-1">
                      /{loanType === "daily" ? "day" : loanType === "weekly" ? "week" : "month"}
                    </span>
                  </h3>
                </div>

                <div className="divide-y divide-white/20 pt-2 text-xs space-y-2">
                  <div className="flex justify-between pt-2">
                    <span className="text-white/70">Principal:</span>
                    <span className="font-bold">{formatCurrency(parseFloat(principalAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-white/70">Total Interest:</span>
                    <span className="font-bold">{calculationResult ? formatCurrency(calculationResult.totalInterest) : "₹0"}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-white/70">Total Payable:</span>
                    <span className="font-black text-sm">{calculationResult ? formatCurrency(calculationResult.totalPayable) : "₹0"}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-white/70">Maturity Date:</span>
                    <span className="font-semibold">{calculationResult ? formatDate(calculationResult.maturityDate) : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Preview Section */}
          {calculationResult && calculationResult.installments.length > 0 && (
            <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary" />
                  Installment Schedule Preview ({calculationResult.installments.length} Installments)
                </CardTitle>
                <CardDescription>
                  Preview of generated payment calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto border border-border/80 rounded-xl divide-y divide-border/60">
                  {calculationResult.installments.slice(0, 10).map((inst) => (
                    <div
                      key={inst.installmentNo}
                      className="p-3 flex items-center justify-between text-xs hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                          {inst.installmentNo}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">
                            Due: {formatDate(inst.dueDate)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Principal: ₹{inst.principalDue} • Interest: ₹{inst.interestDue}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatCurrency(inst.totalDue)}
                      </span>
                    </div>
                  ))}
                  {calculationResult.installments.length > 10 && (
                    <div className="p-3 text-center text-xs text-muted-foreground bg-muted/20">
                      + {calculationResult.installments.length - 10} more installments will be auto-generated
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep(3)} className="gap-2">
                  Continue to Collateral & Assignment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
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
              <select
                id="assignStaff"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Karthik Rajan">Karthik Rajan (Manager)</option>
                <option value="Suresh Kumar">Suresh Kumar (Field Agent)</option>
                <option value="Murugan Selvam">Murugan Selvam (Owner)</option>
              </select>
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
