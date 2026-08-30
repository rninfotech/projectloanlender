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

  // IMPORTANT: Do not use getSession() for authorization.
  // Use getUser() which validates the token with Supabase Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pages that unauthenticated users can access
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

  // Pages where logged-in users should be redirected away (to dashboard)
  const loginOnlyPaths = ["/login", "/signup", "/customer-login"];

  const pathname = request.nextUrl.pathname;

  // Extract locale from path (e.g., /en/login -> en)
  const localeMatch = pathname.match(/^\/(en|ta|hi)/);
  const locale = localeMatch ? localeMatch[1] : "en";

  // Remove locale prefix for path matching (e.g., /en/login -> /login)
  const pathWithoutLocale = pathname.replace(/^\/(en|ta|hi)/, "") || "/";

  const isPublicPath = publicPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(path + "/")
  );

  const isLoginOnlyPath = loginOnlyPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(path + "/")
  );

  // API routes and auth callback are always public
  if (pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  // If logged in and on a login/signup page, redirect to dashboard
  if (user && isLoginOnlyPath) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  // If NOT logged in and on a protected page, redirect to login
  if (!user && !isPublicPath && pathWithoutLocale !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
