"use server"

import { sendNotifications, type NotificationPayload } from "@/services/notification";

export async function sendNotificationsAction(payload: NotificationPayload) {
  const result = await sendNotifications(payload)
  if (result.success) {
    return { success: true, data: result }
  } else {
    console.error("Error sending notifications:", result.message);
    return {
      success: false,
      error: result.message || "Failed to send notifications"
    }
  }
}

