"use client"

import * as React from "react"
import Image from "next/image"
import { 
  ChartNoAxesCombined,
  LayoutDashboard,
  UsersRound,
  Dumbbell,
  Settings,
  CircleHelp,
  Search,
  ClipboardList,
  Activity
 } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/images/avatar.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Members",
      url: "/members",
      icon: UsersRound,
    },
    {
      title: "Trainers",
      url: "/trainers",
      icon: Dumbbell,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: ChartNoAxesCombined,
    },
    {
      title: "Exercises",
      url: "#",
      icon: Activity,
    },
    {
      title: "Sessions",
      url: "#",
      icon: ClipboardList,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: CircleHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex justify-center items-center h-[80px]">
              <Image 
                src="/images/logo.png" 
                alt="Gym Leveling Logo" 
                width={150} 
                height={50} 
                className="object-contain"
                priority
              />
            </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
