"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Printer,
  ArrowLeft,
  MessageSquare,
  Landmark,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { formatCurrency, formatDate, getWhatsAppShareUrl } from "@/lib/utils";

export default function ReceiptPrintPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const receiptId = (params.id as string) || "RCP-2026-0091";

  const receipt = {
    receiptNumber: receiptId,
    date: "2026-08-27",
    time: "11:30 AM",
    companyName: "Sri Krishna Finance & Investments",
    companyPhone: "+91 98401 23456",
    companyAddress: "Shop #12, Market Main Road, Madurai - 625001",
    companyLicense: "TN/MDU/2024/FIN-8891",
    customerName: "V. Thangaraj",
    customerPhone: "+91 94441 22334",
    customerArea: "Main Market Route",
    customerNumber: "CUS-0003",
    loanNumber: "LN-2026-0003",
    loanType: "Weekly Collection",
    installmentNo: 6,
    totalInstallments: 10,
    amount: 1650,
    paymentMode: "Cash",
    collectedBy: "Karthik Rajan",
    principalPaid: 1500,
    interestPaid: 150,
    remainingBalance: 8000,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="print:hidden flex items-center justify-between gap-4">
        <Link href={`/${locale}/payments`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={getWhatsAppShareUrl(
              receipt.customerPhone,
              `*${receipt.companyName}*\n===================\n*OFFICIAL PAYMENT RECEIPT*\nReceipt No: ${receipt.receiptNumber}\nDate: ${receipt.date}\nBorrower: ${receipt.customerName}\nLoan No: ${receipt.loanNumber}\nInstallment: #${receipt.installmentNo}/${receipt.totalInstallments}\nAmount: ₹${receipt.amount} (${receipt.paymentMode})\nRemaining Balance: ₹${receipt.remainingBalance}\n===================\nThank you for prompt repayment!`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2 text-emerald-600 border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
              Share on WhatsApp
            </Button>
          </a>

          <Button size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Official Receipt Card (Print Friendly) */}
      <div className="p-8 rounded-3xl border-2 border-border/80 bg-card shadow-2xl text-foreground space-y-6 print:border-0 print:shadow-none print:p-0">
        {/* Header */}
        <div className="text-center space-y-1 pb-4 border-b border-border/80">
          <div className="w-12 h-12 rounded-2xl gradient-primary text-white flex items-center justify-center mx-auto mb-2">
            <Landmark className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {receipt.companyName}
          </h2>
          <p className="text-xs text-muted-foreground">{receipt.companyAddress}</p>
          <p className="text-xs text-muted-foreground">
            Reg. License: <strong>{receipt.companyLicense}</strong> • Ph: {receipt.companyPhone}
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              OFFICIAL PAYMENT RECEIPT
            </span>
          </div>
        </div>

        {/* Receipt Meta (Number, Date, Officer) */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Receipt Number:</span>
            <p className="font-mono font-bold text-sm text-foreground">{receipt.receiptNumber}</p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground">Date & Time:</span>
            <p className="font-semibold text-foreground">{formatDate(receipt.date)}, {receipt.time}</p>
          </div>
        </div>

        {/* Borrower Information */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Borrower Name:</span>
              <p className="font-bold text-sm text-foreground">{receipt.customerName}</p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Customer ID:</span>
              <p className="font-mono font-bold text-foreground">{receipt.customerNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
            <p>Phone: <strong className="text-foreground">{receipt.customerPhone}</strong></p>
            <p className="text-right">Area: <strong className="text-foreground">{receipt.customerArea}</strong></p>
          </div>
        </div>

        {/* Loan & Installment Breakdown */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-border/60">
            <span className="text-muted-foreground">Loan Number:</span>
            <span className="font-mono font-bold text-foreground">{receipt.loanNumber} ({receipt.loanType})</span>
          </div>

          <div className="flex justify-between py-2 border-b border-border/60">
            <span className="text-muted-foreground">Installment Cleared:</span>
            <span className="font-semibold text-foreground">#{receipt.installmentNo} of {receipt.totalInstallments}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-border/60">
            <span className="text-muted-foreground">Payment Mode:</span>
            <span className="font-semibold text-foreground">{receipt.paymentMode}</span>
          </div>

          {/* Amount Paid Highlight */}
          <div className="p-4 rounded-2xl gradient-primary text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs text-white/80 uppercase font-semibold">Total Amount Received</span>
              <p className="text-2xl font-black">{formatCurrency(receipt.amount)}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-white/90" />
          </div>

          <div className="flex justify-between py-2 border-b border-border/60 font-semibold">
            <span className="text-muted-foreground">Remaining Loan Balance:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(receipt.remainingBalance)}</span>
          </div>
        </div>

        {/* Signatures & Stamp */}
        <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div className="space-y-2">
            <div className="h-10 border-b border-border/80" />
            <p className="text-muted-foreground">Borrower Signature</p>
          </div>
          <div className="space-y-2">
            <div className="h-10 border-b border-border/80 flex items-center justify-center font-semibold text-foreground">
              {receipt.collectedBy}
            </div>
            <p className="text-muted-foreground">Authorized Collection Agent</p>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="text-center text-[10px] text-muted-foreground border-t border-border/60 pt-4">
          <p>This is a computer generated receipt. For queries, contact {receipt.companyPhone}</p>
        </div>
      </div>
    </div>
  );
}
