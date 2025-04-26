"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const [language, setLanguage] = useState("EN")

  return (
    <div className="flex items-center space-x-1 bg-primary/20 rounded-full p-1">
      <Button
        variant={language === "EN" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("EN")}
        className={`rounded-full px-4 ${
          language === "EN"
            ? "bg-quaternary text-white hover:bg-quaternary/90"
            : "text-gray-400 hover:text-black hover:bg-gray-100"
        }`}
      >
        EN
      </Button>
      <Button
        variant={language === "ID" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("ID")}
        className={`rounded-full px-4 ${
          language === "ID"
            ? "bg-quaternary text-white hover:bg-quaternary/90"
            : "text-gray-400 hover:text-black hover:bg-gray-100"
        }`}
      >
        ID
      </Button>
    </div>
  )
}