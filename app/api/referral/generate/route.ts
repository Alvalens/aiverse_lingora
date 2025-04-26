//// filepath: /c:/Next.Js Project/intervyou/app/api/referral/generate/route.ts
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
    
    // Cari referralCode untuk user pada model ReferralCode
    let refCodeRecord = await prisma.referralCode.findUnique({
      where: { userId: session.user.id },
    });
    
    // Jika belum ada, generate dan buat recordnya
    if (!refCodeRecord) {
      let newCode = "";
      let isUnique = false;
      while (!isUnique) {
        newCode = generateReferralCode();
        const existing = await prisma.referralCode.findUnique({ where: { code: newCode } });
        if (!existing) {
          isUnique = true;
        }
      }
      
      const baseUrl = process.env.LINK_BASE_URL;
      const referralLink = `${baseUrl}?ref=${newCode}&name=${encodeURIComponent(session.user.name!)}`;
      
      refCodeRecord = await prisma.referralCode.create({
        data: {
          userId: session.user.id,
          code: newCode,
          link: referralLink,
        },
      });
    }
    
    return NextResponse.json({ referralCode: refCodeRecord.code });
  } catch (error) {
    console.error("Error generating referral code:", error);
    return NextResponse.json(
      { error: "Failed to generate referral code" },
      { status: 500 }
    );
  }
}