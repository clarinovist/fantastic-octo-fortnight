"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Booking } from "@/utils/types"
import { BookingStatusBox } from "./booking-status-box"

interface LimitBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: Booking | null
  title: string
  description: string
}

export function LimitBookingDialog({
  open,
  onOpenChange,
  booking,
  title,
  description,
}: LimitBookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold capitalize">
            <span dangerouslySetInnerHTML={{ __html: title }} />
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            <span dangerouslySetInnerHTML={{ __html: description }} />
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex items-stretch gap-4 rounded-2xl overflow-hidden border bg-white shadow">
          <BookingStatusBox status={booking?.status ?? ""} expiredAt={booking?.expiredAt ?? ""} />
          <div className="flex flex-col justify-center py-4 pr-4">
            <div className="text-2xl font-bold leading-none">{booking?.bookingDate}</div>
            <div className="text-gray-500 text-lg font-semibold mt-1">
              {booking?.bookingTime}&nbsp;({booking?.timezone})
            </div>
            <p className="text-sm text-gray-700 mt-2 max-w-sm">{booking?.courseTitle}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
