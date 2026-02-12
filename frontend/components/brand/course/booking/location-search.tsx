"use client"

import { Button } from "@/components/ui/button"
import { useMapAutocomplete } from "./hooks/use-map-autocomplete"

interface LocationSearchProps {
  setStudentLocation: (location: { lat: number; lng: number; address?: string }) => void
  getCurrentLocation: () => void
  isGettingLocation: boolean
  isLoaded: boolean
}

export function LocationSearch({
  setStudentLocation,
  getCurrentLocation,
  isGettingLocation,
  isLoaded,
}: LocationSearchProps) {
  const { searchInputRef } = useMapAutocomplete({ setStudentLocation })

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for your location..."
          className="w-full px-4 py-2 border border-main rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7000FE] focus:border-transparent"
          disabled={!isLoaded}
        />
        <Button
          variant="ghost"
          onClick={getCurrentLocation}
          disabled={isGettingLocation || !isLoaded}
          className="flex items-center gap-2 px-4 py-2 bg-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          title="Use my current location"
        >
          {isGettingLocation ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7000FE]"></div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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
          <span className="text-sm font-medium">
            {isGettingLocation ? "Getting..." : "Use my location"}
          </span>
        </Button>
      </div>
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7000FE]"></div>
        </div>
      )}
    </div>
  )
}
