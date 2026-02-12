"use client"

import { Button } from "../../ui/button"
import { CustomDropdown } from "./custom-dropdown"

interface DistanceFilterProps {
  isOpen: boolean
  onToggle: () => void
  distanceRange: number
  onDistanceChange: (distance: number) => void
  onApply: () => void
  onCancel: () => void
  isActive: boolean
}

export function DistanceFilter({
  isOpen,
  onToggle,
  distanceRange,
  onDistanceChange,
  onApply,
  onCancel,
  isActive,
}: DistanceFilterProps) {
  const trigger = (
    <Button
      className={`rounded-full px-4 py-2 relative ${
        isActive
          ? "bg-main hover:bg-purple-700 text-white"
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      }`}
      onClick={onToggle}
    >
      Jarak
    </Button>
  )

  return (
    <CustomDropdown isOpen={isOpen} onClose={() => {}} trigger={trigger}>
      <div className="w-full md:w-80 p-4">
        <div className="mb-4">
          <div className="text-gray-700 mb-2">
            Jarak <span className="text-main font-medium">maksimum</span>{" "}
            <span className="bg-purple-300 font-extrabold text-main px-2 py-1 rounded text-xs">
              {distanceRange} km +
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="50"
              value={distanceRange}
              onChange={e => onDistanceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${(distanceRange / 50) * 100}%, #e5e7eb ${(distanceRange / 50) * 100}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 km</span>
              <span>50 km +</span>
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
