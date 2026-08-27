"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Globe,
  MessageSquare,
  Landmark,
  LogOut,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import { LOCALE_NAMES, type Locale } from "@/lib/constants";
import { getWhatsAppShareUrl } from "@/lib/utils";

export default function CustomerProfilePage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = (params.locale as string) || "en";

  const customer = {
    name: "K. Annadurai",
    customerNumber: "CUS-0001",
    phone: "+91 98401 55678",
    altPhone: "+91 94440 12345",
    address: "Shop #45, Main Bazaar, Near Old Bus Stand, Madurai - 625001",
    idType: "Aadhaar Card",
    idNumber: "5432 9876 1234",
    lenderName: "Sri Krishna Finance & Investments",
    lenderPhone: "+91 98401 23456",
    lenderAddress: "Shop #12, Market Main Road, Madurai",
  };

  const handleLanguageChange = (newLoc: Locale) => {
    const segments = pathname.split("/");
    segments[1] = newLoc;
    router.push(segments.join("/"));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm flex items-center gap-4">
        <Avatar
          fallback="KA"
          size="xl"
          className="gradient-primary text-white font-bold text-xl"
        />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{customer.name}</h1>
            <Badge variant="success" className="text-[10px]">Verified Borrower</Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Customer ID: {customer.customerNumber}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-primary" />
            {customer.phone}
          </p>
        </div>
      </div>

      {/* Language Preference Card */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Preferred Language (மொழி / भाषा)
          </CardTitle>
          <CardDescription>
            Choose language for receipts, portal app, and WhatsApp reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {(["ta", "en", "hi"] as Locale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all ${
                  locale === loc
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-muted/30 border-border/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {LOCALE_NAMES[loc]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Borrower Information */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Personal & Residence Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
            <span className="text-muted-foreground text-[11px]">Permanent Address</span>
            <p className="font-semibold text-foreground text-sm mt-0.5">{customer.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
              <span className="text-muted-foreground text-[11px]">ID Proof</span>
              <p className="font-semibold text-foreground mt-0.5">{customer.idType}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
              <span className="text-muted-foreground text-[11px]">ID Number</span>
              <p className="font-mono font-semibold text-foreground mt-0.5">{customer.idNumber}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lender Support & Contact Card */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Headphones className="w-4 h-4 text-primary" />
            Lender Office & Payment Help
          </CardTitle>
          <CardDescription>
            Contact your lender directly for questions or balance statements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">{customer.lenderName}</p>
              <p className="text-xs text-muted-foreground">{customer.lenderAddress}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${customer.lenderPhone}`}
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full gap-2 text-xs h-10">
                <Phone className="w-4 h-4 text-primary" />
                Call Lender
              </Button>
            </a>

            <a
              href={getWhatsAppShareUrl(
                customer.lenderPhone,
                `வணக்கம் ஸ்ரீ கிருஷ்ணா பைனான்ஸ், நான் ${customer.name}. எனக்கு கடன் கணக்கு பற்றிய உதவி தேவைப்படுகிறது.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full gap-2 text-emerald-600 border-emerald-500/30 text-xs h-10">
                <MessageSquare className="w-4 h-4" />
                WhatsApp Help
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <div className="pt-2">
        <Link href={`/${locale}/customer-login`}>
          <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 gap-2">
            <LogOut className="w-4 h-4" />
            Logout from Customer Portal
          </Button>
        </Link>
      </div>
    </div>
  );
}
