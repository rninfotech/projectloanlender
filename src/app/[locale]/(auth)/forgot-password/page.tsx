"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
import { Landmark, Mail, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/reset-password`,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Password reset link sent successfully
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-muted-foreground">
              We have sent a password reset link to{" "}
              <strong className="text-foreground">{email}</strong>.
              Click the link in the email to reset your password.
            </p>
            <p className="text-xs text-muted-foreground">
              Did not receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setSuccess(false); setEmail(""); }}
            >
              Try again
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href={`/${locale}/login`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
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
        <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          Enter your email and we will send you a reset link
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg">Reset Password</CardTitle>
          <CardDescription>
            We will email you a secure link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
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

            <Button type="submit" size="lg" className="w-full" loading={loading} id="reset-btn">
              Send Reset Link
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link href={`/${locale}/login`}>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </>
  );
}