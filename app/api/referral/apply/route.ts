//// filepath: /c:/Next.Js Project/intervyou/app/api/referral/apply/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referralCode } = await req.json();
    if (!referralCode?.trim()) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
    }

    // Cari record ReferralCode berdasarkan kode
    const refCodeRecord = await prisma.referralCode.findUnique({
      where: { code: referralCode },
    });

    if (!refCodeRecord) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
    }

    // Jangan izinkan user menggunakan kode miliknya sendiri
    if (refCodeRecord.userId === session.user.id) {
      return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 });
    }

    // Cek apakah user sudah pernah menggunakan kode referral
    const existingReferral = await prisma.referralUser.findFirst({
      where: { referredUserId: session.user.id },
    });
    if (existingReferral) {
      return NextResponse.json({ error: "You have already used a referral code" }, { status: 400 });
    }

    // Transaksi: buat record ReferralUser dan update pending token (tokenFromReferral)
    await prisma.$transaction(async (tx) => {
      // Buat record penggunaan referral
      await tx.referralUser.create({
        data: {
          referralCodeId: refCodeRecord.id,
          referredUserId: session.user.id,
          referredUserName: session.user.name!,
        },
      });

      // Untuk pengguna yang menggunakan referral (referred) dapatkan pending token +50.
      // Jika sudah ada record ReferralCode untuk user ini, update tokenFromReferral.
      // Jika belum, buat record baru dengan tokenFromReferral = 50.
      const referredRecord = await tx.referralCode.findUnique({
        where: { userId: session.user.id },
      });
      if (referredRecord) {
        await tx.referralCode.update({
          where: { id: referredRecord.id },
          data: { tokenFromReferral: { increment: 50 } },
        });
      } else {
        const newCode = generateReferralCode();
        const baseUrl = process.env.LINK_BASE_URL;
        const referralLink = `${baseUrl}?ref=${newCode}&name=${encodeURIComponent(session.user.name!)}`;

        await tx.referralCode.create({
          data: {
            userId: session.user.id,
            code: newCode,
            link: referralLink,
            tokenFromReferral: 50,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Referral code applied successfully. Tokens have been added to your pending balance.",
    });
  } catch (error) {
    console.error("Error applying referral code:", error);
    return NextResponse.json({ error: "Failed to apply referral code" }, { status: 500 });
  }
}