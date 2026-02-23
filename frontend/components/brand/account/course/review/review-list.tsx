"use client"

import type { BookingReview } from "@/utils/types/booking"
import type { BaseResponse } from "@/utils/types"
import { getErrorMessage } from "@/utils/helpers/error"
import { useEffect, useRef, useState } from "react"
import useSWRInfinite from "swr/infinite"
import { toast } from "sonner"
import RatingDialog from "./rating-dialog"
import { ReviewItem } from "./review-item"


const PAGE_SIZE = 10

// Fetcher function for SWR Infinite
const fetcher = async (url: string): Promise<{ data: BookingReview[] }> => {
  const response = await fetch(url, { next: { revalidate: 0 } })
  if (!response.ok) {
    throw new Error("Failed to fetch reviews")
  }
  return response.json()
}

// Key function for SWR Infinite
const getKey = (
  pageIndex: number,
  previousPageData: { data: BookingReview[] } | null
) => {
  if (previousPageData && !previousPageData.data.length) return null
  const page = pageIndex + 1
  const baseUrl = "/api/v1/students/reviews"
  return `${baseUrl}?page=${page}&pageSize=${PAGE_SIZE}`
}

export function ReviewList() {
  const { data, error, size, setSize, isValidating, isLoading, mutate } = useSWRInfinite<{
    data: BookingReview[]
  }>((pageIndex, previousPageData) => getKey(pageIndex, previousPageData), fetcher, {
    dedupingInterval: 0,
    revalidateFirstPage: true,
    revalidateOnFocus: true,
    revalidateIfStale: true,
    revalidateOnMount: true,
  })

  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<BookingReview | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Flatten all reviews from all pages
  const reviews: BookingReview[] = data ? data.flatMap(page => page.data) : []

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

  // Handle review button click
  const handleReviewClick = (review: BookingReview) => {
    setSelectedReview(review)
    setRatingDialogOpen(true)
  }

  // Handle rating dialog close
  const handleRatingDialogClose = () => {
    setRatingDialogOpen(false)
    setSelectedReview(null)
  }

  // Handle rating submission
  const handleRatingSubmit = async (rating: number, reviewText: string, willLearnAgain: string) => {
    if (!selectedReview) return

    try {
      const endpoint = `/api/v1/students/reviews/${selectedReview?.id}`
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rate: rating,
          recommendByStudent: willLearnAgain,
          review: reviewText,
        }),
      })

      const result: BaseResponse<unknown> = await response.json()

      // Check success field in BaseResponse
      if (!result.success) {
        throw new Error(result.message || "Failed to submit review")
      }

      // Revalidate the data
      await mutate()
      handleRatingDialogClose()
      toast.success("Review submitted successfully")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error(getErrorMessage(error))
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Ulasan</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading reviews...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Ulasan</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-red-500">Error: {error.message}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ulasan</h2>

      <div
        ref={listRef}
        className="space-y-4 max-h-[600px] overflow-y-auto p-4 rounded-2xl bg-black/10 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent"
      >
        {reviews.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No reviews found</div>
        ) : (
          reviews
            .filter(review => review != null)
            .map((review, index) => (
              <ReviewItem
                isShowReviewerName={true}
                key={review?.id ? `${review.id}-${index}` : index}
                review={review}
                onButtonClick={() => handleReviewClick(review)}
              />
            ))
        )}

        {/* Loading indicator for infinite scroll */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          </div>
        )}
      </div>

      {/* Rating Dialog */}
      {selectedReview && (
        <RatingDialog
          review={selectedReview}
          isOpen={ratingDialogOpen}
          isTutor={false}
          onClose={handleRatingDialogClose}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  )
}
