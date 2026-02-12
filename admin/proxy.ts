import { TOKEN_KEY } from "@/utils/constants/cookies";
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
