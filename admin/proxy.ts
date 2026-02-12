import { TOKEN_KEY } from "@/utils/constants/cookies";
<<<<<<< HEAD
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const cookieStore = await cookies();
  if (req.nextUrl.pathname === "/" && !cookieStore.get(TOKEN_KEY)?.value) {
    return NextResponse.redirect(new URL("/login", req.url));
  } else if (req.nextUrl.pathname === "/" && cookieStore.get(TOKEN_KEY)?.value) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } else if (!cookieStore.get(TOKEN_KEY)?.value && req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
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
=======
import { NextResponse, type NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
    const token = request.cookies.get(TOKEN_KEY)?.value;
    const { pathname } = request.nextUrl;

    // Define public paths that don't require authentication
    const publicPaths = ["/login"];

    // Check if the current path is a public path
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    // If the user is not authenticated and tries to access a protected page
    if (!token && !isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // If the user is authenticated and tries to access the login page, redirect to dashboard
    if (token && isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
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
        "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$).*)",
    ],
};
>>>>>>> 1a19ced (chore: update service folders from local)
