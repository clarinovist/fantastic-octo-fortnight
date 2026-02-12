"use client"

import { useUserProfile } from "@/context/user-profile"
import { clientFetch } from "@/services/client"
import { DEFAULT_RADIUS } from "@/utils/constants"
import type { Course } from "@/utils/types"
import { useEffect, useMemo, useRef } from "react"
import { CourseCard } from "./course-card"
import { InfiniteScrollClient } from "./infinite-scroll"
import { CourseCardSkeleton } from "./skeleton/course-card-skeleton"

interface CourseListProps {
  initialCourses?: Course[]
  initialPage?: number
  pageSize?: number
  className?: string
  totalItems?: number
  totalPages?: number
  debug?: boolean
  emptyStateText?: string
  emptyStateComponent?: React.ReactNode
  filters?: {
    classType?: string[] | string
    levelEducationCourse?: string[] | string
    locationId?: string
    courseCategoryId?: string
    freeFirstCourse?: string
    maxPrice?: string
    rating?: string[] | string
    latitude?: string
    longitude?: string
    radius?: string
    maxResponseTime?: string
  }
}

// Default empty state component for courses
const DefaultCourseEmptyState = () => (
  <div className="text-center h-72 flex flex-col justify-center">
    <h3 className="text-lg font-medium text-gray-900 mb-2">Course tidak ditemukan</h3>
  </div>
)

