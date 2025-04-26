//// filepath: /c:/Next.Js Project/intervyou/app/api/referral/claim/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil record referral untuk user beserta penggunaan referral-nya.
    const refRecord = await prisma.referralCode.findUnique({
      where: { userId: session.user.id },
      include: { referralUsages: true },
    });

    if (!refRecord) {
      return NextResponse.json({ error: "No referral record found" }, { status: 400 });
    }

    const totalReferrals = refRecord.referralUsages.length;
    // Current milestone yang telah diklaim
    const currentMilestone = refRecord.claimedMilestone || 0;
    let reward = 0;
    let newMilestone = currentMilestone;

    // Periksa apakah milestone berikutnya telah tercapai dan belum diklaim.
    if (currentMilestone === 0 && totalReferrals >= 5) {
      reward = 50;
      newMilestone = 1;
    } else if (currentMilestone === 1 && totalReferrals >= 10) {
      reward = 100;
      newMilestone = 2;
    } else if (currentMilestone === 2 && totalReferrals >= 20) {
      reward = 200;
      newMilestone = 3;
    } else if (currentMilestone === 3 && totalReferrals >= 50) {
      reward = 500;
      newMilestone = 4;
    }

    if (reward === 0) {
      return NextResponse.json({ error: "No new milestone reward available" }, { status: 400 });
    }

    // Lakukan transaksi: tambahkan token ke tokenBalance dan perbarui claimedMilestone.
    await prisma.$transaction(async (tx) => {
      await tx.tokenBalance.update({
        where: { userId: session.user.id },
        data: { token: { increment: reward } },
      });

      await tx.referralCode.update({
        where: { id: refRecord.id },
        data: { claimedMilestone: newMilestone },
      });
    });

    return NextResponse.json({ success: true, claimedTokens: reward });
  } catch (error) {
    console.error("Error claiming milestone reward:", error);
    return NextResponse.json({ error: "Failed to claim milestone reward" }, { status: 500 });
  }
}