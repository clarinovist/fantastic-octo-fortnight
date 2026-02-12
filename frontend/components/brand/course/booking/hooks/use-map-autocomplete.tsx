"use client"

import { useApiIsLoaded } from "@vis.gl/react-google-maps"
import { useEffect, useRef } from "react"

interface UseMapAutocompleteProps {
  setStudentLocation: (location: { lat: number; lng: number; address?: string }) => void
  onAutocompleteStateChange?: (isOpen: boolean) => void
}

export function useMapAutocomplete({ 
  setStudentLocation, 
  onAutocompleteStateChange 
}: UseMapAutocompleteProps) {
  const isLoaded = useApiIsLoaded()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Initialize Places Autocomplete
  useEffect(() => {
    if (!isLoaded || !searchInputRef.current || !window.google?.maps?.places?.Autocomplete) {
      return
    }

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ["geometry", "formatted_address", "name"],
      types: ["establishment", "geocode"],
    })

    const handlePlaceChanged = () => {
      const place = autocomplete.getPlace()

      if (!place.geometry?.location) {
        return
      }

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      setStudentLocation({
        lat,
        lng,
        address: place.formatted_address || place.name,
      })

      // Clear search input
      if (searchInputRef.current) {
        searchInputRef.current.value = ""
      }

      onAutocompleteStateChange?.(false)
    }

    autocomplete.addListener("place_changed", handlePlaceChanged)
    autocompleteRef.current = autocomplete

    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [isLoaded, setStudentLocation, onAutocompleteStateChange])

  // Handle input focus/blur to track autocomplete state
  useEffect(() => {
    const input = searchInputRef.current
    if (!input || !onAutocompleteStateChange) return

    const handleFocus = () => onAutocompleteStateChange(true)
    const handleBlur = () => {
      setTimeout(() => onAutocompleteStateChange(false), 300)
    }

    input.addEventListener("focus", handleFocus)
    input.addEventListener("blur", handleBlur)

    return () => {
      input.removeEventListener("focus", handleFocus)
      input.removeEventListener("blur", handleBlur)
    }
  }, [onAutocompleteStateChange])

  // Add global styles for autocomplete dropdown z-index
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      .pac-container {
        z-index: 999999 !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        border-radius: 8px !important;
        border: 1px solid #e5e7eb !important;
        margin-top: 4px !important;
        pointer-events: auto !important;
      }
      .pac-item {
        cursor: pointer !important;
        padding: 8px 12px !important;
        pointer-events: auto !important;
      }
      .pac-item:hover {
        background-color: #f3f4f6 !important;
      }
      .pac-item-selected {
        background-color: #e5e7eb !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return {
    searchInputRef,
    autocompleteRef,
  }
}