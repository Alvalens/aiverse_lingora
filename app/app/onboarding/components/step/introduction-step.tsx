"use client"
import Image from "next/image"

interface IntroductionStepProps {
  userName?: string
  onContinue: () => void
}

export default function IntroductionStep({ userName, onContinue }: IntroductionStepProps) {
  return (
    <div className="max-w-2xl mx-auto mt-16 mb-10 flex flex-col items-center">
      <div className="mb-6">
        <Image
          src="/landing-page/logo.svg"
          alt="Lingora Logo"
          width={120}
          height={120}
          className="mx-auto drop-shadow-lg"
          priority
        />
      </div>
      <h1 className="text-3xl font-extrabold mb-2 text-color-text tracking-tight text-center">
        {userName ? `Welcome, ${userName}!` : "Welcome to Lingora!"}
      </h1>
      <p className="text-lg mb-8 text-color-text text-center">
        Unlock your English mastery with three powerful labs:
      </p>
      <div className="w-full grid gap-6 mb-10">
        <div className="flex items-start gap-3 bg-tertiary/80 rounded-lg p-5 shadow">
          <span className="text-2xl">🗣️</span>
          <div>
            <span className="font-semibold text-primary">Conversation Lab</span>
            <div className="text-sm text-primary">
              Simulated small talk, story retell, and debates for everyday confidence.
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-tertiary/80 rounded-lg p-5 shadow">
          <span className="text-2xl">📝</span>
          <div>
            <span className="font-semibold text-primary">Writing Lab</span>
            <div className="text-sm text-primary">
              Instant, CEFR-aligned feedback on emails, essays, and summaries.
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-tertiary/80 rounded-lg p-5 shadow">
          <span className="text-2xl">📚</span>
          <div>
            <span className="font-semibold text-primary">Vocab Lab</span>
            <div className="text-sm text-primary">
              Contextual flashcards, adaptive quizzes, and idiom building to boost your word power.
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onContinue}
        className="bg-primary text-color-text border-2 border-tertiary py-3 px-10 rounded-lg text-lg font-semibold hover:bg-tertiary hover:border-tertiary hover:text-primary transition-all shadow-lg"
      >
        Let&apos;s Get Started
      </button>
    </div>
  )
}