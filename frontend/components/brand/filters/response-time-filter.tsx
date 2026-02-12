"use client"

import { Button } from "../../ui/button"
import { CustomDropdown } from "./custom-dropdown"

interface ResponseTimeFilterProps {
  isOpen: boolean
  onToggle: () => void
  responseTime: number
  onResponseTimeChange: (time: number) => void
  onApply: () => void
  onCancel: () => void
  isActive: boolean
}

export function ResponseTimeFilter({
  isOpen,
  onToggle,
  responseTime,
  onResponseTimeChange,
  onApply,
  onCancel,
  isActive,
}: ResponseTimeFilterProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`
    }
    if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      if (remainingMinutes === 0) {
        return `${hours} jam`
      }
      return `${hours} jam ${remainingMinutes} menit`
    }
    const days = Math.floor(minutes / 1440)
    const remainingHours = Math.floor((minutes % 1440) / 60)
    if (remainingHours === 0) {
      return `${days} hari`
    }
    return `${days} hari ${remainingHours} jam`
  }

  const trigger = (
    <Button
      className={`rounded-full px-4 py-2 relative flex-shrink-0 ${
        isActive
          ? "bg-main hover:bg-purple-700 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      }`}
      onClick={onToggle}
    >
      Waktu respon
    </Button>
  )

  return (
    <CustomDropdown isOpen={isOpen} onClose={() => {}} trigger={trigger}>
      <div className="w-full md:w-80 p-4">
        <div className="mb-4">
          <div className="text-gray-700 mb-2">
            Waktu respon <span className="text-main font-medium">maksimum</span>{" "}
            <span className="bg-purple-300 font-extrabold text-main px-2 py-1 rounded text-xs">
              {formatTime(responseTime)}
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="15"
              max="1440"
              step="15"
              value={responseTime}
              onChange={e => onResponseTimeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${(responseTime / 1440) * 100}%, #e5e7eb ${(responseTime / 1440) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15 menit</span>
              <span>24 jam</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-4">
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
