"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/helpers"
import type { Notification } from "@/utils/types/notification"
import { AlertTriangle, Check, Info, Trash2, X } from "lucide-react"
import React from "react"

export type NotificationType = "info" | "success" | "error" | "warning"

export interface NotificationItemProps extends Notification {
  onDelete?: (id: string) => void
  onMarkAsRead?: (id: string) => void
}

const typeStyles: Record<
  NotificationType,
  { bg: string; bgIcon: string; icon: React.JSX.Element }
> = {
  info: {
    bg: "bg-purple-100",
    bgIcon: "bg-[#E0C6FF]",
    icon: <Info className="w-6 h-6 text-purple-600" />,
  },
  success: {
    bg: "bg-green-100",
    bgIcon: "bg-[#FFFFFF]/50",
    icon: <Check className="w-6 h-6 text-green-600" />,
  },
  error: {
    bg: "bg-red-100",
    bgIcon: "bg-[#FFFFFF]/50",
    icon: <X className="w-6 h-6 text-red-700" />,
  },
  warning: {
    bg: "bg-amber-100",
    bgIcon: "bg-[#FFFFFF]/50",
    icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
  },
}

export function NotificationItem({
  id,
  title,
  message,
  link,
  isDismissed,
  isDeletable,
  type,
  createdAt,
  isRead,
  onDelete,
  onMarkAsRead,
}: NotificationItemProps) {
  const style = typeStyles[type]

  const handleClick = () => {
    // Mark as read if not already read
    if (!isRead && onMarkAsRead) {
      onMarkAsRead(id)
    }

    if (link && link !== "") {
      window.open(link, "_blank")
    }
  }

  return (
    <Card
      className={cn(
        "flex items-center justify-between p-4 rounded-lg shadow-none flex-row cursor-pointer transition-opacity",
        style.bg,
        isDismissed && "opacity-50"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className={cn("p-2 rounded", style.bgIcon)}>{style.icon}</div>
          {!isRead && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
          )}
        </div>
        <div>
          <p className={cn("font-semibold text-sm", isRead && "font-light")}>{title}</p>
          {message && (
            <p className={cn("text-gray-700 text-xs", isRead && "font-light")}>{message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">{formatDate(createdAt, { withTime: true })}</p>
        </div>
      </div>
      {isDeletable && (
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete?.(id)
          }}
          className="p-2 rounded-lg bg-white/60 hover:bg-white transition"
        >
          <Trash2 className="w-5 h-5 text-gray-500" />
        </button>
      )}
    </Card>
  )
}
