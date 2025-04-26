"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import ErrorMessage from "@/components/error-message"
import StepNavigation from "../step-navigation"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

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
] as const

const FormSchema = z.object({
  sources: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Please select at least one source.",
  }),
})

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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sources,
    },
  })

  const handleContinue = async (data: z.infer<typeof FormSchema>) => {
    setError("")
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/user/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: data.sources }),
      })

      if (!response.ok) {
        throw new Error("Failed to save source information")
      }

      // Sync checked sources to parent state
      data.sources.forEach((id) => {
        if (!sources.includes(id)) onSourceChange(id)
      })
      sources.forEach((id) => {
        if (!data.sources.includes(id)) onSourceChange(id)
      })

      onContinue()
    } catch (error) {
      console.error("Error saving tracking sources:", error)
      setError("Failed to save your selections. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto text-color-text">
      <h2 className="text-2xl font-bold mb-6 text-center">How Did You Find Us?</h2>
      <p className="mb-6 text-center text-base">We&apos;d love to know how you discovered Lingora.</p>

      <ErrorMessage message={error} />

      <Form {...form}>
  <form onSubmit={form.handleSubmit(handleContinue)} className="space-y-8">
    <FormField
      control={form.control}
      name="sources"
      render={() => (
        <FormItem>
          <div className="space-y-3 mb-8">
            {SOURCE_OPTIONS.map((option) => (
              <FormField
                key={option.id}
                control={form.control}
                name="sources"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 bg-primary border border-tertiary rounded-lg p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, option.id])
                          } else {
                            field.onChange(field.value.filter((v: string) => v !== option.id))
                          }
                          onSourceChange(option.id)
                        }}
                        className="data-[state=checked]:bg-tertiary data-[state=checked]:border-tertiary"
                      />
                    </FormControl>
                    <FormLabel className="text-base font-normal cursor-pointer">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
    <StepNavigation
      onBack={onBack}
      onContinue={form.handleSubmit(handleContinue)}
      isSubmitting={isSubmitting}
      isContinueDisabled={form.watch("sources").length === 0}
    />
  </form>
</Form>
    </div>
  )
}