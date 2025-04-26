//// filepath: /c:/Next.Js Project/intervyou/app/app/referral/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { Copy, Loader2 } from "lucide-react";
import { useTokenBalance } from "@/hooks/useTokenBalance";

interface ReferralUser {
  referredUserName: string;
}

interface ReferralStats {
  referralCode: string;
  link: string;
  tokenFromReferral: number;
  totalReferrals: number;
  referralUsers: ReferralUser[];
  // Milestone terakhir yang sudah diklaim (0 jika belum ada)
  claimedMilestone?: number;
}

export default function ReferralPage() {
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referralInput, setReferralInput] = useState("");
  const { data: tokenBalance } = useTokenBalance();

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch("/api/referral/stats");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setStats(data);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      toast.error("Failed to load referral information");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      toast.success("Referral code copied to clipboard!");
    }
  };

  const handleCopyLink = () => {
    if (stats?.link) {
      navigator.clipboard.writeText(stats.link);
      toast.success("Referral link copied to clipboard!");
    }
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralInput.trim()) {
      toast.error("Please enter a referral code");
      return;
    }
    try {
      setApplying(true);
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
      setReferralInput("");
      fetchReferralStats();
    } catch (error) {
      console.error("Error applying referral code:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to apply referral code"
      );
    } finally {
      setApplying(false);
    }
  };

  // Fungsi untuk klaim direct reward (memindahkan 50 token dari tokenFromReferral ke token balance)
  const handleClaimDirectReward = async () => {
    try {
      setClaiming(true);
      const response = await fetch("/api/referral/apply/direct", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      toast.success(`You claimed ${data.claimedTokens} tokens!`);
      fetchReferralStats();
    } catch (error) {
      console.error("Error claiming direct reward:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to claim reward"
      );
    } finally {
      setClaiming(false);
    }
  };

  // Fungsi untuk klaim milestone reward (task reward)
  const handleClaimMilestoneReward = async () => {
    try {
      setClaiming(true);
      const response = await fetch("/api/referral/claim", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      toast.success(`You claimed ${data.claimedTokens} tokens!`);
      // Tunggu 2000ms agar backend benar-benar update, kemudian refresh data
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchReferralStats();
    } catch (error) {
      console.error("Error claiming milestone reward:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to claim tokens"
      );
    } finally {
      setClaiming(false);
    }
  };

  // Perhitungan milestone berdasarkan claimedMilestone (anggap 0 jika belum ada)
  const currentMilestone = stats?.claimedMilestone ?? 0;
  let requiredReferrals: number | null = null;
  let milestoneReward: number | null = null;

  if (currentMilestone === 0) {
    requiredReferrals = 5;
    milestoneReward = 50;
  } else if (currentMilestone === 1) {
    requiredReferrals = 10;
    milestoneReward = 100;
  } else if (currentMilestone === 2) {
    requiredReferrals = 20;
    milestoneReward = 200;
  } else if (currentMilestone === 3) {
    requiredReferrals = 50;
    milestoneReward = 500;
  }

  // Jika milestone 4 atau lebih, artinya semua milestone telah tercapai.
  const hasAchievedAllMilestones = currentMilestone >= 4;
  // Tombol milestone reward aktif jika total referrals sudah memenuhi ambang untuk milestone berikutnya.
  const isMilestoneEligible =
    stats &&
    requiredReferrals !== null &&
    stats.totalReferrals >= requiredReferrals;
  // Tombol direct reward aktif jika tokenFromReferral minimal 50.
  const canClaimDirect = stats && stats.tokenFromReferral >= 50;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container bg-primary mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Referral Program</h1>
      <div className="grid gap-6">
        {/* Card Total Token */}
        <Card className="bg-tertiary text-primary">
          <CardHeader>
            <CardTitle>Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {tokenBalance?.token || 0} Token
              {(tokenBalance?.token || 0) !== 1 && "s"}
            </div>
          </CardContent>
        </Card>

        {/* Card untuk menampilkan progress misi referral */}
        <Card className="bg-secondary">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Referral Milestone Progress</CardTitle>
            {/* Tombol direct reward hanya untuk memindahkan pending token */}
            <Button
              onClick={handleClaimDirectReward}
              disabled={!canClaimDirect || claiming}
            >
              {claiming
                ? "Claiming..."
                : canClaimDirect
                ? "Get Reward (+50 tokens)"
                : "Get Reward"}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total Referrals: {stats?.totalReferrals || 0}
            </p>
            {hasAchievedAllMilestones ? (
              <p className="text-sm mt-1 text-gray-600">
                You have achieved all milestones!
              </p>
            ) : (
              <p className="text-sm mt-1 text-gray-600">
                Next milestone: {requiredReferrals} referrals to earn {milestoneReward} tokens.
              </p>
            )}
            <div className="mt-4">
              <Button
                onClick={handleClaimMilestoneReward}
                disabled={!isMilestoneEligible || claiming || hasAchievedAllMilestones}
              >
                {claiming ? "Claiming..." : "Claim Milestone Reward"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Menampilkan Kode Referral */}
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={stats?.referralCode || ""} readOnly className="font-mono" />
              <Button variant="outline" size="icon" onClick={handleCopyCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share this code to earn rewards.
            </p>
          </CardContent>
        </Card>

        {/* Card Menampilkan Link Referral */}
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={stats?.link || ""} readOnly className="font-mono" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share this link so others can register automatically.
            </p>
          </CardContent>
        </Card>

        {/* Card Menampilkan Daftar Referral Users */}
        {stats?.referralUsers && stats.referralUsers.length > 0 && (
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle>Referral Users</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside">
                {stats.referralUsers.map((user, index) => (
                  <li key={index}>{user.referredUserName}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Form Untuk Menggunakan Kode Referral */}
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>Apply Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApplyCode} className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  placeholder="Enter referral code"
                  className="font-mono"
                />
                <Button type="submit" disabled={applying}>
                  {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}