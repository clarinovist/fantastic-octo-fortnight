"use client"

import { TransactionItem } from "@/utils/types/subscription"
import { useCallback, useEffect, useRef } from "react"
import useSWRInfinite from "swr/infinite"
import { SubscriptionList } from "./subscription-list"

interface Subscription {
  id: string
  name: string
  status: "pending" | "active" | "expired" | "canceled"
  startTime: string
  nextBillingDate: string
  amount?: string
  url?: string
}

interface SubscriptionsResponse {
  data: TransactionItem[]
  page: number
  pageSize: number
  total: number
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<SubscriptionsResponse> => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch subscriptions")
  }

  return response.json()
}

// Map API response to component format
function mapTransactionToSubscription(item: TransactionItem): Subscription {
  return {
    id: item.id,
    name: item.name,
    status: item.status,
    url: item.url,
    startTime: new Date(item.startAt).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    nextBillingDate: new Date(item.endAt).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    amount: item.price,
  }
}

const PAGE_SIZE = 10

export function SubscriptionContainer() {
  const observerTarget = useRef<HTMLDivElement>(null)

  const getKey = (pageIndex: number, previousPageData: SubscriptionsResponse | null) => {
    // If first page and no data yet, return the first page
    if (pageIndex === 0) {
      return `/api/v1/students/subscriptions?page=1&pageSize=${PAGE_SIZE}`
    }

    // If no previous data, stop
    if (!previousPageData) return null

    // If previous page has less data than pageSize, we've reached the end
    if (previousPageData.data.length < PAGE_SIZE) return null

    // Return next page
    const nextPage = pageIndex + 1
    return `/api/v1/students/subscriptions?page=${nextPage}&pageSize=${PAGE_SIZE}`
  }

  const { data, size, setSize, error, isLoading, isValidating } =
    useSWRInfinite<SubscriptionsResponse>(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateAll: false,
      persistSize: true,
    })

  const subscriptions = data?.flatMap(page => page.data.map(mapTransactionToSubscription)) ?? []

  const isEmpty = data?.[0]?.data.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data.length < PAGE_SIZE)
  const isLoadingMore = isValidating && size > 1

  const loadMore = useCallback(() => {
    if (!isReachingEnd && !isLoadingMore) {
      setSize(prev => prev + 1)
    }
  }, [isReachingEnd, isLoadingMore, setSize])

  useEffect(() => {
    const currentTarget = observerTarget.current
    if (!currentTarget || isReachingEnd) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    )

    observer.observe(currentTarget)

    return () => {
      observer.disconnect()
    }
  }, [isReachingEnd, loadMore])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Memuat langganan...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">
          Terjadi kesalahan: {error instanceof Error ? error.message : "Gagal memuat data"}
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Tidak ada langganan</div>
      </div>
    )
  }

  return (
    <div>
      <SubscriptionList subscriptions={subscriptions} />

      {/* Infinite scroll trigger */}
      {!isReachingEnd && (
        <div ref={observerTarget} className="py-4">
          {isLoadingMore && <div className="text-center text-gray-600">Memuat lebih banyak...</div>}
        </div>
      )}
    </div>
  )
}
