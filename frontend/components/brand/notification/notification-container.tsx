"use client"

import * as React from "react"
import { NotificationList } from "./notification-list"

interface NotificationContainerProps {
  className?: string
}

export function NotificationContainer({ className }: NotificationContainerProps) {
  const [activeTab, setActiveTab] = React.useState<"all" | "deleted">("all")

  return (
    <div className={`max-w-md mx-auto bg-white rounded-2xl ${className}`}>
      {/* Tab Headers */}
      <div className="flex px-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-3 px-4 text-sm font-medium text-center transition-colors ${
            activeTab === "all" ? "border-b-2 border-main" : "text-gray-400"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab("deleted")}
          className={`py-3 px-4 text-sm font-medium text-center transition-colors ${
            activeTab === "deleted" ? "border-b-2 border-main" : "text-gray-400"
          }`}
        >
          Deleted
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        <NotificationList tabActive={activeTab} />
      </div>
    </div>
  )
}
