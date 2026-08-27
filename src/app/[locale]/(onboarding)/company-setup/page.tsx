"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Percent,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";

export default function CompanySetupPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Tamil Nadu");
  const [address, setAddress] = useState("");

  // Areas
  const [areas, setAreas] = useState<string[]>([
    "Main Market Route",
    "North Ward",
    "South Town",
  ]);
  const [newArea, setNewArea] = useState("");

  // Default Loan Settings
  const [defaultInterestRate, setDefaultInterestRate] = useState("10");
  const [defaultPenaltyRate, setDefaultPenaltyRate] = useState("2");
  const [gracePeriodDays, setGracePeriodDays] = useState("0");

  const handleAddArea = () => {
    if (newArea.trim() && !areas.includes(newArea.trim())) {
      setAreas([...areas, newArea.trim()]);
      setNewArea("");
    }
  };

  const handleRemoveArea = (index: number) => {
    setAreas(areas.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    setLoading(true);
    // Simulate / save setup and redirect to dashboard
    setTimeout(() => {
      setLoading(false);
      router.push(`/${locale}/dashboard`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { num: 1, label: "Company Info", icon: Building2 },
            { num: 2, label: "Collection Areas", icon: MapPin },
            { num: 3, label: "Loan Defaults", icon: Percent },
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
                  className={`w-6 sm:w-10 h-[2px] mx-1 transition-colors ${
                    step > s.num ? "bg-success" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-2xl border-border/80 bg-card/80 backdrop-blur-xl">
          {/* STEP 1: Company Info */}
          {step === 1 && (
            <>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-2xl gradient-primary text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Setup Your Finance Company</CardTitle>
                <CardDescription>
                  Enter the registered name and branch contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" required>
                    Finance Company Name
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="e.g. Sri Krishna Finance & Investments"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" required>
                      Contact Phone
                    </Label>
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" required>
                      City / Town
                    </Label>
                    <Input
                      id="city"
                      placeholder="e.g. Madurai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Office Address</Label>
                  <Input
                    id="address"
                    placeholder="Shop #12, Market Road, Near Bus Stand"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!companyName.trim()}
                  className="gap-2"
                >
                  Continue to Collection Areas
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 2: Collection Areas */}
          {step === 2 && (
            <>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-primary flex items-center justify-center mx-auto mb-2 border border-primary/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Setup Collection Areas</CardTitle>
                <CardDescription>
                  Create route areas for staff daily collections (like in Vasool Drive)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add area (e.g. South Bazaar, Gandhinagar)"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddArea();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddArea} className="shrink-0 gap-1.5">
                    <Plus className="w-4 h-4" />
                    Add Area
                  </Button>
                </div>

                <div className="border border-border/80 rounded-xl divide-y divide-border/60 bg-muted/20">
                  {areas.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No areas added yet. Type an area name above to add.
                    </div>
                  ) : (
                    areas.map((area, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 text-sm font-medium"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{area}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveArea(idx)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep(3)} className="gap-2">
                  Continue to Loan Defaults
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 3: Loan Defaults */}
          {step === 3 && (
            <>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                  <Percent className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">Default Loan Rules</CardTitle>
                <CardDescription>
                  Configure your standard interest rates and overdue penalty rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interestRate">Default Interest Rate (%)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      placeholder="10"
                      value={defaultInterestRate}
                      onChange={(e) => setDefaultInterestRate(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Applied automatically when creating new loans
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="penaltyRate">Late Payment Penalty (%)</Label>
                    <Input
                      id="penaltyRate"
                      type="number"
                      placeholder="2"
                      value={defaultPenaltyRate}
                      onChange={(e) => setDefaultPenaltyRate(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Calculated on overdue installment amount
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
                  <Input
                    id="gracePeriod"
                    type="number"
                    placeholder="0"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Days before penalty is charged after due date
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  size="lg"
                  variant="success"
                  onClick={handleFinish}
                  loading={loading}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Setup & Open Dashboard
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
