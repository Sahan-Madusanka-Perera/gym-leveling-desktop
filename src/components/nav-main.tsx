"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Update the type to accept Lucide icons
export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ForwardRefExoticComponent<any> // This accepts Lucide icons
  }[]
}) {
  const pathname = usePathname()
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
            
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    className={`flex items-center gap-2 ${isActive ? "bg-primary/10 text-primary font-medium" : ""}`}
                  >
                    {item.icon && <item.icon className={isActive ? "text-primary" : ""} />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
