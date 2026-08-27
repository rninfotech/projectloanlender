import { redirect } from "next/navigation";

/**
 * Root locale page — redirects to login
 * When user visits /en or /ta or /hi, redirect to login
 */
export default function LocaleRootPage() {
  redirect("login");
}
