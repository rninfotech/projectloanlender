"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  UserCog,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Shield,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { formatCurrencyShort } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "owner" | "admin" | "manager" | "staff" | "viewer";
  assignedAreas: string[];
  totalCollected: number;
  activeCustomers: number;
  status: "active" | "inactive";
}

const SAMPLE_STAFF: StaffMember[] = [
  {
    id: "st-1",
    name: "Murugan Selvam",
    email: "murugan@finance.com",
    phone: "+91 98401 23456",
    role: "owner",
    assignedAreas: ["All Areas"],
    totalCollected: 450000,
    activeCustomers: 45,
    status: "active",
  },
  {
    id: "st-2",
    name: "Karthik Rajan",
    email: "karthik@finance.com",
    phone: "+91 97102 34567",
    role: "manager",
    assignedAreas: ["Main Market Route", "North Ward"],
    totalCollected: 210000,
    activeCustomers: 28,
    status: "active",
  },
  {
    id: "st-3",
    name: "Suresh Kumar",
    email: "suresh@finance.com",
    phone: "+91 94440 98765",
    role: "staff",
    assignedAreas: ["South Town"],
    totalCollected: 145000,
    activeCustomers: 19,
    status: "active",
  },
  {
    id: "st-4",
    name: "Priya Sundaram",
    email: "priya@finance.com",
    phone: "+91 98845 11223",
    role: "viewer",
    assignedAreas: ["Auditing"],
    totalCollected: 0,
    activeCustomers: 0,
    status: "active",
  },
];

export default function StaffPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>(SAMPLE_STAFF);

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: StaffMember["role"]) => {
    switch (role) {
      case "owner":
        return <Badge variant="purple">Owner</Badge>;
      case "admin":
        return <Badge variant="default">Admin</Badge>;
      case "manager":
        return <Badge variant="success">Manager</Badge>;
      case "staff":
        return <Badge variant="secondary">Collection Staff</Badge>;
      case "viewer":
        return <Badge variant="outline">Auditor / Viewer</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-primary" />
            {t("staff.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage agents, collection routes, roles, and granular module permissions
          </p>
        </div>

        <Link href={`/${locale}/staff/new`}>
          <Button size="lg" className="w-full sm:w-auto gap-2">
            <UserPlus className="w-4 h-4" />
            {t("staff.addStaff")}
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Staff Grid Cards (Mobile & Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <Avatar
                  fallback={staff.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                  size="lg"
                  className="gradient-primary text-white font-bold"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-foreground">
                      {staff.name}
                    </h3>
                    {getRoleBadge(staff.role)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {staff.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {staff.email}
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/${locale}/staff/${staff.id}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Assigned Areas */}
            <div className="bg-muted/40 rounded-xl p-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Routes:
              </span>
              {staff.assignedAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-background border border-border/60 text-[11px] font-medium text-foreground"
                >
                  {area}
                </span>
              ))}
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
              <div>
                <p className="text-muted-foreground">Total Collections</p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {formatCurrencyShort(staff.totalCollected)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned Customers</p>
                <p className="font-bold text-foreground text-sm mt-0.5">
                  {staff.activeCustomers} borrowers
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
