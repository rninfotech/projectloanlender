"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  UserPlus,
  ArrowLeft,
  Phone,
  MapPin,
  FileText,
  Smartphone,
  CheckCircle2,
  Globe,
  Bell,
} from "lucide-react";
import { createCustomer } from "@/lib/services/customerService";
import { ID_TYPES, INDIAN_STATES } from "@/lib/constants";

export default function NewCustomerPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("Main Market Route");
  const [city, setCity] = useState("Madurai");
  const [state, setState] = useState("Tamil Nadu");
  const [pincode, setPincode] = useState("625001");
  const [address, setAddress] = useState("");

  // KYC
  const [idType, setIdType] = useState("aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Customer Portal & Notification Preferences
  const [enablePortal, setEnablePortal] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [preferredLang, setPreferredLang] = useState<"en" | "ta" | "hi">("ta");

  const areas = [
    "Main Market Route",
    "North Ward",
    "South Town",
    "East Bazaar",
    "Industrial Area",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createCustomer({
        fullName,
        phone,
        altPhone,
        email,
        area,
        city,
        state,
        pincode,
        address,
        idType,
        idNumber,
        notes,
        enablePortal,
        preferredLang,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/customers`);
      }, 500);
    } catch (err) {
      console.error(err);
      router.push(`/${locale}/customers`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/customers`}>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            {t("customers.addCustomer")}
          </h1>
          <p className="text-xs text-muted-foreground">
            Register a new borrower profile, assign collection area, and enable customer portal
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Borrower Contact & Personal Details
            </CardTitle>
            <CardDescription>
              Basic contact info and phone number for SMS/WhatsApp collection alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="custName" required>Borrower Full Name</Label>
              <Input
                id="custName"
                placeholder="e.g. S. Muthukumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custPhone" required>Primary Mobile Number (for WhatsApp/SMS)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    +91
                  </span>
                  <Input
                    id="custPhone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custAltPhone">Alternate Phone / Family Contact</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    +91
                  </span>
                  <Input
                    id="custAltPhone"
                    type="tel"
                    placeholder="9444123456"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-12"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custEmail">Email Address (Optional)</Label>
                <Input
                  id="custEmail"
                  type="email"
                  placeholder="borrower@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custArea" required>Collection Area / Route</Label>
                <select
                  id="custArea"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      📍 {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="custCity">City / Town</Label>
                <Input
                  id="custCity"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custState">State</Label>
                <select
                  id="custState"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custPin">Pincode</Label>
                <Input
                  id="custPin"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custAddress">Full Residence / Shop Address</Label>
              <Input
                id="custAddress"
                placeholder="Door No, Street Name, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Identification & KYC */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              KYC & Verification
            </CardTitle>
            <CardDescription>
              Identity proof details for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idType">Identity Document Type</Label>
                <select
                  id="idType"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ID_TYPES.map((idt) => (
                    <option key={idt.value} value={idt.value}>
                      {idt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNum">Document / Card Number</Label>
                <Input
                  id="idNum"
                  placeholder="e.g. 5432 9876 1234"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custNotes">Borrower Notes & Guarantee Remarks</Label>
              <Input
                id="custNotes"
                placeholder="e.g. Recommended by Ward Councillor, runs grocery store in main road"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Customer Portal & Communication Channels */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Borrower Portal & Communication Preferences
            </CardTitle>
            <CardDescription>
              Configure self-service login and automated SMS/WhatsApp alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-4">
              <Switch
                checked={enablePortal}
                onCheckedChange={setEnablePortal}
                label="Enable Customer Portal Access"
                description="Borrower can log in with their phone number or Gmail to view active loans, upcoming dues, and download receipts"
              />

              <Switch
                checked={notifyWhatsapp}
                onCheckedChange={setNotifyWhatsapp}
                label="Send WhatsApp Alerts"
                description="Send instant payment receipts and interest reminders to customer's WhatsApp"
              />

              <Switch
                checked={notifySms}
                onCheckedChange={setNotifySms}
                label="Send SMS Notifications"
                description="Send automated text message on installment due dates"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custLang">Borrower Preferred Language (for WhatsApp/SMS)</Label>
              <select
                id="custLang"
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value as any)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <Link href={`/${locale}/customers`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" size="lg" loading={loading} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Save Customer & Create Loan
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
