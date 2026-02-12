"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, AlertTriangle, CheckCircle, XCircle, Trash2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Notification } from "@/utils/types/notification"
import { markAsReadAction, deleteNotificationAction } from "@/actions/notification"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface NotificationCardProps {
    notification: Notification
    onDeleteSuccess?: () => void
}

export function NotificationCard({ notification, onDeleteSuccess }: NotificationCardProps) {
    const [, startTransition] = useTransition()
    const [isRead, setIsRead] = useState(notification.is_read)

    const handleMarkAsRead = async () => {
        if (isRead) return
        startTransition(async () => {
            const res = await markAsReadAction(notification.id)
            if (res.success) {
                setIsRead(true)
            }
        })
    }

    const handleDelete = async () => {
        startTransition(async () => {
            const res = await deleteNotificationAction(notification.id)
            if (res.success) {
                toast.success("Notifikasi dihapus")
                onDeleteSuccess?.()
            } else {
                toast.error("Gagal menghapus notifikasi")
            }
        })
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="h-5 w-5 text-emerald-500" />
            case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case "error": return <XCircle className="h-5 w-5 text-red-500" />
            default: return <Info className="h-5 w-5 text-blue-500" />
        }
    }

    const getTypeStyles = (type: string) => {
        switch (type) {
            case "success": return "bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20"
            case "warning": return "bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/20"
            case "error": return "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20"
            default: return "bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20"
        }
    }

    return (
        <Card
            className={cn(
                "transition-all border-l-4 overflow-hidden",
                getTypeStyles(notification.type),
                !isRead ? "border-l-primary" : "border-l-transparent grayscale-[0.5] opacity-80"
            )}
            onClick={handleMarkAsRead}
        >
            <CardContent className="p-4 flex gap-4">
                <div className="shrink-0 mt-1">
                    <div className="bg-background rounded-full p-2 shadow-sm">
                        {getIcon(notification.type)}
                    </div>
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={cn("text-sm font-semibold leading-tight", !isRead ? "text-foreground" : "text-muted-foreground")}>
                            {notification.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-background/50 px-2 py-0.5 rounded-full">
                            {format(new Date(notification.created_at), "dd MMM, HH:mm", { locale: id })}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.message}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                            {notification.link && (
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-primary text-xs flex items-center gap-1"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        window.open(notification.link, "_blank")
                                    }}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Lihat Detail
                                </Button>
                            )}
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Notifikasi?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini tidak dapat dibatalkan. Notifikasi akan dihapus secara permanen.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
