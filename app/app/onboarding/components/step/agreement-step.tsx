"use client"
import { useState } from "react"
import { toast } from "react-hot-toast"
import type { Session } from "next-auth"
import ErrorMessage from "@/components/error-message"
import StepNavigation from "../step-navigation"
import { Checkbox } from "@/components/ui/checkbox"

interface AgreementStepProps {
  agreement: boolean;
  setAgreement: (value: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
  error: string;
  setError: (value: string) => void;
  updateSession: (data: Partial<Session["user"]>) => Promise<Session | null>;
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
    <div className="max-w-2xl mx-auto text-color-text">
      <h2 className="text-2xl font-bold mb-6 text-center">Terms of Service & Privacy Policy</h2>

      <ErrorMessage message={error} />

      <div className="border rounded-lg p-4 mb-6 h-64 overflow-y-auto space-y-6">
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span role="img" aria-label="scroll">📜</span> Terms of Service
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Acceptance of Terms</strong><br />
              By accessing or using Lingora, you agree to these Terms of Service. If you don’t agree, please do not use the platform.
            </li>
            <li>
              <strong>User Accounts</strong>
              <ul className="list-disc ml-5">
                <li>You must register with a valid email and create a secure password.</li>
                <li>Keep your credentials confidential.</li>
                <li>You’re responsible for all activity under your account.</li>
              </ul>
            </li>
            <li>
              <strong>Acceptable Use</strong>
              <ul className="list-disc ml-5">
                <li>Don’t misuse the service: no harassment, hate speech, or illegal content.</li>
                <li>No unauthorized bots or scraping of our content.</li>
                <li>Violation may lead to suspension or termination.</li>
              </ul>
            </li>
            <li>
              <strong>Intellectual Property</strong><br />
              All content on Lingora—text, images, audio, code—is owned by Lingora or its licensors. You may not reproduce or distribute without permission. For more on intellectual property, see our guidelines.
            </li>
            <li>
              <strong>Payments & Tokens</strong>
              <ul className="list-disc ml-5">
                <li>Sessions and features require tokens.</li>
                <li>Tokens are non-refundable and expire 12 months after purchase.</li>
                <li>Lingora reserves the right to adjust pricing with 30 days’ notice.</li>
              </ul>
            </li>
            <li>
              <strong>Disclaimer of Warranties</strong><br />
              Lingora is provided “as is.” We make no guarantees regarding accuracy of feedback or uninterrupted service. See warranty disclaimers for details.
            </li>
            <li>
              <strong>Limitation of Liability</strong><br />
              Lingora’s liability is limited to the amount you’ve paid in the last 12 months. We’re not liable for indirect or consequential damages. Learn more about limitation of liability.
            </li>
            <li>
              <strong>Changes to Terms</strong><br />
              We may update these terms. If material changes occur, we’ll notify you via email at least 30 days before they take effect.
            </li>
            <li>
              <strong>Governing Law</strong><br />
              These terms are governed by the laws of your jurisdiction without regard to conflict-of-law principles.
            </li>
            <li>
              <strong>Contact Us</strong><br />
              Questions? Email <a href="mailto:legal@lingora.com" className="underline text-tertiary">lingora.com</a>.
            </li>
          </ol>
        </div>
        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span role="img" aria-label="lock">🔐</span> Privacy Policy
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Information We Collect</strong>
              <ul className="list-disc ml-5">
                <li>Account Info: name, email, profile picture.</li>
                <li>Usage Data: sessions completed, tokens spent, device info.</li>
                <li>Communications: messages you send to support or peers.</li>
              </ul>
            </li>
            <li>
              <strong>How We Use Your Data</strong>
              <ul className="list-disc ml-5">
                <li>To provide and improve Lingora features.</li>
                <li>To personalize your learning path.</li>
                <li>To send transactional emails (verification, receipts).</li>
              </ul>
            </li>
            <li>
              <strong>Cookies & Tracking</strong><br />
              We use cookies and similar technologies to remember preferences and analyze usage trends.
            </li>
            <li>
              <strong>Data Security</strong><br />
              We implement industry-standard data security measures (encryption, secure servers) to protect your information.
            </li>
            <li>
              <strong>Third-Party Services</strong><br />
              We may share data with trusted providers (e.g., payment processors, analytics). All partners comply with equivalent privacy standards.
            </li>
            <li>
              <strong>Children’s Privacy</strong><br />
              Lingora is not directed to children under 13. We do not knowingly collect their personal data.
            </li>
            <li>
              <strong>Your Choices</strong>
              <ul className="list-disc ml-5">
                <li>You can access, correct, or delete your account data in settings.</li>
                <li>Opt out of marketing emails by clicking “Unsubscribe” in any email.</li>
              </ul>
            </li>
            <li>
              <strong>Changes to Policy</strong><br />
              We’ll notify you of significant changes via email or an in-app notice.
            </li>
            <li>
              <strong>Contact Us</strong><br />
              For privacy questions, email <a href="mailto:privacy@lingora.com" className="underline text-tertiary">lingora.com</a>.
            </li>
          </ol>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="agreement"
            checked={agreement}
            onCheckedChange={(checked) => setAgreement(!!checked)}
            className="w-5 h-5 data-[state=checked]:bg-tertiary data-[state=checked]:border-tertiary"
            required
          />
          <label
            htmlFor="agreement"
            className="ml-1 text-color-text text-base font-normal cursor-pointer"
          >
            I have read and agree to the Terms of Service and Privacy Policy
          </label>
        </div>
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