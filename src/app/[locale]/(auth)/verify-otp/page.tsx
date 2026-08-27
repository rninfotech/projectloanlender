"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Landmark, ShieldCheck } from "lucide-react";

export default function VerifyOtpPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const phone = searchParams.get("phone") || "";
  const userType = searchParams.get("type") || "staff";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits filled
    if (newOtp.every((digit) => digit !== "") && value) {
      handleVerify(newOtp.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  // Verify OTP
  const handleVerify = async (otpCode: string) => {
    setError("");
    setLoading(true);

    try {
      let verified = false;
      try {
        const { error: authError } = await supabase.auth.verifyOtp({
          phone,
          token: otpCode,
          type: "sms",
        });
        if (!authError) {
          verified = true;
        }
      } catch (err) {
        // Supabase error
      }

      // Allow test OTP code 123456 or verified Supabase auth
      if (verified || otpCode === "123456") {
        if (userType === "customer") {
          router.push(`/${locale}/my-loans`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
        return;
      }

      setError(t("auth.invalidOtp"));
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      // In demo mode, redirect straight to dashboard
      router.push(`/${locale}/dashboard`);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setError("");
    setCanResend(false);
    setCountdown(30);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({ phone });

      if (authError) {
        setError(authError.message);
        setCanResend(true);
      }
    } catch {
      setError("Failed to resend OTP.");
      setCanResend(true);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.verifyOtp")}</h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          {t("auth.enterOtp")}
        </p>
        {phone && (
          <p className="text-sm font-medium text-foreground mt-2">
            {phone}
          </p>
        )}
      </div>

      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="pt-6 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          {/* OTP Input Grid */}
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-background transition-all duration-200
                  ${digit ? "border-primary shadow-md" : "border-input"}
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-2
                `}
                id={`otp-${index}`}
                disabled={loading}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={() => handleVerify(otp.join(""))}
            loading={loading}
            disabled={otp.some((d) => !d)}
            id="verify-otp-btn"
          >
            {t("auth.verifyOtp")}
          </Button>

          {/* Resend */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm text-primary hover:underline font-medium"
              >
                {t("auth.resendOtp")}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("auth.resendIn", { seconds: countdown })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
