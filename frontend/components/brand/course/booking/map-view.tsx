"use client"

import { Map, Marker, useApiIsLoaded } from "@vis.gl/react-google-maps"
import { useCallback, useMemo, useState, useEffect } from "react"
import { LocationSearch } from "./location-search"
import { MapControls } from "./map-controls"
import { useMapOverlay } from "./hooks/use-map-overlay"
import { BlinkingLocationDot } from "./blinking-location-dot"

interface MapViewProps {
  tutorLocation: { lat: number; lng: number }
  studentLocation: { lat: number; lng: number } | null
  setStudentLocation: (location: { lat: number; lng: number; address?: string }) => void
  distance: number | null
  getCurrentLocation: () => void
  isGettingLocation: boolean
  onFullscreenToggle: () => void
  isFullscreen: boolean
}

export function MapView({
  tutorLocation,
  studentLocation,
  setStudentLocation,
  distance,
  getCurrentLocation,
  isGettingLocation,
  onFullscreenToggle,
  isFullscreen,
}: MapViewProps) {
  const isLoaded = useApiIsLoaded()
  const [currentGPSLocation, setCurrentGPSLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isGettingGPSLocation, setIsGettingGPSLocation] = useState(false)

  // Helper function to check if coordinates are valid
  const isValidCoordinate = useCallback((lat: number, lng: number) => {
    return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)
  }, [])

  // Auto-check location permission and get GPS location for blinking indicator only
  useEffect(() => {
    const checkLocationPermission = async () => {
      if (!navigator.geolocation) return

      const geolocation = navigator.geolocation

      try {
        // Check if permissions API is available
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          
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

  const mapCenter = useMemo(() => {
    const tutorLat = Number(tutorLocation.lat)
    const tutorLng = Number(tutorLocation.lng)

    if (!isValidCoordinate(tutorLat, tutorLng)) {
      return null
    }

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
  }, [tutorLocation, studentLocation, isValidCoordinate])

  const mapZoom = useMemo(() => {
    if (studentLocation && distance && distance > 0) {
      if (distance < 1) return 14
      if (distance < 5) return 12
      if (distance < 20) return 10
      return 8
    }
    return 13
  }, [studentLocation, distance])

  // Initialize tutor area overlay
  useMapOverlay({
    tutorLocation,
    isFullscreen: false, // Always false for regular map view
  })

  const shouldRenderMap = mapCenter !== null

  return (
    <>
      <LocationSearch
        setStudentLocation={setStudentLocation}
        getCurrentLocation={getCurrentLocation}
        isGettingLocation={isGettingLocation}
        isLoaded={isLoaded}
      />

      {/* Map */}
      <div className="w-full h-64 rounded-lg overflow-hidden border relative">
        {shouldRenderMap && mapCenter ? (
          <>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={mapZoom}
              disableDefaultUI
              onClick={e => {
                if (e.detail.latLng) {
                  setStudentLocation({
                    lat: Number(e.detail.latLng.lat),
                    lng: Number(e.detail.latLng.lng),
                  })
                }
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

            <MapControls
              tutorLocation={tutorLocation}
              studentLocation={studentLocation}
              isLoaded={isLoaded}
              onFullscreenToggle={onFullscreenToggle}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <p className="text-gray-500">
              {!mapCenter
                ? "Unable to load map - tutor location not available"
                : "Loading map..."}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
