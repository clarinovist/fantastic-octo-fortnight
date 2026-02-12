"use client"

import { ReactNode, useEffect, useRef, useState } from "react"
import { useMobile } from "../../../hooks/use-mobile"
import { BottomSheet } from "./bottom-sheet"

interface CustomDropdownProps {
  isOpen: boolean
  onClose: () => void
  trigger: ReactNode
  children: ReactNode
  align?: "start" | "center" | "end"
  minWidth?: number
  title?: string
}

export function CustomDropdown({
  isOpen,
  onClose,
  trigger,
  children,
  align = "start",
  minWidth = 250,
  title,
}: CustomDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const [position, setPosition] = useState<{
    left?: number | string
    right?: number | string
    transform?: string
  }>({})

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, isMobile])

  useEffect(() => {
    if (isOpen && !isMobile && dropdownRef.current) {
      const triggerRect = dropdownRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      // Calculate space on left and right
      const spaceOnLeft = triggerRect.left
      const spaceOnRight = viewportWidth - triggerRect.right

      // Use minWidth as the content width for calculations
      const contentWidth = minWidth

      let newPosition: typeof position = {}

      if (align === "start") {
        // Check if there's enough space on the right for left-aligned dropdown
        if (spaceOnRight >= contentWidth) {
          newPosition = { left: 0 }
        } else if (spaceOnLeft >= contentWidth) {
          // Not enough space on right, align to right edge of trigger
          newPosition = { right: 0 }
        } else {
          // Not enough space on either side, center it and let it overflow gracefully
          newPosition = {
            left: "50%",
            transform: "translateX(-50%)",
          }
        }
      } else if (align === "end") {
        // Check if there's enough space on the left for right-aligned dropdown
        if (spaceOnLeft >= contentWidth) {
          newPosition = { right: 0 }
        } else if (spaceOnRight >= contentWidth) {
          // Not enough space on left, align to left edge of trigger
          newPosition = { left: 0 }
        } else {
          // Not enough space on either side, center it
          newPosition = {
            left: "50%",
            transform: "translateX(-50%)",
          }
        }
      } else {
        // center
        const halfContentWidth = contentWidth / 2
        const triggerCenter = triggerRect.left + triggerRect.width / 2

        if (
          triggerCenter - halfContentWidth >= 0 &&
          triggerCenter + halfContentWidth <= viewportWidth
        ) {
          // Enough space to center
          newPosition = {
            left: "50%",
            transform: "translateX(-50%)",
          }
        } else if (spaceOnRight >= contentWidth) {
          // Center would overflow, align left
          newPosition = { left: 0 }
        } else if (spaceOnLeft >= contentWidth) {
          // Center would overflow, align right
          newPosition = { right: 0 }
        } else {
          // Force center anyway
          newPosition = {
            left: "50%",
            transform: "translateX(-50%)",
          }
        }
      }

<<<<<<< HEAD
      setPosition(newPosition)
=======
      requestAnimationFrame(() => {
        setPosition(prev => {
          const isSame =
            prev.left === newPosition.left &&
            prev.right === newPosition.right &&
            prev.transform === newPosition.transform;
          return isSame ? prev : newPosition;
        })
      })
>>>>>>> 1a19ced (chore: update service folders from local)
    }
  }, [isOpen, align, minWidth, isMobile])

  const getPositionStyles = () => {
    const styles: React.CSSProperties = {
      position: "absolute",
      top: "100%",
      marginTop: "8px",
      zIndex: 9999,
      minWidth: `${minWidth}px`,
    }

    if (position.left !== undefined) {
      styles.left = typeof position.left === "number" ? `${position.left}px` : position.left
    }

    if (position.right !== undefined) {
      styles.right = typeof position.right === "number" ? `${position.right}px` : position.right
    }

    if (position.transform) {
      styles.transform = position.transform
    }

    return styles
  }

  // Mobile: render bottom sheet
  if (isMobile) {
    return (
      <div>
        {trigger}
        <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
          {children}
        </BottomSheet>
      </div>
    )
  }

  // Desktop: render dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      {trigger}
      {isOpen && (
        <div style={getPositionStyles()}>
          <div ref={contentRef} className="bg-white rounded-lg shadow-lg border border-gray-200">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
