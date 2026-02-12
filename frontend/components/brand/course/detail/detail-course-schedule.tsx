"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseDetail } from "@/utils/types"
import { useCallback, useEffect, useMemo, useState } from "react"

interface DetailCourseScheduleProps {
  course: CourseDetail
  dateOptions: {
    day: string
    fullDate: string
    month: string
    date: string
    onSelect?: (date: string) => void
    isAvailable: boolean
  }[]
  onScheduleChange?: (
    date: string | null,
    time: string | null,
    timezone: string | null,
    tab?: "online" | "offline"
  ) => void
  availableDates?: {
    [dateTime: string]: { status: boolean; classType: "online" | "offline" | "all" }
  }
}

export function DetailCourseSchedule({
  course,
  dateOptions,
  onScheduleChange,
  availableDates,
}: DetailCourseScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedTimezone, setSelectedTimezone] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<"online" | "offline">("online")
  const [isInitialized, setIsInitialized] = useState(false)

  const isSelected = (date: string) => selectedDate === date

  // Get schedules based on selected tab or tutor's classType
  const currentSchedules = useMemo(() => {
    if (course.tutor.classType === "all") {
      return selectedTab === "online"
        ? course.courseSchedulesOnline || {}
        : course.courseSchedulesOffline || {}
    } else if (course.tutor.classType === "online") {
      return course.courseSchedulesOnline || {}
    } else {
      return course.courseSchedulesOffline || {}
    }
  }, [
    course.courseSchedulesOnline,
    course.courseSchedulesOffline,
    course.tutor.classType,
    selectedTab,
  ])

  // Initialize component on mount
  useEffect(() => {
    if (!isInitialized && dateOptions.length > 0) {
      const firstAvailableDate = dateOptions.find(d => d.isAvailable)?.fullDate || null
      requestAnimationFrame(() => {
        setSelectedDate(firstAvailableDate)
        setIsInitialized(true)
      })
    }
  }, [dateOptions, isInitialized])

  // Auto-select first available time when date or tab changes
  useEffect(() => {
    if (selectedDate && currentSchedules) {
      const dateObj = new Date(selectedDate)
      const dayKey = String(dateObj.getDay() === 0 ? 7 : dateObj.getDay())
      const schedules = currentSchedules[dayKey] || []

      if (schedules.length > 0) {
        // Filter to available times only - times that exist in availableDates
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

        requestAnimationFrame(() => {
          if (availableSchedules.length > 0) {
            const firstSchedule = availableSchedules[0]
            const time = firstSchedule.startTime.slice(0, 5)
            setSelectedTime(time)
            setSelectedTimezone(firstSchedule.timezone)
          } else {
            setSelectedTime(null)
            setSelectedTimezone(null)
          }
        })
      } else {
        requestAnimationFrame(() => {
          setSelectedTime(null)
          setSelectedTimezone(null)
        })
      }
    } else if (!selectedDate) {
      requestAnimationFrame(() => {
        setSelectedTime(null)
        setSelectedTimezone(null)
      })
    }
  }, [selectedDate, currentSchedules, availableDates, selectedTab])

  // Notify parent component when schedule changes
  useEffect(() => {
    if (onScheduleChange && isInitialized) {
      onScheduleChange(selectedDate, selectedTime, selectedTimezone, selectedTab)
    }
  }, [selectedDate, selectedTime, selectedTimezone, selectedTab, onScheduleChange, isInitialized])

  const onSelect = useCallback(
    (date: string) => {
      setSelectedDate(date)
      const selectedOption = dateOptions.find(option => option.fullDate === date)
      if (selectedOption && selectedOption.onSelect) {
        selectedOption.onSelect(date)
      }
    },
    [dateOptions]
  )

  const renderScheduleContent = () => (
    <>
      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 4,
          breakpoints: {
            "(min-width: 640px)": {
              slidesToScroll: 7,
            },
          },
        }}
        className="w-full max-w-full flex items-center"
      >
        <CarouselPrevious className="left-0 relative translate-0" />
        <CarouselContent>
          {dateOptions.map(date => (
            <CarouselItem key={date.fullDate} className="basis-1/4 md:basis-1/7">
              <div
                className={`flex flex-col items-center p-2 lg:p-3 rounded-lg transition-colors cursor-pointer min-w-[60px] lg:min-w-[80px] ${!date.isAvailable
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : isSelected(date.fullDate)
                      ? "bg-[#7000FE] text-white"
                      : "hover:bg-[#7000FE80]/50"
                  }`}
                onClick={() => date.isAvailable && onSelect(date.fullDate)}
              >
                <div className="text-xs">{date.day}</div>
                <div className="text-xl lg:text-2xl font-bold">{date.date}</div>
                <div className="text-xs">{date.month}</div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext className="right-0 relative translate-0" />
      </Carousel>

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
                className={`px-3 lg:px-4 py-2 rounded-lg font-bold transition-colors min-w-[60px] lg:min-w-[80px] text-center ${!isAvailable
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isSelectedTime
                      ? "bg-[#7000FE] text-white border border-[#7000FE] cursor-pointer"
                      : "border border-[#7000FE] text-[#7000FE] hover:bg-[#7000FE80]/50 cursor-pointer"
                  }`}
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

  return (
    <div>
      <div className="flex gap-4 items-center mb-4">
        {course.isFreeFirstCourse && <h3 className="text-lg font-bold">FIRST MEET AVAILABILITY</h3>}
        {course.tutor.classType === "all" && (
          <Tabs
            defaultValue="online"
            value={selectedTab}
            onValueChange={value => setSelectedTab(value as "online" | "offline")}
            className="w-full flex-1"
          >
            <TabsList>
              <TabsTrigger
                value="online"
                className="data-[state=active]:bg-[#006312] data-[state=active]:text-white"
              >
                Online
              </TabsTrigger>
              <TabsTrigger
                value="offline"
                className="data-[state=active]:bg-[#006312] data-[state=active]:text-white"
              >
                Offline
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {course.tutor.classType === "all" ? (
        <div>
          <div style={{ display: selectedTab === "online" ? "block" : "none" }}>
            {renderScheduleContent()}
          </div>
          <div style={{ display: selectedTab === "offline" ? "block" : "none" }}>
            {renderScheduleContent()}
          </div>
        </div>
      ) : (
        <div>{renderScheduleContent()}</div>
      )}
    </div>
  )
}
