"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useLookup } from "../../hooks/use-lookup"
import { LOOKUP_TYPE_BE } from "../../utils/constants"
import { ClassTypeFilter } from "./filters/class-type-filter"
import { CourseLevelFilter } from "./filters/course-level-filter"
import { DistanceFilter } from "./filters/distance-filter"
import { PriceFilter } from "./filters/price-filter"
import { RatingFilter } from "./filters/rating-filter"
import { ResponseTimeFilter } from "./filters/response-time-filter"

// Custom hook for fetching class types
const useClassTypes = () => {
  const { data, isLoading, error } = useLookup(LOOKUP_TYPE_BE.CLASS_TYPE)

  return {
    classTypes: data,
    isLoading,
    error,
  }
}

// Custom hook for fetching course levels
const useCourseLevels = () => {
  const { data, isLoading, error } = useLookup(LOOKUP_TYPE_BE.COURSE_LEVEL_EDUCATION)

  return {
    courseLevels: data,
    isLoading,
    error,
  }
}

// Loading component for suspense fallback
const CoursesFilterSkeleton = () => {
  return (
    <div className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide ml-auto">
      <div className="flex gap-3 min-w-max">
        <div className="animate-pulse flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}

// Internal component that uses useSearchParams
function CoursesFilterInternal({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Add hydration state
  const [isHydrated, setIsHydrated] = useState(false)

  // Use separate hooks for each lookup type
  const { classTypes, isLoading: isClassTypesLoading, error: classTypesError } = useClassTypes()
  const {
    courseLevels,
    isLoading: isCourseLevelsLoading,
    error: courseLevelsError,
  } = useCourseLevels()

  const [rating, setRating] = useState<number[]>([])
  const [classType, setClassType] = useState<string[]>([])
  const [courseLevel, setCourseLevel] = useState<string[]>([])
  const [distanceRange, setDistanceRange] = useState(25)
  const [maxPrice, setMaxPrice] = useState(5000000)
  const [freeFirstCourse, setFreeFirstCourse] = useState(false)
  const [responseTime, setResponseTime] = useState(1440) // Default to 1440 minutes (24 hours)

  // Individual dropdown states
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [isClassTypeOpen, setIsClassTypeOpen] = useState(false)
  const [isCourseLevelOpen, setIsCourseLevelOpen] = useState(false)
  const [isDistanceOpen, setIsDistanceOpen] = useState(false)
  const [isPriceOpen, setIsPriceOpen] = useState(false)
  const [isResponseTimeOpen, setIsResponseTimeOpen] = useState(false)

  // Handle hydration
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsHydrated(true)
    })
  }, [])

  // Helper function to close all dropdowns
  const closeAllDropdowns = () => {
    setIsRatingOpen(false)
    setIsClassTypeOpen(false)
    setIsCourseLevelOpen(false)
    setIsDistanceOpen(false)
    setIsPriceOpen(false)
    setIsResponseTimeOpen(false)
  }

  // Helper function to toggle specific dropdown
  const toggleDropdown = (dropdownType: string) => {
    closeAllDropdowns()
    switch (dropdownType) {
      case "rating":
        setIsRatingOpen(true)
        break
      case "classType":
        setIsClassTypeOpen(true)
        break
      case "courseLevel":
        setIsCourseLevelOpen(true)
        break
      case "distance":
        setIsDistanceOpen(true)
        break
      case "price":
        setIsPriceOpen(true)
        break
      case "responseTime":
        setIsResponseTimeOpen(true)
        break
    }
  }

  // Initialize filters from URL params - only after hydration
  useEffect(() => {
    if (!isHydrated) return

    const ratingParams = searchParams
      .getAll("rating")
      .map(Number)
      .filter(n => !isNaN(n))
    const classTypeParams = searchParams.getAll("classType")
    const courseLevelParams = searchParams.getAll("levelEducationCourse")
    const maxPriceParam = searchParams.get("maxPrice")
    const freeFirstCourseParam = searchParams.get("freeFirstCourse")
    const radiusParam = searchParams.get("radius")
    const responseTimeParam = searchParams.get("maxResponseTime")

    requestAnimationFrame(() => {
      if (ratingParams.length > 0) setRating(ratingParams)
      if (classTypeParams.length > 0) setClassType(classTypeParams)
      if (courseLevelParams.length > 0) setCourseLevel(courseLevelParams)
      if (maxPriceParam) setMaxPrice(Number(maxPriceParam))
      if (freeFirstCourseParam) setFreeFirstCourse(freeFirstCourseParam === "true")
      if (radiusParam) setDistanceRange(Number(radiusParam))
      if (responseTimeParam) setResponseTime(Number(responseTimeParam))
    })
  }, [searchParams, isHydrated])

  // Helper functions to check if filters are active - only after hydration
  const isRatingActive = () => isHydrated && searchParams.getAll("rating").length > 0
  const isClassTypeActive = () => isHydrated && searchParams.getAll("classType").length > 0
  const isCourseLevelActive = () =>
    isHydrated && searchParams.getAll("levelEducationCourse").length > 0
  const isPriceActive = () =>
    isHydrated && !!(searchParams.get("maxPrice") || searchParams.get("freeFirstCourse"))
  const isDistanceActive = () => isHydrated && searchParams.get("radius") !== null
  const isResponseTimeActive = () => isHydrated && searchParams.get("maxResponseTime") !== null

  const updateURL = (filterType: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filterType === "rating") {
      params.delete("rating")
      rating.forEach(r => params.append("rating", r.toString()))
    }

    if (filterType === "classType") {
      params.delete("classType")
      classType.forEach(ct => params.append("classType", ct))
    }

    if (filterType === "courseLevel") {
      params.delete("levelEducationCourse")
      courseLevel.forEach(cl => params.append("levelEducationCourse", cl))
    }

    if (filterType === "price") {
      params.delete("maxPrice")
      params.delete("freeFirstCourse")

      if (maxPrice !== 500000) {
        params.set("maxPrice", maxPrice.toString())
      }

      if (freeFirstCourse) {
        params.set("freeFirstCourse", "true")
      }
    }

    if (filterType === "distance") {
      params.delete("radius")
      if (distanceRange > 0) {
        params.set("radius", distanceRange.toString())
      }
    }

    if (filterType === "responseTime") {
      params.delete("maxResponseTime")
      if (responseTime > 0) {
        params.set("maxResponseTime", responseTime.toString())
      }
    }

    const queryString = params.toString()
    const newURL = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname

    router.push(newURL, { scroll: false })
  }

  const clearFilterFromURL = (filterType: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (filterType === "rating") {
      params.delete("rating")
    }

    if (filterType === "classType") {
      params.delete("classType")
    }

    if (filterType === "courseLevel") {
      params.delete("levelEducationCourse")
    }

    if (filterType === "price") {
      params.delete("maxPrice")
      params.delete("freeFirstCourse")
    }

    if (filterType === "distance") {
      params.delete("radius")
    }

    if (filterType === "responseTime") {
      params.delete("maxResponseTime")
    }

    const queryString = params.toString()
    const newURL = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname

    router.push(newURL, { scroll: false })
  }

  // Filter handlers
  const handleRatingApply = () => {
    updateURL("rating")
    setIsRatingOpen(false)
  }

  const handleRatingCancel = () => {
    setRating([])
    clearFilterFromURL("rating")
    setIsRatingOpen(false)
  }

  const handleClassTypeApply = () => {
    updateURL("classType")
    setIsClassTypeOpen(false)
  }

  const handleClassTypeCancel = () => {
    setClassType([])
    clearFilterFromURL("classType")
    setIsClassTypeOpen(false)
  }

  const handleCourseLevelApply = () => {
    updateURL("courseLevel")
    setIsCourseLevelOpen(false)
  }

  const handleCourseLevelCancel = () => {
    setCourseLevel([])
    clearFilterFromURL("courseLevel")
    setIsCourseLevelOpen(false)
  }

  const handlePriceApply = () => {
    updateURL("price")
    setIsPriceOpen(false)
  }

  const handlePriceCancel = () => {
    setMaxPrice(500000)
    setFreeFirstCourse(false)
    clearFilterFromURL("price")
    setIsPriceOpen(false)
  }

  const handleDistanceApply = () => {
    updateURL("distance")
    setIsDistanceOpen(false)
  }

  const handleDistanceCancel = () => {
    setDistanceRange(25)
    clearFilterFromURL("distance")
    setIsDistanceOpen(false)
  }

  const handleResponseTimeApply = () => {
    updateURL("responseTime")
    setIsResponseTimeOpen(false)
  }

  const handleResponseTimeCancel = () => {
    setResponseTime(1440) // Reset to 1440 minutes (24 hours)
    clearFilterFromURL("responseTime")
    setIsResponseTimeOpen(false)
  }

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return <CoursesFilterSkeleton />
  }

  return (
    <>
      <div className={`flex gap-3 min-w-max ml-auto ${className}`}>
        <ClassTypeFilter
          isOpen={isClassTypeOpen}
          onToggle={() => toggleDropdown("classType")}
          classType={classType}
          onClassTypeChange={setClassType}
          onApply={handleClassTypeApply}
          onCancel={handleClassTypeCancel}
          classTypes={classTypes}
          isLoading={isClassTypesLoading}
          error={classTypesError}
          isActive={isClassTypeActive()}
        />

        <RatingFilter
          isOpen={isRatingOpen}
          onToggle={() => toggleDropdown("rating")}
          rating={rating}
          onRatingChange={setRating}
          onApply={handleRatingApply}
          onCancel={handleRatingCancel}
          isActive={isRatingActive()}
        />

        <DistanceFilter
          isOpen={isDistanceOpen}
          onToggle={() => toggleDropdown("distance")}
          distanceRange={distanceRange}
          onDistanceChange={setDistanceRange}
          onApply={handleDistanceApply}
          onCancel={handleDistanceCancel}
          isActive={isDistanceActive()}
        />

        <CourseLevelFilter
          isOpen={isCourseLevelOpen}
          onToggle={() => toggleDropdown("courseLevel")}
          courseLevel={courseLevel}
          onCourseLevelChange={setCourseLevel}
          onApply={handleCourseLevelApply}
          onCancel={handleCourseLevelCancel}
          courseLevels={courseLevels}
          isLoading={isCourseLevelsLoading}
          error={courseLevelsError}
          isActive={isCourseLevelActive()}
        />

        <PriceFilter
          isOpen={isPriceOpen}
          onToggle={() => toggleDropdown("price")}
          maxPrice={maxPrice}
          freeFirstCourse={freeFirstCourse}
          onMaxPriceChange={setMaxPrice}
          onFreeFirstCourseChange={setFreeFirstCourse}
          onApply={handlePriceApply}
          onCancel={handlePriceCancel}
          isActive={isPriceActive()}
        />

        <ResponseTimeFilter
          isOpen={isResponseTimeOpen}
          onToggle={() => toggleDropdown("responseTime")}
          responseTime={responseTime}
          onResponseTimeChange={setResponseTime}
          onApply={handleResponseTimeApply}
          onCancel={handleResponseTimeCancel}
          isActive={isResponseTimeActive()}
        />
      </div>

      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #7c3aed;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}

type CoursesFilterProps = {
  className?: string
}

// Main export component wrapped in Suspense
export function CoursesFilter(props: CoursesFilterProps) {
  return (
    <Suspense fallback={<CoursesFilterSkeleton />}>
      <CoursesFilterInternal className={props.className} />
    </Suspense>
  )
}
