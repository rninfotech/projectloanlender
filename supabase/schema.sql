-- ==============================================================================
-- LOAN LENDER — DATABASE SCHEMA (PostgreSQL + Supabase RLS)
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'Tamil Nadu',
  pincode TEXT,
  logo_url TEXT,
  license_number TEXT,
  settings JSONB DEFAULT '{}',
  sms_provider TEXT DEFAULT 'msg91',
  sms_api_key TEXT,
  whatsapp_enabled BOOLEAN DEFAULT false,
  whatsapp_phone_id TEXT,
  whatsapp_token TEXT,
  notification_prefs JSONB DEFAULT '{
    "due_reminder_days_before": 1,
    "overdue_reminder_days": [1, 3, 7],
    "send_payment_confirmation": true,
    "send_loan_disbursement": true,
    "default_channel": "whatsapp"
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USER PROFILES (links to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  preferred_lang TEXT DEFAULT 'en' CHECK (preferred_lang IN ('en', 'ta', 'hi')),
  user_type TEXT DEFAULT 'staff' CHECK (user_type IN ('staff', 'customer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. COMPANY MEMBERS
CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
  permissions JSONB DEFAULT '{}'::jsonb,
  assigned_areas TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- 4. AREAS (Collection Routes)
CREATE TABLE IF NOT EXISTS public.areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, name)
);

-- 5. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_number TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  alt_phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  area TEXT,
  pincode TEXT,
  id_type TEXT,
  id_number TEXT,
  photo_url TEXT,
  id_proof_url TEXT,
  notify_sms BOOLEAN DEFAULT true,
  notify_whatsapp BOOLEAN DEFAULT true,
  preferred_lang TEXT DEFAULT 'en' CHECK (preferred_lang IN ('en', 'ta', 'hi')),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. LOANS
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  loan_number TEXT,
  loan_type TEXT NOT NULL CHECK (loan_type IN (
    'daily', 'weekly', 'monthly_emi', 'monthly_interest',
    'gold', 'auto', 'enterprise', 'custom', 'bullet'
  )),
  interest_method TEXT NOT NULL DEFAULT 'flat' CHECK (interest_method IN ('flat', 'reducing', 'simple')),
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  total_interest DECIMAL(12,2) NOT NULL,
  total_payable DECIMAL(12,2) NOT NULL,
  processing_fee DECIMAL(10,2) DEFAULT 0,
  tenure_months INTEGER,
  num_installments INTEGER NOT NULL,
  installment_amount DECIMAL(10,2) NOT NULL,
  custom_frequency_days INTEGER,
  disbursed_date DATE NOT NULL,
  first_due_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  collateral_type TEXT,
  collateral_details TEXT,
  collateral_value DECIMAL(12,2),
  outstanding_principal DECIMAL(12,2) NOT NULL,
  outstanding_interest DECIMAL(12,2) DEFAULT 0,
  total_paid DECIMAL(12,2) DEFAULT 0,
  total_penalty DECIMAL(10,2) DEFAULT 0,
  penalty_rate DECIMAL(5,2) DEFAULT 0,
  grace_period_days INTEGER DEFAULT 0,
  penalty_cap DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'defaulted', 'restructured', 'written_off')),
  closed_date DATE,
  close_reason TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INSTALLMENTS
CREATE TABLE IF NOT EXISTS public.installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  installment_no INTEGER NOT NULL,
  due_date DATE NOT NULL,
  principal_due DECIMAL(10,2) NOT NULL,
  interest_due DECIMAL(10,2) NOT NULL,
  total_due DECIMAL(10,2) NOT NULL,
  principal_paid DECIMAL(10,2) DEFAULT 0,
  interest_paid DECIMAL(10,2) DEFAULT 0,
  total_paid DECIMAL(10,2) DEFAULT 0,
  penalty_amount DECIMAL(10,2) DEFAULT 0,
  penalty_paid DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'waived')),
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(loan_id, installment_no)
);

