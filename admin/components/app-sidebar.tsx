"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { NavUser } from "@/components/nav-user";

export function AppSidebar({ bookingsCount, ...props }: { bookingsCount?: number } & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = (url: string) => pathname === url;

  const data = {
    user: {
      name: "Admin",
      email: "admin@lesprivate.com",
      photo_profile: "",
      id: "admin",
      role: "administrator",
      gender: "other",
      date_of_birth: "",
      phone_number: "",
      social_media_link: {},
      latitude: 0,
      longitude: 0,
      level_point: 0,
      level: "Beginner",
      finish_update_profile: true,
      isPremium: false,
      location: {
        id: "loc1",
        name: "Headquarters",
        fullName: "Company Headquarters",
        shortName: "HQ",
        type: "office",
      },
    },
    overview: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
    management: [
      {
        title: "Tutors",
        url: "/tutors",
        icon: GraduationCap,
      },
      {
        title: "Students",
        url: "/students",
        icon: Users,
      },
      {
        title: "Courses",
        url: "/courses",
        icon: BookOpen,
      },
    ],
    operations: [
      {
        title: "Bookings",
        url: "/bookings",
        icon: Calendar,
        badge: bookingsCount ? bookingsCount.toString() : undefined,
      },
      {
        title: "Transactions",
        url: "/transactions", // Placeholder URL
        icon: CreditCard,
      },
      {
        title: "Withdrawals",
        url: "/withdrawals",
        icon: CreditCard,
      },
    ],
    settings: [
      {
        title: "Premium Settings",
        url: "/subscriptions",
        icon: Settings,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar" {...props}>
      <SidebarHeader className="h-16 border-b border-border/50 px-6 py-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent"
            >
              <Image
                src="/lesprivate-logo-notext.png"
                alt="Lesprivate Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-lg font-bold tracking-tight text-foreground">Lesprivate</span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 gap-6">
        {/* Overview Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2">Overview</SidebarGroupLabel>
          <SidebarMenu>
            {data.overview.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  tooltip={item.title}
                  className={`rounded-xl px-3 py-2.5 h-auto text-sm font-medium transition-all ${isActive(item.url)
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark hover:text-white"
                    : "text-foreground hover:bg-accent"
                    }`}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2">Management</SidebarGroupLabel>
          <SidebarMenu>
            {data.management.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  tooltip={item.title}
                  className={`rounded-xl px-3 py-2.5 h-auto text-sm font-medium transition-all ${isActive(item.url)
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark hover:text-white"
                    : "text-foreground hover:bg-accent"
                    }`}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Operations Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2">Operations</SidebarGroupLabel>
          <SidebarMenu>
            {data.operations.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  tooltip={item.title}
                  className={`rounded-xl px-3 py-2.5 h-auto text-sm font-medium transition-all ${isActive(item.url)
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark hover:text-white"
                    : "text-foreground hover:bg-accent"
                    }`}
                >
                  <Link href={item.url} className="flex items-center gap-3 w-full">
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold dark:bg-primary/30 dark:text-primary">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2">Settings</SidebarGroupLabel>
          <SidebarMenu>
            {data.settings.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.url)}
                  tooltip={item.title}
                  className={`rounded-xl px-3 py-2.5 h-auto text-sm font-medium transition-all ${isActive(item.url)
                    ? "bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark hover:text-white"
                    : "text-foreground hover:bg-accent"
                    }`}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
