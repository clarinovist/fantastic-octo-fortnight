"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useUserProfile } from "@/context/user-profile"
import { clientFetchRaw } from "@/services/client"
import { calculateDistance } from "@/utils/distance-calculator"
import type { Booking, CourseDetail, LocationBooking } from "@/utils/types"
import { APIProvider } from "@vis.gl/react-google-maps"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { BookingSummary } from "./booking-summary"
import { LimitBookingDialog } from "./limit-booking-dialog"
import { LocationMapContent } from "./location-map-content"

type BookingCourseProps = {
  detail: CourseDetail
  apiKey: string
  availableDates?: {
    [dateTime: string]: { status: boolean; classType: "online" | "offline" | "all" }
  }
}

interface BookingPayload {
  bookingDate: string
  bookingTime: string
  classType: "online" | "offline" | "all"
  courseID: string
  latitude: number
  longitude: number
  notes: string
}

<<<<<<< HEAD
// Minimum days in advance required for booking (H days)
// Configurable via NEXT_PUBLIC_MINIMUM_BOOKING_DAYS environment variable
const MINIMUM_BOOKING_DAYS = parseInt(process.env.NEXT_PUBLIC_MINIMUM_BOOKING_DAYS || "1", 10)

=======
>>>>>>> 1a19ced (chore: update service folders from local)
// Helper function to generate dates array with booking consideration
function generateDatesWithBookings(
  course: CourseDetail,
  availableDates?: {
    [dateTime: string]: { status: boolean; classType: "online" | "offline" | "all" }
  },
  selectedTab: "online" | "offline" = "online"
) {
  const locale = "id-ID"
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "short" })
  const monthFmt = new Intl.DateTimeFormat(locale, { month: "short" })

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(0, 0, 0, 0)
  end.setDate(end.getDate() + 13) // two weeks ahead

  const out: {
    day: string
    date: string
    month: string
    shortMonth: string
    isAvailable: boolean
    fullDate: string
  }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

<<<<<<< HEAD
  // Calculate minimum booking date (today + H days)
  const minBookingDate = new Date(today)
  minBookingDate.setDate(minBookingDate.getDate() + MINIMUM_BOOKING_DAYS)

=======
>>>>>>> 1a19ced (chore: update service folders from local)
  // Get schedules based on selected tab or tutor's classType
  const currentSchedules = (() => {
    if (course.tutor.classType === "all") {
      return selectedTab === "online"
        ? course.courseSchedulesOnline || {}
        : course.courseSchedulesOffline || {}
    } else if (course.tutor.classType === "online") {
      return course.courseSchedulesOnline || {}
    } else {
      return course.courseSchedulesOffline || {}
    }
  })()

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const current = new Date(d)
    // Fix timezone issue by formatting date manually instead of using toISOString
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, "0")
    const day = String(current.getDate()).padStart(2, "0")
    const fullDate = `${year}-${month}-${day}`

<<<<<<< HEAD
    // Check if date is in the past or within minimum booking days
    const isPastDate = current.getTime() < today.getTime()
    const isWithinMinimumDays = current.getTime() < minBookingDate.getTime()
=======
    // Check if date is in the past
    const isPastDate = current.getTime() < today.getTime()
>>>>>>> 1a19ced (chore: update service folders from local)

    // Check if there are available time slots for this date
    let hasAvailableSlots = false
    if (!isPastDate && availableDates) {
      // Map JS getDay() (0 = Sunday, 1 = Monday, ...) to schedule keys
      const dayKey = String(current.getDay() === 0 ? 7 : current.getDay())
      const schedules = currentSchedules[dayKey] || []

      if (schedules.length > 0) {
        // Check if any time slots for this date are available in availableDates
        hasAvailableSlots = schedules.some((schedule: any) => {
          const dateTimeKey = `${fullDate} ${schedule.startTime}`
          const availableSlot = availableDates[dateTimeKey]
          // Available if slot exists and status is true, and classType matches selected tab or is "all"
          return (
            availableSlot &&
            availableSlot.status &&
            (availableSlot.classType === selectedTab || availableSlot.classType === "all")
          )
        })
      }
    }

    out.push({
      day: dayFmt.format(current), // e.g. "Sen"
      date: String(current.getDate()), // e.g. "20"
      month: monthFmt.format(current), // e.g. "Agu"
      shortMonth: monthFmt.format(current), // e.g. "Agu"
<<<<<<< HEAD
      isAvailable: !isPastDate && !isWithinMinimumDays && hasAvailableSlots,
=======
      isAvailable: !isPastDate && hasAvailableSlots,
>>>>>>> 1a19ced (chore: update service folders from local)
      fullDate: fullDate, // e.g. "2024-09-08"
    })
  }
  return out
}

