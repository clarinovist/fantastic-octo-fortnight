import { fetcherBase } from "./base";
import { BaseResponse } from "@/utils/types";
import { Booking, BookingStats } from "@/utils/types/booking";

export async function getMentorBookings(
    page = 1,
    limit = 10,
    status = ""
): Promise<BaseResponse<Booking[]>> {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status ? { status } : {})
    });
    return fetcherBase<Booking[]>(`/v1/mentor/bookings?${query}`);
}

export async function getBookingDetail(id: string): Promise<BaseResponse<Booking>> {
    return fetcherBase<Booking>(`/v1/mentor/bookings/${id}`);
}

export async function acceptBooking(id: string): Promise<BaseResponse<null>> {
    return fetcherBase<null>(`/v1/mentor/bookings/${id}/accept`, {
        method: "POST",
    });
}

export async function rejectBooking(id: string, reason: string): Promise<BaseResponse<null>> {
    return fetcherBase<null>(`/v1/mentor/bookings/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}

export async function getBookingStats(): Promise<BaseResponse<BookingStats>> {
    return fetcherBase<BookingStats>("/v1/mentor/bookings/stats");
}
