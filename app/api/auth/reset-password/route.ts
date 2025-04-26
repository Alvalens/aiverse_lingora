import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Email, token, and new password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 400 }
      );
    }

    if (user.emailVerified === null) {
      return NextResponse.json(
        { error: "Your account is not verified. Please verify your email before resetting your password." },
        { status: 400 }
      );
    }

    const tokenRecord = await prisma.forgotVerificationToken.findUnique({
      where: { userId_purpose: { userId: user.id, purpose: "FORGOT" } },
    });
    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Reset token not found. Please request a new password reset link." },
        { status: 400 }
      );
    }

    if (tokenRecord.token !== token) {
      return NextResponse.json(
        { error: "Invalid token. Please request a new password reset link." },
        { status: 400 }
      );
    }
    if (new Date() > tokenRecord.expiry) {
      return NextResponse.json(
        { error: "Token has expired. Please request a new password reset link." },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.forgotVerificationToken.delete({
      where: { userId_purpose: { userId: user.id, purpose: "FORGOT" } },
    });

    return NextResponse.json({ message: "Your password has been reset successfully." });
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request. Please try again later." },
      { status: 500 }
    );
  }
}