"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const user_id = (await getServerSession(authOptions))?.user?.id;
		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Get all writing sessions for the user
		const essayAnalysis = await prisma.essayAnalysis.findMany({
			where: {
				userId: user_id,
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				originalFilename: true,
				score: true,
				createdAt: true,
			},
		});

		// Return the list of writing sessions
		return new NextResponse(JSON.stringify(essayAnalysis), {
			status: 200,
		});
	} catch (error) {
		console.error("Error fetching writing sessions:", error);
		return new NextResponse(
			JSON.stringify({
				error: "Failed to fetch writing sessions",
				details:
					error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500 }
		);
	}
}
