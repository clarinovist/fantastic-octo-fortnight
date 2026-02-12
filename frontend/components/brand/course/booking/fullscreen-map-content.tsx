"use client"

import { Button } from "@/components/ui/button"
import { Map, Marker, useApiIsLoaded, useMap } from "@vis.gl/react-google-maps"
import { LocateFixed } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useMapAutocomplete } from "./hooks/use-map-autocomplete"
import { useMapOverlay } from "./hooks/use-map-overlay"
import { BlinkingLocationDot } from "./blinking-location-dot"

interface FullscreenMapContentProps {
  tutorLocation: { lat: number; lng: number }
  studentLocation: { lat: number; lng: number } | null
  setStudentLocation: (location: { lat: number; lng: number; address?: string }) => void
  getCurrentLocation: () => void
  isGettingLocation: boolean
  distance: number | null
}

export function FullscreenMapContent({
  tutorLocation,
  studentLocation,
  setStudentLocation,
  getCurrentLocation,
  isGettingLocation,
  distance,
}: FullscreenMapContentProps) {
  const map = useMap()
  const isLoaded = useApiIsLoaded()
  const [studentAddress, setStudentAddress] = useState("")
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [currentGPSLocation, setCurrentGPSLocation] = useState<{ lat: number; lng: number } | null>(null)
<<<<<<< HEAD
  const [isGettingGPSLocation, setIsGettingGPSLocation] = useState(false)
=======
  const [, setIsGettingGPSLocation] = useState(false)
>>>>>>> 1a19ced (chore: update service folders from local)

  const { searchInputRef } = useMapAutocomplete({
    setStudentLocation,
    onAutocompleteStateChange: setIsAutocompleteOpen,
  })

  // Initialize tutor area overlay for fullscreen map
  useMapOverlay({
    tutorLocation,
    isFullscreen: true,
  })

  const isValidCoordinate = (lat: number, lng: number) => {
    return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)
  }

  // Auto-check location permission and get GPS location for blinking indicator only
  useEffect(() => {
    const checkLocationPermission = async () => {
      if (!navigator.geolocation) return

      const geolocation = navigator.geolocation

      try {
        // Check if permissions API is available
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
<<<<<<< HEAD
          
=======

>>>>>>> 1a19ced (chore: update service folders from local)
          if (permission.state === 'granted') {
            // Permission already granted, get location for indicator only
            setIsGettingGPSLocation(true)
            geolocation.getCurrentPosition(
              (position: GeolocationPosition) => {
                setCurrentGPSLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                })
                setIsGettingGPSLocation(false)
              },
              (error: GeolocationPositionError) => {
                console.error("GPS location error:", error)
                setIsGettingGPSLocation(false)
              }
            )
          }
          // Don't prompt for permission automatically - only show indicator if already granted
        }
      } catch (error) {
        console.error("Permission check error:", error)
        setIsGettingGPSLocation(false)
      }
    }

    // Only auto-check if no GPS location is set yet
    if (!currentGPSLocation) {
      checkLocationPermission()
    }
  }, [currentGPSLocation])

  // Fetch address for student location
  const fetchStudentAddress = useCallback(
    (lat: number, lng: number) => {
      if (!isLoaded) return

      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[1] && results[1].formatted_address) {
          setStudentAddress(results[1].formatted_address)
        } else if (status === "OK" && results && results[0]) {
          setStudentAddress(results[0].formatted_address)
        } else {
          setStudentAddress("Address not found")
        }
      })
    },
    [isLoaded]
  )

  // Update student address when location changes
  useEffect(() => {
    if (studentLocation && isLoaded) {
      fetchStudentAddress(studentLocation.lat, studentLocation.lng)
    }
  }, [studentLocation, isLoaded, fetchStudentAddress])

  const handleClick = useCallback(
    (ev: google.maps.MapMouseEvent) => {
      if (!ev.latLng || isAutocompleteOpen) return
      const lat = ev.latLng.lat()
      const lng = ev.latLng.lng()
      setStudentLocation({ lat, lng })
      fetchStudentAddress(lat, lng)
      map?.panTo({ lat, lng })
    },
    [map, isAutocompleteOpen, setStudentLocation, fetchStudentAddress]
  )

  useEffect(() => {
    if (!map) return
    const listener = map.addListener("click", handleClick)
    return () => {
      window.google.maps.event.removeListener(listener)
    }
  }, [map, handleClick])

  // Center map to show both locations
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

  const mapCenter = useMemo(() => {
    const tutorLat = Number(tutorLocation.lat)
    const tutorLng = Number(tutorLocation.lng)

    if (!isValidCoordinate(tutorLat, tutorLng)) return null

    if (studentLocation) {
      const studentLat = Number(studentLocation.lat)
      const studentLng = Number(studentLocation.lng)

      if (isValidCoordinate(studentLat, studentLng)) {
        return {
          lat: (tutorLat + studentLat) / 2,
          lng: (tutorLng + studentLng) / 2,
        }
      }
    }

    return { lat: tutorLat, lng: tutorLng }
  }, [tutorLocation, studentLocation])

  const mapZoom = useMemo(() => {
    if (studentLocation && distance && distance > 0) {
      if (distance < 1) return 14
      if (distance < 5) return 12
      if (distance < 20) return 10
      return 8
    }
    return 13
  }, [studentLocation, distance])

  return (
    <div className="space-y-4 relative h-full">
      {/* Search Controls */}
      <div className="absolute top-4 right-4 z-50">
        <div className="flex gap-2 md:flex-row flex-col md:items-center items-end relative bg-white p-2 rounded-lg shadow-md">
          <div className="relative flex-1 w-full">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for your location..."
              className="w-full px-4 py-2 bg-white rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#7000FE] focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              variant="ghost"
              type="button"
              className="flex items-center gap-2"
            >
              {isGettingLocation ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7000FE]"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g clipPath="url(#clip0_1459_920)">
                    <path
                      d="M10.32 0V3.15984C6.70656 3.8472 3.8472 6.70656 3.15984 10.32H0V13.68H3.15984C3.8472 17.2934 6.70656 20.1528 10.32 20.8402V24H13.68V20.8402C17.2934 20.1528 20.1528 17.2934 20.8402 13.68H24V10.32H20.8402C20.1528 6.70656 17.2934 3.8472 13.68 3.15984V0H10.32ZM12 5.4C12.8674 5.39762 13.7267 5.56672 14.5285 5.89756C15.3303 6.2284 16.0589 6.71446 16.6722 7.3278C17.2855 7.94114 17.7716 8.66966 18.1024 9.47148C18.4333 10.2733 18.6024 11.1326 18.6 12C18.6024 12.8674 18.4333 13.7267 18.1024 14.5285C17.7716 15.3303 17.2855 16.0589 16.6722 16.6722C16.0589 17.2855 15.3303 17.7716 14.5285 18.1024C13.7267 18.4333 12.8674 18.6024 12 18.6C11.1326 18.6024 10.2733 18.4333 9.47148 18.1024C8.66966 17.7716 7.94114 17.2855 7.3278 16.6722C6.71446 16.0589 6.2284 15.3303 5.89756 14.5285C5.56672 13.7267 5.39762 12.8674 5.4 12C5.39762 11.1326 5.56672 10.8537 5.89756 9.47148C6.2284 8.66966 6.71446 7.94114 7.3278 7.3278C7.94114 6.71446 8.66966 6.2284 9.47148 5.89756C10.2733 5.56672 11.1326 5.39762 12 5.4Z"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1459_920">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              )}
              <span className="text-sm">Use my location</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-full">
        {mapCenter && (
          <Map
            defaultCenter={mapCenter}
            defaultZoom={mapZoom}
            disableDefaultUI
            style={{
              width: "100%",
              height: "100%",
              minHeight: "500px",
              borderRadius: "8px",
              pointerEvents: isAutocompleteOpen ? "none" : "auto",
            }}
          >
            {/* Student Marker - manually set location */}
            {studentLocation && isValidCoordinate(studentLocation.lat, studentLocation.lng) && (
              <Marker
                position={{
                  lat: studentLocation.lat,
                  lng: studentLocation.lng,
                }}
                title="Your Selected Location"
              />
            )}

            {/* Blinking Location Dot - GPS indicator only */}
            {currentGPSLocation && isValidCoordinate(currentGPSLocation.lat, currentGPSLocation.lng) && (
              <BlinkingLocationDot
                position={{
                  lat: currentGPSLocation.lat,
                  lng: currentGPSLocation.lng,
                }}
                isVisible={true}
              />
            )}
          </Map>
        )}

        {/* Map Control Button */}
        <div className="absolute bottom-35 right-4 z-50">
          {studentLocation && tutorLocation && (
            <Button
              variant="outline"
              onClick={centerBothLocations}
              disabled={!isLoaded}
              className="w-12 h-12 p-0 rounded-full border-2 border-[#7000FE] bg-white text-[#7000FE] hover:bg-[#7000FE] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              title="Center map to show both locations"
            >
              <LocateFixed />
            </Button>
          )}
        </div>

        {/* Location Info */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          {distance && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Distance:</span> {distance.toFixed(1)} km
            </div>
          )}
          <p className="text-sm text-gray-600">Selected Location</p>
          <p className="text-gray-800 text-sm font-bold">
            {studentAddress || "Click on the map to select a location"}
          </p>
        </div>
      </div>
    </div>
  )
}
