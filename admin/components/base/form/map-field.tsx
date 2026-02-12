"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { FieldWrapper } from "./field-wrapper";

interface MapFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  defaultCenter?: { lat: number; lng: number };
  defaultZoom?: number;
}

interface Location {
  lat: number;
  lng: number;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

export function MapField({
  name,
  label = "Location",
  description,
  required = false,
  className,
  defaultCenter = { lat: -6.2088, lng: 106.8456 }, // Jakarta
  defaultZoom = 13,
}: MapFieldProps) {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isParsingLink, setIsParsingLink] = useState(false);
  const isProcessingUrlRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const onLoadAutocomplete = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      setAutocomplete(autocomplete);
    },
    []
  );

  const onPlaceChanged = (onChange: (value: Location) => void) => {
    // Skip if we're processing a URL
    if (isProcessingUrlRef.current) {
      return;
    }

    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        setMapCenter(newLocation);
        onChange(newLocation);

        if (map) {
          map.panTo(newLocation);
          map.setZoom(15);
        }

        toast.success(`Location set: ${place.formatted_address || place.name}`);

        // Clear the input after selection
        setInputValue("");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    }
  };

  // Extract coordinates from various Google Maps URL formats
  const extractCoordinatesFromUrl = (url: string): Location | null => {
    try {
      // Pattern 1: @lat,lng format
      const atPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const atMatch = url.match(atPattern);
      if (atMatch) {
        return {
          lat: parseFloat(atMatch[1]),
          lng: parseFloat(atMatch[2]),
        };
      }

      // Pattern 2: ll=lat,lng or q=lat,lng parameter
      const paramPattern = /[?&](ll|q)=(-?\d+\.\d+),(-?\d+\.\d+)/;
      const paramMatch = url.match(paramPattern);
      if (paramMatch) {
        return {
          lat: parseFloat(paramMatch[2]),
          lng: parseFloat(paramMatch[3]),
        };
      }

      // Pattern 3: place/ with coordinates
      const placePattern = /place\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/;
      const placeMatch = url.match(placePattern);
      if (placeMatch) {
        return {
          lat: parseFloat(placeMatch[1]),
          lng: parseFloat(placeMatch[2]),
        };
      }

      return null;
    } catch (error) {
      console.error("Error extracting coordinates:", error);
      return null;
    }
  };

  // Resolve short Google Maps links using the API route
  const resolveShortLink = async (url: string): Promise<string> => {
    try {
      const response = await fetch(
        `/api/shortlink-map?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (data.success && data.resolvedUrl) {
        console.log("Resolved URL:", data.resolvedUrl);
        return data.resolvedUrl;
      } else {
        console.error("Failed to resolve short link:", data.error);
        return url;
      }
    } catch (error) {
      console.error("Error resolving short link:", error);
      return url;
    }
  };

  // Check if input is a Google Maps URL
  const isGoogleMapsUrl = (text: string): boolean => {
    return (
      text.includes("maps.google.com") ||
      text.includes("goo.gl") ||
      text.includes("maps.app.goo.gl") ||
      text.includes("google.com/maps")
    );
  };

  const handlePasteLink = async (
    link: string,
    onChange: (value: Location) => void
  ) => {
    if (!link.trim()) return;

    isProcessingUrlRef.current = true;
    setIsParsingLink(true);

    try {
      let urlToParse = link;

      // Check if it's a short link that needs resolving
      if (link.includes("maps.app.goo.gl") || link.includes("goo.gl")) {
        toast.info("Resolving shortened link...");
        urlToParse = await resolveShortLink(link);
      }

      // Try to extract coordinates from the URL
      const coordinates = extractCoordinatesFromUrl(urlToParse);

      if (coordinates) {
        setMapCenter(coordinates);
        onChange(coordinates);

        if (map) {
          map.panTo(coordinates);
          map.setZoom(15);
        }

        toast.success("Location extracted from link successfully");
        setInputValue("");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      } else {
        toast.error(
          "Could not extract coordinates from this link. Try using the search instead."
        );
      }
    } catch (error) {
      console.error("Error parsing Google Maps link:", error);
      toast.error("Failed to parse the Google Maps link");
    } finally {
      setIsParsingLink(false);
      // Reset the flag after a short delay to allow autocomplete to settle
      setTimeout(() => {
        isProcessingUrlRef.current = false;
      }, 300);
    }
  };

  return (
    <FieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {(field) => {
        const location: Location | undefined = field.value;

        const handleMapClick = (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const newLocation = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            };
            field.onChange(newLocation);
          }
        };

        const handleCurrentLocation = () => {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                const newLocation = { lat: latitude, lng: longitude };
                field.onChange(newLocation);
                setMapCenter(newLocation);

                if (map) {
                  map.panTo(newLocation);
                  map.setZoom(15);
                }

                toast.success("Current location has been set");
              },
              (error) => {
                console.error("Error getting location:", error);
                toast.error(
                  "Location access denied. Please enable location access in your browser."
                );
              }
            );
          } else {
            toast.error("Your browser doesn't support geolocation");
          }
        };

        const handleInputKeyDown = (
          e: React.KeyboardEvent<HTMLInputElement>
        ) => {
          const value = inputValue.trim();

          // Check if it's a Google Maps URL BEFORE Enter is processed
          if (e.key === "Enter" && isGoogleMapsUrl(value)) {
            e.preventDefault();
            e.stopPropagation();
            handlePasteLink(value, field.onChange);
          }
        };

        return (
          <div className="space-y-4">
            {/* Unified Search/Paste Input */}
            <div className="space-y-2">
              <Autocomplete
                onLoad={onLoadAutocomplete}
                onPlaceChanged={() => onPlaceChanged(field.onChange)}
                options={{
                  fields: ["geometry", "formatted_address", "name"],
                }}
              >
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search location or paste Google Maps link..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    className="pl-9"
                    disabled={isParsingLink}
                  />
                  {isParsingLink && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </Autocomplete>
              <p className="text-xs text-muted-foreground">
                Type to search or paste a Google Maps link and press Enter
              </p>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[400px] rounded-lg border overflow-hidden">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={location || mapCenter}
                zoom={location ? 15 : defaultZoom}
                onClick={handleMapClick}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                {location && (
                  <Marker
                    position={location}
                    draggable={true}
                    onDragEnd={(e) => {
                      if (e.latLng) {
                        field.onChange({
                          lat: e.latLng.lat(),
                          lng: e.latLng.lng(),
                        });
                      }
                    }}
                  />
                )}
              </GoogleMap>

              {/* Current Location Button - Overlay on Map */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleCurrentLocation}
                  className="shadow-lg"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Use Current Location
                </Button>
              </div>

              {/* Selected Location Indicator */}
              {location && (
                <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-md shadow-md text-xs font-medium">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                </div>
              )}
            </div>
          </div>
        );
      }}
    </FieldWrapper>
  );
}
