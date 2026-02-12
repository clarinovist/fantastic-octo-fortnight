"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Checkbox } from "./checkbox" // Adjust import path as needed

interface Option {
  id: string
  label: string
}

interface MultipleSelectProps {
  options: Option[]
  value: string[]
  onLoadMore?: (page: number) => Promise<Option[]>
  onSelectionChange?: (selectedIds: string[]) => void
  hasMore?: boolean
  pageSize?: number
}

export function MultipleSelect({
  options,
  value,
  onLoadMore,
  onSelectionChange,
  hasMore = true,
  pageSize = 20,
}: MultipleSelectProps) {
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMoreData, setHasMoreData] = useState(hasMore)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Infinite scroll: parent must append new options to `options` prop
  const loadMore = useCallback(async () => {
    if (loading || !hasMoreData || !onLoadMore) return

    setLoading(true)
    try {
      const newOptions = await onLoadMore(page)
      if (newOptions.length === 0 || newOptions.length < pageSize) {
        setHasMoreData(false)
      }
      setPage(prevPage => prevPage + 1)
      // Parent should append newOptions to `options` prop
    } catch (error) {
      console.error("Error loading more options:", error)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMoreData, onLoadMore, page, pageSize])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const target = entries[0]
        if (target.isIntersecting && hasMoreData && !loading) {
          loadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [loadMore, hasMoreData, loading])

  // Handle selection toggle
  const handleToggle = (optionId: string) => {
    let newSelected: string[]
    if (value.includes(optionId)) {
      newSelected = value.filter(id => id !== optionId)
    } else {
      newSelected = [...value, optionId]
    }
    onSelectionChange?.(newSelected)
  }

  return (
    <div className="relative">
      <div className="max-h-80 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-main scrollbar-track-main">
        {!options.length && !loading && (
          <div className="text-center text-gray-500 p-4">No options available</div>
        )}

        {options.map(option => (
          <div key={option.id}>
            <label className="flex items-center space-x-4">
              <Checkbox
                checked={value.includes(option.id)}
                // Prevent double-calling handleToggle
                onCheckedChange={() => {
                  handleToggle(option.id)
                }}
                className="data-[state=checked]:bg-main data-[state=checked]:border-main"
              />
              <span className="text-gray-800 font-medium text-sm">{option.label}</span>
            </label>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-main"></div>
            <span className="ml-2 text-gray-600">Loading more...</span>
          </div>
        )}

        {/* Infinite scroll trigger */}
        {hasMoreData && !loading && <div ref={loadMoreRef} className="h-4 w-full" />}

        {/* No more data indicator */}
        {!hasMoreData && options.length > 0 && (
          <div className="text-center p-4 text-gray-500">No more options to load</div>
        )}
      </div>
    </div>
  )
}
