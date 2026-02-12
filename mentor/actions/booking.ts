"use server"

import { revalidateTag } from "next/cache";
import { acceptBooking, rejectBooking } from "@/services/booking";

export async function acceptBookingAction(id: string) {
    try {
        const res = await acceptBooking(id);
        revalidateTag("bookings", "default");
        revalidateTag("mentor-stats", "default");
        return res;
    } catch (error) {
        return { success: false, error };
    }
}

export async function rejectBookingAction(id: string, reason: string) {
    try {
        const res = await rejectBooking(id, reason);
        revalidateTag("bookings", "default");
        revalidateTag("mentor-stats", "default");
        return res;
    } catch (error) {
        return { success: false, error };
    }
}
