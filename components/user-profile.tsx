"use client"

import { ChevronDown, LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"

export function UserProfile() {
  const { data: session } = useSession();

  // Default values if not logged in
  const userName = session?.user?.name || "Guest User";
  const userEmail = session?.user?.email || "guest@email.com";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full px-2 py-1 bg-primary outline-none transition-colors hover:bg-primary/90">
          {/* Avatar */}
          <span className="h-9 w-9 flex items-center justify-center rounded-full bg-[#D9D9D9]">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="12" r="6" fill="#21405A" />
              <ellipse cx="16" cy="24" rx="9" ry="6" fill="#21405A" />
            </svg>
          </span>
          <div className="flex flex-col text-left text-sm">
            <span className="font-medium text-color-text">{userName}</span>
            <span className="text-xs text-color-text/70">{userEmail}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-color-text/70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <span className="h-8 w-8 flex items-center justify-center rounded-full bg-[#D9D9D9]">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="12" r="6" fill="#21405A" />
              <ellipse cx="16" cy="24" rx="9" ry="6" fill="#21405A" />
            </svg>
          </span>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/app/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Detail</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/setting" className="flex items-center w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span>Setting</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}