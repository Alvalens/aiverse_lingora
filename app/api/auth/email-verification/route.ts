import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "User ID and email are required." },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email tidak valid." },
        { status: 400 }
      );
    }

    const rateLimitMs = 5 * 60 * 1000; // 5 menit
    const now = new Date();
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(now.getTime() + 15 * 60 * 1000);

    // Cek apakah sudah ada record token untuk purpose VERIFICATION
    const existingToken = await prisma.forgotVerificationToken.findUnique({
      where: {
        userId_purpose: { userId, purpose: "VERIFICATION" },
      },
    });

    if (existingToken) {
      const diff = now.getTime() - new Date(existingToken.createdAt).getTime();
      if (diff < rateLimitMs) {
        return NextResponse.json(
          { error: "Please wait at least 5 minutes before requesting a new verification link." },
          { status: 429 }
        );
      }
      await prisma.forgotVerificationToken.update({
        where: { userId_purpose: { userId, purpose: "VERIFICATION" } },
        data: {
          createdAt: now,
          token,
          expiry,
        },
      });
    } else {
      await prisma.forgotVerificationToken.create({
        data: {
          userId,
          token,
          expiry,
          createdAt: now,
          purpose: "VERIFICATION",
        },
      });
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("Error in rate limiter:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}