"use client"

import { BookingStatusBox } from "@/components/brand/course/booking/booking-status-box"
import { formatDate } from "@/utils/helpers"
import { Booking } from "@/utils/types/booking"
import { XCircle } from "lucide-react"
import { useState } from "react"
import { ReportDialog } from "./booking-report"

type BookingHistoryItemProps = {
  isReportable?: boolean
  booking: Booking
  onDetail?: () => void
}

export function BookingHistoryItem({ booking, isReportable, onDetail }: BookingHistoryItemProps) {
  const { bookingDate, bookingTime, timezone, courseTitle, status, expiredAt } = booking
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <div className="flex items-stretch bg-white rounded-2xl shadow-md overflow-hidden border">
      <BookingStatusBox status={status} expiredAt={expiredAt} />
      {/* Right Info Box */}
      <div className="flex flex-col justify-center py-4 pr-6 pl-4 flex-1">
        <div className="text-2xl font-bold leading-none">{formatDate(bookingDate)}</div>
        <div className="text-gray-500 text-lg font-semibold mt-1">
          {bookingTime} {timezone && `(${timezone})`}
        </div>
        <p className="text-sm text-gray-700 mt-2">{courseTitle}</p>

        <div className="flex items-center justify-between mt-3">
          <button
            className="text-blue-700 font-semibold text-sm hover:underline"
            onClick={onDetail}
          >
            DETAIL
          </button>
          {isReportable && (
            <>
              <button
                className="flex items-center gap-1 text-red-600 text-sm hover:underline"
                onClick={() => setReportOpen(true)}
              >
                <XCircle className="w-4 h-4" />
                Report
              </button>
              <ReportDialog open={reportOpen} onOpenChange={setReportOpen} bookingId={booking.id} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
