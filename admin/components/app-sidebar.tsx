"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import * as React from "react";

const data = {
  user: {
    name: "Admin",
    email: "admin",
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
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Tutors",
      url: "/tutors",
      icon: IconUsers,
    },
    {
      title: "Students",
      url: "/students",
      icon: IconUsers,
    },
    {
      title: "Courses",
      url: "/courses",
      icon: IconFolder,
    },
    {
      title: "Bookings",
      url: "/bookings",
      icon: IconListDetails,
    },
    {
      title: "Premium Settings",
      url: "/subscriptions",
      icon: IconInnerShadowTop,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Les Private.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
