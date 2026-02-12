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
}

export function DetailCourseSchedule({
  course,
  dateOptions,
  onScheduleChange,
}: DetailCourseScheduleProps) {
  // Initialize selectedDate with the first available date using lazy initialization
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    return dateOptions.find(d => d.isAvailable)?.fullDate || null
  })
  // Store manual selection with context (date + tab) to automatically invalidate when context changes
  const [manualSelection, setManualSelection] = useState<{
    time: string
    date: string
    tab: "online" | "offline"
  } | null>(null)
  const [selectedTab, setSelectedTab] = useState<"online" | "offline">("online")

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

  // Compute available schedules for the selected date
  const availableSchedules = useMemo(() => {
    if (!selectedDate || !currentSchedules) return []

    const dateObj = new Date(selectedDate)
    const dayKey = String(dateObj.getDay() === 0 ? 7 : dateObj.getDay())
    const schedules = currentSchedules[dayKey] || []

    // All schedules from course data are considered available
    return schedules
  }, [selectedDate, currentSchedules])

  // Auto-select first available time or use manually selected time
  const selectedTime = useMemo(() => {
    // Check if manual selection is still valid (same date and tab, and time is still available)
    if (
      manualSelection &&
      manualSelection.date === selectedDate &&
      manualSelection.tab === selectedTab
    ) {
      const isStillAvailable = availableSchedules.some(
        (s: { startTime: string }) => s.startTime.slice(0, 5) === manualSelection.time
      )
      if (isStillAvailable) {
        return manualSelection.time
      }
    }

    // Otherwise, auto-select first available time
    if (availableSchedules.length > 0) {
      return availableSchedules[0].startTime.slice(0, 5)
    }

    return null
  }, [manualSelection, availableSchedules, selectedDate, selectedTab])

  // Get timezone for the selected time
  const selectedTimezone = useMemo(() => {
    if (!selectedTime || !selectedDate || !currentSchedules) return null

    const dateObj = new Date(selectedDate)
    const dayKey = String(dateObj.getDay() === 0 ? 7 : dateObj.getDay())
    const schedules = currentSchedules[dayKey] || []

    const matchingSchedule = schedules.find(
      (s: { startTime: string }) => s.startTime.slice(0, 5) === selectedTime
    )

    return matchingSchedule?.timezone || null
  }, [selectedTime, selectedDate, currentSchedules])

  // Notify parent component when schedule changes
  useEffect(() => {
    if (onScheduleChange) {
      onScheduleChange(selectedDate, selectedTime, selectedTimezone, selectedTab)
    }
  }, [selectedDate, selectedTime, selectedTimezone, selectedTab, onScheduleChange])

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

  const handleTimeSelect = useCallback(
    (time: string) => {
      if (selectedDate) {
        setManualSelection({
          time,
          date: selectedDate,
          tab: selectedTab,
        })
      }
    },
    [selectedDate, selectedTab]
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

          // All schedules from course data are available
          return schedules.map((s: { startTime: string }, index: number) => {
            const start = s.startTime.slice(0, 5)
            const isSelectedTime = selectedTime === start

            return (
              <span
                key={`${s.startTime}-${index}`}
                className={`px-3 lg:px-4 py-2 rounded-lg font-bold transition-colors min-w-[60px] lg:min-w-[80px] text-center cursor-pointer ${isSelectedTime
                    ? "bg-[#7000FE] text-white border border-[#7000FE]"
                    : "border border-[#7000FE] text-[#7000FE] hover:bg-[#7000FE80]/50"
                  }`}
                onClick={() => handleTimeSelect(start)}
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
