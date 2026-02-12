"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { PageHeader } from "@/components/layout/page-header"
import { NotificationCard } from "@/components/notification/notification-card"
import { getNotifications } from "@/services/notifications"
import { Notification } from "@/utils/types/notification"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all")
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const limit = 10
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const isLoadingRef = useRef(false)

    const fetchNotifications = useCallback(async (pageNum: number, refresh = false) => {
        if (isLoadingRef.current) return
        isLoadingRef.current = true
        setIsLoading(true)

        try {
            const filters = {
                page: pageNum,
                limit,
                isRead: activeTab === "unread" ? false : activeTab === "read" ? true : undefined
            }

            const res = await getNotifications(filters)
            if (res.success) {
                const newVisibleItems = res.data || []
                if (refresh) {
                    setNotifications(newVisibleItems)
                } else {
                    setNotifications(prev => [...prev, ...newVisibleItems])
                }
                setHasMore(newVisibleItems.length === limit)
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            isLoadingRef.current = false
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [activeTab])

    // Reset when tab changes
    useEffect(() => {
        setNotifications([])
        setPage(1)
        setHasMore(true)
        setIsRefreshing(true)
        fetchNotifications(1, true)
    }, [activeTab, fetchNotifications])

    // Infinite scroll handler
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const handleScroll = () => {
            if (!hasMore || isLoadingRef.current) return

            const { scrollTop, scrollHeight, clientHeight } = container
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                setPage(prev => {
                    const nextPage = prev + 1
                    fetchNotifications(nextPage)
                    return nextPage
                })
            }
        }

        container.addEventListener("scroll", handleScroll)
        return () => container.removeEventListener("scroll", handleScroll)
    }, [hasMore, fetchNotifications])

    const handleDeleteSuccess = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            <PageHeader
                breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifikasi" }]}
            />

            <div className="p-8 pt-2 flex-1 flex flex-col overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Pusat Notifikasi</h1>
                        <p className="text-muted-foreground text-sm">Lihat semua pemberitahuan dan aktivitas terbaru Anda.</p>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) => setActiveTab(v as "all" | "unread" | "read")}
                            className="w-full md:w-auto"
                        >
                            <TabsList className="grid w-full md:w-auto grid-cols-3">
                                <TabsTrigger value="all">Semua</TabsTrigger>
                                <TabsTrigger value="unread">Belum Dibaca</TabsTrigger>
                                <TabsTrigger value="read">Dibaca</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 pb-8"
                >
                    {isRefreshing ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                            <p className="text-muted-foreground mt-4 text-sm">Menyiapkan notifikasi...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
                            <div className="bg-primary/5 p-6 rounded-full mb-4">
                                <BellOff className="h-12 w-12 text-primary/40" />
                            </div>
                            <h3 className="text-lg font-semibold">Tidak Ada Notifikasi</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                {activeTab === "unread"
                                    ? "Anda telah membaca semua notifikasi."
                                    : "Anda belum menerima notifikasi apapun saat ini."}
                            </p>
                            {activeTab !== "all" && (
                                <Button variant="outline" size="sm" onClick={() => setActiveTab("all")}>
                                    Tampilkan Semua
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
                                {notifications.map((notif) => (
                                    <NotificationCard
                                        key={notif.id}
                                        notification={notif}
                                        onDeleteSuccess={() => handleDeleteSuccess(notif.id)}
                                    />
                                ))}
                            </div>

                            {isLoading && (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
                                </div>
                            )}

                            {!hasMore && notifications.length > 5 && (
                                <p className="text-center text-xs text-muted-foreground py-8">
                                    — Anda sudah berada di akhir notifikasi —
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
