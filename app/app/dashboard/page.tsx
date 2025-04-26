"use client";

import { useSession } from "next-auth/react";
import { useStaticTokenBalance } from "@/hooks/useTokenBalance";
import { TotalTokens } from "./components/total-tokens";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ReferralCard } from "./components/referral-card";
import { ReferralMilestones } from "./components/referral-milestones";
import { TotalScore } from "./components/total-score";
import { ProgressSection } from "./components/progress-section";
import { TotalPractices } from "./components/total-practices";
import { OfferCard } from "./components/offer-card";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data, isLoading, error } = useStaticTokenBalance();

  const userName = session?.user?.name || "Guest User";
  const tokens = data?.token ?? 0;

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        Failed to load data.
      </div>
    );
  }

  return (
    <div className="h-full space-y-8 text-white pt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome,{" "}
            <span
              className="bg-clip-text text-secondary"
            >
              {userName}!
            </span>
          </h1>
          <p className="text-white/70">
            See how we help your team solve today biggest challenges.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <TotalTokens tokens={tokens} />
        <ReferralCard />
        <ReferralMilestones />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <TotalScore />
          <ProgressSection />
        </div>

        <div className="flex flex-col gap-8">
          <TotalPractices />
          <OfferCard />
        </div>
      </div>
    </div>
  );
}