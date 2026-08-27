import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Supported locales
  locales: ["en", "ta", "hi"],

  // Default locale
  defaultLocale: "en",

  // Use path prefix for locale (e.g., /en/dashboard, /ta/dashboard)
  localePrefix: "always",
});
