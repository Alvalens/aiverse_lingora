"use client"
import Image from "next/image"

interface IntroductionStepProps {
  userName?: string
  onContinue: () => void
}

export default function IntroductionStep({ userName, onContinue }: IntroductionStepProps) {
  return (
    <div className="max-w-2xl mx-auto text-center bg-[#052038] text-white p-8 rounded-lg">
      <h1 className="text-3xl font-bold mb-6">{userName ? `Welcome, ${userName}!` : "Welcome to IntervYou!"}</h1>
      <div className="mb-8">
        <Image
          src="/images/onboarding/logo-interview-text.png"
          alt="IntervYou Logo"
          width={250}
          height={250}
          className="mx-auto"
        />
      </div>
      <p className="text-lg mb-6">
        Your AI-powered interview preparation partner. Let&apos;s set up your account to get started.
      </p>
      <p className="mb-8 text-base">
        IntervYou helps you practice interviews, analyze your CV, and improve your chances of landing your dream job.
      </p>
      <button
        onClick={onContinue}
        className="bg-primary text-white border-2 border-secondary py-3 px-8 rounded-lg text-lg font-medium hover:bg-secondary hover:text-black transition-colors"
      >
        Let&apos;s Get Started
      </button>
    </div>
  )
}
