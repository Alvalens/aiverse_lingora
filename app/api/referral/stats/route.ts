//// filepath: /c:/Next.Js Project/intervyou/app/api/referral/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let refCodeRecord = await prisma.referralCode.findUnique({
      where: { userId: session.user.id },
      include: { referralUsages: true },
    });

    if (!refCodeRecord) {
      const newCode = generateReferralCode();
      const baseUrl = process.env.LINK_BASE_URL;
      const referralLink = `${baseUrl}?ref=${newCode}&name=${encodeURIComponent(
        session.user.name
      )}`;

      refCodeRecord = await prisma.referralCode.create({
        data: {
          userId: session.user.id,
          code: newCode,
          link: referralLink,
          // Set default claimedMilestone jika perlu
          claimedMilestone: 0,
        },
        include: { referralUsages: true },
      });
    }

    const totalReferrals = refCodeRecord.referralUsages.length;

    return NextResponse.json({
      referralCode: refCodeRecord.code,
      link: refCodeRecord.link,
      tokenFromReferral: refCodeRecord.tokenFromReferral ?? 0,
      totalReferrals,
      claimedMilestone: refCodeRecord.claimedMilestone ?? 0,
      referralUsers: refCodeRecord.referralUsages.map((usage) => ({
        referredUserName: usage.referredUserName,
      })),
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral information" },
      { status: 500 }
    );
  }
}