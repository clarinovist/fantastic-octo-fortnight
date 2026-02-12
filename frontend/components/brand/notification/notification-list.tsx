"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { Loader2 } from "lucide-react"
import * as React from "react"
import { NotificationItem } from "./notification-item"

interface NotificationListProps {
  className?: string
  tabActive: "all" | "deleted"
}

export function NotificationList({ className, tabActive }: NotificationListProps) {
  const { notifications, loading, error, hasMore, loadMore, deleteNotification, markAsRead } =
    useNotifications({ tab: tabActive })
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isNearBottom && !loading && hasMore) {
        loadMore()
      }
    }

    scrollContainer.addEventListener("scroll", handleScroll)
    return () => scrollContainer.removeEventListener("scroll", handleScroll)
  }, [loading, hasMore, loadMore])

  if (error) {
    return (
      <div className={`text-center text-red-600 ${className}`}>
        <p>Error loading notifications</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      className={`space-y-1 xl:max-h-80 max-h-[calc(100vh-12rem)] overflow-y-auto ${className}`}
    >
      {notifications?.length === 0 && !loading ? (
        <div className="text-center text-gray-500 py-8">
          {tabActive === "deleted" ? "No deleted notifications" : "No notifications found"}
        </div>
      ) : (
        <>
          {notifications.map((notification, notifIdx) => (
            <NotificationItem
              key={`${notification.id}-${notifIdx}`}
              {...notification}
              onDelete={deleteNotification}
              onMarkAsRead={markAsRead}
            />
          ))}
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}
          {!hasMore && notifications?.length > 0 && (
            <div className="text-center text-gray-500 text-sm py-2">No more notifications</div>
          )}
        </>
      )}
    </div>
  )
}
