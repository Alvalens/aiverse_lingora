"use client";

import type React from "react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import ErrorMessage from "@/components/error-message";

interface ReferralStepProps {
  referralInput: string;
  setReferralInput: (value: string) => void;
  onSkip: () => void;
  onContinue: () => void;
  error: string;
  setError: (value: string) => void;
}

export default function ReferralStep({
  referralInput,
  setReferralInput,
  onSkip,
  onContinue,
  error,
  setError,
}: ReferralStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!referralInput.trim()) {
      toast.error("Please enter a referral code or skip this step");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/referral/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: referralInput.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      toast.success("Referral code applied successfully!");
      localStorage.removeItem("referralCode");
      setReferralInput("");
      onContinue();
    } catch (error) {
      console.error("Error applying referral code:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to apply referral code"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Referral Code (Optional)
      </h2>
      <p className="mb-6 text-center text-base">
        If you have a referral code, please enter it below. You may also skip
        this step.
      </p>

      <ErrorMessage message={error} />

      <form onSubmit={handleApplyReferral} className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            className="w-full p-2 border rounded font-mono bg-primary text-white text-base border-gray-300 focus:border-secondary focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-secondary hover:text-black transition-colors"
          >
            {isSubmitting ? "Applying..." : "Apply"}
          </button>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={onSkip}
            className="absolute left-0 text-white hover:text-secondary underline"
            disabled={isSubmitting}
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
