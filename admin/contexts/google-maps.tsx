"use client";

<<<<<<< HEAD
import { LoadScript } from "@react-google-maps/api";
import { createContext, useContext, ReactNode } from "react";

const libraries: ("places" | "geometry")[] = ["places"];
=======
import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { createContext, useContext, ReactNode } from "react";

const libraries: Libraries = ["places"];
>>>>>>> 1a19ced (chore: update service folders from local)

interface GoogleMapsContextValue {
  isLoaded: boolean;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
});

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error("useGoogleMaps must be used within GoogleMapsProvider");
  }
  return context;
};

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

<<<<<<< HEAD
  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <GoogleMapsContext.Provider value={{ isLoaded: true }}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
=======
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
>>>>>>> 1a19ced (chore: update service folders from local)
  );
}