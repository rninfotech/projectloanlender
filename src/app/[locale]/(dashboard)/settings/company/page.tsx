"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Percent,
  MessageSquare,
  Globe,
  CheckCircle2,
  Save,
  MapPin,
  Smartphone,
} from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";

export default function CompanySettingsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [activeTab, setActiveTab] = useState<"profile" | "loans" | "notifications" | "areas">("profile");
  const [savedMessage, setSavedMessage] = useState(false);

  // Profile Form
  const [companyName, setCompanyName] = useState("Sri Krishna Finance");
  const [phone, setPhone] = useState("+91 98401 23456");
  const [email, setEmail] = useState("contact@skfinance.in");
  const [address, setAddress] = useState("Shop #12, Market Main Road");
  const [city, setCity] = useState("Madurai");
  const [state, setState] = useState("Tamil Nadu");
  const [licenseNo, setLicenseNo] = useState("TN/MDU/2024/FIN-8891");

  // Loan Defaults
  const [defaultInterest, setDefaultInterest] = useState("10");
  const [defaultPenalty, setDefaultPenalty] = useState("2");
  const [gracePeriod, setGracePeriod] = useState("0");

  // Notification settings
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState("1");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-primary" />
            {t("settings.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure your finance company profile, loan rules, routes, and notifications
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-success/15 text-success border border-success/30 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {t("settings.saved") || "Settings saved successfully!"}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-muted/60 rounded-2xl w-fit border border-border/60">
        {[
          { id: "profile", label: "Company Profile", icon: Building2 },
          { id: "loans", label: "Loan Defaults", icon: Percent },
          { id: "notifications", label: "SMS & WhatsApp", icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4 text-primary" />
            {tab.label}
          </button>
        ))}

        <Link
          href={`/${locale}/settings/areas`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <MapPin className="w-4 h-4 text-primary" />
          Collection Areas
        </Link>
      </div>

      <form onSubmit={handleSave}>
        {/* TAB 1: Company Profile */}
        {activeTab === "profile" && (
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Business Information</CardTitle>
              <CardDescription>
                Details printed on payment receipts and customer schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cName" required>Company Name</Label>
                  <Input
                    id="cName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cLicense">Registration / License Number</Label>
                  <Input
                    id="cLicense"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cPhone" required>Official Contact Phone</Label>
                  <Input
                    id="cPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cEmail" required>Official Email</Label>
                  <Input
                    id="cEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cCity">City</Label>
                  <Input
                    id="cCity"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cState">State</Label>
                  <select
                    id="cState"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cAddr">Full Office Address</Label>
                <Input
                  id="cAddr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-border/60 pt-4">
              <Button type="submit" size="lg" className="gap-2">
                <Save className="w-4 h-4" />
                Save Profile
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* TAB 2: Loan Defaults */}
        {activeTab === "loans" && (
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Loan Calculation Defaults</CardTitle>
              <CardDescription>
                Default values loaded automatically when creating new loans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dInt">Default Interest Rate (%)</Label>
                  <Input
                    id="dInt"
                    type="number"
                    value={defaultInterest}
                    onChange={(e) => setDefaultInterest(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dPen">Overdue Penalty Rate (%)</Label>
                  <Input
                    id="dPen"
                    type="number"
                    value={defaultPenalty}
                    onChange={(e) => setDefaultPenalty(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dGrace">Grace Period (Days)</Label>
                  <Input
                    id="dGrace"
                    type="number"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-border/60 pt-4">
              <Button type="submit" size="lg" className="gap-2">
                <Save className="w-4 h-4" />
                Save Loan Defaults
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* TAB 3: Notifications */}
        {activeTab === "notifications" && (
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">SMS & WhatsApp Notifications</CardTitle>
              <CardDescription>
                Configure automated interest reminders and payment confirmation sharing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-4">
                <Switch
                  checked={notifyWhatsapp}
                  onCheckedChange={setNotifyWhatsapp}
                  label="Enable 1-Click WhatsApp Sharing"
                  description="Staff can send pre-filled payment receipts and interest reminders via WhatsApp with 1 click (100% Free)"
                />

                <Switch
                  checked={notifySms}
                  onCheckedChange={setNotifySms}
                  label="SMS Due Reminders"
                  description="Send SMS alerts to borrowers on their installment due dates"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remDays">Send Due Reminder</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="remDays"
                    type="number"
                    className="w-24"
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(e.target.value)}
                  />
                  <span className="text-sm text-muted-foreground">day(s) before installment due date</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-border/60 pt-4">
              <Button type="submit" size="lg" className="gap-2">
                <Save className="w-4 h-4" />
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
}
