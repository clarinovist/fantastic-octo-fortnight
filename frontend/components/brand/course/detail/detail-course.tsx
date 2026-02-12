"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useUserProfile } from "@/context/user-profile"
import type { Course, CourseDetail } from "@/utils/types"
import { Star } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { CourseRecommendation } from "../course-recommendation"
import { DetailCourseDescription } from "./detail-course-description"
import { DetailCoursePricing } from "./detail-course-pricing"
import { DetailCourseReview } from "./detail-course-review"
import { DetailCourseSchedule } from "./detail-course-schedule"
import { DetailCourseTutor } from "./detail-course-tutor"

type DetailCourseProps = {
  isBookable?: boolean
  course: CourseDetail
  recommendations: Promise<{ data: Course[] }>
  availableDates?: {
    [dateTime: string]: { status: boolean; classType: "online" | "offline" | "all" }
  }
}

// Minimum days in advance required for booking (H days)
// Configurable via NEXT_PUBLIC_MINIMUM_BOOKING_DAYS environment variable
const MINIMUM_BOOKING_DAYS = parseInt(process.env.NEXT_PUBLIC_MINIMUM_BOOKING_DAYS || "1", 10)

// Helper function to generate dates array
function generateDates(
  course: CourseDetail,
  availableDates?: {
    [dateTime: string]: { status: boolean; classType: "online" | "offline" | "all" }
  },
  selectedTab: "online" | "offline" = "online"
) {
  const locale = "id-ID"
  const dayFmt = new Intl.DateTimeFormat(locale, { weekday: "long" })
  const monthFmt = new Intl.DateTimeFormat(locale, { month: "long" })

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(0, 0, 0, 0)
  end.setDate(end.getDate() + 13) // two weeks ahead

  const out: {
    day: string
    date: string
    month: string
    isAvailable: boolean
    fullDate: string
  }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Calculate minimum booking date (today + H days)
  const minBookingDate = new Date(today)
  minBookingDate.setDate(minBookingDate.getDate() + MINIMUM_BOOKING_DAYS)

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

    // Check if date is in the past or within minimum booking days
    const isPastDate = current.getTime() < today.getTime()
    const isWithinMinimumDays = current.getTime() < minBookingDate.getTime()

    // Check if any time slots are available for this date
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
      day: dayFmt.format(current), // e.g. "Senin"
      date: String(current.getDate()), // e.g. "20"
      month: monthFmt.format(current), // e.g. "Agustus"
      isAvailable: !isPastDate && !isWithinMinimumDays && hasAvailableSlots,
      fullDate: fullDate, // e.g. "2024-09-08"
    })
  }
  return out
}

