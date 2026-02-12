"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle } from "lucide-react"
import { Booking } from "@/utils/types/booking"
import { acceptBookingAction, rejectBookingAction } from "@/actions/booking"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface BookingCardProps {
    booking: Booking
}

export function BookingCard({ booking }: BookingCardProps) {
    const [isPending, startTransition] = useTransition()
    const [rejectReason, setRejectReason] = useState("")
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

    const handleAccept = () => {
        startTransition(async () => {
            const res = await acceptBookingAction(booking.id)
            if (res.success) {
                toast.success("Booking berhasil diterima")
            } else {
                toast.error("Gagal menerima booking")
            }
        })
    }

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error("Mohon isi alasan penolakan")
            return
        }
        startTransition(async () => {
            const res = await rejectBookingAction(booking.id, rejectReason)
            if (res.success) {
                toast.success("Booking berhasil ditolak")
                setIsRejectDialogOpen(false)
            } else {
                toast.error("Gagal menolak booking")
            }
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return <Badge className="bg-green-500 hover:bg-green-600">Diterima</Badge>
            case "rejected":
                return <Badge variant="destructive">Ditolak</Badge>
            case "completed":
                return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Selesai</Badge>
            case "cancelled":
                return <Badge variant="outline" className="text-muted-foreground">Dibatalkan</Badge>
            default:
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Menunggu</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "EEEE, dd MMMM yyyy", { locale: id })
    }

    return (
        <Card className="overflow-hidden border-border transition-all hover:shadow-md">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={booking.student.photo_url || ""} alt={booking.student.name} />
                        <AvatarFallback>{booking.student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-semibold text-sm leading-none">{booking.student.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{booking.course.category} • {booking.course.level}</p>
                    </div>
                </div>
                {getStatusBadge(booking.status)}
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <h5 className="font-medium text-sm line-clamp-1">{booking.course.title}</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(booking.booking_date)}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {booking.booking_time} ({booking.duration_minutes} mnt)
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {booking.class_type === "online" ? (
                            <>
                                <Video className="h-3.5 w-3.5 text-blue-500" />
                                <span>Online Meeting</span>
                            </>
                        ) : (
                            <>
                                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                                <span className="line-clamp-1">{booking.location?.address || "Lokasi Siswa"}</span>
                            </>
                        )}
                    </div>
                </div>

                {booking.notes && (
                    <div className="text-xs text-muted-foreground italic bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-900/20">
                        &quot;{booking.notes}&quot;
                    </div>
                )}
            </CardContent>

            {booking.status === "pending" && (
                <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-3">
                    <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20">
                                <XCircle className="h-4 w-4 mr-2" />
                                Tolak
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tolak Booking?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Berikan alasan penolakan untuk disampaikan kepada siswa.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="py-4">
                                <Textarea
                                    placeholder="Contoh: Maaf, saya berhalangan di jam tersebut..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleReject} className="bg-destructive hover:bg-destructive/90">
                                    Tolak Booking
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleAccept} disabled={isPending}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Terima
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}
