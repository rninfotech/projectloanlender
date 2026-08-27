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

const STORAGE_KEY = "loan_lender_customers_v1";

const INITIAL_CUSTOMERS: CustomerData[] = [
  {
    id: "cus-1",
    customerNumber: "CUS-0001",
    fullName: "K. Annadurai",
    phone: "+91 98401 55678",
    altPhone: "+91 94440 12345",
    area: "Main Market Route",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625001",
    address: "Shop #45, Main Bazaar, Near Old Bus Stand, Madurai",
    idType: "Aadhaar Card",
    idNumber: "5432 9876 1234",
    activeLoansCount: 1,
    totalOutstanding: 14500,
    portalEnabled: true,
    preferredLang: "ta",
    status: "active",
  },
  {
    id: "cus-2",
    customerNumber: "CUS-0002",
    fullName: "S. Meenakshi",
    phone: "+91 97109 88765",
    area: "North Ward",
    city: "Madurai",
    activeLoansCount: 2,
    totalOutstanding: 42000,
    portalEnabled: true,
    preferredLang: "ta",
    status: "active",
  },
  {
    id: "cus-3",
    customerNumber: "CUS-0003",
    fullName: "V. Thangaraj",
    phone: "+91 94441 22334",
    area: "Main Market Route",
    city: "Madurai",
    activeLoansCount: 1,
    totalOutstanding: 8000,
    portalEnabled: false,
    preferredLang: "en",
    status: "active",
  },
  {
    id: "cus-4",
    customerNumber: "CUS-0004",
    fullName: "R. Balamurugan",
    phone: "+91 98840 99887",
    area: "South Town",
    city: "Madurai",
    activeLoansCount: 1,
    totalOutstanding: 25000,
    portalEnabled: true,
    preferredLang: "ta",
    status: "active",
  },
  {
    id: "cus-5",
    customerNumber: "CUS-0005",
    fullName: "P. Rajesh Kumar",
    phone: "+91 96001 44556",
    area: "East Bazaar",
    city: "Madurai",
    activeLoansCount: 1,
    totalOutstanding: 10000,
    portalEnabled: true,
    preferredLang: "hi",
    status: "active",
  },
];

// Helper to get from local storage
export function getLocalCustomers(): CustomerData[] {
  if (typeof window === "undefined") return INITIAL_CUSTOMERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading customers from localStorage:", e);
    return INITIAL_CUSTOMERS;
  }
}

// Helper to save to local storage
export function saveLocalCustomer(customer: CustomerData): CustomerData[] {
  if (typeof window === "undefined") return [customer];
  try {
    const list = getLocalCustomers();
    const updated = [customer, ...list.filter((c) => c.id !== customer.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Error saving customer to localStorage:", e);
    return [customer];
  }
}

// Fetch all customers (Supabase + Local fallback)
export async function fetchAllCustomers(): Promise<CustomerData[]> {
  const localList = getLocalCustomers();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return localList;
    }

    // Map Supabase schema to frontend interface
    const remoteList: CustomerData[] = data.map((item: any) => ({
      id: item.id,
      customerNumber: item.customer_number || `CUS-${item.id.slice(0, 4).toUpperCase()}`,
      fullName: item.full_name,
      phone: item.phone,
      altPhone: item.alternate_phone,
      email: item.email,
      area: item.area_route || "Main Market Route",
      city: item.city || "Madurai",
      state: item.state || "Tamil Nadu",
      pincode: item.pincode || "625001",
      address: item.address,
      idType: item.id_proof_type,
      idNumber: item.id_proof_number,
      activeLoansCount: 0,
      totalOutstanding: 0,
      portalEnabled: item.portal_access_enabled ?? true,
      preferredLang: item.preferred_language || "ta",
      status: item.is_active ? "active" : "inactive",
      createdAt: item.created_at,
    }));

    // Merge remote with local items
    const merged = [...remoteList];
    for (const localItem of localList) {
      if (!merged.some((m) => m.id === localItem.id || m.phone === localItem.phone)) {
        merged.push(localItem);
      }
    }

    return merged;
  } catch (e) {
    return localList;
  }
}

// Create new customer
export async function createCustomer(data: {
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
  const localList = getLocalCustomers();
  const nextNum = (localList.length + 1).toString().padStart(4, "0");
  const customerNumber = `CUS-${nextNum}`;
  const generatedId = `cus-${Date.now()}`;

  const newCustomer: CustomerData = {
    id: generatedId,
    customerNumber,
    fullName: data.fullName,
    phone: data.phone.startsWith("+91") ? data.phone : `+91 ${data.phone}`,
    altPhone: data.altPhone ? (data.altPhone.startsWith("+91") ? data.altPhone : `+91 ${data.altPhone}`) : undefined,
    email: data.email,
    area: data.area,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    address: data.address,
    idType: data.idType,
    idNumber: data.idNumber,
    activeLoansCount: 0,
    totalOutstanding: 0,
    portalEnabled: data.enablePortal,
    preferredLang: data.preferredLang,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  // 1. Save to LocalStorage immediately so UI updates instantly
  saveLocalCustomer(newCustomer);

  // 2. Try inserting into Supabase
  try {
    const supabase = createClient();
    await supabase.from("customers").insert({
      customer_number: customerNumber,
      full_name: data.fullName,
      phone: newCustomer.phone,
      alternate_phone: newCustomer.altPhone,
      email: data.email || null,
      area_route: data.area,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      address: data.address || null,
      id_proof_type: data.idType,
      id_proof_number: data.idNumber,
      notes: data.notes,
      portal_access_enabled: data.enablePortal,
      preferred_language: data.preferredLang,
      is_active: true,
    });
  } catch (err) {
    console.warn("Could not insert to Supabase, local cache saved:", err);
  }

  return newCustomer;
}
