"use client";

import { useEffect, useState } from "react";
import { TotalTokens } from "./components/total-tokens";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ReferralCard } from "./components/referral-card";
import { ReferralMilestones } from "./components/referral-milestones";
import { ProgressSection } from "./components/progress-section";
import { TotalPractices } from "./components/total-practices";
import { OfferCard } from "./components/offer-card";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        const data = await res.json();
        setDashboardData(data);
      } catch {
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!dashboardData) {
    return <div className="text-red-500">Failed to load dashboard data.</div>;
  }

  // Contoh penggunaan data dari API
  // const { averageDailyTalkScore, averageStorytellingScore, averageDebateScore, referralCode } = dashboardData;

  const userName = "Guest User";
  const tokens = 125; // Ganti dengan data dari API jika tersedia

  return (
    <div className="h-full space-y-8 text-white pt-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-color-text">
            Welcome,{" "}
            <span className="bg-clip-text text-tertiary">
              {userName}!
            </span>
          </h1>
          <p className="text-color-text">
            See how we help your team solve today biggest challenges.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <TotalTokens tokens={tokens} />
        <ReferralCard referralCode={dashboardData.referralCode} />
        <ReferralMilestones />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <ProgressSection
            averageDailyTalkScore={dashboardData.averageDailyTalkScore}
            averageStorytellingScore={dashboardData.averageStorytellingScore}
            averageDebateScore={dashboardData.averageDebateScore}
          />
        </div>

        <div className="flex flex-col gap-8">
          <TotalPractices />
          <OfferCard />
        </div>
      </div>
    </div>
  );
}