export function BookingCourse(props: BookingCourseProps) {
  const { detail, availableDates } = props
  const user = useUserProfile()
  const searchParams = useSearchParams()

  // Initialize with URL params or defaults
  const [selectedTab, setSelectedTab] = useState<"online" | "offline">(() => {
    // Check URL params first
    const urlType = searchParams.get("type") as "online" | "offline" | null
    if (urlType && (urlType === "online" || urlType === "offline")) {
      return urlType
    }

    // If tutor only supports one type, use that, otherwise default to online
    if (detail.tutor.classType === "online") return "online"
    if (detail.tutor.classType === "offline") return "offline"
    return "online"
  })

  // Generate dates using useMemo to recalculate when selectedTab or availableDates change
  const dateOptions = useMemo(() => {
    return generateDatesWithBookings(detail, availableDates, selectedTab)
  }, [detail, availableDates, selectedTab])

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const urlDate = searchParams.get("date")
    if (urlDate) return urlDate

    // Find first available date
    const firstAvailable = dateOptions.find(d => d.isAvailable)
    return firstAvailable?.fullDate || null
  })

  const [selectedTime, setSelectedTime] = useState<string | null>(() => {
    return searchParams.get("time") || null
  })

  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(() => {
    return searchParams.get("timezone") || null
  })

  const [studentLocation, setStudentLocation] = useState<LocationBooking | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [notes, setNotes] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [bookingExists, setBookingExists] = useState<Booking | null>(null)
  const [errorData, setErrorData] = useState<{
    title: string | null
    message: string | null
    expiredAt?: string | null
  } | null>(null)

  const isSelected = (date: string) => selectedDate === date

  // Initialize with profile location if available - fix infinite loop
  useEffect(() => {
    if (user?.profile?.latitude && user?.profile?.longitude && !studentLocation) {
      setStudentLocation({
        lat: user.profile.latitude,
        lng: user.profile.longitude,
        address: user.profile.location?.fullName,
      })
    }
<<<<<<< HEAD
  }, [user?.profile?.latitude, user?.profile?.longitude, user?.profile?.location?.fullName])
=======
  }, [user?.profile?.latitude, user?.profile?.longitude, user?.profile?.location?.fullName, studentLocation])
