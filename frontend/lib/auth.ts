import { ID_TOKEN, TOKEN_KEY } from "@/utils/constants/cookies"
import type { GoogleAuthResponse } from "@/utils/types"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { cookies } from "next/headers"
import { fetcherBase } from "../services/base"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_GOOGLE_AUTH_CLIENT_ID!,
      clientSecret: process.env.NEXT_GOOGLE_AUTH_CLIENT_SECRET!,
    }),
  ],
  session: {
    maxAge: 20 * 60 * 60
  },
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "google") {
        try {
          const cookiesStore = await cookies()
          cookiesStore.set(ID_TOKEN, account.id_token as string, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })

          const checkUserResponse = await fetcherBase<{ email: string; isNewUser: boolean }>('/v1/auth/check-user', {
            method: 'POST',
            body: JSON.stringify({ idToken: account.id_token }),
          })

          if (checkUserResponse instanceof Response) {
            throw new Error('Unexpected Response object')
          }

          const checkUser = checkUserResponse.data

          if (checkUser?.isNewUser) {
            // If new user, redirect to role selection
            return `/signup?isRoleSection=true`
          }

          const resp = await fetcherBase<GoogleAuthResponse>('/v1/auth/google', {
            method: 'POST',
            body: JSON.stringify({ idToken: account.id_token }),
          })

          if (resp instanceof Response) {
            throw new Error('Unexpected Response object')
          }

          cookiesStore.set(TOKEN_KEY, resp.data.accessToken, {
            expires: new Date(Date.now() + 20 * 60 * 60 * 1000)
          })

        } catch (error) {
          console.error('Google auth error:', error)
          return `/auth/error?error=NetworkError&message=${encodeURIComponent('Network error occurred')}`
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle redirect after successful authentication
      const urlParams = new URL(url, baseUrl)
      const state = urlParams.searchParams.get('state')

      if (state === 'signup') {
        return `${baseUrl}/?welcome=true`
      }
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
}
