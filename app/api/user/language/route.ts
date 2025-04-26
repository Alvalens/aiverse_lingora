import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - User ID required" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { language } = data;
    
    // Validate language
    if (!language || !["EN", "ID"].includes(language)) {
      return NextResponse.json(
        { error: "Invalid language selection" },
        { status: 400 }
      );
    }

    // Update user language using ID instead of email
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        language: language[language as keyof typeof language],  // Type assertion since we validated the value
      },
    });

    return NextResponse.json(
      { success: true, language: updatedUser.language },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating language:", error);
    return NextResponse.json(
      { error: "Failed to update language" },
      { status: 500 }
    );
  }
}