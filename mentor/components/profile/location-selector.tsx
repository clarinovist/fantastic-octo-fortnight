"use client"

import { useState, useCallback, useEffect } from "react"
import { GoogleMap, Marker } from "@react-google-maps/api"
import { useGoogleMaps } from "@/contexts/google-maps"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Loader2 } from "lucide-react"

interface LocationSelectorProps {
    initialLat?: number
    initialLng?: number
    initialAddress?: string
    onLocationSelect: (lat: number, lng: number, address: string) => void
}

const containerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "0.5rem",
}

const defaultCenter = {
    lat: -6.175392,
    lng: 106.827153, // Jakarta
}

export function LocationSelector({ initialLat, initialLng, initialAddress, onLocationSelect }: LocationSelectorProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null)
    const [center, setCenter] = useState(defaultCenter)
    const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(null)
    const [address, setAddress] = useState(initialAddress || "")
    const [isSearching, setIsSearching] = useState(false)

    const { isLoaded } = useGoogleMaps()

    useEffect(() => {
        if (initialLat && initialLng) {
            const pos = { lat: initialLat, lng: initialLng }
            setCenter(pos)
            setMarkerPos(pos)
        }
    }, [initialLat, initialLng])

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map)
    }, [])

    const onUnmount = useCallback(function callback() {
        setMap(null)
    }, [])

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            setMarkerPos({ lat, lng })

            // Reverse geocoding would go here ideally to get address from lat/lng
            // For now we just pass the coords
            onLocationSelect(lat, lng, address)
        }
    }, [address, onLocationSelect])

    const handleAddressSearch = async () => {
        if (!address || !map) return

        setIsSearching(true)
        try {
            const geocoder = new google.maps.Geocoder()
            const result = await geocoder.geocode({ address })

            if (result.results && result.results.length > 0) {
                const location = result.results[0].geometry.location
                const lat = location.lat()
                const lng = location.lng()
                const pos = { lat, lng }

                setCenter(pos)
                setMarkerPos(pos)
                map.panTo(pos)
                onLocationSelect(lat, lng, result.results[0].formatted_address)
                setAddress(result.results[0].formatted_address)
            }
        } catch (error) {
            console.error("Geocoding error:", error)
        } finally {
            setIsSearching(false)
        }
    }

    if (!isLoaded) return <div className="h-[400px] w-full flex items-center justify-center bg-muted/20 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari lokasi atau alamat..."
                        className="pl-9"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
                    />
                </div>
                <Button onClick={handleAddressSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>

            <div className="border rounded-lg overflow-hidden relative">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                    }}
                >
                    {markerPos && <Marker position={markerPos} />}
                </GoogleMap>
                {!markerPos && (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-background/90 px-3 py-1 rounded shadow text-xs font-medium z-10">
                        Klik pada peta untuk menandai lokasi
                    </div>
                )}
            </div>

            {markerPos && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Lat: {markerPos.lat.toFixed(6)}, Lng: {markerPos.lng.toFixed(6)}</span>
                </div>
            )}
        </div>
    )
}
