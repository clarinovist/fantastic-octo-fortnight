"use client"

import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Icon } from "@/components/ui/icon"
import { clientFetch } from "@/services/client"
import { MeResponse, MyCourseResponse } from "@/utils/types/account"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import useSWRInfinite from "swr/infinite"
import { CourseItem } from "./course-item"

const PAGE_SIZE = 10

const fetcher = async (url: string): Promise<{ data: MyCourseResponse[] }> => {
  const response = await fetch(url, { next: { revalidate: 0 } })
  if (!response.ok) {
    throw new Error("Failed to fetch courses")
  }
  return response.json()
}

const getKey = (pageIndex: number, previousPageData: MyCourseResponse[] | null) => {
  if (previousPageData && !previousPageData.length) return null
  const page = pageIndex + 1
  return `/api/v1/tutors/courses?page=${page}&pageSize=${PAGE_SIZE}`
}

export function CourseList() {
  const { data, error, size, setSize, isValidating, isLoading } = useSWRInfinite<{
    data: MyCourseResponse[]
  }>(getKey, fetcher, {
    dedupingInterval: 0,
    revalidateFirstPage: true,
    revalidateOnFocus: true,
    revalidateIfStale: true,
    revalidateOnMount: true,
  })
  const router = useRouter()
  const [isOpenProfileComplete, setIsOpenProfileComplete] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const courses = data ? data.flatMap((page: { data: MyCourseResponse[] }) => page.data) : []
  const isEmpty = data?.[0]?.data?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < PAGE_SIZE)
  const isLoadingMore = isValidating && data && typeof data[size - 1] !== "undefined"

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const el = listRef.current
      if (!el || isLoadingMore || isReachingEnd) return
      const threshold = 100 // px from bottom
      if (el.scrollHeight - el.scrollTop - el.clientHeight < threshold) {
        setSize(size + 1)
      }
    }
    const el = listRef.current
    if (el) {
      el.addEventListener("scroll", handleScroll)
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", handleScroll)
      }
    }
  }, [size, isLoadingMore, isReachingEnd, setSize])

  const handleNavigateCreate = async () => {
    setIsCreating(true)
    try {
      const profile = await clientFetch<MeResponse>("/api/v1/me")
      if (!profile?.finish_update_profile && profile?.role === "tutor") {
        setIsOpenProfileComplete(true)
        setIsCreating(false)
        return
      }
      router.push("/account/course/form")
    } catch (err) {
      router.push("/account/course/form")
      console.log(err)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load courses. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Profile Completion Dialog */}
      {isOpenProfileComplete && (
        <Dialog open={isOpenProfileComplete} onOpenChange={setIsOpenProfileComplete}>
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2">Lengkapi Profil Anda</h3>
              <p className="mb-4 text-gray-700">
                Anda harus melengkapi profil terlebih dahulu sebelum membuat kelas.
              </p>
              <button
                className="px-4 py-2 bg-main text-white rounded hover:bg-main w-full"
                onClick={() => setIsOpenProfileComplete(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </Dialog>
      )}

      <div className="shadow-[0px_4px_8px_0px_rgba(0,0,0,0.25)] bg-white rounded-2xl p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Kelas Saya</h2>
          <Button
            className="px-4 py-2 bg-main text-white rounded-lg hover:bg-main flex gap-2 items-center"
            onClick={handleNavigateCreate}
            disabled={isCreating}
          >
            {isCreating ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                <span className="font-bold">Memuat...</span>
              </span>
            ) : (
              <>
                <Icon name="plus-square" fill="white" />
                <span className="font-bold">BUAT</span>
              </>
            )}
          </Button>
        </div>
        {!isEmpty && (
          <div ref={listRef} className="space-y-4 max-h-[600px] overflow-auto">
            {/* Course List */}
            <div className="space-y-4 bg-[#000]/10 px-6 py-2 rounded-2xl">
              {courses.map(course => (
                <CourseItem key={course.id} course={course} />
              ))}
            </div>

            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
