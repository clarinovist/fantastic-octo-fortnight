"use client"

import { Check } from "lucide-react"
import { Button } from "../../ui/button"
import { CustomDropdown } from "./custom-dropdown"

interface ClassType {
  code: string
  description: string
}

interface ClassTypeFilterProps {
  isOpen: boolean
  onToggle: () => void
  classType: string[]
  onClassTypeChange: (classType: string[]) => void
  onApply: () => void
  onCancel: () => void
  classTypes: ClassType[] | null
  isLoading: boolean
  error: any
  isActive: boolean
}

export function ClassTypeFilter({
  isOpen,
  onToggle,
  classType,
  onClassTypeChange,
  onApply,
  onCancel,
  classTypes,
  isLoading,
  error,
  isActive,
}: ClassTypeFilterProps) {
  const toggleClassTypeFilter = (typeCode: string) => {
    const newClassType = classType.includes(typeCode)
      ? classType.filter(t => t !== typeCode)
      : [...classType, typeCode]
    onClassTypeChange(newClassType)
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
      Tipe Kelas
    </Button>
  )

  return (
    <CustomDropdown isOpen={isOpen} onClose={onToggle} trigger={trigger} title="Tipe Kelas">
      <div className="w-full md:w-64 p-4">
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-gray-500 text-sm">Loading class types...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">Error loading class types</div>
          ) : !classTypes || classTypes.length === 0 ? (
            <div className="text-gray-500 text-sm">No class types available</div>
          ) : (
            (classTypes ?? []).map(type => (
              <label key={type.code} className="flex items-center cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={classType.includes(type.code)}
                  onChange={() => toggleClassTypeFilter(type.code)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                    classType.includes(type.code) ? "bg-main border-main" : "border-gray-300"
                  }`}
                >
                  {classType.includes(type.code) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-gray-700 text-base">{type.description}</span>
              </label>
            ))
          )}
        </div>
        <div className="flex gap-3 mt-6 pt-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="flex-1 text-main bg-transparent hover:bg-gray-50"
          >
            CANCEL
          </Button>
          <Button onClick={onApply} className="flex-1 bg-main hover:bg-purple-700 text-white">
            APPLY
          </Button>
        </div>
      </div>
    </CustomDropdown>
  )
}
