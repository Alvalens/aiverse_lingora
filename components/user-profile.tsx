"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserProfile() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === "loading") {
    return <div className="text-sm text-primary-foreground/70">Loading...</div>
  }

  if (!session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 rounded-full px-2 py-1 text-primary-foreground outline-none transition-colors hover:bg-primary-foreground/10"
      >
        <span className="text-sm">Sign In</span>
      </button>
    )
  }

  const userName = session.user?.name || "Guest User"
  const userEmail = session.user?.email || "No email available"
  const userImage = session.user?.image || "/placeholder.svg?height=36&width=36"

  // Active state check
  const isProfileActive = pathname === "/app/profile"
  const isSettingActive = pathname === "/app/setting"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full px-2 py-1 text-primary-foreground outline-none transition-colors hover:bg-[#052038]">
          <div className="h-9 w-9 overflow-hidden rounded-full border border-primary-foreground/20">
            <Image
              src={userImage}
              alt={userName}
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="hidden flex-col text-left text-sm md:flex">
            <span className="font-medium text-primary-foreground">{userName}</span>
            <span className="text-xs text-primary-foreground/70">{userEmail}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-primary-foreground/70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-medium text-primary-foreground">{userName.charAt(0)}</span>
          </div>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className={`hover:bg-[#052038] hover:text-white focus:bg-[#052038] focus:text-white ${
            isProfileActive ? "bg-[#052038] text-white" : ""
          }`}
        >
          <Link href="/app/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Detail</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className={`hover:bg-[#052038] hover:text-white focus:bg-[#052038] focus:text-white ${
            isSettingActive ? "bg-[#052038] text-white" : ""
          }`}
        >
          <Link href="/app/setting" className="flex items-center w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span>Setting</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-destructive focus:text-destructive hover:bg-[#052038] focus:bg-[#052038]"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}