>>>>>>> 1a19ced (chore: update service folders from local)

  const currentSchedules = useMemo(() => {
    if (detail.tutor.classType === "all") {
      return selectedTab === "online"
        ? detail.courseSchedulesOnline || {}
        : detail.courseSchedulesOffline || {}
    } else if (detail.tutor.classType === "online") {
      return detail.courseSchedulesOnline || {}
    } else {
      return detail.courseSchedulesOffline || {}
    }
  }, [
    detail.courseSchedulesOnline,
    detail.courseSchedulesOffline,
    detail.tutor.classType,
    selectedTab,
  ])

  // Auto-select first available time when date or tab changes (only if not already set from URL)
  useEffect(() => {
    if (selectedDate && !selectedTime) {
      const dateObj = new Date(selectedDate)
      const dayKey = String(dateObj.getDay() === 0 ? 7 : dateObj.getDay())
      const schedules = currentSchedules[dayKey] || []

      if (schedules.length > 0) {
        // Filter to available times only
        const availableSchedules = schedules.filter((schedule: any) => {
          if (!availableDates) return false
          const dateTimeKey = `${selectedDate} ${schedule.startTime}`
          const availableSlot = availableDates[dateTimeKey]
          // Available if slot exists and status is true, and classType matches selected tab or is "all"
          return (
            availableSlot &&
            availableSlot.status &&
            (availableSlot.classType === selectedTab || availableSlot.classType === "all")
          )
        })

        if (availableSchedules.length > 0) {
          const firstSchedule = availableSchedules[0]
          const time = firstSchedule.startTime.slice(0, 5)
          setSelectedTime(time)
          setSelectedTimezone(firstSchedule.timezone)
        } else {
          setSelectedTime(null)
          setSelectedTimezone(null)
        }
      }
    }
  }, [selectedDate, currentSchedules, selectedTime, availableDates, selectedTab])

  // Reset selected date when tab changes if current date becomes unavailable
  useEffect(() => {
    if (selectedDate) {
      const currentDateOption = dateOptions.find(d => d.fullDate === selectedDate)
      if (!currentDateOption?.isAvailable) {
        const firstAvailable = dateOptions.find(d => d.isAvailable)
        setSelectedDate(firstAvailable?.fullDate || null)
        setSelectedTime(null)
        setSelectedTimezone(null)
      }
    }
  }, [selectedTab, dateOptions, selectedDate])

  const onSelect = useCallback((date: string) => {
    setSelectedDate(date)
    // Reset time selection when date changes
    setSelectedTime(null)
    setSelectedTimezone(null)
  }, [])

  const distance = useMemo(() => {
    if (studentLocation && detail.tutor.latitude && detail.tutor.longitude) {
      return calculateDistance(
        studentLocation.lat,
        studentLocation.lng,
        detail.tutor.latitude,
        detail.tutor.longitude
      )
    }
    return null
  }, [studentLocation, detail.tutor.latitude, detail.tutor.longitude])

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setStudentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsGettingLocation(false)
        },
        error => {
          console.error("Error getting location:", error)
          setIsGettingLocation(false)
          // Fallback to profile location if available
          if (user?.profile?.latitude && user?.profile?.longitude) {
            setStudentLocation({
              lat: user.profile.latitude,
              lng: user.profile.longitude,
              address: user.profile.location?.fullName,
            })
          }
        }
      )
    } else {
      setIsGettingLocation(false)
      // Fallback to profile location if available
      if (user?.profile?.latitude && user?.profile?.longitude) {
        setStudentLocation({
          lat: user.profile.latitude,
          lng: user.profile.longitude,
          address: user.profile.location?.fullName,
        })
      }
    }
  }, [user])
  // Handle booking submission
  const handleBooking = useCallback(async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time")
      return
    }

    // For offline classes, location is required
    if (selectedTab === "offline" && !studentLocation) {
      toast.error("Please select your location for offline classes")
      return
    }

    setIsBooking(true)

    try {
      const bookingPayload: BookingPayload = {
        bookingDate: selectedDate,
        bookingTime: selectedTime ? `${selectedTime}:00` : "",
        classType:
          detail.tutor.classType === "all"
            ? selectedTab
            : (detail.tutor.classType as "online" | "offline"),
        courseID: detail.id,
        latitude: studentLocation?.lat || 0,
        longitude: studentLocation?.lng || 0,
        notes: notes.trim(),
      }

      const resp = await clientFetchRaw<{
        message: string
        success: boolean
        code?: number
        error?: string
        metadata: { booking: Booking }
      }>("/api/v1/students/booking", {
        method: "POST",
        body: JSON.stringify(bookingPayload),
      })
      if (!resp.success) {
        // Check if the error code indicates a booking limit issue
        if (resp.metadata?.booking) {
          setErrorData({
            title: resp?.error ?? "Oooops",
            message: resp?.message ?? "Something went wrong",
            expiredAt: resp.metadata.booking.expiredAt || null,
          })
          setBookingExists(resp.metadata.booking)
          setShowLimitDialog(true)
        } else {
          toast.error(resp.message)
        }
        return
      }
      window.location.href = `${window.location.origin}/account`
    } catch (error) {
      console.log(error)
      toast.error("Failed to book course")
    } finally {
      setIsBooking(false)
    }
  }, [
    selectedDate,
    selectedTime,
    selectedTab,
    detail.tutor.classType,
    detail.id,
    studentLocation,
    notes,
  ])

  const renderScheduleContent = () => (
    <>
      <div className="grid grid-cols-7">
        {dateOptions.map(date => (
          <div
            key={date.fullDate}
<<<<<<< HEAD
            className={`flex flex-col items-center p-2 m-1 lg:p-3 rounded-lg transition-colors min-w-[50px] lg:min-w-[80px] ${
              !date.isAvailable
=======
            className={`flex flex-col items-center p-2 m-1 lg:p-3 rounded-lg transition-colors min-w-[50px] lg:min-w-[80px] ${!date.isAvailable
>>>>>>> 1a19ced (chore: update service folders from local)
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : isSelected(date.fullDate)
                  ? "bg-[#7000FE] text-white"
                  : "hover:bg-[#7000FE80]/50 cursor-pointer"
<<<<<<< HEAD
            }`}
=======
              }`}
>>>>>>> 1a19ced (chore: update service folders from local)
            onClick={() => date.isAvailable && onSelect(date.fullDate)}
          >
            <div className="text-xs">{date.day}</div>
            <div className="text-xl lg:text-2xl font-bold">{date.date}</div>
            <div className="text-xs hidden md:block">{date.month}</div>
            <div className="text-xs md:hidden">{date.shortMonth}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center space-x-3">
        {(() => {
          if (!selectedDate) {
            return null
          }

          // Map JS getDay() (0 = Sunday, 1 = Monday, ...) to schedule keys that use 1 = Monday, 2 = Tuesday, ... (Sunday -> 7)
          const dateObj = new Date(selectedDate)
          const dayKey = String(dateObj.getDay() === 0 ? 7 : dateObj.getDay())
          const schedules = currentSchedules[dayKey] || []

          if (!schedules.length) {
            return <div className="text-sm text-muted-foreground">No times available</div>
          }

          // Show all schedules (available and unavailable)
          return schedules.map((s: any, index: number) => {
            const start = s.startTime.slice(0, 5)
            const isSelectedTime = selectedTime === start

            // Check if this time slot is available
            const dateTimeKey = `${selectedDate} ${s.startTime}`
            const availableSlot = availableDates?.[dateTimeKey]
            const isAvailable =
              availableSlot &&
              availableSlot.status &&
              (availableSlot.classType === selectedTab || availableSlot.classType === "all")

            return (
              <span
                key={`${s.startTime}-${index}`}
<<<<<<< HEAD
                className={`px-3 lg:px-4 py-2 rounded-lg font-bold transition-colors min-w-[60px] lg:min-w-[80px] text-center ${
                  !isAvailable
=======
                className={`px-3 lg:px-4 py-2 rounded-lg font-bold transition-colors min-w-[60px] lg:min-w-[80px] text-center ${!isAvailable
>>>>>>> 1a19ced (chore: update service folders from local)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isSelectedTime
                      ? "bg-[#7000FE] text-white border border-[#7000FE] cursor-pointer"
                      : "border border-[#7000FE] text-[#7000FE] hover:bg-[#7000FE80]/50 cursor-pointer"
<<<<<<< HEAD
                }`}
=======
                  }`}
>>>>>>> 1a19ced (chore: update service folders from local)
                onClick={() => {
                  if (isAvailable) {
                    setSelectedTime(start)
                    setSelectedTimezone(s.timezone)
                  }
                }}
              >
                <div className="text-base">{start}</div>
              </span>
            )
          })
        })()}
        <span className="text-[20px] text-[#B4B4B4] font-extrabold ml-2">{selectedTimezone}</span>
      </div>
    </>
  )

  const renderLocationMap = () => {
    return (
      <APIProvider apiKey={props.apiKey} libraries={["places", "geocoding"]}>
        <LocationMapContent
          tutorLocation={{ lat: detail.tutor.latitude, lng: detail.tutor.longitude }}
          tutorLocationName={detail.tutor.location.fullName}
          studentLocation={studentLocation}
          setStudentLocation={setStudentLocation}
          distance={distance}
          getCurrentLocation={getCurrentLocation}
          isGettingLocation={isGettingLocation}
        />
        {distance && distance > 10 && (
          <div className="text-[#A70000] text-sm flex items-start gap-2 mt-2 max-w-md">
            <Icon name="info" fill="#A70000" className="size-4 mt-1" />
            <span className="leading-4 flex-1">
              Jarak lebih dari 10 km dari tutor, kemungkinan akan ada tambahan biaya akomodasi dari
              tutor
            </span>
          </div>
        )}
      </APIProvider>
    )
  }

  return (
    <div className="md:p-8 px-0 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl mt-8 font-bold">{detail.title}</h1>
        <div className="flex gap-4 max-w-md text-sm">
          <Icon name="warning-triangle" fill="#EEB600" />
          <p>
            pemesanan bersifat permintaan kepada tutor, tunggu paling lambat 1 x 24 jam untuk respon
            tercepat
          </p>
        </div>
<<<<<<< HEAD
        {MINIMUM_BOOKING_DAYS > 0 && (
          <div className="flex gap-4 max-w-md text-sm">
            <Icon name="info" fill="#0066CC" />
            <p>
              Pemesanan harus dilakukan minimal {MINIMUM_BOOKING_DAYS} hari sebelumnya
            </p>
          </div>
        )}
=======
>>>>>>> 1a19ced (chore: update service folders from local)
      </div>
      <div className="space-y-4">
        <h3 className="font-bold text-xl">Booking</h3>
        <div className="space-y-2">
          {detail.isFreeFirstCourse && <p className="font-bold">FIRST MEET AVAILABILITY</p>}
          {detail.tutor.classType === "all" && (
            <Tabs
              defaultValue={selectedTab}
              value={selectedTab}
              onValueChange={value => setSelectedTab(value as "online" | "offline")}
              className="w-fit p-1 rounded-full bg-white shadow-[0px_4px_8px_0px_rgba(0,_0,_0,_0.25)]"
            >
              <TabsList className="bg-white w-fit p-0">
                <TabsTrigger
                  value="online"
                  className="data-[state=active]:bg-[#006312] px-6 py-4 rounded-full font-bold data-[state=active]:text-white text-black"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M19.2807 2.77214C18.9903 2.79549 18.7128 2.90567 18.482 3.08922C18.2513 3.27277 18.0772 3.52175 17.9811 3.80576C17.8851 4.08977 17.8711 4.39653 17.941 4.68859C18.0109 4.98065 18.1616 5.24538 18.3747 5.45045C19.2087 6.31012 19.8699 7.3316 20.3204 8.45616C20.7709 9.58071 21.0017 10.7862 20.9996 12.0032C21.0012 13.2201 20.7701 14.4254 20.3196 15.5499C19.8692 16.6743 19.2083 17.6959 18.3747 18.5559C18.2299 18.6988 18.1141 18.8701 18.0343 19.0599C17.9545 19.2496 17.9122 19.4539 17.9099 19.6608C17.9076 19.8676 17.9453 20.0729 18.0209 20.2645C18.0965 20.456 18.2084 20.6301 18.35 20.7764C18.4916 20.9227 18.6601 21.0382 18.8456 21.1163C19.031 21.1944 19.2297 21.2333 19.43 21.231C19.6303 21.2286 19.8281 21.1849 20.0117 21.1024C20.1954 21.02 20.3613 20.9004 20.4996 20.7508C22.7412 18.4284 24 15.2827 24 12.0032C24 8.72368 22.7412 5.57797 20.4996 3.25553C20.3625 3.10583 20.1979 2.98587 20.0154 2.90269C19.8329 2.81951 19.6361 2.77478 19.4367 2.7711C19.3847 2.76901 19.3327 2.76901 19.2807 2.7711V2.77214ZM4.37533 2.80312C4.04292 2.84866 3.73487 3.00795 3.50037 3.25553C1.25876 5.57797 0 8.72368 0 12.0032C0 15.2827 1.25876 18.4284 3.50037 20.7508C3.6387 20.9004 3.80457 21.02 3.98825 21.1024C4.17194 21.1849 4.36972 21.2286 4.56999 21.231C4.77025 21.2333 4.96896 21.1944 5.15443 21.1163C5.3399 21.0382 5.5084 20.9227 5.65002 20.7764C5.79164 20.6301 5.90352 20.456 5.9791 20.2645C6.05468 20.0729 6.09242 19.8676 6.09012 19.6608C6.08781 19.4539 6.04551 19.2496 5.96568 19.0599C5.88585 18.8701 5.77012 18.6988 5.62528 18.5559C4.7913 17.6962 4.13007 16.6747 3.67959 15.5502C3.22912 14.4256 2.9983 13.2202 3.0004 12.0032C2.99884 10.7862 3.22992 9.58096 3.68036 8.45648C4.1308 7.33201 4.79175 6.31046 5.62528 5.45045C5.85202 5.223 6.00341 4.92737 6.05783 4.60576C6.11226 4.28416 6.06694 3.95301 5.92835 3.65959C5.78975 3.36617 5.56497 3.12548 5.28608 2.97185C5.00718 2.81823 4.68844 2.75851 4.37533 2.80312ZM8.18817 6.22512C7.85929 6.26165 7.55133 6.40945 7.31221 6.64552C6.58585 7.32214 6.00484 8.14849 5.60664 9.07129C5.20844 9.9941 5.00189 10.9929 5.00031 12.0032C5.00031 14.1186 5.87027 16.0418 7.28121 17.3619C7.42697 17.4996 7.59757 17.6063 7.78326 17.676C7.96896 17.7456 8.16612 17.7768 8.36348 17.7677C8.56084 17.7587 8.75454 17.7096 8.93353 17.6232C9.11251 17.5368 9.27326 17.4148 9.40661 17.2643C9.53996 17.1137 9.6433 16.9375 9.71072 16.7457C9.77814 16.5538 9.80833 16.3502 9.79955 16.1463C9.79078 15.9425 9.74321 15.7424 9.65958 15.5575C9.57595 15.3726 9.45788 15.2066 9.31212 15.0688C8.89724 14.6817 8.56598 14.2086 8.33993 13.6804C8.11388 13.1522 7.99812 12.5807 8.00017 12.0032C7.9981 11.4254 8.11396 10.8537 8.34019 10.3253C8.56641 9.79686 8.89793 9.32365 9.31312 8.93649C9.55275 8.72115 9.72002 8.43278 9.79083 8.11295C9.86163 7.79311 9.83232 7.45831 9.7071 7.15679C9.58189 6.85527 9.36724 6.60259 9.09409 6.43515C8.82094 6.26772 8.50438 6.19418 8.18817 6.22512ZM15.5938 6.22512C15.2964 6.24206 15.0105 6.35013 14.7727 6.53553C14.535 6.72093 14.356 6.97528 14.2587 7.26614C14.1614 7.55701 14.1502 7.87121 14.2264 8.16869C14.3027 8.46618 14.463 8.73347 14.6869 8.93649C15.1021 9.32365 15.4336 9.79686 15.6598 10.3253C15.886 10.8537 16.0019 11.4254 15.9998 12.0032C16.0019 12.5809 15.886 13.1527 15.6598 13.6811C15.4336 14.2095 15.1021 14.6827 14.6869 15.0699C14.5198 15.1988 14.3805 15.3623 14.278 15.55C14.1755 15.7377 14.1121 15.9454 14.0917 16.1598C14.0713 16.3742 14.0944 16.5907 14.1596 16.7954C14.2248 17.0001 14.3306 17.1884 14.4703 17.3485C14.6099 17.5086 14.7804 17.6368 14.9707 17.7249C15.161 17.8131 15.3671 17.8593 15.5757 17.8605C15.7843 17.8618 15.9908 17.8181 16.1821 17.7322C16.3735 17.6464 16.5453 17.5202 16.6868 17.3619C17.4135 16.6852 17.9947 15.8587 18.3931 14.9357C18.7915 14.0127 18.9981 13.0137 18.9997 12.0032C19.0034 10.9949 18.8023 9.99698 18.4094 9.07395C18.0166 8.15092 17.4406 7.32328 16.7188 6.64448C16.5692 6.49862 16.3921 6.38612 16.1985 6.31398C16.005 6.24184 15.7992 6.21159 15.5938 6.22512ZM12 10.1316C11.6417 10.1318 11.2915 10.2417 10.9936 10.4475C10.6958 10.6533 10.4637 10.9456 10.3267 11.2877C10.1897 11.6297 10.154 12.006 10.224 12.3689C10.294 12.7319 10.4667 13.0653 10.7201 13.327C10.9736 13.5886 11.2964 13.7668 11.6479 13.8389C11.9993 13.911 12.3636 13.8739 12.6946 13.7322C13.0256 13.5905 13.3086 13.3506 13.5076 13.0429C13.7067 12.7351 13.8129 12.3733 13.8129 12.0032C13.8133 11.7571 13.7667 11.5134 13.6757 11.2861C13.5848 11.0587 13.4512 10.8521 13.2828 10.6781C13.1144 10.5041 12.9144 10.3662 12.6942 10.2722C12.4741 10.1783 12.2382 10.1311 12 10.1316Z"
                      fill={selectedTab === "online" ? "white" : "black"}
                    />
                  </svg>
                  ONLINE
                </TabsTrigger>
                <TabsTrigger
                  value="offline"
                  className="data-[state=active]:bg-[#006312] px-6 py-4 rounded-full font-bold data-[state=active]:text-white text-black"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.6236 23.6737C10.6236 23.6737 2 16.4825 2 9.40646C2 6.91171 3.00089 4.51914 4.78249 2.75509C6.56408 0.991035 8.98044 0 11.5 0C14.0196 0 16.4359 0.991035 18.2175 2.75509C19.9991 4.51914 21 6.91171 21 9.40646C21 16.4825 12.3764 23.6737 12.3764 23.6737C11.8966 24.1111 11.1069 24.1064 10.6236 23.6737ZM11.5 13.5218C12.0458 13.5218 12.5863 13.4153 13.0905 13.2085C13.5948 13.0017 14.053 12.6986 14.4389 12.3164C14.8249 11.9343 15.131 11.4806 15.3399 10.9813C15.5487 10.482 15.6562 9.94689 15.6562 9.40646C15.6562 8.86603 15.5487 8.33089 15.3399 7.83159C15.131 7.3323 14.8249 6.87863 14.4389 6.49649C14.053 6.11434 13.5948 5.81121 13.0905 5.60439C12.5863 5.39758 12.0458 5.29113 11.5 5.29113C10.3977 5.29113 9.34054 5.72471 8.56109 6.49649C7.78164 7.26826 7.34375 8.31501 7.34375 9.40646C7.34375 10.4979 7.78164 11.5447 8.56109 12.3164C9.34054 13.0882 10.3977 13.5218 11.5 13.5218Z"
                      fill={selectedTab === "offline" ? "white" : "black"}
                    />
                  </svg>
                  OFFLINE
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        {detail.tutor.classType === "all" ? (
          <div>
            <div style={{ display: selectedTab === "online" ? "block" : "none" }}>
              {renderScheduleContent()}
            </div>
            <div style={{ display: selectedTab === "offline" ? "block" : "none" }}>
              {renderScheduleContent()}
              {renderLocationMap()}
            </div>
          </div>
        ) : (
          <div>
            {renderScheduleContent()}
            {detail.tutor.classType === "offline" && renderLocationMap()}
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="notes" className="font-bold mb-4">
          NOTE FOR TUTOR
        </Label>
        <Textarea
          id="notes"
          rows={10}
          maxLength={150}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="min-h-32 max-w-xl border-main focus-visible:ring-main focus-visible:border-main focus-visible:ring-0"
          placeholder="Add any special notes for your tutor..."
        />
      </div>
      {selectedDate && selectedTime && selectedTimezone && (
        <div className="space-y-4">
          <h3 className="uppercase">Booking Summary</h3>
          <BookingSummary
            classType={selectedTab}
            date={selectedDate}
            time={selectedTime}
            timezone={selectedTimezone}
            notes={notes}
          />
        </div>
      )}
      <div>
        <Button
          size="lg"
          className="font-extrabold bg-main hover:bg-main/50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime || isBooking || detail.isBooked}
        >
          {isBooking ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              BOOKING...
            </div>
          ) : (
            "BOOK!"
          )}
        </Button>
      </div>
      <LimitBookingDialog
        open={showLimitDialog}
        onOpenChange={setShowLimitDialog}
        booking={bookingExists}
        title={errorData?.title ?? "Oooops"}
        description={errorData?.message ?? "Something went wrong"}
      />
    </div>
  )
}
