"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Shield,
  MapPin,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  UserCog,
} from "lucide-react";
import { PERMISSIONS } from "@/lib/constants";
import { formatCurrencyShort } from "@/lib/utils";

export default function StaffDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const staffId = params.id as string;

  const [fullName, setFullName] = useState("Karthik Rajan");
  const [email, setEmail] = useState("karthik@finance.com");
  const [phone, setPhone] = useState("+91 97102 34567");
  const [role, setRole] = useState<"admin" | "manager" | "staff" | "viewer">("manager");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    "Main Market Route",
    "North Ward",
  ]);
  const [saved, setSaved] = useState(false);

  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    "customers.view": true,
    "customers.create": true,
    "customers.edit": true,
    "loans.view": true,
    "loans.create": true,
    "loans.approve": true,
    "payments.view": true,
    "payments.collect": true,
    "reports.view": true,
    "expenses.view": true,
    "expenses.create": true,
    "settings.edit": false,
  });

  const availableAreas = [
    "Main Market Route",
    "North Ward",
    "South Town",
    "East Bazaar",
  ];

  const handleTogglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/staff`}>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Staff Profile & Permissions
            </h1>
            <p className="text-xs text-muted-foreground">
              ID: {staffId} • Manage operational rights and collection routes
            </p>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/15 text-success border border-success/30 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Updated!
          </div>
        )}
      </div>

      {/* Staff Overview Banner */}
      <div className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            fallback="KR"
            size="xl"
            className="gradient-primary text-white font-bold text-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
              <Badge variant="success">Manager</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{phone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{email}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-6 text-xs">
          <div>
            <p className="text-muted-foreground">Total Collected</p>
            <p className="text-base font-bold text-foreground mt-0.5">{formatCurrencyShort(210000)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Borrowers</p>
            <p className="text-base font-bold text-foreground mt-0.5">28</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card: Permissions */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Module Permissions
            </CardTitle>
            <CardDescription>
              Toggle specific access switches for this team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {PERMISSIONS.map((perm) => (
                <div
                  key={perm.key}
                  className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">{perm.label}</p>
                    <p className="text-[10px] text-muted-foreground">{perm.module}</p>
                  </div>
                  <Switch
                    checked={permissions[perm.key] || false}
                    onCheckedChange={() => handleTogglePermission(perm.key)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-border/60 pt-4">
            <Button type="submit" size="lg" className="gap-2">
              <Save className="w-4 h-4" />
              Save Permission Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
