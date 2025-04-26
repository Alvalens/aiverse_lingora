//// filepath: /c:/Next.Js Project/intervyou/app/api/referral/apply/direct/route.ts
"use server";

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

    // Ambil record ReferralCode untuk user (yang menyimpan tokenFromReferral)
    const refRecord = await prisma.referralCode.findUnique({
      where: { userId: session.user.id },
    });

    if (!refRecord) {
      return NextResponse.json({ error: "No referral record found" }, { status: 400 });
    }

    // Pastikan tokenFromReferral minimal 50
    if (refRecord.tokenFromReferral < 50) {
      return NextResponse.json({ error: "Not enough pending tokens to claim" }, { status: 400 });
    }

    // Lakukan transaksi: pindahkan pending token ke token balance dan set pending token ke 0
    await prisma.$transaction(async (tx) => {
      await tx.tokenBalance.update({
        where: { userId: session.user.id },
        data: { token: { increment: 50 } },
      });

      await tx.referralCode.update({
        where: { id: refRecord.id },
        data: { tokenFromReferral: 0 },
      });
    });

    return NextResponse.json({ success: true, claimedTokens: 50 });
  } catch (error) {
    console.error("Error claiming direct reward:", error);
    return NextResponse.json({ error: "Failed to claim direct reward" }, { status: 500 });
  }
}