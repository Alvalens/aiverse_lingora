import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		const user_id = session?.user?.id;

		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const storyTellingSessions = await prisma.storyTellingSession.findMany({
			where: {
				userId: user_id,
				userAnswer: {
					not: null,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				image: true,
				userAnswer: true,
				suggestions: true,
				score: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return NextResponse.json({
			success: true,
			sessions: storyTellingSessions,
		});
	} catch (error) {
		console.error("Error fetching story telling history:", error);
		return NextResponse.json(
			{ error: "Failed to fetch history" },
			{ status: 500 }
		);
	}
}
