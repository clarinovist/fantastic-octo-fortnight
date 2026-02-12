"use client"

import { useMap } from "@vis.gl/react-google-maps"
import { useEffect, useRef } from "react"

interface BlinkingLocationDotProps {
  position: { lat: number; lng: number }
  isVisible: boolean
}

<<<<<<< HEAD
=======
// Moved outside component to avoid inline class declaration warning
function createBlinkingDotOverlayClass() {
  class BlinkingDotOverlay extends google.maps.OverlayView {
    private position: google.maps.LatLng
    private div: HTMLDivElement | null = null

    constructor(position: google.maps.LatLng) {
      super()
      this.position = position
    }

    onAdd() {
      const div = document.createElement("div")
      div.style.position = "absolute"
      div.style.width = "20px"
      div.style.height = "20px"
      div.style.borderRadius = "50%"
      div.style.backgroundColor = "#4285F4"
      div.style.boxShadow = "0 0 0 3px rgba(66, 133, 244, 0.3)"
      div.style.animation = "pulse 2s infinite"
      div.style.zIndex = "1000"

      // Add CSS animation
      const style = document.createElement("style")
      style.textContent = `
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7), 0 0 0 3px white;
          }
          70% {
            box-shadow: 0 0 0 10px rgba(66, 133, 244, 0), 0 0 0 3px white;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(66, 133, 244, 0), 0 0 0 3px white;
          }
        }
      `
      document.head.appendChild(style)

      this.div = div
      const panes = this.getPanes()
      panes?.overlayMouseTarget.appendChild(div)
    }

    draw() {
      if (!this.div) return

      const overlayProjection = this.getProjection()
      const point = overlayProjection.fromLatLngToDivPixel(this.position)

      if (point) {
        this.div.style.left = point.x - 10 + "px"
        this.div.style.top = point.y - 10 + "px"
      }
    }

    onRemove() {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div)
        this.div = null
      }
    }
  }

  return BlinkingDotOverlay
}

>>>>>>> 1a19ced (chore: update service folders from local)
export function BlinkingLocationDot({ position, isVisible }: BlinkingLocationDotProps) {
  const map = useMap()
  const overlayRef = useRef<google.maps.OverlayView | null>(null)

  useEffect(() => {
    if (!map || !isVisible) {
      // Clean up existing overlay
      if (overlayRef.current) {
        overlayRef.current.setMap(null)
        overlayRef.current = null
      }
      return
    }

<<<<<<< HEAD
    class BlinkingDotOverlay extends google.maps.OverlayView {
      private position: google.maps.LatLng
      private div: HTMLDivElement | null = null

      constructor(position: google.maps.LatLng) {
        super()
        this.position = position
      }

      onAdd() {
        const div = document.createElement("div")
        div.style.position = "absolute"
        div.style.width = "20px"
        div.style.height = "20px"
        div.style.borderRadius = "50%"
        div.style.backgroundColor = "#4285F4"
        div.style.boxShadow = "0 0 0 3px rgba(66, 133, 244, 0.3)"
        div.style.animation = "pulse 2s infinite"
        div.style.zIndex = "1000"

        // Add CSS animation
        const style = document.createElement("style")
        style.textContent = `
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.7), 0 0 0 3px white;
            }
            70% {
              box-shadow: 0 0 0 10px rgba(66, 133, 244, 0), 0 0 0 3px white;
            }
            100% {
              box-shadow: 0 0 0 0 rgba(66, 133, 244, 0), 0 0 0 3px white;
            }
          }
        `
        document.head.appendChild(style)

        this.div = div
        const panes = this.getPanes()
        panes?.overlayMouseTarget.appendChild(div)
      }

      draw() {
        if (!this.div) return

        const overlayProjection = this.getProjection()
        const point = overlayProjection.fromLatLngToDivPixel(this.position)

        if (point) {
          this.div.style.left = point.x - 10 + "px"
          this.div.style.top = point.y - 10 + "px"
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div)
          this.div = null
        }
      }
    }

=======
    const BlinkingDotOverlay = createBlinkingDotOverlayClass()
>>>>>>> 1a19ced (chore: update service folders from local)
    const overlay = new BlinkingDotOverlay(new google.maps.LatLng(position.lat, position.lng))
    overlay.setMap(map)
    overlayRef.current = overlay

    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null)
        overlayRef.current = null
      }
    }
  }, [map, position, isVisible])

  return null
}
