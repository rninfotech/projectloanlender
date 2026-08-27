import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Loan Lender — Loan & Collection Management",
  description:
    "Multi-company, multilingual loan and collection management system. Manage customers, loans, payments, staff, and reports for your finance business.",
  keywords: [
    "loan management",
    "collection management",
    "finance",
    "micro finance",
    "Tamil Nadu",
    "India",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
