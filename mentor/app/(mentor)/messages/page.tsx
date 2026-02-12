"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    MessageSquare,
    ArrowLeft,
    Bell,
    Send,
    Sparkles,
    Home,
} from "lucide-react";
import { NotificationDropdown } from "@/components/mentor/notification-dropdown";

export default function MessagesPage() {
    return (
        <>
            <header className="h-16 bg-background border-b flex items-center justify-between px-8 flex-shrink-0">
                <nav aria-label="Breadcrumb" className="flex">
                    <ol className="flex items-center space-x-2">
                        <li>
                            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                                <Home className="h-5 w-5" />
                            </Link>
                        </li>
                        <li><span className="text-muted-foreground">/</span></li>
                        <li><span className="text-sm font-medium">Pesan</span></li>
                    </ol>
                </nav>
                <div className="flex items-center gap-4">
                    <NotificationDropdown />
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto flex items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/50">
                <Card className="max-w-md w-full border-none shadow-sm">
                    <CardContent className="p-8 text-center">
                        {/* Animated Icon */}
                        <div className="relative mx-auto w-20 h-20 mb-6">
                            <div className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-900/30 animate-pulse" />
                            <div className="relative w-20 h-20 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                <MessageSquare className="h-8 w-8 text-violet-600" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-amber-600" />
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-2">Segera Hadir</h2>
                        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                            Fitur pesan sedang dalam pengembangan. Nantinya Anda bisa berkomunikasi langsung dengan murid melalui chat real-time.
                        </p>

                        {/* Feature Preview */}
                        <div className="space-y-3 mb-6">
                            {[
                                { icon: Send, text: "Chat langsung dengan murid" },
                                { icon: Bell, text: "Notifikasi pesan baru" },
                                { icon: MessageSquare, text: "Riwayat percakapan otomatis" },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-lg px-4 py-2.5">
                                    <feature.icon className="h-4 w-4 text-violet-500 flex-shrink-0" />
                                    <span>{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Dashboard
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
