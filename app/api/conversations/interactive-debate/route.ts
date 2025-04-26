import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Tokens } from "@/lib/constants";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Parse request body
		const body = await req.json();
		const { theme, description } = body;

		// Validate input
		if (!theme) {
			return NextResponse.json(
				{ error: "Theme is required" },
				{ status: 400 }
			);
		}

		// Check user token balance
		const tokenBalance = await prisma.tokenBalance.findUnique({
			where: { userId: session.user.id },
		});

		if (!tokenBalance || tokenBalance.token < Tokens.convDebate) {
			return NextResponse.json(
				{ error: "Insufficient tokens" },
				{ status: 403 }
			);
		}

		// Create a new daily talk session
		const debateSession = await prisma.debateSession.create({
			data: {
				userId: session.user.id,
				theme,
				description: description || "",
			},
		});

		// Deduct tokens
		await prisma.tokenBalance.update({
			where: { userId: session.user.id },
			data: {
				token: {
					decrement: Tokens.convDebate,
				},
			},
		});

		// Return the session ID
		return NextResponse.json(
			{
				id: debateSession.id,
				theme: debateSession.theme,
				message: "Debate session created successfully",
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating debate session:", error);
		return NextResponse.json(
			{ error: "Failed to create debate session" },
			{ status: 500 }
		);
	}
}
