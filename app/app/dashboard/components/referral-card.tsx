"use client"

import { Copy } from "lucide-react"
import { useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const STATIC_DATA = {
  referralCode: "AZARYA094",
}

export function ReferralCard() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(STATIC_DATA.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-[hsl(var(--border))] bg-[hsl(var(--tertiary))] h-[175px] w-full">
      <CardHeader className="pb-1 pt-3 border-b border-[hsl(var(--border))]">
        <CardTitle className="text-base font-bold text-[hsl(var(--tertiary-foreground))]">Referral</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-[calc(175px-44px)] pt-2 pb-3">
        <div className="flex items-center gap-2 mt-3">
          <div className="relative w-[250px]">
            <Input
              value={STATIC_DATA.referralCode}
              readOnly
              className="border-[hsl(var(--border))] bg-[#000D1B] text-[hsl(var(--tertiary-foreground))] h-9 text-base pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[hsl(var(--tertiary-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary-foreground))] h-7 w-7"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
          <Button
            className="h-9 text-base bg-[hsl(var(--primary))] border border-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))] hover:bg-secondary hover:text-black"
            onClick={copyToClipboard}
          >
            Copy Link
          </Button>
        </div>

        <Button className="w-full h-9 text-base bg-[hsl(var(--secondary))] text-black hover:bg-[hsl(var(--secondary))]/90 mt-auto rounded-lg">
          More info
        </Button>
      </CardContent>
    </Card>
  )
}