/**
 * Loan Lender — Application Constants
 */

export const APP_NAME = "Loan Lender";
export const APP_DESCRIPTION = "Multi-company loan & collection management system";

// Supported locales
export const LOCALES = ["en", "ta", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ta: "தமிழ்",
  hi: "हिंदी",
};

// Loan types
export const LOAN_TYPES = [
  { value: "daily", label: "Daily Collection" },
  { value: "weekly", label: "Weekly Collection" },
  { value: "monthly_emi", label: "Monthly EMI" },
  { value: "monthly_interest", label: "Monthly Interest" },
  { value: "gold", label: "Gold Loan" },
  { value: "auto", label: "Auto Finance" },
  { value: "enterprise", label: "Enterprise Loan" },
  { value: "custom", label: "Custom Frequency" },
  { value: "bullet", label: "Bullet Loan" },
] as const;

// Interest methods
export const INTEREST_METHODS = [
  { value: "flat", label: "Flat Rate" },
  { value: "reducing", label: "Reducing Balance" },
  { value: "simple", label: "Simple Interest" },
] as const;

// Payment modes
export const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
] as const;

// Loan statuses
export const LOAN_STATUSES = [
  { value: "active", label: "Active", color: "success" },
  { value: "closed", label: "Closed", color: "muted" },
  { value: "defaulted", label: "Defaulted", color: "destructive" },
  { value: "restructured", label: "Restructured", color: "warning" },
  { value: "written_off", label: "Written Off", color: "destructive" },
] as const;

// Installment statuses
export const INSTALLMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "partial", label: "Partial", color: "warning" },
  { value: "paid", label: "Paid", color: "success" },
  { value: "overdue", label: "Overdue", color: "destructive" },
  { value: "waived", label: "Waived", color: "muted" },
] as const;

// User roles
export const USER_ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "viewer", label: "Viewer" },
] as const;

// ID proof types (India)
export const ID_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "voter_id", label: "Voter ID" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "ration_card", label: "Ration Card" },
  { value: "other", label: "Other" },
] as const;

// Expense categories
export const EXPENSE_CATEGORIES = [
  { value: "salary", label: "Salary" },
  { value: "rent", label: "Rent" },
  { value: "travel", label: "Travel" },
  { value: "office", label: "Office Supplies" },
  { value: "other", label: "Other" },
] as const;

// Permissions list
export const PERMISSIONS = [
  { key: "customers.view", label: "View Customers", module: "Customers" },
  { key: "customers.create", label: "Add Customers", module: "Customers" },
  { key: "customers.edit", label: "Edit Customers", module: "Customers" },
  { key: "loans.view", label: "View Loans", module: "Loans" },
  { key: "loans.create", label: "Create Loans", module: "Loans" },
  { key: "loans.approve", label: "Approve Loans", module: "Loans" },
  { key: "payments.view", label: "View Payments", module: "Payments" },
  { key: "payments.collect", label: "Collect Payments", module: "Payments" },
  { key: "reports.view", label: "View Reports", module: "Reports" },
  { key: "expenses.view", label: "View Expenses", module: "Expenses" },
  { key: "expenses.create", label: "Add Expenses", module: "Expenses" },
  { key: "settings.edit", label: "Edit Settings", module: "Settings" },
] as const;

// Indian states (for address)
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Puducherry", "Chandigarh", "Jammu and Kashmir", "Ladakh",
] as const;
