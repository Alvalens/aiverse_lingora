import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { agreement } = body;
    
    // Validate input
    if (typeof agreement !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid agreement value" },
        { status: 400 }
      );
    }
    
    // Update user agreement status
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { agreement },
      select: { id: true, name: true, agreement: true }
    });
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user agreement status:", error);
    
    return NextResponse.json(
      { error: "Failed to update agreement status" },
      { status: 500 }
    );
  }
}
