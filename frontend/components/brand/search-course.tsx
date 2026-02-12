"use client"

import { Button } from "@/components/ui/button"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { clientFetch } from "@/services/client"
import type { CourseCategory, Location } from "@/utils/types"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

interface SearchCourseProps {
  className?: string
}

// Loading skeleton for SearchCourse
const SearchCourseSkeleton = () => {
  return (
    <div className={`w-full max-w-2xl relative`}>
      <div className="flex bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden animate-pulse">
        <div className="flex-1 h-14 bg-gray-200"></div>
        <div className="w-px bg-gray-300"></div>
        <div className="flex-1 h-14 bg-gray-200"></div>
        <div className="w-14 h-14 bg-gray-200"></div>
      </div>
    </div>
  )
}

// Mobile Bottom Sheet Component
const MobileSearchBottomSheet = ({
  isOpen,
  onClose,
  searchValue,
  locationSearchValue,
  isLocationLoading,
  showLocationDropdown,
  courseCategoryIcon,
  locationIcon,
  searchIcon,
  nearMeIcon,
  handleCategorySelect,
  handleLocationSelect,
  handleCategoryChange,
  handleLocationChange,
  handleLocationFocus,
  handleLocationBlur,
  handleNearMeSelect,
  buildSearchUrl,
  showNearMeOption,
}: {
  isOpen: boolean
  onClose: () => void
  searchValue: string
  locationSearchValue: string
  isLocationLoading: boolean
  showLocationDropdown: boolean
  courseCategoryIcon: React.ReactNode
  locationIcon: React.ReactNode
  searchIcon: React.ReactNode
  nearMeIcon: React.ReactNode
  handleCategorySelect: (category: CourseCategory) => void
  handleLocationSelect: (location: Location) => void
  handleCategoryChange: (value: string) => void
  handleLocationChange: (value: string) => void
  handleLocationFocus: () => void
  handleLocationBlur: () => void
  handleNearMeSelect: () => void
  buildSearchUrl: () => string
  showNearMeOption: boolean
}) => {
  // Focus on category input when bottom sheet opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        const categoryInput = document.querySelector(
          ".bottom-sheet-category-input input"
        ) as HTMLInputElement
        if (categoryInput) {
          categoryInput.focus()
        }
      }, 300) // Increased delay to account for animation

      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 top-0 left-0 right-0 bg-white animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-end px-6 py-4">
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between p-8 pt-0">
          {/* Content */}
          <div className="flex-1 p-4 rounded-[24px] border-4 border-[#7000FE80]">
            {/* Category Search */}
            <div className="bottom-sheet-category-input">
              <SearchableSelect<CourseCategory>
                placeholder="Cari les apa?"
                icon={courseCategoryIcon}
                value={searchValue}
                onChange={handleCategoryChange}
                onSelect={handleCategorySelect}
                apiEndpoint="/api/v1/course-categories"
                getDisplayText={category => category.name}
                dropdownClassName="left-0 right-0 w-full"
                renderItem={(category, index, isSelected) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategorySelect(category)
                    }}
                    className={`w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-main-lighten-25 ${
                      isSelected ? "bg-purple-100" : ""
                    }`}
                  >
                    {searchIcon}
                    <span className="text-gray-700">
                      <span className="text-black font-medium">{category.name}</span>
                    </span>
                  </button>
                )}
              />
            </div>

            <div className="w-full h-[0.9px] bg-[#DFDFDF] my-2 rounded" />

            {/* Location Search */}
            <div className="space-y-2 relative">
              <SearchableSelect<Location>
                placeholder="Cari les dimana?"
                icon={locationIcon}
                value={locationSearchValue}
                onChange={handleLocationChange}
                onSelect={handleLocationSelect}
                onFocus={handleLocationFocus}
                onBlur={handleLocationBlur}
                apiEndpoint="/api/v1/locations"
                getDisplayText={location => location.name}
                getSecondaryText={location =>
                  location.fullName && location.fullName !== location.name
                    ? location.fullName
                    : null
                }
                dropdownClassName="left-0 right-0 w-full"
                forceShowDropdown={showLocationDropdown}
                renderItem={(location, index, isSelected) => (
                  <button
                    key={location.id}
                    onClick={() => {
                      handleLocationSelect(location)
                    }}
                    className={`w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-main-lighten-25 ${
                      isSelected ? "bg-purple-100" : ""
                    }`}
                  >
                    {searchIcon}
                    <span className="text-gray-700">
                      <span className="text-black font-medium">{location.name}</span>
                      {location.fullName && location.fullName !== location.name && (
                        <span className="text-gray-500 text-sm block">{location.fullName}</span>
                      )}
                    </span>
                  </button>
                )}
              />

              {/* Near Me Option */}
              {showNearMeOption && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-60 mt-2 py-2">
                  <button
                    onClick={handleNearMeSelect}
                    disabled={isLocationLoading}
                    className="w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-main-lighten-25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLocationLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    ) : (
                      nearMeIcon
                    )}
                    <span className="text-gray-700">
                      <span className="text-black font-medium">
                        {isLocationLoading ? "Mendapatkan lokasi..." : "Di Sekitar Saya"}
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div>
            <Link href={buildSearchUrl()} onClick={onClose}>
              <Button variant="ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M0.326395 20.7495L5.00017 16.0766C5.21113 15.8656 5.49709 15.7485 5.79711 15.7485H6.56123C5.26738 14.0939 4.49857 12.0129 4.49857 9.74905C4.49857 4.36364 8.86296 0 14.2493 0C19.6356 0 24 4.36364 24 9.74905C24 15.1345 19.6356 19.4981 14.2493 19.4981C11.9851 19.4981 9.90366 18.7294 8.24885 17.4358V18.1998C8.24885 18.4998 8.13165 18.7857 7.9207 18.9966L3.24692 23.6696C2.80626 24.1101 2.09371 24.1101 1.65774 23.6696L0.331083 22.3431C-0.109575 21.9025 -0.109575 21.1901 0.326395 20.7495ZM14.2493 15.7485C17.5636 15.7485 20.2497 13.0675 20.2497 9.74905C20.2497 6.43531 17.5683 3.74963 14.2493 3.74963C10.935 3.74963 8.24885 6.43062 8.24885 9.74905C8.24885 13.0628 10.9303 15.7485 14.2493 15.7485Z"
                    fill="#7000FE"
                    fillOpacity="0.5"
                  />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Internal component that uses useSearchParams
