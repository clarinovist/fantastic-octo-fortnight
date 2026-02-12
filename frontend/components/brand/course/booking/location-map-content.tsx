"use client"

import type { LocationMapContentProps } from "@/utils/types/booking"
import { useState } from "react"
import { FullscreenMapDialog } from "./fullscreen-map-dialog"
import { MapView } from "./map-view"

export function LocationMapContent({
  tutorLocation,
  studentLocation,
  setStudentLocation,
  distance,
  getCurrentLocation,
  isGettingLocation,
}: LocationMapContentProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [mapKey, setMapKey] = useState(0) // Add key to force re-render

  const handleFullscreenClose = () => {
    setIsFullscreenOpen(false)
    // Force regular map to re-render by changing key
    setTimeout(() => {
      setMapKey(prev => prev + 1)
    }, 100)
  }

  return (
    <>
      <div className="mt-6 space-y-4">
        <h4 className="font-bold text-lg">Location & Distance</h4>

        {/* Distance info */}
        {distance && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Approximate distance:</span> {distance.toFixed(1)} km
          </div>
        )}

        <MapView
          key={mapKey} // Add key prop to force re-render
          tutorLocation={tutorLocation}
          studentLocation={studentLocation}
          setStudentLocation={setStudentLocation}
          distance={distance}
          getCurrentLocation={getCurrentLocation}
          isGettingLocation={isGettingLocation}
          onFullscreenToggle={() => setIsFullscreenOpen(true)}
          isFullscreen={false}
        />
      </div>

      <FullscreenMapDialog
        isOpen={isFullscreenOpen}
        onClose={handleFullscreenClose}
        tutorLocation={tutorLocation}
        studentLocation={studentLocation}
        setStudentLocation={setStudentLocation}
        getCurrentLocation={getCurrentLocation}
        isGettingLocation={isGettingLocation}
        distance={distance}
      />
    </>
  )
}
