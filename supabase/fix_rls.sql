-- ==============================================================================
-- FIX: User-Isolated Data with Proper Row Level Security (RLS)
-- INSTRUCTIONS: Copy this entire script and run it in:
--   Supabase Dashboard -> SQL Editor -> New Query -> Paste -> Run
-- ==============================================================================

-- 1. Make company_id nullable so users can create customers without a company
ALTER TABLE public.customers ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE public.loans ALTER COLUMN company_id DROP NOT NULL;

-- 2. Add state column if missing
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS state TEXT;

-- 3. Fix created_by to reference auth.users directly
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_created_by_fkey;
ALTER TABLE public.customers ADD CONSTRAINT customers_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Drop all old RLS policies on customers
DROP POLICY IF EXISTS "Staff access company customers" ON public.customers;
DROP POLICY IF EXISTS "Customer self view" ON public.customers;
DROP POLICY IF EXISTS "Users manage own customers" ON public.customers;

-- 5. Enable RLS on customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 6. New RLS: Each user can ONLY see/create/update/delete their own customers
CREATE POLICY "Users manage own customers"
  ON public.customers
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 7. Drop all old RLS policies on loans
DROP POLICY IF EXISTS "Staff access company loans" ON public.loans;
DROP POLICY IF EXISTS "Customer view own loans" ON public.loans;
DROP POLICY IF EXISTS "Users manage own loans" ON public.loans;

-- 8. Enable RLS on loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- 9. New RLS: Users see only loans that belong to their own customers
CREATE POLICY "Users manage own loans"
  ON public.loans
  FOR ALL
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM public.customers WHERE created_by = auth.uid()
    )
  );

-- 10. Clean up old dummy customers (those without a real owner)
DELETE FROM public.loans WHERE customer_id IN (
  SELECT id FROM public.customers WHERE created_by IS NULL
);
DELETE FROM public.customers WHERE created_by IS NULL;