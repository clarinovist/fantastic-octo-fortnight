"use client"

import { Check, Star } from "lucide-react"
import { Button } from "../../ui/button"
import { CustomDropdown } from "./custom-dropdown"

interface RatingFilterProps {
  isOpen: boolean
  onToggle: () => void
  rating: number[]
  onRatingChange: (rating: number[]) => void
  onApply: () => void
  onCancel: () => void
  isActive: boolean
}

export function RatingFilter({
  isOpen,
  onToggle,
  rating,
  onRatingChange,
  onApply,
  onCancel,
  isActive,
}: RatingFilterProps) {
  const toggleRatingFilter = (ratingValue: number) => {
    const newRating = rating.includes(ratingValue)
      ? rating.filter(r => r !== ratingValue)
      : [...rating, ratingValue]
    onRatingChange(newRating)
  }

  const trigger = (
    <Button
      className={`rounded-full px-4 py-2 relative ${
        isActive
          ? "bg-main hover:bg-purple-700 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      }`}
      onClick={onToggle}
    >
      Rating
    </Button>
  )

  return (
    <CustomDropdown isOpen={isOpen} onClose={() => {}} trigger={trigger}>
      <div className="w-full md:w-64 p-4">
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(ratingValue => (
            <label key={ratingValue} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rating.includes(ratingValue)}
                onChange={() => toggleRatingFilter(ratingValue)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                  rating.includes(ratingValue) ? "bg-main border-main" : "border-gray-300"
                }`}
              >
                {rating.includes(ratingValue) && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex items-center">
                {Array.from({ length: ratingValue }, (_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-4 pt-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 text-main border-main bg-transparent"
          >
            CANCEL
          </Button>
          <Button onClick={onApply} className="flex-1 bg-main hover:bg-purple-700">
            APPLY
          </Button>
        </div>
      </div>
    </CustomDropdown>
  )
}
