import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await the params to resolve the Promise

    const sessionUser = await getServerSession(authOptions);
    const userId = sessionUser?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the debate session
    const debateSession = await prisma.debateSession.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!debateSession || debateSession.userId !== userId) {
      return NextResponse.json(
        { error: "Debate session not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if session is already ended
    if (debateSession.endedAt) {
      return NextResponse.json(
        { error: "Debate session is already ended" },
        { status: 400 }
      );
    }

    // Mark the session as ended
    await prisma.debateSession.update({
      where: { id: id },
      data: { 
        endedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Debate session ended successfully"
    });

  } catch (error) {
    console.error("Error ending debate session:", error);
    return NextResponse.json(
      { error: "Failed to end debate session" },
      { status: 500 }
    );
  }
}