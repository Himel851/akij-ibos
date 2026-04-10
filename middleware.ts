import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth-session";

function isProtectedAdminPath(pathname: string) {
  return pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
}

function isProtectedUserPath(pathname: string) {
  return (
    pathname.startsWith("/user") &&
    !pathname.startsWith("/user/login") &&
    !pathname.startsWith("/user/register")
  );
}

function redirectTo(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
  const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value === "1";

  async function getSupabaseUserAndResponse() {
    if (!hasSupabaseConfig || !supabaseUrl || !supabaseAnonKey) {
      return { user: null as null, response: NextResponse.next() };
    }

    let response = NextResponse.next({
      request: { headers: request.headers },
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { user, response };
  }

  if (isProtectedAdminPath(pathname)) {
    if (adminCookie) {
      return NextResponse.next();
    }

    const { user } = await getSupabaseUserAndResponse();
    if (user) {
      return redirectTo(request, "/user");
    }
    return redirectTo(request, "/admin/login");
  }

  if (!isProtectedUserPath(pathname)) {
    return NextResponse.next();
  }

  if (!hasSupabaseConfig) {
    return redirectTo(request, "/user/login");
  }

  const { user, response } = await getSupabaseUserAndResponse();

  if (user) {
    return response;
  }

  if (adminCookie) {
    return redirectTo(request, "/admin");
  }

  return redirectTo(request, "/user/login");
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/user", "/user/:path*"],
};
