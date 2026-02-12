"use client"

import { Check } from "lucide-react"
import { Button } from "../../ui/button"
import { CustomDropdown } from "./custom-dropdown"

interface CourseLevel {
  code: string
  description: string
}

interface CourseLevelFilterProps {
  isOpen: boolean
  onToggle: () => void
  courseLevel: string[]
  onCourseLevelChange: (courseLevel: string[]) => void
  onApply: () => void
  onCancel: () => void
  courseLevels: CourseLevel[] | null
  isLoading: boolean
  error: any
  isActive: boolean
}

export function CourseLevelFilter({
  isOpen,
  onToggle,
  courseLevel,
  onCourseLevelChange,
  onApply,
  onCancel,
  courseLevels,
  isLoading,
  error,
  isActive,
}: CourseLevelFilterProps) {
  const toggleCourseLevelFilter = (levelCode: string) => {
    const newCourseLevel = courseLevel.includes(levelCode)
      ? courseLevel.filter(l => l !== levelCode)
      : [...courseLevel, levelCode]
    onCourseLevelChange(newCourseLevel)
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
      Tingkat
    </Button>
  )

  return (
    <CustomDropdown isOpen={isOpen} onClose={() => {}} trigger={trigger}>
      <div className="w-full md:w-64 p-4">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-gray-500 text-sm">Loading course levels...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">Error loading course levels</div>
          ) : !courseLevels || courseLevels.length === 0 ? (
            <div className="text-gray-500 text-sm">No course levels available</div>
          ) : (
            (courseLevels ?? []).map(level => (
              <label key={level.code} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={courseLevel.includes(level.code)}
                  onChange={() => toggleCourseLevelFilter(level.code)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                    courseLevel.includes(level.code) ? "bg-main border-main" : "border-gray-300"
                  }`}
                >
                  {courseLevel.includes(level.code) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700">{level.description}</span>
              </label>
            ))
          )}
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
