"use client"

import { Button } from "@/components/ui/button"
import { useMap } from "@vis.gl/react-google-maps"
import { LocateFixed } from "lucide-react"
import { useCallback } from "react"

interface MapControlsProps {
  tutorLocation: { lat: number; lng: number }
  studentLocation: { lat: number; lng: number } | null
  isLoaded: boolean
  onFullscreenToggle: () => void
}

export function MapControls({
  tutorLocation,
  studentLocation,
  isLoaded,
  onFullscreenToggle,
}: MapControlsProps) {
  const map = useMap()

  const isValidCoordinate = (lat: number, lng: number) => {
    return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)
  }

  const centerBothLocations = useCallback(() => {
    if (!map || !tutorLocation || !studentLocation) return

    const tutorLat = Number(tutorLocation.lat)
    const tutorLng = Number(tutorLocation.lng)
    const studentLat = Number(studentLocation.lat)
    const studentLng = Number(studentLocation.lng)

    if (!isValidCoordinate(tutorLat, tutorLng) || !isValidCoordinate(studentLat, studentLng)) return

    const bounds = new google.maps.LatLngBounds()
    bounds.extend({ lat: tutorLat, lng: tutorLng })
    bounds.extend({ lat: studentLat, lng: studentLng })

    map.fitBounds(bounds, { top: 20, right: 20, bottom: 20, left: 20 })
  }, [map, tutorLocation, studentLocation])

  return (
    <div className="absolute bottom-2 right-2 z-50 flex gap-2">
      {/* Fullscreen Button */}
      <Button
        variant="outline"
        onClick={onFullscreenToggle}
        disabled={!isLoaded}
        className="w-10 h-10 p-0 rounded-full border-2 border-[#7000FE] bg-white text-[#7000FE] hover:bg-[#7000FE] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        title="View map in fullscreen"
      >
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
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </Button>

      {/* Center Both Locations Button */}
      {studentLocation && tutorLocation && (
        <Button
          variant="outline"
          onClick={centerBothLocations}
          disabled={!isLoaded}
          className="w-10 h-10 p-0 rounded-full border-2 border-[#7000FE] bg-white text-[#7000FE] hover:bg-[#7000FE] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          title="Center map to show both locations"
        >
          <LocateFixed />
        </Button>
      )}
    </div>
  )
}
