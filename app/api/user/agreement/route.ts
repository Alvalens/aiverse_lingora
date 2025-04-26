import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { agreement } = data;
    
    // Validate agreement
    if (agreement !== true) {
      return NextResponse.json(
        { error: "Agreement is required" },
        { status: 400 }
      );
    }

    // Update user agreement - use boolean true to match Prisma schema
    const updatedUser = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        agreement: true, // This will be stored as 1 in MySQL/PostgreSQL
      },
      select: {
        agreement: true,
      }
    });
    
    console.log(`Updated agreement for ${session.user.email} to ${updatedUser.agreement}`);

    // Add refreshSession flag to trigger session refresh on the client side
    return NextResponse.json(
      { 
        success: true, 
        agreement: updatedUser.agreement,
        message: "Agreement updated successfully",
        refreshSession: true // Tell the client to refresh the session
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating agreement:", error);
    return NextResponse.json(
      { error: "Failed to update agreement" },
      { status: 500 }
    );
  }
}