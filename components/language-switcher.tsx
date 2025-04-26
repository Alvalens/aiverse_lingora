"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<"EN" | "ID">("EN");

  return (
    <div className="flex overflow-hidden rounded-lg">
      <Button
        variant={language === "EN" ? "default" : "outline"}
        className={`rounded-none ${
          language === "EN"
            ? "bg-secondary text-black"
            : "bg-tertiary text-white border-none hover:bg-secondary hover:text-black" 
        }`}
        onClick={() => setLanguage("EN")}
      >
        EN
      </Button>
      <Button
        variant={language === "ID" ? "default" : "outline"}
        className={`rounded-none ${
          language === "ID"
            ? "bg-secondary text-black"
            : "bg-tertiary text-white border-none hover:bg-secondary hover:text-black"
        }`}
        onClick={() => setLanguage("ID")}
      >
        ID
      </Button>
    </div>
  );
}