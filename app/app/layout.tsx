"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/app-navbar"
import { usePathname } from "next/navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Check if the current path is the onboarding page
  const isOnboardingPage = pathname?.startsWith("/app/onboarding")

  // If we're on the onboarding page, render without sidebar and navbar
  if (isOnboardingPage) {
    return (
      <SessionProvider>
        <div className="min-h-screen">
          {children}
          <Toaster />
        </div>
      </SessionProvider>
    )
  }

  // Otherwise, render with sidebar and navbar
  return (
    <SessionProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div
          className="flex flex-col flex-1 sidebar-transition ml-16 md:ml-16"
          style={{ marginLeft: "var(--sidebar-width, 4rem)" }}
        >
          <AppNavbar />
          <main className="flex-1 overflow-auto bg-primary max-h-[calc(100vh-64px)]">
            <div className="mx-auto h-full max-w-7xl px-4 py-4 md:px-6 md:py-6">{children}</div>
          </main>
        </div>
      </div>
      <Toaster />
    </SessionProvider>
  )
}
