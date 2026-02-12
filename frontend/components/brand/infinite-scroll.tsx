"use client"

import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, type JSX, type ReactNode } from "react"
import useSWRInfinite from "swr/infinite"
import { useIsVisible } from "../../hooks/use-visible"
import { cn } from "../../lib/utils"

type InfiniteScrollProps<T> = {
  items: T[]
  initialPage: number
  totalItem?: number
  totalPages?: number
  enabled?: boolean
  className?: string
  isSingleColumn?: boolean
  loadingText?: string
  skeletonComponent?: ReactNode
  showSkeletonOnInitialLoad?: boolean
  maxHeight?: string
  debug?: boolean
  emptyStateComponent?: ReactNode
  emptyStateText?: string
  showEmptyState?: boolean
  getUrl: (page: number) => string
  fetcher: (url: string) => Promise<T[]>
  renderItem: (item: T, index: number) => JSX.Element
  renderHeaderContent?: (params: { totalItemFetched: number; courses: T[] }) => ReactNode
}

export function InfiniteScrollClient<T>(props: InfiniteScrollProps<T>) {
  const {
    className,
    enabled = true,
    loadingText = "Memuat",
    skeletonComponent,
    showSkeletonOnInitialLoad = true,
    maxHeight,
    debug = false,
    emptyStateComponent,
    emptyStateText = "Tidak ada data tersedia",
    showEmptyState = true,
    getUrl,
    fetcher,
    items: initialItems,
    initialPage,
    totalItem,
    totalPages,
    renderItem,
    renderHeaderContent,
    isSingleColumn = false,
  } = props

  const loadingContainerRef = useRef<HTMLDivElement>(null)

  const getKey = useCallback((index: number) => getUrl(index + 1), [getUrl])

  const { data, setSize, isValidating } = useSWRInfinite<T[]>(getKey, fetcher, {
    fallbackData: [initialItems],
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    initialSize: initialPage,
  })

  const items = useMemo(() => data?.flatMap(items => items) || [], [data])
  const currentPage = data?.length ?? initialPage

  const isVisible = useIsVisible(
    loadingContainerRef,
    items.length > 0 && (totalPages === undefined || currentPage < totalPages)
  )

  const isLastPageEmpty = data && data[data.length - 1]?.length === 0

  const isReachingEnd =
    (totalPages && currentPage >= totalPages) ||
    (totalItem && items.length >= totalItem) ||
    (!totalPages && !totalItem && isLastPageEmpty)

  const isInitialLoading = isValidating && items.length === 0 && initialItems.length === 0
  const shouldShowSkeleton = showSkeletonOnInitialLoad && isInitialLoading && skeletonComponent

  // Check if we should show empty state
  const isEmpty = !isValidating && items.length === 0 && initialItems.length === 0
  const shouldShowEmptyState = showEmptyState && isEmpty && !shouldShowSkeleton

  // Debug logging
  useEffect(() => {
    if (debug) {
      console.log("🔍 InfiniteScroll Debug:", {
        isValidating,
        itemsLength: items.length,
        initialItemsLength: initialItems.length,
        isInitialLoading,
        shouldShowSkeleton,
        shouldShowEmptyState,
        isEmpty,
        currentPage,
        isReachingEnd,
        isVisible,
        dataPages: data?.length,
        lastPageLength: data?.[data.length - 1]?.length,
      })
    }
  }, [
    debug,
    isValidating,
    items.length,
    initialItems.length,
    isInitialLoading,
    shouldShowSkeleton,
    shouldShowEmptyState,
    isEmpty,
    currentPage,
    isReachingEnd,
    isVisible,
    data,
  ])

  useEffect(() => {
    const allowFetching = enabled && isVisible && !isReachingEnd && !isValidating
    if (allowFetching) {
      setSize(prevSize => prevSize + 1)
    }
  }, [enabled, isVisible, isValidating, isReachingEnd, setSize])

  const memoizedRenderItem = useCallback(
    (item: T, index: number) => <div key={index}>{renderItem(item, index)}</div>,
    [renderItem]
  )

  const headerContent = useMemo(
    () =>
      renderHeaderContent?.({
        totalItemFetched: items.length,
        courses: items,
      }),
    [renderHeaderContent, items]
  )

  // Common grid classes for consistency
  const gridClasses = cn(
    isSingleColumn
      ? "grid grid-cols-1 gap-4 md:gap-6"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    className
  )

  const skeletonContent = useMemo(
    () =>
      (shouldShowSkeleton || debug) && skeletonComponent ? (
        <div
          className={gridClasses}
          data-testid="skeleton-content"
          style={debug ? { border: "2px solid red", minHeight: "400px" } : undefined}
        >
          {debug && (
            <div className="col-span-full text-red-500 text-sm font-bold mb-2">
              🔴 SKELETON MODE (Debug Active)
            </div>
          )}
          {skeletonComponent}
        </div>
      ) : null,
    [shouldShowSkeleton, debug, skeletonComponent, gridClasses]
  )

  const emptyStateContent = useMemo(
    () =>
      shouldShowEmptyState ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          data-testid="empty-state-content"
          style={debug ? { border: "2px solid orange", minHeight: "300px" } : undefined}
        >
          {debug && (
            <div className="text-orange-500 text-sm font-bold mb-4">
              🟠 EMPTY STATE (Debug Active)
            </div>
          )}
          {emptyStateComponent || (
            <div className="text-gray-500">
              <div className="text-lg font-medium mb-2">{emptyStateText}</div>
            </div>
          )}
        </div>
      ) : null,
    [shouldShowEmptyState, debug, emptyStateComponent, emptyStateText]
  )

  const gridContent = useMemo(
    () =>
      !shouldShowSkeleton && !debug && !shouldShowEmptyState ? (
        <div className={gridClasses} data-testid="grid-content">
          {items.map(memoizedRenderItem)}
        </div>
      ) : null,
    [items, gridClasses, memoizedRenderItem, shouldShowSkeleton, debug, shouldShowEmptyState]
  )

  const loadingIndicator = useMemo(
    () =>
      enabled && !isReachingEnd && (!shouldShowSkeleton || debug) && !shouldShowEmptyState ? (
        <div
          ref={loadingContainerRef}
          className="flex justify-center gap-2 items-center mt-4 text-primary text-xl"
          data-testid="loading-indicator"
          style={debug ? { border: "2px solid green", marginTop: "20px" } : undefined}
        >
          {debug && <span className="text-green-500 text-sm font-bold">🟢 LOADING (Debug):</span>}
          {loadingText} <Loader2 className="animate-spin" size={32} />
        </div>
      ) : null,
    [enabled, isReachingEnd, loadingText, shouldShowSkeleton, debug, shouldShowEmptyState]
  )

  return (
    <div
      style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      data-testid="infinite-scroll-container"
    >
      {debug && (
        <div className="mb-4 p-4 bg-yellow-100 text-sm border-2 border-yellow-400">
          <strong>🐛 Debug Mode Active - Showing Skeleton Only</strong>
          <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
            <div>
              <div>
                isValidating: <span className="font-bold">{isValidating.toString()}</span>
              </div>
              <div>
                items: <span className="font-bold">{items.length}</span>
              </div>
              <div>
                initialItems: <span className="font-bold">{initialItems.length}</span>
              </div>
              <div>
                isEmpty: <span className="font-bold">{isEmpty.toString()}</span>
              </div>
            </div>
            <div>
              <div>
                shouldShowSkeleton:{" "}
                <span className="font-bold">{shouldShowSkeleton?.toString()}</span>
              </div>
              <div>
                shouldShowEmptyState:{" "}
                <span className="font-bold">{shouldShowEmptyState?.toString()}</span>
              </div>
              <div>
                isInitialLoading: <span className="font-bold">{isInitialLoading.toString()}</span>
              </div>
              <div>
                currentPage: <span className="font-bold">{currentPage}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {!shouldShowSkeleton && !debug && !shouldShowEmptyState && headerContent}
      {skeletonContent}
      {emptyStateContent}
      {gridContent}
      {loadingIndicator}
    </div>
  )
}
