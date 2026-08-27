const routes = [
  "http://localhost:3000/en/login",
  "http://localhost:3000/ta/login",
  "http://localhost:3000/hi/login",
  "http://localhost:3000/en/signup",
  "http://localhost:3000/en/customer-login",
  "http://localhost:3000/en/verify-otp",
  "http://localhost:3000/en/company-setup",
  "http://localhost:3000/en/dashboard",
  "http://localhost:3000/ta/dashboard",
  "http://localhost:3000/hi/dashboard",
  "http://localhost:3000/en/staff",
  "http://localhost:3000/en/staff/new",
  "http://localhost:3000/en/staff/st-2",
  "http://localhost:3000/en/settings/areas",
  "http://localhost:3000/en/settings/company",
  "http://localhost:3000/en/customers",
  "http://localhost:3000/ta/customers",
  "http://localhost:3000/hi/customers",
  "http://localhost:3000/en/customers/new",
  "http://localhost:3000/en/customers/cus-1",
  "http://localhost:3000/en/loans",
  "http://localhost:3000/ta/loans",
  "http://localhost:3000/hi/loans",
  "http://localhost:3000/en/loans/new",
  "http://localhost:3000/en/loans/ln-1",
  "http://localhost:3000/en/collections",
  "http://localhost:3000/ta/collections",
  "http://localhost:3000/hi/collections",
  "http://localhost:3000/en/payments",
  "http://localhost:3000/ta/payments",
  "http://localhost:3000/hi/payments",
  "http://localhost:3000/en/payments/RCP-2026-0091/receipt",
  "http://localhost:3000/en/expenses",
  "http://localhost:3000/ta/expenses",
  "http://localhost:3000/hi/expenses",
  "http://localhost:3000/en/reports",
  "http://localhost:3000/ta/reports",
  "http://localhost:3000/hi/reports",
  "http://localhost:3000/en/my-loans",
  "http://localhost:3000/ta/my-loans",
  "http://localhost:3000/hi/my-loans",
  "http://localhost:3000/en/my-payments",
  "http://localhost:3000/ta/my-payments",
  "http://localhost:3000/hi/my-payments",
  "http://localhost:3000/en/my-profile",
  "http://localhost:3000/ta/my-profile",
  "http://localhost:3000/hi/my-profile",
];

async function run() {
  console.log("🔍 Testing all 20 routes across Stages 1 to 4...\n");
  let passed = 0;
  for (const url of routes) {
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        console.log(`✅ [200 OK] ${url}`);
        passed++;
      } else {
        console.error(`❌ [${res.status}] ${url}`);
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${url}: ${err.message}`);
    }
  }

  console.log(`\n================================`);
  console.log(`Results: ${passed} / ${routes.length} routes working perfectly!`);
}

run();
