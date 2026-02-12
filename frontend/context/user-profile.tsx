"use client"

import { getMe } from "@/services/account"
import { TOKEN_KEY } from "@/utils/constants/cookies"
import type { MeResponse } from "@/utils/types"
import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

const UserProfileContext = createContext<{
  profile: MeResponse | null
  resetProfile: () => void
  refetchProfile: () => Promise<void>
} | null>(null)

export function useUserProfile() {
  return useContext(UserProfileContext)
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<MeResponse | null>(null)

  const fetchProfile = useCallback(async () => {
    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith(`${TOKEN_KEY}=`))
      ?.split("=")[1]

    if (!token) {
      setProfile(null)
      return
    }

    try {
      const data = await getMe()
      setProfile(data.data)
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const resetProfile = useCallback(() => {
    setProfile(null)
  }, [])

  const refetchProfile = useCallback(async () => {
    await fetchProfile()
  }, [fetchProfile])

  return (
    <UserProfileContext.Provider value={{ profile, resetProfile, refetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}
