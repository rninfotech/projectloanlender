"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  HandCoins,
  ReceiptText,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  UserCog,
  Settings,
  Landmark,
  ChevronRight,
} from "lucide-react";

export function Sidebar({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const pathname = usePathname();

  const navItems = [
    {
      label: t("dashboard"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: t("customers"),
      href: `/${locale}/customers`,
      icon: Users,
    },
    {
      label: t("loans"),
      href: `/${locale}/loans`,
      icon: HandCoins,
    },
    {
      label: t("collections"),
      href: `/${locale}/collections`,
      icon: ReceiptText,
      badge: "Today",
    },
    {
      label: t("payments"),
      href: `/${locale}/payments`,
      icon: CreditCard,
    },
    {
      label: t("expenses"),
      href: `/${locale}/expenses`,
      icon: Receipt,
    },
    {
      label: t("reports"),
      href: `/${locale}/reports`,
      icon: FileSpreadsheet,
    },
    {
      label: t("staff"),
      href: `/${locale}/staff`,
      icon: UserCog,
    },
    {
      label: t("settings"),
      href: `/${locale}/settings/company`,
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 border-r border-border/60 bg-card/60 backdrop-blur-xl shrink-0 h-screen sticky top-0 transition-all duration-300 z-30",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border/60">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl gradient-primary text-white shadow-md">
          <Landmark className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-tight leading-tight text-foreground">
            Loan Lender
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            Micro-Finance Suite
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${locale}/dashboard` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && !isActive && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-4 h-4 text-primary-foreground/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Preview */}
      <div className="p-4 border-t border-border/60 bg-muted/20">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-primary/30">
            LL
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              Sri Krishna Finance
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              Owner Account
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
