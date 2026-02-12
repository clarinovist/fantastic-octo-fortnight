"use client";

import { useJsApiLoader, Libraries } from "@react-google-maps/api";
import { createContext, useContext, ReactNode } from "react";

const libraries: Libraries = ["places"];

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

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
