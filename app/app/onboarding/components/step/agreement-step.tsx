"use client"
import { useState } from "react"
import { toast } from "react-hot-toast"
import ErrorMessage from "@/components/error-message"
import StepNavigation from "../step-navigation"

interface AgreementStepProps {
  agreement: boolean
  setAgreement: (value: boolean) => void
  onBack: () => void
  onContinue: () => void
  error: string
  setError: (value: string) => void
  updateSession: (data: any) => Promise<any>
}

export default function AgreementStep({
  agreement,
  setAgreement,
  onBack,
  onContinue,
  error,
  setError,
  updateSession,
}: AgreementStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = async () => {
    setError("")
    setIsSubmitting(true)

    try {
      if (!agreement) {
        setError("You must accept the terms to continue")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("/api/user/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreement }),
      })

      if (!response.ok) {
        throw new Error("Failed to save agreement")
      }

      await updateSession({ agreement: true })
      toast.success("Terms accepted successfully")
      onContinue()
    } catch (error) {
      console.error("Error saving agreement:", error)
      setError("Failed to save your agreement. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Terms of Service</h2>

      <ErrorMessage message={error} />

      <div className="border rounded-lg p-4 mb-6 h-64 overflow-y-auto bg-[#0E63A9]">
        <h3 className="font-semibold mb-2">IntervYou Terms of Service</h3>
        <p className="mb-4">By using IntervYou, you agree to the following terms:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li>IntervYou uses AI technology to provide interview practice services.</li>
          <li>Your personal data will be processed according to our Privacy Policy.</li>
          <li>You are responsible for maintaining the confidentiality of your account.</li>
          <li>We may collect and analyze your responses to improve our service.</li>
          <li>The platform is provided &quot;as is&quot; without warranties of any kind.</li>
          <li>We reserve the right to modify or terminate the service at any time.</li>
          <li>AI-generated content may not always be accurate and should be reviewed.</li>
          <li>Your use of the service is at your own risk.</li>
        </ol>
        <h3 className="font-semibold mt-6 mb-2">Data Processing Agreement</h3>
        <p className="mb-4">We process your data for the following purposes:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Providing interview practice services</li>
          <li>Analyzing responses to improve our AI model</li>
          <li>Creating personalized feedback based on your performance</li>
          <li>Storing your CV for job matching and interview preparation</li>
        </ul>
      </div>

      <div className="mb-8">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={agreement}
            onChange={(e) => setAgreement(e.target.checked)}
            className="w-5 h-5 text-[#0E63A9] rounded"
            required
          />
          <span className="ml-3 text-white">
            I have read and agree to the Terms of Service and Data Processing Agreement
          </span>
        </label>
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={handleContinue}
        isSubmitting={isSubmitting}
        isContinueDisabled={!agreement}
      />
    </div>
  )
}
