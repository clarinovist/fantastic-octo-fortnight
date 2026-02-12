import useSWR from 'swr'
import { TOKEN_KEY } from '@/utils/constants/cookies'

interface UnreadNotificationResponse {
  statusCode: number
  success: boolean
  message: string
  data: any[] | null
  metadata: {
    page: number
    pageSize: number
    total: number
  }
}

const fetcher = async (url: string): Promise<UnreadNotificationResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch unread notifications')
  }

  return response.json()
}

// Helper function to check if user is logged in
const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${TOKEN_KEY}=`))
    ?.split('=')[1]

  return !!token
}

export function useUnreadNotifications() {
  const isLoggedIn = isUserLoggedIn()

  const { data, error, isLoading, mutate } = useSWR(
    isLoggedIn ? '/api/v1/notifications?page=1&pageSize=1&isRead=false' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  const hasUnread = (data?.metadata?.total ?? 0) > 0

  return {
    hasUnread,
    loading: isLoading,
    error,
    refetch: mutate,
  }
}