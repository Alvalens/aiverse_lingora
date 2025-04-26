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
    // Average score for Daily Talk sessions
    const dailyTalkAgg = await prisma.dailyTalkSession.aggregate({
      where: { userId },
      _avg: { score: true },
    });
    const averageDailyTalkScore = dailyTalkAgg._avg?.score ?? null;

    // Average score for Storytelling sessions
    const storytellingAgg = await prisma.storyTellingSession.aggregate({
      where: { userId },
      _avg: { score: true },
    });
    const averageStorytellingScore = storytellingAgg._avg?.score ?? null;

    // Average score for Debate sessions
    const debateAgg = await prisma.debateSession.aggregate({
      where: { userId },
      _avg: { score: true },
    });
    const averageDebateScore = debateAgg._avg?.score ?? null;

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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}