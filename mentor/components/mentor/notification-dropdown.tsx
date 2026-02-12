"use client";

import { useState } from "react";
import useSWR from "swr";
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotifications, markAsRead } from "@/services/notifications";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
    const { data, mutate } = useSWR("/notifications", getNotifications);
    const notifications = data?.data || [];
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    const [isOpen, setIsOpen] = useState(false);

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;

        try {
            const res = await markAsRead(id);
            if (res.success) {
                mutate();
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
            case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case "error": return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 text-muted-foreground group-hover:text-violet-600 transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <span className="font-semibold text-sm">Notifikasi</span>
                    {unreadCount > 0 && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                            {unreadCount} baru
                        </span>
                    )}
                </div>
                <div className="h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Tidak ada notifikasi</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onClick={() => handleMarkAsRead(notification.id, notification.is_read)}
                                    className={cn(
                                        "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-muted/50",
                                        !notification.is_read && "bg-violet-50/50 dark:bg-violet-900/10"
                                    )}
                                >
                                    <div className="flex items-start justify-between w-full gap-2">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">{getIcon(notification.type)}</div>
                                            <div className="space-y-1">
                                                <p className={cn("text-sm font-medium leading-none", !notification.is_read && "text-foreground")}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground pt-1">
                                                    {new Date(notification.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="h-2 w-2 rounded-full bg-violet-600 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-2 border-t bg-muted/30 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
                        asChild
                    >
                        <a href="/notifications">Lihat Semua Notifikasi</a>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
