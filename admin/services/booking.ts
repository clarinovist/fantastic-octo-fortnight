import type { BaseResponse, Booking, BookingDetail, BookingStatus } from "@/utils/types";
import { fetcherBase } from "./base";

type BookingsParams = {
  page?: number;
  pageSize?: number;
  tutorName?: string;
  studentName?: string;
  status?: BookingStatus;
  sort?: string;
  sortDirection?: string;
}

export async function getBookings(params: BookingsParams): Promise<BaseResponse<Booking[]>> {
  const qs = new URLSearchParams();
  if (params.page) qs.append('page', params.page.toString());
  if (params.pageSize) qs.append('pageSize', params.pageSize.toString());
  if (params.tutorName) qs.append('tutorName', params.tutorName);
  if (params.studentName) qs.append('studentName', params.studentName);
  if (params.status) qs.append('status', params.status);
  qs.append('sort', params.sort || "booking_date");
  qs.append('sortDirection', params.sortDirection || "DESC");
  return fetcherBase<Booking[]>(`/v1/admin/bookings?${qs.toString()}`, {
    next: { tags: ['bookings'] },
  });
}

export async function getBookingById(bookingId: string): Promise<BaseResponse<BookingDetail>> {
  return fetcherBase<BookingDetail>(`/v1/admin/bookings/${bookingId}`, {
    next: { tags: ['booking'] },
  });
}

export async function studentBookingReminder(bookingId: string): Promise<BaseResponse<string>> {
  return fetcherBase<string>(`/v1/admin/bookings/${bookingId}/reminder-student`, {
    method: 'POST',
    next: { tags: ['booking'] },
  });
}

export async function tutorBookingReminder(bookingId: string): Promise<BaseResponse<string>> {
  return fetcherBase<string>(`/v1/admin/bookings/${bookingId}/reminder-tutor`, {
    method: 'POST',
    next: { tags: ['booking'] },
  });
}
