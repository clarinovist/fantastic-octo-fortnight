"use client"

import { BookingCourseDetail } from "@/components/brand/account/course/booking/booking-course-detail"
import type { BookingDetail } from "@/utils/types/booking"
import { Booking } from "@/utils/types/booking"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import useSWRInfinite from "swr/infinite"
import { BookingHistoryItem } from "./booking-item"

type BookingHistoryListProps = {
  isTutor?: boolean
}

const PAGE_SIZE = 10

// Fetcher function for SWR Infinite
const fetcher = async (url: string): Promise<{ data: any[] }> => {
  const response = await fetch(url, { next: { revalidate: 0 } })
  if (!response.ok) {
    throw new Error("Failed to fetch bookings")
  }
  return response.json()
}

// Key function for SWR Infinite
const getKey = (pageIndex: number, previousPageData: { data: any[] } | null, isTutor?: boolean) => {
  if (previousPageData && !previousPageData.data.length) return null
  const page = pageIndex + 1
  const baseUrl = isTutor ? "/api/v1/tutors/booking" : "/api/v1/students/booking"
  return `${baseUrl}?page=${page}&pageSize=${PAGE_SIZE}`
}

export function BookingHistoryList({ isTutor }: BookingHistoryListProps) {
  const { data, error, size, setSize, isValidating, isLoading } = useSWRInfinite<{ data: any[] }>(
    (pageIndex, previousPageData) => getKey(pageIndex, previousPageData, isTutor),
    fetcher,
    {
      dedupingInterval: 0,
      revalidateFirstPage: true,
      revalidateOnFocus: true,
      revalidateIfStale: true,
      revalidateOnMount: true,
    }
  )

  // Booking detail dialog state
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null)
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // Flatten all bookings from all pages
  const bookings: Booking[] = data
    ? data.flatMap(page =>
        page.data.map((booking: any) => ({
          id: booking.id,
          bookingDate: booking.bookingDate || booking.date,
          bookingTime: booking.bookingTime || booking.time,
          timezone: booking.timezone || "UTC",
          courseTitle: booking.courseTitle || "Course",
          courseDescription:
            booking.courseDescription || booking.message || "No description available",
          status: booking.status,
          expiredAt: booking.expiredAt || booking.extra || "",
        }))
      )
    : []

  const isEmpty = data?.[0]?.data?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < PAGE_SIZE)
  const isLoadingMore = isValidating && data && typeof data[size - 1] !== "undefined"

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const el = listRef.current
      if (!el || isLoadingMore || isReachingEnd) return
      const threshold = 100 // px from bottom
      if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
        setSize(size + 1)
      }
    }
    const el = listRef.current
    if (el) {
      el.addEventListener("scroll", handleScroll)
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll)
      }
    }
  }, [size, isLoadingMore, isReachingEnd, setSize])

  // Handler for clicking detail button
  const handleDetailClick = (id: string) => {
    setBookingDetailLoading(true)
    const url = isTutor ? `/api/v1/tutors/booking/${id}` : `/api/v1/students/booking/${id}`
    fetch(url, { next: { revalidate: 0 } })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch booking detail")
        return res.json()
      })
      .then(data => {
        setBookingDetail(data.data)
        setDetailDialogOpen(true)
      })
      .catch(() => {
        setBookingDetail(null)
        setDetailDialogOpen(false)
      })
      .finally(() => setBookingDetailLoading(false))
  }

  // Fetch booking detail if bookingId exists
  useEffect(() => {
    if (bookingId) {
      setBookingDetailLoading(true)
      const url = isTutor
        ? `/api/v1/tutors/booking/${bookingId}`
        : `/api/v1/students/booking/${bookingId}`
      fetch(url, { next: { revalidate: 0 } })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch booking detail")
          return res.json()
        })
        .then(data => {
          setBookingDetail(data.data)
          setDetailDialogOpen(true)
        })
        .catch(() => {
          setBookingDetail(null)
          setDetailDialogOpen(false)
        })
        .finally(() => setBookingDetailLoading(false))
    }
  }, [bookingId, isTutor])

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Booking request</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading bookings...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Booking request</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">Error: {error.message}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Booking request</h2>

      <div
        ref={listRef}
        className="space-y-4 max-h-[600px] overflow-y-auto p-4 rounded-2xl bg-black/10 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent"
      >
        {bookings.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No bookings found</div>
        ) : (
          bookings.map(booking => (
            <BookingHistoryItem
              key={booking.id}
              booking={booking}
              isReportable={!isTutor}
              onDetail={() => handleDetailClick(booking.id)}
            />
          ))
        )}

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Booking Detail Dialog (auto open if bookingId in URL or via button) */}
      {(bookingId || detailDialogOpen) && (
        <BookingCourseDetail
          booking={bookingDetail}
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          loading={bookingDetailLoading}
          isReportable={!isTutor}
          isAcceptable={isTutor && bookingDetail?.status === "pending"}
          isRejectable={isTutor && bookingDetail?.status === "pending"}
        />
      )}
    </div>
  )
}
