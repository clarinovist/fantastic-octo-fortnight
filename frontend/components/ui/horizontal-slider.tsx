"use client"

import { Button } from "@/components/ui/button"
import React, { useCallback, useEffect, useRef, useState } from "react"

// Global store for tracking which item should be visible for each slider
const sliderPositions = new Map<string, { itemKey: string; offset: number }>()

type HorizontalSliderProps<T> = {
  items: T[]
  keyExtractor: (item: T) => string
  renderItem: (item: T, index: number) => React.ReactNode
  itemMinWidth?: number
  className?: string
  showNav?: boolean
  /** Number of items to scroll when using navigation buttons, also limits visible items if constrainVisibleItems is true */
  visibleItems?: number
  /** If true, constrains the container to show only the number of items specified by visibleItems */
  constrainVisibleItems?: boolean
  onItemClick?: (item: T, index: number) => void
  persistentId?: string
}

export function HorizontalSlider<T>({
  items,
  keyExtractor,
  renderItem,
  itemMinWidth = 80,
  className = "",
  showNav = true,
  visibleItems = 1,
  constrainVisibleItems = false,
  onItemClick,
  persistentId = "default-slider",
}: HorizontalSliderProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const isRestoringRef = useRef(false)
  const userInteractionRef = useRef(false)
  const lastScrollLeftRef = useRef(0) // Track last scroll position

  const updateScrollButtons = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    // Add a small buffer to account for sub-pixel rendering
    const buffer = 3
    const scrollLeft = Math.round(el.scrollLeft)
    const maxScrollLeft = Math.round(el.scrollWidth - el.clientWidth)

    setCanScrollLeft(scrollLeft > buffer)
    setCanScrollRight(scrollLeft < maxScrollLeft - buffer)
  }, [])

  const getCurrentVisibleItem = useCallback(() => {
    const el = containerRef.current
    if (!el) return null

    const scrollLeft = el.scrollLeft
    const itemElements = el.children

    for (let i = 0; i < itemElements.length; i++) {
      const itemEl = itemElements[i] as HTMLElement
      const itemLeft = itemEl.offsetLeft
      const itemRight = itemLeft + itemEl.offsetWidth

      // If item is visible in viewport
      if (itemLeft <= scrollLeft + 50 && itemRight > scrollLeft) {
        const itemKey = itemEl.getAttribute("data-key")
        const offset = scrollLeft - itemLeft
        return { itemKey, offset, index: i }
      }
    }

    return null
  }, [])

  const saveCurrentPosition = useCallback(() => {
    if (isRestoringRef.current || userInteractionRef.current) return

    const currentItem = getCurrentVisibleItem()
    if (currentItem && currentItem.itemKey) {
      sliderPositions.set(persistentId, {
        itemKey: currentItem.itemKey,
        offset: currentItem.offset,
      })
    }
  }, [getCurrentVisibleItem, persistentId])

  const restorePositionToItem = useCallback(() => {
    const el = containerRef.current
    if (!el || userInteractionRef.current) return

    const savedPosition = sliderPositions.get(persistentId)
    if (!savedPosition) {
      updateScrollButtons()
      return
    }

    isRestoringRef.current = true

    // Find the element with the saved key
    const targetElement = el.querySelector(`[data-key="${savedPosition.itemKey}"]`) as HTMLElement

    if (targetElement) {
      const targetPosition = targetElement.offsetLeft + savedPosition.offset
      el.scrollLeft = Math.max(0, targetPosition)
    }

    setTimeout(() => {
      updateScrollButtons()
      isRestoringRef.current = false
    }, 50)
  }, [persistentId, updateScrollButtons])

  const scrollByAmount = useCallback(
    (amount: number) => {
      const el = containerRef.current
      if (!el) return

      userInteractionRef.current = true // Mark as user interaction
      el.scrollBy({ left: amount, behavior: "smooth" })

      setTimeout(() => {
        saveCurrentPosition()
        updateScrollButtons()
        userInteractionRef.current = false // Reset after scroll completes
      }, 350)
    },
    [saveCurrentPosition, updateScrollButtons]
  )

  const onLeft = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    // Calculate scroll amount based on number of items to scroll and item width plus gap
    const itemWidthWithGap = itemMinWidth + 8 // 8px is the gap between items
    const amount = visibleItems * itemWidthWithGap
    scrollByAmount(-amount)
  }, [itemMinWidth, visibleItems, scrollByAmount])

  const onRight = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    // Calculate scroll amount based on number of items to scroll and item width plus gap
    const itemWidthWithGap = itemMinWidth + 8 // 8px is the gap between items
    const amount = visibleItems * itemWidthWithGap
    scrollByAmount(amount)
  }, [itemMinWidth, visibleItems, scrollByAmount])

  // Handle item click WITHOUT position restoration interference
  const handleItemClick = useCallback(
    (item: T, index: number) => {
      if (!onItemClick) return

      const el = containerRef.current
      if (!el) return

      // Store current position before callback
      const currentScrollLeft = el.scrollLeft
      lastScrollLeftRef.current = currentScrollLeft

      // Mark that user is interacting - disable ALL position restoration
      userInteractionRef.current = true

      // Call the parent callback
      onItemClick(item, index)

      // Use requestAnimationFrame to ensure the callback has completed
      requestAnimationFrame(() => {
        // Keep the user interaction flag active much longer to prevent any restoration
        setTimeout(() => {
          userInteractionRef.current = false
        }, 1000) // Increased to 1 second
      })
    },
    [onItemClick]
  )

  // Set up scroll event listener with debouncing
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      // Always update buttons immediately for better UX
      updateScrollButtons()

      // Only save position if not during user interaction or restoration
      if (!isRestoringRef.current && !userInteractionRef.current) {
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          saveCurrentPosition()
        }, 300) // Increased debounce time
      }
    }

    el.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      clearTimeout(scrollTimeout)
      el.removeEventListener("scroll", handleScroll)
      if (!userInteractionRef.current) {
        saveCurrentPosition()
      }
    }
  }, [saveCurrentPosition, updateScrollButtons])

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (userInteractionRef.current) return
      setTimeout(() => {
        updateScrollButtons()
      }, 150)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [updateScrollButtons])

  // Initial button state setup ONLY - no position restoration
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollButtons()
    }, 100)

    return () => clearTimeout(timer)
  }, [updateScrollButtons]) // Add updateScrollButtons back to dependency array

  // Separate effect for position restoration - only when component first mounts and has saved position
  useEffect(() => {
    // Only run once on mount if we have a saved position
    if (sliderPositions.has(persistentId)) {
      const timer = setTimeout(() => {
        if (!userInteractionRef.current) {
          restorePositionToItem()
        }
      }, 200) // Longer delay to ensure everything is rendered

      return () => clearTimeout(timer)
    }
  }, [persistentId, restorePositionToItem]) // Add dependencies back

  // Calculate container max width if constrainVisibleItems is true
  const containerMaxWidth = constrainVisibleItems
    ? (itemMinWidth + 8) * visibleItems - 8 + 2 // -8 for last gap, +2 for padding
    : undefined

  return (
    <div className={`flex items-center ${className}`}>
      {showNav && (
        <Button
          onClick={onLeft}
          aria-label="scroll left"
          className="rounded-full bg-white hover:bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] w-[48px] h-[48px] disabled:opacity-50 disabled:cursor-not-allowed mr-2 z-10"
          disabled={!canScrollLeft}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="16"
            viewBox="0 0 10 16"
            fill="none"
          >
            <path
              d="M9.6176 0.352185C9.86245 0.577756 10 0.883657 10 1.20262C10 1.52157 9.86245 1.82747 9.6176 2.05305L3.15257 8.00726L9.6176 13.9615C9.85551 14.1883 9.98716 14.4922 9.98418 14.8076C9.9812 15.123 9.84385 15.4247 9.60169 15.6477C9.35954 15.8707 9.03196 15.9972 8.68951 16C8.34706 16.0027 8.01715 15.8815 7.77082 15.6623L0.382398 8.85769C0.137548 8.63212 -3.63951e-07 8.32622 -3.50009e-07 8.00726C-3.36066e-07 7.6883 0.137548 7.3824 0.382398 7.15683L7.77082 0.352185C8.01575 0.126681 8.34789 -7.2216e-08 8.69421 -5.70778e-08C9.04053 -4.19396e-08 9.37268 0.126681 9.6176 0.352185Z"
              fill="black"
            />
          </svg>
        </Button>
      )}

      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          WebkitOverflowScrolling: "touch",
          maxWidth: containerMaxWidth,
        }}
        role="list"
      >
        {items.map((item, index) => {
          const key = keyExtractor(item)
          return (
            <div
              key={key}
              data-key={key}
              role="listitem"
              style={{ minWidth: itemMinWidth }}
              className="flex-shrink-0"
              onClick={() => handleItemClick(item, index)}
            >
              {renderItem(item, index)}
            </div>
          )
        })}
      </div>

      {showNav && (
        <Button
          onClick={onRight}
          aria-label="scroll right"
          className="rounded-full bg-white hover:bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] w-[48px] h-[48px] disabled:opacity-50 disabled:cursor-not-allowed ml-2 z-10"
          disabled={!canScrollRight}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="16"
            viewBox="0 0 10 16"
            fill="none"
          >
            <path
              d="M0.382399 0.352185C0.137549 0.577756 3.86259e-08 0.883657 5.2568e-08 1.20262C6.65101e-08 1.52157 0.137549 1.82747 0.382399 2.05305L6.84743 8.00726L0.3824 13.9615C0.144489 14.1883 0.0128441 14.4922 0.0158199 14.8076C0.0187957 15.123 0.156154 15.4247 0.398309 15.6477C0.640465 15.8707 0.968043 15.9972 1.31049 16C1.65294 16.0027 1.98285 15.8815 2.22918 15.6623L9.6176 8.85769C9.86245 8.63212 10 8.32622 10 8.00726C10 7.6883 9.86245 7.3824 9.6176 7.15683L2.22918 0.352185C1.98425 0.126681 1.65211 -7.2216e-08 1.30579 -5.70778e-08C0.959466 -4.19396e-08 0.627323 0.126681 0.382399 0.352185Z"
              fill="black"
            />
          </svg>
        </Button>
      )}
    </div>
  )
}
