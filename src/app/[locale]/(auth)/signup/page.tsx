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
import { GoogleIcon } from "@/components/icons/google";
import {
  Landmark,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function SignupPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone ? `+91${phone}` : undefined,
            user_type: "staff",
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // Email confirmation is disabled — session is active immediately
      if (data?.session) {
        router.replace(`/${locale}/dashboard`);
        return;
      }

      // Email confirmation is enabled — show success message
      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/dashboard`,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Success state — email confirmation required
  if (success) {
    return (
      <>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check your email!</h1>
          <p className="text-sm text-muted-foreground mt-1">Almost there...</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">
              We have sent a verification link to{" "}
              <strong className="text-foreground">{email}</strong>.
              Click the link in your email to activate your account and login.
            </p>
            <p className="text-xs text-muted-foreground">
              Did not receive it? Check your spam folder or{" "}
              <button
                className="text-primary underline"
                onClick={() => { setSuccess(false); }}
              >
                try again
              </button>.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href={`/${locale}/login`}>
              <Button variant="outline">Go to Login</Button>
            </Link>
          </CardFooter>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Logo / Brand */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg mb-4">
          <Landmark className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("common.appName")}</h1>
        <p className="text-sm text-muted-foreground mt-1">Create your finance company account</p>
      </div>

      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg">{t("auth.signup")}</CardTitle>
          <CardDescription>
            Start managing your loans and collections
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Signup */}
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-3"
            onClick={handleGoogleSignup}
            loading={loading}
            id="google-signup-btn"
          >
            <GoogleIcon className="w-5 h-5" />
            {t("auth.loginWithGoogle")}
          </Button>

          <Separator>OR</Separator>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-2 items-start animate-fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" required>{t("auth.fullName")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ravi Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" required>{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-phone">{t("auth.phone")} (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  +91
                </span>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="pl-12"
                  maxLength={10}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" required>{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>{t("auth.confirmPassword")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading} id="signup-btn">
              {t("auth.signup")}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link href={`/${locale}/login`} className="text-primary font-medium hover:underline">
              {t("auth.loginHere")}
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Language Switcher */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Link href={`/en/signup`} className={`text-xs transition-colors ${locale === "en" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>English</Link>
        <span className="text-muted-foreground/40">•</span>
        <Link href={`/ta/signup`} className={`text-xs transition-colors ${locale === "ta" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>தமிழ்</Link>
        <span className="text-muted-foreground/40">•</span>
        <Link href={`/hi/signup`} className={`text-xs transition-colors ${locale === "hi" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`}>हिंदी</Link>
      </div>
    </>
  );
}