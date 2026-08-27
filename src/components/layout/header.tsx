"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LOCALE_NAMES, type Locale } from "@/lib/constants";
import {
  Bell,
  Search,
  Globe,
  LogOut,
  Building2,
  Menu,
  X,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function Header({
  onMenuToggle,
  isMobileOpen,
}: {
  onMenuToggle?: () => void;
  isMobileOpen?: boolean;
}) {
  const t = useTranslations("common");
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Switch locale
  const handleLocaleChange = (newLocale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    setLangMenuOpen(false);
    router.push(newPath);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  return (
    <header className="h-16 border-b border-border/60 bg-card/60 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger + Company Name */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        <div className="flex items-center gap-2 text-foreground font-semibold text-sm sm:text-base">
          <Building2 className="w-4 h-4 text-primary hidden sm:inline" />
          <span className="truncate max-w-[160px] sm:max-w-xs">
            Sri Krishna Finance
          </span>
        </div>
      </div>

      {/* Right: Actions (Search, Lang Switcher, Notifications, User Profile) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-2.5 sm:px-3 text-xs gap-1.5 border-border/60"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">{LOCALE_NAMES[locale as Locale]}</span>
            <span className="sm:hidden font-bold uppercase">{locale}</span>
          </Button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-xl p-1.5 z-50 animate-fade-in space-y-1">
              {(["en", "ta", "hi"] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocaleChange(loc)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    locale === loc
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {LOCALE_NAMES[loc]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <Link href={`/${locale}/dashboard`}>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 relative rounded-lg border-border/60"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
          </Button>
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-full border border-border/60 hover:border-primary transition-all focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
              SK
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-xl p-1.5 z-50 animate-fade-in space-y-1">
              <div className="px-3 py-2 border-b border-border/60 mb-1">
                <p className="text-xs font-semibold text-foreground">Admin User</p>
                <p className="text-[10px] text-muted-foreground">admin@finance.com</p>
              </div>

              <Link
                href={`/${locale}/settings/company`}
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t("profile") || "Settings"}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t("logout") || "Logout"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
