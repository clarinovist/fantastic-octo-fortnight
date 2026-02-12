"use client"

import { cn } from "@/lib/utils"
import type { BookingReview } from "@/utils/types/booking"
import { Check, Star, User } from "lucide-react"
import Image from "next/image"

interface ReviewItemProps {
  review: BookingReview
  isShowReviewerName?: boolean
  onButtonClick?: () => void
}

export function ReviewItem({ review, onButtonClick, isShowReviewerName }: ReviewItemProps) {
  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Left section: Avatar and info */}
        <div
          className={cn("flex gap-4 flex-1", review.isReviewed ? "items-start" : "items-center")}
        >
          <div className="flex flex-col items-center gap-2">
            {/* Avatar */}
            {review.photoProfile ? (
              <Image
                src={review.photoProfile}
                alt={review.name}
                className="w-24 h-24 rounded-full object-cover flex-shrink-0"
                width={96}
                height={96}
              />
            ) : (
              <User className="w-20 h-20 text-gray-400" />
            )}
            {/* Rating */}
            {review.rate && (
              <div className="flex items-center gap-2 mb-4">
                <Star size={24} className="fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-semibold text-foreground">{review.rate}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1">
            {/* name */}
            {isShowReviewerName && (
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {review?.name || review?.email}
              </h3>
            )}

            <p className="text-base text-muted-foreground leading-relaxed">{review.courseTitle}</p>

            {/* Review description */}
            {review.review && (
              <div className="mt-2">
                <p className="text-base font-bold">ulasan</p>
                <p className="text-base text-muted-foreground leading-relaxed">{review.review}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right section: Badge or button */}
        <div className="flex-shrink-0">
          {review.isReviewed && (
            <div
              className="bg-[#006312] rounded-md p-2 flex items-center justify-center"
              onClick={onButtonClick}
            >
              <Check size={24} className="text-white" strokeWidth={3} />
            </div>
          )}

          {!review.isReviewed && (
            <button
              onClick={onButtonClick}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              BERI ULASAN
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
