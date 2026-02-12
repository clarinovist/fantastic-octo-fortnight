"use client";

import {
    LayoutDashboard,
    Users,
    Wallet,
    CreditCard,
    User,
    LogOut,
    Loader2,
    Calendar,
    BookOpen,
    ClipboardList,
    FileCheck,
    Star,
    Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { getProfile } from "@/services/auth";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";

import type { LucideIcon } from "lucide-react";

interface MenuItem {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
}

interface MenuGroup {
    label: string;
    items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
    {
        label: "Overview",
        items: [
            { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        ],
    },
    {
        label: "Mengajar",
        items: [
            { title: "Kelas Saya", href: "/courses", icon: BookOpen },
            { title: "Sesi Mengajar", href: "/sessions", icon: Calendar },
            { title: "Booking Masuk", href: "/bookings", icon: ClipboardList },
            { title: "Murid Saya", href: "/students", icon: Users },
        ],
    },
    {
        label: "Keuangan",
        items: [
            { title: "Saldo & Keuangan", href: "/finance", icon: Wallet },
            { title: "Penarikan Dana", href: "/withdrawals", icon: CreditCard },
        ],
    },
    {
        label: "Akun",
        items: [
            { title: "Profil", href: "/profile", icon: User },
            { title: "Dokumen", href: "/documents", icon: FileCheck },
            { title: "Ulasan", href: "/reviews", icon: Star },
            { title: "Notifikasi", href: "/notifications", icon: Bell },
        ],
    },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { data: profileRes, isLoading: isLoadingProfile } = useSWR("/v1/me", getProfile);
    const profile = profileRes?.data;

    return (
        <Sidebar className="border-r">
            <SidebarHeader className="h-16 border-b px-6 flex items-center">
                <div className="flex items-center gap-3">
                    <Image
                        src="/lesprivate-logo-notext.png"
                        alt="Lesprivate Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                        priority
                    />
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Lesprivate
                    </span>
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-primary-foreground bg-primary rounded-full">
                        Mentor
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-4">
                {menuGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                    const Icon = item.icon;

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                className={cn(
                                                    "px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                                                    isActive
                                                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary"
                                                )}
                                            >
                                                <Link href={item.href} className="flex items-center">
                                                    <Icon
                                                        className={cn(
                                                            "mr-3 h-5 w-5",
                                                            isActive
                                                                ? "text-primary"
                                                                : "text-slate-400 group-hover:text-primary"
                                                        )}
                                                    />
                                                    {item.title}
                                                    {item.badge && (
                                                        <span className="ml-auto text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={`https://avatar.vercel.sh/${profile?.email || 'mentor'}`} alt="Profile" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {profile?.name?.substring(0, 2).toUpperCase() || "..."}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        {isLoadingProfile ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {profile?.name || "Mentor"}
                                </p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-primary truncate">
                                    Tutor Terverifikasi
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <form action={logoutAction}>
                    <Button
                        type="submit"
                        variant="outline"
                        className="w-full border-slate-200 dark:border-slate-800 hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:hover:bg-red-950/30 transition-all group"
                        size="sm"
                    >
                        <LogOut className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Keluar
                    </Button>
                </form>
            </SidebarFooter>
        </Sidebar>
    );
}
