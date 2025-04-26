"use client"
import { useState } from "react"
import ErrorMessage from "@/components/error-message"
import StepNavigation from "../step-navigation"

interface LanguageStepProps {
  language: "EN" | "ID"
  setLanguage: (lang: "EN" | "ID") => void
  onBack: () => void
  onContinue: () => void
  error: string
  setError: (value: string) => void
}

export default function LanguageStep({
  language,
  setLanguage,
  onBack,
  onContinue,
  error,
  setError,
}: LanguageStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = async () => {
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      })

      if (!response.ok) {
        throw new Error("Failed to update language preference")
      }

      onContinue()
    } catch (error) {
      console.error("Error saving language:", error)
      setError("Failed to save language preference. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto text-color-text">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Language</h2>
      <p className="mb-6 text-center">Select your preferred language for the platform interface.</p>

      <ErrorMessage message={error} />

      <div className="space-y-4 mb-8">
        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setLanguage("EN")}
            className={`px-6 py-4 border-2 rounded-lg flex-1 ${
              language === "EN" ? "bg-tertiary border-tertiary text-white" : "bg-primary border-tertiary text-color-text"
            }`}
          >
            <div className="text-center">
              <p className="text-lg font-medium">English</p>
              <p className="text-base">EN</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setLanguage("ID")}
            className={`px-6 py-4 border-2 rounded-lg flex-1 ${
              language === "ID" ? "bg-tertiary border-tertiary text-white" : "bg-primary border-tertiary text-color-text"
            }`}
          >
            <div className="text-center">
              <p className="text-lg font-medium">Bahasa Indonesia</p>
              <p className="text-base">ID</p>
            </div>
          </button>
        </div>
      </div>

      <StepNavigation onBack={onBack} onContinue={handleContinue} isSubmitting={isSubmitting} />
    </div>
  )
}