export function CourseList({
  initialCourses = [],
  initialPage = 1,
  pageSize = 16,
  filters,
  className,
  totalItems,
  totalPages,
  debug = false,
  emptyStateText = "Tidak ada kursus tersedia",
  emptyStateComponent,
}: CourseListProps) {
  const user = useUserProfile()
  // Memoize sorted arrays to prevent unnecessary re-renders
  const sortedClassTypes = useMemo(() => {
    if (!Array.isArray(filters?.classType)) return []
    return [...filters.classType].sort()
  }, [filters?.classType])

  const sortedLevelEducationCourse = useMemo(() => {
    if (!Array.isArray(filters?.levelEducationCourse)) return []
    return [...filters.levelEducationCourse].sort()
  }, [filters?.levelEducationCourse])

  const sortedRatings = useMemo(() => {
    if (!Array.isArray(filters?.rating)) return []
    return [...filters.rating].sort()
  }, [filters?.rating])

  // Memoize the URL function with stable dependencies
  const getUrl = useMemo(() => {
    return (page: number) => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })

      if (debug) console.log("Generating URL with filters:", filters)

      // Only add filters if they have values
      if (filters?.courseCategoryId) {
        params.append("courseCategoryId", filters.courseCategoryId)
      }

      if (sortedClassTypes.length > 0 || filters?.classType) {
        if (sortedClassTypes.length > 0) {
          sortedClassTypes.forEach(type => params.append("classType", type))
        } else {
          // Coerce to string to satisfy URLSearchParams API (filters.classType may be string | string[])
          params.append("classType", String(filters?.classType || ""))
        }
      }

      if (sortedLevelEducationCourse.length > 0 || filters?.levelEducationCourse) {
        if (sortedLevelEducationCourse.length > 0) {
          sortedLevelEducationCourse.forEach(level => params.append("levelEducationCourse", level))
        } else {
          // Coerce to string to satisfy URLSearchParams API (filters.levelEducationCourse may be string | string[])
          params.append("levelEducationCourse", String(filters?.levelEducationCourse || ""))
        }
      }

      if (filters?.freeFirstCourse) {
        params.append("freeFirstCourse", "true")
      }

      if (filters?.maxPrice) {
        params.append("maxPrice", filters.maxPrice)
      }

      if (sortedRatings.length > 0 || filters?.rating) {
        if (sortedRatings.length > 0) {
          sortedRatings.forEach(price => params.append("rating", price))
        } else {
          // Coerce to string to satisfy URLSearchParams API (filters.rating may be string | string[])
          params.append("rating", String(filters?.rating || ""))
        }
      }

      if (filters?.locationId) {
        params.append("locationId", filters.locationId)
      }

      if (filters?.latitude && filters?.longitude) {
        params.append("latitude", filters.latitude)
        params.append("longitude", filters.longitude)
        if (!filters?.radius) {
          params.append("radius", DEFAULT_RADIUS.toString()) // Default radius if not provided
        }
      }

      if (filters?.radius) {
        params.append("radius", filters.radius)
      }

      if (filters?.maxResponseTime) {
        params.append("maxResponseTime", filters.maxResponseTime)
      }

      const url = `/api/v1/courses?${params.toString()}`
      if (debug) console.log("🔗 Generated URL:", url)
      return url
    }
  }, [
    pageSize,
<<<<<<< HEAD
    filters?.courseCategoryId,
    filters?.classType,
    filters?.levelEducationCourse,
    filters?.freeFirstCourse,
    filters?.maxPrice,
    filters?.rating,
    filters?.locationId,
    filters?.latitude,
    filters?.longitude,
    filters?.radius,
    filters?.maxResponseTime,
=======
    filters,
    sortedClassTypes,
    sortedLevelEducationCourse,
    sortedRatings,
>>>>>>> 1a19ced (chore: update service folders from local)
    debug,
  ])

  const fetcher = async (url: string): Promise<Course[]> => {
    if (debug) console.log("🌐 Fetching:", url)
    const data = await clientFetch<Course[]>(url)
    if (debug) console.log("📦 Fetched data:", data?.length, "items")
    return data || []
  }

  const renderCourse = (course: Course, index: number) => (
    <CourseCard
      key={course.id || index}
      course={course}
      isBookable={!user?.profile?.role || user?.profile?.role === "student"}
    />
  )

  // Generate skeleton items (typically 8-12 for initial load)
  const skeletonItems = Array.from({ length: pageSize }, (_, i) => (
    <CourseCardSkeleton key={`skeleton-${i}`} />
  ))

  // Create a stable key that changes when filters change
  const filterKey = useMemo(() => {
    return JSON.stringify({
      courseCategoryId: filters?.courseCategoryId || "",
      classType: sortedClassTypes,
      levelEducationCourse: sortedLevelEducationCourse,
      freeFirstCourse: filters?.freeFirstCourse || "",
      maxPrice: filters?.maxPrice || "",
      rating: sortedRatings,
      locationId: filters?.locationId || "",
      latitude: filters?.latitude || "",
      longitude: filters?.longitude || "",
      radius: filters?.radius || "",
      maxResponseTime: filters?.maxResponseTime || "",
    })
  }, [
    filters?.courseCategoryId,
<<<<<<< HEAD
    filters?.classType,
    filters?.levelEducationCourse,
    filters?.freeFirstCourse,
    filters?.maxPrice,
    filters?.rating,
=======
    filters?.freeFirstCourse,
    filters?.maxPrice,
>>>>>>> 1a19ced (chore: update service folders from local)
    filters?.locationId,
    filters?.latitude,
    filters?.longitude,
    filters?.radius,
    filters?.maxResponseTime,
<<<<<<< HEAD
=======
    sortedClassTypes,
    sortedLevelEducationCourse,
    sortedRatings,
>>>>>>> 1a19ced (chore: update service folders from local)
  ])

  // --------------------------
  // Scroll position persistence
  // --------------------------
  const scrollSavedKey = `courseListScroll:${filterKey}`
  const scrollListenerRef = useRef<() => void | null>(null)

  useEffect(() => {
    // helper to find the scroll container (prefer element with overflow-y-auto)
    const findScrollContainer = (): HTMLElement | Window => {
      const el = document.querySelector(".overflow-y-auto")
      return (el as HTMLElement) || window
    }

    const container = findScrollContainer()

    // restore saved position if any
    try {
      const raw = sessionStorage.getItem(scrollSavedKey)
      if (raw) {
        const pos = Number(raw)
        if (!Number.isNaN(pos)) {
          if (container instanceof Window) {
            window.scrollTo(0, pos)
          } else {
<<<<<<< HEAD
            ;(container as HTMLElement).scrollTop = pos
=======
            ; (container as HTMLElement).scrollTop = pos
>>>>>>> 1a19ced (chore: update service folders from local)
          }
          if (debug) console.log(`[CourseList] Restored scroll ${pos} for key`, scrollSavedKey)
        }
      }
    } catch (e) {
      if (debug) console.warn("[CourseList] failed to restore scroll:", e)
    }

    // debounce helper
    let timeout: number | null = null
    const onScroll = () => {
      const savePos = () => {
        try {
          const pos =
            container instanceof Window ? window.scrollY : (container as HTMLElement).scrollTop
          sessionStorage.setItem(scrollSavedKey, String(Math.floor(pos)))
          if (debug) console.log(`[CourseList] Saved scroll ${pos} for key`, scrollSavedKey)
        } catch (e) {
          if (debug) console.warn("[CourseList] failed to save scroll:", e)
        }
      }

      if (timeout !== null) {
        window.clearTimeout(timeout)
      }
      timeout = window.setTimeout(savePos, 150)
    }

    // attach listener
    if (container instanceof Window) {
      window.addEventListener("scroll", onScroll, { passive: true })
      scrollListenerRef.current = () => window.removeEventListener("scroll", onScroll)
    } else {
<<<<<<< HEAD
      ;(container as HTMLElement).addEventListener("scroll", onScroll, { passive: true })
=======
      ; (container as HTMLElement).addEventListener("scroll", onScroll, { passive: true })
>>>>>>> 1a19ced (chore: update service folders from local)
      scrollListenerRef.current = () =>
        (container as HTMLElement).removeEventListener("scroll", onScroll)
    }

    return () => {
      // cleanup listener and any pending timeout
      if (timeout !== null) {
        window.clearTimeout(timeout)
      }
      if (scrollListenerRef.current) {
        scrollListenerRef.current()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]) // re-run when filters (hence filterKey) change so correct saved pos is restored

  return (
    <InfiniteScrollClient
      key={filterKey} // Force re-mount when filters change
      items={initialCourses}
      initialPage={initialPage}
      totalItem={totalItems}
      totalPages={totalPages}
      className={className}
      getUrl={getUrl}
      fetcher={fetcher}
      renderItem={renderCourse}
      loadingText="Memuat kursus..."
      skeletonComponent={<>{skeletonItems}</>}
      showSkeletonOnInitialLoad={true}
      emptyStateComponent={emptyStateComponent || <DefaultCourseEmptyState />}
      emptyStateText={emptyStateText}
      showEmptyState={true}
      debug={debug}
    />
  )
}
