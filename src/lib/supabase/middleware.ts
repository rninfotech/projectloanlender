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

  // Define public routes that don't require auth
  const publicPaths = [
    "/login",
    "/signup",
    "/verify-otp",
    "/forgot-password",
    "/customer/login",
    "/customer/verify-otp",
    "/auth/callback",
  ];

  const pathname = request.nextUrl.pathname;
  
  // Remove locale prefix for path matching (e.g., /en/login -> /login)
  const pathWithoutLocale = pathname.replace(/^\/(en|ta|hi)/, "") || "/";

  const isPublicPath = publicPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(path + "/")
  );

  // Check if Supabase keys are still placeholders (Demo Mode enabled)
  const isDemoMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  // In production with real Supabase keys, enforce login for protected routes
  if (!isDemoMode && !user && !isPublicPath && pathWithoutLocale !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
