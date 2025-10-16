import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request);

  // Refresh session cookie if it's expired.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Admin role check: prefer admin_users table when available, fallback to user_metadata.is_admin
  let isAdmin = false;
  let userId: string | null = null;
  if (session) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user ?? null;
    userId = user?.id ?? null;
    // Check multiple metadata sources for admin role
    const metaAdmin = Boolean(
      user?.user_metadata?.is_admin === true ||
        user?.app_metadata?.is_admin === true ||
        (Array.isArray((user?.app_metadata as any)?.roles) &&
          ((user?.app_metadata as any).roles as string[]).includes("admin")) ||
        (typeof (user?.app_metadata as any)?.role === "string" &&
          ((user?.app_metadata as any).role as string).toLowerCase() === "admin")
    );
    let tableAdmin = false;
    if (userId) {
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();
        if (!error && data && data.user_id) {
          tableAdmin = true;
        }
      } catch (_) {
        // If table doesn't exist or RLS blocks, ignore and rely on metadata
      }
    }
    isAdmin = metaAdmin || tableAdmin;
  }

  // Guard admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin";

    // Single-user app: never redirect admin routes to home.
    // Require login only for non-login admin pages.
    if (!session && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    // If already logged in and visiting /admin (login page), send to dashboard.
    // This keeps the login experience simple while honoring the user's request
    // to avoid redirecting admin routes to the public home page.
    if (session && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
