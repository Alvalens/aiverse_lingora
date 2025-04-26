"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TotalTokens } from "./components/total-tokens";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ReferralCard } from "./components/referral-card";
import { ReferralMilestones } from "./components/referral-milestones";
import { ProgressSection } from "./components/progress-section";
import { TotalPractices } from "./components/total-practices";
import { OfferCard } from "./components/offer-card";

interface DashboardData {
  averageDailyTalkScore: number | null;
  averageStorytellingScore: number | null;
  averageDebateScore: number | null;
  referralCode: {
    code: string;
    link: string;
  } | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useTokenBalance();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as Partial<DashboardData>;

        // Validasi data
        if (
          (typeof json.averageDailyTalkScore !== "number" && json.averageDailyTalkScore !== null) ||
          (typeof json.averageStorytellingScore !== "number" && json.averageStorytellingScore !== null) ||
          (typeof json.averageDebateScore !== "number" && json.averageDebateScore !== null)
        ) {
          throw new Error("Invalid data from dashboard API");
        }

        setDashboardData({
          averageDailyTalkScore: json.averageDailyTalkScore ?? null,
          averageStorytellingScore: json.averageStorytellingScore ?? null,
          averageDebateScore: json.averageDebateScore ?? null,
          referralCode: json.referralCode ?? null,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [status]);

  if (status === "loading" || loading || tokenLoading) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        ⚠ Anda belum login.
      </div>
    );
  }

  if (error || tokenError) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        ⚠ Terjadi kesalahan: {error || tokenError?.message}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        ⏳ Memuat data dashboard...
      </div>
    );
  }

  const userName = session.user?.name || "Guest User";
  const tokens =
    tokenError || typeof tokenData?.token !== "number" || tokenData.token == null
      ? 0
      : tokenData.token;

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