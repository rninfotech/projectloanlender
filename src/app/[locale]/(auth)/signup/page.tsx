"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Landmark, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

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
          data: { full_name: fullName, user_type: "staff" },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      // If session exists immediately (email confirm OFF), go to dashboard
      if (data?.session) {
        router.replace(`/${locale}/dashboard`);
        return;
      }

      // Otherwise show success and ask them to login
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Account Created!</h1>
          <p className="text-sm text-muted-foreground mt-1">You can now login</p>
        </div>
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">
              Your account for <strong className="text-foreground">{email}</strong> has been created.
              Go to login and enter your email and password.
            </p>
            <Link href={`/${locale}/login`}>
              <Button size="lg" className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg mb-4">
          <Landmark className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
        <p className="text-sm text-muted-foreground mt-1">Register to get started</p>
      </div>

      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Sign Up</CardTitle>
          <CardDescription>Fill in your details below</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="fullName" type="text" placeholder="Ravi Kumar" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} className="pl-10" required autoComplete="name" autoFocus />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="signup-email" type="email" placeholder="name@company.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="pl-10" required autoComplete="email" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password * (min 6 chars)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Create a password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10" required minLength={6} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="Re-enter password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10" required autoComplete="new-password" />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading} id="signup-btn">
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={`/${locale}/login`} className="text-primary font-medium hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Link href="/en/signup" className={`text-xs ${locale === "en" ? "text-primary font-semibold" : "text-muted-foreground"}`}>English</Link>
        <span className="text-muted-foreground/40">•</span>
        <Link href="/ta/signup" className={`text-xs ${locale === "ta" ? "text-primary font-semibold" : "text-muted-foreground"}`}>தமிழ்</Link>
        <span className="text-muted-foreground/40">•</span>
        <Link href="/hi/signup" className={`text-xs ${locale === "hi" ? "text-primary font-semibold" : "text-muted-foreground"}`}>हिंदी</Link>
      </div>
    </>
  );
}