import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Update the Supabase session in middleware.
 * This refreshes the auth token and ensures cookies are up to date.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always pass through API routes first
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return supabaseResponse;
  }

  // IMPORTANT: Use getUser() not getSession() for secure auth checks
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extract locale from path (e.g., /en/login -> en)
  const localeMatch = pathname.match(/^\/(en|ta|hi)/);
  const locale = localeMatch ? localeMatch[1] : "en";

  // Remove locale prefix for path matching (e.g., /en/login -> /login)
  const pathWithoutLocale = pathname.replace(/^\/(en|ta|hi)/, "") || "/";

  // Pages that do NOT require login (unauthenticated users can visit)
  const publicPaths = [
    "/login",
    "/signup",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
    "/company-setup",
    "/customer-login",
    "/my-loans",
    "/my-payments",
    "/my-profile",
  ];

  // Pages that redirect already-logged-in users away (they should go to dashboard)
  const loginOnlyPaths = ["/login", "/signup", "/customer-login"];

  const isPublicPath = publicPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(path + "/")
  );

  const isLoginOnlyPath = loginOnlyPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(path + "/")
  );

  // If user is logged in and tries to access login/signup -> redirect to dashboard
  if (user && isLoginOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // If user is NOT logged in and tries to access a protected route -> redirect to login
  if (!user && !isPublicPath && pathWithoutLocale !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}