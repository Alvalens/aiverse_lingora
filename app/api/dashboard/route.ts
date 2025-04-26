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
    const interviewSessions = await prisma.interviewSession.findMany({
      where: { userId },
      select: { overallMark: true },
    });

    const cvAnalyses = await prisma.cVAnalysis.findMany({
      where: { userId },
      select: { matchingScore: true },
    });

    const referralCode = await prisma.referralCode.findUnique({
      where: { userId },
      select: { code: true, link: true },
    });

    const overallMarks = interviewSessions.map(item => item.overallMark ?? 0);
    const matchingScores = cvAnalyses.map(item => item.matchingScore ?? 0);

    const averageOverallMark =
      overallMarks.length > 0
        ? overallMarks.reduce((sum, val) => sum + val, 0) / overallMarks.length
        : 0;

    const averageMatchingScore =
      matchingScores.length > 0
        ? matchingScores.reduce((sum, val) => sum + val, 0) / matchingScores.length
        : 0;

    const combinedAverageScore =
      (averageOverallMark + averageMatchingScore) / 2;

    return NextResponse.json({
      averageOverallMark,
      averageMatchingScore,
      combinedAverageScore,
      referralCode: referralCode ?? null,
    });
  } catch (error) {
    console.error("🔥 Error in dashboard API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}