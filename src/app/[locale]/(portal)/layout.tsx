"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  HandCoins,
  Receipt,
  User,
  LogOut,
  Phone,
  Landmark,
  Globe,
} from "lucide-react";
import { LOCALE_NAMES, type Locale } from "@/lib/constants";
import { useState } from "react";

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("common");
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const pathname = usePathname();
  const router = useRouter();

  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navItems = [
    {
      label: "My Loans",
      href: `/${locale}/my-loans`,
      icon: HandCoins,
    },
    {
      label: "My Receipts",
      href: `/${locale}/my-payments`,
      icon: Receipt,
    },
    {
      label: "My Profile",
      href: `/${locale}/my-profile`,
      icon: User,
    },
  ];

  const handleLocaleChange = (newLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    setLangMenuOpen(false);
    router.push(segments.join("/"));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col antialiased">
      {/* Top Customer Header */}
      <header className="h-16 border-b border-border/80 bg-card/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary text-white flex items-center justify-center font-bold shadow-md">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-foreground block leading-tight">
              Sri Krishna Finance
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Borrower Self-Service
            </span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs gap-1"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
            >
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span className="font-bold uppercase text-[10px]">{locale}</span>
            </Button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-xl border border-border/80 bg-popover shadow-xl p-1 z-50 animate-fade-in space-y-0.5">
                {(["en", "ta", "hi"] as Locale[]).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleLocaleChange(loc)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                      locale === loc ? "bg-primary text-white font-bold" : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {LOCALE_NAMES[loc]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href={`/${locale}/customer-login`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 pb-24 animate-fade-in">
        {children}
      </main>

      {/* Customer Mobile Bottom Navigation Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/80 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                  isActive ? "text-primary scale-105" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold tracking-tight mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
