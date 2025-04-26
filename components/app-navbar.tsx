"use client"

import { TokenDisplay } from "@/components/token-display"
import { UserProfile } from "@/components/user-profile"
import { AppBreadcrumb } from "@/components/app-breadcrumb"

export function AppNavbar() {
  // Static data for tokens
  const tokens = 125

  return (
    <header className="w-full border-b border-primary/20 bg-primary">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Breadcrumb hanya tampil di md ke atas */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <AppBreadcrumb />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TokenDisplay tokens={tokens} isLoading={false} error={false} />
          <UserProfile />
        </div>
      </div>
    </header>
  )
}