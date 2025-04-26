"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function AppBreadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter((segment) => segment && segment !== "app")

  return (
    <div className="bg-primary border border-[#757575] rounded-full px-6 py-2 flex items-center w-fit">
      <Breadcrumb>
        <BreadcrumbList>
          {segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard") ? (
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[#757575] font-medium">Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            segments.map((segment, index) => {
              const href = `/app/${segments.slice(0, index + 1).join("/")}`
              const isLast = index === segments.length - 1
              const displayName = segment.charAt(0).toUpperCase() + segment.slice(1)
              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-[#757575] font-medium">{displayName}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href} className="text-secondary/70">
                          {displayName}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
