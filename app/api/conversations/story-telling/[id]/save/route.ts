import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
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

		const sessionId = params.id;
		const { description } = await request.json();

		if (!description) {
			return NextResponse.json(
				{ error: "Description is required" },
				{ status: 400 }
			);
		}

		// Verify the session exists and belongs to the user
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

		// Update the session with the user's description
		const updatedSession = await prisma.storyTellingSession.update({
			where: {
				id: sessionId,
			},
			data: {
				userAnswer: description,
				updatedAt: new Date(),
			},
		});

		return NextResponse.json({
			success: true,
			id: updatedSession.id,
		});
	} catch (error) {
		console.error("Error saving story telling description:", error);
		return NextResponse.json(
			{ error: "Failed to save description" },
			{ status: 500 }
		);
	}
}
