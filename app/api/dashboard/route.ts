import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all Daily Talk session scores
    const dailytalkSessions = await prisma.dailyTalkSession.findMany({
      where: { userId },
      select: { score: true },
    });
    // Fetch all Storytelling session scores
    const storytellingSessions = await prisma.storyTellingSession.findMany({
      where: { userId },
      select: { score: true },
    });
    // Fetch all Debate session scores
    const debateSessions = await prisma.debateSession.findMany({
      where: { userId },
      select: { score: true },
    });

    // Compute average for each session type
    const dailyTalkScores = dailytalkSessions.map((s) => s.score ?? 0);
    const averageDailyTalkScore =
      dailyTalkScores.length > 0
        ? dailyTalkScores.reduce((sum, v) => sum + v, 0) /
          dailyTalkScores.length
        : 0;

    const storytellingScores = storytellingSessions.map((s) => s.score ?? 0);
    const averageStorytellingScore =
      storytellingScores.length > 0
        ? storytellingScores.reduce((sum, v) => sum + v, 0) /
          storytellingScores.length
        : 0;

    const debateScores = debateSessions.map((s) => s.score ?? 0);
    const averageDebateScore =
      debateScores.length > 0
        ? debateScores.reduce((sum, v) => sum + v, 0) / debateScores.length
        : 0;

    // Fetch referral code if any
    const referralCode = await prisma.referralCode.findUnique({
      where: { userId },
      select: { code: true, link: true },
    });

    return NextResponse.json({
      averageDailyTalkScore,
      averageStorytellingScore,
      averageDebateScore,
      referralCode: referralCode ?? null,
    });
  } catch (error) {
    console.error("🔥 Error in dashboard API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}