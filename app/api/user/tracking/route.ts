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
    const { sources } = data;
    
    // Validate sources
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return NextResponse.json(
        { error: "Invalid sources selection" },
        { status: 400 }
      );
    }

    // Use transaction to ensure both operations complete atomically
    const userTrackingEntries = await prisma.$transaction(async (tx) => {
      // 1. Delete existing tracking entries
      await tx.userTracking.deleteMany({
        where: {
          userId: session.user.id,
        },
      });
      
      // 2. Create new tracking entries
      const newEntries = [];
      for (const source of sources) {
        const entry = await tx.userTracking.create({
          data: {
            userId: session.user.id,
            source,
          },
        });
        newEntries.push(entry);
      }
            return newEntries;
    });

    return NextResponse.json(
      { 
        success: true, 
        tracking: userTrackingEntries,
        message: `Successfully updated ${userTrackingEntries.length} tracking sources` 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tracking sources:", error);
    return NextResponse.json(
      { error: "Failed to update tracking sources" },
      { status: 500 }
    );
  }
}