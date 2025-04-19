"use client"

import {
  Home,
  Users,
  Newspaper,
  Heart,
  Map,
  LogOut,
  ImageIcon,
  Building,
  Users2,
  Info,
  BookOpen,
  Dumbbell,
  BedDouble,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

// Regular menu items without sub-items
const regularMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Members",
    href: "/admin/members",
    icon: Users,
  },
  {
    title: "Party Plots Bookings",
    href: "/admin/party-plots",
    icon: Map,
  },
  {
    title: "Matrimonial",
    href: "/admin/matrimonial",
    icon: Heart,
  },
  {
    title: "News & Events",
    href: "/admin/news-events",
    icon: Newspaper,
  },
  {
    title: "Gallery",
    href: "/admin/gallery",
    icon: ImageIcon,
  },
  {
    title: "Committee",
    href: "/admin/committee",
    icon: Users2,
  },
  {
    title: "About Trust",
    href: "/admin/about-trust",
    icon: Info,
  },
]

// Facilities sub-menu items
const facilitiesSubItems = [
  // Removed "All Facilities" menu item
  {
    title: "Hostels",
    href: "/admin/facilities/hostels",
    icon: BedDouble,
    isLink: true,
  },
  {
    title: "Book Bank",
    href: "/admin/facilities/book-bank",
    icon: BookOpen,
    isLink: true,
  },
  {
    title: "Gym",
    href: "/admin/facilities/gym",
    icon: Dumbbell,
    isLink: true,
  },
  {
    title: "Astrology",
    href: "/admin/facilities/astrology",
    icon: Sparkles,
    isLink: true,
  },
  {
    title: "Party Plots",
    href: "/admin/facilities/party-plots",
    icon: Map,
    isLink: true,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [facilitiesOpen, setFacilitiesOpen] = useState(pathname.includes("/admin/facilities"))

  // Add this helper function
  const isActive = (path: string) => {
    // Check if the current path starts with the given path
    // This handles nested routes better
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <>
      <Sidebar className="h-screen">
        <SidebarHeader className="flex items-center justify-between px-4 py-2">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="relative w-32 h-10">
              <Image src="/logo.png" alt="Dayalji Ashram Logo" fill className="object-contain" />
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="h-full">
          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Regular menu items */}
                {regularMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                          isActive(item.href) ? "bg-muted text-primary" : "text-muted-foreground hover:bg-muted",
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Facilities with submenu */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.includes("/admin/facilities")}
                    className="justify-between"
                    onClick={() => setFacilitiesOpen(!facilitiesOpen)}
                  >
                    <div className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      <span>Facilities</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${facilitiesOpen ? "rotate-180" : ""}`}
                    />
                  </SidebarMenuButton>

                  {facilitiesOpen && (
                    <SidebarMenuSub>
                      {facilitiesSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                            <Link href={subItem.href}>
                              <subItem.icon className="mr-2 h-4 w-4" />
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="opacity-50 cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                <div className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  <span>Logout (Disabled)</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  )
}
