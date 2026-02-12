"use client"

import { Check } from "lucide-react"
import { Button } from "../../ui/button"
import { CustomDropdown } from "./custom-dropdown"

interface PriceFilterProps {
  isOpen: boolean
  onToggle: () => void
  maxPrice: number
  freeFirstCourse: boolean
  onMaxPriceChange: (maxPrice: number) => void
  onFreeFirstCourseChange: (freeFirstCourse: boolean) => void
  onApply: () => void
  onCancel: () => void
  isActive: boolean
}

export function PriceFilter({
  isOpen,
  onToggle,
  maxPrice,
  freeFirstCourse,
  onMaxPriceChange,
  onFreeFirstCourseChange,
  onApply,
  onCancel,
  isActive,
}: PriceFilterProps) {
  const trigger = (
    <Button
      className={`rounded-full px-4 py-2 relative ${
        isActive
          ? "bg-main hover:bg-purple-700 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      }`}
      onClick={onToggle}
    >
      Tarif
    </Button>
  )

  return (
    <CustomDropdown isOpen={isOpen} onClose={() => {}} trigger={trigger}>
      <div className="w-full md:w-80 p-4">
        <div className="mb-4">
          <div className="text-sm text-gray-700 mb-2">
            Anggaran <span className="text-main font-medium">maksimum Anda</span>
          </div>
          <div className="bg-purple-100 text-main px-3 py-1 rounded text-sm font-medium mb-3 inline-block">
            IDR {maxPrice.toLocaleString()}
          </div>
          <div className="relative mb-4">
            <input
              type="range"
              min="1000"
              max="5000000"
              step="1000"
              value={maxPrice}
              onChange={e => onMaxPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${(maxPrice / 5000000) * 100}%, #e5e7eb ${(maxPrice / 5000000) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.000</span>
              <span>5.000.000</span>
            </div>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={freeFirstCourse}
              onChange={e => onFreeFirstCourseChange(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                freeFirstCourse ? "bg-main border-main" : "border-gray-300"
              }`}
            >
              {freeFirstCourse && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-700">Kursus pertama gratis</span>
          </label>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="ghost" onClick={onCancel} className="flex-1 text-main">
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
