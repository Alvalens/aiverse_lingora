"use client"

import type React from "react"

import { FileText, HelpCircle, Home, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  className?: string
  isCollapsed?: boolean
  style?: React.CSSProperties
}

export function AppSidebar({ className, isCollapsed, style }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar
      style={{ backgroundColor: "#021A30", ...style }}
      className={`border-r-0 border-transparent text-sidebar-foreground sidebar-transition ${className} bg-sidebarCustom`}
      collapsible="icon"
      side="left"
      data-state={isCollapsed ? "collapsed" : "expanded"}
    >
      <SidebarHeader className="mt-0 pt-0" style={{ backgroundColor: "#021A30" }}>
        <div className={`flex h-16 items-center px-4 ${isCollapsed ? "justify-center" : ""}`}>
          <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            {!isCollapsed && (
              <div className="flex h-8 w-8 items-center justify-center">
                <Image
                  src="/images/loginregister/Logo-Intervyou.png"
                  alt="Intervyou Logo"
                  width={24}
                  height={24}
                  priority
                  className="h-8 w-8"
                />
              </div>
            )}
            <span
              className={`text-xl font-bold text-sidebar-foreground sidebar-transition ${
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
              }`}
            >
              Intervyou.ai
            </span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="mt-0 pt-0" style={{ backgroundColor: "#021A30" }}>
        {/* Dashboard */}
        <div className="px-2 pt-0 mt-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Dashboard"
                isActive={pathname === "/app/dashboard" || pathname === "/"}
                className={`${isCollapsed ? "!p-0" : ""} ${
                  pathname === "/app/dashboard" || pathname === "/"
                    ? "bg-[#18354E] hover:bg-[#18354E] text-white"
                    : "hover:bg-[#18354E] hover:text-white"
                }`}
              >
                <Link href="/app/dashboard" className="flex items-center w-full sidebar-transition">
                  <div className="flex items-center justify-center w-10 h-10">
                    <Home className={`h-5 w-5 ${pathname === "/app/dashboard" || pathname === "/" ? "text-white" : "hover:text-white"}`} />
                  </div>
                  <span
                    className={`sidebar-transition ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-3"
                    } ${pathname === "/app/dashboard" || pathname === "/" ? "text-white" : ""}`}
                  >
                    Dashboard
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        {/* MENU Section */}
        <div className="px-2 py-2 mt-4">
          <p
            className={`mb-2 px-2 text-xs font-semibold uppercase text-sidebar-foreground/50 transition-opacity sidebar-transition ${
              isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
            }`}
          >
            MENU
          </p>
          <SidebarMenu>
            {/* My CV */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="My CV"
                isActive={pathname.includes("/app/cv")}
                className={`${isCollapsed ? "!p-0" : ""} ${
                  pathname.includes("/app/cv")
                    ? "bg-[#18354E] hover:bg-[#18354E] text-white"
                    : "hover:bg-[#18354E] hover:text-white"
                }`}
              >
                <Link href="/app/cv" className="flex items-center w-full relative sidebar-transition">
                  <div className="flex items-center justify-center w-10 h-10">
                    <FileText className={`h-5 w-5 ${pathname.includes("/app/cv") ? "text-white" : "hover:text-white"}`} />
                  </div>
                  <span
                    className={`sidebar-transition ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-3"
                    } ${pathname.includes("/app/cv") ? "text-white" : ""}`}
                  >
                    My CV
                  </span>
                  <span
                    className={`absolute right-2 rounded hot-badge px-1.5 py-0.5 text-[10px] font-medium sidebar-transition ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    }`}
                  >
                    Hot
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* My Interview */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="My Interview"
                isActive={pathname.includes("/app/interview")}
                className={`${isCollapsed ? "!p-0" : ""} ${
                  pathname.includes("/app/interview")
                    ? "bg-[#18354E] hover:bg-[#18354E] text-white"
                    : "hover:bg-[#18354E] hover:text-white"
                }`}
              >
                <Link href="/app/interview" className="flex items-center w-full relative sidebar-transition">
                  <div className="flex items-center justify-center w-10 h-10">
                    <FileText className={`h-5 w-5 ${pathname.includes("/app/interview") ? "text-white" : "hover:text-white"}`} />
                  </div>
                  <span
                    className={`sidebar-transition ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-3"
                    } ${pathname.includes("/app/interview") ? "text-white" : ""}`}
                  >
                    My Interview
                  </span>
                  <span
                    className={`absolute right-2 rounded hot-badge px-1.5 py-0.5 text-[10px] font-medium sidebar-transition ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    }`}
                  >
                    Hot
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Shop */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Shop"
                isActive={pathname.includes("/app/shop")}
                className={`${isCollapsed ? "!p-0" : ""} ${
                  pathname.includes("/app/shop")
                    ? "bg-[#18354E] hover:bg-[#18354E] text-white"
                    : "hover:bg-[#18354E] hover:text-white"
                }`}
              >
                <Link href="/app/shop" className="flex items-center w-full sidebar-transition">
                  <div className="flex items-center justify-center w-10 h-10">
                    <ShoppingCart className={`h-5 w-5 ${pathname.includes("/app/shop") ? "text-white" : "hover:text-white"}`} />
                  </div>
                  <span
                    className={`sidebar-transition ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-3"
                    } ${pathname.includes("/app/shop") ? "text-white" : ""}`}
                  >
                    Shop
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Help */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Help"
                isActive={pathname.includes("/app/help")}
                className={`${isCollapsed ? "!p-0" : ""} ${
                  pathname.includes("/app/help")
                    ? "bg-[#18354E] hover:bg-[#18354E] text-white"
                    : "hover:bg-[#18354E] hover:text-white"
                }`}
              >
                <Link href="/app/help" className="flex items-center w-full sidebar-transition">
                  <div className="flex items-center justify-center w-10 h-10">
                    <HelpCircle className={`h-5 w-5 ${pathname.includes("/app/help") ? "text-white" : "hover:text-white"}`} />
                  </div>
                  <span
                    className={`sidebar-transition ${
                      isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-3"
                    } ${pathname.includes("/app/help") ? "text-white" : ""}`}
                  >
                    Help
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="flex justify-center items-center" style={{ backgroundColor: "#021A30" }}>
        <div
          className={`p-4 text-xs text-primary-foreground/50 transition-opacity sidebar-transition text-center ${
            isCollapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
          }`}
        >
          © 2025 intervyou.ai
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}