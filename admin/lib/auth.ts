import { TOKEN_KEY } from "@/utils/constants/cookies"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { cookies } from "next/headers"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_GOOGLE_AUTH_CLIENT_ID!,
            clientSecret: process.env.NEXT_GOOGLE_AUTH_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 20 * 60 * 60 // 20 hours
    },
    callbacks: {
        async signIn({ account }) {
            if (account?.provider === "google") {
                try {
                    const cookiesStore = await cookies()

                    // Call backend to authenticate with Google ID token
                    // Since we are in the admin portal, the backend handles user upserta
                    // and token generation. Admin role check happens via middleware on subsequent requests.
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_BASE_API_URL || 'http://localhost:8080';
                    const res = await fetch(`${apiUrl}/v1/auth/google`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken: account.id_token }),
                    })

                    if (!res.ok) {
                        console.error('Backend Google auth failed:', await res.text())
                        return false
                    }

                    const data = await res.json()

                    if (data.success && data.data?.accessToken) {
                        cookiesStore.set(TOKEN_KEY, data.data.accessToken, {
                            expires: new Date(Date.now() + 20 * 60 * 60 * 1000),
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "lax"
                        })
                        return true
                    }

                    return false
                } catch (error) {
                    console.error('Google auth error:', error)
                    return false
                }
            }
            return true
        },
        async redirect({ url, baseUrl }) {
            return baseUrl + "/dashboard"
        },
    },
    pages: {
        signIn: '/login',
        error: '/login', // Redirect back to login on error for now
    },
}
