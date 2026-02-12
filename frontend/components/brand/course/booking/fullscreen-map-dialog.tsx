"use client"

import { useEffect } from "react"
import { FullscreenMapContent } from "./fullscreen-map-content"

interface FullscreenMapDialogProps {
  isOpen: boolean
  onClose: () => void
  tutorLocation: { lat: number; lng: number }
  studentLocation: { lat: number; lng: number } | null
  setStudentLocation: (location: { lat: number; lng: number; address?: string }) => void
  getCurrentLocation: () => void
  isGettingLocation: boolean
  distance: number | null
}

export function FullscreenMapDialog({
  isOpen,
  onClose,
  tutorLocation,
  studentLocation,
  setStudentLocation,
  getCurrentLocation,
  isGettingLocation,
  distance,
}: FullscreenMapDialogProps) {
  // Handle escape key to close fullscreen dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    } else {
      // Force recreation of regular map overlay when dialog closes
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("recreate-map-overlay"))
      }, 100)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[95vw] h-[95vh] max-h-[900px] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Map View</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-500"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <FullscreenMapContent
            tutorLocation={tutorLocation}
            studentLocation={studentLocation}
            setStudentLocation={setStudentLocation}
            getCurrentLocation={getCurrentLocation}
            isGettingLocation={isGettingLocation}
            distance={distance}
          />
        </div>
      </div>
    </div>
  )
}
