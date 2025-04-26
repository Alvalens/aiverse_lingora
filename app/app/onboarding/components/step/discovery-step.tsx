"use client"
import { useState } from "react"
import ErrorMessage from "@/components/error-message"
import StepNavigation from "../step-navigation"

interface DiscoveryStepProps {
  sources: string[]
  onSourceChange: (sourceId: string) => void
  onBack: () => void
  onContinue: () => void
  error: string
  setError: (value: string) => void
}

export default function DiscoveryStep({
  sources,
  onSourceChange,
  onBack,
  onContinue,
  error,
  setError,
}: DiscoveryStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const SOURCE_OPTIONS = [
    { id: "website", label: "Website" },
    { id: "instagram", label: "Instagram" },
    { id: "youtube", label: "YouTube" },
    { id: "tiktok", label: "TikTok" },
    { id: "facebook", label: "Facebook" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "friend", label: "Friend recommendation" },
    { id: "search", label: "Search engine" },
    { id: "other", label: "Other" },
  ]

  const handleContinue = async () => {
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources }),
      })

      if (!response.ok) {
        throw new Error("Failed to save source information")
      }

      onContinue()
    } catch (error) {
      console.error("Error saving tracking sources:", error)
      setError("Failed to save your selections. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">How Did You Find Us?</h2>
      <p className="mb-6 text-center text-base">We&apos;d love to know how you discovered IntervYou.</p>

      <ErrorMessage message={error} />

      <div className="space-y-3 mb-8">
        {SOURCE_OPTIONS.map((option) => (
          <label
            key={option.id}
            className="bg-primary text-white flex items-center p-3 border rounded-lg hover:bg-[#0E63A9] cursor-pointer"
          >
            <input
              type="checkbox"
              checked={sources.includes(option.id)}
              onChange={() => onSourceChange(option.id)}
              className="w-5 h-5 text-[#0E63A9] rounded"
            />
            <span className="ml-3">{option.label}</span>
          </label>
        ))}
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={handleContinue}
        isSubmitting={isSubmitting}
        isContinueDisabled={sources.length === 0}
      />
    </div>
  )
}
