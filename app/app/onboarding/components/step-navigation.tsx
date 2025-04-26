"use client"

interface StepNavigationProps {
  onBack?: () => void
  onContinue?: () => void
  continueText?: string
  backText?: string
  isSubmitting?: boolean
  isContinueDisabled?: boolean
  hideBack?: boolean
}

export default function StepNavigation({
  onBack,
  onContinue,
  continueText = "Continue",
  backText = "Back",
  isSubmitting = false,
  isContinueDisabled = false,
  hideBack = false,
}: StepNavigationProps) {
  return (
    <div className="flex justify-between">
      {!hideBack ? (
        <button
          onClick={onBack}
          className="py-2 px-4 bg-primary border border-tertiary  text-color-text rounded-lg transition-colors hover:bg-tertiary hover:text-white"
          disabled={isSubmitting}
          type="button"
        >
          {backText}
        </button>
      ) : (
        <div></div>
      )}
      <button
        onClick={onContinue}
        className={`py-2 px-6 bg-primary border border-tertiary  text-color-text rounded-lg transition-colors hover:bg-tertiary hover:text-white ${
          isContinueDisabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isSubmitting || isContinueDisabled}
        type="button"
      >
        {isSubmitting ? "Processing..." : continueText}
      </button>
    </div>
  )
}
