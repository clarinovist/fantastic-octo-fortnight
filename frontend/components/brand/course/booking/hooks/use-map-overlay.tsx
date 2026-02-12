"use client"

import { useApiIsLoaded, useMap } from "@vis.gl/react-google-maps"
import { useCallback, useEffect, useRef } from "react"

interface UseMapOverlayProps {
  tutorLocation: { lat: number; lng: number }
  isFullscreen: boolean
}

export function useMapOverlay({ tutorLocation, isFullscreen }: UseMapOverlayProps) {
  const isLoaded = useApiIsLoaded()
  const map = useMap()
  const tutorAreaOverlayRef = useRef<google.maps.Circle | null>(null)
  const tutorMarkerRef = useRef<google.maps.Marker | null>(null)
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null)

  const isValidCoordinate = useCallback((lat: number, lng: number) => {
    return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)
  }, [])

  const cleanupOverlay = useCallback(() => {
    if (tutorAreaOverlayRef.current) {
      tutorAreaOverlayRef.current.setMap(null)
      tutorAreaOverlayRef.current = null
    }
    if (tutorMarkerRef.current) {
      tutorMarkerRef.current.setMap(null)
      tutorMarkerRef.current = null
    }
    if (zoomListenerRef.current) {
      google.maps.event.removeListener(zoomListenerRef.current)
      zoomListenerRef.current = null
    }
  }, [])

  const createTutorOverlay = useCallback(() => {
    if (!map || !isLoaded || !tutorLocation) return

    const tutorLat = Number(tutorLocation.lat)
    const tutorLng = Number(tutorLocation.lng)

    if (!isValidCoordinate(tutorLat, tutorLng)) return

    // Clean up existing overlays first
    cleanupOverlay()

    const tutorPosition = { lat: tutorLat, lng: tutorLng }

    // Function to calculate radius based on zoom level
    const calculateRadius = (zoom: number) => {
      const baseRadius = 1000 // 1km at zoom 13
      const baseZoom = 13
      const scaleFactor = Math.pow(2, baseZoom - zoom)
      return Math.max(baseRadius * scaleFactor, 100) // Minimum 100m radius
    }

    // Create circular area overlay for tutor location
    const circle = new google.maps.Circle({
      strokeColor: "#7000FE",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#7000FE",
      fillOpacity: 0.15,
      map: map,
      center: tutorPosition,
      radius: calculateRadius(map.getZoom() || 13),
    })

    tutorAreaOverlayRef.current = circle

    // Add zoom change listener to update radius
    zoomListenerRef.current = map.addListener("zoom_changed", () => {
      const newZoom = map.getZoom()
      if (newZoom && tutorAreaOverlayRef.current) {
        tutorAreaOverlayRef.current.setRadius(calculateRadius(newZoom))
      }
    })
  }, [map, isLoaded, tutorLocation, isValidCoordinate, cleanupOverlay])

  // Create tutor overlay when map and conditions are ready
  useEffect(() => {
    if (!map || !isLoaded) return

    // Wait for map to be fully initialized
    const timer = setTimeout(() => {
      createTutorOverlay()
    }, 200)

    return () => {
      clearTimeout(timer)
    }
  }, [map, isLoaded, tutorLocation, createTutorOverlay]) // Remove isFullscreen dependency

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupOverlay()
    }
  }, [cleanupOverlay])

  return {
    tutorAreaOverlayRef,
    tutorMarkerRef,
    zoomListenerRef,
    createTutorOverlay,
  }
}
