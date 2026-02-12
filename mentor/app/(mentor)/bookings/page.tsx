"use client"

import { useState } from "react"
import useSWR from "swr"
import { PageHeader } from "@/components/layout/page-header"
import { BookingCard } from "@/components/booking/booking-card"
import { BookingKanban } from "@/components/booking/booking-kanban"
import { getMentorBookings } from "@/services/booking"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutList, KanbanSquare, CalendarX2 } from "lucide-react"

const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                </div>
            </div>
        ))}
    </div>
)

export default function BookingsPage() {
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list")

    // Fetch all bookings (paginated 100 to simulate 'all' for kanban, or could implement load more)
    const { data: response, error, isLoading } = useSWR(
        "bookings",
        () => getMentorBookings(1, 100),
        {
            revalidateOnFocus: false,
        }
    )

    const bookings = response?.data || []

    const breadcrumbs = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Booking Masuk" }
    ]


    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <PageHeader breadcrumbs={breadcrumbs} />

            <div className="p-8 pt-2 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Booking Masuk</h1>
                        <p className="text-muted-foreground">Kelola permintaan belajar dari calon siswa Anda.</p>
                    </div>
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "kanban")} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list" className="flex items-center gap-2">
                                <LayoutList className="h-4 w-4" />
                                <span>List</span>
                            </TabsTrigger>
                            <TabsTrigger value="kanban" className="flex items-center gap-2">
                                <KanbanSquare className="h-4 w-4" />
                                <span>Kanban</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {isLoading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-xl pt-8 text-center text-muted-foreground">
                        <CalendarX2 className="h-10 w-10 mb-4 opacity-50" />
                        <p>Gagal memuat data booking.</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl p-8 text-center bg-muted/20">
                        <div className="bg-primary/10 p-6 rounded-full mb-6">
                            <KanbanSquare className="h-12 w-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Belum Ada Booking</h3>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Saat ini belum ada permintaan booking masuk dari siswa.
                        </p>
                    </div>
                ) : viewMode === "list" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-auto pb-8">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="h-fit">
                                <BookingCard booking={booking} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <BookingKanban bookings={bookings} />
                )}
            </div>
        </div>
    )
}
