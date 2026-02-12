"use server"

import { updateSubscriptionPrices, type UpdateSubscriptionPayload } from "@/services/subscription"
import { updateTag } from "next/cache"

export async function updateSubscriptionPricesAction(
  subscriptionId: string,
  payload: UpdateSubscriptionPayload
) {
  const result = await updateSubscriptionPrices(subscriptionId, payload)
  if (result.success) {
    updateTag("subscriptions")
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to update subscription prices"
    }
  }
}
