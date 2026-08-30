import { createClient } from "@/lib/supabase/client";

export interface CustomerData {
  id: string;
  customerNumber: string;
  fullName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  area: string;
  city: string;
  state?: string;
  pincode?: string;
  address?: string;
  idType?: string;
  idNumber?: string;
  activeLoansCount: number;
  totalOutstanding: number;
  totalBorrowed?: number;
  totalRepaid?: number;
  outstandingBalance?: number;
  notes?: string;
  portalEnabled: boolean;
  preferredLang: "en" | "ta" | "hi";
  status: "active" | "inactive";
  createdAt?: string;
}

/**
 * Fetch all customers belonging to the currently logged-in user ONLY.
 * Never returns dummy/sample data.
 * All queries are scoped to auth.uid() via Supabase RLS.
 */
export async function fetchAllCustomers(): Promise<CustomerData[]> {
  const supabase = createClient();

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  return data.map((item: any): CustomerData => ({
    id: item.id,
    customerNumber: item.customer_number || `CUS-${item.id.slice(0, 6).toUpperCase()}`,
    fullName: item.full_name,
    phone: item.phone,
    altPhone: item.alt_phone,
    email: item.email,
    area: item.area || "N/A",
    city: item.city || "N/A",
    state: item.state,
    pincode: item.pincode,
    address: item.address,
    idType: item.id_type,
    idNumber: item.id_number,
    activeLoansCount: 0,
    totalOutstanding: 0,
    portalEnabled: item.notify_sms ?? true,
    preferredLang: item.preferred_lang || "en",
    status: item.is_active ? "active" : "inactive",
    notes: item.notes,
    createdAt: item.created_at,
  }));
}

/**
 * Fetch a single customer by ID — verifies ownership via created_by = auth.uid()
 */
export async function fetchCustomerById(id: string): Promise<CustomerData | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("created_by", user.id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    customerNumber: data.customer_number || `CUS-${data.id.slice(0, 6).toUpperCase()}`,
    fullName: data.full_name,
    phone: data.phone,
    altPhone: data.alt_phone,
    email: data.email,
    area: data.area || "N/A",
    city: data.city || "N/A",
    state: data.state,
    pincode: data.pincode,
    address: data.address,
    idType: data.id_type,
    idNumber: data.id_number,
    activeLoansCount: 0,
    totalOutstanding: 0,
    portalEnabled: data.notify_sms ?? true,
    preferredLang: data.preferred_lang || "en",
    status: data.is_active ? "active" : "inactive",
    notes: data.notes,
    createdAt: data.created_at,
  };
}

/**
 * Create a new customer, scoped to the logged-in user.
 * Sets created_by = auth.uid() so only this user can see it.
 */
export async function createCustomer(input: {
  fullName: string;
  phone: string;
  altPhone?: string;
  email?: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  address?: string;
  idType?: string;
  idNumber?: string;
  notes?: string;
  enablePortal: boolean;
  preferredLang: "en" | "ta" | "hi";
}): Promise<CustomerData> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Generate customer number
  const { count } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user.id);
  const nextNum = ((count ?? 0) + 1).toString().padStart(4, "0");
  const customerNumber = `CUS-${nextNum}`;

  const phone = input.phone.startsWith("+91") ? input.phone : `+91 ${input.phone}`;
  const altPhone = input.altPhone
    ? input.altPhone.startsWith("+91") ? input.altPhone : `+91 ${input.altPhone}`
    : null;

  const { data, error } = await supabase
    .from("customers")
    .insert({
      customer_number: customerNumber,
      full_name: input.fullName,
      phone,
      alt_phone: altPhone,
      email: input.email || null,
      area: input.area,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      address: input.address || null,
      id_type: input.idType || null,
      id_number: input.idNumber || null,
      notes: input.notes || null,
      notify_sms: input.enablePortal,
      preferred_lang: input.preferredLang,
      is_active: true,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !data) throw new Error(error?.message || "Failed to create customer");

  return {
    id: data.id,
    customerNumber: data.customer_number,
    fullName: data.full_name,
    phone: data.phone,
    altPhone: data.alt_phone,
    email: data.email,
    area: data.area,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    address: data.address,
    idType: data.id_type,
    idNumber: data.id_number,
    activeLoansCount: 0,
    totalOutstanding: 0,
    portalEnabled: data.notify_sms ?? true,
    preferredLang: data.preferred_lang || "en",
    status: "active",
    notes: data.notes,
    createdAt: data.created_at,
  };
}

/**
 * @deprecated Use fetchAllCustomers() instead. Kept for compatibility.
 */
export function getLocalCustomers(): CustomerData[] {
  return [];
}

/**
 * @deprecated No-op. Kept for compatibility.
 */
export function saveLocalCustomer(customer: CustomerData): CustomerData[] {
  return [customer];
}