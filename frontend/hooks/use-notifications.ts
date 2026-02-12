import { Notification } from '@/utils/types/notification'
import { useCallback, useEffect, useRef, useState } from 'react'

interface NotificationResponse {
  statusCode: number
  success: boolean
  message: string
  data: Notification[] | null
  metadata: {
    page: number
    pageSize: number
    total: number
  }
}

interface UseNotificationsParams {
  tab: "all" | "deleted"
}

export function useNotifications({ tab }: UseNotificationsParams) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)

  const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
    if (loadingRef.current) return

    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)

      const tabParam = tab === "deleted" ? "&isDeleted=true" : "&isDeleted=false"
      const response = await fetch(`/api/v1/notifications?page=${pageNum}&pageSize=10${tabParam}`)

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data: NotificationResponse = await response.json()

      // Handle null or undefined data
      const notificationData = data.data || []

      if (append) {
        setNotifications(prev => [...prev, ...notificationData])
      } else {
        setNotifications(notificationData)
      }

      setHasMore(notificationData.length === data.metadata.pageSize && data.metadata.total > pageNum * data.metadata.pageSize)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [tab])

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchNotifications(nextPage, true)
    }
  }, [hasMore, page, fetchNotifications])

  const deleteNotification = useCallback(async (id: string) => {
    // Optimistic update - remove from UI immediately
    const previousNotifications = notifications
    setNotifications(prev => prev.filter(n => n.id !== id))

    try {
      const response = await fetch(`/api/v1/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }
    } catch (err) {
      // Revert optimistic update on error
      setNotifications(previousNotifications)
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
    }
  }, [notifications])

  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update - mark as read immediately
    const previousNotifications = notifications
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )

    try {
      const response = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }
    } catch (err) {
      // Revert optimistic update on error
      setNotifications(previousNotifications)
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read')
    }
  }, [notifications])

  const refetch = useCallback(() => {
    setPage(1)
    setHasMore(true)
    fetchNotifications(1)
  }, [fetchNotifications])

  // Reset state when tab changes
  useEffect(() => {
    setNotifications([])
    setPage(1)
    setHasMore(true)
    setError(null)
    fetchNotifications(1)
  }, [tab, fetchNotifications])

  return {
    notifications,
    loading,
    error,
    hasMore,
    loadMore,
    deleteNotification,
    markAsRead,
    refetch
  }
}