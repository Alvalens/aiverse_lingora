"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

// Components
import ProgressIndicator from "./components/progress-indicator"
import LoadingScreen from "@/components/loading-screen"
import IntroductionStep from "./components/step/introduction-step"
import LanguageStep from "./components/step/language-step"
import DiscoveryStep from "./components/step/discovery-step"
import ReferralStep from "./components/step/referral-step"
import AgreementStep from "./components/step/agreement-step"

import CompleteStep from "./components/step/complete-step"
import EmailVerificationStep from "./components/step/email-verification-step"

export default function OnboardingPage() {
  const { data: session, update: updateSession, status } = useSession()
  const router = useRouter()

  const PROGRESS_LABELS = ["Email", "Introduction", "Language", "Discovery", "Referral", "Agreement", "Complete"]

  const [emailTimer, setEmailTimer] = useState(0)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [language, setLanguage] = useState<"EN" | "ID">("ID")
  const [sources, setSources] = useState<string[]>([])
  const [agreement, setAgreement] = useState(false)
  
  const [referralInput, setReferralInput] = useState("")

  useEffect(() => {
    const expires = localStorage.getItem("emailTimerExpires")
    if (expires) {
      const remaining = Math.floor((Number.parseInt(expires) - Date.now()) / 1000)
      if (remaining > 0) {
        setEmailTimer(remaining)
      } else {
        localStorage.removeItem("emailTimerExpires")
      }
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [emailTimer])

  useEffect(() => {
    if (currentStep === 0 && session?.user?.emailVerified) {
      setIsEmailVerified(true)
      toast.success("Email berhasil diverifikasi")
    }
  }, [router, session, currentStep])

  useEffect(() => {
    if (session?.user?.emailVerified) {
      setIsEmailVerified(true)
      if (currentStep === 0) {
        setCurrentStep(1)
      }
    } else {
      setIsEmailVerified(false)
    }
  }, [session, currentStep])

  useEffect(() => {
    const storedReferral = localStorage.getItem("referralCode")
    if (storedReferral) {
      setReferralInput(storedReferral)
    }
  }, [])

  const handleSourceChange = (sourceId: string) => {
    if (sources.includes(sourceId)) {
      setSources(sources.filter((id) => id !== sourceId))
    } else {
      setSources([...sources, sourceId])
    }
  }

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }

  if (status === "loading") {
    return <LoadingScreen />
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <EmailVerificationStep
            emailTimer={emailTimer}
            isEmailVerified={isEmailVerified}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            error={error}
            setError={setError}
            setEmailTimer={setEmailTimer}
            onContinue={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 1:
        return (
          <IntroductionStep
            userName={session?.user?.name ?? undefined}
            onContinue={() => setCurrentStep(currentStep + 1)}
          />
        )
      case 2:
        return (
          <LanguageStep
            language={language}
            setLanguage={setLanguage}
            onBack={() => setCurrentStep(currentStep - 1)}
            onContinue={() => setCurrentStep(currentStep + 1)}
            error={error}
            setError={setError}
          />
        )
      case 3:
        return (
          <DiscoveryStep
            sources={sources}
            onSourceChange={handleSourceChange}
            onBack={() => setCurrentStep(currentStep - 1)}
            onContinue={() => setCurrentStep(currentStep + 1)}
            error={error}
            setError={setError}
          />
        )
      case 4:
        return (
          <ReferralStep
            referralInput={referralInput}
            setReferralInput={setReferralInput}
            onSkip={() => setCurrentStep(currentStep + 1)}
            onContinue={() => setCurrentStep(currentStep + 1)}
            error={error}
            setError={setError}
          />
        )
      case 5:
        return (
          <AgreementStep
            agreement={agreement}
            setAgreement={setAgreement}
            onBack={() => setCurrentStep(currentStep - 1)}
            onContinue={() => setCurrentStep(currentStep + 1)}
            error={error}
            setError={setError}
            updateSession={updateSession}
          />
        )
      case 6:
        return <CompleteStep onComplete={completeOnboarding} />
      default:
        return null
    }
  }

  const completeOnboarding = () => {
    if (session?.user?.agreement) {
      window.location.href = "/app/dashboard"
    } else {
      toast.error("Please complete the onboarding process first")
    }
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="bg-secondary text-color-text text-center py-4">
        <h1 className="text-2xl font-bold">Onboarding</h1>
      </div>

      <div className="max-w-7xl text-color-text mx-auto py-6 px-4">
        <ProgressIndicator currentStep={currentStep} steps={PROGRESS_LABELS} />
      </div>

      <div
        className="bg-secondary border border-color-border  rounded-lg shadow-lg p-8 max-w-7xl mx-auto h-auto"
        
      >
        {renderStepContent()}
      </div>
    </div>
  )
}
