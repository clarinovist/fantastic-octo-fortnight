"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/helpers"
import type { BookingDetail } from "@/utils/types/booking"
import {
  AtSign,
  Clock,
  Instagram,
  Lock,
  MapPin,
  Phone,
  Radio,
  ShieldAlert,
  TicketIcon as Tiktok,
  User,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"
<<<<<<< HEAD
import { BookingCourseAcceptAction } from "./booking-course-accept-action"
import { BookingCourseRejectAction } from "./booking-course-reject-action"
=======
>>>>>>> 1a19ced (chore: update service folders from local)
import { ReportDialog } from "./booking-report"

type BookingCourseDetailProps = {
  isReportable?: boolean
  isShowStatus?: boolean
<<<<<<< HEAD
  isAcceptable?: boolean
  isRejectable?: boolean
=======
>>>>>>> 1a19ced (chore: update service folders from local)
  booking?: BookingDetail | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  loading?: boolean
}

export function BookingCourseDetail({
  booking,
  isReportable,
  isShowStatus,
<<<<<<< HEAD
  isAcceptable,
  isRejectable,
=======
>>>>>>> 1a19ced (chore: update service folders from local)
  open,
  onOpenChange,
  loading,
}: BookingCourseDetailProps) {
  // Format time
  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5) // Get HH:MM from HH:MM:SS
  }

  const isOnline = booking?.classType.toLowerCase() === "online"

  // Add state for report dialog
  const [reportOpen, setReportOpen] = useState(false)

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">Loading booking detail...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // container
          "md:max-w-fit max-h-full overflow-auto p-0 gap-0 w-full",
          "rounded-xl"
        )}
      >
        {/* Header spacing only for semantics (title hidden since custom layout) */}
        <DialogHeader className="sr-only">
          <DialogTitle>Course Detail</DialogTitle>
        </DialogHeader>

        <div className="flex gap-0 md:flex-row flex-col">
          {/* Left panel: Tutor Card */}
          <aside className="p-4 bg-white h-full">
            <div className="rounded-xl border bg-card shadow-md p-4 sm:p-6 md:p-8">
              <div className="mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Tutor</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative h-32 w-32 sm:h-48 sm:w-48 overflow-hidden rounded-xl">
                  {booking.tutor.photoProfile ? (
                    <Image
                      src={booking.tutor.photoProfile}
                      alt="Tutor portrait"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <User className="w-20 h-20 text-gray-400" />
                  )}
                </div>

                <div className="mt-4 sm:mt-6 w-full space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Nama</p>
                  <p className="text-lg sm:text-xl font-semibold">{booking.tutor.name}</p>
                </div>

                {/* Meta grid */}
                <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4 w-full text-left">
                  <Meta label="Gender" value={booking.tutor?.gender} />
                  <Meta label="Tanggal Lahir" value={booking.tutor?.dateOfBirth} />
                </div>

                <div className="mt-4 sm:mt-6 w-full space-y-3 sm:space-y-4">
                  <SecureRow
                    icon={<AtSign className="h-4 w-4" />}
                    label="Email"
                    value={booking.tutor.email}
                  />
                  <SecureRow
                    icon={<Phone className="h-4 w-4" />}
                    label="Nomor Handphone"
                    value={booking.tutor?.phoneNumber}
                  />

                  <div className="pt-1 sm:pt-2">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                      Social Media
                    </p>
                    <div className="space-y-2 sm:space-y-3">
                      {booking.tutor.socialMediaLink?.tiktok && (
                        <SecureInline
                          icon={<Tiktok className="h-4 w-4" />}
                          value={booking.tutor.socialMediaLink?.tiktok}
                        />
                      )}
                      {booking.tutor.socialMediaLink?.instagram && (
                        <SecureInline
                          icon={<Instagram className="h-4 w-4" />}
                          value={booking.tutor.socialMediaLink.instagram}
                        />
                      )}
                      {booking.tutor.socialMediaLink?.facebook && (
                        <SecureInline
                          icon={<User className="h-4 w-4" />}
                          value="facebook.com/**********"
                        />
                      )}
                      {booking.tutor.socialMediaLink?.twitter && (
                        <SecureInline
                          icon={<AtSign className="h-4 w-4" />}
                          value="twitter.com/**********"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right panel: Detail */}
          <main className="p-4 md:min-w-xl w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <Badge
                className={cn("px-2 py-1 sm:px-3 rounded-full bg-main text-white")}
                variant="secondary"
              >
                <span className="inline-flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5" />
                  {booking.classType.toUpperCase()}
                </span>
              </Badge>
            </div>

            <h1 className="mt-4 sm:mt-5 text-2xl sm:text-3xl md:text-4xl font-semibold text-balance">
              {booking.course.title}
            </h1>

            <div className="mt-6 sm:mt-8 space-y-2">
              <div className="text-xl sm:text-2xl md:text-3xl font-semibold">
                {formatDate(booking.bookingDate)}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatTime(booking?.bookingTime)} {booking.timezone}
                </span>
                <Badge className="bg-main text-white">1 Jam</Badge>
              </div>
            </div>

            <section className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
              {!isOnline && booking.latitude && booking.longitude && (
                <div className="space-y-1 sm:space-y-2">
                  <p className="font-semibold">Permintaan Lokasi</p>
                  <a
                    href={`https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand underline decoration-from-font underline-offset-4"
                  >
                    <MapPin className="h-4 w-4" />
                    Lihat lokasi di Google Maps
                  </a>
                </div>
              )}

              {booking.notesTutor && (
                <NoteBlock title="Catatan untuk tutor">{booking.notesTutor}</NoteBlock>
              )}

              {booking.notesStudent && (
                <NoteBlock title="Catatan untuk murid">{booking.notesStudent}</NoteBlock>
              )}
            </section>

            {/* Footer */}
            {(isReportable || isShowStatus) && (
              <div className="flex justify-between">
                {isReportable && (
                  <>
                    <button
                      type="button"
                      className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-destructive text-xs sm:text-sm"
                      aria-label="Report"
                      onClick={() => setReportOpen(true)}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Report
                    </button>
                    <ReportDialog
                      open={reportOpen}
                      onOpenChange={setReportOpen}
                      bookingId={booking.id}
                    />
                  </>
                )}
                {isShowStatus && (
                  <div className="mt-8 sm:mt-10 flex items-center justify-end gap-2 sm:gap-4 ml-auto">
                    <Badge className="bg-main text-white uppercase">{booking.status}</Badge>
                  </div>
                )}
              </div>
            )}
<<<<<<< HEAD
            {(isRejectable || isAcceptable) && (
              <div className="flex gap-4 mt-12 justify-end">
                {isRejectable && booking?.id && (
                  <BookingCourseRejectAction bookingId={booking.id} />
                )}
                {isAcceptable && booking?.id && (
                  <BookingCourseAcceptAction bookingId={booking.id} />
                )}
              </div>
            )}
=======
>>>>>>> 1a19ced (chore: update service folders from local)
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* Helpers */

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function SecureRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-medium">{value}</span>
        </span>
        <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
    </div>
  )
}

function SecureInline({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <span>{value}</span>
      </span>
      <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
    </div>
  )
}

function NoteBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[4px,1fr] gap-4">
      <div className="rounded-full bg-brand/80" />
      <div className="space-y-2">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