function SearchCourseInternal(props: SearchCourseProps) {
  const [searchValue, setSearchValue] = useState("")
  const [locationSearchValue, setLocationSearchValue] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )
  const [isLocationFocused, setIsLocationFocused] = useState(false)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMobileBottomSheetOpen, setIsMobileBottomSheetOpen] = useState(false)

  const searchParams = useSearchParams()

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Function to fetch category by ID using clientFetch
  const fetchCategoryById = async (categoryId: string): Promise<CourseCategory | null> => {
    try {
      const category = await clientFetch<CourseCategory>(`/api/v1/course-categories/${categoryId}`)
      return category
    } catch (error) {
      console.error("Error fetching category:", error)
      return null
    }
  }

  // Function to fetch location by ID using clientFetch
  const fetchLocationById = async (locationId: string): Promise<Location | null> => {
    try {
      const location = await clientFetch<Location>(`/api/v1/locations/${locationId}`)
      return location
    } catch (error) {
      console.error("Error fetching location:", error)
      return null
    }
  }

  // Initialize component with URL parameters - only after hydration
  useEffect(() => {
    if (!isHydrated) return

    const initializeFromUrl = async () => {
      setIsInitializing(true)

      try {
        const courseCategoryId = searchParams.get("courseCategoryId")
        const courseCategoryName = searchParams.get("courseCategoryName")
        const locationId = searchParams.get("locationId")
        const locationName = searchParams.get("locationName")
        const latitude = searchParams.get("latitude")
        const longitude = searchParams.get("longitude")

        // Initialize category
        if (courseCategoryId && courseCategoryName) {
          if (courseCategoryName) {
            setSearchValue(courseCategoryName)
            setSelectedCategory({
              id: courseCategoryId,
              name: courseCategoryName,
            } as CourseCategory)
          } else {
            // Fetch category details if name is not provided
            const category = await fetchCategoryById(courseCategoryId)
            if (category) {
              setSearchValue(category.name)
              setSelectedCategory(category)
            }
          }
        }

        // Initialize location
        if (latitude && longitude) {
          // User location case
          const userCoords = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
          setUserLocation(userCoords)
          setLocationSearchValue("Di Sekitar Saya")
          setSelectedLocation({
            id: "near-me",
            name: "Di Sekitar Saya",
            fullName: `${userCoords.latitude.toFixed(6)}, ${userCoords.longitude.toFixed(6)}`,
          } as Location)
        } else if (locationId && locationName) {
          if (locationName) {
            setLocationSearchValue(locationName)
            setSelectedLocation({
              id: locationId,
              name: locationName,
            } as Location)
          } else {
            // Fetch location details if name is not provided
            const location = await fetchLocationById(locationId)
            if (location) {
              setLocationSearchValue(location.name)
              setSelectedLocation(location)
            }
          }
        }
      } catch (error) {
        console.error("Error initializing from URL:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeFromUrl()
  }, [searchParams, isHydrated])

  const courseCategoryIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="24"
      viewBox="0 0 20 24"
      fill="none"
      className="size-4"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.5 0C1.83696 0 1.20107 0.252856 0.732233 0.702944C0.263392 1.15303 0 1.76348 0 2.4V20.4C0 21.3548 0.395088 22.2705 1.09835 22.9456C1.80161 23.6207 2.75544 24 3.75 24H18.75C19.0815 24 19.3995 23.8736 19.6339 23.6485C19.8683 23.4235 20 23.1183 20 22.8C20 22.4817 19.8683 22.1765 19.6339 21.9515C19.3995 21.7264 19.0815 21.6 18.75 21.6H16.25V19.2H18.75C19.0815 19.2 19.3995 19.0736 19.6339 18.8485C19.8683 18.6235 20 18.3183 20 18V2.4C20 1.76348 19.7366 1.15303 19.2678 0.702944C18.7989 0.252856 18.163 0 17.5 0H7.5V19.2H13.75V21.6H3.75C3.41848 21.6 3.10054 21.4736 2.86612 21.2485C2.6317 21.0235 2.5 20.7183 2.5 20.4C2.5 20.0817 2.6317 19.7765 2.86612 19.5515C3.10054 19.3264 3.41848 19.2 3.75 19.2H5V0H2.5Z"
        fill="#7000FE"
      />
    </svg>
  )

  const locationIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="24"
      viewBox="0 0 22 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M3.22141 3.06362C7.51673 -1.02121 14.4815 -1.02121 18.778 3.06362C23.0746 7.14846 23.0734 13.7675 18.778 17.8524L17.2785 19.2612C15.8492 20.5925 14.4149 21.9189 12.9756 23.2404C12.4455 23.7276 11.737 24 10.9997 24C10.2624 24 9.55394 23.7276 9.02388 23.2404L4.6136 19.1603C4.05942 18.6431 3.59536 18.2067 3.22141 17.8512C1.15877 15.89 0 13.2302 0 10.4568C0 7.68341 1.15877 5.02359 3.22141 3.06242M10.9997 7.18329C10.502 7.18329 10.0092 7.27649 9.54936 7.45756C9.08954 7.63864 8.67173 7.90405 8.3198 8.23864C7.96787 8.57323 7.6887 8.97044 7.49824 9.4076C7.30777 9.84476 7.20974 10.3133 7.20974 10.7865C7.20974 11.2597 7.30777 11.7282 7.49824 12.1654C7.6887 12.6025 7.96787 12.9998 8.3198 13.3343C8.67173 13.6689 9.08954 13.9343 9.54936 14.1154C10.0092 14.2965 10.502 14.3897 10.9997 14.3897C12.0049 14.3897 12.9689 14.0101 13.6797 13.3343C14.3904 12.6586 14.7897 11.7421 14.7897 10.7865C14.7897 9.83086 14.3904 8.91437 13.6797 8.23864C12.9689 7.56291 12.0049 7.18329 10.9997 7.18329Z"
        fill="#7000FE"
      />
    </svg>
  )

  const searchIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className="size-4"
    >
      <path
        d="M0.326395 20.7495L5.00017 16.0766C5.21113 15.8656 5.49709 15.7485 5.79711 15.7485H6.56123C5.26738 14.0939 4.49857 12.0129 4.49857 9.74905C4.49857 4.36364 8.86296 0 14.2493 0C19.6356 0 24 4.36364 24 9.74905C24 15.1345 19.6356 19.4981 14.2493 19.4981C11.9851 19.4981 9.90366 18.7294 8.24885 17.4358V18.1998C8.24885 18.4998 8.13165 18.7857 7.9207 18.9966L3.24692 23.6696C2.80626 24.1101 2.09371 24.1101 1.65774 23.6696L0.331083 22.3431C-0.109575 21.9025 -0.109575 21.1901 0.326395 20.7495ZM14.2493 15.7485C17.5636 15.7485 20.2497 13.0675 20.2497 9.74905C20.2497 6.43531 17.5683 3.74963 14.2493 3.74963C10.935 3.74963 8.24885 6.43062 8.24885 9.74905C8.24885 13.0628 10.9303 15.7485 14.2493 15.7485Z"
        fill="#7000FE40"
      />
    </svg>
  )

  const nearMeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <g clipPath="url(#clip0_360_16151)">
        <path
          d="M8 16C12.4114 16 16 12.4103 16 8C16 3.58971 12.4114 0 7.99657 0C3.58743 0 0 3.58971 0 8C0 12.4103 3.58857 16 8 16ZM6.85714 2.40229V4.57143C6.85714 4.87453 6.97755 5.16522 7.19188 5.37955C7.40621 5.59388 7.6969 5.71429 8 5.71429C8.30311 5.71429 8.59379 5.59388 8.80812 5.37955C9.02245 5.16522 9.14286 4.87453 9.14286 4.57143V2.40229C10.2399 2.62767 11.2467 3.16983 12.0388 3.96165C12.8308 4.75346 13.3732 5.76017 13.5989 6.85714H11.4286C11.1255 6.85714 10.8348 6.97755 10.6205 7.19188C10.4061 7.40621 10.2857 7.6969 10.2857 8C10.2857 8.30311 10.4061 8.59379 10.6205 8.80812C10.8348 9.02245 11.1255 9.14286 11.4286 9.14286H13.5989C13.3732 10.2398 12.8308 11.2465 12.0388 12.0384C11.2467 12.8302 10.2399 13.3723 9.14286 13.5977V11.4286C9.14286 11.1255 9.02245 10.8348 8.80812 10.6205C8.59379 10.4061 8.30311 10.2857 8 10.2857C7.6969 10.2857 7.40621 10.4061 7.19188 10.6205C6.97755 10.8348 6.85714 11.1255 6.85714 11.4286V13.5977C5.76011 13.3723 4.75327 12.8302 3.96125 12.0384C3.16923 11.2465 2.62681 10.2398 2.40114 9.14286H4.57143C4.87453 9.14286 5.16522 9.02245 5.37955 8.80812C5.59388 8.59379 5.71429 8.30311 5.71429 8C5.71429 7.6969 5.59388 7.40621 5.37955 7.19188C5.16522 6.97755 4.87453 6.85714 4.57143 6.85714H2.40114C2.62681 5.76017 3.16923 4.75346 3.96125 3.96165C4.75327 3.16983 5.76011 2.62767 6.85714 2.40229Z"
          fill="#7000FE"
          fillOpacity="0.25"
        />
      </g>
      <defs>
        <clipPath id="clip0_360_16151">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )

  // Enhanced function to get user's current location with permission handling
  const getUserLocation = async (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise(async (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."))
        return
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        error => {
          let errorMessage = "Unable to retrieve your location."
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out."
              break
          }
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      )
    })
  }

  // Handle "Near Me" selection
  const handleNearMeSelect = async () => {
    setIsLocationLoading(true)
    try {
      const coords = await getUserLocation()
      setUserLocation(coords)
      setLocationSearchValue("Di Sekitar Saya")
      setSelectedLocation({
        id: "near-me",
        name: "Di Sekitar Saya",
        fullName: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`,
      } as Location)
      setIsLocationFocused(false)
      setShowLocationDropdown(false)
    } catch (error) {
      console.error("Error getting location:", error)
      // Don't show alert here as it's already handled in getUserLocation
    } finally {
      setIsLocationLoading(false)
    }
  }

  // Function to build search URL with query parameters
  const buildSearchUrl = () => {
    const params = new URLSearchParams()

    if (selectedCategory) {
      params.append("courseCategoryId", selectedCategory.id)
      params.append("courseCategoryName", selectedCategory.name)
    }

    if (selectedLocation) {
      if (selectedLocation.id === "near-me" && userLocation) {
        params.append("latitude", userLocation.latitude.toString())
        params.append("longitude", userLocation.longitude.toString())
      } else {
        params.append("locationId", selectedLocation.id)
        params.append("locationName", selectedLocation.name)
      }
    }

    const queryString = params.toString()
    return queryString ? `/courses?${queryString}` : "/courses"
  }

  const handleCategorySelect = (category: CourseCategory) => {
    setSelectedCategory(category)
    setSearchValue(category.name)
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setLocationSearchValue(location.name)
    setIsLocationFocused(false)
    setShowLocationDropdown(false)
  }

  const handleCategoryChange = (value: string) => {
    setSearchValue(value)
    // If the user clears the input, also clear the selected category
    if (!value) {
      setSelectedCategory(null)
    }
  }

  const handleLocationChange = (value: string) => {
    setLocationSearchValue(value)
    // If the user clears the input, also clear the selected location
    if (!value) {
      setSelectedLocation(null)
      setUserLocation(null)
      setShowLocationDropdown(false)
    } else {
      // When user starts typing, show normal dropdown and hide near me option
      setShowLocationDropdown(true)
    }
  }

  const handleLocationFocus = () => {
    setIsLocationFocused(true)
    // If input is empty, don't show location dropdown (show "Near Me" instead)
    if (!locationSearchValue) {
      setShowLocationDropdown(false)
    } else {
      setShowLocationDropdown(true)
    }
  }

  const handleLocationBlur = () => {
    // Add small delay to allow click events to register
    setTimeout(() => {
      setIsLocationFocused(false)
      setShowLocationDropdown(false)
    }, 200)
  }

  // Show "Near Me" option when focused and not typing
  const showNearMeOption = isLocationFocused && !locationSearchValue && !showLocationDropdown

  // Focus the location input when switching to SearchableSelect
  useEffect(() => {
    if (showLocationDropdown && locationSearchValue) {
      // Small delay to ensure the SearchableSelect is rendered
      setTimeout(() => {
        const locationInput = document.querySelector(
          'input[placeholder*="location"]'
        ) as HTMLInputElement
        if (locationInput) {
          locationInput.focus()
        }
      }, 0)
    }
  }, [showLocationDropdown, locationSearchValue])

  // Show loading state while initializing or while lookup data is loading
  if (!isHydrated || isInitializing) {
    return <SearchCourseSkeleton />
  }

  // Mobile view with fake input
  const mobileView = (
    <div className={`w-full relative lg:hidden ${props.className || ""}`}>
      <button
        onClick={() => setIsMobileBottomSheetOpen(true)}
        className="w-full bg-white rounded-full border-4 border-main-lighten-50 px-6 py-4 shadow-sm text-left flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {courseCategoryIcon}
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">
              {selectedCategory && selectedLocation
                ? `${selectedCategory.name}`
                : selectedCategory
                  ? selectedCategory.name
                  : selectedLocation
                    ? selectedLocation.name
                    : "Cari les apa?"}
            </span>
          </div>
        </div>
        {searchIcon}
      </button>

      <MobileSearchBottomSheet
        isOpen={isMobileBottomSheetOpen}
        onClose={() => setIsMobileBottomSheetOpen(false)}
        searchValue={searchValue}
        locationSearchValue={locationSearchValue}
        isLocationLoading={isLocationLoading}
        showLocationDropdown={showLocationDropdown}
        courseCategoryIcon={courseCategoryIcon}
        locationIcon={locationIcon}
        searchIcon={searchIcon}
        nearMeIcon={nearMeIcon}
        handleCategorySelect={handleCategorySelect}
        handleLocationSelect={handleLocationSelect}
        handleCategoryChange={handleCategoryChange}
        handleLocationChange={handleLocationChange}
        handleLocationFocus={handleLocationFocus}
        handleLocationBlur={handleLocationBlur}
        handleNearMeSelect={handleNearMeSelect}
        buildSearchUrl={buildSearchUrl}
        showNearMeOption={showNearMeOption}
      />
    </div>
  )

  // Desktop view (original)
  const desktopView = (
    <div className={`w-full max-w-2xl relative hidden lg:block ${props.className || ""}`}>
      <div className="flex items-center bg-white rounded-full border-4 border-main-lighten-50 px-6 py-2 shadow-sm">
        <SearchableSelect<CourseCategory>
          placeholder="Cari les apa?"
          icon={courseCategoryIcon}
          value={searchValue}
          onChange={handleCategoryChange}
          onSelect={handleCategorySelect}
          apiEndpoint="/api/v1/course-categories"
          getDisplayText={category => category.name}
          dropdownClassName="left-[-20px] w-[250px]"
          renderItem={(category, index, isSelected) => (
            <button
              key={category.id}
              onClick={() => {
                handleCategorySelect(category)
              }}
              className={`w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-main-lighten-25 ${
                isSelected ? "bg-purple-100" : ""
              }`}
            >
              {searchIcon}
              <span className="text-gray-700">
                <span className="text-black font-medium">{category.name}</span>
              </span>
            </button>
          )}
        />

        <div className="w-px h-6 bg-purple-200 mx-4"></div>

        <div className="relative flex-1">
          {/* Always use SearchableSelect but control dropdown visibility */}
          <SearchableSelect<Location>
            placeholder="Cari les dimana?"
            icon={locationIcon}
            value={locationSearchValue}
            onChange={handleLocationChange}
            onSelect={handleLocationSelect}
            onFocus={handleLocationFocus}
            onBlur={handleLocationBlur}
            apiEndpoint="/api/v1/locations"
            getDisplayText={location => location.name}
            getSecondaryText={location =>
              location.fullName && location.fullName !== location.name ? location.fullName : null
            }
            dropdownClassName="right-0 left-0 w-[250px]"
            forceShowDropdown={showLocationDropdown}
            renderItem={(location, index, isSelected) => (
              <button
                key={location.id}
                onClick={() => {
                  handleLocationSelect(location)
                }}
                className={`w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-main-lighten-25 ${
                  isSelected ? "bg-purple-100" : ""
                }`}
              >
                {searchIcon}
                <span className="text-gray-700">
                  <span className="text-black font-medium">{location.name}</span>
                  {location.fullName && location.fullName !== location.name && (
                    <span className="text-gray-500 text-sm block">{location.fullName}</span>
                  )}
                </span>
              </button>
            )}
          />

          {/* Near Me Option */}
          {showNearMeOption && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 mt-2 py-2">
              <button
                onClick={handleNearMeSelect}
                disabled={isLocationLoading}
                className="w-full px-6 py-3 text-left flex items-center gap-3 hover:bg-main-lighten-25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocationLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                ) : (
                  nearMeIcon
                )}
                <span className="text-gray-700">
                  <span className="text-black font-medium">
                    {isLocationLoading ? "Mendapatkan lokasi..." : "Di Sekitar Saya"}
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>

        <Link href={buildSearchUrl()}>
          <Button variant="ghost" size="sm" className="ml-4 cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M0.326395 20.7495L5.00017 16.0766C5.21113 15.8656 5.49709 15.7485 5.79711 15.7485H6.56123C5.26738 14.0939 4.49857 12.0129 4.49857 9.74905C4.49857 4.36364 8.86296 0 14.2493 0C19.6356 0 24 4.36364 24 9.74905C24 15.1345 19.6356 19.4981 14.2493 19.4981C11.9851 19.4981 9.90366 18.7294 8.24885 17.4358V18.1998C8.24885 18.4998 8.13165 18.7857 7.9207 18.9966L3.24692 23.6696C2.80626 24.1101 2.09371 24.1101 1.65774 23.6696L0.331083 22.3431C-0.109575 21.9025 -0.109575 21.1901 0.326395 20.7495ZM14.2493 15.7485C17.5636 15.7485 20.2497 13.0675 20.2497 9.74905C20.2497 6.43531 17.5683 3.74963 14.2493 3.74963C10.935 3.74963 8.24885 6.43062 8.24885 9.74905C8.24885 13.0628 10.9303 15.7485 14.2493 15.7485Z"
                fill="#7000FE"
                fillOpacity="0.5"
              />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  )
}

// Main export component wrapped in Suspense
export function SearchCourse(props: SearchCourseProps) {
  return (
    <Suspense fallback={<SearchCourseSkeleton />}>
      <SearchCourseInternal {...props} />
    </Suspense>
  )
}
