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
  Shield,
  MapPin,
  Check,
  CheckCircle2,
} from "lucide-react";
import { PERMISSIONS } from "@/lib/constants";

export default function NewStaffPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"admin" | "manager" | "staff" | "viewer">("staff");
  const [selectedAreas, setSelectedAreas] = useState<string[]>(["Main Market Route"]);
  const [loading, setLoading] = useState(false);

  // Granular Permissions State
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    "customers.view": true,
    "customers.create": true,
    "customers.edit": true,
    "loans.view": true,
    "loans.create": true,
    "loans.approve": false,
    "payments.view": true,
    "payments.collect": true,
    "reports.view": false,
    "expenses.view": false,
    "expenses.create": false,
    "settings.edit": false,
  });

  const availableAreas = [
    "Main Market Route",
    "North Ward",
    "South Town",
    "East Bazaar",
    "Industrial Area",
  ];

  const handleToggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter((a) => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const handleTogglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleRoleChange = (newRole: "admin" | "manager" | "staff" | "viewer") => {
    setRole(newRole);

    // Apply role-based default presets
    if (newRole === "admin") {
      const allTrue = Object.keys(permissions).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {}
      );
      setPermissions(allTrue);
    } else if (newRole === "manager") {
      setPermissions({
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
    } else if (newRole === "staff") {
      setPermissions({
        "customers.view": true,
        "customers.create": true,
        "customers.edit": false,
        "loans.view": true,
        "loans.create": true,
        "loans.approve": false,
        "payments.view": true,
        "payments.collect": true,
        "reports.view": false,
        "expenses.view": false,
        "expenses.create": false,
        "settings.edit": false,
      });
    } else if (newRole === "viewer") {
      const viewOnly = Object.keys(permissions).reduce(
        (acc, k) => ({ ...acc, [k]: k.endsWith(".view") }),
        {}
      );
      setPermissions(viewOnly);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push(`/${locale}/staff`);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/staff`}>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Invite Staff Member
          </h1>
          <p className="text-xs text-muted-foreground">
            Add a collection agent, branch manager, or administrative user
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Staff Information
            </CardTitle>
            <CardDescription>
              Login credentials and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffName" required>Full Name</Label>
              <Input
                id="staffName"
                placeholder="e.g. Ramesh Chandran"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffPhone" required>Mobile Number</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                    +91
                  </span>
                  <Input
                    id="staffPhone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staffEmail" required>Email Address</Label>
                <Input
                  id="staffEmail"
                  type="email"
                  placeholder="ramesh@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Role Selection */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Role & Access Level
            </CardTitle>
            <CardDescription>
              Select default role preset or customize granular toggles below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { id: "staff", title: "Field Staff", desc: "Collect payments & view assigned loans" },
                { id: "manager", title: "Manager", desc: "Create loans, approve & view reports" },
                { id: "admin", title: "Admin", desc: "Full operational access & staff settings" },
                { id: "viewer", title: "Viewer", desc: "Read-only auditor access" },
              ].map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleRoleChange(r.id as any)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    role === r.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/80 hover:border-border"
                  }`}
                >
                  <p className="font-semibold text-sm text-foreground">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Assigned Areas / Routes */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Assigned Collection Routes
            </CardTitle>
            <CardDescription>
              Staff can only view and collect payments from borrowers in these areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableAreas.map((area) => {
                const isSelected = selectedAreas.includes(area);
                return (
                  <button
                    type="button"
                    key={area}
                    onClick={() => handleToggleArea(area)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background border-border/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {area}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Granular Permissions Matrix */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Granular Permission Overrides</CardTitle>
            <CardDescription>
              Fine-tune exact permissions for this staff member
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
          <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <Link href={`/${locale}/staff`}>
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" size="lg" loading={loading} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Save & Send Invitation
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
