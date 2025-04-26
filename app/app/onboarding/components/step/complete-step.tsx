"use client"

interface CompleteStepProps {
  onComplete: () => void
}

export default function CompleteStep({ onComplete }: CompleteStepProps) {
  return (
    <div className="max-w-xl mx-auto text-center text-color-text">
      <div className="mb-6">
        <svg className="mx-auto h-16 w-16 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-4">You&apos;re All Set!</h2>
      <p className="mb-8 text-base">
        Your account has been successfully set up. You&apos;re ready to start practicing interviews and improving your
        skills!
      </p>
      <button
        onClick={onComplete}
        className="bg-primary border-2 border-tertiary text-color-text py-3 px-8 rounded-lg text-lg font-medium hover:bg-tertiary hover:text-white transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  )
}