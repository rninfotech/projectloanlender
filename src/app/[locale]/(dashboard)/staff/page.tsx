"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
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
  Shield,
  Plus,
} from "lucide-react";

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

export default function StaffPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Administrator";
          setStaffList([
            {
              id: user.id,
              name,
              email: user.email || "",
              phone: user.user_metadata?.phone || "N/A",
              role: "owner",
              assignedAreas: ["All Routes (Full Access)"],
              totalCollected: 0,
              activeCustomers: 0,
              status: "active",
            },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: StaffMember["role"]) => {
    switch (role) {
      case "owner":
        return <Badge variant="primary">Owner (Super Admin)</Badge>;
      case "admin":
        return <Badge variant="purple">Admin</Badge>;
      case "manager":
        return <Badge variant="info">Branch Manager</Badge>;
      case "staff":
        return <Badge variant="success">Collection Agent</Badge>;
      case "viewer":
        return <Badge variant="outline">Auditor / Viewer</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCog className="w-7 h-7 text-primary" />
            {t("staff.title")} & Team Access
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Role-based access control, collection agent territory assignments, and staff PIN credentials
          </p>
        </div>

        <Link href={`/${locale}/staff/new`}>
          <Button size="lg" className="w-full sm:w-auto gap-2">
            <UserPlus className="w-4 h-4" />
            {t("staff.addStaff")}
          </Button>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search team members by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Staff Cards Grid */}
      {loading ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading team members...</p>
        </div>
      ) : staffList.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <UserCog className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="font-bold text-lg text-foreground">No staff members found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Add team members and field agents to assign collection routes and permission levels.
          </p>
          <Link href={`/${locale}/staff/new`} className="mt-5">
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" /> Add Staff Member
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              {/* Header: Avatar, Name, Role */}
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
                    <h3 className="font-bold text-base text-foreground">{staff.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        {staff.email}
                      </span>
                      {staff.phone !== "N/A" && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          {staff.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {getRoleBadge(staff.role)}
              </div>

              {/* Territory Assignments */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs flex items-center justify-between">
                <span className="text-muted-foreground">Assigned Routes:</span>
                <span className="font-semibold text-foreground">{staff.assignedAreas.join(", ")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}