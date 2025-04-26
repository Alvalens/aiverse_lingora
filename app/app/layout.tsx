"use client"

import type React from "react"
import { Toaster } from "react-hot-toast"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/app-navbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [defaultOpen, setDefaultOpen] = useState(true)
  const pathname = usePathname()

  // Check if the current path is the onboarding page
  const isOnboardingPage = pathname?.startsWith("/app/onboarding")

  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state")
    if (savedState) {
      setDefaultOpen(savedState === "true")
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !defaultOpen
    setDefaultOpen(newState)
    localStorage.setItem("sidebar-state", String(newState))
  }

  // If we're on the onboarding page, render without sidebar and navbar
  if (isOnboardingPage) {
    return (
      <div className="min-h-screen">
        {children}
        <Toaster />
      </div>
    )
  }

  // Otherwise, render with sidebar and navbar
  return (
    <SidebarProvider defaultOpen={defaultOpen} onOpenChange={setDefaultOpen}>
      <div className="flex h-screen w-screen overflow-hidden">
        <div
          style={{ backgroundColor: "#021A30" }}
          className={`sidebar-transition ${defaultOpen ? "w-80" : "w-16"} bg-sidebarCustom`}
        >
          <AppSidebar
            style={{ backgroundColor: "#021A30" }}
            className={`sidebar-transition ${defaultOpen ? "w-80" : "w-16"} bg-sidebarCustom`}
            isCollapsed={!defaultOpen}
          />
        </div>

        <div className={`absolute z-10 sidebar-transition ${defaultOpen ? "left-[320px]" : "left-[65px]"} top-[65px]`}>
          <button
            onClick={toggleSidebar}
            className="flex h-10 w-12 items-center justify-center rounded-br-lg bg-secondary text-secondary-foreground shadow-md hover:bg-secondary/80 transition-all duration-300"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <SidebarInset className="flex flex-1 flex-col sidebar-transition">
          <AppNavbar />
          <main className="flex-1 overflow-auto bg-primary max-h-[calc(100vh-64px)]">
            <div className="mx-auto h-full max-w-7xl px-4 py-4 md:px-6 md:py-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
