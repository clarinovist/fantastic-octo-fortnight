"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type AuthCallbackProps = {
  state?: string | null
}

export function AuthCallback(props: AuthCallbackProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const state = props.state

  useEffect(() => {
    if (status === "loading") return

    if (session) {
      // Successful authentication
      if (state === "signup") {
        router.replace("/?welcome=true")
      } else {
        router.replace("/")
      }
    } else {
      // Failed authentication
      router.replace("/auth/error")
    }
  }, [session, status, state, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Memproses autentikasi...</p>
      </div>
    </div>
  )
}
