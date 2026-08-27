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
} from "lucide-react";

export function MobileNav() {
  const t = useTranslations("nav");
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const pathname = usePathname();

  const items = [
    {
      label: t("dashboard"),
      href: `/${locale}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: t("collections"),
      href: `/${locale}/collections`,
      icon: ReceiptText,
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
      label: t("payments"),
      href: `/${locale}/payments`,
      icon: CreditCard,
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border/80 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${locale}/dashboard` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200",
                isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
