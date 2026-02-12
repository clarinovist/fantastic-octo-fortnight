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
<<<<<<< HEAD
=======

import { createBooking, updateBooking, type BookingPayload } from "@/services/booking"

export async function createBookingAction(data: BookingPayload) {
  const result = await createBooking(data)
  updateTag("bookings")
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return {
      success: false,
      error: result.message || "Failed to create booking"
    }
  }
}

export async function updateBookingAction(id: string, data: Partial<BookingPayload>) {
  const result = await updateBooking(id, data)
  updateTag("bookings")
  updateTag("booking")
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return {
      success: false,
      error: result.message || "Failed to update booking"
    }
  }
}
>>>>>>> 1a19ced (chore: update service folders from local)
