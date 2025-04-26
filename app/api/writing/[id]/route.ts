"use server";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		const id = params.id;

		if (!id) {
			return new NextResponse(
				JSON.stringify({ error: "Session ID is required" }),
				{ status: 400 }
			);
		}

		// Get writing session
		const essayAnalysis = await prisma.essayAnalysis.findUnique({
			where: {
				id,
				userId: session.user.id, // Ensure the user can only access their own sessions
			},
		});

		if (!essayAnalysis) {
			return new NextResponse(
				JSON.stringify({ error: "Writing session not found" }),
				{ status: 404 }
			);
		}

		// Return the writing session
		return new NextResponse(JSON.stringify(essayAnalysis), {
			status: 200,
		});
	} catch (error) {
		console.error("Error fetching writing session:", error);
		return new NextResponse(
			JSON.stringify({
				error: "Failed to fetch writing session",
				details:
					error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500 }
		);
	}
}
