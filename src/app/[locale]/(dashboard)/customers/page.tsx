"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  MessageSquare,
  Filter,
  Eye,
  Smartphone,
  Plus,
} from "lucide-react";
import { formatCurrencyShort, getWhatsAppShareUrl } from "@/lib/utils";
import { fetchAllCustomers, CustomerData } from "@/lib/services/customerService";

export default function CustomersPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("all");
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await fetchAllCustomers();
        setCustomers(list);
      } catch (err) {
        console.error("Error loading customers:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const uniqueAreas = Array.from(
    new Set(customers.map((c) => c.area).filter(Boolean))
  );
  const areas = ["all", ...uniqueAreas];

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.customerNumber.toLowerCase().includes(search.toLowerCase());
    const matchesArea = selectedArea === "all" || c.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const totalOutstandingSum = customers.reduce(
    (acc, c) => acc + (c.totalOutstanding || 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="w-7 h-7 text-primary" />
            {t("customers.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage borrowers, area assignments, credit history, and borrower portal access
          </p>
        </div>

        <Link href={`/${locale}/customers/new`}>
          <Button size="lg" className="w-full sm:w-auto gap-2">
            <UserPlus className="w-4 h-4" />
            {t("customers.addCustomer")}
          </Button>
        </Link>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">
            {t("dashboard.totalCustomers")}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
            {customers.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">
            {t("dashboard.activeLoans")}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
            {customers.reduce((acc, c) => acc + (c.activeLoansCount || 0), 0)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">
            {t("dashboard.outstandingAmount")}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrencyShort(totalOutstandingSum)}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm">
          <p className="text-xs text-muted-foreground font-medium">
            {t("customers.portalEnabled")}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {customers.filter((c) => c.portalEnabled).length}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("customers.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Area Route Filter Dropdown */}
        {areas.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:inline" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="h-11 rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-56"
            >
              <option value="all">📍 {t("collections.allAreas")}</option>
              {areas
                .filter((a) => a !== "all")
                .map((area) => (
                  <option key={area} value={area}>
                    📍 {area}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Customer List Cards */}
      {loading ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading your customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
            <Users className="w-8 h-8 opacity-80" />
          </div>
          <h3 className="font-bold text-lg text-foreground">No customers yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Create your first customer to start disbursing loans and tracking daily/weekly collections.
          </p>
          <Link href={`/${locale}/customers/new`} className="mt-5">
            <Button size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Customer
            </Button>
          </Link>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-semibold text-base text-foreground">No matching customers</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search query or area filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
            >
              {/* Top Row: Avatar, Name, Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <Avatar
                    fallback={customer.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                    size="lg"
                    className="gradient-primary text-white font-bold"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">
                        {customer.fullName}
                      </h3>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                        {customer.customerNumber}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        {customer.phone}
                      </span>
                      {customer.area && customer.area !== "N/A" && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          {customer.area}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {customer.portalEnabled ? (
                  <Badge variant="success" className="gap-1 text-[10px]">
                    <Smartphone className="w-3 h-3" />
                    Portal App
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Offline
                  </Badge>
                )}
              </div>

              {/* Middle Row: Financial Metrics */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground">Active Loans:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {customer.activeLoansCount > 0 ? (
                      <span className="text-primary font-semibold">
                        {customer.activeLoansCount} Active
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No active loan</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Outstanding Balance:</span>
                  <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {formatCurrencyShort(customer.totalOutstanding || 0)}
                  </p>
                </div>
              </div>

              {/* Bottom Row: Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <a
                  href={getWhatsAppShareUrl(
                    customer.phone,
                    `Hello ${customer.fullName}, this is a payment update from our finance office. Your current outstanding balance is ₹${customer.totalOutstanding || 0}. Thank you.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp Alert
                </a>

                <div className="flex items-center gap-2">
                  <Link href={`/${locale}/customers/${customer.id}`}>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}