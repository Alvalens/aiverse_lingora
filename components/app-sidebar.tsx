"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

interface AppSidebarProps {
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AppSidebar({ defaultOpen = true, onOpenChange }: AppSidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const pathname = usePathname()

  // Helper to check active state
  const isActive = (href: string) => {
    if (href === "/app/dashboard" && (pathname === "/app/dashboard" || pathname === "/app" || pathname === "/")) {
      return true
    }
    return pathname === href
  }

  useEffect(() => {
    // Load sidebar state from localStorage on mount
    const savedState = localStorage.getItem("sidebar-state")
    if (savedState) {
      const parsedState = savedState === "true"
      setIsOpen(parsedState)
      if (onOpenChange) onOpenChange(parsedState)
    }

    // Update CSS variable for content margin
    document.documentElement.style.setProperty("--sidebar-width", isOpen ? "20rem" : "4rem")
  }, [isOpen, onOpenChange])

  const toggleSidebar = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem("sidebar-state", String(newState))
    if (onOpenChange) onOpenChange(newState)

    // Update CSS variable for content margin
    document.documentElement.style.setProperty("--sidebar-width", newState ? "20rem" : "4rem")
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-primary z-30 flex flex-col transform transition-all duration-300 ease-in-out ${
          isOpen ? "w-80 translate-x-0" : "w-16 translate-x-0"
        }`}
        style={{ backgroundColor: "primary" }}
      >
        {/* Logo and Header - Hidden when collapsed */}
        {isOpen && (
          <div className="mt-4 pt-4 flex justify-center items-center px-4 animate-fadeIn">
            <Link href="/" className="flex items-center gap-3 justify-center w-full">
              <div className="flex h-10 w-10 items-center justify-center">
                <Image
                  src="/images/dashboard/logo-lingora.svg"
                  alt="Lingora Logo"
                  width={32}
                  height={32}
                  priority
                  className="h-10 w-10"
                />
              </div>
              <span className="text-xl font-bold text-color-text">Lingora</span>
            </Link>
          </div>
        )}

        {/* Menu Content */}
        <div className={`${isOpen ? "mt-8" : "mt-16"} flex-1 overflow-y-auto`}>
          {/* Dashboard */}
          <div className="px-2 mb-4">
            <Link
              href="/app/dashboard"
              className={`flex items-center rounded-xl p-3 transition-all duration-200 ${
                isActive("/app/dashboard")
                  ? "bg-[#E7EBEE] text-color-text"
                  : "bg-primary text-color-text hover:bg-[#E7EBEE]"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <Image src="/images/dashboard/dashboard.svg" alt="Dashboard" width={40} height={40} />
              </div>
              <span
                className={`text-base font-medium transition-all duration-300 ${
                  isOpen ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                Dashboard
              </span>
            </Link>
          </div>

          {/* Menu Section */}
          <div className="px-2">
            {isOpen && <p className="mb-2 px-2 text-lg font-semibold text-color-text animate-fadeIn">Conversation</p>}

            {/* Conversation */}
            <Link
              href="/app/conversation"
              className={`flex items-center rounded-xl p-3 mb-2 transition-all duration-200 ${
                isActive("/app/conversation") ? "bg-[#E7EBEE] text-color-text" : "text-color-text hover:bg-[#E7EBEE]"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <Image src="/images/dashboard/daily-talk.svg" alt="Conversation" width={40} height={40} />
              </div>
              <span
                className={`text-base font-medium transition-all duration-300 ${
                  isOpen ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                Daily Talk
              </span>
            </Link>

            {/* Writing */}
            <Link
              href="/app/conversation/story-telling"
              className={`flex items-center rounded-xl p-3 mb-2 transition-all duration-200 ${
                isActive("/app/conversation/story-telling") ? "bg-[#E7EBEE] text-color-text" : "text-color-text hover:bg-[#E7EBEE]"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <Image src="/images/dashboard/retell-describe.svg" alt="Writing" width={40} height={40} />
              </div>
              <span
                className={`text-base font-medium transition-all duration-300 ${
                  isOpen ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                Retell & Describe
              </span>
            </Link>

            {/* Vocabulary */}
            <Link
              href="/app/conversation/interactive-debate"
              className={`flex items-center rounded-xl p-3 mb-2 transition-all duration-200 ${
                isActive("/app/conversation/interactive-debate") ? "bg-[#E7EBEE] text-color-text" : "text-color-text hover:bg-[#E7EBEE]"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <Image src="/images/dashboard/interactive-debate.svg" alt="Vocabulary" width={40} height={40} />
              </div>
              <span
                className={`text-base font-medium transition-all duration-300 ${
                  isOpen ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                Interactive Debate
              </span>
            </Link>
          </div>

          {isOpen && <div className="my-4 border-t border-color-border-secondary mx-2 animate-fadeIn" />}

          {/* Menu Section */}
          <div className="px-2">
            {isOpen && <p className="mb-2 px-2 text-lg font-semibold text-color-text animate-fadeIn">Writing</p>}

            {/* Conversation */}
            <Link
              href="/app/writing"
              className={`flex items-center rounded-xl p-3 mb-2 transition-all duration-200 ${
                isActive("/app/essay-analysis") ? "bg-[#E7EBEE] text-color-text" : "text-color-text hover:bg-[#E7EBEE]"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <Image src="/images/dashboard/essay-analysis.svg" alt="Conversation" width={40} height={40} />
              </div>
              <span
                className={`text-base font-medium transition-all duration-300 ${
                  isOpen ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                Essay Analysis
              </span>
            </Link>
            </div>

          {/* Divider - only show when sidebar is open */}
          {isOpen && <div className="my-4 border-t border-color-border-secondary mx-2 animate-fadeIn" />}

          {/* Shop & Help */}
          <div className="px-2">
            {/* Shop */}
            <Link
              href="/app/shop"
              className={`flex items-center rounded-xl p-3 mb-2 transition-all duration-200 ${
                isActive("/app/shop") ? "bg-[#E7EBEE] text-color-text" : "text-color-text hover:bg-[#E7EBEE]"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <Image src="/images/dashboard/shop.svg" alt="Shop" width={40} height={40} />
              </div>
              <span
                className={`text-base font-medium transition-all duration-300 ${
                  isOpen ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                Shop
              </span>
            </Link>

            {/* Help */}
            <Link
              href="/app/help"
              className={`flex items-center rounded-xl p-3 mb-2 transition-all duration-200 ${
                isActive("/app/help") ? "bg-[#E7EBEE] text-color-text" : "text-color-text hover:bg-[#E7EBEE]"
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12">
                <Image src="/images/dashboard/help.svg" alt="Help" width={40} height={40} />
              </div>
              <span
                className={`text-base font-medium transition-all duration-300 ${
                  isOpen ? "opacity-100 w-auto ml-3" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                Help
              </span>
            </Link>
          </div>
        </div>

        {/* Footer - only show when sidebar is open */}
        {isOpen && (
          <div className="p-4 text-center animate-fadeIn">
            <div className="text-xs text-color-text/50">© 2025 Lingora</div>
          </div>
        )}
      </div>

      {/* Toggle Button - aligned with Dashboard menu */}
      <div
        className="fixed z-40 transition-all duration-300 ease-in-out top-[105px]"
        style={{ left: isOpen ? "calc(var(--sidebar-width) + 0px)" : "calc(var(--sidebar-width) + 0px)" }}
      >
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-12 items-center justify-center rounded-br-lg bg-quaternary text-white shadow-md hover:bg-quaternary/80 transition-all duration-300"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Main content margin adjuster */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          marginLeft: `var(--sidebar-width)`,
          transition: "margin-left 0.3s ease-in-out",
        }}
      />
    </>
  )
}
