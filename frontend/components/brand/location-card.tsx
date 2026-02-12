"use client"

import type { BaseResponse, MeResponse } from "@/utils/types"
import { APIProvider, Map, Marker, useApiIsLoaded, useMap } from "@vis.gl/react-google-maps"
import { Loader2, Pencil, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Icon } from "../ui/icon"

const defaultCenter = {
  lat: -7.6069,
  lng: 110.8197,
}

interface LocationCardProps {
  onLocationUpdate?: (data: FormData) => Promise<BaseResponse<MeResponse>>
  currentLocation?: { lat: number; lng: number }
  apiKey: string
  className?: string
}

export function LocationCard({
  onLocationUpdate,
  currentLocation,
  apiKey,
  className,
}: LocationCardProps) {
  return (
    <APIProvider
      apiKey={apiKey}
      libraries={["places", "geocoding"]} // 👈 important!
    >
      <LocationContent
        apiKey={apiKey}
        onLocationUpdate={onLocationUpdate}
        currentLocation={currentLocation}
        className={className}
      />
    </APIProvider>
  )
}

function LocationContent({ onLocationUpdate, currentLocation, className }: LocationCardProps) {
  const [selectedPosition, setSelectedPosition] = useState(currentLocation || defaultCenter)
  const [address, setAddress] = useState("Loading address...")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const isLoaded = useApiIsLoaded()

  const fetchAddress = useCallback(
    (lat: number, lng: number) => {
      if (!isLoaded) return

      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[1] && results[1].formatted_address) {
          setAddress(results[1].formatted_address)
        } else if (status === "OK" && results && results[0]) {
          setAddress(results[0].formatted_address)
        } else {
          setAddress("Address not found")
        }
      })
    },
    [isLoaded]
  )

  useEffect(() => {
    if (isLoaded) {
      fetchAddress(selectedPosition.lat, selectedPosition.lng)
    }
  }, [isLoaded, selectedPosition.lat, selectedPosition.lng, fetchAddress])

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDialogOpen) {
        setIsDialogOpen(false)
      }
    }

    if (isDialogOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isDialogOpen])

  const handleSaveLocation = useCallback(
    async (newPosition: { lat: number; lng: number }) => {
      if (!onLocationUpdate) {
        setSelectedPosition(newPosition)
        fetchAddress(newPosition.lat, newPosition.lng)
        setIsDialogOpen(false)
        return
      }

      setIsSaving(true)
      try {
        const formData = new FormData()
        formData.append("latitude", newPosition.lat.toString())
        formData.append("longitude", newPosition.lng.toString())

        const response = await onLocationUpdate(formData)

        if (response.success) {
          setSelectedPosition(newPosition)
          fetchAddress(newPosition.lat, newPosition.lng)
          setIsDialogOpen(false)
        } else {
          alert("Failed to update location. Please try again.")
        }
      } catch (error) {
        console.error("Error updating location:", error)
        alert("Failed to update location. Please try again.")
      } finally {
        setIsSaving(false)
      }
    },
    [onLocationUpdate, fetchAddress]
  )

  return (
    <>
      <div
        className={`rounded-2xl shadow-md overflow-hidden relative max-w-full w-full ${className}`}
      >
        {/* Map Preview */}
        <div className="relative h-[250px] w-full">
          <Map
            defaultCenter={selectedPosition}
            zoom={15}
            key={`${selectedPosition.lat}-${selectedPosition.lng}`}
            disableDefaultUI
          >
            <Marker position={selectedPosition} />
          </Map>

          {/* Location Info - Floating on map */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 m-3 rounded-lg shadow-lg">
            <p className="text-sm text-gray-600">Location</p>
            <p className="text-gray-800 text-sm font-bold">{address}</p>
          </div>
        </div>

        {/* Edit Button */}
        <button
          className="absolute top-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg shadow-md"
          onClick={() => setIsDialogOpen(true)}
        >
          <Pencil size={18} />
        </button>
      </div>

      {/* Custom Dialog */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDialogOpen(false)}
          />

          {/* Dialog Content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[90vw] h-[90vh] max-h-[800px] m-4 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Edit Location</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                disabled={isSaving}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <MapWithClick
                selectedPosition={selectedPosition}
                setSelectedPosition={setSelectedPosition}
                fetchAddress={fetchAddress}
                onSave={handleSaveLocation}
                isSaving={isSaving}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MapWithClick({
  selectedPosition,
  onSave,
  isSaving,
}: {
  selectedPosition: { lat: number; lng: number }
  setSelectedPosition: (pos: { lat: number; lng: number }) => void
  fetchAddress: (lat: number, lng: number) => void
  onSave: (position: { lat: number; lng: number }) => void
  isSaving?: boolean
}) {
  const map = useMap()
  const isLoaded = useApiIsLoaded()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)

  // Local temporary position state for the dialog
  const [tempPosition, setTempPosition] = useState(selectedPosition)
  const [tempAddress, setTempAddress] = useState("")

  // Update temp position when dialog opens with current selected position
  useEffect(() => {
    setTempPosition(selectedPosition)
  }, [selectedPosition])

  // Fetch address for temporary position
  const fetchTempAddress = useCallback(
    (lat: number, lng: number) => {
      if (!isLoaded) return

      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[1] && results[1].formatted_address) {
          setTempAddress(results[1].formatted_address)
        } else if (status === "OK" && results && results[0]) {
          setTempAddress(results[0].formatted_address)
        } else {
          setTempAddress("Address not found")
        }
      })
    },
    [isLoaded]
  )

  // Fetch temp address when temp position changes
  useEffect(() => {
    fetchTempAddress(tempPosition.lat, tempPosition.lng)
  }, [tempPosition, fetchTempAddress])

  const handleClick = useCallback(
    (ev: google.maps.MapMouseEvent) => {
      if (!ev.latLng || isAutocompleteOpen) return // Block map clicks when autocomplete is open
      const lat = ev.latLng.lat()
      const lng = ev.latLng.lng()
      setTempPosition({ lat, lng })
      map?.panTo({ lat, lng })
    },
    [map, isAutocompleteOpen]
  )

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.")
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setTempPosition({ lat, lng })
        map?.panTo({ lat, lng })
        setIsGettingLocation(false)
      },
      error => {
        console.error("Error getting current location:", error)
        alert("Unable to retrieve your location. Please try again or search for a location.")
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }, [map])

  // Initialize Places Autocomplete
  useEffect(() => {
    if (!isLoaded || !searchInputRef.current) return

    const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
      fields: ["geometry", "formatted_address"],
    })

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()

      // Only update temporary position, keep dialog open
      setTempPosition({ lat, lng })
      map?.panTo({ lat, lng })

      // Clear search input after a brief delay to allow autocomplete to finish
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.value = ""
        }
      }, 100)

      setIsAutocompleteOpen(false)
    })

    autocompleteRef.current = autocomplete

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, map])

  // Handle input focus/blur to track autocomplete state
  useEffect(() => {
    const input = searchInputRef.current
    if (!input) return

    const handleFocus = () => setIsAutocompleteOpen(true)
    const handleBlur = () => {
      // Longer delay to ensure autocomplete selection completes
      setTimeout(() => setIsAutocompleteOpen(false), 300)
    }

    input.addEventListener("focus", handleFocus)
    input.addEventListener("blur", handleBlur)

    return () => {
      input.removeEventListener("focus", handleFocus)
      input.removeEventListener("blur", handleBlur)
    }
  }, [])

  useEffect(() => {
    if (!map) return
    const listener = map.addListener("click", handleClick)
    return () => {
      window.google.maps.event.removeListener(listener)
    }
  }, [map, handleClick])

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

  const handleReset = useCallback(() => {
    setTempPosition(selectedPosition)
    map?.panTo(selectedPosition)
  }, [map, selectedPosition])

  const handleSave = useCallback(() => {
    onSave(tempPosition)
  }, [onSave, tempPosition])

  return (
    <div className="space-y-4 relative h-full">
      {/* Search Controls - Outside of map container */}
      <div className="absolute top-4 right-2">
        <div className="flex gap-2 md:flex-row flex-col md:items-center items-end relative z-50 bg-white p-2 rounded-lg shadow-md">
          <div className="relative flex-1 w-full">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location..."
              className="w-full px-4 py-2 bg-white rounded-lg shadow-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              onKeyDown={e => {
                // Prevent Enter key from submitting and potentially closing dialog
                if (e.key === "Enter") {
                  e.preventDefault()
                }
              }}
              disabled={isSaving}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCurrentLocation}
              disabled={isGettingLocation || isSaving}
              variant="ghost"
              type="button"
            >
              {isGettingLocation ? (
                <Loader2 className="animate-spin size-20" />
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_1459_920)">
                      <path
                        d="M10.32 0V3.15984C6.70656 3.8472 3.8472 6.70656 3.15984 10.32H0V13.68H3.15984C3.8472 17.2934 6.70656 20.1528 10.32 20.8402V24H13.68V20.8402C17.2934 20.1528 20.1528 17.2934 20.8402 13.68H24V10.32H20.8402C20.1528 6.70656 17.2934 3.8472 13.68 3.15984V0H10.32ZM12 5.4C12.8674 5.39762 13.7267 5.56672 14.5285 5.89756C15.3303 6.2284 16.0589 6.71446 16.6722 7.3278C17.2855 7.94114 17.7716 8.66966 18.1024 9.47148C18.4333 10.2733 18.6024 11.1326 18.6 12C18.6024 12.8674 18.4333 13.7267 18.1024 14.5285C17.7716 15.3303 17.2855 16.0589 16.6722 16.6722C16.0589 17.2855 15.3303 17.7716 14.5285 18.1024C13.7267 18.4333 12.8674 18.6024 12 18.6C11.1326 18.6024 10.2733 18.4333 9.47148 18.1024C8.66966 17.7716 7.94114 17.2855 7.3278 16.6722C6.71446 16.0589 6.2284 15.3303 5.89756 14.5285C5.56672 13.7267 5.39762 12.8674 5.4 12C5.39762 11.1326 5.56672 10.2733 5.89756 9.47148C6.2284 8.66966 6.71446 7.94114 7.3278 7.3278C7.94114 6.71446 8.66966 6.2284 9.47148 5.89756C10.2733 5.56672 11.1326 5.39762 12 5.4Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1459_920">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span>use my location</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleReset}
              disabled={isSaving}
            >
              <X size={24} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="bg-green-600 hover:bg-green-600"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" color="white" />
              ) : (
                <Icon name="check" fill="white" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-full">
        <Map
          defaultCenter={tempPosition}
          defaultZoom={15}
          disableDefaultUI
          style={{
            width: "100%",
            height: "100%",
            minHeight: "500px",
            borderRadius: "8px",
            pointerEvents: isAutocompleteOpen ? "none" : "auto", // Disable map interactions when autocomplete is open
          }}
        >
          <Marker position={tempPosition} />
        </Map>

        {/* Temporary Location Info - Floating on map */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">Selected Location</p>
          <p className="text-gray-800 text-sm font-bold">{tempAddress || "Loading address..."}</p>
        </div>
      </div>
    </div>
  )
}
