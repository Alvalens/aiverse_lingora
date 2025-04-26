import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		const user_id = session?.user?.id;

		if (!user_id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { id: sessionId } = await params;

		const storyTellingSession = await prisma.storyTellingSession.findUnique(
			{
				where: {
					id: sessionId,
					userId: user_id,
				},
			}
		);

		if (!storyTellingSession) {
			return NextResponse.json(
				{ error: "Session not found" },
				{ status: 404 }
			);
		} 
        
		return NextResponse.json({
			id: storyTellingSession.id,
			image: storyTellingSession.image,
			userAnswer: storyTellingSession.userAnswer,
			suggestions: storyTellingSession.suggestions,
			score: storyTellingSession.score,
			createdAt: storyTellingSession.createdAt,
		});
	} catch (error) {
		console.error("Error fetching story telling session:", error);
		return NextResponse.json(
			{ error: "Failed to fetch story telling session" },
			{ status: 500 }
		);
	}
}
