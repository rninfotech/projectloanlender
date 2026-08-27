"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
import { Separator } from "@/components/ui/separator";
import { isValidIndianMobile } from "@/lib/utils";
import { GoogleIcon } from "@/components/icons/google";
import {
  Wallet,
  Phone,
  CreditCard,
  History,
  Receipt,
} from "lucide-react";

export default function CustomerLoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phone OTP Login for Customer
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidIndianMobile(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = `+91${phone.replace(/\D/g, "").slice(-10)}`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (authError) {
        if (
          authError.message?.includes("provider") ||
          authError.message?.includes("Twilio") ||
          authError.message?.includes("Authenticate") ||
          authError.message?.includes("20003") ||
          process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")
        ) {
          router.push(`/${locale}/verify-otp?phone=${encodeURIComponent(formattedPhone)}&type=customer`);
          return;
        }
        setError(authError.message);
        return;
      }

      router.push(`/${locale}/verify-otp?phone=${encodeURIComponent(formattedPhone)}&type=customer`);
    } catch {
      const formattedPhone = `+91${phone.replace(/\D/g, "").slice(-10)}`;
      router.push(`/${locale}/verify-otp?phone=${encodeURIComponent(formattedPhone)}&type=customer`);
    } finally {
      setLoading(false);
    }
  };

  // Google Login for Customer
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/my-loans`,
        },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Logo / Brand */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.customerLogin")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("auth.customerLoginDesc")}</p>
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: CreditCard, label: t("customerPortal.myLoans") },
          { icon: History, label: t("customerPortal.myPayments") },
          { icon: Receipt, label: t("payments.receipt") },
        ].map((feature, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card/60 border border-border/50 text-center"
          >
            <feature.icon className="w-5 h-5 text-primary" />
            <span className="text-[11px] text-muted-foreground leading-tight">{feature.label}</span>
          </div>
        ))}
      </div>

      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg">{t("auth.login")}</CardTitle>
          <CardDescription>
            {t("auth.customerLoginDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Login */}
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3"
            onClick={handleGoogleLogin}
            loading={loading}
            id="customer-google-btn"
          >
            <GoogleIcon className="w-5 h-5" />
            {t("auth.loginWithGoogle")}
          </Button>

          <Separator>{t("common.or") || "OR"}</Separator>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Phone OTP Form */}
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer-phone" required>{t("auth.phone")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  +91
                </span>
                <Input
                  id="customer-phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-12"
                  required
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the mobile number registered with your finance company
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading} id="customer-phone-login-btn">
              <Phone className="w-4 h-4" />
              {t("auth.sendOtp")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            href={`/${locale}/login`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← {t("auth.staffLogin")}
          </Link>
        </CardFooter>
      </Card>

      {/* Language Switcher */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Link href={`/en/customer-login`} className={`text-xs transition-colors ${locale === "en" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>English</Link>
        <span className="text-muted-foreground/40">•</span>
        <Link href={`/ta/customer-login`} className={`text-xs transition-colors ${locale === "ta" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>தமிழ்</Link>
        <span className="text-muted-foreground/40">•</span>
        <Link href={`/hi/customer-login`} className={`text-xs transition-colors ${locale === "hi" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>हिंदी</Link>
      </div>
    </>
  );
}
