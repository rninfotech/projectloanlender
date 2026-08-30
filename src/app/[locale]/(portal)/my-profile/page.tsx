"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Phone,
  LogOut,
} from "lucide-react";

export default function CustomerProfilePage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const supabase = createClient();

  const [userProfile, setUserProfile] = useState<{ name: string; phone: string; email: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile({
          name: user.user_metadata?.full_name || "Borrower",
          phone: user.user_metadata?.phone || user.phone || "N/A",
          email: user.email || "N/A",
        });
      }
    }
    load();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace(`/${locale}/login`);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Profile</h1>
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5 text-xs text-destructive">
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </Button>
      </div>

      <Card className="border-border/80 bg-card/80 backdrop-blur-sm p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar
            fallback={userProfile?.name?.slice(0, 2) || "U"}
            size="lg"
            className="gradient-primary text-white font-bold"
          />
          <div>
            <h2 className="font-bold text-lg text-foreground">{userProfile?.name || "Borrower Profile"}</h2>
            <p className="text-xs text-muted-foreground">{userProfile?.phone || "Loading..."}</p>
          </div>
        </div>

        <div className="divide-y divide-border/60 pt-2 text-xs">
          <div className="py-2.5 flex justify-between">
            <span className="text-muted-foreground">Registered Phone</span>
            <span className="font-semibold text-foreground">{userProfile?.phone || "N/A"}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-semibold text-foreground">{userProfile?.email || "N/A"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}