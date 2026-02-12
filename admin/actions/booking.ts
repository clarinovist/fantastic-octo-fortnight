"use server"

import { studentBookingReminder, tutorBookingReminder } from "@/services/booking"
import { updateTag } from "next/cache"

export async function studentBookingReminderAction(bookingId: string) {
  const result = await studentBookingReminder(bookingId)
  updateTag("bookings")
  if (result.success) {
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to remind student booking"
    }
  }
}

export async function tutorBookingReminderAction(bookingId: string) {
  const result = await tutorBookingReminder(bookingId)
  updateTag("bookings")
  if (result.success) {
    return { success: true, data: result }
  } else {
    return {
      success: false,
      error: result.message || "Failed to remind tutor booking"
    }
  }
}
