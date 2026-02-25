import { TOKEN_KEY } from "@/utils/constants/cookies";
import { NextResponse, type NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
    const token = request.cookies.get(TOKEN_KEY)?.value;
    const { pathname } = request.nextUrl;

    // Define public paths that don't require authentication
    const publicPaths = ["/login"];

    // Check if the current path is a public path
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    let isTutor = false;

    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            if (payloadBase64) {
                // Handle base64url encoding
                const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                isTutor = payload.role === "tutor";
            }
        } catch (e) {
            console.error("Error parsing token payload in proxy:", e);
        }
    }

    // If the user is not authenticated or not a tutor, and tries to access a protected page
    if ((!token || !isTutor) && !isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        const response = NextResponse.redirect(url);
        // Clear the invalid token so they don't get stuck in a redirect loop
        if (token && !isTutor) {
            response.cookies.delete(TOKEN_KEY);
        }
        return response;
    }

    // If the user is authenticated as tutor and tries to access the login page, redirect to dashboard
    if (token && isTutor && isPublicPath) {
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
         * - Static assets (images, fonts, etc.)
         */
        "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$).*)",
    ],
};
