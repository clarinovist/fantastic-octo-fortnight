"use client"

import { SubscriptionItem } from "./subscription-item"

interface Subscription {
  id: string
  name: string
  status: "pending" | "active" | "expired" | "canceled"
  startTime: string
  nextBillingDate: string
  amount?: string
  url?: string
}

interface SubscriptionListProps {
  subscriptions: Subscription[]
}

export function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  return (
    <div className="space-y-6">
      {subscriptions.map((subscription, index) => (
        <div key={subscription.id}>
          {/* Subscription Card */}
          <SubscriptionItem subscription={subscription} />

          {/* Divider */}
          {index < subscriptions.length - 1 && <div className="border-b-2 border-black my-6"></div>}
        </div>
      ))}
    </div>
  )
}
