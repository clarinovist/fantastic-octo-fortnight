"use client"

import { ReactNode, useEffect, useState } from "react"

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
      document.body.style.overflow = "hidden"
      // Small delay to trigger animation
      setTimeout(() => setIsAnimating(true), 10)
    } else if (isVisible) {
      requestAnimationFrame(() => {
        setIsAnimating(false)
      })
      // Wait for animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false)
        document.body.style.overflow = "unset"
      }, 300) // Match animation duration
    }

    return () => {
      if (!isOpen) {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen, isVisible])

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
          }`}
        onClick={handleBackdropClick}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg transition-transform duration-300 ease-out ${isAnimating ? "translate-y-0" : "translate-y-full"
          }`}
        onClick={handleContentClick}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
