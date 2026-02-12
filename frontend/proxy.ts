import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { verifyEmailAction } from "./actions/auth";
import { getMe } from "./services/account";
import { TOKEN_KEY } from "./utils/constants/cookies";

export async function proxy(req: NextRequest) {
  const cookieStore = await cookies();
  const targetPath = cookieStore.get("target_path")
  const token = cookieStore.get(TOKEN_KEY);
  const url = req.nextUrl.clone();
  const emailVerificationToken = req.nextUrl.searchParams.get("token");

  // Check if user is accessing private pages (account with subpaths or booking pages)
  const isAccountPage = url.pathname.startsWith("/account");
  const isHomePage = url.pathname === "/";
  const isBookingPage = /^\/[^\/]+\/booking/.test(url.pathname); // Matches /{anything}/booking

  if (isHomePage && token && targetPath?.value) {
    const targetUrl = decodeURIComponent(targetPath.value);
    const response = NextResponse.redirect(new URL(targetUrl, req.url));
    response.cookies.delete("target_path");
    return response;
  }

  if (isAccountPage || isBookingPage) {
    if (!token) {
      cookieStore.set("target_path", url.pathname + url.search)
      url.pathname = "/login";
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (targetPath?.value) {
      cookieStore.delete("target_path")
    }
  }

  if ((url.pathname === "/login" || url.pathname === "/signup") && token) {
    // If user is logged in and trying to access login/signup
    if (targetPath?.value) {
      // Redirect to target path and clear cookie
      const targetUrl = decodeURIComponent(targetPath.value);
      const response = NextResponse.redirect(new URL(targetUrl, req.url));
      response.cookies.delete("target_path");
      return response;
    }
    // Otherwise redirect to home
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

<<<<<<< HEAD
  if (isHomePage && emailVerificationToken) {
=======
  if (url.pathname === "/login" && emailVerificationToken) {
>>>>>>> 1a19ced (chore: update service folders from local)
    const resp = await verifyEmailAction(emailVerificationToken);
    if (resp.data?.accessToken) {
      if (targetPath?.value) {
        const targetUrl = decodeURIComponent(targetPath.value);
        const response = NextResponse.redirect(new URL(targetUrl, req.url));
        response.cookies.delete("target_path");
        return response;
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Only run profile check if token exists and not on login/plans page
  if (token?.value && url.pathname !== "/account" && !url.pathname.startsWith("/login") && url.pathname !== "/plans") {
    try {
      const res = await getMe()
      if (res?.data?.role === "tutor") {
        if (!res?.data?.finish_update_profile) {
          return NextResponse.redirect(new URL("/account", req.url))
        } else if (isBookingPage) {
          return NextResponse.redirect(new URL("/", req.url))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Clear target_path if we're on the target page
  if (targetPath?.value && url.pathname === decodeURIComponent(targetPath.value).split('?')[0]) {
    const response = NextResponse.next();
    response.cookies.delete("target_path");
    return response;
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|assets|site.webmanifest|scripts|favicon.ico|lesprivate-logo.png|lesprivate-logo-notext.png|guru-aktif.png|guru-favorit.png).*)',
  ],
}