-- 8. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  installment_id UUID REFERENCES public.installments(id),
  receipt_number TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer', 'cheque', 'other')),
  payment_ref TEXT,
  principal_component DECIMAL(10,2) DEFAULT 0,
  interest_component DECIMAL(10,2) DEFAULT 0,
  penalty_component DECIMAL(10,2) DEFAULT 0,
  advance_component DECIMAL(10,2) DEFAULT 0,
  payment_date DATE NOT NULL,
  notes TEXT,
  collected_by UUID REFERENCES public.profiles(id),
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_mode TEXT DEFAULT 'cash',
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES public.loans(id),
  installment_id UUID REFERENCES public.installments(id),
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'both')),
  type TEXT NOT NULL CHECK (type IN (
    'due_reminder', 'interest_reminder', 'payment_confirmation',
    'overdue_warning', 'loan_disbursement', 'loan_closure'
  )),
  message TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  provider_ref TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM SPEED
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_company ON public.customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(company_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_area ON public.customers(company_id, area);
CREATE INDEX IF NOT EXISTS idx_loans_company ON public.loans(company_id);
CREATE INDEX IF NOT EXISTS idx_loans_customer ON public.loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(company_id, status);
CREATE INDEX IF NOT EXISTS idx_installments_loan ON public.installments(loan_id);
CREATE INDEX IF NOT EXISTS idx_installments_due ON public.installments(company_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_payments_company ON public.payments(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_loan ON public.payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(company_id, payment_date);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's active company IDs
CREATE OR REPLACE FUNCTION public.get_user_company_ids()
RETURNS SETOF UUID AS $$
  SELECT company_id FROM public.company_members
  WHERE user_id = auth.uid() AND is_active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can read/update own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies: members can view their own companies
DROP POLICY IF EXISTS "Company members can view company" ON public.companies;
CREATE POLICY "Company members can view company" ON public.companies
  FOR SELECT USING (id IN (SELECT public.get_user_company_ids()));

-- Customers RLS: Staff can access their company's customers
DROP POLICY IF EXISTS "Staff access company customers" ON public.customers;
CREATE POLICY "Staff access company customers" ON public.customers
  FOR ALL USING (company_id IN (SELECT public.get_user_company_ids()));

-- Customers RLS: Customer user can view their own profile
DROP POLICY IF EXISTS "Customer self view" ON public.customers;
CREATE POLICY "Customer self view" ON public.customers
  FOR SELECT USING (user_id = auth.uid());

-- Loans RLS: Staff access
DROP POLICY IF EXISTS "Staff access company loans" ON public.loans;
CREATE POLICY "Staff access company loans" ON public.loans
  FOR ALL USING (company_id IN (SELECT public.get_user_company_ids()));

-- Loans RLS: Customer self view
DROP POLICY IF EXISTS "Customer view own loans" ON public.loans;
CREATE POLICY "Customer view own loans" ON public.loans
  FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- Installments RLS: Staff access
DROP POLICY IF EXISTS "Staff access company installments" ON public.installments;
CREATE POLICY "Staff access company installments" ON public.installments
  FOR ALL USING (company_id IN (SELECT public.get_user_company_ids()));

-- Installments RLS: Customer self view
DROP POLICY IF EXISTS "Customer view own installments" ON public.installments;
CREATE POLICY "Customer view own installments" ON public.installments
  FOR SELECT USING (loan_id IN (SELECT id FROM public.loans WHERE customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())));

-- Payments RLS: Staff access
DROP POLICY IF EXISTS "Staff access company payments" ON public.payments;
CREATE POLICY "Staff access company payments" ON public.payments
  FOR ALL USING (company_id IN (SELECT public.get_user_company_ids()));

-- Payments RLS: Customer self view
DROP POLICY IF EXISTS "Customer view own payments" ON public.payments;
CREATE POLICY "Customer view own payments" ON public.payments
  FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- Automatic profile creation on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'user_type', 'staff')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    user_type = EXCLUDED.user_type;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