export function DetailCourse({
  isBookable,
  course,
  recommendations,
  availableDates,
}: DetailCourseProps) {
  const user = useUserProfile()

  // State for selected schedule
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<"online" | "offline">("online")

  // Generate dates using useMemo to ensure they're available on first render
  const dateOptions = useMemo(() => {
    return generateDates(course, availableDates, selectedTab)
  }, [course, availableDates, selectedTab])

  // Handle schedule changes from DetailCourseSchedule
  const handleScheduleChange = (
    date: string | null,
    time: string | null,
    timezone: string | null,
    tab?: "online" | "offline"
  ) => {
    setSelectedDate(date)
    setSelectedTime(time)
    setSelectedTimezone(timezone)
    if (tab) {
      setSelectedTab(tab)
    }
  }

  // Generate booking URL with query parameters
  const getBookingUrl = () => {
    const baseUrl = `${course.id}/booking`

    if (!selectedDate || !selectedTime) {
      return baseUrl
    }

    const params = new URLSearchParams()
    params.set("date", selectedDate)
    params.set("time", selectedTime)
    if (selectedTimezone) {
      params.set("timezone", selectedTimezone)
    }
    // Add course type to query params
    if (course.tutor.classType === "all") {
      params.set("type", selectedTab)
    } else {
      params.set("type", course.tutor.classType)
    }

    return `${baseUrl}?${params.toString()}`
  }

  const TutorAbout = () => (
    <>
      {course.tutor.description && (
        <div>
          <h3 className="text-lg font-bold mb-4">TENTANG TUTOR</h3>
          <p className="text-sm leading-relaxed text-pretty">{course.tutor.description}</p>
        </div>
      )}
    </>
  )

  const StatsInfo = () => (
    <div className="flex items-center justify-center text-sm text-muted-foreground">
      <span className="text-[#8E8E8E] font-bold">{course.totalStudentEnrollment} murid</span>
      <div className="h-5 border-l border-muted-foreground mx-3" aria-hidden="true" />
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span>{course.tutor.rating}</span>
        <span className="text-muted-foreground">({course.tutor.totalRating} ulasan)</span>
      </div>
    </div>
  )

  const ButtonBook = ({ isMobile }: { isMobile?: boolean }) => {
    if (user?.profile?.role && user?.profile?.role !== "student") return null
    return (
      <div
        className={`${isMobile ? "fixed z-10 bg-white rounded-full bottom-4 left-4 right-4 p-4 lg:hidden shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.25)]" : "flex justify-center"}`}
      >
        <Link href={getBookingUrl()}>
          <Button
            size={`${isMobile ? "lg" : "sm"}`}
            className={`${isMobile ? "w-full bg-[#7000FE] hover:bg-[#7000FE]/90 text-white font-extrabold text-[24px] rounded-full" : "w-48 font-extrabold bg-[#7000FE] hover:bg-[#7000FE]/90 text-white"}`}
          >
            BOOK!
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="md:px-4 px-0">
      <div className="xl:pr-8 pt-8 pb-28 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Profile Card - Only visible on mobile */}
          <div className="lg:hidden">
            <Card className="overflow-hidden pt-0 shadow-[0px_8px_12px_0px_#00000026]">
              <CardContent className="p-6 space-y-4 pt-0">
                <DetailCourseTutor variant="mobile" course={course} />
                <StatsInfo />
                <DetailCoursePricing variant="mobile" course={course} />
              </CardContent>
            </Card>
          </div>

          {/* Desktop Sidebar - Only visible on desktop */}
          <div className="hidden lg:block lg:w-[320px] xl:w-[360px] lg:flex-shrink-0 space-y-4 sticky top-8 self-start">
            <Card className="shadow-[0px_8px_12px_0px_#00000026]">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col items-center gap-3">
                  <DetailCourseTutor variant="desktop" course={course} />
                </div>
                <StatsInfo />
                <DetailCoursePricing variant="desktop" course={course} />
                {isBookable && !course.isBooked && <ButtonBook />}
                <div className="flex justify-center">
                  <div className="bg-[#EDEDED] rounded-full flex gap-2 py-2 px-4 justify-center">
                    {/* Tiktok */}
                    <div className="cursor-pointer hover:opacity-70 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M12.1071 2.50667C11.4969 1.81291 11.1606 0.922133 11.1607 0H8.40179V11.0222C8.38095 11.6188 8.12814 12.1841 7.6967 12.5987C7.26526 13.0133 6.68893 13.2448 6.08929 13.2444C4.82143 13.2444 3.76786 12.2133 3.76786 10.9333C3.76786 9.40444 5.25 8.25778 6.77679 8.72889V5.92C3.69643 5.51111 1 7.89333 1 10.9333C1 13.8933 3.46429 16 6.08036 16C8.88393 16 11.1607 13.7333 11.1607 10.9333V5.34222C12.2795 6.14209 13.6226 6.57124 15 6.56889V3.82222C15 3.82222 13.3214 3.90222 12.1071 2.50667Z"
                          fill="#7000FE"
                        />
                      </svg>
                    </div>
                    {/* Instagram */}
                    <div className="cursor-pointer hover:opacity-70 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_581_14834)">
                          <path
                            d="M4.64 0H11.36C13.92 0 16 2.08 16 4.64V11.36C16 12.5906 15.5111 13.7708 14.641 14.641C13.7708 15.5111 12.5906 16 11.36 16H4.64C2.08 16 0 13.92 0 11.36V4.64C0 3.4094 0.488856 2.22919 1.35902 1.35902C2.22919 0.488856 3.4094 0 4.64 0ZM4.48 1.6C3.71618 1.6 2.98364 1.90343 2.44353 2.44353C1.90343 2.98364 1.6 3.71618 1.6 4.48V11.52C1.6 13.112 2.888 14.4 4.48 14.4H11.52C12.2838 14.4 13.0164 14.0966 13.5565 13.5565C14.0966 13.0164 14.4 12.2838 14.4 11.52V4.48C14.4 2.888 13.112 1.6 11.52 1.6H4.48ZM12.2 2.8C12.4652 2.8 12.7196 2.90536 12.9071 3.09289C13.0946 3.28043 13.2 3.53478 13.2 3.8C13.2 4.06522 13.0946 4.31957 12.9071 4.50711C12.7196 4.69464 12.4652 4.8 12.2 4.8C11.9348 4.8 11.6804 4.69464 11.4929 4.50711C11.3054 4.31957 11.2 4.06522 11.2 3.8C11.2 3.53478 11.3054 3.28043 11.4929 3.09289C11.6804 2.90536 11.9348 2.8 12.2 2.8ZM8 4C9.06087 4 10.0783 4.42143 10.8284 5.17157C11.5786 5.92172 12 6.93913 12 8C12 9.06087 11.5786 10.0783 10.8284 10.8284C10.0783 11.5786 9.06087 12 8 12C6.93913 12 5.92172 11.5786 5.17157 10.8284C4.42143 10.0783 4 9.06087 4 8C4 6.93913 4.42143 5.92172 5.17157 5.17157C5.92172 4.42143 6.93913 4 8 4ZM8 5.6C7.36348 5.6 6.75303 5.85286 6.30294 6.30294C5.85286 6.75303 5.6 7.36348 5.6 8C5.6 8.63652 5.85286 9.24697 6.30294 9.69706C6.75303 10.1471 7.36348 10.4 8 10.4C8.63652 10.4 9.24697 10.1471 9.69706 9.69706C10.1471 9.24697 10.4 8.63652 10.4 8C10.4 7.36348 10.1471 6.75303 9.69706 6.30294C9.24697 5.85286 8.63652 5.6 8 5.6Z"
                            fill="#7000FE"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_581_14834">
                            <rect width="16" height="16" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    {/* LinkedIn */}
                    <div className="cursor-pointer hover:opacity-70 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_581_14836)">
                          <path
                            d="M14.2222 0C14.6937 0 15.1459 0.187301 15.4793 0.520699C15.8127 0.854097 16 1.30628 16 1.77778V14.2222C16 14.6937 15.8127 15.1459 15.4793 15.4793C15.1459 15.8127 14.6937 16 14.2222 16H1.77778C1.30628 16 0.854097 15.8127 0.520699 15.4793C0.187301 15.1459 0 14.6937 0 14.2222V1.77778C0 1.30628 0.187301 0.854097 0.520699 0.520699C0.854097 0.187301 1.30628 0 1.77778 0H14.2222ZM13.7778 13.7778V9.06667C13.7778 8.29813 13.4725 7.56107 12.929 7.01763C12.3856 6.47419 11.6485 6.16889 10.88 6.16889C10.1244 6.16889 9.24444 6.63111 8.81778 7.32444V6.33778H6.33778V13.7778H8.81778V9.39556C8.81778 8.71111 9.36889 8.15111 10.0533 8.15111C10.3834 8.15111 10.6999 8.28222 10.9333 8.5156C11.1667 8.74898 11.2978 9.06551 11.2978 9.39556V13.7778H13.7778ZM3.44889 4.94222C3.84495 4.94222 4.22478 4.78489 4.50484 4.50484C4.78489 4.22478 4.94222 3.84495 4.94222 3.44889C4.94222 2.62222 4.27556 1.94667 3.44889 1.94667C3.05047 1.94667 2.66838 2.10494 2.38666 2.38666C2.10494 2.66838 1.94667 3.05047 1.94667 3.44889C1.94667 4.27556 2.62222 4.94222 3.44889 4.94222ZM4.68444 13.7778V6.33778H2.22222V13.7778H4.68444Z"
                            fill="#7000FE"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_581_14836">
                            <rect width="16" height="16" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    {/* Locked */}
                    <div className="ml-4 cursor-pointer hover:opacity-70 transition-opacity">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3.5 16C3.0875 16 2.7345 15.8509 2.441 15.5528C2.1475 15.2546 2.0005 14.8957 2 14.4762V6.85714C2 6.4381 2.147 6.07949 2.441 5.78133C2.735 5.48317 3.088 5.33384 3.5 5.33333H4.25V3.80952C4.25 2.75556 4.61575 1.85727 5.34725 1.11467C6.07875 0.372064 6.963 0.000508457 8 5.20071e-07C9.037 -0.000507416 9.9215 0.371048 10.6535 1.11467C11.3855 1.85829 11.751 2.75657 11.75 3.80952V5.33333H12.5C12.9125 5.33333 13.2657 5.48267 13.5597 5.78133C13.8537 6.08 14.0005 6.4386 14 6.85714V14.4762C14 14.8952 13.8532 15.2541 13.5597 15.5528C13.2662 15.8514 12.913 16.0005 12.5 16H3.5ZM8 12.1905C8.4125 12.1905 8.76575 12.0414 9.05975 11.7432C9.35375 11.4451 9.5005 11.0862 9.5 10.6667C9.4995 10.2471 9.35275 9.88851 9.05975 9.59086C8.76675 9.29321 8.4135 9.14387 8 9.14286C7.5865 9.14184 7.2335 9.29117 6.941 9.59086C6.6485 9.89054 6.5015 10.2491 6.5 10.6667C6.4985 11.0842 6.6455 11.443 6.941 11.7432C7.2365 12.0434 7.5895 12.1925 8 12.1905ZM5.75 5.33333H10.25V3.80952C10.25 3.1746 10.0312 2.63492 9.59375 2.19048C9.15625 1.74603 8.625 1.52381 8 1.52381C7.375 1.52381 6.84375 1.74603 6.40625 2.19048C5.96875 2.63492 5.75 3.1746 5.75 3.80952V5.33333Z"
                          fill="black"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Takes remaining space */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Header - Only visible on desktop */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-balance">{course.title}</h1>

              <div className="flex flex-wrap md:flex-nowrap gap-4">
                <div className="flex gap-4">
                  {(["all", "offline"] as string[]).includes(course.tutor.classType) && (
                    <div className="max-w-1/2 flex flex-col gap-2">
                      <span className="text-sm font-extrabold">OFFLINE</span>
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M2.90768 2.05043C3.5763 1.40036 4.37008 0.884705 5.2437 0.532891C6.11732 0.181077 7.05367 0 7.99928 0C8.94489 0 9.88124 0.181077 10.7549 0.532891C11.6285 0.884705 12.4223 1.40036 13.0909 2.05043C14.4414 3.36413 15.2 5.14543 15.2 7.00273C15.2 8.86003 14.4414 10.6413 13.0909 11.955L11.9306 13.069L9.42595 15.4389C9.06615 15.7774 8.59139 15.9763 8.09119 15.998C7.59098 16.0197 7.09987 15.8628 6.71043 15.5569L6.57363 15.4389L4.47219 13.454L2.90871 11.955C1.5585 10.6414 0.800049 8.86029 0.800049 7.00323C0.800049 5.14617 1.5585 3.36509 2.90871 2.05142M7.99928 4.50033C7.31727 4.50033 6.6632 4.76371 6.18094 5.23253C5.69869 5.70136 5.42776 6.33722 5.42776 7.00023C5.42776 7.66325 5.69869 8.29911 6.18094 8.76793C6.6632 9.23675 7.31727 9.50013 7.99928 9.50013C8.68128 9.50013 9.33536 9.23675 9.81761 8.76793C10.2999 8.29911 10.5708 7.66325 10.5708 7.00023C10.5708 6.33722 10.2999 5.70136 9.81761 5.23253C9.33536 4.76371 8.68128 4.50033 7.99928 4.50033Z"
                            fill="#7000FE"
                          />
                        </svg>
                        <span className="text-sm">{course.tutor.location.fullName}</span>
                      </div>
                    </div>
                  )}
                  {(["all", "online"] as string[]).includes(course.tutor.classType) && (
                    <div
                      className={`max-w-1/2 lg:max-w-fit flex flex-col gap-2 ${(["all"] as string[]).includes(course.tutor.classType) ? "border-l-2 border-muted-foreground pl-4" : ""}`}
                    >
                      <span className="text-sm font-extrabold">ONLINE</span>
                      {course.tutor.onlineChannel.map(
                        (platform: { channel: string; imageURL?: string }, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            {platform.channel === "Zoom" ? (
                              <svg
                                fill="none"
                                height="2500"
                                width="2500"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 50.667 50.667"
                                className="size-4"
                              >
                                <path
                                  d="M25.333 50.667c13.992 0 25.334-11.343 25.334-25.334S39.325 0 25.333 0 0 11.342 0 25.333s11.342 25.334 25.333 25.334z"
                                  fill="#2196f3"
                                />
                                <path
                                  clipRule="evenodd"
                                  d="M14.866 32.574h16.755V20.288c0-1.851-1.5-3.351-3.351-3.351H11.515v12.286c0 1.851 1.5 3.351 3.351 3.351zm18.988-4.467l6.702 4.467V16.937l-6.701 4.468z"
                                  fill="#fff"
                                  fillRule="evenodd"
                                />
                              </svg>
                            ) : platform.channel === "Google Meet" ? (
                              <svg
                                width="16"
                                height="13"
                                viewBox="0 0 16 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_83_6137)">
                                  <path
                                    d="M9.05127 6.48894L10.6111 8.24653L12.7087 9.56778L13.0736 6.50003L12.7087 3.50146L10.5709 4.66216L9.05127 6.48894Z"
                                    fill="#00832D"
                                  />
                                  <path
                                    d="M0 9.28229V11.8965C0 12.4933 0.4915 12.978 1.09713 12.978H3.749L4.29812 11.0028L3.749 9.28229L1.92963 8.74097L0 9.28229Z"
                                    fill="#0066DA"
                                  />
                                  <path
                                    d="M3.749 0L0 3.6957L1.92975 4.23572L3.749 3.6957L4.28813 1.99861L3.749 0Z"
                                    fill="#E94235"
                                  />
                                  <path d="M0 9.28346H3.74894V3.69556H0V9.28346Z" fill="#2684FC" />
                                  <path
                                    d="M15.1039 1.56469L12.709 3.50151V9.56776L15.1138 11.5121C15.4738 11.7901 16.0004 11.5367 16.0004 11.0856V1.98254C16.0004 1.52643 15.4612 1.27432 15.1039 1.56476"
                                    fill="#00AC47"
                                  />
                                  <path
                                    d="M9.0514 6.48901V9.28235H3.74902V12.978H11.6118C12.2174 12.978 12.7088 12.4934 12.7088 11.8965V9.56786L9.0514 6.48901Z"
                                    fill="#00AC47"
                                  />
                                  <path
                                    d="M11.6118 0H3.74902V3.6957H9.0514V6.48903L12.7089 3.5015V1.08159C12.7089 0.484573 12.2174 6.16114e-05 11.6118 6.16114e-05"
                                    fill="#FFBA00"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_83_6137">
                                    <rect width="16" height="13" fill="white" />
                                  </clipPath>
                                </defs>
                              </svg>
                            ) : platform.channel === "Microsoft Teams" ? (
                              <svg
                                width="800px"
                                height="800px"
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                className="size-4"
                              >
                                <path
                                  fill="#5059C9"
                                  d="M10.765 6.875h3.616c.342 0 .619.276.619.617v3.288a2.272 2.272 0 01-2.274 2.27h-.01a2.272 2.272 0 01-2.274-2.27V7.199c0-.179.145-.323.323-.323zM13.21 6.225c.808 0 1.464-.655 1.464-1.462 0-.808-.656-1.463-1.465-1.463s-1.465.655-1.465 1.463c0 .807.656 1.462 1.465 1.462z"
                                />
                                <path
                                  fill="#7B83EB"
                                  d="M8.651 6.225a2.114 2.114 0 002.117-2.112A2.114 2.114 0 008.65 2a2.114 2.114 0 00-2.116 2.112c0 1.167.947 2.113 2.116 2.113zM11.473 6.875h-5.97a.611.611 0 00-.596.625v3.75A3.669 3.669 0 008.488 15a3.669 3.669 0 003.582-3.75V7.5a.611.611 0 00-.597-.625z"
                                />
                                <path
                                  fill="#000000"
                                  d="M8.814 6.875v5.255a.598.598 0 01-.596.595H5.193a3.951 3.951 0 01-.287-1.476V7.5a.61.61 0 01.597-.624h3.31z"
                                  opacity=".1"
                                />
                                <path
                                  fill="#000000"
                                  d="M8.488 6.875v5.58a.6.6 0 01-.596.595H5.347a3.22 3.22 0 01-.267-.65 3.951 3.951 0 01-.172-1.15V7.498a.61.61 0 01.596-.624h2.985z"
                                  opacity=".2"
                                />
                                <path
                                  fill="#000000"
                                  d="M8.488 6.875v4.93a.6.6 0 01-.596.595H5.08a3.951 3.951 0 01-.172-1.15V7.498a.61.61 0 01.596-.624h2.985z"
                                  opacity=".2"
                                />
                                <path
                                  fill="#000000"
                                  d="M8.163 6.875v4.93a.6.6 0 01-.596.595H5.079a3.951 3.951 0 01-.172-1.15V7.498a.61.61 0 01.596-.624h2.66z"
                                  opacity=".2"
                                />
                                <path
                                  fill="#000000"
                                  d="M8.814 5.195v1.024c-.055.003-.107.006-.163.006-.055 0-.107-.003-.163-.006A2.115 2.115 0 016.593 4.6h1.625a.598.598 0 01.596.594z"
                                  opacity=".1"
                                />
                                <path
                                  fill="#000000"
                                  d="M8.488 5.52v.699a2.115 2.115 0 01-1.79-1.293h1.195a.598.598 0 01.595.594z"
                                  opacity=".2"
                                />
                                <path
                                  fill="#000000"
                                  d="M8.488 5.52v.699a2.115 2.115 0 01-1.79-1.293h1.195a.598.598 0 01.595.594z"
                                  opacity=".2"
                                />
                                <path
                                  fill="#000000"
                                  d="M8.163 5.52v.647a2.115 2.115 0 01-1.465-1.242h.87a.598.598 0 01.595.595z"
                                  opacity=".2"
                                />
                                <path
                                  fill="url(#microsoft-teams-color-16__paint0_linear_2372_494)"
                                  d="M1.597 4.925h5.969c.33 0 .597.267.597.596v5.958a.596.596 0 01-.597.596h-5.97A.596.596 0 011 11.479V5.521c0-.33.267-.596.597-.596z"
                                />
                                <path
                                  fill="#ffffff"
                                  d="M6.152 7.193H4.959v3.243h-.76V7.193H3.01v-.63h3.141v.63z"
                                />
                                <defs>
                                  <linearGradient
                                    id="microsoft-teams-color-16__paint0_linear_2372_494"
                                    x1="2.244"
                                    x2="6.906"
                                    y1="4.46"
                                    y2="12.548"
                                    gradientUnits="userSpaceOnUse"
                                  >
                                    <stop stop-color="#5A62C3" />
                                    <stop offset=".5" stop-color="#4D55BD" />
                                    <stop offset="1" stop-color="#3940AB" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            ) : null}
                            <span className="text-sm text-[#6B6B6B]">{platform.channel}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
                <Button className="bg-[#7000FE] hover:bg-[#7000FE]/90 text-white w-full md:w-fit">
                  {course.tutor.level}
                </Button>
              </div>
            </div>

            <DetailCourseSchedule
              course={course}
              dateOptions={dateOptions}
              onScheduleChange={handleScheduleChange}
              availableDates={availableDates}
            />

            {/* Course and Tutor Info */}
            <DetailCourseDescription course={course} />
            <TutorAbout />
            <DetailCourseReview course={course} />
            <CourseRecommendation courses={recommendations} />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button - Mobile only */}
      {isBookable && <ButtonBook isMobile />}
    </div>
  )
}
