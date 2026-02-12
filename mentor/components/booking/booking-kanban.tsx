"use client"

import { Booking } from "@/utils/types/booking"
import { BookingCard } from "./booking-card"

interface BookingKanbanProps {
    bookings: Booking[]
}

export function BookingKanban({ bookings }: BookingKanbanProps) {
    const pendingBookings = bookings.filter(b => b.status === "pending")
    const acceptedBookings = bookings.filter(b => b.status === "accepted")
    const rejectedBookings = bookings.filter(b => b.status === "rejected" || b.status === "cancelled")

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] overflow-x-auto pb-4">
            {/* Pending Column */}
            <div className="flex-1 min-w-[300px] flex flex-col bg-muted/40 rounded-xl border border-border/50">
                <div className="p-4 border-b bg-muted/50 rounded-t-xl flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <h3 className="font-semibold text-sm">Menunggu Konfirmasi</h3>
                    </div>
                    <span className="bg-background border px-2 py-0.5 rounded-full text-xs font-medium">
                        {pendingBookings.length}
                    </span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3 pb-4">
                        {pendingBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                        {pendingBookings.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                Tidak ada booking menunggu
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Accepted Column */}
            <div className="flex-1 min-w-[300px] flex flex-col bg-muted/40 rounded-xl border border-border/50">
                <div className="p-4 border-b bg-muted/50 rounded-t-xl flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <h3 className="font-semibold text-sm">Diterima</h3>
                    </div>
                    <span className="bg-background border px-2 py-0.5 rounded-full text-xs font-medium">
                        {acceptedBookings.length}
                    </span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3 pb-4">
                        {acceptedBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                        {acceptedBookings.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                Belum ada booking diterima
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rejected/Cancelled Column */}
            <div className="flex-1 min-w-[300px] flex flex-col bg-muted/40 rounded-xl border border-border/50">
                <div className="p-4 border-b bg-muted/50 rounded-t-xl flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-destructive" />
                        <h3 className="font-semibold text-sm">Ditolak / Batal</h3>
                    </div>
                    <span className="bg-background border px-2 py-0.5 rounded-full text-xs font-medium">
                        {rejectedBookings.length}
                    </span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3 pb-4">
                        {rejectedBookings.map(booking => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))}
                        {rejectedBookings.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                Tidak ada booking ditolak
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
